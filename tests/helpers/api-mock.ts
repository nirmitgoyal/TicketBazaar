import { Page, Route } from '@playwright/test';

export class APIMock {
  constructor(private page: Page) {}

  async mockAuthenticationSuccess() {
    await this.page.route('**/api/auth/user', route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          id: 1,
          email: 'test@example.com',
          name: 'Test User',
          instagramHandle: '@testuser',
          rating: 4.5
        })
      });
    });
  }

  async mockAuthenticationFailure() {
    await this.page.route('**/api/auth/user', route => {
      route.fulfill({
        status: 401,
        contentType: 'application/json',
        body: JSON.stringify({ message: 'Not authenticated' })
      });
    });
  }

  async mockEventsSuccess() {
    await this.page.route('**/api/events', route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([
          {
            id: 1,
            title: 'Sunburn Festival 2024',
            venue: 'Vagator Beach, Goa',
            date: '2024-12-31',
            category: 'Music',
            price: 2500,
            sellerId: 1,
            description: 'Electronic music festival',
            latitude: 15.6006,
            longitude: 73.7514
          }
        ])
      });
    });
  }

  async mockServerError(endpoint: string, statusCode: number = 500) {
    await this.page.route(endpoint, route => {
      route.fulfill({
        status: statusCode,
        contentType: 'application/json',
        body: JSON.stringify({ message: 'Server error' })
      });
    });
  }

  async mockNetworkDelay(endpoint: string, delayMs: number = 2000) {
    await this.page.route(endpoint, route => {
      setTimeout(() => route.continue(), delayMs);
    });
  }

  async clearAllMocks() {
    await this.page.unroute('**/*');
  }
}