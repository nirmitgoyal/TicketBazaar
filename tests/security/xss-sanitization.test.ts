/**
 * XSS Sanitization Security Tests
 * Testing the sanitizeInput middleware for XSS vulnerabilities
 */

import { Request, Response, NextFunction } from "express";
import { sanitizeInput } from "../../server/middleware/auth.middleware";

// Mock Express objects
function createMockRequest(body: any): Partial<Request> {
  return {
    body
  } as Partial<Request>;
}

function createMockResponse(): Partial<Response> {
  return {} as Partial<Response>;
}

function createMockNext(): NextFunction {
  return (() => {}) as NextFunction;
}

/**
 * Test the current sanitizeInput middleware against various XSS payloads
 * This test is expected to FAIL with the current implementation,
 * demonstrating the vulnerabilities that need to be fixed.
 */
describe("XSS Sanitization Vulnerability Tests", () => {
  
  it("should block basic script tag XSS", () => {
    const req = createMockRequest({
      title: "<script>alert('XSS')</script>Ticket Title"
    });
    const res = createMockResponse();
    const next = createMockNext();

    sanitizeInput(req as Request, res as Response, next);

    // Should not contain script tags
    expect(req.body.title).not.toContain("<script>");
    expect(req.body.title).not.toContain("alert");
  });

  it("should block mixed case script tags", () => {
    const req = createMockRequest({
      description: "<ScRiPt>alert('XSS')</ScRiPt>Event Description"
    });
    const res = createMockResponse();
    const next = createMockNext();

    sanitizeInput(req as Request, res as Response, next);

    // Current implementation FAILS this test - mixed case bypasses the regex
    expect(req.body.description).not.toContain("ScRiPt");
    expect(req.body.description).not.toContain("alert");
  });

  it("should block img tag with onerror event", () => {
    const req = createMockRequest({
      venue: "Stadium <img src=x onerror=alert('XSS')> Main"
    });
    const res = createMockResponse();
    const next = createMockNext();

    sanitizeInput(req as Request, res as Response, next);

    // Should remove dangerous img tags with event handlers
    expect(req.body.venue).not.toContain("onerror");
    expect(req.body.venue).not.toContain("alert");
  });

  it("should block javascript URI in href", () => {
    const req = createMockRequest({
      details: 'Visit <a href="javascript:alert(\'XSS\')">our site</a>'
    });
    const res = createMockResponse();
    const next = createMockNext();

    sanitizeInput(req as Request, res as Response, next);

    // Should remove javascript: URIs
    expect(req.body.details).not.toContain("javascript:");
    expect(req.body.details).not.toContain("alert");
  });

  it("should block nested script tags", () => {
    const req = createMockRequest({
      title: "<scr<script>ipt>alert('XSS')</script>Nested Attack"
    });
    const res = createMockResponse();
    const next = createMockNext();

    sanitizeInput(req as Request, res as Response, next);

    // Current implementation FAILS this test - nested tags bypass the regex
    expect(req.body.title).not.toContain("<script>");
    expect(req.body.title).not.toContain("alert");
  });

  it("should handle nested objects properly", () => {
    const req = createMockRequest({
      event: {
        name: "<script>alert('XSS')</script>Event Name",
        location: {
          venue: "Stadium <img src=x onerror=alert('XSS')> Hall"
        }
      },
      tickets: [
        {
          type: "VIP <script>alert('XSS')</script>",
          price: 100
        }
      ]
    });
    const res = createMockResponse();
    const next = createMockNext();

    sanitizeInput(req as Request, res as Response, next);

    // Should sanitize nested objects and arrays
    expect(req.body.event.name).not.toContain("<script>");
    expect(req.body.event.location.venue).not.toContain("onerror");
    expect(req.body.tickets[0].type).not.toContain("<script>");
  });

  it("should preserve safe content", () => {
    const req = createMockRequest({
      title: "Safe Ticket Title",
      description: "This is a normal description with no HTML",
      price: 50,
      quantity: 2
    });
    const res = createMockResponse();
    const next = createMockNext();

    sanitizeInput(req as Request, res as Response, next);

    // Safe content should remain unchanged
    expect(req.body.title).toBe("Safe Ticket Title");
    expect(req.body.description).toBe("This is a normal description with no HTML");
    expect(req.body.price).toBe(50);
    expect(req.body.quantity).toBe(2);
  });

  it("should block data URI script injection", () => {
    const req = createMockRequest({
      image: 'data:text/html,<script>alert("XSS")</script>'
    });
    const res = createMockResponse();
    const next = createMockNext();

    sanitizeInput(req as Request, res as Response, next);

    // Should block dangerous data URIs
    expect(req.body.image).not.toContain("data:text/html");
    expect(req.body.image).not.toContain("<script>");
  });
});