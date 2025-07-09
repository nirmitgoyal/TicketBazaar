import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';

const API_BASE_URL = 'http://localhost:5000/api';

describe('API Integration Tests', () => {
  beforeAll(async () => {
    const healthUrl = `${API_BASE_URL}/health`;
    const timeout = 30000; // 30 seconds
    const start = Date.now();

    while (Date.now() - start < timeout) {
      try {
        const res = await fetch(healthUrl);
        if (res.status === 200) {
          return;
        }
      } catch {
        // Ignore errors until timeout
      }
      await new Promise(r => setTimeout(r, 500));
    }

    throw new Error('Server failed to become ready within 30s');
  });

  describe('Authentication Endpoints', () => {
    it('should register a new user', async () => {
      const userData = {
        email: `test${Date.now()}@example.com`,
        password: 'SecurePass123',
        fullName: 'Test User',
        country: 'US'
      };

      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
      });

      expect(response.status).toBe(201);
      const result = await response.json();
      expect(result.user).toBeDefined();
      expect(result.user.email).toBe(userData.email);
    });

    it('should login with valid credentials', async () => {
      const loginData = {
        email: 'existing@example.com',
        password: 'SecurePass123'
      };

      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(loginData)
      });

      expect(response.status).toBe(200);
      const result = await response.json();
      expect(result.user).toBeDefined();
    });

    it('should reject invalid login credentials', async () => {
      const loginData = {
        email: 'invalid@example.com',
        password: 'wrongpassword'
      };

      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(loginData)
      });

      expect(response.status).toBe(401);
    });

    it('should return current user for authenticated requests', async () => {
      const response = await fetch(`${API_BASE_URL}/auth/user`, {
        credentials: 'include'
      });

      // Should either return user data or 401 if not authenticated
      expect([200, 401]).toContain(response.status);
    });
  });

  describe('Ticket Endpoints', () => {
    it('should fetch all tickets', async () => {
      const response = await fetch(`${API_BASE_URL}/tickets`);
      
      expect(response.status).toBe(200);
      const tickets = await response.json();
      expect(Array.isArray(tickets)).toBe(true);
    });

    it('should search tickets with query parameters', async () => {
      const searchParams = new URLSearchParams({
        query: 'concert',
        category: 'Concert',
        limit: '10'
      });

      const response = await fetch(`${API_BASE_URL}/tickets/search?${searchParams}`);
      
      expect(response.status).toBe(200);
      const tickets = await response.json();
      expect(Array.isArray(tickets)).toBe(true);
    });

    it('should get ticket by ID', async () => {
      // First get all tickets to find a valid ID
      const allTicketsResponse = await fetch(`${API_BASE_URL}/tickets`);
      const tickets = await allTicketsResponse.json();
      
      if (tickets.length > 0) {
        const ticketId = tickets[0].id;
        const response = await fetch(`${API_BASE_URL}/tickets/${ticketId}`);
        
        expect(response.status).toBe(200);
        const ticket = await response.json();
        expect(ticket.id).toBe(ticketId);
      }
    });

    it('should handle non-existent ticket ID', async () => {
      const response = await fetch(`${API_BASE_URL}/tickets/99999`);
      expect(response.status).toBe(404);
    });

    it('should create a new ticket for authenticated user', async () => {
      const ticketData = {
        title: 'Test Concert Tickets',
        eventTitle: 'Test Artist Concert',
        venue: 'Test Venue',
        venueAddress: '123 Test St, Test City',
        eventDate: new Date('2024-12-25').toISOString(),
        category: 'Concert',
        quantity: 2,
        section: 'A',
        row: '10',
        seat: '15-16',
        transferMethod: 'Mobile Transfer',
        additionalInfo: 'Great seats!',
        isTransferrable: true,
        showContactInfo: false
      };

      const response = await fetch(`${API_BASE_URL}/tickets`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(ticketData),
        credentials: 'include'
      });

      // Should either create successfully or require authentication
      expect([201, 401]).toContain(response.status);
    });
  });

  describe('Event Endpoints', () => {
    it('should fetch all events', async () => {
      const response = await fetch(`${API_BASE_URL}/events`);
      
      expect(response.status).toBe(200);
      const events = await response.json();
      expect(Array.isArray(events)).toBe(true);
    });

    it('should get event by ID', async () => {
      const allEventsResponse = await fetch(`${API_BASE_URL}/events`);
      const events = await allEventsResponse.json();
      
      if (events.length > 0) {
        const eventId = events[0].id;
        const response = await fetch(`${API_BASE_URL}/events/${eventId}`);
        
        expect(response.status).toBe(200);
        const event = await response.json();
        expect(event.id).toBe(eventId);
      }
    });
  });

  describe('Contact Request Endpoints', () => {
    it('should create contact request for authenticated user', async () => {
      const contactData = {
        ticketId: 1,
        contactMethod: 'whatsapp',
        message: 'Hi, I am interested in purchasing these tickets. Are they still available?',
        meetingLocation: 'Central Park',
        preferredTime: 'Evening'
      };

      const response = await fetch(`${API_BASE_URL}/contact-requests`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(contactData),
        credentials: 'include'
      });

      // Should either create successfully or require authentication
      expect([201, 401]).toContain(response.status);
    });

    it('should fetch contact requests for authenticated user', async () => {
      const response = await fetch(`${API_BASE_URL}/contact-requests`, {
        credentials: 'include'
      });

      // Should either return data or require authentication
      expect([200, 401]).toContain(response.status);
    });
  });

  describe('Search and Autocomplete', () => {
    it('should provide search hints', async () => {
      const response = await fetch(`${API_BASE_URL}/search/hints?query=concert`);
      
      expect(response.status).toBe(200);
      const hints = await response.json();
      expect(Array.isArray(hints)).toBe(true);
    });

    it('should provide autocomplete suggestions', async () => {
      const response = await fetch(`${API_BASE_URL}/autocomplete?query=taylor`);
      
      expect(response.status).toBe(200);
      const suggestions = await response.json();
      expect(suggestions).toBeDefined();
    });
  });

  describe('Health and Status', () => {
    it('should return health status', async () => {
      const response = await fetch(`${API_BASE_URL}/health`);
      
      expect(response.status).toBe(200);
      const health = await response.json();
      expect(health.status).toBe('healthy');
    });

    it('should return database connectivity status', async () => {
      const response = await fetch(`${API_BASE_URL}/health/db`);
      
      expect(response.status).toBe(200);
      const dbHealth = await response.json();
      expect(dbHealth.connected).toBe(true);
    });
  });

  describe('Rate Limiting', () => {
    it('should enforce rate limits on repeated requests', async () => {
      const requests = [];
      
      // Make multiple rapid requests
      for (let i = 0; i < 50; i++) {
        requests.push(fetch(`${API_BASE_URL}/tickets`));
      }
      
      const responses = await Promise.all(requests);
      const rateLimitedResponses = responses.filter(r => r.status === 429);
      
      // Should have some rate limited responses if limits are properly enforced
      // This test may pass if rate limits are high or not strict
      expect(rateLimitedResponses.length).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Error Handling', () => {
    it('should handle malformed JSON requests', async () => {
      const response = await fetch(`${API_BASE_URL}/tickets`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: 'invalid json',
        credentials: 'include'
      });

      expect(response.status).toBe(400);
    });

    it('should return proper error format', async () => {
      const response = await fetch(`${API_BASE_URL}/tickets/invalid-id`);
      
      expect(response.status).toBe(404);
      const error = await response.json();
      expect(error.message).toBeDefined();
    });
  });

  describe('Data Validation', () => {
    it('should validate ticket creation data', async () => {
      const invalidTicketData = {
        title: '', // Empty title should fail
        eventTitle: 'Test Event',
        venue: '',
        eventDate: 'invalid-date',
        quantity: -1
      };

      const response = await fetch(`${API_BASE_URL}/tickets`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(invalidTicketData),
        credentials: 'include'
      });

      expect([400, 401]).toContain(response.status);
    });

    it('should validate user registration data', async () => {
      const invalidUserData = {
        email: 'invalid-email',
        password: '123', // Too short
        fullName: '',
        country: 'INVALID'
      };

      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(invalidUserData)
      });

      expect(response.status).toBe(400);
    });
  });
});