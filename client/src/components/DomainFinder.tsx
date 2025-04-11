import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";

// Form validation schema
const consultationSchema = z.object({
  name: z.string().min(2, "Name is required"),
  email: z.string().email("Valid email is required"),
  industry: z.string().min(1, "Please select your industry"),
  message: z.string().min(10, "Please provide some details about your business"),
  budget: z.string().min(1, "Please select your budget"),
});

type ConsultationFormValues = z.infer<typeof consultationSchema>;

export default function DomainFinder() {
  const { toast } = useToast();
  const form = useForm<ConsultationFormValues>({
    resolver: zodResolver(consultationSchema),
    defaultValues: {
      name: "",
      email: "",
      industry: "",
      message: "",
      budget: "",
    },
  });

  const { mutate, isPending } = useMutation({
    mutationFn: async (data: ConsultationFormValues) => {
      const response = await apiRequest("/api/consultations", {
        method: "POST",
        body: JSON.stringify(data)
      });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Consultation Booked",
        description: "We've received your request and will contact you soon.",
      });
      form.reset();
    },
    onError: (error) => {
      toast({
        title: "Booking Failed",
        description: error.message || "There was a problem booking your consultation.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: ConsultationFormValues) => {
    mutate(data);
  };

  return (
    <section id="domain-finder" className="py-16 bg-white" aria-labelledby="domain-finder-heading">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row gap-12">
            {/* Domain Finder content */}
            <div className="w-full">
              <h2 id="domain-finder-heading" className="text-4xl font-bold mb-8 text-center md:text-left">Free Domain Name Consultation</h2>
              <p className="text-neutral-700 mb-8 text-lg">
                Not sure which domain is right for your business? Our domain experts can help you find the perfect domain name that fits your brand and business goals. We specialize in premium domain acquisition, brand-matching domains, and industry-specific domain consultations.
              </p>
              
              {/* Hidden SEO keywords */}
              <div className="sr-only">
                Domain consultation, domain finder, domain broker, premium domain acquisition, business domain names, startup domain names, domain name ideas, domain name service, domain expert, brand domains
              </div>
              
              <Card className="bg-white border-2 border-black shadow-lg">
                <CardContent className="p-8">
                  <h3 className="text-2xl font-semibold mb-6">Book Your Free Domain Consultation</h3>
                  
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4" aria-label="Domain consultation booking form">
                      <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel htmlFor="name">Your Name</FormLabel>
                            <FormControl>
                              <Input id="name" placeholder="Enter your full name" className="border-gray-300 focus:border-black focus-visible:ring-black" aria-required="true" {...field} />
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
                            <FormLabel htmlFor="email">Email Address</FormLabel>
                            <FormControl>
                              <Input id="email" type="email" placeholder="you@example.com" className="border-gray-300 focus:border-black focus-visible:ring-black" aria-required="true" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="industry"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel htmlFor="industry">Your Industry</FormLabel>
                            <Select 
                              onValueChange={field.onChange} 
                              defaultValue={field.value}
                              name="industry"
                            >
                              <FormControl>
                                <SelectTrigger id="industry" className="border-gray-300 focus:border-black focus:ring-black" aria-required="true">
                                  <SelectValue placeholder="Select your industry" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="tech">Technology</SelectItem>
                                <SelectItem value="health">Healthcare</SelectItem>
                                <SelectItem value="education">Education</SelectItem>
                                <SelectItem value="finance">Finance</SelectItem>
                                <SelectItem value="ecommerce">E-commerce</SelectItem>
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
                            <FormLabel htmlFor="message">Tell us about your business</FormLabel>
                            <FormControl>
                              <Textarea 
                                id="message" 
                                rows={4} 
                                placeholder="Describe your business, target audience, and what kind of domain you're looking for" 
                                className="border-gray-300 focus:border-black focus-visible:ring-black"
                                aria-required="true"
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="budget"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel htmlFor="budget">Budget Range</FormLabel>
                            <Select 
                              onValueChange={field.onChange} 
                              defaultValue={field.value}
                              name="budget"
                            >
                              <FormControl>
                                <SelectTrigger id="budget" className="border-gray-300 focus:border-black focus:ring-black" aria-required="true">
                                  <SelectValue placeholder="Select your budget" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="low">Under $1,000</SelectItem>
                                <SelectItem value="medium">$1,000 - $5,000</SelectItem>
                                <SelectItem value="high">$5,000 - $15,000</SelectItem>
                                <SelectItem value="premium">$15,000+</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <Button 
                        type="submit" 
                        className="w-full bg-black text-white hover:bg-neutral-800 py-6 text-lg mt-4" 
                        disabled={isPending}
                        aria-label="Submit consultation request"
                      >
                        {isPending ? "Booking..." : "Book Your Free Consultation"}
                      </Button>
                    </form>
                  </Form>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
