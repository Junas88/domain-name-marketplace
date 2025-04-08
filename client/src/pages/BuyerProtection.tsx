import Layout from "@/components/Layout";
import { Shield, CheckCircle, AlertTriangle, CreditCard, Lock } from "lucide-react";

export default function BuyerProtection() {
  return (
    <Layout>
      {/* Hero Section */}
      <section className="py-12 md:py-16 lg:py-20 bg-black text-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 flex items-center justify-center">
              <Shield className="mr-3 h-10 w-10 text-green-500" />
              Buyer Protection
            </h1>
            <p className="text-lg md:text-xl opacity-90 mb-8">
              Your safety and security is our top priority
            </p>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-12 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <div className="prose prose-lg max-w-none">
              <h2 className="text-3xl font-bold mb-6">How We Protect Your Purchase</h2>
              
              <p className="text-lg text-gray-700 mb-8">
                At TakeMyName.com, we understand that buying domain names can be a significant investment. 
                That's why we've partnered with GoDaddy, the world's largest domain registrar, to provide 
                you with a secure, reliable, and trusted purchasing experience.
              </p>

              <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 mb-8">
                <h3 className="text-xl font-bold flex items-center mb-4">
                  <Lock className="mr-2 h-6 w-6 text-green-600" />
                  Secure Transactions through GoDaddy
                </h3>
                <p className="text-gray-700">
                  All domain purchases on TakeMyName.com are processed through GoDaddy's secure platform. 
                  When you purchase a domain with the "Buy It Now" option, the transaction is handled by 
                  GoDaddy's infrastructure, ensuring your payment information is protected with industry-standard 
                  encryption and security protocols.
                </p>
              </div>

              <h3 className="text-2xl font-bold mb-4">Why We Use GoDaddy</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div className="border border-gray-200 rounded-lg p-5">
                  <div className="flex items-start mb-3">
                    <CheckCircle className="h-6 w-6 text-green-600 mr-2 mt-1 flex-shrink-0" />
                    <h4 className="text-lg font-semibold">Trusted Industry Leader</h4>
                  </div>
                  <p className="text-gray-700">
                    GoDaddy has been in business for over 20 years with millions of customers worldwide, making it one of the most trusted names in domain registration.
                  </p>
                </div>
                
                <div className="border border-gray-200 rounded-lg p-5">
                  <div className="flex items-start mb-3">
                    <CheckCircle className="h-6 w-6 text-green-600 mr-2 mt-1 flex-shrink-0" />
                    <h4 className="text-lg font-semibold">Secure Transfer Process</h4>
                  </div>
                  <p className="text-gray-700">
                    When you buy a domain, GoDaddy ensures a smooth and secure transfer process, protecting both buyers and sellers throughout the transaction.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div className="border border-gray-200 rounded-lg p-5">
                  <div className="flex items-start mb-3">
                    <CheckCircle className="h-6 w-6 text-green-600 mr-2 mt-1 flex-shrink-0" />
                    <h4 className="text-lg font-semibold">Payment Protection</h4>
                  </div>
                  <p className="text-gray-700">
                    Your payment information is protected with industry-standard SSL encryption and never stored on our servers.
                  </p>
                </div>
                
                <div className="border border-gray-200 rounded-lg p-5">
                  <div className="flex items-start mb-3">
                    <CheckCircle className="h-6 w-6 text-green-600 mr-2 mt-1 flex-shrink-0" />
                    <h4 className="text-lg font-semibold">Customer Support</h4>
                  </div>
                  <p className="text-gray-700">
                    Access to GoDaddy's world-class customer support team for any issues related to your domain purchase or transfer.
                  </p>
                </div>
              </div>

              <h3 className="text-2xl font-bold mb-4">Our Purchase Process</h3>
              
              <ol className="space-y-6 mb-8">
                <li className="flex items-start">
                  <div className="bg-black text-white rounded-full w-8 h-8 flex items-center justify-center font-bold mr-3 flex-shrink-0 mt-1">1</div>
                  <div>
                    <h4 className="text-lg font-semibold">Select Your Domain</h4>
                    <p className="text-gray-700">Browse our curated selection of premium domains and select the one that's perfect for your business.</p>
                  </div>
                </li>
                
                <li className="flex items-start">
                  <div className="bg-black text-white rounded-full w-8 h-8 flex items-center justify-center font-bold mr-3 flex-shrink-0 mt-1">2</div>
                  <div>
                    <h4 className="text-lg font-semibold">Secure Checkout via GoDaddy</h4>
                    <p className="text-gray-700">When you click "Buy It Now," you'll be directed to GoDaddy's secure checkout process where your payment information is protected.</p>
                  </div>
                </li>
                
                <li className="flex items-start">
                  <div className="bg-black text-white rounded-full w-8 h-8 flex items-center justify-center font-bold mr-3 flex-shrink-0 mt-1">3</div>
                  <div>
                    <h4 className="text-lg font-semibold">Domain Transfer</h4>
                    <p className="text-gray-700">GoDaddy handles the secure transfer of the domain into your account, ensuring everything is properly processed.</p>
                  </div>
                </li>
                
                <li className="flex items-start">
                  <div className="bg-black text-white rounded-full w-8 h-8 flex items-center justify-center font-bold mr-3 flex-shrink-0 mt-1">4</div>
                  <div>
                    <h4 className="text-lg font-semibold">Take Ownership</h4>
                    <p className="text-gray-700">Once the transfer is complete, you have full ownership and control of your new domain through your GoDaddy account.</p>
                  </div>
                </li>
              </ol>

              <div className="bg-yellow-50 border-l-4 border-yellow-400 p-5 mb-8">
                <div className="flex">
                  <AlertTriangle className="h-6 w-6 text-yellow-600 mr-3 flex-shrink-0" />
                  <div>
                    <h4 className="text-lg font-semibold text-yellow-800">Important Note</h4>
                    <p className="text-yellow-700">
                      Be wary of domain sellers who don't use established escrow services or reputable registrars like GoDaddy for transactions. 
                      TakeMyName.com exclusively uses GoDaddy to ensure your purchase is protected.
                    </p>
                  </div>
                </div>
              </div>

              <h3 className="text-2xl font-bold mb-4">Payment Methods</h3>
              <p className="text-gray-700 mb-4">
                Through GoDaddy's secure platform, we accept all major payment methods:
              </p>
              
              <div className="flex flex-wrap gap-6 mb-8">
                <div className="flex items-center border border-gray-200 rounded-lg p-3">
                  <CreditCard className="h-6 w-6 text-blue-600 mr-2" />
                  <span className="font-medium">Credit Cards</span>
                </div>
                <div className="flex items-center border border-gray-200 rounded-lg p-3">
                  <CreditCard className="h-6 w-6 text-green-600 mr-2" />
                  <span className="font-medium">Debit Cards</span>
                </div>
                <div className="flex items-center border border-gray-200 rounded-lg p-3">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-700 mr-2" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M20.067 8.478c.492.88.556 2.014.3 3.327-.74 3.806-3.276 5.12-6.514 5.12h-.5a.805.805 0 0 0-.794.68l-.04.22-.63 4.026-.033.17a.804.804 0 0 1-.794.679h-2.52c-.092 0-.17-.066-.185-.156a.75.75 0 0 1 0-.236l.744-4.722v-.18c0-.013.003-.026.007-.034a.1.1 0 0 1 .014-.035.211.211 0 0 1 .01-.019c.014-.018.03-.032.048-.046a.152.152 0 0 1 .01-.007c.01-.006.022-.013.034-.017a.112.112 0 0 1 .036-.008h.025l.008-.001h.928c3.787 0 6.8-1.587 7.69-6.152.034-.22.155-1.387-.042-2.082-.013-.046-.02-.07-.035-.094" />
                    <path d="M18.036 5.568c-.577-.937-1.676-1.413-3.065-1.413h-6.22c-.3 0-.576.159-.662.425l-2.2 13.933a.397.397 0 0 0 .392.46h2.865l.727-4.61.041-.265a.658.658 0 0 1 .65-.425h1.38c2.676 0 4.778-1.086 5.385-4.242.799-4.135-2.196-5.277-3.865-5.138" />
                  </svg>
                  <span className="font-medium">PayPal</span>
                </div>
                <div className="flex items-center border border-gray-200 rounded-lg p-3">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="2" y="6" width="20" height="12" rx="2" />
                    <path d="M7 12h.01M11 12h2M16 12h.01" />
                  </svg>
                  <span className="font-medium">Bank Transfer</span>
                </div>
              </div>

              <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                <h3 className="text-xl font-bold flex items-center text-green-800 mb-4">
                  <Shield className="mr-2 h-6 w-6 text-green-600" />
                  Our Commitment to Your Security
                </h3>
                <p className="text-green-700 mb-4">
                  TakeMyName.com is committed to providing you with a secure and trustworthy platform for your domain investments. 
                  By partnering with GoDaddy, we ensure that every transaction is protected by industry-leading security measures.
                </p>
                <p className="text-green-700">
                  If you have any questions about our buyer protection policies or would like more information about our partnership with GoDaddy, 
                  please don't hesitate to <a href="/contact" className="text-green-600 font-semibold underline">contact our support team</a>.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}