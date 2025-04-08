import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import {
  LineChart,
  TrendingUp,
  Timer,
  Lightbulb,
  Target,
  Presentation,
  CheckCircle,
  XCircle,
  ArrowRight,
  DollarSign
} from "lucide-react";
import Layout from "@/components/Layout";

export default function SellingStrategy() {
  const sellingAdvantages = [
    {
      title: "Expert Valuation",
      description: "Our domain specialists accurately value your domain using market data and industry expertise to ensure optimal pricing.",
      icon: <LineChart className="h-6 w-6 text-neutral-800" />
    },
    {
      title: "Premium Marketplace",
      description: "List your domain alongside other premium names, attracting serious buyers who are specifically looking for quality domains.",
      icon: <Target className="h-6 w-6 text-neutral-800" />
    },
    {
      title: "Faster Sales",
      description: "Our platform connects you with motivated buyers, reducing the time your domain sits on the market without compromising on price.",
      icon: <Timer className="h-6 w-6 text-neutral-800" />
    },
    {
      title: "Marketing Strategy",
      description: "We actively promote your domain to relevant industries and potential buyers through targeted digital marketing strategies.",
      icon: <TrendingUp className="h-6 w-6 text-neutral-800" />
    }
  ];

  const pricingBestPractices = [
    {
      title: "Research Comparable Sales",
      description: "Look at recent sales of similar domains to establish a realistic price range."
    },
    {
      title: "Consider 'Buy Now' and 'Make Offer' Options",
      description: "Set a firm 'Buy Now' price while allowing potential buyers to submit offers, giving you flexibility."
    },
    {
      title: "Price According to Extension Value",
      description: ".com domains typically command higher prices than other extensions, price accordingly."
    },
    {
      title: "Account for Industry Value",
      description: "Domains in high-value industries like finance, insurance, and technology can command premium prices."
    }
  ];

  const pricingMistakes = [
    {
      title: "Overpricing Based on Personal Attachment",
      description: "Emotional attachment to your domain can lead to unrealistic price expectations and extended listing periods."
    },
    {
      title: "Ignoring Market Comparables",
      description: "Setting prices without researching similar domain sales can result in missed opportunities."
    },
    {
      title: "Undervaluing Premium Attributes",
      description: "Failing to recognize valuable characteristics like brevity, brandability, or keyword value can lead to underpricing."
    },
    {
      title: "Setting a Single Fixed Price",
      description: "Not providing flexibility through 'Make Offer' options can deter potential buyers who might pay close to your asking price."
    }
  ];

  const sellingProcess = [
    {
      title: "Submit Your Domain",
      description: "Provide details about your domain for our experts to review and evaluate.",
      details: [
        "Complete our seller submission form with domain details",
        "Include any relevant information about traffic, history, or previous offers",
        "Our team will acknowledge receipt within 24 hours"
      ]
    },
    {
      title: "Expert Valuation",
      description: "Our domain specialists will assess your domain's market value and provide pricing recommendations.",
      details: [
        "Comprehensive market analysis and comparison to recent sales",
        "Evaluation of keywords, industry relevance, and technical factors",
        "Detailed valuation report with pricing recommendations"
      ]
    },
    {
      title: "Marketing & Listing",
      description: "Once you approve the valuation, we'll create a compelling listing and implement targeted marketing strategies.",
      details: [
        "Professional domain listing with optimized description",
        "Inclusion in our premium marketplace",
        "Targeted outreach to potential buyers in relevant industries",
        "Digital marketing campaigns to increase visibility"
      ]
    },
    {
      title: "Offer Management",
      description: "We handle negotiations with potential buyers to maximize your return while filtering out non-serious inquiries.",
      details: [
        "Screening of potential buyers",
        "Professional negotiation on your behalf",
        "Regular updates on offers and interest",
        "Guidance on when to accept or counter"
      ]
    },
    {
      title: "Secure Transaction",
      description: "Once a deal is agreed upon, we facilitate a secure transaction and domain transfer through GoDaddy.",
      details: [
        "Secure escrow service through GoDaddy",
        "Protected payment processing",
        "Step-by-step guidance through the transfer process",
        "Verification of payment before domain release"
      ]
    }
  ];

  const successStories = [
    {
      domain: "healthtracker.com",
      initialValuation: "$15,000",
      finalSale: "$32,500",
      timeToSell: "45 days",
      testimonial: "I had been sitting on my domain for years without any serious offers. The TakeMyName team not only found the right buyer but negotiated a price that exceeded my expectations by more than double what I thought it was worth.",
      seller: "Michael T., Health Tech Entrepreneur"
    },
    {
      domain: "cryptobanking.com",
      initialValuation: "$28,000",
      finalSale: "$45,000",
      timeToSell: "30 days",
      testimonial: "The expertise of the TakeMyName team was evident from our first conversation. They understood the value of my domain in the crypto space and connected me with serious buyers almost immediately.",
      seller: "Sarah K., Fintech Investor"
    },
    {
      domain: "travelexperts.com",
      initialValuation: "$18,000",
      finalSale: "$26,000",
      timeToSell: "60 days",
      testimonial: "After trying to sell my domain myself for months, I turned to TakeMyName. Their marketing strategy and negotiation skills made all the difference. The process was smooth, and I received regular updates throughout.",
      seller: "David L., Digital Nomad"
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
                <DollarSign className="mr-3 h-10 w-10 text-green-500" />
                Domain Selling Strategy
              </h1>
              <p className="text-lg md:text-xl opacity-90 mb-8">
                Expert guidance on maximizing the value of your domain name investment
              </p>
            </div>
          </div>
        </section>
        
        {/* Why Sell With Us */}
        <section className="py-16 border-b border-neutral-200">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
            <h2 className="text-3xl font-bold mb-6 text-center">Why Sell With TakeMyName.com</h2>
            <p className="text-lg text-center text-neutral-600 mb-10">
              Partnering with us provides advantages that help you maximize your domain's value and find qualified buyers faster.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {sellingAdvantages.map((advantage, index) => (
                <div key={index} className="flex gap-4">
                  <div className="flex-shrink-0">
                    <div className="bg-neutral-50 p-3 rounded-lg border border-neutral-200">
                      {advantage.icon}
                    </div>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-2">{advantage.title}</h3>
                    <p className="text-neutral-600">{advantage.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
        
        {/* Pricing Strategy */}
        <section className="py-16 bg-neutral-50 border-b border-neutral-200">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
            <h2 className="text-3xl font-bold mb-6">Pricing Your Domain Effectively</h2>
            <p className="text-lg text-neutral-600 mb-10">
              Setting the right price is crucial to attracting serious buyers while maximizing your return.
            </p>
            
            <div className="bg-white p-6 rounded-lg border border-neutral-200 shadow-sm mb-8">
              <h3 className="text-xl font-semibold mb-4">Best Pricing Practices</h3>
              <ul className="space-y-4">
                {pricingBestPractices.map((practice, index) => (
                  <li key={index} className="flex gap-3">
                    <CheckCircle className="h-6 w-6 text-green-600 flex-shrink-0" />
                    <div>
                      <p className="font-medium">{practice.title}</p>
                      <p className="text-neutral-600 text-sm mt-1">{practice.description}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
            
            <div className="bg-white p-6 rounded-lg border border-neutral-200 shadow-sm">
              <h3 className="text-xl font-semibold mb-4">Pricing Mistakes to Avoid</h3>
              <ul className="space-y-4">
                {pricingMistakes.map((mistake, index) => (
                  <li key={index} className="flex gap-3">
                    <XCircle className="h-6 w-6 text-red-600 flex-shrink-0" />
                    <div>
                      <p className="font-medium">{mistake.title}</p>
                      <p className="text-neutral-600 text-sm mt-1">{mistake.description}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>
        
        {/* Our Process */}
        <section className="py-16 border-b border-neutral-200">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
            <h2 className="text-3xl font-bold mb-6 text-center">Our Selling Process</h2>
            <p className="text-lg text-center text-neutral-600 mb-12">
              We make selling your domain straightforward, transparent, and efficient.
            </p>
            
            <div className="space-y-12">
              {sellingProcess.map((step, index) => (
                <div key={index} className="relative">
                  {index < sellingProcess.length - 1 && (
                    <div className="absolute left-12 top-20 bottom-0 w-0.5 bg-neutral-200"></div>
                  )}
                  <div className="flex gap-6">
                    <div className="flex-shrink-0">
                      <div className="w-24 h-24 rounded-full bg-black text-white flex items-center justify-center text-2xl font-bold relative z-10">
                        {index + 1}
                      </div>
                    </div>
                    <div className="pt-4">
                      <h3 className="text-2xl font-semibold mb-3">{step.title}</h3>
                      <p className="text-neutral-600 mb-4">{step.description}</p>
                      {step.details && (
                        <ul className="space-y-2 text-sm text-neutral-700">
                          {step.details.map((detail, idx) => (
                            <li key={idx} className="flex items-start gap-2">
                              <div className="mt-1">•</div>
                              <span>{detail}</span>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
        
        {/* Success Stories */}
        <section className="py-16 bg-neutral-50 border-b border-neutral-200">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
            <h2 className="text-3xl font-bold mb-6 text-center">Success Stories</h2>
            <p className="text-lg text-center text-neutral-600 mb-12">
              Read about domain sellers who maximized their returns through our platform.
            </p>
            
            <div className="space-y-8">
              {successStories.map((story, index) => (
                <div key={index} className="bg-white p-6 rounded-lg border border-neutral-200 shadow-sm">
                  <div className="flex flex-col md:flex-row gap-6">
                    <div className="md:w-1/3">
                      <h3 className="text-xl font-semibold mb-2">{story.domain}</h3>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-neutral-600">Initial Valuation:</span>
                          <span className="font-medium">{story.initialValuation}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-neutral-600">Final Sale:</span>
                          <span className="font-medium">{story.finalSale}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-neutral-600">Time to Sell:</span>
                          <span className="font-medium">{story.timeToSell}</span>
                        </div>
                      </div>
                    </div>
                    <div className="md:w-2/3">
                      <p className="text-neutral-700 italic mb-4">"{story.testimonial}"</p>
                      <p className="text-right text-sm font-medium">— {story.seller}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
        
        {/* Call to Action */}
        <section className="py-16">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-3xl text-center">
            <h2 className="text-3xl font-bold mb-6">Ready to Sell Your Domain?</h2>
            <p className="text-lg text-neutral-600 mb-8">
              Our domain experts are ready to help you maximize the value of your digital asset.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link href="/contact">
                <Button className="bg-black text-white hover:bg-neutral-800">
                  Contact Our Sales Team
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link href="/domain-valuation">
                <Button variant="outline" className="border-black text-black hover:bg-neutral-100">
                  Get a Valuation First
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </div>
    </Layout>
  );
}