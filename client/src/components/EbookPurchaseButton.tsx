import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import EbookCheckout from './EbookCheckout';
import { ShoppingBag, Lock, Download, ArrowRight } from 'lucide-react';

const EbookPurchaseButton = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [purchased, setPurchased] = useState(false);

  const handleSuccess = () => {
    setPurchased(true);
  };

  return (
    <>
      {purchased ? (
        <Button 
          onClick={() => setIsOpen(true)}
          className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold py-4 rounded-md shadow-lg transform transition-transform hover:scale-105 duration-200"
        >
          <Download className="mr-2 h-5 w-5" />
          Download Your Ebook Now
        </Button>
      ) : (
        <div className="space-y-3">
          <Button 
            onClick={() => setIsOpen(true)}
            className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-bold py-4 rounded-md shadow-lg transform transition-transform hover:scale-105 duration-200 flex items-center justify-center"
          >
            <div className="flex items-center">
              <ShoppingBag className="mr-2 h-5 w-5" />
              <span className="font-bold text-lg">Get Instant Access</span>
              <ArrowRight className="ml-2 h-5 w-5" />
            </div>
          </Button>
          <div className="flex items-center justify-center text-xs text-gray-500">
            <Lock className="h-3 w-3 mr-1" />
            <span>Secure checkout • Instant access • 30-day guarantee</span>
          </div>
        </div>
      )}

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className={purchased ? "text-green-600" : ""}>
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
                <div className="relative">
                  <div className="absolute inset-0 bg-green-200 rounded-full animate-ping opacity-25"></div>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 relative" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              </div>
              <div className="bg-blue-50 border border-blue-100 rounded-lg p-4">
                <p className="text-center text-sm text-blue-800 font-medium">
                  Your payment has been processed successfully. We've sent the download link to your email as well.
                </p>
              </div>
              <Button 
                className="w-full bg-green-600 hover:bg-green-700 text-white" 
                onClick={() => setIsOpen(false)}
              >
                <Download className="mr-2 h-4 w-4" />
                Download Ebook Now
              </Button>
            </div>
          ) : (
            <>
              <div className="bg-yellow-50 border border-yellow-100 rounded-lg p-3 mb-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-yellow-600" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-yellow-700">
                      <span className="font-bold">Limited time offer</span> - Get 50% off before price increases on April 15th
                    </p>
                  </div>
                </div>
              </div>
              <EbookCheckout price={47} onSuccess={handleSuccess} />
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default EbookPurchaseButton;