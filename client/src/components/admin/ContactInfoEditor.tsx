import { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { PageContent } from "@shared/schema";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Mail, Phone, Clock, MapPin } from "lucide-react";

interface ContactInfoEditorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  existingContent: PageContent | null;
  pageContents: PageContent[];
}

interface ContactFormState {
  email: string;
  phone: string;
  hours: string;
  address: string;
}

export default function ContactInfoEditor({
  open,
  onOpenChange,
  existingContent,
  pageContents
}: ContactInfoEditorProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Contact form state
  const [formState, setFormState] = useState<ContactFormState>({
    email: "",
    phone: "",
    hours: "",
    address: ""
  });
  
  // Parse content when dialog opens
  useEffect(() => {
    if (open && existingContent) {
      parseContent(existingContent.content);
    } else if (open) {
      // Set defaults if creating new
      setFormState({
        email: "support@domainnameguide.com",
        phone: "+1 (800) 123-4567",
        hours: "Monday-Friday, 9am-5pm EST",
        address: "123 Domain Street\nSan Francisco, CA 94107"
      });
    }
  }, [open, existingContent]);
  
  // Parse existing content
  const parseContent = (content: string) => {
    const parts = content.split('\n');
    let emailAddress = "";
    let phoneNumber = "";
    let businessHours = "";
    let address = "";
    
    // Simple parsing of the content
    for (let i = 0; i < parts.length; i++) {
      if (parts[i].trim() === 'Email Us' && i+1 < parts.length) {
        emailAddress = parts[i+1].trim();
      }
      if (parts[i].trim() === 'Call Us' && i+1 < parts.length) {
        phoneNumber = parts[i+1].trim();
        // Check for business hours
        if (i+3 < parts.length && parts[i+3].includes('am') && parts[i+3].includes('pm')) {
          businessHours = parts[i+3].trim();
        }
      }
      if (parts[i].trim() === 'Visit Us' && i+1 < parts.length) {
        // Gather address lines
        let addrLines = [];
        for (let j = i+1; j < parts.length && j < i+5; j++) {
          if (parts[j].trim()) {
            addrLines.push(parts[j].trim());
          }
        }
        address = addrLines.join('\n');
      }
    }
    
    setFormState({
      email: emailAddress,
      phone: phoneNumber,
      hours: businessHours,
      address: address
    });
  };
  
  // Save content
  const updateContentMutation = useMutation({
    mutationFn: async (data: { pageKey: string, content: any }) => {
      const res = await fetch(`/api/admin/page-contents/${data.pageKey}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data.content),
        credentials: 'include'
      });
      return await res.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Success",
        description: "Contact information updated successfully",
      });
      
      // Invalidate all the caches
      queryClient.invalidateQueries({ queryKey: ['/api/admin/page-contents'] });
      queryClient.invalidateQueries({ queryKey: ['/api/page-contents/contact'] });
      queryClient.invalidateQueries({ queryKey: ['/api/page-contents/contact-info'] });
      queryClient.invalidateQueries({ queryKey: ['/api/fresh-content/contact-info'] });
      
      // Close dialog
      onOpenChange(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: `Failed to update contact info: ${error.message}`,
        variant: "destructive",
      });
    },
  });
  
  // Create content
  const createContentMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await fetch("/api/admin/page-contents", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
        credentials: 'include'
      });
      return await res.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Success", 
        description: "Contact information created successfully",
      });
      
      // Invalidate all the caches
      queryClient.invalidateQueries({ queryKey: ['/api/admin/page-contents'] });
      queryClient.invalidateQueries({ queryKey: ['/api/page-contents/contact'] });
      queryClient.invalidateQueries({ queryKey: ['/api/page-contents/contact-info'] });
      queryClient.invalidateQueries({ queryKey: ['/api/fresh-content/contact-info'] });
      
      // Close dialog
      onOpenChange(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: `Failed to create contact info: ${error.message}`,
        variant: "destructive",
      });
    },
  });
  
  // Handle submit
  const handleSubmit = () => {
    // Format content in the expected structure
    const formattedContent = `Email Us
${formState.email}

Call Us
${formState.phone}

${formState.hours}

Visit Us
${formState.address}`;
    
    if (existingContent) {
      // Update existing
      updateContentMutation.mutate({
        pageKey: 'contact-info',
        content: {
          id: existingContent.id,
          title: 'Contact Information',
          content: formattedContent,
          pageKey: 'contact-info'
        }
      });
    } else {
      // Create new
      createContentMutation.mutate({
        title: 'Contact Information',
        content: formattedContent,
        pageKey: 'contact-info'
      });
    }
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Edit Contact Information</DialogTitle>
          <DialogDescription>
            Update your business contact information that appears on the contact page.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="font-medium flex gap-2 items-center">
                  <Mail className="h-4 w-4 text-green-600" />
                  Email Address
                </Label>
                <Input 
                  id="email" 
                  value={formState.email} 
                  onChange={(e) => setFormState({...formState, email: e.target.value})}
                  placeholder="support@domainnameguide.com"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="phone" className="font-medium flex gap-2 items-center">
                  <Phone className="h-4 w-4 text-green-600" />
                  Phone Number
                </Label>
                <Input 
                  id="phone" 
                  value={formState.phone} 
                  onChange={(e) => setFormState({...formState, phone: e.target.value})}
                  placeholder="+1 (800) 123-4567"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="hours" className="font-medium flex gap-2 items-center">
                  <Clock className="h-4 w-4 text-green-600" />
                  Business Hours
                </Label>
                <Input 
                  id="hours" 
                  value={formState.hours} 
                  onChange={(e) => setFormState({...formState, hours: e.target.value})}
                  placeholder="Monday-Friday, 9am-5pm EST"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="address" className="font-medium flex gap-2 items-center">
                  <MapPin className="h-4 w-4 text-green-600" />
                  Address
                </Label>
                <Textarea 
                  id="address" 
                  value={formState.address} 
                  onChange={(e) => setFormState({...formState, address: e.target.value})}
                  placeholder="123 Domain Street&#10;San Francisco, CA 94107"
                  className="min-h-[80px]"
                  rows={3}
                />
              </div>
            </div>
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit}>
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}