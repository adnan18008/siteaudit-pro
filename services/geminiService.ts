import { GoogleGenAI, Type } from "@google/genai";
import { AuditReport, SeoIssue } from '../types';

const getAiClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API Key is missing");
  }
  return new GoogleGenAI({ apiKey });
};

// Fetch real data from Google PageSpeed Insights (Free API)
const fetchPageSpeedData = async (url: string) => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 4000); // 4 seconds timeout for speed

  try {
    const apiUrl = `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=${encodeURIComponent(url)}&category=PERFORMANCE&category=SEO&strategy=mobile`;
    const response = await fetch(apiUrl, { signal: controller.signal });
    clearTimeout(timeoutId);
    
    if (!response.ok) {
        console.warn("PageSpeed API unavailable, falling back to AI.");
        return null;
    }
    return await response.json();
  } catch (e) {
    console.error("PageSpeed API failed or timed out", e);
    return null;
  }
};

export const generateAuditReport = async (url: string): Promise<AuditReport> => {
  // 1. Trigger PageSpeed Insights (Real Technical Data) - with timeout
  const pageSpeedPromise = fetchPageSpeedData(url);
  
  // 2. Trigger Gemini with Google Search (Real Market Data)
  const ai = getAiClient();
  const model = "gemini-3-pro-preview";

  const prompt = `
    You are a professional website auditor.
    Task: Conduct a comprehensive market analysis for the domain: ${url}.
    
    ACTION: Use Google Search to find the LATEST available public data (specifically look for SimilarWeb, Semrush, or Ahrefs reports) for:
    1.  **Traffic**: Monthly Visits (current), Total Visits (last 3 months).
    2.  **Engagement**: Bounce Rate (%), Pages per Visit, Average Visit Duration.
    3.  **Rank**: Global Rank.
    4.  **Geography**: Top countries and their traffic share.
    5.  **Keywords**: Top organic keywords and their estimated positions.
    
    OUTPUT: Return a JSON object matching the schema.
    
    CRITICAL RULES:
    - **Traffic History**: Generate a 6-month trend ending in the current month. If the site has ~5.5 Billion visits, the values should be around 5,500,000,000.
    - **Countries**: 'share' MUST be a decimal between 0 and 1 (e.g., 0.19 for 19%). DO NOT return whole numbers for percentages.
    - **Keywords**: Provide REALISTIC positions. Do not list everything as #1. Mix in #1, #2, #3, #4-10 etc based on reality.
    - **Engagement**: Return strings formatted as found (e.g. "32.55%", "06:31", "3.79").
    
    If specific technical data is missing, provide 'fallbackIssues'.
  `;

  const aiPromise = ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }], 
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            overallScore: { type: Type.NUMBER, description: "Domain Authority Score (0-100)" },
            globalRank: { type: Type.NUMBER },
            engagement: {
              type: Type.OBJECT,
              properties: {
                bounceRate: { type: Type.STRING },
                pagesPerVisit: { type: Type.STRING },
                avgVisitDuration: { type: Type.STRING }
              }
            },
            trafficHistory: { 
              type: Type.ARRAY, 
              items: { type: Type.OBJECT, properties: { month: {type: Type.STRING}, visits: {type: Type.NUMBER} } } 
            },
            deviceDistribution: { 
              type: Type.ARRAY, 
              items: { type: Type.OBJECT, properties: { name: {type: Type.STRING}, value: {type: Type.NUMBER}, fill: {type: Type.STRING} } } 
            },
            marketingChannels: { 
              type: Type.ARRAY, 
              items: { type: Type.OBJECT, properties: { name: {type: Type.STRING}, value: {type: Type.NUMBER} } } 
            },
            topKeywords: { 
              type: Type.ARRAY, 
              items: { type: Type.OBJECT, properties: { keyword: {type: Type.STRING}, volume: {type: Type.NUMBER}, position: {type: Type.NUMBER}, difficulty: {type: Type.NUMBER} } } 
            },
            topCountries: { 
              type: Type.ARRAY, 
              items: { type: Type.OBJECT, properties: { country: {type: Type.STRING}, share: {type: Type.NUMBER}, change: {type: Type.NUMBER} } } 
            },
            summary: { type: Type.STRING },
            fallbackIssues: {
               type: Type.ARRAY,
               items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  severity: { type: Type.STRING, enum: ["critical", "warning", "info"] },
                  title: { type: Type.STRING },
                  description: { type: Type.STRING },
                  fix: { type: Type.STRING }
                }
               }
            }
          },
          required: ["trafficHistory", "topKeywords", "summary", "overallScore", "engagement"]
        }
      }
  });

  const [pageSpeedData, aiResponse] = await Promise.all([pageSpeedPromise, aiPromise]);

  let aiData: any = {};
  let sources: { title: string; uri: string }[] = [];

  if (aiResponse.candidates?.[0]) {
     const groundingChunks = aiResponse.candidates[0].groundingMetadata?.groundingChunks;
     if (groundingChunks) {
         groundingChunks.forEach(chunk => {
             if (chunk.web?.uri && chunk.web?.title) {
                 sources.push({ title: chunk.web.title, uri: chunk.web.uri });
             }
         });
     }

     try {
        let jsonStr = aiResponse.candidates[0].content.parts[0].text?.trim() || "{}";
        if (jsonStr.startsWith("```json")) jsonStr = jsonStr.replace(/^```json/, "").replace(/```$/, "");
        else if (jsonStr.startsWith("```")) jsonStr = jsonStr.replace(/^```/, "").replace(/```$/, "");
        aiData = JSON.parse(jsonStr);
     } catch (e) {
        console.error("Failed to parse AI JSON", e);
     }
  }

  let overallScore = aiData.overallScore || 0;
  let seoIssues: SeoIssue[] = [];

  if (pageSpeedData && pageSpeedData.lighthouseResult) {
     const audits = pageSpeedData.lighthouseResult.audits;
     const relevantAudits = [
         'first-contentful-paint', 'largest-contentful-paint', 'cumulative-layout-shift',
         'total-blocking-time', 'interactive', 'server-response-time'
     ];

     relevantAudits.forEach((key) => {
         const audit = audits[key];
         if (audit && audit.score !== null && audit.score < 0.9) {
             seoIssues.push({
                 id: audit.id,
                 severity: audit.score < 0.5 ? 'critical' : 'warning',
                 title: audit.title,
                 description: audit.displayValue || audit.description,
                 fix: "See PageSpeed Insights for details."
             });
         }
     });
  } else {
     seoIssues = aiData.fallbackIssues || [];
  }

  return {
      url: url,
      overallScore: overallScore > 0 ? overallScore : 50,
      globalRank: aiData.globalRank,
      engagement: aiData.engagement,
      summary: aiData.summary || `Analysis complete for ${url}`,
      trafficHistory: aiData.trafficHistory || [],
      deviceDistribution: aiData.deviceDistribution || [
          { name: 'Mobile', value: 60, fill: '#3b82f6' },
          { name: 'Desktop', value: 40, fill: '#93c5fd' }
      ],
      marketingChannels: aiData.marketingChannels || [],
      topKeywords: aiData.topKeywords || [],
      topCountries: aiData.topCountries || [],
      seoIssues: seoIssues.slice(0, 12),
      sources: sources
  };
};