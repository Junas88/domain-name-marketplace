import { useState, useEffect } from "react";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { CheckIcon, XIcon } from "lucide-react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

// Define types for the domain valuation factors
type TldValuesType = {
  [key: string]: number;
};

type KeywordCategoryType = {
  value: number;
  examples: string[];
};

type KeywordCategoriesType = {
  [key: string]: KeywordCategoryType;
};

// Domain valuation factors data
const tldValues: TldValuesType = {
  "com": 100,
  "net": 70,
  "org": 65,
  "io": 75,
  "ai": 90,
  "app": 65,
  "co": 60,
  "dev": 50,
  "xyz": 30,
  "info": 25,
  "biz": 20,
  "others": 15
};

const keywordCategories: KeywordCategoriesType = {
  "tech": { value: 100, examples: ["tech", "digital", "cyber", "code", "data"] },
  "business": { value: 90, examples: ["business", "corp", "inc", "group", "consult"] },
  "health": { value: 85, examples: ["health", "medical", "wellness", "care", "fit"] },
  "finance": { value: 95, examples: ["finance", "bank", "invest", "money", "wealth"] },
  "education": { value: 75, examples: ["learn", "edu", "academy", "school", "course"] },
  "ecommerce": { value: 85, examples: ["shop", "store", "buy", "sell", "market"] },
  "travel": { value: 70, examples: ["travel", "tour", "trip", "vacation", "journey"] },
  "food": { value: 65, examples: ["food", "recipe", "cook", "meal", "kitchen"] },
  "entertainment": { value: 80, examples: ["entertainment", "game", "play", "fun", "media"] },
  "real estate": { value: 85, examples: ["realty", "home", "property", "estate", "house"] },
  "generic": { value: 40, examples: ["online", "web", "site", "page", "portal"] }
};

export default function DomainValueCalculator() {
  // State for all the calculator parameters
  const [selectedTld, setSelectedTld] = useState("com");
  const [domainLength, setDomainLength] = useState(10);
  const [keywordCategory, setKeywordCategory] = useState("tech");
  const [isDomainTaken, setIsDomainTaken] = useState(false);
  const [domainAge, setDomainAge] = useState(0);
  const [estimatedValue, setEstimatedValue] = useState({ min: 0, max: 0 });
  const [inputDomain, setInputDomain] = useState("");
  const [analyzedDomain, setAnalyzedDomain] = useState({ name: "", tld: "" });

  // Calculate the domain value based on selected parameters
  useEffect(() => {
    calculateDomainValue();
  }, [selectedTld, domainLength, keywordCategory, isDomainTaken, domainAge]);

  // Parse a domain input into name and TLD
  const parseDomain = (input: string) => {
    if (!input) return { name: "", tld: "" };
    
    const parts = input.toLowerCase().split(".");
    if (parts.length < 2) return { name: parts[0], tld: "" };
    
    const tld = parts[parts.length - 1];
    const name = parts.slice(0, parts.length - 1).join(".");
    
    return { name, tld };
  };

  // Analyze a domain and set calculator parameters
  const analyzeDomain = () => {
    const { name, tld } = parseDomain(inputDomain);
    
    if (!name || !tld) {
      alert("Please enter a valid domain (e.g., example.com)");
      return;
    }
    
    setAnalyzedDomain({ name, tld });
    
    // Set TLD
    setSelectedTld(tldValues[tld] ? tld : "others");
    
    // Set domain length
    setDomainLength(name.length);
    
    // Try to guess keyword category
    let detectedCategory = "generic";
    for (const [category, data] of Object.entries(keywordCategories)) {
      for (const keyword of data.examples) {
        if (name.includes(keyword)) {
          detectedCategory = category;
          break;
        }
      }
    }
    setKeywordCategory(detectedCategory);
    
    // Reset other parameters
    setIsDomainTaken(false);
    setDomainAge(0);
    
    calculateDomainValue();
  };

  // Calculate domain value based on all factors
  const calculateDomainValue = () => {
    // Base value from TLD
    const tldFactor = tldValues[selectedTld] || tldValues.others;
    
    // Length factor - shorter domains are more valuable
    // 1-3 chars: premium, 4-6: excellent, 7-10: good, 11+: average
    let lengthFactor = 0;
    if (domainLength <= 3) lengthFactor = 100;
    else if (domainLength <= 6) lengthFactor = 85;
    else if (domainLength <= 10) lengthFactor = 70;
    else if (domainLength <= 15) lengthFactor = 40;
    else lengthFactor = 20;
    
    // Keyword value
    const keywordFactor = keywordCategories[keywordCategory]?.value || keywordCategories.generic.value;
    
    // Domain status and age factors
    const takenFactor = isDomainTaken ? 0.5 : 1; // Reduce value by 50% if taken
    const ageFactor = 1 + (domainAge * 0.05); // 5% increase in value per year of age
    
    // Calculate base value
    const baseValue = ((tldFactor + lengthFactor + keywordFactor) / 3) * takenFactor * ageFactor;
    
    // Create a range (+/- 20%)
    const minValue = Math.round(baseValue * 0.8);
    const maxValue = Math.round(baseValue * 1.2);
    
    // Convert to dollar value (scaled)
    const scaleFactor = 50; // $50 per point
    setEstimatedValue({
      min: minValue * scaleFactor,
      max: maxValue * scaleFactor
    });
  };

  return (
    <div className="w-full max-w-6xl mx-auto my-12 px-4">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold">Domain Value Calculator</h2>
        <p className="text-gray-600 mt-2">
          See how different factors affect domain value in the marketplace
        </p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left side - Input parameters */}
        <Card>
          <CardHeader>
            <CardTitle>Domain Factors</CardTitle>
            <CardDescription>
              Adjust the factors below to see how they affect domain valuation
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* Quick analysis of an existing domain */}
            <div className="mb-8">
              <Label htmlFor="domain-input" className="block mb-2">
                Analyze a Domain
              </Label>
              <div className="flex gap-2">
                <input
                  id="domain-input"
                  type="text"
                  value={inputDomain}
                  onChange={(e) => setInputDomain(e.target.value)}
                  placeholder="example.com"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                />
                <Button onClick={analyzeDomain}>Analyze</Button>
              </div>
              {analyzedDomain.name && (
                <div className="mt-2 text-sm text-gray-600">
                  Analyzing: <span className="font-bold">{analyzedDomain.name}</span> with TLD <span className="font-bold">.{analyzedDomain.tld}</span>
                </div>
              )}
            </div>
            
            {/* Domain Length */}
            <div className="mb-6">
              <div className="flex justify-between mb-2">
                <Label htmlFor="domain-length">Domain Length: {domainLength} characters</Label>
              </div>
              <Slider
                id="domain-length"
                min={1}
                max={20}
                step={1}
                value={[domainLength]}
                onValueChange={(value) => setDomainLength(value[0])}
                className="my-4"
              />
              <div className="flex justify-between text-xs text-gray-500">
                <span>Premium (1-3)</span>
                <span>Good (7-10)</span>
                <span>Long (15+)</span>
              </div>
            </div>
            
            {/* TLD Selection */}
            <div className="mb-6">
              <Label htmlFor="tld-selection" className="block mb-2">
                Top Level Domain (TLD)
              </Label>
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 mt-1">
                {Object.keys(tldValues).map((tld) => (
                  <Button
                    key={tld}
                    type="button"
                    variant={selectedTld === tld ? "default" : "outline"}
                    className={`${selectedTld === tld ? "bg-black text-white" : ""}`}
                    onClick={() => setSelectedTld(tld)}
                  >
                    .{tld}
                  </Button>
                ))}
              </div>
            </div>
            
            {/* Keyword Category */}
            <div className="mb-6">
              <Label htmlFor="keyword-category" className="block mb-2">
                Keyword Category
              </Label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-1">
                {Object.keys(keywordCategories).map((category) => (
                  <Button
                    key={category}
                    type="button"
                    variant={keywordCategory === category ? "default" : "outline"}
                    className={`${keywordCategory === category ? "bg-black text-white" : ""}`}
                    onClick={() => setKeywordCategory(category)}
                  >
                    {category.charAt(0).toUpperCase() + category.slice(1)}
                  </Button>
                ))}
              </div>
              <div className="mt-2 text-sm text-gray-500">
                Example keywords: {keywordCategories[keywordCategory].examples.join(", ")}
              </div>
            </div>
            
            {/* Domain Status */}
            <div className="mb-6">
              <Label className="block mb-2">Domain Status</Label>
              <RadioGroup value={isDomainTaken ? "taken" : "available"} onValueChange={(value) => setIsDomainTaken(value === "taken")}>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="available" id="available" />
                  <Label htmlFor="available" className="flex items-center">
                    <CheckIcon size={16} className="mr-1 text-green-500" /> Available
                  </Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="taken" id="taken" />
                  <Label htmlFor="taken" className="flex items-center">
                    <XIcon size={16} className="mr-1 text-red-500" /> Taken (reduces value)
                  </Label>
                </div>
              </RadioGroup>
            </div>
            
            {/* Domain Age */}
            <div className="mb-6">
              <div className="flex justify-between mb-2">
                <Label htmlFor="domain-age">Domain Age: {domainAge} years</Label>
              </div>
              <Slider
                id="domain-age"
                min={0}
                max={20}
                step={1}
                value={[domainAge]}
                onValueChange={(value) => setDomainAge(value[0])}
                className="my-4"
              />
              <div className="text-xs text-gray-500">
                Older domains typically have higher value
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Right side - Results and visualization */}
        <Card>
          <CardHeader>
            <CardTitle>Estimated Domain Value</CardTitle>
            <CardDescription>
              Based on the factors you've selected
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* Estimated Value Display */}
            <div className="mb-8 text-center">
              <div className="text-5xl font-bold mb-4">
                ${estimatedValue.min.toLocaleString()} - ${estimatedValue.max.toLocaleString()}
              </div>
              <p className="text-sm text-gray-600">
                This is an estimated market value range based on selected factors
              </p>
            </div>
            
            {/* Value Factors Breakdown */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold mb-4">Value Factors Breakdown</h3>
              
              <div className="space-y-4">
                {/* TLD Impact */}
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium">TLD Value (.{selectedTld})</span>
                    <span className="text-sm font-medium">{tldValues[selectedTld] || tldValues.others}/100</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-black rounded-full h-2" 
                      style={{ width: `${tldValues[selectedTld] || tldValues.others}%` }}
                    ></div>
                  </div>
                </div>
                
                {/* Length Impact */}
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium">Length Value ({domainLength} chars)</span>
                    <span className="text-sm font-medium">
                      {domainLength <= 3 ? 100 : 
                       domainLength <= 6 ? 85 : 
                       domainLength <= 10 ? 70 : 
                       domainLength <= 15 ? 40 : 20}/100
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-black rounded-full h-2" 
                      style={{ 
                        width: `${domainLength <= 3 ? 100 : 
                                domainLength <= 6 ? 85 : 
                                domainLength <= 10 ? 70 : 
                                domainLength <= 15 ? 40 : 20}%` 
                      }}
                    ></div>
                  </div>
                </div>
                
                {/* Keyword Impact */}
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium">Keyword Value ({keywordCategory})</span>
                    <span className="text-sm font-medium">{keywordCategories[keywordCategory]?.value || 40}/100</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-black rounded-full h-2" 
                      style={{ width: `${keywordCategories[keywordCategory]?.value || 40}%` }}
                    ></div>
                  </div>
                </div>
                
                {/* Status Impact */}
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium">Status Factor</span>
                    <span className="text-sm font-medium">{isDomainTaken ? "-50%" : "+0%"}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`${isDomainTaken ? "bg-red-500" : "bg-green-500"} rounded-full h-2`} 
                      style={{ width: isDomainTaken ? "50%" : "100%" }}
                    ></div>
                  </div>
                </div>
                
                {/* Age Impact */}
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium">Age Factor ({domainAge} years)</span>
                    <span className="text-sm font-medium">+{domainAge * 5}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-500 rounded-full h-2" 
                      style={{ width: `${Math.min(100, 20 + domainAge * 4)}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Value Tips */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-md font-semibold mb-2">Domain Value Tips</h3>
              <ul className="text-sm space-y-2 text-gray-700">
                <li>• Premium domains (.com) with 3-6 characters from high-value categories like finance or tech command the highest prices</li>
                <li>• Domains with brandable, memorable names are more valuable than generic ones</li>
                <li>• Domain age adds credibility and value due to existing backlinks and history</li>
                <li>• Single-word domains are considered premium and often sell for 6+ figures</li>
                <li>• 2-3 letter .com domains are extremely valuable due to their scarcity</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}