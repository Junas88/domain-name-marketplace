import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './ui/card';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Download, FileText } from 'lucide-react';
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
    <Card className="w-full max-w-md mx-auto border border-gray-200 rounded-xl shadow-lg overflow-hidden bg-white transform transition-transform hover:scale-105">
      <div className="absolute top-0 right-0 bg-black text-white px-4 py-2 text-sm font-bold transform rotate-2 translate-x-2 -translate-y-0 shadow-md">
        LIMITED TIME FREE
      </div>
      
      <CardHeader className="bg-white pt-8 pb-0">
        <CardTitle className="text-2xl font-bold text-center">{title}</CardTitle>
        <div className="mt-2 mb-1 text-center border-b border-gray-200 pb-3">
          <span className="text-sm bg-black text-white px-2 py-1 rounded-sm font-semibold">TRUSTED BY 2,500+ DOMAIN INVESTORS</span>
        </div>
        {description && <CardDescription className="text-center mt-3">{description}</CardDescription>}
      </CardHeader>
      
      <CardContent className="pt-6">
        <div className="flex flex-col items-center justify-center space-y-6">
          <div className="p-5 bg-black rounded-full">
            <FileText className="h-16 w-16 text-white" />
          </div>
          
          <div className="text-center px-4">
            <h3 className="text-xl font-semibold mb-3">Premium Domain Marketing Strategies</h3>
            <div className="space-y-2 mb-4">
              <p className="text-gray-700 flex items-center">
                <span className="inline-block w-5 h-5 mr-2 bg-black text-white rounded-full flex items-center justify-center text-xs">✓</span>
                Learn proven domain valuation techniques
              </p>
              <p className="text-gray-700 flex items-center">
                <span className="inline-block w-5 h-5 mr-2 bg-black text-white rounded-full flex items-center justify-center text-xs">✓</span>
                Outbound marketing strategies that work
              </p>
              <p className="text-gray-700 flex items-center">
                <span className="inline-block w-5 h-5 mr-2 bg-black text-white rounded-full flex items-center justify-center text-xs">✓</span>
                Maximize your domain portfolio returns
              </p>
            </div>
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="flex flex-col pb-6 pt-2">
        <div className="w-full text-center mb-4">
          <div className="inline-block bg-black text-white px-4 py-1 rounded-md">
            <span className="text-sm line-through opacity-75">$49.95 Value</span>
          </div>
          <p className="text-3xl font-bold text-black mt-2">FREE</p>
        </div>
        
        <Button 
          onClick={handleDownload}
          disabled={isLoading}
          className="w-full h-14 rounded-lg flex items-center justify-center bg-black hover:bg-gray-800 text-white text-lg shadow-lg border-2 border-black hover:border-gray-800 transform transition-all duration-200 hover:-translate-y-1"
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
              <span className="font-bold tracking-wide">GET IT NOW →</span>
            </>
          )}
        </Button>
        
        <div className="animate-pulse bg-gray-200 w-full h-1 mt-2 mb-1 rounded-full">
          <div className="bg-black h-1 w-1/3 rounded-full"></div>
        </div>
        
        <p className="text-xs text-center text-gray-500 mt-3">
          No email required. Instant download.
        </p>
      </CardFooter>
    </Card>
  );
}