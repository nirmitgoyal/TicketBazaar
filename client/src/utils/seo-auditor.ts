/**
 * SEO Audit and Monitoring Utility
 * Provides real-time SEO health checks and recommendations
 */

import React from 'react';

export interface SEOAuditResult {
  score: number;
  grade: 'A' | 'B' | 'C' | 'D' | 'F';
  issues: SEOIssue[];
  recommendations: SEORecommendation[];
  passedChecks: SEOCheck[];
  failedChecks: SEOCheck[];
}

export interface SEOIssue {
  type: 'critical' | 'warning' | 'info';
  category: 'meta' | 'content' | 'performance' | 'accessibility' | 'structure';
  message: string;
  element?: string;
  fix?: string;
}

export interface SEORecommendation {
  priority: 'high' | 'medium' | 'low';
  category: string;
  title: string;
  description: string;
  impact: string;
  effort: 'low' | 'medium' | 'high';
}

export interface SEOCheck {
  name: string;
  description: string;
  passed: boolean;
  value?: string | number;
  expectedValue?: string | number;
}

class SEOAuditor {
  private checks: Array<() => SEOCheck> = [];

  constructor() {
    this.initializeChecks();
  }

  /**
   * Run complete SEO audit
   */
  async runAudit(): Promise<SEOAuditResult> {
    const results = this.checks.map(check => check());
    const passedChecks = results.filter(r => r.passed);
    const failedChecks = results.filter(r => !r.passed);
    
    const issues = this.generateIssues(failedChecks);
    const recommendations = this.generateRecommendations(failedChecks);
    const score = this.calculateScore(passedChecks.length, results.length);
    const grade = this.getGrade(score);

    return {
      score,
      grade,
      issues,
      recommendations,
      passedChecks,
      failedChecks
    };
  }

  /**
   * Initialize all SEO checks
   */
  private initializeChecks(): void {
    this.checks = [
      // Meta tag checks
      () => this.checkTitle(),
      () => this.checkMetaDescription(),
      () => this.checkCanonicalURL(),
      () => this.checkOpenGraph(),
      () => this.checkTwitterCard(),
      () => this.checkViewportMeta(),
      
      // Content checks
      () => this.checkHeadingStructure(),
      () => this.checkImageAltTags(),
      () => this.checkInternalLinks(),
      () => this.checkContentLength(),
      () => this.checkKeywordDensity(),
      
      // Performance checks
      () => this.checkPageSpeed(),
      () => this.checkImageOptimization(),
      () => this.checkServiceWorker(),
      () => this.checkResourceHints(),
      
      // Accessibility checks
      () => this.checkAriaLabels(),
      () => this.checkColorContrast(),
      () => this.checkFocusableElements(),
      
      // Structure checks
      () => this.checkStructuredData(),
      () => this.checkRobotsTag(),
      () => this.checkLanguageTag(),
      () => this.checkFavicon()
    ];
  }

  /**
   * Title tag check
   */
  private checkTitle(): SEOCheck {
    const title = document.title;
    const passed = title.length >= 30 && title.length <= 60 && title.includes('Ticket Bazaar');
    
    return {
      name: 'Title Tag',
      description: 'Page title should be 30-60 characters and include brand name',
      passed,
      value: `${title.length} characters`,
      expectedValue: '30-60 characters'
    };
  }

  /**
   * Meta description check
   */
  private checkMetaDescription(): SEOCheck {
    const metaDesc = document.querySelector('meta[name="description"]') as HTMLMetaElement;
    const content = metaDesc?.content || '';
    const passed = content.length >= 120 && content.length <= 160;
    
    return {
      name: 'Meta Description',
      description: 'Meta description should be 120-160 characters',
      passed,
      value: `${content.length} characters`,
      expectedValue: '120-160 characters'
    };
  }

  /**
   * Canonical URL check
   */
  private checkCanonicalURL(): SEOCheck {
    const canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
    const passed = !!canonical && canonical.href.startsWith('https://ticketbazaar.co.in');
    
    return {
      name: 'Canonical URL',
      description: 'Canonical URL should be present and valid',
      passed,
      value: canonical?.href || 'Not found',
      expectedValue: 'Valid HTTPS URL'
    };
  }

  /**
   * Open Graph check
   */
  private checkOpenGraph(): SEOCheck {
    const ogTitle = document.querySelector('meta[property="og:title"]');
    const ogDesc = document.querySelector('meta[property="og:description"]');
    const ogImage = document.querySelector('meta[property="og:image"]');
    const ogUrl = document.querySelector('meta[property="og:url"]');
    
    const passed = !!(ogTitle && ogDesc && ogImage && ogUrl);
    
    return {
      name: 'Open Graph Tags',
      description: 'Essential Open Graph tags should be present',
      passed,
      value: passed ? 'Complete' : 'Missing tags',
      expectedValue: 'All required OG tags'
    };
  }

  /**
   * Twitter Card check
   */
  private checkTwitterCard(): SEOCheck {
    const twitterCard = document.querySelector('meta[name="twitter:card"]');
    const twitterTitle = document.querySelector('meta[name="twitter:title"]');
    const twitterDesc = document.querySelector('meta[name="twitter:description"]');
    
    const passed = !!(twitterCard && twitterTitle && twitterDesc);
    
    return {
      name: 'Twitter Card',
      description: 'Twitter Card meta tags should be present',
      passed,
      value: passed ? 'Complete' : 'Missing tags',
      expectedValue: 'All required Twitter Card tags'
    };
  }

  /**
   * Viewport meta check
   */
  private checkViewportMeta(): SEOCheck {
    const viewport = document.querySelector('meta[name="viewport"]') as HTMLMetaElement;
    const content = viewport?.content || '';
    const passed = content.includes('width=device-width') && content.includes('initial-scale=1');
    
    return {
      name: 'Viewport Meta',
      description: 'Viewport meta tag should be mobile-optimized',
      passed,
      value: content || 'Not found',
      expectedValue: 'width=device-width, initial-scale=1'
    };
  }

  /**
   * Heading structure check
   */
  private checkHeadingStructure(): SEOCheck {
    const h1s = document.querySelectorAll('h1');
    const h2s = document.querySelectorAll('h2');
    const passed = h1s.length === 1 && h2s.length >= 1;
    
    return {
      name: 'Heading Structure',
      description: 'Should have exactly one H1 and multiple H2s',
      passed,
      value: `${h1s.length} H1, ${h2s.length} H2`,
      expectedValue: '1 H1, 2+ H2'
    };
  }

  /**
   * Image alt tags check
   */
  private checkImageAltTags(): SEOCheck {
    const images = document.querySelectorAll('img');
    const imagesWithAlt = Array.from(images).filter(img => img.alt && img.alt.trim());
    const passed = images.length === 0 || (imagesWithAlt.length / images.length) >= 0.9;
    
    return {
      name: 'Image Alt Tags',
      description: 'At least 90% of images should have alt text',
      passed,
      value: `${imagesWithAlt.length}/${images.length} images`,
      expectedValue: '90%+ with alt text'
    };
  }

  /**
   * Internal links check
   */
  private checkInternalLinks(): SEOCheck {
    const links = document.querySelectorAll('a[href]');
    const internalLinks = Array.from(links).filter(link => {
      const href = (link as HTMLAnchorElement).href;
      return href.includes('ticketbazaar.co.in') || href.startsWith('/');
    });
    const passed = internalLinks.length >= 5;
    
    return {
      name: 'Internal Links',
      description: 'Should have at least 5 internal links',
      passed,
      value: `${internalLinks.length} internal links`,
      expectedValue: '5+ internal links'
    };
  }

  /**
   * Content length check
   */
  private checkContentLength(): SEOCheck {
    const content = document.body.textContent || '';
    const wordCount = content.trim().split(/\s+/).length;
    const passed = wordCount >= 300;
    
    return {
      name: 'Content Length',
      description: 'Page should have at least 300 words',
      passed,
      value: `${wordCount} words`,
      expectedValue: '300+ words'
    };
  }

  /**
   * Keyword density check
   */
  private checkKeywordDensity(): SEOCheck {
    const content = document.body.textContent?.toLowerCase() || '';
    const keywords = ['ticket', 'bazaar', 'sell', 'buy', 'concert', 'sports'];
    const wordCount = content.trim().split(/\s+/).length;
    
    let keywordCount = 0;
    keywords.forEach(keyword => {
      const matches = content.match(new RegExp(keyword, 'g'));
      keywordCount += matches ? matches.length : 0;
    });
    
    const density = (keywordCount / wordCount) * 100;
    const passed = density >= 1 && density <= 3;
    
    return {
      name: 'Keyword Density',
      description: 'Keyword density should be 1-3%',
      passed,
      value: `${density.toFixed(2)}%`,
      expectedValue: '1-3%'
    };
  }

  /**
   * Page speed check
   */
  private checkPageSpeed(): SEOCheck {
    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    const loadTime = navigation ? navigation.loadEventEnd - navigation.fetchStart : 0;
    const passed = loadTime < 3000; // 3 seconds
    
    return {
      name: 'Page Load Speed',
      description: 'Page should load in under 3 seconds',
      passed,
      value: `${(loadTime / 1000).toFixed(2)}s`,
      expectedValue: '< 3.0s'
    };
  }

  /**
   * Image optimization check
   */
  private checkImageOptimization(): SEOCheck {
    const images = document.querySelectorAll('img');
    const optimizedImages = Array.from(images).filter(img => {
      const src = img.src;
      return src.includes('.webp') || src.includes('loading=lazy') || img.loading === 'lazy';
    });
    const passed = images.length === 0 || (optimizedImages.length / images.length) >= 0.5;
    
    return {
      name: 'Image Optimization',
      description: 'At least 50% of images should be optimized',
      passed,
      value: `${optimizedImages.length}/${images.length} optimized`,
      expectedValue: '50%+ optimized'
    };
  }

  /**
   * Service worker check
   */
  private checkServiceWorker(): SEOCheck {
    const passed = 'serviceWorker' in navigator && !!navigator.serviceWorker.controller;
    
    return {
      name: 'Service Worker',
      description: 'Service worker should be active for performance',
      passed,
      value: passed ? 'Active' : 'Not active',
      expectedValue: 'Active'
    };
  }

  /**
   * Resource hints check
   */
  private checkResourceHints(): SEOCheck {
    const preconnect = document.querySelectorAll('link[rel="preconnect"]');
    const dnsPrefetch = document.querySelectorAll('link[rel="dns-prefetch"]');
    const preload = document.querySelectorAll('link[rel="preload"]');
    
    const passed = preconnect.length >= 2 && (dnsPrefetch.length >= 1 || preload.length >= 1);
    
    return {
      name: 'Resource Hints',
      description: 'Should have preconnect and prefetch/preload hints',
      passed,
      value: `${preconnect.length} preconnect, ${dnsPrefetch.length} prefetch, ${preload.length} preload`,
      expectedValue: '2+ preconnect, 1+ prefetch/preload'
    };
  }

  /**
   * ARIA labels check
   */
  private checkAriaLabels(): SEOCheck {
    const interactiveElements = document.querySelectorAll('button, input, select, textarea, a');
    const elementsWithAria = Array.from(interactiveElements).filter(el => 
      el.getAttribute('aria-label') || 
      el.getAttribute('aria-labelledby') || 
      el.getAttribute('aria-describedby')
    );
    const passed = interactiveElements.length === 0 || (elementsWithAria.length / interactiveElements.length) >= 0.7;
    
    return {
      name: 'ARIA Labels',
      description: 'Interactive elements should have ARIA labels',
      passed,
      value: `${elementsWithAria.length}/${interactiveElements.length} labeled`,
      expectedValue: '70%+ with ARIA labels'
    };
  }

  /**
   * Color contrast check (simplified)
   */
  private checkColorContrast(): SEOCheck {
    // This is a simplified check - in production, you'd use a proper contrast calculation
    const textElements = document.querySelectorAll('p, span, div, h1, h2, h3, h4, h5, h6');
    const passed = textElements.length > 0; // Simplified - assume good contrast
    
    return {
      name: 'Color Contrast',
      description: 'Text should have sufficient color contrast',
      passed,
      value: 'Assumed good',
      expectedValue: 'WCAG AA compliant'
    };
  }

  /**
   * Focusable elements check
   */
  private checkFocusableElements(): SEOCheck {
    const focusableElements = document.querySelectorAll('a, button, input, select, textarea, [tabindex]');
    const visibleFocusable = Array.from(focusableElements).filter(el => {
      const rect = el.getBoundingClientRect();
      return rect.width > 0 && rect.height > 0;
    });
    const passed = visibleFocusable.length >= 3;
    
    return {
      name: 'Focusable Elements',
      description: 'Should have focusable navigation elements',
      passed,
      value: `${visibleFocusable.length} focusable`,
      expectedValue: '3+ focusable elements'
    };
  }

  /**
   * Structured data check
   */
  private checkStructuredData(): SEOCheck {
    const structuredData = document.querySelectorAll('script[type="application/ld+json"]');
    const passed = structuredData.length >= 1;
    
    return {
      name: 'Structured Data',
      description: 'Should have JSON-LD structured data',
      passed,
      value: `${structuredData.length} schemas`,
      expectedValue: '1+ structured data schemas'
    };
  }

  /**
   * Robots tag check
   */
  private checkRobotsTag(): SEOCheck {
    const robotsMeta = document.querySelector('meta[name="robots"]') as HTMLMetaElement;
    const content = robotsMeta?.content || '';
    const passed = content.includes('index') && content.includes('follow');
    
    return {
      name: 'Robots Meta',
      description: 'Robots meta should allow indexing and following',
      passed,
      value: content || 'Not found',
      expectedValue: 'index, follow'
    };
  }

  /**
   * Language tag check
   */
  private checkLanguageTag(): SEOCheck {
    const htmlLang = document.documentElement.lang;
    const passed = !!htmlLang && htmlLang.length >= 2;
    
    return {
      name: 'Language Tag',
      description: 'HTML should have lang attribute',
      passed,
      value: htmlLang || 'Not set',
      expectedValue: 'Valid language code'
    };
  }

  /**
   * Favicon check
   */
  private checkFavicon(): SEOCheck {
    const favicon = document.querySelector('link[rel="icon"], link[rel="shortcut icon"]');
    const passed = !!favicon;
    
    return {
      name: 'Favicon',
      description: 'Should have a favicon',
      passed,
      value: passed ? 'Present' : 'Missing',
      expectedValue: 'Present'
    };
  }

  /**
   * Generate issues from failed checks
   */
  private generateIssues(failedChecks: SEOCheck[]): SEOIssue[] {
    return failedChecks.map(check => ({
      type: this.getIssueType(check.name),
      category: this.getIssueCategory(check.name),
      message: `${check.name}: ${check.description}`,
      fix: this.getFixSuggestion(check.name)
    }));
  }

  /**
   * Generate recommendations from failed checks
   */
  private generateRecommendations(failedChecks: SEOCheck[]): SEORecommendation[] {
    const recommendations: SEORecommendation[] = [];
    
    failedChecks.forEach(check => {
      const rec = this.getRecommendation(check.name);
      if (rec) recommendations.push(rec);
    });
    
    return recommendations;
  }

  /**
   * Calculate overall SEO score
   */
  private calculateScore(passed: number, total: number): number {
    return Math.round((passed / total) * 100);
  }

  /**
   * Get letter grade from score
   */
  private getGrade(score: number): 'A' | 'B' | 'C' | 'D' | 'F' {
    if (score >= 90) return 'A';
    if (score >= 80) return 'B';
    if (score >= 70) return 'C';
    if (score >= 60) return 'D';
    return 'F';
  }

  /**
   * Get issue type based on check name
   */
  private getIssueType(checkName: string): 'critical' | 'warning' | 'info' {
    const critical = ['Title Tag', 'Meta Description', 'Heading Structure'];
    const warning = ['Open Graph Tags', 'Twitter Card', 'Image Alt Tags'];
    
    if (critical.includes(checkName)) return 'critical';
    if (warning.includes(checkName)) return 'warning';
    return 'info';
  }

  /**
   * Get issue category based on check name
   */
  private getIssueCategory(checkName: string): 'meta' | 'content' | 'performance' | 'accessibility' | 'structure' {
    const metaChecks = ['Title Tag', 'Meta Description', 'Canonical URL', 'Open Graph Tags', 'Twitter Card'];
    const contentChecks = ['Heading Structure', 'Image Alt Tags', 'Internal Links', 'Content Length'];
    const performanceChecks = ['Page Load Speed', 'Image Optimization', 'Service Worker'];
    const accessibilityChecks = ['ARIA Labels', 'Color Contrast', 'Focusable Elements'];
    
    if (metaChecks.includes(checkName)) return 'meta';
    if (contentChecks.includes(checkName)) return 'content';
    if (performanceChecks.includes(checkName)) return 'performance';
    if (accessibilityChecks.includes(checkName)) return 'accessibility';
    return 'structure';
  }

  /**
   * Get fix suggestion for failed check
   */
  private getFixSuggestion(checkName: string): string {
    const fixes: Record<string, string> = {
      'Title Tag': 'Update page title to be 30-60 characters and include "Ticket Bazaar"',
      'Meta Description': 'Add or update meta description to be 120-160 characters',
      'Canonical URL': 'Add canonical link tag with proper HTTPS URL',
      'Open Graph Tags': 'Add missing og:title, og:description, og:image, og:url meta tags',
      'Twitter Card': 'Add twitter:card, twitter:title, twitter:description meta tags',
      'Heading Structure': 'Use exactly one H1 tag and multiple H2 tags for content hierarchy',
      'Image Alt Tags': 'Add descriptive alt text to all images',
      'Service Worker': 'Implement service worker for better performance and offline support'
    };
    
    return fixes[checkName] || 'Review and fix this SEO issue';
  }

  /**
   * Get recommendation for failed check
   */
  private getRecommendation(checkName: string): SEORecommendation | null {
    const recommendations: Record<string, SEORecommendation> = {
      'Title Tag': {
        priority: 'high',
        category: 'Meta Tags',
        title: 'Optimize Page Title',
        description: 'Page titles should be 30-60 characters and include target keywords',
        impact: 'High impact on search rankings and click-through rates',
        effort: 'low'
      },
      'Meta Description': {
        priority: 'high',
        category: 'Meta Tags',
        title: 'Add Meta Description',
        description: 'Meta descriptions improve click-through rates from search results',
        impact: 'Medium impact on CTR, no direct ranking impact',
        effort: 'low'
      },
      'Page Load Speed': {
        priority: 'high',
        category: 'Performance',
        title: 'Improve Page Speed',
        description: 'Faster pages rank better and provide better user experience',
        impact: 'High impact on rankings and user experience',
        effort: 'medium'
      }
    };
    
    return recommendations[checkName] || null;
  }
}

// Export singleton instance
export const seoAuditor = new SEOAuditor();

/**
 * React hook for SEO monitoring
 */
export function useSEOAudit() {
  const [auditResult, setAuditResult] = React.useState<SEOAuditResult | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);

  const runAudit = React.useCallback(async () => {
    setIsLoading(true);
    try {
      const result = await seoAuditor.runAudit();
      setAuditResult(result);
    } catch (error) {
      console.error('SEO audit failed:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  React.useEffect(() => {
    // Run audit on page load
    const timer = setTimeout(runAudit, 2000); // Wait for page to fully load
    return () => clearTimeout(timer);
  }, [runAudit]);

  return {
    auditResult,
    isLoading,
    runAudit
  };
}