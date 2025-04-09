import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Layout from "@/components/Layout";
import EbookDownload from "@/components/EbookDownload";
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
            <TabsList className="flex w-full overflow-x-auto md:grid md:grid-cols-5">
              <TabsTrigger value="buying" className="min-w-[120px] whitespace-nowrap px-4">Buying Guide</TabsTrigger>
              <TabsTrigger value="value" className="min-w-[120px] whitespace-nowrap px-4">Value Factors</TabsTrigger>
              <TabsTrigger value="trends" className="min-w-[120px] whitespace-nowrap px-4">Market Trends</TabsTrigger>
              <TabsTrigger value="investment" className="min-w-[120px] whitespace-nowrap px-4">Domain Tips</TabsTrigger>
              <TabsTrigger value="selling" className="min-w-[120px] whitespace-nowrap px-4">Selling Strategy</TabsTrigger>
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
                      <p className="mt-2 text-sm font-medium">— Domain Investment Expert, DomainnameGuide</p>
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
                      <p className="mt-2 text-sm font-medium">— Domain Market Analyst, DomainnameGuide</p>
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
                    <h3 className="text-lg font-semibold mb-4">Next Step: Sell with DomainnameGuide</h3>
                    <p className="text-gray-700 mb-6">
                      Ready to sell your domain name? DomainnameGuide offers a premium marketplace, professional marketing, and secure transactions through GoDaddy. Our domain experts will help you maximize your domain's value.
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


      {/* Ebook section */}
      <section className="py-20 bg-gradient-to-b from-white to-gray-50 border-t border-gray-100">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-4xl font-bold mb-6 leading-tight">Complete Domain Marketing Guide</h2>
                <p className="text-lg text-gray-700 mb-8 leading-relaxed">
                  Take your domain knowledge to the next level with our comprehensive guide. Learn advanced marketing strategies, valuation techniques, and insider tips from industry experts.
                </p>
                <ul className="space-y-4 mb-8">
                  <li className="flex items-start bg-white p-3 rounded-lg shadow-sm border border-gray-100 transition-all hover:shadow-md">
                    <CheckSquare className="h-5 w-5 text-black mr-3 mt-0.5 flex-shrink-0" />
                    <span>30+ pages of expert domain knowledge</span>
                  </li>
                  <li className="flex items-start bg-white p-3 rounded-lg shadow-sm border border-gray-100 transition-all hover:shadow-md">
                    <CheckSquare className="h-5 w-5 text-black mr-3 mt-0.5 flex-shrink-0" />
                    <span>Practical step-by-step domain marketing strategies</span>
                  </li>
                  <li className="flex items-start bg-white p-3 rounded-lg shadow-sm border border-gray-100 transition-all hover:shadow-md">
                    <CheckSquare className="h-5 w-5 text-black mr-3 mt-0.5 flex-shrink-0" />
                    <span>Insider tips for maximizing domain profitability</span>
                  </li>
                  <li className="flex items-start bg-white p-3 rounded-lg shadow-sm border border-gray-100 transition-all hover:shadow-md">
                    <CheckSquare className="h-5 w-5 text-black mr-3 mt-0.5 flex-shrink-0" />
                    <span>Case studies of successful domain investments</span>
                  </li>
                </ul>
              </div>
              <div className="flex justify-center">
                <div className="relative z-10 w-full max-w-md">
                  <div className="absolute inset-0 bg-black rounded-xl transform rotate-2 -z-10 opacity-5"></div>
                  <EbookDownload
                    pageKey="ebook-section"
                    title="Domain Marketing Guide"
                    description="Premium domain marketing strategies"
                    price={1995} // $19.95
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}