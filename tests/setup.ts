import "@testing-library/jest-dom";
import { server } from "./mocks/server.js";
import { afterAll, afterEach, beforeAll } from "@jest/globals";
import { TextDecoder, TextEncoder } from "util";

// Add TextDecoder/TextEncoder to global with proper type casting
global.TextDecoder = TextDecoder as any;
global.TextEncoder = TextEncoder as any;

// Establish API mocking before all tests
beforeAll(() => server.listen({ onUnhandledRequest: "warn" }));

// Reset any request handlers that we may add during the tests,
// so they don't affect other tests
afterEach(() => server.resetHandlers());

// Clean up after the tests are finished
afterAll(() => server.close());
