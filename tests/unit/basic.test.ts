import { describe, it, expect } from '@jest/globals';

describe('Basic Test Suite', () => {
  it('should run basic unit tests', () => {
    expect(1 + 1).toBe(2);
    expect(true).toBe(true);
  });

  it('should test string operations', () => {
    const testString = 'TicketBazaar';
    expect(testString.toLowerCase()).toBe('ticketbazaar');
    expect(testString.length).toBe(12);
  });

  it('should test environment setup', () => {
    expect(process.env.NODE_ENV).toBeDefined();
  });
});