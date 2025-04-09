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
    <Card className="w-full max-w-md mx-auto shadow-lg border-2 border-black">
      <div className="absolute top-0 right-0 -mt-3 -mr-3">
        <div className="bg-black text-white text-xs font-bold px-3 py-1 rounded-full transform rotate-6 shadow-md">
          SPECIAL OFFER
        </div>
      </div>
      
      <CardHeader className="bg-gradient-to-r from-gray-900 to-gray-800 text-white rounded-t-md">
        <CardTitle className="text-2xl font-bold text-center">{title}</CardTitle>
        {description && <CardDescription className="text-gray-200 text-center">{description}</CardDescription>}
      </CardHeader>
      
      <CardContent className="pt-6">
        <div className="text-center space-y-6">
          <div className="bg-gray-50 p-4 rounded-lg shadow-inner mx-auto w-32 h-32 flex items-center justify-center">
            <FileText className="h-20 w-20 text-black" />
          </div>
          
          <div>
            <h3 className="font-bold text-xl mb-2">Premium Domain Marketing Guide</h3>
            <p className="text-gray-700">Advanced strategies to maximize your domain investments</p>
          </div>
          
          <div className="space-y-3 border-t border-b border-gray-200 py-4 my-4">
            <div className="flex items-center justify-between">
              <span className="font-medium">Format:</span>
              <span className="bg-gray-100 px-3 py-1 rounded">PDF Digital Download</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="font-medium">Pages:</span>
              <span className="bg-gray-100 px-3 py-1 rounded">30+ Full Color</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="font-medium">Access:</span>
              <span className="bg-gray-100 px-3 py-1 rounded">Instant Delivery</span>
            </div>
          </div>
          
          {!hasPurchased && (
            <div className="pt-2">
              <div className="flex items-center justify-center gap-3">
                <p className="text-gray-500 line-through">$79.99</p>
                <p className="text-3xl font-bold text-black">${(price / 100).toFixed(2)}</p>
                <span className="bg-red-600 text-white text-xs font-bold px-2 py-1 rounded-full">SAVE 40%</span>
              </div>
              <p className="text-sm text-gray-500 mt-1">One-time purchase, lifetime updates</p>
            </div>
          )}
        </div>
      </CardContent>
      
      <CardFooter className="flex flex-col gap-3">
        {hasPurchased ? (
          <Button 
            onClick={handleDownload}
            disabled={isLoading}
            className="w-full bg-black hover:bg-gray-800 text-white py-6 text-lg font-bold"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Downloading...
              </>
            ) : (
              <>
                <Download className="mr-2 h-5 w-5" />
                Download Your Guide Now
              </>
            )}
          </Button>
        ) : (
          <>
            <Button 
              onClick={handlePurchase}
              disabled={isLoading}
              className="w-full bg-black hover:bg-gray-800 text-white py-6 text-lg font-bold"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <CreditCard className="mr-2 h-5 w-5" />
                  GET INSTANT ACCESS NOW
                </>
              )}
            </Button>
            <div className="flex items-center justify-center w-full gap-2 mt-2">
              <p className="text-sm text-gray-500 text-center">
                🔒 Secure checkout • Instant download • 30-day guarantee
              </p>
            </div>
          </>
        )}
      </CardFooter>
    </Card>
  );
}