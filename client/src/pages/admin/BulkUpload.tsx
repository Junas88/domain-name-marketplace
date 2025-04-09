import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Loader2, Info, CheckCircle2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

type DomainInput = {
  name: string;
  category?: string;
  price?: number;
};

export default function BulkUpload() {
  const [domainText, setDomainText] = useState("");
  const [bulkResults, setBulkResults] = useState<{
    added: number;
    skipped: number;
    details: string[];
  }>({ added: 0, skipped: 0, details: [] });
  const [showResults, setShowResults] = useState(false);
  const { toast } = useToast();

  const processDomainBulkMutation = useMutation({
    mutationFn: async (domains: DomainInput[]) => {
      const res = await apiRequest("/api/admin/domains/bulk", { 
        method: "POST", 
        body: JSON.stringify({ domains }) 
      });
      return await res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/domains"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/domains/stats"] });
      setBulkResults({
        added: data.added,
        skipped: data.skipped,
        details: data.details
      });
      setShowResults(true);
      toast({
        title: "Bulk upload complete",
        description: `Successfully added ${data.added} domains, skipped ${data.skipped} duplicates.`
      });
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Upload failed",
        description: error.message,
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!domainText.trim()) {
      toast({
        variant: "destructive",
        title: "No domains provided",
        description: "Please enter at least one domain name"
      });
      return;
    }
    
    const domains: DomainInput[] = parseDomainInput(domainText);
    if (!domains.length) {
      toast({
        variant: "destructive",
        title: "Invalid format",
        description: "Please check the format of your domain names"
      });
      return;
    }
    
    processDomainBulkMutation.mutate(domains);
  };

  const parseDomainInput = (input: string): DomainInput[] => {
    // Split by new lines and filter out empty lines
    const lines = input.split('\n').filter(line => line.trim().length > 0);
    
    return lines.map(line => {
      const [domainName, category, price] = line.split(',').map(s => s.trim());
      
      if (!domainName) return null;
      
      const result: DomainInput = { name: domainName };
      
      if (category) {
        result.category = category;
      }
      
      if (price && !isNaN(Number(price))) {
        result.price = Number(price);
      }
      
      return result;
    }).filter(Boolean) as DomainInput[];
  };

  const sampleFormat = "domain1.com\ndomain2.com,Technology\ndomain3.com,Finance,1999";

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold">Bulk Upload Domains</h2>
      
      <Card>
        <CardHeader>
          <CardTitle>Add Multiple Domains</CardTitle>
          <CardDescription>
            Enter domain names, one per line. Optionally add category and price separated by commas.
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="domains">Domain Names</Label>
              <Textarea
                id="domains"
                placeholder={sampleFormat}
                rows={10}
                value={domainText}
                onChange={(e) => setDomainText(e.target.value)}
                className="font-mono"
              />
              <p className="text-sm text-muted-foreground">
                <Info className="h-4 w-4 inline-block mr-1" />
                Format: domainname.com, category, price (category and price are optional)
              </p>
            </div>
            
            {showResults && (
              <Alert>
                <CheckCircle2 className="h-4 w-4" />
                <AlertTitle>Upload Complete</AlertTitle>
                <AlertDescription>
                  <p className="mb-2">Added {bulkResults.added} domains, skipped {bulkResults.skipped} duplicates.</p>
                  {bulkResults.details.length > 0 && (
                    <div className="mt-2 max-h-40 overflow-y-auto text-xs">
                      {bulkResults.details.map((detail, idx) => (
                        <p key={idx} className="mb-1">{detail}</p>
                      ))}
                    </div>
                  )}
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
          <CardFooter>
            <Button 
              type="submit" 
              className="w-full bg-black hover:bg-neutral-800"
              disabled={processDomainBulkMutation.isPending}
            >
              {processDomainBulkMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                "Upload Domains"
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}