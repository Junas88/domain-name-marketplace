import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import EbookCheckout from './EbookCheckout';
import { ShoppingBag } from 'lucide-react';

const EbookPurchaseButton = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [purchased, setPurchased] = useState(false);

  const handleSuccess = () => {
    setPurchased(true);
  };

  return (
    <>
      <Button 
        onClick={() => setIsOpen(true)}
        className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-bold py-3 rounded-md"
      >
        <ShoppingBag className="mr-2 h-5 w-5" />
        {purchased ? 'Download Ebook' : 'Buy Now - $47'}
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {purchased ? 'Thank You For Your Purchase!' : 'Complete Your Purchase'}
            </DialogTitle>
            <DialogDescription>
              {purchased 
                ? 'Your download will begin shortly. Check your email for additional information.'
                : 'Securely pay with credit card to get instant access to the domain investing ebook.'
              }
            </DialogDescription>
          </DialogHeader>
          
          {purchased ? (
            <div className="space-y-6 py-4">
              <div className="flex items-center justify-center p-6 bg-green-50 text-green-700 rounded-md">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <p className="text-center text-sm text-gray-500">
                Your payment has been processed successfully. We've sent the download link to your email as well.
              </p>
              <Button className="w-full" onClick={() => setIsOpen(false)}>
                Close
              </Button>
            </div>
          ) : (
            <EbookCheckout price={47} onSuccess={handleSuccess} />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default EbookPurchaseButton;