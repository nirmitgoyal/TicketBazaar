import { Router, type Request } from "express";
import multer from "multer";
import { desc, eq } from "drizzle-orm";
import { z } from "zod";
import { sellMyTicketsSubmissions } from "@shared/schema";

const router = Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 100 * 1024 * 1024,
    files: 8,
  },
  fileFilter: (_req, file, callback) => {
    const isPdf =
      file.mimetype === "application/pdf" ||
      file.originalname.toLowerCase().endsWith(".pdf");

    if (!isPdf) {
      callback(new Error("Only PDF ticket files are supported."));
      return;
    }

    callback(null, true);
  },
});

const marketplaceDefaults = [
  { name: "TicketMaster", status: "queued" },
  { name: "StubHub", status: "queued" },
  { name: "Vivid Seats", status: "queued" },
  { name: "SeatGeek", status: "queued" },
  { name: "TickPick", status: "queued" },
];

const fileMetadataSchema = z.object({
  name: z.string().min(1).max(240),
  size: z.number().int().min(1).max(100 * 1024 * 1024),
  type: z.string().default("application/pdf"),
});

const uploadSubmissionSchema = z.object({
  sellerName: z.string().trim().min(1).max(120).default("Demo Seller"),
  sellerEmail: z.string().trim().email().max(240),
  eventName: z.string().trim().min(1).max(180),
  venue: z.string().trim().max(180).optional().or(z.literal("")),
  eventDate: z.coerce.date().optional(),
  quantity: z.coerce.number().int().min(1).max(50).default(1),
  targetPriceCents: z.coerce.number().int().min(100).max(2_000_000),
  minimumPriceCents: z.coerce.number().int().min(100).max(2_000_000),
  currency: z.string().trim().length(3).default("USD"),
  files: z.array(fileMetadataSchema).min(1),
}).refine(
  (value) => value.minimumPriceCents <= value.targetPriceCents,
  {
    path: ["minimumPriceCents"],
    message: "Minimum price must be less than or equal to target price.",
  },
);

const priceSchema = z.object({
  targetPriceCents: z.coerce.number().int().min(100).max(2_000_000),
  minimumPriceCents: z.coerce.number().int().min(100).max(2_000_000),
}).refine(
  (value) => value.minimumPriceCents <= value.targetPriceCents,
  {
    path: ["minimumPriceCents"],
    message: "Minimum price must be less than or equal to target price.",
  },
);

const bankSchema = z.object({
  bankAccountHolder: z.string().trim().min(2).max(120),
  bankLast4: z.string().regex(/^\d{4}$/),
  routingLast4: z.string().regex(/^\d{4}$/),
});

const saleSchema = z.object({
  marketplace: z.string().trim().min(1).max(80).default("StubHub"),
});

type StoredSubmission = typeof sellMyTicketsSubmissions.$inferSelect;

const memorySubmissions = new Map<string, StoredSubmission>();

function authenticatedSeller(req: Request) {
  if (!req.user) {
    return null;
  }

  return {
    sellerName: req.user.fullName,
    sellerEmail: req.user.email,
  };
}

async function getDatabase() {
  if (!process.env.DATABASE_URL) {
    return null;
  }

  try {
    const { db } = await import("../db");
    return db;
  } catch (error) {
    console.warn("[SellMyTickets] Falling back to in-memory store:", error);
    return null;
  }
}

function createDashboardCode() {
  const random = Math.random().toString(36).slice(2, 8).toUpperCase();
  return `SMT-${random}`;
}

function uploadedFileMetadata(files: Express.Multer.File[]) {
  return files.map((file) => ({
    name: file.originalname,
    size: file.size,
    type: file.mimetype || "application/pdf",
  }));
}

function parseJsonFiles(value: unknown) {
  if (Array.isArray(value)) {
    return value;
  }

  if (typeof value !== "string" || value.length === 0) {
    return [];
  }

  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function serializeSubmission(submission: StoredSubmission) {
  return {
    ...submission,
    files: Array.isArray(submission.files) ? submission.files : [],
    marketplaces: Array.isArray(submission.marketplaces)
      ? submission.marketplaces
      : marketplaceDefaults,
    eventDate: submission.eventDate?.toISOString() ?? null,
    soldAt: submission.soldAt?.toISOString() ?? null,
    payoutEta: submission.payoutEta?.toISOString() ?? null,
    createdAt: submission.createdAt.toISOString(),
    updatedAt: submission.updatedAt.toISOString(),
  };
}

async function findSubmission(dashboardCode: string) {
  const db = await getDatabase();

  if (!db) {
    return {
      db,
      submission: memorySubmissions.get(dashboardCode) ?? null,
    };
  }

  const [submission] = await db
    .select()
    .from(sellMyTicketsSubmissions)
    .where(eq(sellMyTicketsSubmissions.dashboardCode, dashboardCode))
    .limit(1);

  return { db, submission: submission ?? null };
}

router.get("/summary", async (_req, res) => {
  const db = await getDatabase();

  if (!db) {
    const submissions = Array.from(memorySubmissions.values());
    res.json({
      persistence: "memory",
      totalSubmissions: submissions.length,
      activeListings: submissions.filter((item) => item.status !== "sold").length,
      soldListings: submissions.filter((item) => item.status === "sold").length,
      marketplaces: marketplaceDefaults.map((item) => item.name),
    });
    return;
  }

  const submissions = await db
    .select()
    .from(sellMyTicketsSubmissions)
    .orderBy(desc(sellMyTicketsSubmissions.createdAt))
    .limit(50);

  res.json({
    persistence: "postgres",
    totalSubmissions: submissions.length,
    activeListings: submissions.filter((item) => item.status !== "sold").length,
    soldListings: submissions.filter((item) => item.status === "sold").length,
    marketplaces: marketplaceDefaults.map((item) => item.name),
  });
});

router.get("/submissions", async (_req, res) => {
  const db = await getDatabase();

  if (!db) {
    res.json({
      persistence: "memory",
      submissions: Array.from(memorySubmissions.values())
        .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
        .slice(0, 12)
        .map(serializeSubmission),
    });
    return;
  }

  const submissions = await db
    .select()
    .from(sellMyTicketsSubmissions)
    .orderBy(desc(sellMyTicketsSubmissions.createdAt))
    .limit(12);

  res.json({
    persistence: "postgres",
    submissions: submissions.map(serializeSubmission),
  });
});

router.get("/submissions/:dashboardCode", async (req, res) => {
  const { submission, db } = await findSubmission(req.params.dashboardCode);

  if (!submission) {
    res.status(404).json({ error: "Submission not found." });
    return;
  }

  res.json({
    persistence: db ? "postgres" : "memory",
    submission: serializeSubmission(submission),
  });
});

router.post("/uploads", upload.array("tickets", 8), async (req, res) => {
  const files = Array.isArray(req.files)
    ? uploadedFileMetadata(req.files as Express.Multer.File[])
    : parseJsonFiles(req.body.files);
  const seller = authenticatedSeller(req);

  const parsed = uploadSubmissionSchema.parse({
    ...req.body,
    sellerName: seller?.sellerName ?? req.body.sellerName,
    sellerEmail: seller?.sellerEmail ?? req.body.sellerEmail,
    files,
  });

  const now = new Date();
  const dashboardCode = createDashboardCode();
  const record = {
    dashboardCode,
    sellerName: parsed.sellerName,
    sellerEmail: parsed.sellerEmail,
    eventName: parsed.eventName,
    venue: parsed.venue || null,
    eventDate: parsed.eventDate ?? null,
    quantity: parsed.quantity,
    targetPriceCents: parsed.targetPriceCents,
    minimumPriceCents: parsed.minimumPriceCents,
    currency: parsed.currency.toUpperCase(),
    files: parsed.files,
    marketplaces: marketplaceDefaults,
    status: "verifying",
    verificationStatus: "in_review",
    payoutStatus: "not_started",
    bankAccountHolder: null,
    bankLast4: null,
    routingLast4: null,
    soldMarketplace: null,
    soldAt: null,
    payoutEta: null,
    createdAt: now,
    updatedAt: now,
  };

  const db = await getDatabase();

  if (!db) {
    const stored = {
      id: memorySubmissions.size + 1,
      ...record,
    } satisfies StoredSubmission;
    memorySubmissions.set(dashboardCode, stored);
    res.status(201).json({
      persistence: "memory",
      submission: serializeSubmission(stored),
    });
    return;
  }

  const [created] = await db
    .insert(sellMyTicketsSubmissions)
    .values(record)
    .returning();

  res.status(201).json({
    persistence: "postgres",
    submission: serializeSubmission(created),
  });
});

router.patch("/submissions/:dashboardCode/price", async (req, res) => {
  const parsed = priceSchema.parse(req.body);
  const { db, submission } = await findSubmission(req.params.dashboardCode);
  const seller = authenticatedSeller(req);

  if (!submission) {
    res.status(404).json({ error: "Submission not found." });
    return;
  }

  const patch = {
    ...(seller ?? {}),
    targetPriceCents: parsed.targetPriceCents,
    minimumPriceCents: parsed.minimumPriceCents,
    status: "listed",
    verificationStatus: "verified",
    marketplaces: marketplaceDefaults.map((marketplace, index) => ({
      ...marketplace,
      status: index < 4 ? "listed" : "queued",
    })),
    updatedAt: new Date(),
  };

  if (!db) {
    const updated = { ...submission, ...patch };
    memorySubmissions.set(submission.dashboardCode, updated);
    res.json({ persistence: "memory", submission: serializeSubmission(updated) });
    return;
  }

  const [updated] = await db
    .update(sellMyTicketsSubmissions)
    .set(patch)
    .where(eq(sellMyTicketsSubmissions.dashboardCode, submission.dashboardCode))
    .returning();

  res.json({ persistence: "postgres", submission: serializeSubmission(updated) });
});

router.post("/submissions/:dashboardCode/bank", async (req, res) => {
  const parsed = bankSchema.parse(req.body);
  const { db, submission } = await findSubmission(req.params.dashboardCode);

  if (!submission) {
    res.status(404).json({ error: "Submission not found." });
    return;
  }

  const patch = {
    bankAccountHolder: parsed.bankAccountHolder,
    bankLast4: parsed.bankLast4,
    routingLast4: parsed.routingLast4,
    payoutStatus: submission.status === "sold" ? "scheduled" : "ready",
    updatedAt: new Date(),
  };

  if (!db) {
    const updated = { ...submission, ...patch };
    memorySubmissions.set(submission.dashboardCode, updated);
    res.json({ persistence: "memory", submission: serializeSubmission(updated) });
    return;
  }

  const [updated] = await db
    .update(sellMyTicketsSubmissions)
    .set(patch)
    .where(eq(sellMyTicketsSubmissions.dashboardCode, submission.dashboardCode))
    .returning();

  res.json({ persistence: "postgres", submission: serializeSubmission(updated) });
});

router.post("/submissions/:dashboardCode/simulate-sale", async (req, res) => {
  const parsed = saleSchema.parse(req.body);
  const { db, submission } = await findSubmission(req.params.dashboardCode);

  if (!submission) {
    res.status(404).json({ error: "Submission not found." });
    return;
  }

  const soldAt = new Date();
  const payoutEta = new Date(soldAt);
  payoutEta.setDate(payoutEta.getDate() + 2);

  const patch = {
    status: "sold",
    verificationStatus: "verified",
    payoutStatus: submission.bankLast4 ? "scheduled" : "bank_required",
    soldMarketplace: parsed.marketplace,
    soldAt,
    payoutEta,
    marketplaces: marketplaceDefaults.map((marketplace) => ({
      ...marketplace,
      status: marketplace.name === parsed.marketplace ? "sold" : "delisted",
    })),
    updatedAt: new Date(),
  };

  if (!db) {
    const updated = { ...submission, ...patch };
    memorySubmissions.set(submission.dashboardCode, updated);
    res.json({ persistence: "memory", submission: serializeSubmission(updated) });
    return;
  }

  const [updated] = await db
    .update(sellMyTicketsSubmissions)
    .set(patch)
    .where(eq(sellMyTicketsSubmissions.dashboardCode, submission.dashboardCode))
    .returning();

  res.json({ persistence: "postgres", submission: serializeSubmission(updated) });
});

export default router;
