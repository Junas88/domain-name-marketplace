import { useEffect } from "react";
import Layout from "@/components/Layout";
import DomainFinder from "@/components/DomainFinder";
import { Shield, CheckCircle, Award, Sparkles } from "lucide-react";

export default function DomainFinderPage() {
  useEffect(() => {
    document.title = "Domain Finder Service | DOMAIN NAME GUIDE";
  }, []);

  return (
    <Layout>
      <div className="min-h-screen">
        {/* Header Section */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto text-center">
              <h1 className="text-4xl md:text-5xl font-bold mb-6">
                Expert Domain Name Finder Service
              </h1>
              <p className="text-lg text-neutral-700 mb-8">
                Find the perfect domain name for your business with our expert consultation service. 
                Our domain specialists will help you discover and acquire the ideal domain that aligns with your brand.
              </p>
            </div>
          </div>
        </section>

        {/* Service Features */}
        <section className="py-12 bg-neutral-50 border-y border-black">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-6xl mx-auto">
              <h2 className="text-3xl font-bold mb-12 text-center">Our Domain Name Finder Services</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-white p-6 rounded-lg border border-black flex flex-col items-start">
                  <Shield className="h-10 w-10 text-green-600 mb-4" />
                  <h3 className="text-xl font-semibold mb-3">Premium Domain Acquisition</h3>
                  <p className="text-neutral-700">
                    We help you acquire high-value premium domains that may already be owned but not actively listed. 
                    Our experts will negotiate the best possible price on your behalf.
                  </p>
                </div>
                
                <div className="bg-white p-6 rounded-lg border border-black flex flex-col items-start">
                  <CheckCircle className="h-10 w-10 text-green-600 mb-4" />
                  <h3 className="text-xl font-semibold mb-3">Brand-Matched Domain Search</h3>
                  <p className="text-neutral-700">
                    We'll find domain names that perfectly match your brand identity and business goals,
                    ensuring consistent branding across all digital channels.
                  </p>
                </div>
                
                <div className="bg-white p-6 rounded-lg border border-black flex flex-col items-start">
                  <Award className="h-10 w-10 text-green-600 mb-4" />
                  <h3 className="text-xl font-semibold mb-3">Industry-Specific Domain Consultation</h3>
                  <p className="text-neutral-700">
                    Get domain recommendations tailored to your specific industry with keywords that 
                    drive relevant traffic and improve your search engine rankings.
                  </p>
                </div>
                
                <div className="bg-white p-6 rounded-lg border border-black flex flex-col items-start">
                  <Sparkles className="h-10 w-10 text-green-600 mb-4" />
                  <h3 className="text-xl font-semibold mb-3">Startup Domain Strategy</h3>
                  <p className="text-neutral-700">
                    Special domain naming services for startups looking to establish their brand
                    with a memorable, brandable domain that attracts investors and customers.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Main Consultation Form */}
        <DomainFinder />

        {/* Testimonials Section */}
        <section className="py-16 bg-white border-t border-black">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-6xl mx-auto">
              <h2 className="text-3xl font-bold mb-10 text-center">What Our Clients Say</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="bg-neutral-50 p-6 rounded-lg border border-neutral-200">
                  <div className="flex items-center mb-4">
                    <div className="text-amber-400 flex">
                      {"★★★★★".split("").map((star, i) => (
                        <span key={i}>{star}</span>
                      ))}
                    </div>
                  </div>
                  <p className="text-neutral-800 italic mb-4">
                    "The domain consultant found us the perfect .com domain for our tech startup. 
                    The domain name was short, memorable, and perfectly aligned with our brand. Worth every penny!"
                  </p>
                  <div className="text-sm text-neutral-700 font-medium">
                    - Michael R., CEO of TechStart
                  </div>
                </div>
                
                <div className="bg-neutral-50 p-6 rounded-lg border border-neutral-200">
                  <div className="flex items-center mb-4">
                    <div className="text-amber-400 flex">
                      {"★★★★★".split("").map((star, i) => (
                        <span key={i}>{star}</span>
                      ))}
                    </div>
                  </div>
                  <p className="text-neutral-800 italic mb-4">
                    "We were struggling to find a domain that wasn't already taken. The domain experts 
                    not only found us several options but also helped negotiate the purchase of our 
                    first-choice domain from its previous owner."
                  </p>
                  <div className="text-sm text-neutral-700 font-medium">
                    - Sarah T., Marketing Director
                  </div>
                </div>
                
                <div className="bg-neutral-50 p-6 rounded-lg border border-neutral-200">
                  <div className="flex items-center mb-4">
                    <div className="text-amber-400 flex">
                      {"★★★★★".split("").map((star, i) => (
                        <span key={i}>{star}</span>
                      ))}
                    </div>
                  </div>
                  <p className="text-neutral-800 italic mb-4">
                    "As a small business owner, I had no idea how important the right domain was until 
                    I worked with Domain Name Guide. They helped me secure a domain that was easy to remember 
                    and perfectly suited for my local business."
                  </p>
                  <div className="text-sm text-neutral-700 font-medium">
                    - David L., Small Business Owner
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </Layout>
  );
}