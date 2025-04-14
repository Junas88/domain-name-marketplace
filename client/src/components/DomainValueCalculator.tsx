import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, DollarSign, Zap, Globe, Tag, Copy, ExternalLink, BarChart2 } from "lucide-react";
import { Domain } from "@shared/schema";

// Helper functions for domain analysis
function parseDomain(domainName: string) {
  // Simple parsing to extract name and tld
  const parts = domainName.split(".");
  const tld = parts.length > 1 ? parts[parts.length - 1] : "";
  const name = parts.length > 1 ? parts.slice(0, parts.length - 1).join(".") : domainName;
  return { name, tld };
}

function extractKeywords(domainName: string) {
  // Simple keyword extraction based on common dictionary words
  // In a real application, this would be more sophisticated
  const commonWords = [
    "shop", "store", "buy", "sell", "market", "online", "digital", "web", "app",
    "tech", "cloud", "data", "info", "blog", "news", "media", "social", "video",
    "photo", "travel", "health", "fitness", "food", "sports", "game", "play",
    "learn", "edu", "school", "college", "university", "legal", "law", "finance",
    "money", "bank", "invest", "insurance", "home", "house", "real", "estate",
    "car", "auto", "vehicle", "fashion", "style", "beauty", "pet", "animal",
    "garden", "green", "eco", "art", "design", "creative", "music", "audio"
  ];
  
  // Remove common domain suffixes for better keyword extraction
  const cleanName = domainName.replace(/[-_]/g, " ").toLowerCase();
  
  return commonWords.filter(word => 
    cleanName.includes(word) && 
    // Ensure it's a standalone word, not part of another word
    (cleanName.includes(` ${word} `) || 
     cleanName.startsWith(`${word} `) || 
     cleanName.endsWith(` ${word}`) || 
     cleanName === word)
  );
}

function formatPrice(price: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(price);
}

// AI valuation model function - simulates an AI-based domain valuation
function calculateDomainValue(domain: string, soldDomains: Domain[], allDomains: Domain[]) {
  const parsed = parseDomain(domain);
  let baseValue = 0;
  
  // Base value determined by length
  if (parsed.name.length <= 3) {
    baseValue = 5000; // Very short domains (3 chars or less)
  } else if (parsed.name.length <= 5) {
    baseValue = 2500; // Short domains (4-5 chars)
  } else if (parsed.name.length <= 8) {
    baseValue = 1200; // Medium domains (6-8 chars)
  } else if (parsed.name.length <= 12) {
    baseValue = 800; // Long domains (9-12 chars)
  } else {
    baseValue = 500; // Very long domains (13+ chars)
  }
  
  // TLD value multiplier
  const tldMultiplier = 
    parsed.tld === "com" ? 1.5 : 
    ["io", "ai", "app", "tech", "dev"].includes(parsed.tld) ? 1.2 :
    ["net", "org", "co"].includes(parsed.tld) ? 0.9 :
    0.7; // All other TLDs
  
  // Check how many TLDs are taken with the same name
  // For this simulation, we'll check in the domain data we have
  const availableTLDs = ["com", "net", "org", "io", "co", "app", "ai", "dev"];
  const takenTLDs = availableTLDs.filter(tld => 
    allDomains.some(d => parseDomain(d.name).name === parsed.name && parseDomain(d.name).tld === tld)
  );
  
  // If multiple TLDs are taken, it suggests name has value
  const tldTakenMultiplier = 1 + (takenTLDs.length * 0.15); // Each taken TLD adds 15% value
  
  // Keywords value
  const keywords = extractKeywords(parsed.name);
  const keywordValue = keywords.length * 200; // Each keyword adds fixed value
  
  // Check if it's brandable (arbitrary measure - no dictionary words)
  const isBrandable = keywords.length === 0 && /^[a-z0-9]+$/i.test(parsed.name);
  const brandableMultiplier = isBrandable ? 1.3 : 1.0;
  
  // Similarity to sold domains
  let marketBasedValue = 0;
  let similarSoldDomainsCount = 0;
  
  // Find similar sold domains and their average price
  soldDomains.forEach(soldDomain => {
    const soldParsed = parseDomain(soldDomain.name);
    
    // Check for similarity based on length (within 2 chars)
    const lengthSimilar = Math.abs(parsed.name.length - soldParsed.name.length) <= 2;
    
    // Check for similar keywords
    const soldKeywords = extractKeywords(soldParsed.name);
    const sharedKeywords = keywords.filter(k => soldKeywords.includes(k));
    const keywordSimilar = sharedKeywords.length > 0;
    
    // Check for similar TLD
    const tldSimilar = parsed.tld === soldParsed.tld;
    
    // If domains are similar in at least 2 ways, include in market-based calculation
    if ((lengthSimilar && keywordSimilar) || (lengthSimilar && tldSimilar) || (keywordSimilar && tldSimilar)) {
      marketBasedValue += soldDomain.price;
      similarSoldDomainsCount++;
    }
  });
  
  // Calculate market-based component (if we have similar sold domains)
  let marketMultiplier = 1.0;
  if (similarSoldDomainsCount > 0) {
    const averageSoldPrice = marketBasedValue / similarSoldDomainsCount;
    // Use a weighted average of base calculation and market-based price
    marketMultiplier = 0.5 + (averageSoldPrice / (baseValue * tldMultiplier * brandableMultiplier) * 0.5);
    // Cap the multiplier to avoid extreme values
    marketMultiplier = Math.max(0.5, Math.min(2.0, marketMultiplier));
  }
  
  // Calculate final value
  let finalValue = (baseValue * tldMultiplier * brandableMultiplier * tldTakenMultiplier * marketMultiplier) + keywordValue;
  
  // Round to nearest 10
  finalValue = Math.round(finalValue / 10) * 10;
  
  // Create additional data to display for the valuation
  return {
    value: finalValue,
    factors: {
      length: {
        description: `${parsed.name.length} characters`,
        impact: parsed.name.length <= 5 ? "Very Positive" : 
                parsed.name.length <= 8 ? "Positive" : 
                parsed.name.length <= 12 ? "Neutral" : "Negative",
        score: parsed.name.length <= 3 ? 10 :
               parsed.name.length <= 5 ? 8 :
               parsed.name.length <= 8 ? 6 :
               parsed.name.length <= 12 ? 4 : 2
      },
      tld: {
        description: `.${parsed.tld}`,
        impact: parsed.tld === "com" ? "Very Positive" :
                ["io", "ai", "app"].includes(parsed.tld) ? "Positive" :
                ["net", "org", "co"].includes(parsed.tld) ? "Neutral" : "Slight Negative",
        score: parsed.tld === "com" ? 10 :
               ["io", "ai", "app"].includes(parsed.tld) ? 8 :
               ["net", "org", "co"].includes(parsed.tld) ? 6 : 4
      },
      keywords: {
        description: keywords.length > 0 ? keywords.join(", ") : "None detected",
        impact: keywords.length > 2 ? "Very Positive" :
                keywords.length > 0 ? "Positive" : "Neutral",
        score: keywords.length * 2 + 4
      },
      takenTLDs: {
        description: `${takenTLDs.length} similar TLDs registered`,
        impact: takenTLDs.length > 3 ? "Very Positive" :
                takenTLDs.length > 1 ? "Positive" :
                takenTLDs.length > 0 ? "Neutral" : "Slight Negative",
        score: Math.min(10, takenTLDs.length * 2 + 2)
      },
      marketData: {
        description: `${similarSoldDomainsCount} similar domains sold recently`,
        impact: similarSoldDomainsCount > 5 ? "Strong Market Data" :
                similarSoldDomainsCount > 2 ? "Good Market Data" :
                similarSoldDomainsCount > 0 ? "Limited Market Data" : "No Market Data",
        score: Math.min(10, similarSoldDomainsCount * 2)
      },
      brandability: {
        description: isBrandable ? "Highly brandable" : "Contains common words",
        impact: isBrandable ? "Positive" : "Neutral",
        score: isBrandable ? 8 : 5
      }
    },
    similarSoldDomains: soldDomains
      .filter(soldDomain => {
        const soldParsed = parseDomain(soldDomain.name);
        const lengthSimilar = Math.abs(parsed.name.length - soldParsed.name.length) <= 2;
        const soldKeywords = extractKeywords(soldParsed.name);
        const sharedKeywords = keywords.filter(k => soldKeywords.includes(k));
        const keywordSimilar = sharedKeywords.length > 0;
        const tldSimilar = parsed.tld === soldParsed.tld;
        return (lengthSimilar && keywordSimilar) || (lengthSimilar && tldSimilar) || (keywordSimilar && tldSimilar);
      })
      .slice(0, 6),
    exactMatchDomains: allDomains.filter(d => parseDomain(d.name).name === parsed.name && parseDomain(d.name).tld !== parsed.tld)
  };
}

// Domain card component
interface DomainCardProps {
  domain: Domain;
  isPrimary?: boolean;
}

function DomainCard({ domain, isPrimary = false }: DomainCardProps) {
  const parsedDomain = parseDomain(domain.name);
  
  return (
    <Card className={`overflow-hidden ${isPrimary ? 'border-2 border-black' : ''}`}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="font-bold truncate mr-2">{parsedDomain.name}</div>
          <div className="text-xs bg-gray-100 px-2 py-1 rounded">.{parsedDomain.tld}</div>
        </div>
        
        {domain.category && (
          <div className="mb-2">
            <span className="text-xs px-2 py-1 rounded bg-black text-white">
              {domain.category}
            </span>
          </div>
        )}
        
        {domain.isSold ? (
          <div className="text-green-600 font-bold mt-2">SOLD: {formatPrice(domain.price)}</div>
        ) : (
          <div className="font-bold mt-2">{formatPrice(domain.price)}</div>
        )}
      </CardContent>
    </Card>
  );
}

// Factor Rating Component
interface FactorRatingProps {
  label: string;
  value: number;
  description: string;
  impact: string;
}

function FactorRating({ label, value, description, impact }: FactorRatingProps) {
  // Get color based on impact
  const getImpactColor = (impact: string) => {
    if (impact.includes("Very Positive")) return "text-green-600";
    if (impact.includes("Positive")) return "text-green-500";
    if (impact.includes("Neutral")) return "text-gray-500";
    if (impact.includes("Negative")) return "text-red-500";
    if (impact.includes("Strong")) return "text-green-600";
    if (impact.includes("Good")) return "text-green-500";
    if (impact.includes("Limited")) return "text-gray-500";
    if (impact.includes("No")) return "text-gray-400";
    return "text-gray-500";
  };
  
  return (
    <div className="flex items-center justify-between mb-4">
      <div className="flex-1">
        <div className="font-medium text-sm">{label}</div>
        <div className="text-xs text-gray-500">{description}</div>
      </div>
      <div className="ml-4 text-right">
        <div className={`font-medium ${getImpactColor(impact)}`}>{impact}</div>
        <div className="w-24 h-2 bg-gray-200 rounded-full mt-1 overflow-hidden">
          <div 
            className="h-full bg-black rounded-full" 
            style={{ width: `${value * 10}%` }}
          />
        </div>
      </div>
    </div>
  );
}

// Main component
export default function DomainValueCalculator() {
  const [inputDomain, setInputDomain] = useState("");
  const [currentDomain, setCurrentDomain] = useState<string>("");
  const [valuation, setValuation] = useState<any>(null);
  const [searchPerformed, setSearchPerformed] = useState(false);
  const [activeTab, setActiveTab] = useState("factors");
  
  // Fetch domains from API
  const { data: allDomains = [] } = useQuery<Domain[]>({
    queryKey: ["/api/domains"],
  });
  
  const { data: soldDomains = [] } = useQuery<Domain[]>({
    queryKey: ["/api/domains/recently-sold"],
  });
  
  const handleSearch = () => {
    if (inputDomain.trim()) {
      // Clean input and ensure it has a TLD
      let formattedInput = inputDomain.trim().toLowerCase();
      if (!formattedInput.includes('.')) {
        formattedInput += '.com'; // Default to .com if no TLD specified
      }
      
      setCurrentDomain(formattedInput);
      const valuationResult = calculateDomainValue(formattedInput, soldDomains, allDomains);
      setValuation(valuationResult);
      setSearchPerformed(true);
    }
  };
  
  return (
    <div className="w-full max-w-6xl mx-auto my-12 px-4">
      <div className="text-center mb-10">
        <h2 className="text-3xl font-bold">Domain Value Calculator</h2>
        <p className="text-gray-600 mt-2 max-w-2xl mx-auto">
          Our AI-powered calculator estimates domain value based on key metrics, market data, and comparative analysis
        </p>
      </div>
      
      {/* Search section */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="text-xl flex items-center">
            <DollarSign size={20} className="mr-2 text-gray-500" />
            Calculate Domain Value
          </CardTitle>
          <CardDescription>
            Enter a domain name to get an estimated market value and valuation breakdown
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <div className="flex gap-2">
            <div className="flex-1">
              <Label htmlFor="domain-input" className="sr-only">
                Enter domain name
              </Label>
              <input
                id="domain-input"
                type="text"
                value={inputDomain}
                onChange={(e) => setInputDomain(e.target.value)}
                placeholder="example.com"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              />
            </div>
            <Button onClick={handleSearch} className="bg-black hover:bg-black/80">
              Calculate
            </Button>
          </div>
          
          <div className="mt-4 text-sm text-gray-500">
            <p>
              Our advanced domain valuation tool considers:
            </p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li>Domain length, keywords, and TLD value</li>
              <li>Market data from recently sold domains</li>
              <li>TLD availability analysis for the domain name</li>
              <li>Brandability and commercial potential</li>
            </ul>
          </div>
        </CardContent>
      </Card>
      
      {/* Valuation results */}
      {searchPerformed && valuation && (
        <div className="mb-8">
          <h3 className="text-xl font-bold mb-4">Valuation Results</h3>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main valuation result */}
            <div className="lg:col-span-1">
              <Card className="bg-black text-white">
                <CardContent className="p-6 text-center">
                  <h4 className="text-lg font-medium mb-4">Estimated Value</h4>
                  <div className="text-4xl font-bold mb-2">{formatPrice(valuation.value)}</div>
                  <p className="text-xs text-gray-300">
                    Valuation range: {formatPrice(Math.round(valuation.value * 0.7))} - {formatPrice(Math.round(valuation.value * 1.3))}
                  </p>
                  
                  <div className="mt-6 flex space-x-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="text-xs flex-1 bg-transparent border-white text-white hover:bg-white hover:text-black"
                      onClick={() => navigator.clipboard.writeText(currentDomain)}
                    >
                      <Copy size={14} className="mr-1" /> Copy
                    </Button>
                    
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="text-xs flex-1 bg-transparent border-white text-white hover:bg-white hover:text-black"
                      onClick={() => window.open(`http://${currentDomain}`, '_blank')}
                    >
                      <ExternalLink size={14} className="mr-1" /> Visit
                    </Button>
                  </div>
                </CardContent>
              </Card>
              
              {/* Exact match domains in other TLDs */}
              {valuation.exactMatchDomains.length > 0 && (
                <Card className="mt-4">
                  <CardHeader className="py-3 px-4">
                    <CardTitle className="text-sm font-medium">Related TLDs</CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 pt-0">
                    <div className="text-xs text-gray-500 mb-2">
                      This name is registered in {valuation.exactMatchDomains.length} other TLDs:
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {valuation.exactMatchDomains.map((domain: Domain) => (
                        <div key={domain.id} className="text-xs bg-gray-100 px-2 py-1 rounded">
                          .{parseDomain(domain.name).tld}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
            
            {/* Factor breakdown and similar domains */}
            <div className="lg:col-span-2">
              <Tabs defaultValue="factors" value={activeTab} onValueChange={setActiveTab}>
                <div className="flex justify-between items-center mb-3">
                  <h4 className="font-medium text-gray-500">VALUATION DETAILS</h4>
                  <TabsList>
                    <TabsTrigger value="factors" className="text-xs">
                      <Zap size={14} className="mr-1" /> Factors
                    </TabsTrigger>
                    <TabsTrigger value="market" className="text-xs">
                      <BarChart2 size={14} className="mr-1" /> Market Data
                    </TabsTrigger>
                  </TabsList>
                </div>
                
                <TabsContent value="factors" className="mt-0">
                  <Card>
                    <CardContent className="pt-6">
                      <FactorRating 
                        label="Domain Length" 
                        value={valuation.factors.length.score} 
                        description={valuation.factors.length.description}
                        impact={valuation.factors.length.impact}
                      />
                      <FactorRating 
                        label="TLD Value" 
                        value={valuation.factors.tld.score} 
                        description={valuation.factors.tld.description}
                        impact={valuation.factors.tld.impact}
                      />
                      <FactorRating 
                        label="Keywords" 
                        value={valuation.factors.keywords.score} 
                        description={valuation.factors.keywords.description}
                        impact={valuation.factors.keywords.impact}
                      />
                      <FactorRating 
                        label="TLD Registrations" 
                        value={valuation.factors.takenTLDs.score} 
                        description={valuation.factors.takenTLDs.description}
                        impact={valuation.factors.takenTLDs.impact}
                      />
                      <FactorRating 
                        label="Market Data" 
                        value={valuation.factors.marketData.score} 
                        description={valuation.factors.marketData.description}
                        impact={valuation.factors.marketData.impact}
                      />
                      <FactorRating 
                        label="Brandability" 
                        value={valuation.factors.brandability.score} 
                        description={valuation.factors.brandability.description}
                        impact={valuation.factors.brandability.impact}
                      />
                    </CardContent>
                  </Card>
                </TabsContent>
                
                <TabsContent value="market" className="mt-0">
                  <Card>
                    <CardContent className="pt-6">
                      {valuation.similarSoldDomains.length > 0 ? (
                        <div className="space-y-4">
                          <p className="text-sm text-gray-500 mb-4">
                            The valuation is partially based on these recently sold similar domains:
                          </p>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {valuation.similarSoldDomains.map((domain: Domain) => (
                              <DomainCard key={domain.id} domain={domain} />
                            ))}
                          </div>
                        </div>
                      ) : (
                        <div className="text-center py-6 text-gray-500">
                          <Globe className="mx-auto h-12 w-12 text-gray-300 mb-2" />
                          <p>No similar domains found in our recent sales data</p>
                          <p className="text-xs mt-2">The valuation is based on algorithmic factors only</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>
      )}
      
      {/* Empty state */}
      {!searchPerformed && (
        <div className="text-center border-2 border-dashed border-gray-300 rounded-lg p-12 mt-6">
          <Search size={40} className="mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-700">Enter a domain to calculate value</h3>
          <p className="text-gray-500 max-w-md mx-auto mt-2">
            Get an AI-powered valuation based on domain characteristics and real market data
          </p>
        </div>
      )}
    </div>
  );
}