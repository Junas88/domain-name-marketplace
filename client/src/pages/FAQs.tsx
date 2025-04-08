import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import Layout from "@/components/Layout";
import { HelpCircle } from "lucide-react";

export default function FAQs() {
  const faqs = [
    {
      question: "How does buying a domain on TakeMyName.com work?",
      answer: "Purchasing a domain on TakeMyName.com is simple and secure. You can click the 'Buy Now' button on any domain listing to make an immediate purchase at the listed price. All transactions are securely processed through GoDaddy, ensuring a safe transfer of ownership. After purchase, you'll receive instructions on accessing your new domain."
    },
    {
      question: "What is the difference between 'Buy Now' and 'Make Offer'?",
      answer: "'Buy Now' allows you to purchase the domain immediately at the listed price. 'Make Offer' lets you submit a bid below the asking price that the domain owner can review. If your offer is accepted, you'll be notified and can complete the purchase. It's a great option if you're working with a specific budget."
    },
    {
      question: "How is the domain transfer handled after purchase?",
      answer: "Domain transfers are processed through GoDaddy's secure infrastructure. After your payment is confirmed, you'll receive an email with transfer instructions. The process typically takes 5-7 business days to complete. During this time, our customer support team is available to help with any questions."
    },
    {
      question: "Is my payment information secure?",
      answer: "Yes, all payment information is encrypted and secured. We use trusted payment processors and never store your credit card details on our servers. Additionally, all domain transactions are processed through GoDaddy's secure payment system, providing an extra layer of protection."
    },
    {
      question: "What happens if the domain I want is already sold?",
      answer: "Domains marked as 'Sold' are no longer available for purchase. However, we add new premium domains regularly. You can also use our Domain Name Finder service where our experts help you find alternative domains that match your business needs."
    },
    {
      question: "Can I sell my domain on TakeMyName.com?",
      answer: "Yes! We welcome domain sellers with quality names. To list your domain with us, visit our <a href='/selling-strategy' className='text-blue-600 hover:underline'>Selling Strategy</a> page or contact our team at <a href='mailto:sales@takemyname.com' className='text-blue-600 hover:underline'>sales@takemyname.com</a>. We'll help you determine a competitive price and list your domain on our marketplace."
    },
    {
      question: "What makes a domain name valuable?",
      answer: "Several factors influence a domain's value: length (shorter is typically better), memorability, keyword relevance, extension (.com domains are generally most valuable), brandability, and industry relevance. Visit our <a href='/domain-valuation' className='text-blue-600 hover:underline'>Domain Valuation</a> page to learn more about what makes domains valuable."
    },
    {
      question: "What if I need help finding the perfect domain?",
      answer: "Our Domain Name Finder service helps businesses find the ideal domain. Our experts consider your industry, brand identity, and business goals to recommend the best options. Simply fill out the consultation form on our website, and one of our domain specialists will contact you within 48 hours."
    },
    {
      question: "How long does the domain transfer process take?",
      answer: "Once purchased, domain transfers typically take 5-7 business days to complete. This timeline can vary depending on the responsiveness of both parties and the domain registrar. Rest assured, we have a streamlined process to make the transfer as quick and smooth as possible."
    },
    {
      question: "Do you offer any guarantees on domain purchases?",
      answer: "Yes, all domain purchases through TakeMyName.com come with our Buyer Protection Guarantee. This ensures your transaction is securely processed through GoDaddy, the domain is free of legal issues, and the transfer process is properly completed. If you encounter any problems, our support team is available to assist."
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
                <HelpCircle className="mr-3 h-10 w-10 text-green-500" />
                Frequently Asked Questions
              </h1>
              <p className="text-lg md:text-xl opacity-90 mb-8">
                Find answers to the most common questions about domain purchasing, selling, and transferring on TakeMyName.com
              </p>
            </div>
          </div>
        </section>
        
        {/* FAQs Content */}
        <section className="py-16">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
            <Accordion type="single" collapsible className="space-y-4">
              {faqs.map((faq, index) => (
                <AccordionItem key={index} value={`item-${index}`} className="border border-neutral-200 rounded-md">
                  <AccordionTrigger className="px-4 py-4 text-lg font-medium">{faq.question}</AccordionTrigger>
                  <AccordionContent className="px-4 pb-4 pt-2">
                    <div dangerouslySetInnerHTML={{ __html: faq.answer }} />
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
            
            <div className="mt-16 text-center">
              <h3 className="text-2xl font-bold mb-6">Still have questions?</h3>
              <div className="flex flex-col sm:flex-row justify-center gap-4">
                <Link href="/contact">
                  <Button className="bg-black text-white hover:bg-neutral-800">Contact Support</Button>
                </Link>
                <Link href="/#domain-finder">
                  <Button variant="outline" className="border-black text-black hover:bg-neutral-100">
                    Request a Consultation
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>
      </div>
    </Layout>
  );
}