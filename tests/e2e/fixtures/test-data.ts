export const testUsers = {
  validUser: {
    email: 'test.user@example.com',
    password: 'Test123!@#',
    fullName: 'Test User',
    phone: '+919876543210',
    instagram: 'testuser123'
  },
  sellerUser: {
    email: 'seller@example.com', 
    password: 'Seller123!@#',
    fullName: 'Test Seller',
    phone: '+919876543211',
    instagram: 'testseller123'
  },
  buyerUser: {
    email: 'buyer@example.com',
    password: 'Buyer123!@#', 
    fullName: 'Test Buyer',
    phone: '+919876543212',
    instagram: 'testbuyer123'
  }
};

export const testTickets = {
  concertTicket: {
    title: 'Coldplay Concert Ticket',
    eventTitle: 'Coldplay Music of the Spheres World Tour',
    eventDescription: 'Experience Coldplay live in Mumbai with their spectacular world tour',
    venue: 'DY Patil Stadium',
    venueAddress: 'D.Y. Patil Sports Stadium, Sector 7, Nerul, Navi Mumbai, Maharashtra 400706',
    eventDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
    category: 'Concert',
    section: 'VIP Section A',
    row: 'Row 5',
    seat: 'Seat 12-13',
    price: 8500,
    quantity: 2,
    transferMethod: 'Email Transfer',
    additionalInfo: 'Original tickets purchased from BookMyShow. Will transfer via official platform.',
    latitude: 19.0330,
    longitude: 73.0297,
    city: 'Mumbai'
  },
  sportsTicket: {
    title: 'IPL Final Match Tickets',
    eventTitle: 'IPL 2024 Final - CSK vs MI',
    eventDescription: 'Witness the ultimate cricket showdown at the IPL Final',
    venue: 'Wankhede Stadium',
    venueAddress: 'Wankhede Stadium, D Road, Churchgate, Mumbai, Maharashtra 400020',
    eventDate: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000), // 45 days from now
    category: 'Sports',
    section: 'Pavilion Stand',
    row: 'Row 10',
    seat: 'Seat 25-26',
    price: 12000,
    quantity: 2,
    transferMethod: 'Physical Handover',
    additionalInfo: 'Premium seats with excellent view. Meet at venue 1 hour before match.',
    latitude: 18.9389,
    longitude: 72.8258,
    city: 'Mumbai'
  }
};

export const searchQueries = {
  concert: 'Coldplay concert Mumbai',
  sports: 'IPL cricket tickets',
  comedy: 'stand up comedy',
  festival: 'music festival',
  invalid: 'xyz invalid search',
  empty: ''
};

export const mapLocations = {
  mumbai: { lat: 19.0760, lng: 72.8777 },
  delhi: { lat: 28.7041, lng: 77.1025 },
  bangalore: { lat: 12.9716, lng: 77.5946 },
  invalid: { lat: 0, lng: 0 }
};

export const testFiles = {
  validTicketPDF: 'sample-ticket.pdf',
  validTicketImage: 'sample-ticket.jpg', 
  invalidFile: 'invalid-file.txt',
  largeFile: 'large-file.pdf' // > 5MB
};

export const formValidationTests = {
  email: {
    valid: ['test@example.com', 'user.name@domain.co.in'],
    invalid: ['invalid-email', 'test@', '@domain.com', 'test.domain.com']
  },
  phone: {
    valid: ['+919876543210', '9876543210', '+91 98765 43210'],
    invalid: ['123', 'invalid-phone', '+1234567890', '98765']
  },
  instagram: {
    valid: ['username', '@username', 'user.name', 'user_name123'],
    invalid: ['', 'user name', 'user@domain', 'toolongusernametobevalidinsta']
  },
  price: {
    valid: ['100', '1500.50', '25000'],
    invalid: ['-100', 'abc', '0', '100000000']
  }
};

export const webSocketEvents = {
  ticketUpdate: {
    type: 'ticket_updated',
    payload: { ticketId: 1, status: 'sold' }
  },
  newMessage: {
    type: 'new_message', 
    payload: { contactRequestId: 1, message: 'Hello, is the ticket still available?' }
  },
  userOnline: {
    type: 'user_online',
    payload: { userId: 1 }
  }
};

export const analyticsEvents = {
  pageView: 'page_view',
  search: 'search',
  viewItem: 'view_item',
  addToCart: 'add_to_cart',
  purchase: 'purchase',
  login: 'login',
  signUp: 'sign_up',
  share: 'share'
};