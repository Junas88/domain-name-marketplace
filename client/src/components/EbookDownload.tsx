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
      // Create an anchor element for download
      const link = document.createElement('a');
      link.href = '/api/direct-download/ebook';
      link.download = 'Domain Name Marketing.pdf';
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
    <Card className="w-full max-w-md mx-auto border-0 rounded-xl shadow-lg overflow-hidden bg-white">
      <CardHeader className="bg-white pb-0">
        <CardTitle className="text-xl font-bold">{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent className="pt-6">
        <div className="flex flex-col items-center justify-center space-y-6">
          <div className="p-4 bg-gray-50 rounded-full">
            <FileText className="h-14 w-14 text-black" />
          </div>
          <div className="text-center">
            <h3 className="text-lg font-semibold mb-2">Domain Marketing Guide</h3>
            <p className="text-gray-600">Learn how to effectively market your domains with our comprehensive guide.</p>
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="flex flex-col pb-6">
        {!hasPurchased && (
          <div className="w-full text-center mb-4">
            <p className="text-2xl font-bold text-black">${(price / 100).toFixed(2)}</p>
          </div>
        )}
        
        {hasPurchased ? (
          <Button 
            onClick={handleDownload}
            disabled={isLoading}
            className="w-full h-12 rounded-lg flex items-center justify-center bg-black hover:bg-gray-800 text-white"
            variant="default"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                <span className="font-medium">Downloading...</span>
              </>
            ) : (
              <>
                <Download className="mr-2 h-5 w-5" />
                <span className="font-medium">Download Ebook</span>
              </>
            )}
          </Button>
        ) : (
          <Button 
            onClick={handlePurchase}
            disabled={isLoading}
            className="w-full h-12 rounded-lg flex items-center justify-center bg-black hover:bg-gray-800 text-white"
            variant="default"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                <span className="font-medium">Processing...</span>
              </>
            ) : (
              <>
                <CreditCard className="mr-2 h-5 w-5" />
                <span className="font-medium">Purchase Now</span>
              </>
            )}
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}