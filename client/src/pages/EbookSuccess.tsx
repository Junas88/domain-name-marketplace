import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, ChevronLeft, CheckCircle, Loader2 } from 'lucide-react';
import Layout from '@/components/Layout';

export default function EbookSuccess() {
  const [, navigate] = useLocation();
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const verifyPurchase = async () => {
      setIsLoading(true);
      
      try {
        const url = new URL(window.location.href);
        const pageKey = url.searchParams.get('pageKey');
        const sessionId = url.searchParams.get('session_id');
        
        if (!pageKey || !sessionId) {
          setError('Missing required parameters');
          setIsLoading(false);
          return;
        }
        
        const response = await fetch(`/api/verify-purchase/${pageKey}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ sessionId }),
          credentials: 'include'
        });
        
        const data = await response.json();
        
        if (data.success && data.downloadUrl) {
          setDownloadUrl(data.downloadUrl);
        } else {
          setError('Could not verify your purchase. Please contact support.');
        }
      } catch (err) {
        console.error('Error verifying purchase:', err);
        setError('An error occurred. Please try again or contact support.');
      } finally {
        setIsLoading(false);
      }
    };
    
    verifyPurchase();
  }, []);
  
  const handleDownload = () => {
    if (downloadUrl) {
      window.location.href = downloadUrl;
    }
  };
  
  return (
    <Layout>
      <div className="container max-w-2xl mx-auto py-12 px-4">
        <Card className="w-full">
          <CardHeader>
            <CardTitle className="text-center text-2xl">Thank You for Your Purchase!</CardTitle>
            <CardDescription className="text-center">
              Your transaction has been processed successfully.
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-4">
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
              </div>
            ) : error ? (
              <div className="text-center py-4 text-red-500">
                <p>{error}</p>
              </div>
            ) : (
              <div className="text-center space-y-4 py-4">
                <CheckCircle className="h-16 w-16 text-green-500 mx-auto" />
                <p className="text-lg">Your ebook is ready to download</p>
              </div>
            )}
          </CardContent>
          
          <CardFooter className="flex flex-col sm:flex-row gap-3 justify-between">
            <Button 
              variant="outline" 
              onClick={() => navigate('/')}
              className="flex-1 sm:flex-none"
            >
              <ChevronLeft className="h-4 w-4 mr-2" />
              Return to Home
            </Button>
            
            {downloadUrl && (
              <Button 
                onClick={handleDownload}
                className="flex-1 sm:flex-none"
              >
                <Download className="h-4 w-4 mr-2" />
                Download Ebook
              </Button>
            )}
          </CardFooter>
        </Card>
      </div>
    </Layout>
  );
}