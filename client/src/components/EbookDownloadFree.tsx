import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './ui/card';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Download, FileText, Check, Mail } from 'lucide-react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { PageContent } from '@/lib/types';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from './ui/form';
import { apiRequest } from '@/lib/queryClient';

interface EbookDownloadProps {
  pageKey: string;
  title: string;
  description?: string;
  price: number;
}

// Email validation schema
const emailSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address" }),
});

type EmailFormValues = z.infer<typeof emailSchema>;

export default function EbookDownload({ pageKey, title, description, price }: EbookDownloadProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [hasSubmittedEmail, setHasSubmittedEmail] = useState(false);
  const { toast } = useToast();
  
  // Get the file info from page content
  const { data: pageContent } = useQuery<PageContent>({
    queryKey: [`/api/page-contents/${pageKey}`],
    enabled: !!pageKey,
  });
  
  // Define form
  const form = useForm<EmailFormValues>({
    resolver: zodResolver(emailSchema),
    defaultValues: {
      email: "",
    },
  });
  
  // Simply log when ebook is loaded - no need for the check now as we've fixed it
  useEffect(() => {
    if (pageContent) {
      console.log('Ebook content loaded - using direct-download endpoint');
    }
  }, [pageContent]);

  // Email submission mutation
  const emailSubmissionMutation = useMutation({
    mutationFn: async (data: EmailFormValues) => {
      const res = await apiRequest('POST', '/api/email-submissions', {
        email: data.email,
        source: 'ebook-download'
      });
      return await res.json();
    },
    onSuccess: () => {
      setIsLoading(false);
      setHasSubmittedEmail(true);
      
      toast({
        title: 'Thank you!',
        description: 'Your email has been registered. Your download will begin shortly.',
      });
      
      // Start download after email is submitted
      setTimeout(() => {
        handleDownload();
      }, 500);
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: `Failed to register your email: ${error.message}`,
        variant: 'destructive',
      });
      setIsLoading(false);
    }
  });

  const onSubmitEmail = (data: EmailFormValues) => {
    setIsLoading(true);
    emailSubmissionMutation.mutate(data);
  };

  const handleDownload = () => {
    setIsLoading(true);
    
    try {
      // Create an anchor element for download
      const link = document.createElement('a');
      link.href = '/api/direct-download/ebook';
      // The file name will be determined by the server
      link.target = '_blank';
      document.body.appendChild(link);
      
      // Trigger click to start download
      link.click();
      
      // Clean up
      document.body.removeChild(link);
      
      // Show success toast
      toast({
        title: 'Success',
        description: 'Your download has started!',
      });
      
      // Reset loading state after a short delay
      setTimeout(() => {
        setIsLoading(false);
      }, 1000);
    } catch (err: any) {
      console.error('Error downloading ebook:', err);
      toast({
        title: 'Error',
        description: 'Could not download the ebook. Please try again.',
        variant: 'destructive',
      });
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto border border-gray-200 rounded-lg shadow-sm overflow-hidden bg-white">
      <CardContent className="p-8">
        <h3 className="text-2xl font-bold mb-6">Domain Name Guide</h3>
        
        <p className="text-gray-600 mb-6">
          Premium domain name strategies to help you maximize your investments and grow your portfolio.
        </p>
        
        <p className="text-lg font-medium mb-1">Free Ebook</p>
        <p className="text-sm text-gray-500 mb-6">Normally $49.95 - Free for a limited time</p>
        
        {!hasSubmittedEmail ? (
          <div className="mb-6">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmitEmail)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email Address</FormLabel>
                      <FormControl>
                        <div className="flex items-center relative">
                          <Mail className="absolute left-3 h-5 w-5 text-gray-400" />
                          <Input 
                            placeholder="Enter your email" 
                            className="pl-10 border-gray-300 focus:border-black focus-visible:ring-black" 
                            {...field} 
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button 
                  type="submit" 
                  disabled={isLoading}
                  className="w-full h-12 rounded-md flex items-center justify-center bg-black hover:bg-gray-800 text-white"
                  variant="default"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      <span>Processing...</span>
                    </>
                  ) : (
                    "Get Your Free Ebook"
                  )}
                </Button>
              </form>
            </Form>
            <p className="text-xs text-center text-gray-500 mt-3">
              We respect your privacy. Your email will only be used to send you domain insights from Domain Name Guide.
            </p>
          </div>
        ) : (
          <>
            <div className="bg-green-50 p-4 rounded-md mb-6 border border-green-100 flex items-start">
              <Check className="text-green-500 mr-3 mt-0.5 shrink-0" />
              <div>
                <p className="text-green-800 font-medium">Thank you for signing up!</p>
                <p className="text-green-700 text-sm">Your download is being prepared.</p>
              </div>
            </div>
            
            <Button 
              onClick={handleDownload}
              disabled={isLoading}
              className="w-full h-14 rounded-md flex items-center justify-center bg-black hover:bg-gray-800 text-white"
              variant="default"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  <span>Downloading...</span>
                </>
              ) : (
                <>
                  <Download className="mr-2 h-5 w-5" />
                  <span>Download Free Ebook</span>
                </>
              )}
            </Button>
            
            <p className="text-xs text-center text-gray-500 mt-3">
              If your download doesn't start automatically, click the button above.
            </p>
          </>
        )}
      </CardContent>
    </Card>
  );
}