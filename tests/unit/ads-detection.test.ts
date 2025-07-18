/**
 * Test for AdSense ads detection and positioning utilities
 */

import { detectAdSenseAds, calculateNavigationOffset } from '../client/src/utils/ads-detection';

// Mock DOM environment for testing
const mockDOM = () => {
  // Mock window object
  global.window = {
    innerHeight: 800,
    innerWidth: 1200,
    setTimeout: setTimeout,
    clearTimeout: clearTimeout,
    getComputedStyle: jest.fn().mockReturnValue({
      position: 'fixed',
      display: 'block'
    })
  } as any;

  // Mock document object
  global.document = {
    body: {
      addEventListener: jest.fn(),
      removeEventListener: jest.fn()
    },
    querySelectorAll: jest.fn().mockReturnValue([])
  } as any;

  // Mock HTMLElement
  global.HTMLElement = class {
    getBoundingClientRect() {
      return {
        width: 320,
        height: 50,
        top: 750,
        bottom: 800,
        left: 0,
        right: 320
      };
    }
  };

  // Mock MutationObserver
  global.MutationObserver = class {
    constructor() {}
    observe() {}
    disconnect() {}
  };
};

describe('AdSense Detection Utilities', () => {
  beforeEach(() => {
    mockDOM();
  });

  test('detectAdSenseAds should return empty array when no ads present', () => {
    const ads = detectAdSenseAds();
    expect(ads).toEqual([]);
  });

  test('calculateNavigationOffset should return default offset when no ads', () => {
    const offset = calculateNavigationOffset('bottom-right');
    expect(offset).toBe(16);
  });

  test('calculateNavigationOffset should return increased offset when bottom ads present', () => {
    // Mock an ad element
    const mockAdElement = {
      getBoundingClientRect: () => ({
        width: 320,
        height: 50,
        top: 750,
        bottom: 800,
        left: 0,
        right: 320
      })
    };

    // Mock document.querySelectorAll to return the ad element
    global.document.querySelectorAll = jest.fn().mockReturnValue([mockAdElement]);

    const offset = calculateNavigationOffset('bottom-right');
    expect(offset).toBeGreaterThan(16); // Should be greater than default
  });

  test('calculateNavigationOffset should return default for non-bottom positions', () => {
    const offset = calculateNavigationOffset('top-right');
    expect(offset).toBe(16);
  });
});