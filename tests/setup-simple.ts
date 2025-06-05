import "@testing-library/jest-dom";
import { afterAll, afterEach, beforeAll } from "@jest/globals";
import { TextDecoder, TextEncoder } from "util";

// Add TextDecoder/TextEncoder to global
global.TextDecoder = TextDecoder;
global.TextEncoder = TextEncoder;

// Simple test setup without MSW
beforeAll(() => {
  // Test environment setup
});

afterEach(() => {
  // Reset test state
});

afterAll(() => {
  // Cleanup
});