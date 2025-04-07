import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Domain } from "@/lib/types";
import { X } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
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

interface OfferModalProps {
  isOpen: boolean;
  onClose: () => void;
  domain: Domain | null;
}

const offerSchema = z.object({
  amount: z
    .number({ required_error: "Amount is required" })
    .min(1, "Amount must be greater than 0"),
  name: z.string().min(2, "Name is required"),
  email: z.string().email("Valid email is required"),
  message: z.string().optional(),
});

type OfferFormValues = z.infer<typeof offerSchema>;

export default function OfferModal({ isOpen, onClose, domain }: OfferModalProps) {
  const { toast } = useToast();
  
  const form = useForm<OfferFormValues>({
    resolver: zodResolver(offerSchema),
    defaultValues: {
      amount: undefined,
      name: "",
      email: "",
      message: "",
    },
  });

  const { mutate, isPending } = useMutation({
    mutationFn: async (data: OfferFormValues) => {
      if (!domain) throw new Error("No domain selected");
      
      const offerData = {
        ...data,
        domainId: domain.id,
      };
      
      const response = await apiRequest("/api/offers", {
        method: "POST",
        body: JSON.stringify(offerData)
      });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Offer Submitted",
        description: "Your offer has been submitted successfully.",
      });
      form.reset();
      onClose();
    },
    onError: (error) => {
      toast({
        title: "Submission Failed",
        description: error.message || "There was a problem submitting your offer.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: OfferFormValues) => {
    mutate(data);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md border border-black">
        <DialogHeader className="bg-black text-white p-4 -mx-4 -mt-4 rounded-t-lg">
          <div className="flex justify-between items-center">
            <DialogTitle>Make an Offer</DialogTitle>
            <Button 
              variant="ghost" 
              onClick={onClose}
              className="text-white hover:bg-black/20 h-8 w-8 p-0"
            >
              <X size={18} />
            </Button>
          </div>
        </DialogHeader>
        
        <div className="py-4">
          <p className="text-neutral-700 mb-4">
            Please enter your offer details for <span className="font-semibold">{domain?.name}</span>
          </p>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Your Offer Amount ($)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
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
                name="message"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Message (Optional)</FormLabel>
                    <FormControl>
                      <Textarea rows={3} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <DialogFooter className="sm:justify-end mt-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={onClose}
                  className="border-black text-black hover:bg-neutral-100"
                >
                  Cancel
                </Button>
                <Button 
                  type="submit"
                  disabled={isPending}
                  className="bg-black text-white hover:bg-neutral-800"
                >
                  {isPending ? "Submitting..." : "Submit Offer"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
