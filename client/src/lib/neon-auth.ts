import { createAuthClient } from "@neondatabase/auth";
import { BetterAuthReactAdapter } from "@neondatabase/auth/react/adapters";

const DEFAULT_NEON_AUTH_URL =
  "https://ep-dry-hill-ajs1lm50.neonauth.c-3.us-east-2.aws.neon.tech/neondb/auth";

export const neonAuthUrl = (
  import.meta.env.VITE_NEON_AUTH_URL || DEFAULT_NEON_AUTH_URL
).replace(/\/$/, "");

export const neonAuthClient = createAuthClient(neonAuthUrl, {
  adapter: BetterAuthReactAdapter(),
});

export async function getNeonAuthToken() {
  try {
    const session = await neonAuthClient.getSession();
    return session.data?.session?.token ?? null;
  } catch (error) {
    console.warn("[Neon Auth] Unable to read session token", error);
    return null;
  }
}

export async function signInWithNeonGoogle(callbackURL: string) {
  const result = await neonAuthClient.signIn.social({
    provider: "google",
    callbackURL,
  });

  if (result.error) {
    throw new Error(result.error.message || "Google sign-in failed.");
  }

  if (result.data?.url) {
    window.location.href = result.data.url;
  }

  return result;
}

export async function signOutFromNeonAuth() {
  const result = await neonAuthClient.signOut();

  if (result.error) {
    throw new Error(result.error.message || "Logout failed.");
  }

  return result.data;
}
