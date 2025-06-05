// Test Perplexity AI verification for ticket authenticity

async function testVerification() {
  const apiKey = process.env.PERPLEXITY_API_KEY;
  
  if (!apiKey) {
    console.log('❌ PERPLEXITY_API_KEY not found');
    return;
  }

  // Sample ticket data from the platform
  const ticket = {
    eventTitle: "IPL Final 2024",
    venue: "Narendra Modi Stadium", 
    eventDate: "2024-05-26",
    city: "Ahmedabad",
    category: "sports",
    price: 8500,
    section: "Premium"
  };

  console.log('🔍 Verifying ticket with Perplexity AI...');
  console.log(`Event: ${ticket.eventTitle}`);
  console.log(`Venue: ${ticket.venue}`);
  console.log(`Price: ₹${ticket.price}`);
  console.log('');

  try {
    const response = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.1-sonar-small-128k-online',
        messages: [
          {
            role: 'system',
            content: 'You are an expert event verification specialist. Analyze events for authenticity and provide verification results in JSON format only.'
          },
          {
            role: 'user',
            content: `Verify this event for authenticity:

Event: ${ticket.eventTitle}
Venue: ${ticket.venue}
Date: ${ticket.eventDate}
City: ${ticket.city}
Category: ${ticket.category}
Price: ₹${ticket.price}
Section: ${ticket.section}

Analyze:
1. Event legitimacy and current status
2. Venue authenticity  
3. Pricing reasonableness
4. Date validity

Respond with JSON only:
{
  "isVerified": boolean,
  "confidence": number (0-100),
  "fraudRisk": "low|medium|high",
  "eventAnalysis": "brief analysis",
  "pricingAnalysis": "price assessment", 
  "recommendations": ["safety tip 1", "safety tip 2"]
}`
          }
        ],
        max_tokens: 500,
        temperature: 0.2,
        top_p: 0.9,
        search_recency_filter: 'month',
      }),
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();
    const aiResponse = data.choices[0]?.message?.content || '{}';
    
    // Extract JSON from response
    const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const result = JSON.parse(jsonMatch[0]);
      
      console.log('✅ Verification Results:');
      console.log(`Verified: ${result.isVerified ? 'YES' : 'NO'}`);
      console.log(`Confidence: ${result.confidence}%`);
      console.log(`Fraud Risk: ${result.fraudRisk.toUpperCase()}`);
      console.log('');
      console.log('📊 Analysis:');
      console.log(`Event: ${result.eventAnalysis}`);
      console.log(`Pricing: ${result.pricingAnalysis}`);
      console.log('');
      console.log('💡 Recommendations:');
      result.recommendations.forEach((rec, i) => {
        console.log(`${i + 1}. ${rec}`);
      });
      console.log('');
      console.log('🔗 Sources used:');
      data.citations?.forEach((source, i) => {
        console.log(`${i + 1}. ${source}`);
      });
    } else {
      console.log('❌ Could not parse verification result');
    }

  } catch (error) {
    console.error('❌ Verification failed:', error.message);
  }
}

testVerification();