import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './ui/card';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Download, FileText, Check } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { PageContent } from '@/lib/types';

interface EbookDownloadProps {
  pageKey: string;
  title: string;
  description?: string;
  price: number;
}

export default function EbookDownload({ pageKey, title, description, price }: EbookDownloadProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  
  // Get the file info from page content
  const { data: pageContent } = useQuery<PageContent>({
    queryKey: [`/api/page-contents/${pageKey}`],
    enabled: !!pageKey,
  });
  
  // Simply log when ebook is loaded - no need for the check now as we've fixed it
  useEffect(() => {
    if (pageContent) {
      console.log('Ebook content loaded - using direct-download endpoint');
    }
  }, [pageContent]);

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
    <Card className="w-full max-w-md mx-auto border-0 rounded-xl shadow overflow-hidden bg-white">
      <div className="text-center py-3 border-b border-gray-100">
        <p className="text-gray-600">Premium domain marketing strategies</p>
      </div>
      
      <CardContent className="pt-8 pb-0">
        <div className="flex flex-col items-center justify-center">
          <div className="p-8 bg-black rounded-full mb-8">
            <FileText className="h-16 w-16 text-white" />
          </div>
          
          <h3 className="text-2xl font-bold mb-6 text-center">Premium Domain Marketing Strategies</h3>
          
          <div className="w-full space-y-4 mb-8">
            <div className="flex items-start">
              <div className="mt-1 w-6 h-6 bg-black rounded-full flex items-center justify-center flex-shrink-0">
                <Check className="h-4 w-4 text-white" />
              </div>
              <p className="ml-3 text-gray-700">Learn proven domain valuation techniques</p>
            </div>
            
            <div className="flex items-start">
              <div className="mt-1 w-6 h-6 bg-black rounded-full flex items-center justify-center flex-shrink-0">
                <Check className="h-4 w-4 text-white" />
              </div>
              <p className="ml-3 text-gray-700">Outbound marketing strategies that work</p>
            </div>
            
            <div className="flex items-start">
              <div className="mt-1 w-6 h-6 bg-black rounded-full flex items-center justify-center flex-shrink-0">
                <Check className="h-4 w-4 text-white" />
              </div>
              <p className="ml-3 text-gray-700">Maximize your domain portfolio returns</p>
            </div>
          </div>
          
          <div className="w-full text-center">
            <div className="inline-block bg-black text-white px-4 py-2 rounded-md mb-4">
              <span className="text-sm line-through opacity-75">$49.95 Value</span>
            </div>
            
            <p className="text-5xl font-bold text-black mb-4">FREE</p>
            
            <Button 
              onClick={handleDownload}
              disabled={isLoading}
              className="w-full h-14 rounded-md flex items-center justify-center bg-black hover:bg-gray-800 text-white text-xl"
              variant="default"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-6 w-6 animate-spin" />
                  <span className="font-bold">DOWNLOADING...</span>
                </>
              ) : (
                <>
                  <Download className="mr-2 h-6 w-6" />
                  <span className="font-bold tracking-wide mr-1">GET IT NOW</span>
                  <span className="font-bold">→</span>
                </>
              )}
            </Button>
            
            <div className="bg-gray-200 w-full h-1 mt-4 mb-0 rounded-none">
              <div className="bg-black h-1 w-1/4 rounded-none"></div>
            </div>
            
            <p className="text-sm text-center text-gray-500 mt-4 pb-6">
              No email required. Instant download.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}