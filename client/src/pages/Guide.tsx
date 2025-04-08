import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import EbookPurchaseButton from "@/components/EbookPurchaseButton";
import Layout from "@/components/Layout";
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
    <Layout>
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
                          <span><strong>.IO:</strong> Popular for tech startups and development</span>
                        </li>
                        <li className="flex items-start">
                          <Hash className="mr-2 h-4 w-4 text-blue-600 mt-1" />
                          <span><strong>.TECH:</strong> Growing adoption in technology sectors</span>
                        </li>
                        <li className="flex items-start">
                          <Hash className="mr-2 h-4 w-4 text-blue-600 mt-1" />
                          <span><strong>.CO:</strong> Increasingly mainstream alternative to .com</span>
                        </li>
                      </ul>
                    </div>
                  </div>

                  <div className="border border-gray-200 p-5 rounded-sm">
                    <h3 className="text-lg font-semibold mb-4">Pricing Trends (2023-2025)</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div className="p-4 bg-gray-50 rounded-sm">
                        <p className="font-semibold text-center mb-2">Short .COMs (3-4 characters)</p>
                        <p className="text-center text-green-600 font-bold text-2xl mb-1">↑ 15-25%</p>
                        <p className="text-center text-gray-600">Annual appreciation</p>
                      </div>
                      <div className="p-4 bg-gray-50 rounded-sm">
                        <p className="font-semibold text-center mb-2">Premium One-Word .COMs</p>
                        <p className="text-center text-green-600 font-bold text-2xl mb-1">↑ 12-20%</p>
                        <p className="text-center text-gray-600">Annual appreciation</p>
                      </div>
                      <div className="p-4 bg-gray-50 rounded-sm">
                        <p className="font-semibold text-center mb-2">Industry-Specific TLDs</p>
                        <p className="text-center text-green-600 font-bold text-2xl mb-1">↑ 10-30%</p>
                        <p className="text-center text-gray-600">Annual appreciation</p>
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-gray-200 pt-6">
                    <h3 className="text-lg font-semibold mb-4">Analyst Insight</h3>
                    <div className="bg-gray-50 p-4 border-l-4 border-black">
                      <p className="italic text-gray-700">
                        "The domain market continues to segment into specialized niches, with AI, green tech, and digital health domains commanding increasing premiums. Investors are looking beyond traditional .COM extensions to industry-specific TLDs that offer targeted branding opportunities at lower entry points."
                      </p>
                      <p className="mt-2 text-sm font-medium">— Domain Market Analyst, TakeMyName</p>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* Investment Tips Tab */}
            <TabsContent value="investment" className="mt-6">
              <div className="border border-black p-6 rounded-sm">
                <h2 className="text-2xl font-bold mb-6 flex items-center">
                  <Lightbulb className="mr-2 h-6 w-6" />
                  Domain Investment Tips
                </h2>
                
                <div className="space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="border border-gray-200 p-5 rounded-sm">
                      <h3 className="text-lg font-semibold mb-3 flex items-center">
                        <Award className="mr-2 h-5 w-5 text-gray-700" />
                        Investment Strategies
                      </h3>
                      <ul className="space-y-2 text-gray-700">
                        <li>• Focus on emerging industry trends and keywords</li>
                        <li>• Balance portfolio between premium and growth domains</li>
                        <li>• Consider geographic targeting for regional businesses</li>
                        <li>• Monitor expired domain auctions for opportunities</li>
                        <li>• Hold premium domains long-term (5+ years)</li>
                      </ul>
                    </div>

                    <div className="border border-gray-200 p-5 rounded-sm">
                      <h3 className="text-lg font-semibold mb-3 flex items-center">
                        <AlertCircle className="mr-2 h-5 w-5 text-gray-700" />
                        Common Mistakes
                      </h3>
                      <ul className="space-y-2 text-gray-700">
                        <li>• Focusing only on exact-match keywords</li>
                        <li>• Neglecting renewal dates and losing valuable domains</li>
                        <li>• Overvaluing domains when listing for sale</li>
                        <li>• Ignoring legal risks like trademark infringement</li>
                        <li>• Rushing purchases without proper research</li>
                      </ul>
                    </div>
                  </div>

                  <div className="border border-gray-200 p-5 rounded-sm">
                    <h3 className="text-lg font-semibold mb-4">Investment Horizons & Returns</h3>
                    <div className="overflow-x-auto">
                      <table className="min-w-full border border-gray-200">
                        <thead>
                          <tr className="bg-gray-50">
                            <th className="py-3 px-4 border-b text-left">Investment Type</th>
                            <th className="py-3 px-4 border-b text-left">Timeframe</th>
                            <th className="py-3 px-4 border-b text-left">Potential Return</th>
                            <th className="py-3 px-4 border-b text-left">Risk Level</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr>
                            <td className="py-3 px-4 border-b font-medium">Short-term flipping</td>
                            <td className="py-3 px-4 border-b">3-12 months</td>
                            <td className="py-3 px-4 border-b">20-100%</td>
                            <td className="py-3 px-4 border-b">High</td>
                          </tr>
                          <tr className="bg-gray-50">
                            <td className="py-3 px-4 border-b font-medium">Trend-based domains</td>
                            <td className="py-3 px-4 border-b">1-3 years</td>
                            <td className="py-3 px-4 border-b">50-300%</td>
                            <td className="py-3 px-4 border-b">Medium-High</td>
                          </tr>
                          <tr>
                            <td className="py-3 px-4 border-b font-medium">Development & monetization</td>
                            <td className="py-3 px-4 border-b">2-5 years</td>
                            <td className="py-3 px-4 border-b">100-500%</td>
                            <td className="py-3 px-4 border-b">Medium</td>
                          </tr>
                          <tr className="bg-gray-50">
                            <td className="py-3 px-4 border-b font-medium">Premium domain holding</td>
                            <td className="py-3 px-4 border-b">5-10+ years</td>
                            <td className="py-3 px-4 border-b">200-1000%+</td>
                            <td className="py-3 px-4 border-b">Low-Medium</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>

                  <div className="border border-gray-200 p-5 rounded-sm">
                    <h3 className="text-lg font-semibold mb-4">Portfolio Diversification</h3>
                    <p className="text-gray-700 mb-4">For optimal risk management, consider this allocation for a domain investment portfolio:</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <ul className="space-y-3">
                          <li className="flex items-center gap-2">
                            <div className="w-4 h-4 rounded-full bg-blue-500 flex-shrink-0"></div>
                            <span className="font-medium">40% Premium domains (.COM, one-word)</span>
                          </li>
                          <li className="flex items-center gap-2">
                            <div className="w-4 h-4 rounded-full bg-green-500 flex-shrink-0"></div>
                            <span className="font-medium">25% Industry-specific domains</span>
                          </li>
                          <li className="flex items-center gap-2">
                            <div className="w-4 h-4 rounded-full bg-yellow-500 flex-shrink-0"></div>
                            <span className="font-medium">20% Trend-based domains</span>
                          </li>
                          <li className="flex items-center gap-2">
                            <div className="w-4 h-4 rounded-full bg-purple-500 flex-shrink-0"></div>
                            <span className="font-medium">10% Geographic domains</span>
                          </li>
                          <li className="flex items-center gap-2">
                            <div className="w-4 h-4 rounded-full bg-red-500 flex-shrink-0"></div>
                            <span className="font-medium">5% Speculative/emerging TLDs</span>
                          </li>
                        </ul>
                      </div>
                      <div className="border-l border-gray-200 pl-6">
                        <h4 className="font-medium mb-2">Key Portfolio Management Tips:</h4>
                        <ul className="space-y-2 text-sm text-gray-700">
                          <li>• Regularly audit domain performance and market trends</li>
                          <li>• Set up auto-renewals for all valuable domains</li>
                          <li>• Consider domain parking to generate passive income</li>
                          <li>• Create simple landing pages to capture interest</li>
                          <li>• Track inquiries to identify market demand patterns</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* Selling Strategy Tab */}
            <TabsContent value="selling" className="mt-6">
              <div className="border border-black p-6 rounded-sm">
                <h2 className="text-2xl font-bold mb-6 flex items-center">
                  <Briefcase className="mr-2 h-6 w-6" />
                  Domain Selling Strategies
                </h2>
                
                <div className="space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="border border-gray-200 p-5 rounded-sm">
                      <h3 className="text-lg font-semibold mb-3">Pricing Your Domain</h3>
                      <ul className="space-y-2 text-gray-700">
                        <li>• Research comparable domain sales</li>
                        <li>• Consider multiple valuation methods</li>
                        <li>• Factor in industry demand and growth</li>
                        <li>• Balance BIN price with offer flexibility</li>
                        <li>• Adjust based on market feedback</li>
                      </ul>
                    </div>

                    <div className="border border-gray-200 p-5 rounded-sm">
                      <h3 className="text-lg font-semibold mb-3">Selling Platforms</h3>
                      <ul className="space-y-2 text-gray-700">
                        <li>• Premium marketplaces (higher fees, qualified buyers)</li>
                        <li>• Domain auction platforms (competitive pricing)</li>
                        <li>• Broker services (hands-off but commission fees)</li>
                        <li>• Direct outreach to potential end-users</li>
                        <li>• Industry forums and communities</li>
                      </ul>
                    </div>
                  </div>

                  <div className="border border-gray-200 p-5 rounded-sm">
                    <h3 className="text-lg font-semibold mb-3">Presentation & Marketing</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-4">
                      <div>
                        <h4 className="font-medium mb-2">Creating an Effective Listing:</h4>
                        <ul className="space-y-1 text-gray-700 text-sm">
                          <li className="flex items-start">
                            <CheckSquare className="mr-2 h-4 w-4 text-green-600 mt-1 flex-shrink-0" />
                            <span>Highlight unique selling points and potential uses</span>
                          </li>
                          <li className="flex items-start">
                            <CheckSquare className="mr-2 h-4 w-4 text-green-600 mt-1 flex-shrink-0" />
                            <span>Include relevant keyword research and search volume</span>
                          </li>
                          <li className="flex items-start">
                            <CheckSquare className="mr-2 h-4 w-4 text-green-600 mt-1 flex-shrink-0" />
                            <span>Showcase traffic or backlink data if available</span>
                          </li>
                          <li className="flex items-start">
                            <CheckSquare className="mr-2 h-4 w-4 text-green-600 mt-1 flex-shrink-0" />
                            <span>Set clear terms regarding transfer process</span>
                          </li>
                        </ul>
                      </div>
                      <div>
                        <h4 className="font-medium mb-2">Landing Page Elements:</h4>
                        <ul className="space-y-1 text-gray-700 text-sm">
                          <li className="flex items-start">
                            <CheckSquare className="mr-2 h-4 w-4 text-green-600 mt-1 flex-shrink-0" />
                            <span>Professional "For Sale" landing page</span>
                          </li>
                          <li className="flex items-start">
                            <CheckSquare className="mr-2 h-4 w-4 text-green-600 mt-1 flex-shrink-0" />
                            <span>Multiple contact methods (form, email, phone)</span>
                          </li>
                          <li className="flex items-start">
                            <CheckSquare className="mr-2 h-4 w-4 text-green-600 mt-1 flex-shrink-0" />
                            <span>Clear pricing or "Make Offer" instructions</span>
                          </li>
                          <li className="flex items-start">
                            <CheckSquare className="mr-2 h-4 w-4 text-green-600 mt-1 flex-shrink-0" />
                            <span>Social proof (testimonials, previous sales)</span>
                          </li>
                        </ul>
                      </div>
                      <div>
                        <h4 className="font-medium mb-2">Outreach Strategy:</h4>
                        <ul className="space-y-1 text-gray-700 text-sm">
                          <li className="flex items-start">
                            <CheckSquare className="mr-2 h-4 w-4 text-green-600 mt-1 flex-shrink-0" />
                            <span>Identify businesses in relevant industries</span>
                          </li>
                          <li className="flex items-start">
                            <CheckSquare className="mr-2 h-4 w-4 text-green-600 mt-1 flex-shrink-0" />
                            <span>Craft personalized outreach messages</span>
                          </li>
                          <li className="flex items-start">
                            <CheckSquare className="mr-2 h-4 w-4 text-green-600 mt-1 flex-shrink-0" />
                            <span>Follow up strategically (7-14 day intervals)</span>
                          </li>
                          <li className="flex items-start">
                            <CheckSquare className="mr-2 h-4 w-4 text-green-600 mt-1 flex-shrink-0" />
                            <span>Track responses and adjust approach accordingly</span>
                          </li>
                        </ul>
                      </div>
                      <div>
                        <h4 className="font-medium mb-2">Negotiation Tips:</h4>
                        <ul className="space-y-1 text-gray-700 text-sm">
                          <li className="flex items-start">
                            <CheckSquare className="mr-2 h-4 w-4 text-green-600 mt-1 flex-shrink-0" />
                            <span>Set a clear minimum acceptable price</span>
                          </li>
                          <li className="flex items-start">
                            <CheckSquare className="mr-2 h-4 w-4 text-green-600 mt-1 flex-shrink-0" />
                            <span>Be patient with serious buyers</span>
                          </li>
                          <li className="flex items-start">
                            <CheckSquare className="mr-2 h-4 w-4 text-green-600 mt-1 flex-shrink-0" />
                            <span>Consider payment plans for premium domains</span>
                          </li>
                          <li className="flex items-start">
                            <CheckSquare className="mr-2 h-4 w-4 text-green-600 mt-1 flex-shrink-0" />
                            <span>Always use escrow for secure transactions</span>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-gray-200 pt-6">
                    <h3 className="text-lg font-semibold mb-4">Next Step: Sell with TakeMyName</h3>
                    <p className="text-gray-700 mb-6">
                      Ready to sell your domain name? TakeMyName offers a premium marketplace, professional marketing, and secure transactions through GoDaddy. Our domain experts will help you maximize your domain's value.
                    </p>
                    <div className="flex justify-center">
                      <a 
                        href="/contact"
                        className="inline-flex items-center px-6 py-3 bg-black font-medium text-white hover:bg-gray-800 transition-colors"
                      >
                        Contact an Expert
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </section>
      {/* High-Converting Ebook CTA Section */}
      <section className="py-16 bg-white text-gray-800">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              {/* Left Column: Content */}
              <div className="space-y-8">
                <div>
                  <span className="bg-green-500 text-black font-bold py-1 px-3 rounded-full text-sm mb-4 inline-block">EXCLUSIVE OFFER</span>
                  <h2 className="text-4xl md:text-5xl font-bold leading-tight mt-2">Unlock Domain Investment Secrets</h2>
                  <p className="text-xl mt-4 text-gray-600">Turn your domain knowledge into profitable investments with our complete expert guide</p>
                </div>
                
                <div className="space-y-5">
                  <div className="flex items-center gap-3">
                    <div className="bg-green-500 rounded-full p-1 flex-shrink-0">
                      <CheckSquare className="h-4 w-4 text-black" />
                    </div>
                    <span className="text-lg text-gray-700">200+ pages of expert domain investment strategies</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="bg-green-500 rounded-full p-1 flex-shrink-0">
                      <CheckSquare className="h-4 w-4 text-black" />
                    </div>
                    <span className="text-lg text-gray-700">25 real-world case studies with 6-figure returns</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="bg-green-500 rounded-full p-1 flex-shrink-0">
                      <CheckSquare className="h-4 w-4 text-black" />
                    </div>
                    <span className="text-lg text-gray-700">Step-by-step domain valuation worksheets</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="bg-green-500 rounded-full p-1 flex-shrink-0">
                      <CheckSquare className="h-4 w-4 text-black" />
                    </div>
                    <span className="text-lg text-gray-700">Exclusive access to our private investor community</span>
                  </div>
                </div>
                
                <div className="space-y-6">
                  <div className="flex gap-2 items-center">
                    <div className="flex">
                      {Array(5).fill(0).map((_, i) => (
                        <svg key={i} className="w-6 h-6 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                        </svg>
                      ))}
                    </div>
                    <span className="text-lg font-medium">4.9/5 stars from 250+ readers</span>
                  </div>
                  
                  <div className="bg-gray-50 p-5 rounded-lg border border-gray-200">
                    <p className="italic text-gray-700">
                      "The strategies in this guide helped me acquire and flip a premium domain for a $37,500 profit in just 90 days. The ROI calculator alone is worth 10x the price."
                    </p>
                    <div className="mt-4 flex items-center">
                      <div className="h-10 w-10 rounded-full bg-green-500 flex items-center justify-center text-white font-bold">
                        MT
                      </div>
                      <div className="ml-3">
                        <p className="font-medium text-gray-800">Michael T.</p>
                        <p className="text-sm text-gray-500">Domain Investor, New York</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-end gap-2">
                        <span className="text-3xl font-bold">$29.99</span>
                        <span className="text-gray-400 line-through">$99.99</span>
                      </div>
                      <span className="bg-white text-black text-sm font-bold px-3 py-1 rounded border border-gray-300">70% OFF</span>
                    </div>
                    
                    <div className="flex justify-center">
                      <button className="w-full bg-green-500 hover:bg-green-600 text-black font-bold py-3 px-6 rounded transition-colors">
                        GET INSTANT ACCESS
                      </button>
                    </div>
                    
                    <p className="text-sm text-gray-400 mt-2">
                      🔒 Secure payment • Instant digital download • 30-day money-back guarantee
                    </p>
                  </div>
                </div>
              </div>
              
              {/* Right Column: Ebook Mockup */}
              <div className="relative hidden lg:block">
                <div className="absolute -top-4 right-0 bg-white text-black py-2 px-6 font-bold rounded-lg z-10 border border-gray-300">
                  LIMITED TIME OFFER!
                </div>
                
                <div className="p-8">
                  <div className="relative">
                    <div className="bg-black border border-gray-800 p-6 rounded-lg shadow-xl">
                      <div>
                        <div className="border-l-4 border-white pl-6 mb-8">
                          <h3 className="text-xl font-bold text-white mb-1">THE COMPLETE</h3>
                          <h2 className="text-4xl font-extrabold text-white mb-2">DOMAIN INVESTING</h2>
                          <h3 className="text-xl font-bold text-white mb-4">PLAYBOOK</h3>
                          <p className="text-gray-400 text-sm">By TakeMyName.com Experts</p>
                        </div>
                        
                        <div className="space-y-4 mb-6">
                          <div className="flex items-center gap-3 border-l-2 border-white pl-4">
                            <p className="text-gray-300">Domain Valuation Mastery</p>
                          </div>
                          <div className="flex items-center gap-3 border-l-2 border-white pl-4">
                            <p className="text-gray-300">Acquisition Strategies</p>
                          </div>
                          <div className="flex items-center gap-3 border-l-2 border-white pl-4">
                            <p className="text-gray-300">Portfolio Management</p>
                          </div>
                          <div className="flex items-center gap-3 border-l-2 border-white pl-4">
                            <p className="text-gray-300">Exit & Maximizing Profits</p>
                          </div>
                        </div>
                        
                        <div className="bg-white text-black p-3 rounded text-center font-bold">
                          200+ PAGES OF EXPERT INSIGHTS
                        </div>
                      </div>
                    </div>

                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}