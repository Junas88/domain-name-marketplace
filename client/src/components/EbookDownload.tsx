import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './ui/card';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Download, CheckCircle, ExternalLink } from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';

interface EbookDownloadProps {
  pageKey: string;
  title: string;
  description?: string;
  price: number;
}

export default function EbookDownload({ pageKey, title, description, price }: EbookDownloadProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  // Check if there's a session_id in the URL (redirect from successful payment)
  useEffect(() => {
    const checkSessionId = async () => {
      const url = new URL(window.location.href);
      const sessionId = url.searchParams.get('session_id');
      
      if (sessionId) {
        try {
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
            // Clean up the URL
            window.history.replaceState({}, document.title, window.location.pathname);
          }
        } catch (error) {
          console.error('Error verifying session:', error);
        }
      }
    };
    
    checkSessionId();
  }, [pageKey]);

  const handleCheckout = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          pageKey,
          // Let the server determine success and cancel URLs
        }),
        credentials: 'include'
      });
      
      const data = await response.json();
      
      if (data.url) {
        // Redirect to Stripe Checkout
        window.location.href = data.url;
      } else {
        throw new Error('Failed to create checkout session');
      }
    } catch (err: any) {
      console.error('Error creating checkout session:', err);
      setError('Could not initialize checkout. Please try again later.');
      toast({
        title: 'Error',
        description: 'Could not initialize checkout. Please try again later.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = () => {
    if (downloadUrl) {
      window.location.href = downloadUrl;
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>
        {!downloadUrl && (
          <div className="space-y-4">
            <p className="text-lg font-semibold">
              ${(price / 100).toFixed(2)}
            </p>
            <Button 
              onClick={handleCheckout} 
              disabled={isLoading}
              className="w-full"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Redirecting to checkout...
                </>
              ) : (
                <>
                  <ExternalLink className="mr-2 h-4 w-4" />
                  Checkout with Stripe
                </>
              )}
            </Button>
            {error && <p className="text-red-500 text-sm">{error}</p>}
          </div>
        )}
        
        {downloadUrl && (
          <div className="text-center space-y-4">
            <CheckCircle className="h-12 w-12 text-green-500 mx-auto" />
            <h3 className="font-semibold text-lg">Payment Complete!</h3>
            <p className="text-gray-500">Thank you for your purchase. Your ebook is ready to download.</p>
          </div>
        )}
      </CardContent>
      
      {downloadUrl && (
        <CardFooter>
          <Button 
            onClick={handleDownload}
            className="w-full"
          >
            <Download className="mr-2 h-4 w-4" />
            Download Ebook
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}