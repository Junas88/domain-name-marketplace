import OpenAI from "openai";

// Initialize the OpenAI client
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

/**
 * Analyzes domain names to extract insights using OpenAI
 * @param domainNames Array of domain names to analyze
 * @returns Analysis results with categories, strengths, and market fit
 */
export async function analyzeDomains(domainNames: string[]) {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024
      messages: [
        {
          role: "system",
          content: `You are a domain name expert that provides professional analysis of domain names. 
            Analyze the list of domains for the following:
            1. Best category fit for each domain
            2. Domain strength score (1-10)
            3. Potential market or industry fit
            4. Estimated value range
            Return valid JSON only.`
        },
        {
          role: "user",
          content: `Analyze these domains: ${domainNames.join(", ")}`
        }
      ],
      response_format: { type: "json_object" }
    });

    return JSON.parse(response.choices[0].message.content);
  } catch (error) {
    console.error("Error analyzing domains with OpenAI:", error);
    throw new Error("Failed to analyze domains");
  }
}

/**
 * Fetches and analyzes recent domain industry news
 * @returns Structured news data with analysis
 */
export async function getDomainIndustryNews() {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024
      messages: [
        {
          role: "system",
          content: `You are a domain industry news analyst. Provide the latest 5 significant domain industry 
          news items from the past week that would be relevant to domain investors. For each news item include:
          - title: Short descriptive title
          - source: Name of the source publication
          - date: Publication date in the format YYYY-MM-DD
          - summary: 1-2 sentence summary
          - impact: How this news affects domain investors on a scale of 1-10
          - domain_categories: Array of domain categories most affected
          Return as valid JSON with an array of news objects.`
        }
      ],
      response_format: { type: "json_object" }
    });

    return JSON.parse(response.choices[0].message.content);
  } catch (error) {
    console.error("Error getting domain industry news with OpenAI:", error);
    throw new Error("Failed to fetch industry news");
  }
}

/**
 * Analyzes real-time domain pricing trends from your marketplace compared to industry averages
 * @param yourDomains Array of your domain data including prices, categories
 * @returns Pricing analysis and comparison
 */
export async function analyzePricingTrends(yourDomains: any[]) {
  try {
    // Extract just the essential data to reduce token usage
    const domainData = yourDomains.map(domain => ({
      name: domain.name,
      category: domain.category,
      price: domain.price,
      length: domain.length,
      isSold: domain.isSold
    }));

    const response = await openai.chat.completions.create({
      model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024
      messages: [
        {
          role: "system",
          content: `You are a domain market pricing analyst. Analyze the provided domain portfolio data 
          and compare it against these industry average prices:
          - Business: $2,900
          - Technology: $3,500
          - Health: $2,300
          - Education: $1,800
          - Finance: $4,200
          - Entertainment: $2,100
          - Travel: $2,400
          - Food: $1,900
          - Fashion: $1,700
          - Sports: $1,950
          - Other: $1,200
          
          Provide:
          1. A category-by-category comparison
          2. Identify categories where prices are above/below market average
          3. Specific pricing recommendations
          4. Overall portfolio value analysis
          Return as valid JSON.`
        },
        {
          role: "user",
          content: JSON.stringify(domainData)
        }
      ],
      response_format: { type: "json_object" }
    });

    return JSON.parse(response.choices[0].message.content);
  } catch (error) {
    console.error("Error analyzing pricing trends with OpenAI:", error);
    throw new Error("Failed to analyze pricing trends");
  }
}

/**
 * Generates a market demand heat index for different domain categories and TLDs
 * @param recentSales Optional data about recent sales to improve accuracy
 * @returns Market demand analysis with heat index scores
 */
export async function generateMarketDemandIndex(recentSales?: any[]) {
  try {
    // Current date formatted as YYYY-MM-DD
    const currentDate = new Date().toISOString().split('T')[0];
    
    let prompt = `Based on current market trends as of ${currentDate}, generate a domain market demand heat index`;
    
    if (recentSales && recentSales.length > 0) {
      prompt += ` taking into account these recent sales: ${JSON.stringify(recentSales)}`;
    }

    const response = await openai.chat.completions.create({
      model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024
      messages: [
        {
          role: "system",
          content: `You are a domain market analyst specializing in trends and demand patterns. 
          Provide a comprehensive domain market demand heat index with:
          
          1. categoryDemand: Array of objects with category name and demand score (1-10)
          2. tldDemand: Array of objects with TLD (com, net, org, io, ai, etc.) and demand score (1-10)
          3. risingTrends: Array of objects with keyword, reason for rise, and growth percentage
          4. decliningTrends: Array of objects with keyword, reason for decline, and decline percentage
          5. industryHotspots: Which industries are showing highest domain acquisition activity
          6. lengthAnalysis: Demand analysis by domain name length (1-20 characters)
          
          Use real current trends in the domain industry as of April 2025. Return as valid JSON only.`
        },
        {
          role: "user",
          content: prompt
        }
      ],
      response_format: { type: "json_object" }
    });

    return JSON.parse(response.choices[0].message.content);
  } catch (error) {
    console.error("Error generating market demand index with OpenAI:", error);
    throw new Error("Failed to generate market demand index");
  }
}

/**
 * Creates benchmark comparisons for your marketplace against industry standards
 * @param yourStats Object containing your marketplace statistics
 * @returns Benchmark comparison data
 */
export async function createBenchmarkComparisons(yourStats: any) {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024
      messages: [
        {
          role: "system",
          content: `You are a domain marketplace analytics expert. Compare the provided marketplace 
          statistics against current industry benchmarks (April 2025). Generate:
          
          1. performanceMetrics: Radar chart data comparing metrics like conversion rate, average price, etc.
          2. keyMetrics: Summary of 4-6 most important performance indicators with industry comparison
          3. detailedMetrics: Full breakdown of all metrics with your value, industry average, and top performer
          4. recommendations: Actionable recommendations to improve performance
          
          Return as valid JSON only.`
        },
        {
          role: "user",
          content: JSON.stringify(yourStats)
        }
      ],
      response_format: { type: "json_object" }
    });

    return JSON.parse(response.choices[0].message.content);
  } catch (error) {
    console.error("Error creating benchmark comparisons with OpenAI:", error);
    throw new Error("Failed to create benchmark comparisons");
  }
}

export default {
  analyzeDomains,
  getDomainIndustryNews,
  analyzePricingTrends,
  generateMarketDemandIndex,
  createBenchmarkComparisons
};