/**
 * Test data fixtures for comprehensive E2E testing
 * Contains realistic test data that mirrors production scenarios
 */

export const testUsers = {
  validUser: {
    email: 'nirmit@example.com',
    password: 'password123',
    fullName: 'Nirmit Goyal',
    phone: '+919876543210',
    whatsapp: '+919876543210',
    instagram: 'nirmit_goyal',
    preferredContactMethod: 'whatsapp'
  },
  
  newUser: {
    email: 'newuser@example.com',
    password: 'password123',
    fullName: 'New Test User',
    phone: '+919876543211',
    whatsapp: '+919876543211',
    instagram: 'new_user',
    preferredContactMethod: 'whatsapp'
  },
  
  invalidUser: {
    email: 'invalid-email',
    password: '123',
    fullName: 'A',
    phone: '123',
    whatsapp: '123',
    instagram: 'invalid@user!',
    preferredContactMethod: 'email'
  }
};

export const testTickets = {
  validTicket: {
    title: 'Coldplay Concert Tickets',
    eventTitle: 'Coldplay Music of the Spheres World Tour',
    eventDescription: 'Experience the magic of Coldplay live in Mumbai',
    venue: 'DY Patil Stadium',
    venueAddress: 'Sector 30A, Vashi, Navi Mumbai, Maharashtra 400703',
    eventDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
    category: 'music',
    section: 'Gold Circle',
    row: 'G',
    seat: '15-16',
    price: 8500,
    quantity: 2,
    isTransferrable: true,
    transferMethod: 'electronic',
    additionalInfo: 'Original tickets purchased from BookMyShow',
    showContactInfo: true,
    city: 'Mumbai',
    latitude: 19.0760,
    longitude: 72.8777
  },
  
  invalidTicket: {
    title: '', // Empty title
    eventTitle: '',
    venue: '',
    price: -100, // Negative price
    quantity: 0, // Zero quantity
    eventDate: new Date(Date.now() - 24 * 60 * 60 * 1000), // Past date
  },
  
  overLimitTicket: {
    title: 'a'.repeat(201), // Exceeds character limit
    eventTitle: 'Valid Concert',
    venue: 'Valid Venue',
    price: 999999999, // Excessive price
    quantity: 1001, // Exceeds quantity limit
    eventDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
  }
};

export const testSelectors = {
  // Authentication
  auth: {
    loginForm: '[data-testid="login-form"]',
    registerForm: '[data-testid="register-form"]',
    emailInput: '[data-testid="email-input"]',
    passwordInput: '[data-testid="password-input"]',
    loginSubmit: '[data-testid="login-submit"]',
    registerSubmit: '[data-testid="register-submit"]',
    logoutButton: '[data-testid="logout-button"]',
    userProfile: '[data-testid="user-profile"]',
    userMenu: '[data-testid="user-menu"]'
  },
  
  // Navigation
  navigation: {
    logo: '[data-testid="nav-logo"]',
    events: '[data-testid="nav-events"]',
    search: '[data-testid="nav-search"]',
    map: '[data-testid="nav-map"]',
    mobileMenuButton: '[data-testid="mobile-menu-button"]',
    mobileNavEvents: '[data-testid="mobile-nav-events"]'
  },
  
  // Forms
  forms: {
    sellForm: '[data-testid="sell-form"]',
    searchForm: '[data-testid="search-form"]',
    contactForm: '[data-testid="contact-form"]',
    profileForm: '[data-testid="profile-form"]'
  },
  
  // Error states
  errors: {
    errorMessage: '[data-testid="error-message"]',
    networkError: '[data-testid="network-error"]',
    serverError: '[data-testid="server-error"]',
    notFoundMessage: '[data-testid="not-found-message"]',
    validationError: '[data-testid="validation-error"]'
  },
  
  // Loading states
  loading: {
    spinner: '[data-testid="loading-spinner"]',
    skeleton: '[data-testid="skeleton-loader"]',
    progress: '[data-testid="upload-progress"]'
  },
  
  // Map elements
  map: {
    container: '[data-testid="map-container"]',
    googleMap: '[data-testid="google-map"]',
    marker: '[data-testid="map-marker"]',
    infoWindow: '[data-testid="marker-info-window"]',
    searchInput: '[data-testid="location-search"]'
  }
};