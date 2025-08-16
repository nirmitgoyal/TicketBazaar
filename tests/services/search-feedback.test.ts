import { describe, it, expect } from 'vitest';
import { SearchFeedbackService } from '../../server/services/search-feedback.service';

describe('SearchFeedbackService', () => {
  const service = new SearchFeedbackService();

  describe('Empty query feedback', () => {
    it('should provide popular suggestions for empty queries', () => {
      const feedback = service.getFeedback({ queryType: 'empty' });

      expect(feedback.type).toBe('suggestion');
      expect(feedback.message).toBe('Discover amazing events happening near you');
      expect(feedback.suggestions).toHaveLength(5);
      expect(feedback.suggestions).toContain('IPL matches');
      expect(feedback.showPopularTickets).toBe(true);
    });
  });

  describe('Special character feedback', () => {
    it('should provide helpful guidance for special character queries', () => {
      const feedback = service.getFeedback({ 
        queryType: 'special_chars',
        originalQuery: '###concerts###'
      });

      expect(feedback.type).toBe('info');
      expect(feedback.message).toBe("Special characters aren't needed for search. Try simple keywords!");
      expect(feedback.suggestions).toHaveLength(4);
      expect(feedback.suggestions).toContain('Try searching for event names');
    });
  });

  describe('XSS-like query feedback', () => {
    it('should provide warning for XSS-like queries', () => {
      const feedback = service.getFeedback({ 
        queryType: 'xss_like',
        originalQuery: '<script>alert("xss")</script>'
      });

      expect(feedback.type).toBe('warning');
      expect(feedback.message).toBe("Let's keep it simple! Search with event names, artists, or cities.");
      expect(feedback.suggestions).toContain('concert tickets');
      expect(feedback.suggestions).toContain('sports events');
    });
  });

  describe('SQL-like query feedback', () => {
    it('should provide warning for SQL injection attempts', () => {
      const feedback = service.getFeedback({ 
        queryType: 'sql_like',
        originalQuery: "' UNION SELECT * FROM users --"
      });

      expect(feedback.type).toBe('warning');
      expect(feedback.message).toBe('Please search using simple keywords like event names or cities.');
      expect(feedback.suggestions).toContain('bollywood concert');
      expect(feedback.suggestions).toContain('cricket match');
    });
  });

  describe('No results feedback', () => {
    it('should provide contextual suggestions for music-related searches', () => {
      const feedback = service.getFeedback({ 
        queryType: 'no_results',
        sanitizedQuery: 'unknown music artist',
        resultCount: 0
      });

      expect(feedback.type).toBe('info');
      expect(feedback.message).toBe('No tickets found for "unknown music artist". Here are some suggestions:');
      expect(feedback.suggestions.some(s => s.includes('concert') || s.includes('music'))).toBe(true);
    });

    it('should provide contextual suggestions for sports-related searches', () => {
      const feedback = service.getFeedback({ 
        queryType: 'no_results',
        sanitizedQuery: 'unknown sport game',
        resultCount: 0
      });

      expect(feedback.type).toBe('info');
      expect(feedback.message).toBe('No tickets found for "unknown sport game". Here are some suggestions:');
      expect(feedback.suggestions.some(s => s.includes('cricket') || s.includes('sport'))).toBe(true);
    });

    it('should provide location-specific suggestions when user location is available', () => {
      const feedback = service.getFeedback({ 
        queryType: 'no_results',
        sanitizedQuery: 'unknown event',
        userLocation: 'Mumbai',
        resultCount: 0
      });

      expect(feedback.suggestions.some(s => s.includes('Mumbai'))).toBe(true);
    });

    it('should suggest popular tickets when few contextual suggestions are available', () => {
      const feedback = service.getFeedback({ 
        queryType: 'no_results',
        sanitizedQuery: 'completely unknown query',
        resultCount: 0
      });

      expect(feedback.showPopularTickets).toBe(true);
    });
  });

  describe('Popular suggestions', () => {
    it('should return 8 popular suggestions', () => {
      const suggestions = service.getPopularSuggestions();

      expect(suggestions).toHaveLength(8);
      expect(suggestions[0]).toEqual(
        expect.objectContaining({
          suggestion: expect.any(String),
          category: expect.any(String),
          popularity: expect.any(Number)
        })
      );
    });
  });

  describe('Guidance detection', () => {
    it('should identify queries that need guidance', () => {
      expect(service.needsGuidance('empty')).toBe(true);
      expect(service.needsGuidance('special_chars')).toBe(true);
      expect(service.needsGuidance('xss_like')).toBe(true);
      expect(service.needsGuidance('sql_like')).toBe(true);
      expect(service.needsGuidance('no_results')).toBe(true);
      expect(service.needsGuidance('normal')).toBe(false);
    });
  });

  describe('Smart suggestions generation', () => {
    it('should generate city-specific suggestions for city queries', () => {
      const feedback = service.getFeedback({ 
        queryType: 'no_results',
        sanitizedQuery: 'events in delhi',
        resultCount: 0
      });

      expect(feedback.suggestions.some(s => s.includes('delhi'))).toBe(true);
    });

    it('should generate comedy-specific suggestions for comedy queries', () => {
      const feedback = service.getFeedback({ 
        queryType: 'no_results',
        sanitizedQuery: 'funny comedy show',
        resultCount: 0
      });

      expect(feedback.suggestions.some(s => s.includes('comedy'))).toBe(true);
    });

    it('should limit suggestions to 5 items', () => {
      const feedback = service.getFeedback({ 
        queryType: 'no_results',
        sanitizedQuery: 'music concert sports comedy in mumbai',
        resultCount: 0
      });

      expect(feedback.suggestions.length).toBeLessThanOrEqual(5);
    });
  });

  describe('Contextual suggestions', () => {
    it('should provide relevant suggestions for normal queries', () => {
      const feedback = service.getFeedback({ 
        queryType: 'normal',
        sanitizedQuery: 'rock concert',
        userLocation: 'Bangalore'
      });

      expect(feedback.type).toBe('suggestion');
      expect(feedback.suggestions.length).toBeGreaterThan(0);
    });
  });
});