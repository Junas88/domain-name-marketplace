import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { 
  Calendar, 
  TrendingUp, 
  Globe, 
  AlignLeft, 
  Briefcase, 
  Award,
  BadgeCheck,
  BarChart3
} from "lucide-react";
import Layout from "@/components/Layout";

export default function DomainValuation() {
  const valuationFactors = [
    {
      title: "Length & Brevity",
      description: "Shorter domains are typically more valuable because they're easier to remember and type. One to five character domains command premium prices.",
      icon: <AlignLeft className="h-6 w-6 text-neutral-800" />
    },
    {
      title: "Extension",
      description: ".com domains remain the most valuable, followed by .io, .co, and country-specific extensions like .us or .uk for targeted markets.",
      icon: <Globe className="h-6 w-6 text-neutral-800" />
    },
    {
      title: "Market Relevance",
      description: "Domains related to growing industries or trending markets (like AI, crypto, or sustainability) often command higher prices.",
      icon: <TrendingUp className="h-6 w-6 text-neutral-800" />
    },
    {
      title: "Age & History",
      description: "Older domains with established history and backlinks can be more valuable due to their SEO advantages and credibility.",
      icon: <Calendar className="h-6 w-6 text-neutral-800" />
    },
    {
      title: "Commercial Potential",
      description: "Domains that clearly relate to a commercial intent or have obvious business applications tend to be worth more.",
      icon: <Briefcase className="h-6 w-6 text-neutral-800" />
    },
    {
      title: "Brandability",
      description: "Unique, memorable domains that can serve as strong brand foundations are increasingly valuable in today's digital marketplace.",
      icon: <Award className="h-6 w-6 text-neutral-800" />
    }
  ];

  const premiumCharacteristics = [
    {
      title: "Short & Memorable",
      description: "Premium domains are typically concise, memorable, and easy to spell, increasing brand recognition and reducing typing errors."
    },
    {
      title: "Natural Keywords",
      description: "They often contain natural, high-value keywords that are relevant to profitable industries or popular search terms."
    },
    {
      title: "Intuitive Spelling",
      description: "Premium domains use intuitive spelling that avoids confusion and ensures users can find the website easily."
    },
    {
      title: "Flexible Usage",
      description: "The best domains are versatile enough to support various business models and pivots as companies evolve."
    },
    {
      title: "Distinctive",
      description: "They stand out from competitors and avoid trademark issues by being unique while remaining relevant."
    },
    {
      title: "Global Appeal",
      description: "Premium domains often work well across cultures and languages, avoiding local slang that might limit international growth."
    },
    {
      title: "Phonetic Clarity",
      description: "They sound good when spoken aloud and are easy to communicate verbally without confusion."
    },
    {
      title: "Limited Substitutes",
      description: "The most valuable domains have few obvious alternatives, creating natural scarcity and higher value."
    },
    {
      title: "Timeless Nature",
      description: "They avoid trendy terms or dated references that could become obsolete as language and technology evolve."
    }
  ];

  const valuationProcess = [
    {
      title: "Comparative Market Analysis",
      description: "We research recent sales of similar domains to establish baseline market values for comparable assets."
    },
    {
      title: "Keyword Analysis",
      description: "We analyze search volume and competition for keywords in the domain to assess its organic traffic potential."
    },
    {
      title: "Industry Relevance Assessment",
      description: "We evaluate the domain's relevance to growing industries and its potential value to businesses in those sectors."
    },
    {
      title: "Technical Analysis",
      description: "We examine technical factors like domain age, backlink profile, and current/historical use."
    },
    {
      title: "Expert Review",
      description: "Our team of domain specialists provides a qualitative assessment based on years of industry experience."
    }
  ];

  const recentSales = [
    {
      domain: "voice.com",
      price: "$30 million",
      category: "Technology",
      year: "2019"
    },
    {
      domain: "crypto.com",
      price: "$12 million",
      category: "Crypto",
      year: "2019"
    },
    {
      domain: "insurance.com",
      price: "$35.6 million",
      category: "Finance",
      year: "2010"
    },
    {
      domain: "hotels.com",
      price: "$11 million",
      category: "Travel",
      year: "2001"
    },
    {
      domain: "vacationrentals.com",
      price: "$35 million",
      category: "Travel",
      year: "2007"
    },
    {
      domain: "carinsurance.com",
      price: "$49.7 million",
      category: "Insurance",
      year: "2010"
    },
    {
      domain: "fund.com",
      price: "$9.99 million",
      category: "Finance",
      year: "2008"
    }
  ];
  
  return (
    <Layout>
      <div className="bg-white">
        {/* Hero Section */}
        <section className="py-12 md:py-16 lg:py-20 bg-black text-white">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto text-center">
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 flex items-center justify-center">
                <BarChart3 className="mr-3 h-10 w-10 text-green-500" />
                Domain Valuation Guide
              </h1>
              <p className="text-lg md:text-xl opacity-90 mb-8">
                Understanding what makes a domain valuable and how to determine its market worth
              </p>
            </div>
          </div>
        </section>
        
        {/* Overview */}
        <section className="py-16 border-b border-neutral-200">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
            <h2 className="text-3xl font-bold mb-6">What Determines Domain Value?</h2>
            <p className="text-lg text-neutral-600 mb-10">
              Domain valuation is both an art and a science. While some factors are quantifiable, others depend on market trends 
              and industry-specific demands. At TakeMyName.com, we consider multiple factors when determining a domain's value:
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {valuationFactors.map((factor, index) => (
                <div key={index} className="flex gap-4">
                  <div className="flex-shrink-0">
                    <div className="bg-neutral-50 p-3 rounded-lg border border-neutral-200">
                      {factor.icon}
                    </div>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-2">{factor.title}</h3>
                    <p className="text-neutral-600">{factor.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
        
        {/* Premium Domain Characteristics */}
        <section className="py-16 bg-neutral-50 border-b border-neutral-200">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
            <h2 className="text-3xl font-bold mb-6 text-center">Premium Domain Characteristics</h2>
            <p className="text-lg text-center text-neutral-600 mb-12">
              Premium domains share certain characteristics that make them stand out in the market.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {premiumCharacteristics.map((item, index) => (
                <div key={index} className="bg-white p-6 rounded-lg border border-neutral-200 shadow-sm">
                  <div className="flex items-center gap-2 mb-4">
                    <BadgeCheck className="h-5 w-5 text-green-600" />
                    <h3 className="text-lg font-semibold">{item.title}</h3>
                  </div>
                  <p className="text-neutral-600 text-sm">{item.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
        
        {/* Valuation Process */}
        <section className="py-16 border-b border-neutral-200">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
            <h2 className="text-3xl font-bold mb-6">Our Valuation Process</h2>
            <p className="text-lg text-neutral-600 mb-10">
              At TakeMyName.com, we use a comprehensive approach to domain valuation:
            </p>
            
            <ol className="space-y-6">
              {valuationProcess.map((step, index) => (
                <li key={index} className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-black text-white flex items-center justify-center font-bold">
                    {index + 1}
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
                    <p className="text-neutral-600">{step.description}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </section>
        
        {/* Recent Sales */}
        <section className="py-16 bg-neutral-50 border-b border-neutral-200">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
            <h2 className="text-3xl font-bold mb-6 text-center">Notable Recent Sales</h2>
            <p className="text-lg text-center text-neutral-600 mb-12">
              Examples of premium domains and their recent sales prices.
            </p>
            
            <div className="overflow-x-auto">
              <table className="w-full bg-white border border-neutral-200 rounded-lg">
                <thead className="bg-neutral-100">
                  <tr>
                    <th className="py-3 px-4 text-left border-b border-neutral-200 font-semibold">Domain Name</th>
                    <th className="py-3 px-4 text-left border-b border-neutral-200 font-semibold">Sale Price</th>
                    <th className="py-3 px-4 text-left border-b border-neutral-200 font-semibold">Category</th>
                    <th className="py-3 px-4 text-left border-b border-neutral-200 font-semibold">Year</th>
                  </tr>
                </thead>
                <tbody>
                  {recentSales.map((sale, index) => (
                    <tr key={index} className={index % 2 === 0 ? "bg-white" : "bg-neutral-50"}>
                      <td className="py-3 px-4 border-b border-neutral-200 font-medium">{sale.domain}</td>
                      <td className="py-3 px-4 border-b border-neutral-200">{sale.price}</td>
                      <td className="py-3 px-4 border-b border-neutral-200">{sale.category}</td>
                      <td className="py-3 px-4 border-b border-neutral-200">{sale.year}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-sm text-neutral-500 mt-4 text-center">
              *These examples are for illustrative purposes and represent industry sales data.
            </p>
          </div>
        </section>
        
        {/* Call to Action */}
        <section className="py-16">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-3xl text-center">
            <h2 className="text-3xl font-bold mb-6">Need Help Valuing Your Domain?</h2>
            <p className="text-lg text-neutral-600 mb-8">
              Our domain experts can provide a professional valuation of your domain and help you determine the best selling strategy.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link href="/#domain-finder">
                <Button className="bg-black text-white hover:bg-neutral-800">Request a Valuation</Button>
              </Link>
              <Link href="/selling-strategy">
                <Button variant="outline" className="border-black text-black hover:bg-neutral-100">Learn About Selling</Button>
              </Link>
            </div>
          </div>
        </section>
      </div>
    </Layout>
  );
}