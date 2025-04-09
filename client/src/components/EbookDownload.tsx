import { useState, useEffect } from 'react';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './ui/card';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Download, CheckCircle } from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';

// Make sure to call `loadStripe` outside of a component's render to avoid
// recreating the `Stripe` object on every render.
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY as string);

interface EbookDownloadProps {
  pageKey: string;
  title: string;
  description?: string;
  price: number;
}

function CheckoutForm({ pageKey, onSuccess }: { pageKey: string, onSuccess: (downloadUrl: string) => void }) {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const [message, setMessage] = useState('');
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);
    setMessage('');

    const result = await stripe.confirmPayment({
      elements,
      redirect: 'if_required',
    });
    
    const { error, paymentIntent } = result;

    if (error) {
      setMessage(error.message || 'An error occurred during payment');
      toast({
        title: 'Payment Failed',
        description: error.message || 'There was a problem with your payment',
        variant: 'destructive',
      });
    } else if (paymentIntent && paymentIntent.status === 'succeeded') {
      // Verify the purchase with the server
      try {
        const response = await fetch(`/api/verify-purchase/${pageKey}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ paymentIntentId: paymentIntent.id }),
          credentials: 'include'
        });
        const data = await response.json();
        
        if (data.success && data.downloadUrl) {
          toast({
            title: 'Payment Successful',
            description: 'Your payment was successful! You can now download the ebook.',
          });
          onSuccess(data.downloadUrl);
        }
      } catch (verifyError: any) {
        console.error('Error verifying purchase:', verifyError);
        setMessage('Payment completed but could not verify purchase. Please contact support.');
      }
    }

    setIsProcessing(false);
  };

  return (
    <form onSubmit={handleSubmit}>
      <PaymentElement />
      <div className="mt-4">
        {message && <p className="text-red-500 text-sm mb-2">{message}</p>}
        <Button 
          type="submit" 
          disabled={!stripe || isProcessing} 
          className="w-full"
        >
          {isProcessing ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Processing...
            </>
          ) : (
            'Pay & Download'
          )}
        </Button>
      </div>
    </form>
  );
}

export default function EbookDownload({ pageKey, title, description, price }: EbookDownloadProps) {
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const initializePayment = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/create-payment-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          pageKey,
          amount: price
        }),
        credentials: 'include'
      });
      
      const data = await response.json();
      setClientSecret(data.clientSecret);
    } catch (err: any) {
      console.error('Error initializing payment:', err);
      setError('Could not initialize payment. Please try again later.');
      toast({
        title: 'Error',
        description: 'Could not initialize payment. Please try again later.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuccess = (url: string) => {
    setDownloadUrl(url);
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
        {!clientSecret && !downloadUrl && (
          <div className="space-y-4">
            <p className="text-lg font-semibold">
              ${(price / 100).toFixed(2)}
            </p>
            <Button 
              onClick={initializePayment} 
              disabled={isLoading}
              className="w-full"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Loading...
                </>
              ) : (
                'Purchase Ebook'
              )}
            </Button>
            {error && <p className="text-red-500 text-sm">{error}</p>}
          </div>
        )}
        
        {clientSecret && !downloadUrl && (
          <Elements stripe={stripePromise} options={{ clientSecret }}>
            <CheckoutForm pageKey={pageKey} onSuccess={handleSuccess} />
          </Elements>
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