import { useState } from "react";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import Layout from "@/components/Layout";
import { PageContent } from "@/lib/types";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Mail, Phone, MapPin } from "lucide-react";

// Form validation schema
const contactSchema = z.object({
  name: z.string().min(2, "Name is required"),
  email: z.string().email("Valid email is required"),
  subject: z.string().min(1, "Please select a subject"),
  message: z.string().min(10, "Please provide details in your message"),
});

type ContactFormValues = z.infer<typeof contactSchema>;

export default function Contact() {
  const { toast } = useToast();
  
  // Fetch contact info from our special no-cache API endpoint
  const [contactInfo, setContactInfo] = useState<PageContent | null>(null);
  const [refreshCount, setRefreshCount] = useState(0);
  
  // Force a direct fetch from our special endpoint designed to bypass all caching
  useEffect(() => {
    const fetchContactInfo = async () => {
      try {
        // Use our brand new endpoint specifically designed to bypass all caching
        console.log(`Fetching contact info from fresh-content endpoint, refresh #${refreshCount}`);
        
        // Use our new special endpoint that bypasses all caching on the server side
        const response = await fetch(`/api/fresh-content/contact-info`, {
          // Still add client-side cache headers just to be thorough
          headers: {
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0',
          },
          cache: 'no-store'
        });
        
        if (response.ok) {
          const data = await response.json();
          console.log("Contact info data received from fresh API:", data);
          setContactInfo(data);
        } else {
          console.error("Failed to fetch contact info:", response.status);
        }
      } catch (error) {
        console.error("Error fetching contact info:", error);
      }
    };
    
    fetchContactInfo();
    
    // Set up an interval to refresh the data every 2 seconds when on this page
    const refreshInterval = setInterval(() => {
      setRefreshCount(prev => prev + 1);
    }, 2000);
    
    // Clean up interval on component unmount
    return () => clearInterval(refreshInterval);
  }, [refreshCount]); // Refresh whenever refreshCount changes
  
  const form = useForm<ContactFormValues>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      name: "",
      email: "",
      subject: "",
      message: "",
    },
  });

  const { mutate, isPending } = useMutation({
    mutationFn: async (data: ContactFormValues) => {
      // In a real application, this would send data to an API endpoint
      // For now, we'll just simulate a successful submission
      await new Promise(resolve => setTimeout(resolve, 1000));
      return { success: true };
    },
    onSuccess: () => {
      toast({
        title: "Message Sent",
        description: "Thanks for reaching out! We'll get back to you soon.",
      });
      form.reset();
    },
    onError: (error) => {
      toast({
        title: "Submission Failed",
        description: "There was a problem sending your message. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: ContactFormValues) => {
    mutate(data);
  };

  return (
    <Layout>
      <div className="bg-white">
        {/* Hero Section */}
        <section className="py-12 md:py-16 lg:py-20 bg-black text-white">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto text-center">
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
                Contact Us
              </h1>
              <p className="text-lg md:text-xl opacity-90 mb-8">
                Get in touch with our team for any questions or inquiries
              </p>
            </div>
          </div>
        </section>
      
        {/* Contact Form and Info */}
        <section className="py-16">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-6xl mx-auto">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                {/* Contact Form */}
                <div>
                  <Card className="bg-white border border-black">
                    <CardContent className="p-6">
                      <h2 className="text-2xl font-semibold mb-6">Send Us a Message</h2>
                      
                      <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                          <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Your Name</FormLabel>
                                <FormControl>
                                  <Input {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={form.control}
                            name="email"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Email Address</FormLabel>
                                <FormControl>
                                  <Input type="email" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={form.control}
                            name="subject"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Subject</FormLabel>
                                <Select 
                                  onValueChange={field.onChange} 
                                  defaultValue={field.value}
                                >
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select a subject" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    <SelectItem value="general">General Inquiry</SelectItem>
                                    <SelectItem value="support">Domain Support</SelectItem>
                                    <SelectItem value="sales">Sales Question</SelectItem>
                                    <SelectItem value="partnership">Partnership Opportunity</SelectItem>
                                    <SelectItem value="other">Other</SelectItem>
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={form.control}
                            name="message"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Your Message</FormLabel>
                                <FormControl>
                                  <Textarea rows={5} {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <Button 
                            type="submit" 
                            className="w-full bg-black text-white hover:bg-neutral-800" 
                            disabled={isPending}
                          >
                            {isPending ? "Sending..." : "Send Message"}
                          </Button>
                        </form>
                      </Form>
                    </CardContent>
                  </Card>
                </div>
                
                {/* Contact Information */}
                <div>
                  <h2 className="text-2xl font-semibold mb-6">Get in Touch</h2>
                  <p className="text-neutral-700 mb-6">
                    We're here to help with any questions you might have about our domain marketplace. 
                    Whether you're looking to buy, sell, or just need some advice, our team is ready to assist you.
                  </p>
                  
                  <div className="space-y-6 mb-8">
                    <div className="flex items-start">
                      <Mail className="text-green-600 mt-1 mr-4 shrink-0" size={24} />
                      <div>
                        <h3 className="text-lg font-medium">Email Us</h3>
                        {contactInfo ? (
                          <div dangerouslySetInnerHTML={{ __html: contactInfo.content || "" }} />
                        ) : (
                          <p className="text-neutral-700">support@domainnameguide.com</p>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-start">
                      <Phone className="text-green-600 mt-1 mr-4 shrink-0" size={24} />
                      <div>
                        <h3 className="text-lg font-medium">Call Us</h3>
                        <p className="text-neutral-700">00 212 7 73 73 73 09</p>
                        <p className="text-neutral-700">Monday-Friday, 9am-5pm EST</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="border-t border-gray-200 pt-6">
                    <h3 className="text-lg font-medium mb-4">Connect With Us</h3>
                    <div className="flex space-x-6">
                      <a href="https://facebook.com/DomainNameGuide" className="text-green-600 hover:text-green-800 transition-colors" target="_blank" rel="noopener noreferrer">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
                          <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
                        </svg>
                      </a>
                      <a href="https://x.com/DNbuyandsell" className="text-green-600 hover:text-green-800 transition-colors" target="_blank" rel="noopener noreferrer">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
                          <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"></path>
                        </svg>
                      </a>
                      <a href="https://linkedin.com/company/domainnameguide" className="text-green-600 hover:text-green-800 transition-colors" target="_blank" rel="noopener noreferrer">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
                          <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path>
                          <rect x="2" y="9" width="4" height="12"></rect>
                          <circle cx="4" cy="4" r="2"></circle>
                        </svg>
                      </a>
                      <a href="https://instagram.com/domainnameguide" className="text-green-600 hover:text-green-800 transition-colors" target="_blank" rel="noopener noreferrer">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
                          <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                          <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                          <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                        </svg>
                      </a>
                    </div>
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