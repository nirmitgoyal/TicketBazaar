import { Request, Response } from "express";

interface FraudCheckResult {
  confidence: number; // 0-100 percentage
  isLegitimate: boolean;
  reasons: string[];
  eventDetails?: {
    isRealEvent: boolean;
    eventVerified: boolean;
    venue: string;
    date: string;
  };
  riskFactors?: {
    duplicateReports: boolean;
    flaggedOnPlatforms: boolean;
    suspiciousPatterns: string[];
  };
}

export class FraudDetectionService {
  private perplexityApiKey: string;

  constructor() {
    this.perplexityApiKey = process.env.PERPLEXITY_API_KEY || "";
    if (!this.perplexityApiKey) {
      console.warn("Perplexity API key not found - fraud detection will be limited");
    }
  }

  async checkTicketLegitimacy(ticket: {
    eventTitle: string;
    venue: string;
    eventDate: Date;
    city: string;
    category: string;
    sellerId: number;
  }): Promise<FraudCheckResult> {
    if (!this.perplexityApiKey) {
      return this.getDefaultResult();
    }

    try {
      const eventDateStr = new Date(ticket.eventDate).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });

      const query = `Is this a legitimate real event? "${ticket.eventTitle}" at ${ticket.venue} in ${ticket.city} on ${eventDateStr}. 
        1. Is this a real scheduled event? 
        2. Has this event been reported as having fake tickets in circulation? 
        3. Are there any fraud warnings about tickets for this event?
        Please provide a brief factual response.`;

      const response = await fetch("https://api.perplexity.ai/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${this.perplexityApiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "llama-3.1-sonar-small-128k-online",
          messages: [
            {
              role: "system",
              content: "You are a fraud detection expert. Provide concise, factual assessments about event legitimacy. Focus on verifiable information.",
            },
            {
              role: "user",
              content: query,
            },
          ],
          temperature: 0.1,
          max_tokens: 200,
          stream: false,
        }),
      });

      if (!response.ok) {
        console.error("Perplexity API error:", response.status);
        return this.getDefaultResult();
      }

      const data = await response.json();
      const aiResponse = data.choices[0].message.content.toLowerCase();

      // Analyze the response
      const isRealEvent = !aiResponse.includes("not found") && 
                         !aiResponse.includes("no information") &&
                         !aiResponse.includes("doesn't exist") &&
                         !aiResponse.includes("fictional");

      const hasWarnings = aiResponse.includes("fraud") || 
                         aiResponse.includes("fake") || 
                         aiResponse.includes("scam") ||
                         aiResponse.includes("counterfeit");

      const hasDuplicates = aiResponse.includes("duplicate") || 
                           aiResponse.includes("reported");

      // Calculate confidence score
      let confidence = 50; // Base score

      if (isRealEvent) {
        confidence += 30;
      } else {
        confidence -= 30;
      }

      if (!hasWarnings) {
        confidence += 15;
      } else {
        confidence -= 25;
      }

      if (!hasDuplicates) {
        confidence += 5;
      } else {
        confidence -= 15;
      }

      // Additional pattern checks
      const suspiciousPatterns = this.checkSuspiciousPatterns(ticket);
      confidence -= suspiciousPatterns.length * 5;

      // Ensure confidence is within 0-100
      confidence = Math.max(0, Math.min(100, confidence));

      return {
        confidence,
        isLegitimate: confidence >= 60,
        reasons: this.generateReasons(isRealEvent, hasWarnings, hasDuplicates, suspiciousPatterns),
        eventDetails: {
          isRealEvent,
          eventVerified: isRealEvent && !hasWarnings,
          venue: ticket.venue,
          date: eventDateStr,
        },
        riskFactors: {
          duplicateReports: hasDuplicates,
          flaggedOnPlatforms: hasWarnings,
          suspiciousPatterns,
        },
      };

    } catch (error) {
      console.error("Fraud detection error:", error);
      return this.getDefaultResult();
    }
  }

  private checkSuspiciousPatterns(ticket: any): string[] {
    const patterns: string[] = [];
    
    // Check for generic or suspicious event names
    if (ticket.eventTitle.includes("Test") || 
        ticket.eventTitle.includes("Sample") ||
        ticket.eventTitle.includes("Lorem")) {
      patterns.push("Generic event name");
    }

    // Check for far future dates (more than 1 year)
    const eventDate = new Date(ticket.eventDate);
    const oneYearFromNow = new Date();
    oneYearFromNow.setFullYear(oneYearFromNow.getFullYear() + 1);
    
    if (eventDate > oneYearFromNow) {
      patterns.push("Event date too far in future");
    }

    // Check for past dates
    if (eventDate < new Date()) {
      patterns.push("Event already passed");
    }

    return patterns;
  }

  private generateReasons(isRealEvent: boolean, hasWarnings: boolean, hasDuplicates: boolean, patterns: string[]): string[] {
    const reasons: string[] = [];

    if (isRealEvent) {
      reasons.push("Event verified as real");
    } else {
      reasons.push("Event could not be verified");
    }

    if (!hasWarnings) {
      reasons.push("No fraud warnings found");
    } else {
      reasons.push("Fraud warnings detected");
    }

    if (!hasDuplicates) {
      reasons.push("No duplicate reports");
    } else {
      reasons.push("Duplicate tickets reported");
    }

    if (patterns.length > 0) {
      reasons.push(...patterns.map(p => `Suspicious: ${p}`));
    }

    return reasons;
  }

  private getDefaultResult(): FraudCheckResult {
    return {
      confidence: 50,
      isLegitimate: true,
      reasons: ["Unable to verify - API unavailable"],
      eventDetails: {
        isRealEvent: false,
        eventVerified: false,
        venue: "",
        date: "",
      },
      riskFactors: {
        duplicateReports: false,
        flaggedOnPlatforms: false,
        suspiciousPatterns: [],
      },
    };
  }
}

export const fraudDetectionService = new FraudDetectionService();

// API endpoint handler
export async function checkTicketFraud(req: Request, res: Response) {
  try {
    const { eventTitle, venue, eventDate, city, category, sellerId } = req.body;

    if (!eventTitle || !venue || !eventDate) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const result = await fraudDetectionService.checkTicketLegitimacy({
      eventTitle,
      venue,
      eventDate: new Date(eventDate),
      city,
      category,
      sellerId,
    });

    res.json(result);
  } catch (error) {
    console.error("Fraud check API error:", error);
    res.status(500).json({ error: "Failed to check ticket fraud" });
  }
}