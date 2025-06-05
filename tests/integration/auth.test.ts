import fetch from "node-fetch";
import { server } from "../mocks/server";
import { User } from "../../shared/schema";
import {
  afterAll,
  afterEach,
  beforeAll,
  describe,
  expect,
  test,
} from "@jest/globals";

// Enable request interception
beforeAll(() => server.listen());

// Reset handlers after each test
afterEach(() => server.resetHandlers());

// Disable interception after all tests
afterAll(() => server.close());

describe("Authentication API Integration Tests", () => {
  const API_BASE_URL = "http://localhost:5000/api";

  test("should get authentication info", async () => {
    const response = await fetch(`${API_BASE_URL}/auth/login-info`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    expect(response.status).toBe(200);
    const data = await response.json();

    // Verifies the server indicates that Google Auth is enabled
    expect(data).toHaveProperty("googleAuthEnabled", true);
    expect(data).toHaveProperty(
      "message",
      "This application only supports Google Authentication",
    );
  });

  test("should authenticate with Firebase", async () => {
    const googleAuthData = {
      googleId: "test-google-id-123",
      email: "test@example.com",
      fullName: "Test Google User",
    };

    const response = await fetch(`${API_BASE_URL}/auth/firebase-login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(googleAuthData),
    });

    expect(response.status).toBe(200);
    const data = await response.json();

    // The server should return the authenticated user
    expect(data).toHaveProperty("user");
    expect(data.user).toHaveProperty("id");
    expect(data.user).toHaveProperty("email", "test@example.com");
    expect(data.user).toHaveProperty("googleId", "test-google-id-123");
  });

  test("should logout a user", async () => {
    const response = await fetch(`${API_BASE_URL}/auth/logout`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    });

    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data).toHaveProperty("message", "Logged out successfully");
  });

  test("should get user data when authenticated", async () => {
    // This test assumes the server is mocked to return authenticated user
    const response = await fetch(`${API_BASE_URL}/auth/user`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    expect(response.status).toBe(200);
    const data = (await response.json()) as User;

    expect(data).toHaveProperty("id");
    expect(data).toHaveProperty("email");
  });

  test("should return 401 when not authenticated", async () => {
    // Set up the mock server to return not authenticated for this test
    server.use(
      http.get("/api/auth/user", (req, res, ctx) => {
        return res(ctx.status(401), ctx.json({ message: "Not authenticated" }));
      })
    );

    const response = await fetch(`${API_BASE_URL}/auth/user`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    expect(response.status).toBe(401);
    const data = await response.json();
    expect(data).toHaveProperty("message", "Not authenticated");
  });
});
