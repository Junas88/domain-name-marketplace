import { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './ui/card';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Download, FileText } from 'lucide-react';

interface EbookDownloadProps {
  pageKey: string;
  title: string;
  description?: string;
  price: number;
}

export default function EbookDownload({ pageKey, title, description, price }: EbookDownloadProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleDownload = () => {
    setIsLoading(true);
    
    try {
      // Directly download the PDF file
      window.location.href = '/api/direct-download/ebook';
      
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
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>
        <div className="text-center space-y-4">
          <FileText className="h-16 w-16 mx-auto text-muted-foreground" />
          <h3 className="font-semibold text-lg">Free Domain Marketing Guide</h3>
          <p className="text-gray-500">Learn how to effectively market your domains with our comprehensive guide.</p>
        </div>
      </CardContent>
      
      <CardFooter>
        <Button 
          onClick={handleDownload}
          disabled={isLoading}
          className="w-full"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Downloading...
            </>
          ) : (
            <>
              <Download className="mr-2 h-4 w-4" />
              Download Free Ebook
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}