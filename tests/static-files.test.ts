import fs from 'fs';
import path from 'path';
import { describe, it, expect } from '@jest/globals';

describe('Static Files', () => {
  describe('ads.txt', () => {
    it('should exist in client/public directory', () => {
      const adsFilePath = path.resolve(__dirname, '..', 'client', 'public', 'ads.txt');
      expect(fs.existsSync(adsFilePath)).toBe(true);
    });

    it('should have correct Google AdSense content format', () => {
      const adsFilePath = path.resolve(__dirname, '..', 'client', 'public', 'ads.txt');
      const content = fs.readFileSync(adsFilePath, 'utf-8').trim();
      
      // Should match the format: domain, publisher_id, relationship, certification_authority_id
      const adsLineRegex = /^google\.com,\s*pub-\d+,\s*DIRECT,\s*[a-f0-9]+$/;
      expect(content).toMatch(adsLineRegex);
    });

    it('should be included in build output', () => {
      // After build, check if ads.txt exists in dist/public
      const distAdsPath = path.resolve(__dirname, '..', 'dist', 'public', 'ads.txt');
      
      // Only check if dist directory exists (build may not have run)
      const distDir = path.resolve(__dirname, '..', 'dist', 'public');
      if (fs.existsSync(distDir)) {
        expect(fs.existsSync(distAdsPath)).toBe(true);
        
        // Verify content matches source
        const sourceContent = fs.readFileSync(
          path.resolve(__dirname, '..', 'client', 'public', 'ads.txt'), 
          'utf-8'
        );
        const distContent = fs.readFileSync(distAdsPath, 'utf-8');
        expect(distContent).toBe(sourceContent);
      }
    });
  });
});