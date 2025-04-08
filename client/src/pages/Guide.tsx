import Header from "@/components/Header";
import Footer from "@/components/Footer";
import EbookPurchaseButton from "@/components/EbookPurchaseButton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  TrendingUp, 
  DollarSign, 
  Search, 
  Shield, 
  BarChart3, 
  Lightbulb, 
  Clock, 
  Hash,
  Award,
  Briefcase,
  AlertCircle,
  CheckSquare
} from "lucide-react";

export default function Guide() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1">
        {/* Hero section */}
        <section className="py-12 md:py-16 lg:py-20 bg-black text-white">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto text-center">
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
                Domain Name Guide
              </h1>
              <p className="text-lg md:text-xl opacity-90 mb-8">
                Expert insights and strategies for buying, valuing, and selling domain names
              </p>
            </div>
          </div>
        </section>

        {/* Tabs section */}
        <section className="py-12 bg-white">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <Tabs defaultValue="buying" className="max-w-5xl mx-auto">
              <TabsList className="grid w-full grid-cols-1 md:grid-cols-5">
                <TabsTrigger value="buying">Buying Guide</TabsTrigger>
                <TabsTrigger value="value">Value Factors</TabsTrigger>
                <TabsTrigger value="trends">Market Trends</TabsTrigger>
                <TabsTrigger value="investment">Domain Tips</TabsTrigger>
                <TabsTrigger value="selling">Selling Strategy</TabsTrigger>
              </TabsList>

              {/* Buying Guide Tab */}
              <TabsContent value="buying" className="mt-6">
                <div className="border border-black p-6 rounded-sm">
                  <h2 className="text-2xl font-bold mb-6 flex items-center">
                    <DollarSign className="mr-2 h-6 w-6" />
                    How to Buy Domain Names
                  </h2>
                  
                  <div className="space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="border border-gray-200 p-5 rounded-sm">
                        <h3 className="text-lg font-semibold mb-3 flex items-center">
                          <Search className="mr-2 h-5 w-5 text-gray-700" />
                          Research Before Buying
                        </h3>
                        <ul className="space-y-2 text-gray-700">
                          <li>• Check domain history using WHOIS tools</li>
                          <li>• Verify trademark issues with USPTO database</li>
                          <li>• Research search volume and keyword potential</li>
                          <li>• Analyze competing domains in the same niche</li>
                        </ul>
                      </div>

                      <div className="border border-gray-200 p-5 rounded-sm">
                        <h3 className="text-lg font-semibold mb-3 flex items-center">
                          <Shield className="mr-2 h-5 w-5 text-gray-700" />
                          Safe Purchase Methods
                        </h3>
                        <ul className="space-y-2 text-gray-700">
                          <li>• Use reputable escrow services for high-value domains</li>
                          <li>• Verify seller identity through marketplace ratings</li>
                          <li>• Get all agreements in writing before payment</li>
                          <li>• Consider legal review for premium domains</li>
                        </ul>
                      </div>
                    </div>

                    <div className="border border-gray-200 p-5 rounded-sm">
                      <h3 className="text-lg font-semibold mb-4">Domain Acquisition Checklist</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <p className="font-medium mb-2">Before Purchase:</p>
                          <ul className="space-y-1 text-gray-700">
                            <li className="flex items-start">
                              <CheckSquare className="mr-2 h-4 w-4 text-green-600 mt-1 flex-shrink-0" />
                              <span>Verify domain is free of legal issues</span>
                            </li>
                            <li className="flex items-start">
                              <CheckSquare className="mr-2 h-4 w-4 text-green-600 mt-1 flex-shrink-0" />
                              <span>Check domain history and previous usage</span>
                            </li>
                            <li className="flex items-start">
                              <CheckSquare className="mr-2 h-4 w-4 text-green-600 mt-1 flex-shrink-0" />
                              <span>Compare pricing across multiple platforms</span>
                            </li>
                            <li className="flex items-start">
                              <CheckSquare className="mr-2 h-4 w-4 text-green-600 mt-1 flex-shrink-0" />
                              <span>Evaluate SEO value and backlink profile</span>
                            </li>
                          </ul>
                        </div>
                        <div>
                          <p className="font-medium mb-2">After Purchase:</p>
                          <ul className="space-y-1 text-gray-700">
                            <li className="flex items-start">
                              <CheckSquare className="mr-2 h-4 w-4 text-green-600 mt-1 flex-shrink-0" />
                              <span>Secure domain with registrar lock</span>
                            </li>
                            <li className="flex items-start">
                              <CheckSquare className="mr-2 h-4 w-4 text-green-600 mt-1 flex-shrink-0" />
                              <span>Set up auto-renewal to prevent expiration</span>
                            </li>
                            <li className="flex items-start">
                              <CheckSquare className="mr-2 h-4 w-4 text-green-600 mt-1 flex-shrink-0" />
                              <span>Implement WHOIS privacy protection</span>
                            </li>
                            <li className="flex items-start">
                              <CheckSquare className="mr-2 h-4 w-4 text-green-600 mt-1 flex-shrink-0" />
                              <span>Create a development or landing page</span>
                            </li>
                          </ul>
                        </div>
                      </div>
                    </div>

                    <div className="border-t border-gray-200 pt-6">
                      <h3 className="text-lg font-semibold mb-4">Expert Tip</h3>
                      <div className="bg-gray-50 p-4 border-l-4 border-black">
                        <p className="italic text-gray-700">
                          "When negotiating for premium domains, always start with a reasonable offer backed by market research. Sellers respect informed buyers, and you're more likely to reach a favorable agreement when you demonstrate domain knowledge."
                        </p>
                        <p className="mt-2 text-sm font-medium">— Domain Investment Expert, TakeMyName</p>
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>

              {/* Value Factors Tab */}
              <TabsContent value="value" className="mt-6">
                <div className="border border-black p-6 rounded-sm">
                  <h2 className="text-2xl font-bold mb-6 flex items-center">
                    <BarChart3 className="mr-2 h-6 w-6" />
                    What Makes Domains Valuable
                  </h2>
                  
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="border border-gray-200 p-5 rounded-sm">
                        <h3 className="text-lg font-semibold mb-3">Length & Memorability</h3>
                        <ul className="space-y-2 text-gray-700">
                          <li>• Shorter domains (4-6 characters) command premium prices</li>
                          <li>• Easy to spell and pronounce increases value</li>
                          <li>• Memorable phrases or words have higher retention</li>
                          <li>• Avoid hyphens and numbers when possible</li>
                        </ul>
                      </div>

                      <div className="border border-gray-200 p-5 rounded-sm">
                        <h3 className="text-lg font-semibold mb-3">TLD & Extension</h3>
                        <ul className="space-y-2 text-gray-700">
                          <li>• .com remains most valuable (3-10x other TLDs)</li>
                          <li>• Country-specific TLDs valuable for local markets</li>
                          <li>• Industry-specific TLDs gaining value (.ai, .io)</li>
                          <li>• Premium domains retain value across extensions</li>
                        </ul>
                      </div>

                      <div className="border border-gray-200 p-5 rounded-sm">
                        <h3 className="text-lg font-semibold mb-3">Commercial Potential</h3>
                        <ul className="space-y-2 text-gray-700">
                          <li>• Domains with commercial intent worth more</li>
                          <li>• High consumer search volume increases value</li>
                          <li>• Growing industry relevance drives premiums</li>
                          <li>• Brandable domains command higher prices</li>
                        </ul>
                      </div>
                    </div>

                    <div className="mt-8">
                      <h3 className="text-xl font-semibold mb-4">Value Multipliers</h3>
                      <div className="overflow-x-auto">
                        <table className="min-w-full border border-gray-200">
                          <thead>
                            <tr className="bg-gray-50">
                              <th className="py-3 px-4 border-b text-left">Factor</th>
                              <th className="py-3 px-4 border-b text-left">Impact Level</th>
                              <th className="py-3 px-4 border-b text-left">Value Increase</th>
                              <th className="py-3 px-4 border-b text-left">Considerations</th>
                            </tr>
                          </thead>
                          <tbody>
                            <tr>
                              <td className="py-3 px-4 border-b font-medium">Dictionary Word</td>
                              <td className="py-3 px-4 border-b">Very High</td>
                              <td className="py-3 px-4 border-b">5-10x</td>
                              <td className="py-3 px-4 border-b">Single, common English words highest value</td>
                            </tr>
                            <tr className="bg-gray-50">
                              <td className="py-3 px-4 border-b font-medium">Exact Match (EMD)</td>
                              <td className="py-3 px-4 border-b">High</td>
                              <td className="py-3 px-4 border-b">3-7x</td>
                              <td className="py-3 px-4 border-b">Keywords with high search volume & CPC</td>
                            </tr>
                            <tr>
                              <td className="py-3 px-4 border-b font-medium">Existing Traffic</td>
                              <td className="py-3 px-4 border-b">High</td>
                              <td className="py-3 px-4 border-b">2-5x</td>
                              <td className="py-3 px-4 border-b">Domain with established organic traffic</td>
                            </tr>
                            <tr className="bg-gray-50">
                              <td className="py-3 px-4 border-b font-medium">Backlink Profile</td>
                              <td className="py-3 px-4 border-b">Medium</td>
                              <td className="py-3 px-4 border-b">1.5-3x</td>
                              <td className="py-3 px-4 border-b">Quality over quantity in links</td>
                            </tr>
                            <tr>
                              <td className="py-3 px-4 border-b font-medium">Domain Age</td>
                              <td className="py-3 px-4 border-b">Low-Medium</td>
                              <td className="py-3 px-4 border-b">1.2-2x</td>
                              <td className="py-3 px-4 border-b">Older domains may have SEO advantages</td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>

              {/* Market Trends Tab */}
              <TabsContent value="trends" className="mt-6">
                <div className="border border-black p-6 rounded-sm">
                  <h2 className="text-2xl font-bold mb-6 flex items-center">
                    <TrendingUp className="mr-2 h-6 w-6" />
                    Current Domain Market Trends
                  </h2>
                  
                  <div className="space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="border border-gray-200 p-5 rounded-sm">
                        <h3 className="text-lg font-semibold mb-3">Hot Domain Categories (2025)</h3>
                        <ul className="space-y-2 text-gray-700">
                          <li className="flex items-start">
                            <TrendingUp className="mr-2 h-4 w-4 text-green-600 mt-1" />
                            <span><strong>AI & Machine Learning:</strong> .ai domains seeing 300%+ growth</span>
                          </li>
                          <li className="flex items-start">
                            <TrendingUp className="mr-2 h-4 w-4 text-green-600 mt-1" />
                            <span><strong>Sustainability:</strong> Eco-friendly & climate domains rising</span>
                          </li>
                          <li className="flex items-start">
                            <TrendingUp className="mr-2 h-4 w-4 text-green-600 mt-1" />
                            <span><strong>Digital Health:</strong> Telemedicine & health tech domains surging</span>
                          </li>
                          <li className="flex items-start">
                            <TrendingUp className="mr-2 h-4 w-4 text-green-600 mt-1" />
                            <span><strong>Metaverse:</strong> Virtual reality & digital world domains in demand</span>
                          </li>
                        </ul>
                      </div>

                      <div className="border border-gray-200 p-5 rounded-sm">
                        <h3 className="text-lg font-semibold mb-3">Emerging TLD Trends</h3>
                        <ul className="space-y-2 text-gray-700">
                          <li className="flex items-start">
                            <Hash className="mr-2 h-4 w-4 text-blue-600 mt-1" />
                            <span><strong>.AI:</strong> Premium prices for AI-related businesses</span>
                          </li>
                          <li className="flex items-start">
                            <Hash className="mr-2 h-4 w-4 text-blue-600 mt-1" />
                            <span><strong>.APP:</strong> Growing for mobile application businesses</span>
                          </li>
                          <li className="flex items-start">
                            <Hash className="mr-2 h-4 w-4 text-blue-600 mt-1" />
                            <span><strong>.IO:</strong> Still dominant for tech startups</span>
                          </li>
                          <li className="flex items-start">
                            <Hash className="mr-2 h-4 w-4 text-blue-600 mt-1" />
                            <span><strong>.CO:</strong> Increasingly accepted as .COM alternative</span>
                          </li>
                        </ul>
                      </div>
                    </div>

                    <div className="border border-gray-200 p-5 rounded-sm">
                      <h3 className="text-lg font-semibold mb-4">Market Shifts: What's Changing</h3>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <p className="font-medium mb-2">Growing Trends:</p>
                          <ul className="space-y-2 text-gray-700">
                            <li className="flex items-start">
                              <Lightbulb className="mr-2 h-4 w-4 text-amber-500 mt-1" />
                              <span>Short, pronounceable made-up words (brandables)</span>
                            </li>
                            <li className="flex items-start">
                              <Lightbulb className="mr-2 h-4 w-4 text-amber-500 mt-1" />
                              <span>Two-letter domains reaching new premium levels</span>
                            </li>
                            <li className="flex items-start">
                              <Lightbulb className="mr-2 h-4 w-4 text-amber-500 mt-1" />
                              <span>Industry-specific TLDs gaining mainstream acceptance</span>
                            </li>
                            <li className="flex items-start">
                              <Lightbulb className="mr-2 h-4 w-4 text-amber-500 mt-1" />
                              <span>Voice-search friendly domain names</span>
                            </li>
                          </ul>
                        </div>
                        <div>
                          <p className="font-medium mb-2">Declining Trends:</p>
                          <ul className="space-y-2 text-gray-700">
                            <li className="flex items-start">
                              <AlertCircle className="mr-2 h-4 w-4 text-red-500 mt-1" />
                              <span>Hyphenated domains continuing to lose value</span>
                            </li>
                            <li className="flex items-start">
                              <AlertCircle className="mr-2 h-4 w-4 text-red-500 mt-1" />
                              <span>Number-containing domains (unless numeric-only)</span>
                            </li>
                            <li className="flex items-start">
                              <AlertCircle className="mr-2 h-4 w-4 text-red-500 mt-1" />
                              <span>Extremely long domains (over 15 characters)</span>
                            </li>
                            <li className="flex items-start">
                              <AlertCircle className="mr-2 h-4 w-4 text-red-500 mt-1" />
                              <span>Obscure TLDs with limited recognition</span>
                            </li>
                          </ul>
                        </div>
                      </div>
                    </div>

                    <div className="mt-4">
                      <h3 className="text-lg font-semibold mb-4">Recent Notable Sales (2025)</h3>
                      <div className="overflow-x-auto">
                        <table className="min-w-full border border-gray-200">
                          <thead>
                            <tr className="bg-gray-50">
                              <th className="py-3 px-4 border-b text-left">Domain</th>
                              <th className="py-3 px-4 border-b text-left">Sale Price</th>
                              <th className="py-3 px-4 border-b text-left">Category</th>
                              <th className="py-3 px-4 border-b text-left">Market Impact</th>
                            </tr>
                          </thead>
                          <tbody>
                            <tr>
                              <td className="py-3 px-4 border-b font-medium">ai.com</td>
                              <td className="py-3 px-4 border-b">$15.2 million</td>
                              <td className="py-3 px-4 border-b">AI/Technology</td>
                              <td className="py-3 px-4 border-b">Set new benchmark for AI domains</td>
                            </tr>
                            <tr className="bg-gray-50">
                              <td className="py-3 px-4 border-b font-medium">climate.com</td>
                              <td className="py-3 px-4 border-b">$7.8 million</td>
                              <td className="py-3 px-4 border-b">Environment</td>
                              <td className="py-3 px-4 border-b">Highlighted sustainability trend</td>
                            </tr>
                            <tr>
                              <td className="py-3 px-4 border-b font-medium">vr.ai</td>
                              <td className="py-3 px-4 border-b">$3.2 million</td>
                              <td className="py-3 px-4 border-b">VR/Metaverse</td>
                              <td className="py-3 px-4 border-b">Combined emerging tech trends</td>
                            </tr>
                            <tr className="bg-gray-50">
                              <td className="py-3 px-4 border-b font-medium">health.app</td>
                              <td className="py-3 px-4 border-b">$2.5 million</td>
                              <td className="py-3 px-4 border-b">Healthcare</td>
                              <td className="py-3 px-4 border-b">Non-.com premium benchmark</td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>

              {/* Investment Tips Tab */}
              <TabsContent value="investment" className="mt-6">
                <div className="border border-black p-6 rounded-sm">
                  <h2 className="text-2xl font-bold mb-6 flex items-center">
                    <Briefcase className="mr-2 h-6 w-6" />
                    Domain Management Tips
                  </h2>
                  
                  <div className="space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="border border-gray-200 p-5 rounded-sm">
                        <h3 className="text-lg font-semibold mb-3">Domain Diversification</h3>
                        <ul className="space-y-2 text-gray-700">
                          <li className="flex items-start">
                            <Award className="mr-2 h-4 w-4 text-purple-600 mt-1" />
                            <span><strong>Premium:</strong> Allocate 20-30% to higher-cost, blue-chip domains</span>
                          </li>
                          <li className="flex items-start">
                            <Award className="mr-2 h-4 w-4 text-purple-600 mt-1" />
                            <span><strong>Mid-range:</strong> 40-50% for moderate-priced growing niches</span>
                          </li>
                          <li className="flex items-start">
                            <Award className="mr-2 h-4 w-4 text-purple-600 mt-1" />
                            <span><strong>Speculative:</strong> 20-30% for emerging trends & technologies</span>
                          </li>
                          <li className="flex items-start">
                            <Award className="mr-2 h-4 w-4 text-purple-600 mt-1" />
                            <span><strong>TLD Mix:</strong> 60-70% .com, remainder across strategic TLDs</span>
                          </li>
                        </ul>
                      </div>

                      <div className="border border-gray-200 p-5 rounded-sm">
                        <h3 className="text-lg font-semibold mb-3">Domain Timeframes</h3>
                        <ul className="space-y-2 text-gray-700">
                          <li className="flex items-start">
                            <Clock className="mr-2 h-4 w-4 text-blue-600 mt-1" />
                            <span><strong>Short-term (1-3 months):</strong> Auction/marketplace arbitrage</span>
                          </li>
                          <li className="flex items-start">
                            <Clock className="mr-2 h-4 w-4 text-blue-600 mt-1" />
                            <span><strong>Medium-term (6-18 months):</strong> Trend-based acquisitions</span>
                          </li>
                          <li className="flex items-start">
                            <Clock className="mr-2 h-4 w-4 text-blue-600 mt-1" />
                            <span><strong>Long-term (2-10+ years):</strong> Premium evergreen domains</span>
                          </li>
                          <li className="flex items-start">
                            <Clock className="mr-2 h-4 w-4 text-blue-600 mt-1" />
                            <span><strong>Development approach:</strong> Partial development adds 30-50% value</span>
                          </li>
                        </ul>
                      </div>
                    </div>

                    <div className="border border-gray-200 p-5 rounded-sm">
                      <h3 className="text-lg font-semibold mb-4">Risk Management For Domain Owners</h3>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <p className="font-medium mb-2">DO:</p>
                          <ul className="space-y-2 text-gray-700">
                            <li className="flex items-start">
                              <CheckSquare className="mr-2 h-4 w-4 text-green-600 mt-1" />
                              <span>Set a clear budget for domain acquisitions</span>
                            </li>
                            <li className="flex items-start">
                              <CheckSquare className="mr-2 h-4 w-4 text-green-600 mt-1" />
                              <span>Research domain history to avoid legal issues</span>
                            </li>
                            <li className="flex items-start">
                              <CheckSquare className="mr-2 h-4 w-4 text-green-600 mt-1" />
                              <span>Track holding costs (renewal fees) across your portfolio</span>
                            </li>
                            <li className="flex items-start">
                              <CheckSquare className="mr-2 h-4 w-4 text-green-600 mt-1" />
                              <span>Document all transactions and development expenses</span>
                            </li>
                            <li className="flex items-start">
                              <CheckSquare className="mr-2 h-4 w-4 text-green-600 mt-1" />
                              <span>Develop a consistent valuation methodology</span>
                            </li>
                          </ul>
                        </div>
                        <div>
                          <p className="font-medium mb-2">DON'T:</p>
                          <ul className="space-y-2 text-gray-700">
                            <li className="flex items-start">
                              <AlertCircle className="mr-2 h-4 w-4 text-red-500 mt-1" />
                              <span>Invest money you can't afford to have tied up long-term</span>
                            </li>
                            <li className="flex items-start">
                              <AlertCircle className="mr-2 h-4 w-4 text-red-500 mt-1" />
                              <span>Register trademarked terms or variations</span>
                            </li>
                            <li className="flex items-start">
                              <AlertCircle className="mr-2 h-4 w-4 text-red-500 mt-1" />
                              <span>Overlook renewal dates and auto-renewal settings</span>
                            </li>
                            <li className="flex items-start">
                              <AlertCircle className="mr-2 h-4 w-4 text-red-500 mt-1" />
                              <span>Chase every trend without fundamental value analysis</span>
                            </li>
                            <li className="flex items-start">
                              <AlertCircle className="mr-2 h-4 w-4 text-red-500 mt-1" />
                              <span>Keep all domains at a single registrar (diversify)</span>
                            </li>
                          </ul>
                        </div>
                      </div>
                    </div>

                    <div className="bg-gray-50 p-5 border border-gray-200 rounded-sm">
                      <h3 className="text-lg font-semibold mb-4">Expert Domain Framework</h3>
                      <p className="text-gray-700 mb-4">
                        Successful domain owners follow the ACQUIRE method for optimal domain management:
                      </p>
                      <ul className="space-y-3">
                        <li className="flex">
                          <span className="font-bold mr-2 text-black">A</span>
                          <div>
                            <span className="font-semibold">Analyze</span>
                            <p className="text-gray-700">Research market trends and domain metrics</p>
                          </div>
                        </li>
                        <li className="flex">
                          <span className="font-bold mr-2 text-black">C</span>
                          <div>
                            <span className="font-semibold">Calculate</span>
                            <p className="text-gray-700">Determine fair value and maximum purchase price</p>
                          </div>
                        </li>
                        <li className="flex">
                          <span className="font-bold mr-2 text-black">Q</span>
                          <div>
                            <span className="font-semibold">Qualify</span>
                            <p className="text-gray-700">Verify domain history and legal standing</p>
                          </div>
                        </li>
                        <li className="flex">
                          <span className="font-bold mr-2 text-black">U</span>
                          <div>
                            <span className="font-semibold">Unlock</span>
                            <p className="text-gray-700">Develop or enhance the domain's potential</p>
                          </div>
                        </li>
                        <li className="flex">
                          <span className="font-bold mr-2 text-black">I</span>
                          <div>
                            <span className="font-semibold">Integrate</span>
                            <p className="text-gray-700">Add to portfolio with proper management</p>
                          </div>
                        </li>
                        <li className="flex">
                          <span className="font-bold mr-2 text-black">R</span>
                          <div>
                            <span className="font-semibold">Review</span>
                            <p className="text-gray-700">Regularly assess performance and market fit</p>
                          </div>
                        </li>
                        <li className="flex">
                          <span className="font-bold mr-2 text-black">E</span>
                          <div>
                            <span className="font-semibold">Exit</span>
                            <p className="text-gray-700">Know when and how to sell for maximum return</p>
                          </div>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </TabsContent>

              {/* Selling Strategy Tab */}
              <TabsContent value="selling" className="mt-6">
                <div className="border border-black p-6 rounded-sm">
                  <h2 className="text-2xl font-bold mb-6 flex items-center">
                    <DollarSign className="mr-2 h-6 w-6" />
                    Maximizing Domain Sale Value
                  </h2>
                  
                  <div className="space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="border border-gray-200 p-5 rounded-sm">
                        <h3 className="text-lg font-semibold mb-3">Pre-Sale Preparation</h3>
                        <ul className="space-y-2 text-gray-700">
                          <li className="flex items-start">
                            <CheckSquare className="mr-2 h-4 w-4 text-green-600 mt-1" />
                            <span>Create a professional landing page showcasing value</span>
                          </li>
                          <li className="flex items-start">
                            <CheckSquare className="mr-2 h-4 w-4 text-green-600 mt-1" />
                            <span>Gather traffic statistics and engagement data</span>
                          </li>
                          <li className="flex items-start">
                            <CheckSquare className="mr-2 h-4 w-4 text-green-600 mt-1" />
                            <span>Research recent sales of comparable domains</span>
                          </li>
                          <li className="flex items-start">
                            <CheckSquare className="mr-2 h-4 w-4 text-green-600 mt-1" />
                            <span>Prepare a domain valuation document with rationale</span>
                          </li>
                        </ul>
                      </div>

                      <div className="border border-gray-200 p-5 rounded-sm">
                        <h3 className="text-lg font-semibold mb-3">Sales Channels</h3>
                        <ul className="space-y-2 text-gray-700">
                          <li className="flex items-start font-medium">
                            <span className="mr-2">1.</span>
                            <span>Direct Outreach <span className="text-sm text-gray-500">(Best for premium domains)</span></span>
                          </li>
                          <li className="flex items-start font-medium">
                            <span className="mr-2">2.</span>
                            <span>Domain Marketplaces <span className="text-sm text-gray-500">(Widest audience)</span></span>
                          </li>
                          <li className="flex items-start font-medium">
                            <span className="mr-2">3.</span>
                            <span>Domain Brokers <span className="text-sm text-gray-500">(Expert negotiation)</span></span>
                          </li>
                          <li className="flex items-start font-medium">
                            <span className="mr-2">4.</span>
                            <span>Domain Auctions <span className="text-sm text-gray-500">(Time-sensitive sales)</span></span>
                          </li>
                        </ul>
                      </div>
                    </div>

                    <div className="border border-gray-200 p-5 rounded-sm">
                      <h3 className="text-lg font-semibold mb-4">Pricing Strategies</h3>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div>
                          <h4 className="font-medium mb-2">Fixed Price</h4>
                          <ul className="space-y-2 text-gray-700 text-sm">
                            <li><strong>Best for:</strong> Domains with clear market value</li>
                            <li><strong>Pros:</strong> Clear expectations, attracts serious buyers</li>
                            <li><strong>Cons:</strong> May leave money on table, less negotiation flexibility</li>
                            <li><strong>Tips:</strong> Set slightly above target to allow negotiation room</li>
                          </ul>
                        </div>
                        <div>
                          <h4 className="font-medium mb-2">Make Offer</h4>
                          <ul className="space-y-2 text-gray-700 text-sm">
                            <li><strong>Best for:</strong> Unique or high-value domains</li>
                            <li><strong>Pros:</strong> Discovers maximum market value, builds buyer list</li>
                            <li><strong>Cons:</strong> Attracts lowball offers, longer sales cycle</li>
                            <li><strong>Tips:</strong> Set minimum offer threshold to filter serious buyers</li>
                          </ul>
                        </div>
                        <div>
                          <h4 className="font-medium mb-2">Two-Tiered</h4>
                          <ul className="space-y-2 text-gray-700 text-sm">
                            <li><strong>Best for:</strong> Most domain types</li>
                            <li><strong>Pros:</strong> Captures both quick sales and maximum value</li>
                            <li><strong>Cons:</strong> More complex to manage</li>
                            <li><strong>Tips:</strong> Set BIN at 2-3x your minimum acceptable price</li>
                          </ul>
                        </div>
                      </div>
                    </div>

                    <div className="border border-gray-200 p-5 rounded-sm">
                      <h3 className="text-lg font-semibold mb-4">Negotiation Tactics</h3>
                      
                      <div className="space-y-4">
                        <div className="bg-gray-50 p-4 border-l-4 border-green-600">
                          <p className="font-medium">DO: Create Urgency</p>
                          <p className="text-gray-700">
                            "I've had several inquiries about this domain recently. While I'm giving you first consideration, I can't guarantee availability beyond this week."
                          </p>
                        </div>
                        
                        <div className="bg-gray-50 p-4 border-l-4 border-green-600">
                          <p className="font-medium">DO: Justify Value</p>
                          <p className="text-gray-700">
                            "This domain generates approximately 500 organic visitors monthly and ranks for several valuable keywords, creating immediate business value upon transfer."
                          </p>
                        </div>
                        
                        <div className="bg-gray-50 p-4 border-l-4 border-red-600">
                          <p className="font-medium">DON'T: Accept First Offers</p>
                          <p className="text-gray-700">
                            Initial offers are typically 30-40% below what buyers are ultimately willing to pay. Always counter-offer and negotiate incrementally.
                          </p>
                        </div>
                        
                        <div className="bg-gray-50 p-4 border-l-4 border-red-600">
                          <p className="font-medium">DON'T: Appear Desperate</p>
                          <p className="text-gray-700">
                            Never reveal urgency to sell or financial motivations. Maintain that you're content to continue holding the domain unless the right offer comes along.
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="border-t border-gray-200 pt-6">
                      <h3 className="text-lg font-semibold mb-4">Transaction Security</h3>
                      <p className="mb-4 text-gray-700">
                        Always use secure methods for high-value domain transactions:
                      </p>
                      <ul className="space-y-2 text-gray-700">
                        <li className="flex items-start">
                          <Shield className="mr-2 h-4 w-4 text-blue-600 mt-1" />
                          <span><strong>Escrow services</strong> - Secure payments with release upon domain transfer (recommended for transactions over $2,000)</span>
                        </li>
                        <li className="flex items-start">
                          <Shield className="mr-2 h-4 w-4 text-blue-600 mt-1" />
                          <span><strong>Marketplace transactions</strong> - Built-in protections for both buyer and seller</span>
                        </li>
                        <li className="flex items-start">
                          <Shield className="mr-2 h-4 w-4 text-blue-600 mt-1" />
                          <span><strong>Clear contracts</strong> - Document all terms, including payment schedule and transfer process</span>
                        </li>
                        <li className="flex items-start">
                          <Shield className="mr-2 h-4 w-4 text-blue-600 mt-1" />
                          <span><strong>Push transfers</strong> - Keep domain under your control until payment is confirmed</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </section>

        {/* Ebook Section */}
        <section className="py-16 bg-gradient-to-r from-gray-900 to-gray-800 text-white">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
              <div className="order-2 md:order-1">
                <h2 className="text-3xl md:text-4xl font-bold mb-4">
                  Unlock Domain Investing Secrets
                </h2>
                <h3 className="text-xl md:text-2xl text-gray-300 mb-6">
                  The Ultimate Guide to Domain Name Investing & Flipping
                </h3>
                <div className="space-y-4 mb-8">
                  <div className="flex items-start">
                    <div className="flex-shrink-0 h-6 w-6 text-green-400 mt-0.5">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <h4 className="text-lg font-medium">Expert Strategies</h4>
                      <p className="text-gray-300">Learn the proven methods used by six-figure domain investors</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <div className="flex-shrink-0 h-6 w-6 text-green-400 mt-0.5">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <h4 className="text-lg font-medium">Valuation Techniques</h4>
                      <p className="text-gray-300">Discover how to accurately assess domain value and potential</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <div className="flex-shrink-0 h-6 w-6 text-green-400 mt-0.5">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <h4 className="text-lg font-medium">Market Trends</h4>
                      <p className="text-gray-300">Stay ahead with insights on emerging niches and technologies</p>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-4 mb-6">
                  <p className="text-3xl font-bold">$47</p>
                  <div className="text-sm text-gray-400 line-through">$97</div>
                  <div className="bg-green-600 text-white text-xs font-bold px-2 py-1 rounded-sm">
                    SAVE 52%
                  </div>
                </div>
              </div>
              <div className="order-1 md:order-2 bg-gray-900 p-8 rounded-lg border border-gray-700 shadow-xl">
                <div className="text-center mb-6">
                  <div className="inline-block p-4 bg-gradient-to-r from-purple-600 to-blue-500 rounded-full mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold mb-2">Digital Ebook</h3>
                  <p className="text-gray-400 mb-6">Instant Download After Purchase</p>
                </div>
                <div className="bg-gray-800 p-4 rounded mb-6">
                  <div className="flex justify-between mb-2">
                    <span>Format:</span>
                    <span className="font-medium">PDF (Digital)</span>
                  </div>
                  <div className="flex justify-between mb-2">
                    <span>Pages:</span>
                    <span className="font-medium">145+</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Updates:</span>
                    <span className="font-medium">Free Lifetime</span>
                  </div>
                </div>
                <EbookPurchaseButton />
              </div>
            </div>
          </div>
        </section>

        {/* Call to action */}
        <section className="py-12 bg-black text-white">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-2xl font-bold mb-4">Ready to Find Your Perfect Domain Name?</h2>
            <p className="max-w-2xl mx-auto mb-8">
              Browse our premium domain portfolio or get personalized assistance from our domain experts.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <a 
                href="/"
                className="inline-flex items-center px-6 py-3 border-2 border-white font-medium text-white hover:bg-white hover:text-black transition-colors"
              >
                Browse Domains
              </a>
              <a 
                href="/contact"
                className="inline-flex items-center px-6 py-3 bg-white font-medium text-black hover:bg-gray-100 transition-colors"
              >
                Contact an Expert
              </a>
            </div>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
}