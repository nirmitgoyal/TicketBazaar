import { FormEvent, useEffect, useMemo, useState } from "react";
import { Helmet } from "react-helmet";
import {
  AlertTriangle,
  CheckCircle2,
  CircleDollarSign,
  FileText,
  Home,
  ListChecks,
  Loader2,
  LogIn,
  Menu,
  ShieldCheck,
  Ticket,
  Upload,
  User,
  Wallet,
} from "lucide-react";
import sellMyTicketsLogoUrl from "@/assets/sellmytickets-logo.svg";
import { useAuth } from "@/hooks/use-auth";
import { apiFetch } from "@/lib/queryClient";
import { signInWithNeonGoogle } from "@/lib/neon-auth";
import "./sell-my-tickets.css";

const MAX_FILE_SIZE = 100 * 1024 * 1024;

type ViewName = "home" | "price" | "login" | "bank" | "status" | "dashboard" | "profile";

type TicketFile = {
  name: string;
  size: number;
  type: string;
};

type Marketplace = {
  name: string;
  status: string;
};

type Submission = {
  dashboardCode: string;
  sellerName: string;
  sellerEmail: string;
  eventName: string;
  venue: string | null;
  eventDate: string | null;
  quantity: number;
  targetPriceCents: number;
  minimumPriceCents: number;
  currency: string;
  files: TicketFile[];
  marketplaces: Marketplace[];
  status: string;
  verificationStatus: string;
  payoutStatus: string;
  bankAccountHolder: string | null;
  bankLast4: string | null;
  routingLast4: string | null;
  soldMarketplace: string | null;
  soldAt: string | null;
  payoutEta: string | null;
  createdAt: string;
  updatedAt: string;
};

type ApiSubmissionResponse = {
  persistence: "postgres" | "memory";
  submission: Submission;
};

type ApiListResponse = {
  persistence: "postgres" | "memory";
  submissions: Submission[];
};

const viewNames = new Set<ViewName>(["home", "price", "login", "bank", "status", "dashboard", "profile"]);

const marketplaces = ["TicketMaster", "StubHub", "Vivid Seats", "SeatGeek", "TickPick"];

function isViewName(value: string | null): value is ViewName {
  return Boolean(value && viewNames.has(value as ViewName));
}

function centsFromDollars(value: string) {
  const numeric = Number.parseFloat(value);
  if (!Number.isFinite(numeric)) {
    return 0;
  }
  return Math.round(numeric * 100);
}

function money(cents: number, currency = "USD") {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(cents / 100);
}

function friendlySize(bytes: number) {
  if (bytes > 1024 * 1024) {
    return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
  }
  return `${Math.max(1, Math.round(bytes / 1024))} KB`;
}

async function parseError(response: Response) {
  const text = await response.text();
  try {
    const parsed = JSON.parse(text) as { error?: string; message?: string };
    return parsed.error || parsed.message || response.statusText;
  } catch {
    return text || response.statusText;
  }
}

async function uploadSubmission(formData: FormData) {
  const response = await apiFetch("/api/sellmytickets/uploads", {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    throw new Error(await parseError(response));
  }

  return (await response.json()) as ApiSubmissionResponse;
}

async function patchSubmission(url: string, payload: unknown) {
  const response = await apiFetch(url, {
    method: url.includes("/bank") || url.includes("/simulate-sale") ? "POST" : "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(await parseError(response));
  }

  return (await response.json()) as ApiSubmissionResponse;
}

export default function SellMyTicketsPage() {
  const { user, isAuthenticated, isLoading: isAuthLoading } = useAuth();
  const [view, setView] = useState<ViewName>("home");
  const [files, setFiles] = useState<File[]>([]);
  const [submission, setSubmission] = useState<Submission | null>(null);
  const [dashboardRows, setDashboardRows] = useState<Submission[]>([]);
  const [eventName, setEventName] = useState("Coldplay at MetLife Stadium");
  const [venue, setVenue] = useState("MetLife Stadium");
  const [eventDate, setEventDate] = useState("2026-07-18");
  const [quantity, setQuantity] = useState("2");
  const [targetPrice, setTargetPrice] = useState("180");
  const [minimumPrice, setMinimumPrice] = useState("145");
  const [bankName, setBankName] = useState("Demo Seller");
  const [bankLast4, setBankLast4] = useState("4242");
  const [routingLast4, setRoutingLast4] = useState("1100");
  const [uploadPercent, setUploadPercent] = useState(0);
  const [isBusy, setIsBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [persistence, setPersistence] = useState<"postgres" | "memory">("memory");

  const selectedFileList = useMemo(
    () => files.map((file) => ({
      name: file.name,
      size: file.size,
      type: file.type || "application/pdf",
    })),
    [files],
  );

  useEffect(() => {
    const savedSubmission = window.localStorage.getItem("sellmytickets:lastSubmission");
    const savedView = window.localStorage.getItem("sellmytickets:view");
    const savedPricing = window.localStorage.getItem("sellmytickets:pricing");

    if (isViewName(savedView)) {
      setView(savedView);
    }

    if (savedSubmission) {
      setSubmission(JSON.parse(savedSubmission) as Submission);
    }

    if (savedPricing) {
      const pricing = JSON.parse(savedPricing) as { targetPrice?: string; minimumPrice?: string };
      if (pricing.targetPrice) {
        setTargetPrice(pricing.targetPrice);
      }
      if (pricing.minimumPrice) {
        setMinimumPrice(pricing.minimumPrice);
      }
    }
  }, []);

  useEffect(() => {
    if (!submission) {
      return;
    }
    window.localStorage.setItem("sellmytickets:lastSubmission", JSON.stringify(submission));
  }, [submission]);

  useEffect(() => {
    window.localStorage.setItem("sellmytickets:view", view);
  }, [view]);

  useEffect(() => {
    window.localStorage.setItem("sellmytickets:pricing", JSON.stringify({
      targetPrice,
      minimumPrice,
    }));
  }, [minimumPrice, targetPrice]);

  async function startGoogleSignIn(returnView: ViewName) {
    window.localStorage.setItem("sellmytickets:view", returnView);
    const returnTo = window.location.pathname === "/" ? "/" : window.location.pathname;
    const callbackURL = `${window.location.origin}${returnTo}`;

    try {
      await signInWithNeonGoogle(callbackURL);
    } catch (signInError) {
      setError(signInError instanceof Error ? signInError.message : "Google sign-in failed.");
      setView("login");
    }
  }

  async function loadDashboardRows() {
    const response = await apiFetch("/api/sellmytickets/submissions");

    if (!response.ok) {
      throw new Error(await parseError(response));
    }

    const data = (await response.json()) as ApiListResponse;
    setPersistence(data.persistence);
    setDashboardRows(data.submissions);
  }

  async function openDashboard() {
    setError(null);
    setView("dashboard");
    try {
      await loadDashboardRows();
    } catch (dashboardError) {
      setError(dashboardError instanceof Error ? dashboardError.message : "Unable to load dashboard.");
    }
  }

  function handleFiles(nextFiles: FileList | null) {
    setError(null);

    if (!nextFiles) {
      return;
    }

    const pdfFiles = Array.from(nextFiles);
    const invalidFile = pdfFiles.find((file) => {
      const isPdf = file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");
      return !isPdf || file.size > MAX_FILE_SIZE;
    });

    if (invalidFile) {
      setFiles([]);
      setError(
        invalidFile.size > MAX_FILE_SIZE
          ? `${invalidFile.name} is over the 100MB limit.`
          : `${invalidFile.name} is not a PDF ticket file.`,
      );
      return;
    }

    setFiles(pdfFiles);
  }

  async function handleUpload(event: FormEvent) {
    event.preventDefault();
    setError(null);

    if (files.length === 0) {
      setError("Upload at least one PDF ticket file.");
      return;
    }

    const targetPriceCents = centsFromDollars(targetPrice);
    const minimumPriceCents = centsFromDollars(minimumPrice);

    if (minimumPriceCents > targetPriceCents) {
      setError("Minimum price must be less than or equal to target price.");
      return;
    }

    const formData = new FormData();
    files.forEach((file) => formData.append("tickets", file));
    formData.append("sellerName", user?.fullName || "Pending seller");
    formData.append("sellerEmail", user?.email || "pending@sellmytickets.local");
    formData.append("eventName", eventName);
    formData.append("venue", venue);
    formData.append("eventDate", eventDate);
    formData.append("quantity", quantity);
    formData.append("targetPriceCents", String(targetPriceCents));
    formData.append("minimumPriceCents", String(minimumPriceCents));
    formData.append("currency", "USD");

    setIsBusy(true);
    setUploadPercent(8);
    const interval = window.setInterval(() => {
      setUploadPercent((current) => Math.min(92, current + 17));
    }, 180);

    try {
      const data = await uploadSubmission(formData);
      setPersistence(data.persistence);
      setSubmission(data.submission);
      setUploadPercent(100);
      window.setTimeout(() => setView("price"), 260);
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : "Upload failed.");
      setUploadPercent(0);
    } finally {
      window.clearInterval(interval);
      setIsBusy(false);
    }
  }

  async function savePrice(nextView: ViewName) {
    if (!submission) {
      setError("Upload tickets before setting a price.");
      setView("home");
      return;
    }

    const targetPriceCents = centsFromDollars(targetPrice);
    const minimumPriceCents = centsFromDollars(minimumPrice);

    const data = await patchSubmission(
      `/api/sellmytickets/submissions/${submission.dashboardCode}/price`,
      { targetPriceCents, minimumPriceCents },
    );
    setPersistence(data.persistence);
    setSubmission(data.submission);
    setView(nextView);
  }

  async function handlePriceSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);

    if (!isAuthenticated) {
      setView("login");
      return;
    }

    setIsBusy(true);
    try {
      await savePrice("bank");
    } catch (priceError) {
      setError(priceError instanceof Error ? priceError.message : "Unable to save price.");
    } finally {
      setIsBusy(false);
    }
  }

  function handleGoogleLogin() {
    startGoogleSignIn("price");
  }

  async function handleBankSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);

    if (!submission) {
      setError("Upload tickets before adding bank details.");
      setView("home");
      return;
    }

    setIsBusy(true);
    try {
      const data = await patchSubmission(
        `/api/sellmytickets/submissions/${submission.dashboardCode}/bank`,
        {
          bankAccountHolder: bankName,
          bankLast4,
          routingLast4,
        },
      );
      setPersistence(data.persistence);
      setSubmission(data.submission);
      setView("status");
    } catch (bankError) {
      setError(bankError instanceof Error ? bankError.message : "Unable to save bank details.");
    } finally {
      setIsBusy(false);
    }
  }

  async function simulateSale() {
    if (!submission) {
      return;
    }

    setError(null);
    setIsBusy(true);
    try {
      const data = await patchSubmission(
        `/api/sellmytickets/submissions/${submission.dashboardCode}/simulate-sale`,
        { marketplace: "StubHub" },
      );
      setPersistence(data.persistence);
      setSubmission(data.submission);
    } catch (saleError) {
      setError(saleError instanceof Error ? saleError.message : "Unable to simulate sale.");
    } finally {
      setIsBusy(false);
    }
  }

  const activeFiles = submission?.files ?? selectedFileList;

  return (
    <>
      <Helmet>
        <title>SellMyTickets</title>
        <meta name="title" content="SellMyTickets" />
      </Helmet>

      <div className="sellmytickets-page">
      <div className="smt-frame">
        <header className="smt-phone-bar">
          <button className="smt-brand" type="button" onClick={() => setView("home")}>
            <img alt="" src={sellMyTicketsLogoUrl} />
            <span>SellMyTickets</span>
          </button>
          <div className="flex items-center gap-2">
            <button
              className="smt-google-button"
              type="button"
              onClick={() => (isAuthenticated ? setView("profile") : startGoogleSignIn(view))}
            >
              <LogIn size={20} />
              {isAuthLoading ? "Checking login" : user?.fullName || "Login with Google"}
            </button>
            <button className="smt-icon-button" type="button" aria-label="Menu">
              <Menu />
            </button>
          </div>
        </header>

        {error && (
          <div className="smt-error mb-4" role="alert" aria-live="assertive">
            <div className="flex items-start gap-2">
              <AlertTriangle className="mt-1 shrink-0" />
              <span>{error}</span>
            </div>
          </div>
        )}

        {view === "home" && (
          <>
            <section className="smt-hero">
              <div>
                <h1 className="smt-title">SellMyTickets</h1>
                <p className="smt-subtitle">
                  The easiest and fastest way to sell unused tickets to concerts, sports, and live events.
                </p>
              </div>
              <div>
                <h2 className="smt-section-title">Where we list</h2>
                <div className="smt-marketplaces" aria-label="Marketplace distribution">
                  {marketplaces.map((marketplace) => (
                    <span className="smt-marketplace-chip" key={marketplace}>
                      {marketplace}
                    </span>
                  ))}
                </div>
              </div>
            </section>

            <section className="smt-workspace">
              <form className="smt-panel smt-upload-panel" onSubmit={handleUpload}>
                <h2 className="smt-section-title">Upload Your Ticket(s)</h2>
                <div className="smt-field-grid">
                  <div className="smt-field">
                    <label htmlFor="event-name">Event</label>
                    <input
                      id="event-name"
                      onChange={(event) => setEventName(event.target.value)}
                      required
                      value={eventName}
                    />
                  </div>
                  <div className="smt-field">
                    <label htmlFor="venue">Venue</label>
                    <input id="venue" onChange={(event) => setVenue(event.target.value)} value={venue} />
                  </div>
                  <div className="smt-field">
                    <label htmlFor="event-date">Date</label>
                    <input
                      id="event-date"
                      onChange={(event) => setEventDate(event.target.value)}
                      type="date"
                      value={eventDate}
                    />
                  </div>
                  <div className="smt-field">
                    <label htmlFor="quantity">Tickets</label>
                    <input
                      id="quantity"
                      min="1"
                      max="50"
                      onChange={(event) => setQuantity(event.target.value)}
                      type="number"
                      value={quantity}
                    />
                  </div>
                </div>

                <label className="smt-dropzone" htmlFor="ticket-pdfs">
                  <FileText size={72} strokeWidth={2.4} />
                  <strong>{files.length ? `${files.length} PDF file selected` : "PDF"}</strong>
                  <span className="smt-primary">
                    <Upload size={20} />
                    Upload PDF(s)
                  </span>
                  <input
                    accept="application/pdf,.pdf"
                    className="sr-only"
                    id="ticket-pdfs"
                    multiple
                    onChange={(event) => handleFiles(event.target.files)}
                    type="file"
                  />
                </label>

                {activeFiles.length > 0 && (
                  <ul className="smt-file-list" aria-label="Selected files">
                    {activeFiles.map((file) => (
                      <li key={`${file.name}-${file.size}`}>
                        <span className="truncate">{file.name}</span>
                        <strong>{friendlySize(file.size)}</strong>
                      </li>
                    ))}
                  </ul>
                )}

                {uploadPercent > 0 && (
                  <div aria-live="polite" className="smt-progress-track">
                    <div className="smt-progress-fill" style={{ width: `${uploadPercent}%` }} />
                    <div className="smt-progress-number">{uploadPercent}</div>
                  </div>
                )}

                <button className="smt-primary" disabled={isBusy} type="submit">
                  {isBusy ? <Loader2 className="animate-spin" /> : <Ticket />}
                  {isBusy ? "Uploading" : "Start Listing"}
                </button>
                <p className="smt-note">* File size limit is 100MB.</p>
              </form>

              <aside className="smt-panel">
                <div className="smt-stat-grid">
                  <div className="smt-stat">
                    <strong>5</strong>
                    <span>marketplaces</span>
                  </div>
                  <div className="smt-stat">
                    <strong>2d</strong>
                    <span>target payout</span>
                  </div>
                  <div className="smt-stat">
                    <strong>1x</strong>
                    <span>upload once</span>
                  </div>
                  <div className="smt-stat">
                    <strong>{persistence}</strong>
                    <span>storage</span>
                  </div>
                </div>
                <ul className="smt-timeline mt-4">
                  <li><Upload /> Upload PDFs once</li>
                  <li><ShieldCheck /> Verification starts immediately</li>
                  <li><ListChecks /> Listings distribute everywhere</li>
                  <li><CircleDollarSign /> Sale and payout sync back here</li>
                </ul>
              </aside>
            </section>
          </>
        )}

        {view === "price" && (
          <section className="smt-workspace">
            <form className="smt-panel" onSubmit={handlePriceSubmit}>
              <h1 className="smt-section-title">Price page</h1>
              <p className="smt-note mt-3">{submission?.eventName}</p>
              <div className="smt-field-grid mt-5">
                <div className="smt-field">
                  <label htmlFor="target-price">Target price</label>
                  <input
                    id="target-price"
                    min="1"
                    onChange={(event) => setTargetPrice(event.target.value)}
                    type="number"
                    value={targetPrice}
                  />
                </div>
                <div className="smt-field">
                  <label htmlFor="minimum-price">Minimum</label>
                  <input
                    id="minimum-price"
                    min="1"
                    onChange={(event) => setMinimumPrice(event.target.value)}
                    type="number"
                    value={minimumPrice}
                  />
                </div>
              </div>
              <button className="smt-primary mt-5" disabled={isBusy} type="submit">
                {isBusy ? <Loader2 className="animate-spin" /> : <CircleDollarSign />}
                Continue
              </button>
            </form>
            <aside className="smt-panel">
              <h2 className="text-2xl font-black">Net estimate</h2>
              <div className="smt-stat-grid mt-4">
                <div className="smt-stat">
                  <strong>{money(centsFromDollars(targetPrice))}</strong>
                  <span>list target</span>
                </div>
                <div className="smt-stat">
                  <strong>{money(Math.round(centsFromDollars(targetPrice) * 0.92))}</strong>
                  <span>after fee</span>
                </div>
              </div>
            </aside>
          </section>
        )}

        {view === "login" && (
          <section className="smt-workspace">
            <div className="smt-panel">
              <h1 className="smt-section-title">Mandatory Login</h1>
              <p className="smt-note mt-3">Login is required before marketplace distribution and payout setup.</p>
              <button className="smt-google-button mt-6 w-full justify-center" onClick={handleGoogleLogin} type="button">
                <LogIn />
                Login with Google
              </button>
            </div>
            <aside className="smt-panel">
              <div className="smt-success">
                <ShieldCheck />
                Seller identity links every listing and payout to one dashboard.
              </div>
            </aside>
          </section>
        )}

        {view === "bank" && (
          <section className="smt-workspace">
            <form className="smt-panel" onSubmit={handleBankSubmit}>
              <h1 className="smt-section-title">Bank Details</h1>
              <div className="smt-field-grid mt-5">
                <div className="smt-field">
                  <label htmlFor="bank-name">Account holder</label>
                  <input id="bank-name" onChange={(event) => setBankName(event.target.value)} value={bankName} />
                </div>
                <div className="smt-field">
                  <label htmlFor="bank-last4">Account last 4</label>
                  <input
                    id="bank-last4"
                    maxLength={4}
                    onChange={(event) => setBankLast4(event.target.value.replace(/\D/g, "").slice(0, 4))}
                    value={bankLast4}
                  />
                </div>
                <div className="smt-field">
                  <label htmlFor="routing-last4">Routing last 4</label>
                  <input
                    id="routing-last4"
                    maxLength={4}
                    onChange={(event) => setRoutingLast4(event.target.value.replace(/\D/g, "").slice(0, 4))}
                    value={routingLast4}
                  />
                </div>
              </div>
              <button className="smt-primary mt-5" disabled={isBusy} type="submit">
                {isBusy ? <Loader2 className="animate-spin" /> : <Wallet />}
                Save payout details
              </button>
            </form>
            <aside className="smt-panel">
              <h2 className="text-2xl font-black">Listing</h2>
              <p className="smt-note mt-2">{submission?.dashboardCode}</p>
              <p className="mt-4 text-4xl font-black">{money(submission?.targetPriceCents ?? 0)}</p>
            </aside>
          </section>
        )}

        {view === "status" && (
          <section className="smt-workspace">
            <div className="smt-panel">
              <h1 className="smt-section-title">Ticket Status</h1>
              <p className="smt-note mt-3">{submission?.dashboardCode}</p>
              <ul className="smt-timeline mt-5">
                <li><CheckCircle2 /> Uploaded {activeFiles.length} PDF ticket file(s)</li>
                <li><CheckCircle2 /> Verification: {submission?.verificationStatus}</li>
                <li><CheckCircle2 /> Marketplace sync: {submission?.status}</li>
                <li><Wallet /> Payout: {submission?.payoutStatus}</li>
              </ul>
              <button className="smt-primary mt-5" disabled={isBusy || submission?.status === "sold"} onClick={simulateSale} type="button">
                {isBusy ? <Loader2 className="animate-spin" /> : <CircleDollarSign />}
                {submission?.status === "sold" ? "Sold on StubHub" : "Simulate sale"}
              </button>
            </div>
            <aside className="smt-panel">
              <h2 className="text-2xl font-black">Where it is listed</h2>
              <div className="mt-4 flex flex-wrap gap-2">
                {(submission?.marketplaces ?? []).map((marketplace) => (
                  <span className="smt-pill" key={marketplace.name}>
                    {marketplace.name}: {marketplace.status}
                  </span>
                ))}
              </div>
              {submission?.soldAt && (
                <div className="smt-success mt-5">
                  Transfer coordinated. Payout ETA:{" "}
                  {submission.payoutEta ? new Date(submission.payoutEta).toLocaleDateString() : "pending"}
                </div>
              )}
            </aside>
          </section>
        )}

        {view === "dashboard" && (
          <section className="smt-panel mt-6">
            <h1 className="smt-section-title">Dashboard</h1>
            <div className="mt-5">
              {(dashboardRows.length ? dashboardRows : submission ? [submission] : []).map((row) => (
                <div className="smt-dashboard-row" key={row.dashboardCode}>
                  <div>
                    <strong>{row.eventName}</strong>
                    <p className="smt-note">
                      {row.dashboardCode} · {money(row.targetPriceCents, row.currency)} · {row.status}
                    </p>
                  </div>
                  <span className="smt-pill">{row.payoutStatus}</span>
                </div>
              ))}
              {!dashboardRows.length && !submission && (
                <p className="smt-note">No ticket submissions yet.</p>
              )}
            </div>
          </section>
        )}

        {view === "profile" && (
          <section className="smt-workspace">
            <div className="smt-panel">
              <h1 className="smt-section-title">Profile</h1>
              <div className="mt-5 flex items-center gap-4">
                <div className="grid h-20 w-20 place-items-center rounded-full border-4 border-[var(--smt-ink)] bg-white">
                  <User size={44} />
                </div>
                <div>
                  <h2 className="text-2xl font-black">{user?.fullName ?? "Guest seller"}</h2>
                  <p className="smt-note">{user?.email ?? "Sign in with Google to manage payout details"}</p>
                </div>
              </div>
            </div>
            <aside className="smt-panel">
              <h2 className="text-2xl font-black">Payout account</h2>
              <p className="smt-note mt-2">
                {submission?.bankLast4 ? `Bank ending ${submission.bankLast4}` : "No bank details saved"}
              </p>
            </aside>
          </section>
        )}

        <p className="smt-legal">
          By continuing, you agree to our <a href="/privacy-policy">Privacy Policy</a> and{" "}
          <a href="/terms-of-service">Terms of Service</a>.
        </p>
      </div>

      <nav className="smt-bottom-nav" aria-label="SellMyTickets">
        <button className="smt-tab" data-active={view === "home"} onClick={() => setView("home")} type="button" aria-label="Home">
          <Home />
        </button>
        <button className="smt-tab" data-active={view === "status"} onClick={() => setView("status")} type="button" aria-label="Status">
          <ListChecks />
        </button>
        <button className="smt-tab" data-active={view === "dashboard"} onClick={openDashboard} type="button" aria-label="Dashboard">
          <Wallet />
        </button>
        <button className="smt-tab" data-active={view === "profile"} onClick={() => setView("profile")} type="button" aria-label="Profile">
          <User />
        </button>
      </nav>
      </div>
    </>
  );
}
