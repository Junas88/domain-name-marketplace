import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './ui/card';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Download, FileText, CreditCard } from 'lucide-react';

interface EbookDownloadProps {
  pageKey: string;
  title: string;
  description?: string;
  price: number;
}

export default function EbookDownload({ pageKey, title, description, price }: EbookDownloadProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [hasPurchased, setHasPurchased] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // Check if user has already purchased the ebook
    const checkPurchaseStatus = () => {
      const purchaseStatus = localStorage.getItem('ebookPurchased');
      if (purchaseStatus === 'true') {
        setHasPurchased(true);
      }
    };
    
    checkPurchaseStatus();
  }, []);

  const handlePurchase = () => {
    setIsLoading(true);
    
    try {
      // Simulate a purchase process
      setTimeout(() => {
        // Store purchase status in localStorage
        localStorage.setItem('ebookPurchased', 'true');
        setHasPurchased(true);
        setIsLoading(false);
        
        toast({
          title: 'Purchase Successful',
          description: 'Thank you for your purchase! You can now download the ebook.',
        });
      }, 1500);
    } catch (err: any) {
      console.error('Error processing purchase:', err);
      toast({
        title: 'Error',
        description: 'Could not process your purchase. Please try again.',
        variant: 'destructive',
      });
      setIsLoading(false);
    }
  };

  const handleDownload = () => {
    setIsLoading(true);
    
    try {
      // Directly download the PDF file
      window.location.href = '/api/direct-download/ebook';
      
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
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>
        <div className="text-center space-y-4">
          <FileText className="h-16 w-16 mx-auto text-muted-foreground" />
          <h3 className="font-semibold text-lg">Domain Marketing Guide</h3>
          <p className="text-gray-500">Learn how to effectively market your domains with our comprehensive guide.</p>
          
          {!hasPurchased && (
            <div className="mt-4 p-3 bg-gray-50 rounded-md">
              <p className="font-medium text-lg">${(price / 100).toFixed(2)}</p>
              <p className="text-sm text-gray-500">One-time purchase, instant download</p>
            </div>
          )}
        </div>
      </CardContent>
      
      <CardFooter>
        {hasPurchased ? (
          <Button 
            onClick={handleDownload}
            disabled={isLoading}
            className="w-full"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Downloading...
              </>
            ) : (
              <>
                <Download className="mr-2 h-4 w-4" />
                Download Ebook
              </>
            )}
          </Button>
        ) : (
          <Button 
            onClick={handlePurchase}
            disabled={isLoading}
            className="w-full"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <CreditCard className="mr-2 h-4 w-4" />
                Purchase Now (${(price / 100).toFixed(2)})
              </>
            )}
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}