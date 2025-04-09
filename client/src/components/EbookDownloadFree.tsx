import { useState, useEffect } from 'react';
import { Button } from './ui/button';
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
    <div className="w-full max-w-5xl mx-auto">
      <div className="bg-gradient-to-br from-white to-blue-50 rounded-2xl shadow-2xl overflow-hidden border border-blue-100">
        <div className="grid md:grid-cols-2 gap-6">
          {/* Left Side - Preview Content */}
          <div className="p-8 flex flex-col justify-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Domain Name Marketing Guide</h2>
            <p className="text-gray-700 mb-6">Learn proven strategies to effectively market and sell your domain portfolio for maximum profit.</p>
            
            <div className="space-y-4 mb-6">
              <div className="flex items-start">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                  <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <p className="text-gray-700">Learn how to determine the true value of any domain name</p>
              </div>
              
              <div className="flex items-start">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                  <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <p className="text-gray-700">Master the art of outbound sales for premium domains</p>
              </div>
              
              <div className="flex items-start">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                  <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <p className="text-gray-700">Discover the best marketplaces and platforms to list your domains</p>
              </div>
            </div>
            
            <div className="flex flex-col md:flex-row items-center space-y-3 md:space-y-0 md:space-x-3">
              <div className="flex items-center bg-green-100 text-green-800 rounded-full px-4 py-1 text-sm font-medium mb-2 md:mb-0">
                <FileText className="h-4 w-4 mr-1" />
                Premium PDF Guide
              </div>
              <div className="flex items-center bg-purple-100 text-purple-800 rounded-full px-4 py-1 text-sm font-medium mb-2 md:mb-0">
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                12 Chapters
              </div>
              <div className="flex items-center bg-yellow-100 text-yellow-800 rounded-full px-4 py-1 text-sm font-medium">
                <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                Expert Tips
              </div>
            </div>
          </div>
          
          {/* Right Side - Download Card */}
          <div className="bg-white p-8 flex flex-col justify-center">
            <div className="mb-6 flex justify-center">
              <div className="p-4 bg-blue-50 rounded-full">
                <FileText className="h-16 w-16 text-blue-600" />
              </div>
            </div>
            
            <div className="text-center mb-6">
              <div className="inline-block bg-green-100 text-green-800 rounded-full px-3 py-1 text-sm font-semibold mb-2">
                FREE PDF GUIDE
              </div>
              <h3 className="text-xl font-bold text-gray-900">Domain Marketing Guide</h3>
              <p className="text-gray-600 mt-2">Complete blueprint to successfully market and sell domain names</p>
            </div>
            
            <div className="mb-6">
              <div className="flex justify-between items-center mb-2">
                <div className="text-gray-500 line-through text-sm">Regular Price: $49.95</div>
                <div className="bg-red-100 text-red-800 rounded-full px-3 py-1 text-xs font-semibold">
                  100% OFF
                </div>
              </div>
              <div className="text-center">
                <span className="text-3xl font-bold text-blue-600">FREE</span>
                <span className="text-gray-500 text-sm ml-1">for a limited time</span>
              </div>
            </div>
            
            <Button 
              onClick={handleDownload}
              disabled={isLoading}
              className="w-full h-12 rounded-lg flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white"
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
                  <span className="font-medium">DOWNLOAD NOW</span>
                </>
              )}
            </Button>
            
            <p className="text-xs text-center text-gray-500 mt-4">
              No email required. Instant download. PDF format.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}