import { Check, ShieldCheck, Headphones } from "lucide-react";

export default function Features() {
  return (
    <section className="py-16 bg-white border-t border-black">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-black text-center mb-12">Why Choose DomainnameGuide.com?</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Feature 1 */}
          <div className="bg-white p-6 border border-black text-center">
            <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 border border-black">
              <Check className="text-black text-2xl" />
            </div>
            <h3 className="text-xl font-semibold mb-3">Verified Domains</h3>
            <p className="text-neutral-700">All our domains are verified for quality and legitimacy before listing.</p>
          </div>
          
          {/* Feature 2 */}
          <div className="bg-white p-6 border border-black text-center">
            <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 border border-black">
              <ShieldCheck className="text-black text-2xl" />
            </div>
            <h3 className="text-xl font-semibold mb-3">Secure Transfers</h3>
            <p className="text-neutral-700">We ensure safe and secure domain transfers with our trusted partner GoDaddy.</p>
          </div>
          
          {/* Feature 3 */}
          <div className="bg-white p-6 border border-black text-center">
            <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 border border-black">
              <Headphones className="text-black text-2xl" />
            </div>
            <h3 className="text-xl font-semibold mb-3">Expert Support</h3>
            <p className="text-neutral-700">Our domain experts are available to help you find the perfect domain for your needs.</p>
          </div>
        </div>
      </div>
    </section>
  );
}
