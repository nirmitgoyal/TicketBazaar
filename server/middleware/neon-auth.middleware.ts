import type { NextFunction, Request, Response } from "express";
import { createRemoteJWKSet, jwtVerify } from "jose";
import { sql } from "drizzle-orm";
import { db } from "../db";
import { storage } from "../storage";
import { logger } from "../utils/logger";

type NeonUserRow = {
  id: string;
  name: string | null;
  email: string;
  image: string | null;
  emailVerified: boolean;
};

let jwks: ReturnType<typeof createRemoteJWKSet> | null = null;
let jwksForAuthUrl: string | null = null;

function normalizeAuthUrl(value: string) {
  return value.replace(/\/$/, "");
}

function deriveNeonAuthUrlFromDatabaseUrl(databaseUrl: string | undefined) {
  if (!databaseUrl) {
    return null;
  }

  try {
    const parsed = new URL(databaseUrl);

    if (!parsed.hostname.endsWith(".neon.tech")) {
      return null;
    }

    const [hostEndpoint, ...hostRest] = parsed.hostname.split(".");
    const endpointId = hostEndpoint.replace(/-pooler$/, "");
    const databaseName = parsed.pathname.replace(/^\/+/, "").split("/")[0];

    if (!endpointId || !databaseName || hostRest.length === 0) {
      return null;
    }

    return `https://${endpointId}.neonauth.${hostRest.join(".")}/${databaseName}/auth`;
  } catch {
    return null;
  }
}

export function getNeonAuthUrl() {
  const configured = process.env.NEON_AUTH_URL || process.env.VITE_NEON_AUTH_URL;
  return normalizeAuthUrl(configured || deriveNeonAuthUrlFromDatabaseUrl(process.env.DATABASE_URL) || "");
}

export function isNeonAuthEnabled() {
  return Boolean(getNeonAuthUrl() && process.env.DATABASE_URL);
}

export function getNeonAuthPublicConfig() {
  const authUrl = getNeonAuthUrl();
  const enabled = isNeonAuthEnabled();

  return {
    enabled,
    authUrl: authUrl || null,
    providers: enabled ? ["google"] : [],
  };
}

function getJwks(authUrl: string) {
  if (!jwks || jwksForAuthUrl !== authUrl) {
    jwks = createRemoteJWKSet(new URL(`${authUrl}/.well-known/jwks.json`));
    jwksForAuthUrl = authUrl;
  }

  return jwks;
}

function bearerToken(req: Request) {
  const authorization = req.headers.authorization;

  if (!authorization) {
    return null;
  }

  const [scheme, token] = authorization.split(" ");
  if (scheme.toLowerCase() !== "bearer" || !token) {
    return null;
  }

  return token;
}

async function readNeonAuthUser(neonUserId: string) {
  const rows = await db.execute(sql`
    select
      id::text as id,
      name,
      email,
      image,
      "emailVerified" as "emailVerified"
    from neon_auth."user"
    where id = ${neonUserId}::uuid
    limit 1
  `);

  return (rows as unknown as NeonUserRow[])[0] ?? null;
}

async function syncAppUser(neonUser: NeonUserRow) {
  const neonGoogleId = `neon:${neonUser.id}`;
  let appUser = await storage.getUserByGoogleId(neonGoogleId);

  if (!appUser) {
    const existingByEmail = await storage.getUserByEmail(neonUser.email);

    if (existingByEmail) {
      appUser =
        existingByEmail.googleId === neonGoogleId
          ? existingByEmail
          : (await storage.updateUserGoogleId(existingByEmail.id, neonGoogleId)) ?? existingByEmail;
    } else {
      appUser = await storage.createUser({
        googleId: neonGoogleId,
        email: neonUser.email,
        fullName: neonUser.name || neonUser.email.split("@")[0] || "Seller",
        country: "US",
        profilePicture: neonUser.image || undefined,
        emailVerified: neonUser.emailVerified,
      });
    }
  }

  if (neonUser.image && appUser.profilePicture !== neonUser.image) {
    appUser = (await storage.updateUserProfilePicture(appUser.id, neonUser.image)) ?? appUser;
  }

  return appUser;
}

export async function authenticateNeonBearerToken(token: string) {
  const authUrl = getNeonAuthUrl();

  if (!authUrl || !process.env.DATABASE_URL) {
    throw new Error("Neon Auth is not configured.");
  }

  const { payload } = await jwtVerify(token, getJwks(authUrl), {
    issuer: authUrl,
    audience: new URL(authUrl).origin,
    algorithms: ["EdDSA"],
  });

  if (typeof payload.sub !== "string" || payload.sub === "anonymous") {
    throw new Error("Neon Auth token is not an authenticated user token.");
  }

  const neonUser = await readNeonAuthUser(payload.sub);

  if (!neonUser) {
    throw new Error("Neon Auth user was not found in this database.");
  }

  return syncAppUser(neonUser);
}

export async function attachNeonAuthUser(req: Request, res: Response, next: NextFunction) {
  const token = bearerToken(req);

  if (!token) {
    next();
    return;
  }

  try {
    const user = await authenticateNeonBearerToken(token);
    req.user = user;

    const passportIsAuthenticated = req.isAuthenticated?.bind(req);
    req.isAuthenticated = (() => Boolean(req.user) || Boolean(passportIsAuthenticated?.())) as Request["isAuthenticated"];

    next();
  } catch (error) {
    logger.warn(
      "AUTH",
      error instanceof Error ? error.message : "Invalid Neon Auth bearer token",
    );
    res.status(401).json({ message: "Invalid Neon Auth session" });
  }
}
