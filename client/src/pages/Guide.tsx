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
        <section className="py-16 bg-gradient-to-br from-blue-50 via-white to-blue-50 text-gray-800">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <span className="bg-blue-100 text-blue-800 text-sm font-medium px-4 py-1.5 rounded-full">BESTSELLER</span>
              <h2 className="text-3xl md:text-4xl font-bold mt-4 mb-3 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-700">
                The Domain Investor's Blueprint
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Unlock the exact strategies used by elite domain investors to find, buy, and sell profitable domains
              </p>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
              {/* Left column with mockup image and features */}
              <div className="lg:col-span-7 order-2 lg:order-1">
                <div className="lg:pr-8">
                  <div className="flex items-center mb-8">
                    <div className="flex -space-x-2 mr-4">
                      {Array.from({length: 5}).map((_, i) => (
                        <div key={i} className="inline-block h-10 w-10 rounded-full ring-2 ring-white bg-blue-500 text-white flex items-center justify-center text-sm font-medium">
                          {['M', 'S', 'A', 'J', 'R'][i]}
                        </div>
                      ))}
                    </div>
                    <div>
                      <div className="flex items-center">
                        {Array.from({length: 5}).map((_, i) => (
                          <svg key={i} className="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118l-2.8-2.034c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        ))}
                      </div>
                      <p className="text-sm text-gray-600">from <span className="font-semibold">237</span> satisfied investors</p>
                    </div>
                  </div>
                
                  <div className="space-y-6 mb-8">
                    <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6 transition-transform hover:translate-y-[-5px]">
                      <div className="flex">
                        <div className="flex-shrink-0 h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
                          <Search className="h-6 w-6" />
                        </div>
                        <div className="ml-4">
                          <h4 className="text-lg font-bold mb-1">Domain Finding Formula</h4>
                          <p className="text-gray-600">Our proven 3-step process to discover undervalued domains with high profit potential before anyone else</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6 transition-transform hover:translate-y-[-5px]">
                      <div className="flex">
                        <div className="flex-shrink-0 h-12 w-12 bg-green-100 rounded-full flex items-center justify-center text-green-600">
                          <BarChart3 className="h-6 w-6" />
                        </div>
                        <div className="ml-4">
                          <h4 className="text-lg font-bold mb-1">Professional Valuation Framework</h4>
                          <p className="text-gray-600">Learn to accurately value any domain in 5 minutes using our PCMV framework (Price, Comparables, Market, Value)</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6 transition-transform hover:translate-y-[-5px]">
                      <div className="flex">
                        <div className="flex-shrink-0 h-12 w-12 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600">
                          <DollarSign className="h-6 w-6" />
                        </div>
                        <div className="ml-4">
                          <h4 className="text-lg font-bold mb-1">6-Figure Selling System</h4>
                          <p className="text-gray-600">The exact outreach templates and negotiation scripts that have generated over $3.2M in domain sales</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 mb-8">
                    <div className="flex">
                      <div className="flex-shrink-0">
                        <svg className="h-5 w-5 text-blue-600" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div className="ml-3">
                        <p className="text-sm text-blue-700">
                          <span className="font-medium">Results vary</span> - Our average student adds $2,500-$8,000/month to their income after 90 days of implementing these strategies
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3 mb-2">
                    <CheckSquare className="h-5 w-5 text-green-500" />
                    <span className="text-gray-700">145+ Page Comprehensive Guide</span>
                  </div>
                  <div className="flex items-center space-x-3 mb-2">
                    <CheckSquare className="h-5 w-5 text-green-500" />
                    <span className="text-gray-700">Instant Digital Delivery</span>
                  </div>
                  <div className="flex items-center space-x-3 mb-2">
                    <CheckSquare className="h-5 w-5 text-green-500" />
                    <span className="text-gray-700">Free Lifetime Updates</span>
                  </div>
                </div>
              </div>
              
              {/* Right column with pricing and purchase */}
              <div className="lg:col-span-5 order-1 lg:order-2">
                <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
                  <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-6 text-white text-center">
                    <h3 className="text-2xl font-bold mb-1">Domain Investor's Blueprint</h3>
                    <p className="text-blue-100 mb-4">Complete Digital Package</p>
                    <div className="flex justify-center items-center">
                      <span className="text-lg line-through text-blue-200 mr-2">$97</span>
                      <span className="text-4xl font-bold">$47</span>
                    </div>
                    <p className="text-blue-200 text-sm mt-1">One-time payment, no subscription</p>
                  </div>
                  
                  <div className="p-6">
                    <div className="bg-green-50 border border-green-100 rounded-lg p-4 mb-6">
                      <div className="flex">
                        <div className="flex-shrink-0">
                          <svg className="h-5 w-5 text-green-600" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <div className="ml-3">
                          <p className="text-sm text-green-700">
                            <span className="font-bold">50% OFF Launch Special</span> - Price increases to $97 on April 15th
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex justify-between mb-2 text-sm border-b border-gray-100 pb-2">
                      <span className="text-gray-600">Format:</span>
                      <span className="font-medium">PDF (Digital)</span>
                    </div>
                    <div className="flex justify-between mb-2 text-sm border-b border-gray-100 pb-2">
                      <span className="text-gray-600">Pages:</span>
                      <span className="font-medium">145+</span>
                    </div>
                    <div className="flex justify-between mb-6 text-sm border-b border-gray-100 pb-2">
                      <span className="text-gray-600">Updates:</span>
                      <span className="font-medium">Free Lifetime</span>
                    </div>
                    
                    <EbookPurchaseButton />
                    
                    <div className="mt-4 text-center text-xs text-gray-500 flex items-center justify-center">
                      <svg className="h-4 w-4 mr-1" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                        <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                      </svg>
                      Secure Payment
                    </div>
                  </div>
                </div>
                
                <div className="mt-6 bg-white p-4 rounded-lg border border-gray-100 shadow-sm">
                  <div className="flex">
                    <img className="h-12 w-12 rounded-full mr-4" src="data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2248%22%20height%3D%2248%22%20viewBox%3D%220%200%2048%2048%22%3E%3Cpath%20fill%3D%22%23E0E0E0%22%20d%3D%22M24%204C12.95%204%204%2012.95%204%2024s8.95%2020%2020%2020%2020-8.95%2020-20S35.05%204%2024%204zm0%2036c-8.84%200-16-7.16-16-16S15.16%208%2024%208s16%207.16%2016%2016-7.16%2016-16%2016z%22%2F%3E%3Cpath%20fill%3D%22%23E0E0E0%22%20d%3D%22M24%2020c-2.21%200-4%201.79-4%204s1.79%204%204%204%204-1.79%204-4-1.79-4-4-4zm0-6c-5.52%200-10%204.48-10%2010s4.48%2010%2010%2010%2010-4.48%2010-10-4.48-10-10-10zm0%2018c-4.42%200-8-3.58-8-8s3.58-8%208-8%208%203.58%208%208-3.58%208-8%208z%22%2F%3E%3C%2Fsvg%3E" alt="Customer" />
                    <div>
                      <p className="text-sm text-gray-700">
                        "I bought this guide last month, and I've already made two domain sales for $5,800 combined using just the outreach templates. Best investment I've made in my domain business."
                      </p>
                      <p className="mt-2 text-sm font-medium">— Michael T., Professional Domain Investor</p>
                      <div className="flex mt-1">
                        {Array.from({length: 5}).map((_, i) => (
                          <svg key={i} className="h-4 w-4 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118l-2.8-2.034c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
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