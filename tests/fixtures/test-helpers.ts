// Test utilities and helpers for comprehensive testing

export const TEST_USERS = {
  validUser: {
    email: 'test@example.com',
    password: 'SecurePass123',
    fullName: 'Test User',
    country: 'US'
  },
  invalidUser: {
    email: 'invalid-email',
    password: '123',
    fullName: '',
    country: 'INVALID'
  }
};

export const TEST_TICKETS = {
  validTicket: {
    title: 'Taylor Swift Concert Tickets',
    eventTitle: 'Taylor Swift Eras Tour',
    venue: 'Madison Square Garden',
    venueAddress: '4 Pennsylvania Plaza, New York, NY',
    eventDate: new Date('2024-12-25'),
    category: 'Concert',
    quantity: 2,
    section: 'Floor',
    row: 'A',
    seat: '15-16',
    transferMethod: 'Mobile Transfer',
    additionalInfo: 'Amazing seats with great view!',
    isTransferrable: true,
    showContactInfo: false
  },
  invalidTicket: {
    title: '',
    eventTitle: '',
    venue: '',
    eventDate: new Date('2020-01-01'), // Past date
    category: '',
    quantity: 0,
    transferMethod: ''
  }
};

export const TEST_CONTACT_REQUESTS = {
  valid: {
    contactMethod: 'whatsapp',
    message: 'Hi, I am interested in purchasing these tickets. Are they still available?',
    meetingLocation: 'Central Park, NYC',
    preferredTime: 'Evening'
  },
  invalid: {
    contactMethod: 'invalid-method',
    message: 'Hi', // Too short
    meetingLocation: '',
    preferredTime: ''
  }
};

export const SEARCH_SCENARIOS = [
  { query: 'Taylor Swift', expectedResults: true },
  { query: 'Concert', expectedResults: true },
  { query: 'Madison Square Garden', expectedResults: true },
  { query: 'xyznonexistent', expectedResults: false },
  { category: 'Concert', expectedResults: true },
  { category: 'Sports', expectedResults: true },
  { city: 'New York', expectedResults: true }
];

export class TestDataValidator {
  static validateTicketData(ticket: any): boolean {
    const required = ['title', 'eventTitle', 'venue', 'eventDate', 'category', 'quantity', 'transferMethod'];
    return required.every(field => ticket[field] && ticket[field] !== '');
  }

  static validateUserData(user: any): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*#?&]{8,}$/;
    
    return emailRegex.test(user.email) && 
           passwordRegex.test(user.password) && 
           user.fullName.length >= 2 && 
           user.country.length === 2;
  }

  static validateSearchResults(results: any[], query: any): boolean {
    if (!Array.isArray(results)) return false;
    
    if (query.query) {
      return results.every(item => 
        item.title?.toLowerCase().includes(query.query.toLowerCase()) ||
        item.eventTitle?.toLowerCase().includes(query.query.toLowerCase()) ||
        item.venue?.toLowerCase().includes(query.query.toLowerCase())
      );
    }
    
    if (query.category) {
      return results.every(item => item.category === query.category);
    }
    
    return true;
  }
}

export const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const retryOperation = async (operation: () => Promise<any>, maxRetries: number = 3, delayMs: number = 1000) => {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await operation();
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      await delay(delayMs);
    }
  }
};