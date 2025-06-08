export class DataGenerators {
  static generateValidTicket() {
    return {
      title: `Music Festival ${Date.now()}`,
      description: 'Amazing music festival experience with top artists',
      venue: 'Phoenix Marketcity, Mumbai',
      date: '2024-12-31',
      price: Math.floor(Math.random() * 5000 + 1000).toString(),
      category: 'Music'
    };
  }

  static generateInvalidTicket() {
    return {
      title: '',
      description: '',
      venue: '',
      date: 'invalid-date',
      price: 'not-a-number',
      category: ''
    };
  }

  static generateLongInputTicket() {
    const longString = 'a'.repeat(1000);
    return {
      title: longString,
      description: longString,
      venue: longString,
      date: '2024-12-31',
      price: '99999999',
      category: 'Music'
    };
  }

  static generateUnicodeTicket() {
    return {
      title: '🎵 मस्त संगीत Festival 音乐节',
      description: 'Special chars: !@#$%^&*()_+-=[]{}|;":,.<>?',
      venue: 'Café München & São Paulo',
      date: '2024-12-31',
      price: '2500',
      category: 'Music'
    };
  }

  static generateContactMessage() {
    return `Hi! I'm interested in purchasing this ticket. Is it still available? 
            I can meet in person or do online transfer. Please let me know. Thanks!`;
  }

  static getTestViewports() {
    return [
      { width: 375, height: 667, name: 'iPhone SE' },
      { width: 414, height: 896, name: 'iPhone XR' },
      { width: 768, height: 1024, name: 'iPad' },
      { width: 1024, height: 768, name: 'iPad Landscape' },
      { width: 1280, height: 720, name: 'Desktop Small' },
      { width: 1440, height: 900, name: 'Desktop Medium' },
      { width: 1920, height: 1080, name: 'Desktop Large' }
    ];
  }

  static getTestCities() {
    return ['Mumbai', 'Delhi', 'Bangalore', 'Chennai', 'Kolkata', 'Pune', 'Hyderabad', 'Goa'];
  }

  static getTestCategories() {
    return ['Music', 'Sports', 'Comedy', 'Theatre', 'Dance', 'Food', 'Technology', 'Art'];
  }
}