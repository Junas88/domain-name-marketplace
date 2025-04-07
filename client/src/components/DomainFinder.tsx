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
      const response = await apiRequest("POST", "/api/consultations", data);
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
    <section id="domain-finder" className="py-16 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row gap-12">
            {/* Left column: Illustration/Image */}
            <div className="md:w-1/2">
              <img 
                src="https://images.unsplash.com/photo-1603201667141-5a2d4c673378?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1000&q=80" 
                alt="Domain Consultation Service" 
                className="rounded-lg shadow-lg w-full h-auto object-cover"
                style={{ maxHeight: "450px" }}
              />
            </div>
            
            {/* Right column: Consultation Form */}
            <div className="md:w-1/2">
              <h2 className="text-3xl font-bold mb-6">Domain Name Finder Service</h2>
              <p className="text-neutral-700 mb-6">
                Not sure which domain is right for your business? Our domain experts can help you find the perfect domain name that fits your brand and business goals.
              </p>
              
              <Card className="bg-neutral-100">
                <CardContent className="p-6">
                  <h3 className="text-xl font-semibold mb-4">Book a Consultation</h3>
                  
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
                        name="industry"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Your Industry</FormLabel>
                            <Select 
                              onValueChange={field.onChange} 
                              defaultValue={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
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
                            <FormLabel>Tell us about your business</FormLabel>
                            <FormControl>
                              <Textarea rows={4} {...field} />
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
                            <FormLabel>Budget Range</FormLabel>
                            <Select 
                              onValueChange={field.onChange} 
                              defaultValue={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
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
                        className="w-full" 
                        disabled={isPending}
                      >
                        {isPending ? "Booking..." : "Book Your Consultation"}
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
