import React from "react";
import { render, screen, waitFor, act } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider, useAuth } from "../../../client/src/hooks/use-auth";
import { server } from "../../mocks/server";
import { rest } from "msw";

// Mock Firebase functions
jest.mock("../../../client/src/lib/firebase", () => ({
  signInWithGoogle: jest.fn(),
  signOutFromFirebase: jest.fn(),
  handleGoogleRedirectResult: jest.fn(),
  googleProvider: {},
  auth: {},
  firebaseApp: {},
}));

// Create a test component that uses the auth hook
function TestAuthComponent() {
  const { user, isLoading, logoutMutation, googleSignIn } = useAuth();

  return (
    <div>
      {isLoading ? (
        <p>Loading...</p>
      ) : user ? (
        <>
          <h1>Welcome, {user.username}</h1>
          <button onClick={() => logoutMutation.mutate()}>Logout</button>
        </>
      ) : (
        <>
          <h1>Please login</h1>
          <button onClick={() => googleSignIn()}>Sign in with Google</button>
        </>
      )}
    </div>
  );
}

// Create wrapper component for tests
function renderWithProviders(ui: React.ReactElement) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <AuthProvider>{ui}</AuthProvider>
    </QueryClientProvider>,
  );
}

describe("Auth Hook", () => {
  test("should show loading state initially", () => {
    renderWithProviders(<TestAuthComponent />);
    expect(screen.getByText("Loading...")).toBeInTheDocument();
  });

  test("should fetch user data and display username when authenticated", async () => {
    renderWithProviders(<TestAuthComponent />);

    await waitFor(() => {
      expect(screen.getByText("Welcome, testuser")).toBeInTheDocument();
    });
  });

  test("should handle Google sign-in flow", async () => {
    // Mock user as not authenticated initially
    server.use(
      rest.get("/api/auth/user", (req, res, ctx) => {
        return res(ctx.status(401));
      }),
    );

    // Mock successful Google sign-in
    const { signInWithGoogle } = require("../../../client/src/lib/firebase");
    signInWithGoogle.mockResolvedValueOnce({ uid: "mock-uid" });

    // Mock successful backend authentication after Google sign-in
    server.use(
      rest.post("/api/auth/firebase-login", (req, res, ctx) => {
        return res(ctx.status(200), ctx.json({ id: 1, username: "testuser" }));
      }),
    );

    renderWithProviders(<TestAuthComponent />);

    // Wait for the component to load and show login button
    await waitFor(() => {
      expect(screen.getByText("Please login")).toBeInTheDocument();
    });

    // Click Google sign-in button
    const signInButton = screen.getByText("Sign in with Google");
    act(() => {
      signInButton.click();
    });

    // Mock user is now authenticated
    server.use(
      rest.get("/api/auth/user", (req, res, ctx) => {
        return res(ctx.status(200), ctx.json({ id: 1, username: "testuser" }));
      }),
    );

    // After successful login, user should be shown
    await waitFor(() => {
      expect(screen.getByText("Welcome, testuser")).toBeInTheDocument();
    });
  });

  test("should handle logout flow", async () => {
    // Mock successful Firebase sign-out
    const { signOutFromFirebase } = require("../../../client/src/lib/firebase");
    signOutFromFirebase.mockResolvedValueOnce(undefined);

    renderWithProviders(<TestAuthComponent />);

    // Wait for the user to be loaded
    await waitFor(() => {
      expect(screen.getByText("Welcome, testuser")).toBeInTheDocument();
    });

    // Click logout button
    const logoutButton = screen.getByText("Logout");

    // Mock the server to return unauthenticated after logout
    server.use(
      rest.get("/api/auth/user", (req, res, ctx) => {
        return res(ctx.status(401));
      }),
    );

    act(() => {
      logoutButton.click();
    });

    // After successful logout, login screen should be shown
    await waitFor(() => {
      expect(screen.getByText("Please login")).toBeInTheDocument();
    });
  });
});
