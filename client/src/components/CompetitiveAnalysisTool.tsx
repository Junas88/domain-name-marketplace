import { useState, useEffect } from "react";
import { Search, TrendingUp, BarChart2, ArrowRight, Copy, ExternalLink } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Domain } from "@shared/schema";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Helper function to extract domain name and TLD
function parseDomain(domain: string) {
  if (!domain) return { name: "", tld: "" };
  
  try {
    const parts = domain.toLowerCase().split(".");
    if (parts.length < 2) return { name: parts[0], tld: "" };
    
    const tld = parts[parts.length - 1];
    const name = parts.slice(0, parts.length - 1).join(".");
    
    return { name, tld };
  } catch (error) {
    return { name: "", tld: "" };
  }
}

// Extract keywords from domain name
function extractKeywords(domainName: string): string[] {
  // Common words to ignore
  const stopWords = ["the", "and", "or", "a", "an", "of", "in", "for", "to", "with", "by", "at", "on"];
  
  // Clean the domain name and split it
  const cleaned = domainName.toLowerCase().replace(/[^a-z0-9]/g, " ");
  const words = cleaned.split(/\s+/).filter(word => word.length > 2 && !stopWords.includes(word));
  
  return words;
}

// Calculate similarity score between two domains (0-100)
function calculateSimilarity(domainA: Domain, domainB: Domain): number {
  const nameA = parseDomain(domainA.name).name;
  const nameB = parseDomain(domainB.name).name;
  
  // Length similarity (the closer in length, the higher the score)
  const lengthDiff = Math.abs(nameA.length - nameB.length);
  const lengthScore = Math.max(0, 100 - (lengthDiff * 10)); // Each character diff reduces score by 10
  
  // TLD similarity
  const tldA = parseDomain(domainA.name).tld;
  const tldB = parseDomain(domainB.name).tld;
  const tldScore = tldA === tldB ? 100 : 0;
  
  // Keyword similarity
  const keywordsA = extractKeywords(nameA);
  const keywordsB = extractKeywords(nameB);
  
  let keywordMatchCount = 0;
  keywordsA.forEach(keyword => {
    if (keywordsB.some(k => k.includes(keyword) || keyword.includes(k))) {
      keywordMatchCount++;
    }
  });
  
  const keywordScore = keywordsA.length > 0 ? 
    Math.min(100, (keywordMatchCount / keywordsA.length) * 100) : 0;
  
  // Category similarity
  const categoryScore = domainA.category === domainB.category ? 100 : 0;
  
  // Combine scores with weights
  return Math.round(
    (lengthScore * 0.3) +  // 30% weight to length
    (tldScore * 0.2) +     // 20% weight to TLD
    (keywordScore * 0.3) + // 30% weight to keywords
    (categoryScore * 0.2)  // 20% weight to category
  );
}

// Find domains with similar characteristics
function findSimilarDomains(
  targetDomain: Domain, 
  allDomains: Domain[], 
  soldDomains: Domain[]
): {similar: Domain[], sold: Domain[]} {
  // Calculate similarity scores for all domains
  const scoredDomains = allDomains
    .filter(domain => domain.id !== targetDomain.id)
    .map(domain => ({
      domain,
      score: calculateSimilarity(targetDomain, domain),
    }))
    .sort((a, b) => b.score - a.score);
  
  // Calculate similarity scores for sold domains
  const scoredSoldDomains = soldDomains
    .map(domain => ({
      domain,
      score: calculateSimilarity(targetDomain, domain),
    }))
    .sort((a, b) => b.score - a.score);
  
  // Return top 3 of each
  return {
    similar: scoredDomains.slice(0, 3).map(item => item.domain),
    sold: scoredSoldDomains.slice(0, 3).map(item => item.domain),
  };
}

// Format price for display
function formatPrice(price: number): string {
  if (price >= 1000000) {
    return `$${(price / 1000000).toFixed(2)}M`;
  } else if (price >= 1000) {
    return `$${(price / 1000).toFixed(1)}K`;
  } else {
    return `$${price}`;
  }
}

// Domain card component for showing domain details
interface DomainCardProps {
  domain: Domain;
  showSimilarityScore?: number;
  isPrimary?: boolean;
}

function DomainCard({ domain, showSimilarityScore, isPrimary = false }: DomainCardProps) {
  const { name, tld } = parseDomain(domain.name);
  
  return (
    <Card className={`${isPrimary ? 'border-2 border-black' : ''}`}>
      <CardHeader className={`${isPrimary ? 'bg-black text-white' : 'bg-gray-50'} pb-3`}>
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg font-bold truncate">{domain.name}</CardTitle>
          {showSimilarityScore !== undefined && (
            <Badge variant={showSimilarityScore > 70 ? "default" : "outline"} className={`${isPrimary ? 'bg-white text-black' : ''}`}>
              {showSimilarityScore}% match
            </Badge>
          )}
        </div>
        <CardDescription className={`${isPrimary ? 'text-gray-300' : 'text-gray-500'}`}>
          {domain.category || 'Unknown category'}
        </CardDescription>
      </CardHeader>
      
      <CardContent className="pt-4">
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Price</span>
            <span className="font-medium">{formatPrice(domain.price)}</span>
          </div>
          
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Length</span>
            <span className="font-medium">{name.length} chars</span>
          </div>
          
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">TLD</span>
            <span className="font-medium">.{tld}</span>
          </div>
          
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Status</span>
            <span className={`font-medium ${domain.isSold ? 'text-green-600' : 'text-blue-600'}`}>
              {domain.isSold ? 'Sold' : 'For Sale'}
            </span>
          </div>
          
          {domain.description && (
            <div className="mt-3 text-sm text-gray-600 border-t pt-2">
              {domain.description.length > 100 
                ? `${domain.description.substring(0, 100)}...` 
                : domain.description}
            </div>
          )}
        </div>
      </CardContent>
      
      {!isPrimary && (
        <CardFooter className="pt-0 flex justify-end">
          <Button variant="ghost" size="sm" className="text-xs">
            View Details <ArrowRight size={12} className="ml-1" />
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}

export default function CompetitiveAnalysisTool() {
  const [inputDomain, setInputDomain] = useState("");
  const [currentDomain, setCurrentDomain] = useState<Domain | null>(null);
  const [searchPerformed, setSearchPerformed] = useState(false);
  const [similarDomains, setSimilarDomains] = useState<Domain[]>([]);
  const [similarSoldDomains, setSimilarSoldDomains] = useState<Domain[]>([]);
  const [activeTab, setActiveTab] = useState("similar");
  
  // Fetch domains data for analysis
  const { data: allDomains = [] } = useQuery<Domain[]>({
    queryKey: ['/api/domains'],
  });
  
  // Fetch recently sold domains
  const { data: soldDomains = [] } = useQuery<Domain[]>({
    queryKey: ['/api/domains/recently-sold'],
  });
  
  // Search for a domain in our database
  const handleSearch = () => {
    if (!inputDomain.trim()) return;
    
    const formattedInput = inputDomain.trim().toLowerCase();
    
    // Look for exact match first
    const exactMatch = allDomains.find(
      domain => domain.name.toLowerCase() === formattedInput
    );
    
    if (exactMatch) {
      setCurrentDomain(exactMatch);
      performCompetitiveAnalysis(exactMatch);
    } else {
      // If no exact match, look for close matches
      const { name } = parseDomain(formattedInput);
      
      const closeMatch = allDomains.find(
        domain => parseDomain(domain.name).name.toLowerCase() === name.toLowerCase()
      );
      
      if (closeMatch) {
        setCurrentDomain(closeMatch);
        performCompetitiveAnalysis(closeMatch);
      } else {
        // Create temporary domain object for analysis
        const tempDomain: Domain = {
          id: -1,
          name: formattedInput,
          description: "",
          price: 0,
          category: "",
          isSold: false,
          viewCount: 0,
          createdAt: new Date(),
          updatedAt: new Date()
        };
        
        setCurrentDomain(tempDomain);
        performCompetitiveAnalysis(tempDomain);
      }
    }
    
    setSearchPerformed(true);
  };
  
  // Perform analysis when a domain is selected
  const performCompetitiveAnalysis = (domain: Domain) => {
    const { similar, sold } = findSimilarDomains(domain, allDomains, soldDomains);
    setSimilarDomains(similar);
    setSimilarSoldDomains(sold);
  };
  
  return (
    <div className="w-full max-w-6xl mx-auto my-12 px-4">
      <div className="text-center mb-10">
        <h2 className="text-3xl font-bold">Domain Competitive Analysis</h2>
        <p className="text-gray-600 mt-2 max-w-2xl mx-auto">
          See how your domain compares to similar domains in our marketplace and recently sold domains
        </p>
      </div>
      
      {/* Search section */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="text-xl flex items-center">
            <Search size={20} className="mr-2 text-gray-500" />
            Analyze Domain
          </CardTitle>
          <CardDescription>
            Enter a domain name to analyze how it compares to similar domains
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
              Analyze
            </Button>
          </div>
          
          <div className="mt-4 text-sm text-gray-500">
            <p>
              Enter any domain to see how it compares to similar domains in the marketplace. This helps you:
            </p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li>Compare your domain to recently sold similar domains</li>
              <li>Understand relative market value based on keywords, length, and other factors</li>
              <li>Find alternative domains with similar characteristics</li>
            </ul>
          </div>
        </CardContent>
      </Card>
      
      {/* Analysis results */}
      {searchPerformed && currentDomain && (
        <div className="mb-8">
          <h3 className="text-xl font-bold mb-4">Analysis Results</h3>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main domain being analyzed */}
            <div className="lg:col-span-1">
              <div className="mb-3">
                <h4 className="font-medium text-gray-500">ANALYZED DOMAIN</h4>
              </div>
              <DomainCard domain={currentDomain} isPrimary={true} />
              
              <div className="mt-4 flex space-x-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="text-xs flex-1"
                  onClick={() => navigator.clipboard.writeText(currentDomain.name)}
                >
                  <Copy size={14} className="mr-1" /> Copy
                </Button>
                
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="text-xs flex-1"
                  onClick={() => window.open(`http://${currentDomain.name}`, '_blank')}
                >
                  <ExternalLink size={14} className="mr-1" /> Visit
                </Button>
              </div>
            </div>
            
            {/* Similar domains and sold domains */}
            <div className="lg:col-span-2">
              <Tabs defaultValue="similar" value={activeTab} onValueChange={setActiveTab}>
                <div className="flex justify-between items-center mb-3">
                  <h4 className="font-medium text-gray-500">DOMAIN COMPARISONS</h4>
                  <TabsList>
                    <TabsTrigger value="similar" className="text-xs">
                      <BarChart2 size={14} className="mr-1" /> Similar Domains
                    </TabsTrigger>
                    <TabsTrigger value="sold" className="text-xs">
                      <TrendingUp size={14} className="mr-1" /> Sold Domains
                    </TabsTrigger>
                  </TabsList>
                </div>
                
                <TabsContent value="similar" className="mt-0">
                  {similarDomains.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {similarDomains.map((domain) => (
                        <DomainCard 
                          key={domain.id} 
                          domain={domain} 
                          showSimilarityScore={calculateSimilarity(currentDomain, domain)}
                        />
                      ))}
                    </div>
                  ) : (
                    <Card className="bg-gray-50">
                      <CardContent className="pt-6 text-center text-gray-500">
                        No similar domains found in our marketplace
                      </CardContent>
                    </Card>
                  )}
                </TabsContent>
                
                <TabsContent value="sold" className="mt-0">
                  {similarSoldDomains.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {similarSoldDomains.map((domain) => (
                        <DomainCard 
                          key={domain.id} 
                          domain={domain} 
                          showSimilarityScore={calculateSimilarity(currentDomain, domain)}
                        />
                      ))}
                    </div>
                  ) : (
                    <Card className="bg-gray-50">
                      <CardContent className="pt-6 text-center text-gray-500">
                        No similar sold domains found in our marketplace
                      </CardContent>
                    </Card>
                  )}
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>
      )}
      
      {/* Analysis insights */}
      {searchPerformed && currentDomain && (similarDomains.length > 0 || similarSoldDomains.length > 0) && (
        <Card className="bg-gray-50">
          <CardHeader>
            <CardTitle className="text-lg">Market Insights</CardTitle>
            <CardDescription>
              Recommendations based on similar domain activity
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <div className="space-y-4">
              {/* Price comparison */}
              {similarSoldDomains.length > 0 && (
                <div>
                  <h4 className="font-medium mb-1">Price Comparison</h4>
                  <p className="text-sm text-gray-600">
                    Similar domains have sold for an average of {formatPrice(
                      Math.round(similarSoldDomains.reduce((sum, domain) => sum + domain.price, 0) / similarSoldDomains.length)
                    )}. {
                      similarSoldDomains[0] && currentDomain.price > 0 ?
                      (currentDomain.price > similarSoldDomains[0].price ? 
                        `Your domain is priced ${Math.round((currentDomain.price / similarSoldDomains[0].price - 1) * 100)}% higher than the most similar sold domain.` :
                        `Your domain is priced ${Math.round((1 - currentDomain.price / similarSoldDomains[0].price) * 100)}% lower than the most similar sold domain.`) :
                      "Consider this when pricing your domain."
                    }
                  </p>
                </div>
              )}
              
              {/* Length analysis */}
              <div>
                <h4 className="font-medium mb-1">Length Analysis</h4>
                <p className="text-sm text-gray-600">
                  {parseDomain(currentDomain.name).name.length < 6 ? 
                    "Your domain is short and concise, which typically commands a premium in the market." :
                    parseDomain(currentDomain.name).name.length < 12 ?
                    "Your domain has a moderate length, which is generally well-received in the market." :
                    "Your domain is relatively long. Shorter domains tend to command higher prices."
                  }
                  {similarDomains.length > 0 && ` The average length of similar domains is ${
                    Math.round(similarDomains.reduce((sum, domain) => sum + parseDomain(domain.name).name.length, 0) / similarDomains.length)
                  } characters.`}
                </p>
              </div>
              
              {/* TLD analysis */}
              <div>
                <h4 className="font-medium mb-1">TLD Insights</h4>
                <p className="text-sm text-gray-600">
                  Your domain uses a .{parseDomain(currentDomain.name).tld} TLD. 
                  {parseDomain(currentDomain.name).tld === "com" ? 
                    " The .com TLD is the most recognized and typically commands the highest value." :
                    parseDomain(currentDomain.name).tld === "io" || parseDomain(currentDomain.name).tld === "ai" ?
                    ` The .${parseDomain(currentDomain.name).tld} TLD is popular for tech and AI companies and commands a premium in those industries.` :
                    ` While .${parseDomain(currentDomain.name).tld} TLDs can be effective, .com domains generally command higher prices in the market.`
                  }
                </p>
              </div>
              
              {/* Keyword analysis */}
              {extractKeywords(parseDomain(currentDomain.name).name).length > 0 && (
                <div>
                  <h4 className="font-medium mb-1">Keyword Analysis</h4>
                  <p className="text-sm text-gray-600">
                    Your domain contains the following keywords: {extractKeywords(parseDomain(currentDomain.name).name).join(", ")}.
                    {currentDomain.category ? 
                      ` These align with the ${currentDomain.category} category.` : 
                      " Consider how these keywords align with your intended use."
                    }
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* Empty state */}
      {!searchPerformed && (
        <div className="text-center border-2 border-dashed border-gray-300 rounded-lg p-12 mt-6">
          <Search size={40} className="mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-700">Enter a domain to analyze</h3>
          <p className="text-gray-500 max-w-md mx-auto mt-2">
            Get detailed comparisons with similar domains in our marketplace to understand competitive positioning
          </p>
        </div>
      )}
    </div>
  );
}