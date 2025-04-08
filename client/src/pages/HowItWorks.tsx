import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { 
  SearchCheck, 
  DollarSign, 
  ShieldCheck, 
  FileCheck, 
  Wallet, 
  Users,
  ArrowRight,
  Info
} from "lucide-react";
import Layout from "@/components/Layout";

export default function HowItWorks() {
  const buyingSteps = [
    {
      title: "Find Your Domain",
      description: "Browse our curated selection of premium domains or use filters to find the perfect match for your business.",
      icon: <SearchCheck className="h-8 w-8 text-neutral-800" />
    },
    {
      title: "Secure Your Purchase",
      description: "Choose to buy instantly at the listed price or make an offer. All transactions are secure and protected.",
      icon: <DollarSign className="h-8 w-8 text-neutral-800" />
    },
    {
      title: "Complete Transfer",
      description: "Once payment is confirmed, the domain transfer process begins through GoDaddy's secure infrastructure.",
      icon: <ShieldCheck className="h-8 w-8 text-neutral-800" />
    }
  ];

  const sellingSteps = [
    {
      title: "Submit Your Domain",
      description: "Contact us with details about your domain. Our experts will evaluate it and suggest an optimal listing price.",
      icon: <FileCheck className="h-8 w-8 text-neutral-800" />
    },
    {
      title: "List and Market",
      description: "Once approved, we'll list your domain on our marketplace and use our marketing strategies to find potential buyers.",
      icon: <Users className="h-8 w-8 text-neutral-800" />
    },
    {
      title: "Get Paid Securely",
      description: "When your domain sells, the payment is securely processed, and you receive the funds promptly after transfer completion.",
      icon: <Wallet className="h-8 w-8 text-neutral-800" />
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
                <Info className="mr-3 h-10 w-10 text-green-500" />
                How TakeMyName.com Works
              </h1>
              <p className="text-lg md:text-xl opacity-90 mb-8">
                Your straightforward guide to buying and selling premium domain names with confidence and security
              </p>
            </div>
          </div>
        </section>
        
        {/* How It Works - Buying */}
        <section className="py-16 border-b border-neutral-200">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
            <h2 className="text-3xl font-bold mb-12 text-center">Buying a Domain</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {buyingSteps.map((step, index) => (
                <div key={index} className="flex flex-col items-center text-center">
                  <div className="bg-neutral-50 p-4 rounded-full mb-4 border border-neutral-200">
                    {step.icon}
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
                  <p className="text-neutral-600">{step.description}</p>
                </div>
              ))}
            </div>
            
            <div className="mt-12 text-center">
              <Link href="/#domains">
                <Button className="bg-black text-white hover:bg-neutral-800">
                  Browse Available Domains
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </section>
        
        {/* How It Works - Selling */}
        <section className="py-16">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
            <h2 className="text-3xl font-bold mb-12 text-center">Selling a Domain</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {sellingSteps.map((step, index) => (
                <div key={index} className="flex flex-col items-center text-center">
                  <div className="bg-neutral-50 p-4 rounded-full mb-4 border border-neutral-200">
                    {step.icon}
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
                  <p className="text-neutral-600">{step.description}</p>
                </div>
              ))}
            </div>
            
            <div className="mt-12 text-center">
              <Link href="/selling-strategy">
                <Button className="bg-black text-white hover:bg-neutral-800">
                  Learn About Selling
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </section>
        
        {/* Security & Trust */}
        <section className="py-16 bg-neutral-50 border-t border-neutral-200">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
            <h2 className="text-3xl font-bold mb-8 text-center">Our Commitment to Security</h2>
            <p className="text-lg text-center text-neutral-600 mb-12">
              At TakeMyName.com, we prioritize secure transactions and transparent processes.
            </p>
            
            <div className="bg-white border border-neutral-200 rounded-lg p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <ShieldCheck className="h-8 w-8 text-green-600" />
                <h3 className="text-2xl font-semibold">Buyer Protection Guarantee</h3>
              </div>
              <p className="text-neutral-700 mb-6">
                All domain purchases on TakeMyName.com are securely processed through GoDaddy, the world's largest domain registrar. This ensures:
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-start gap-2">
                  <div className="mt-1 flex-shrink-0">
                    <div className="h-5 w-5 rounded-full bg-green-100 flex items-center justify-center">
                      <div className="h-2 w-2 rounded-full bg-green-600"></div>
                    </div>
                  </div>
                  <p className="text-neutral-600">Secure payment processing</p>
                </div>
                <div className="flex items-start gap-2">
                  <div className="mt-1 flex-shrink-0">
                    <div className="h-5 w-5 rounded-full bg-green-100 flex items-center justify-center">
                      <div className="h-2 w-2 rounded-full bg-green-600"></div>
                    </div>
                  </div>
                  <p className="text-neutral-600">Protected domain transfers</p>
                </div>
                <div className="flex items-start gap-2">
                  <div className="mt-1 flex-shrink-0">
                    <div className="h-5 w-5 rounded-full bg-green-100 flex items-center justify-center">
                      <div className="h-2 w-2 rounded-full bg-green-600"></div>
                    </div>
                  </div>
                  <p className="text-neutral-600">Escrow services for all transactions</p>
                </div>
                <div className="flex items-start gap-2">
                  <div className="mt-1 flex-shrink-0">
                    <div className="h-5 w-5 rounded-full bg-green-100 flex items-center justify-center">
                      <div className="h-2 w-2 rounded-full bg-green-600"></div>
                    </div>
                  </div>
                  <p className="text-neutral-600">Fraud prevention and monitoring</p>
                </div>
              </div>
            </div>
          </div>
        </section>
        
        {/* Call to Action */}
        <section className="py-16 border-t border-neutral-200">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-3xl text-center">
            <h2 className="text-3xl font-bold mb-6">Ready to Get Started?</h2>
            <p className="text-lg text-neutral-600 mb-8">
              Whether you're looking to buy a premium domain or sell one you own, we're here to make the process seamless and secure.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link href="/#domains">
                <Button className="bg-black text-white hover:bg-neutral-800">Find Your Domain</Button>
              </Link>
              <Link href="/selling-strategy">
                <Button variant="outline" className="border-black text-black hover:bg-neutral-100">Sell Your Domain</Button>
              </Link>
            </div>
          </div>
        </section>
      </div>
    </Layout>
  );
}