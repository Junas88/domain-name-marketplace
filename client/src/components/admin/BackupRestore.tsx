import { useState, useRef } from 'react';
import { useMutation } from '@tanstack/react-query';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Loader2, Download, Upload, RefreshCw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ForceSync from './ForceSync';

export default function BackupRestore() {
  const { toast } = useToast();
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // Export domains
  const handleExport = async () => {
    try {
      setIsExporting(true);
      // Use window.open for direct download
      window.open('/api/admin/domains/export', '_blank');
      toast({
        title: 'Domain Data Exported',
        description: 'The domain data has been exported successfully.',
      });
      setTimeout(() => setIsExporting(false), 1000);
    } catch (error) {
      console.error('Error exporting domains:', error);
      toast({
        title: 'Export Failed',
        description: 'Failed to export domain data.',
        variant: 'destructive',
      });
      setIsExporting(false);
    }
  };

  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      setSelectedFile(files[0]);
    }
  };

  // Import domains mutation
  const importMutation = useMutation({
    mutationFn: async (domains: any[]) => {
      const res = await apiRequest('/api/admin/domains/import', {
        method: 'POST',
        body: JSON.stringify({ domains }),
      });
      return res.json();
    },
    onSuccess: (data) => {
      // Invalidate all domain-related queries
      queryClient.invalidateQueries({ queryKey: ['/api/domains'] });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/domains'] });
      queryClient.invalidateQueries({ queryKey: ['/api/domains/recently-sold'] });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/domains/stats'] });
      
      toast({
        title: 'Import Successful',
        description: data.message || `Successfully imported domain data`,
      });
      setSelectedFile(null);
      setIsImporting(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    },
    onError: (error: any) => {
      console.error('Import error:', error);
      toast({
        title: 'Import Failed',
        description: 'Failed to import domain data. Please check the file format.',
        variant: 'destructive',
      });
      setIsImporting(false);
    },
  });

  // Handle import
  const handleImport = async () => {
    if (!selectedFile) {
      toast({
        title: 'No File Selected',
        description: 'Please select a backup file to import.',
        variant: 'destructive',
      });
      return;
    }

    try {
      setIsImporting(true);
      const fileContent = await selectedFile.text();
      const parsedData = JSON.parse(fileContent);
      
      if (!parsedData.domains || !Array.isArray(parsedData.domains)) {
        throw new Error('Invalid backup file format');
      }
      
      importMutation.mutate(parsedData.domains);
    } catch (error) {
      console.error('Error parsing import file:', error);
      toast({
        title: 'Invalid Backup File',
        description: 'The selected file is not a valid domain backup.',
        variant: 'destructive',
      });
      setIsImporting(false);
    }
  };

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>Data Synchronization & Backup</CardTitle>
        <CardDescription>
          Keep your data in sync between environments and create backups
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="sync">
          <TabsList className="mb-4">
            <TabsTrigger value="sync">Sync Data</TabsTrigger>
            <TabsTrigger value="backup">Backup & Restore</TabsTrigger>
          </TabsList>
          
          <TabsContent value="sync">
            <ForceSync />
          </TabsContent>
          
          <TabsContent value="backup">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Export Domain Data</h3>
                <p className="text-muted-foreground mb-3">
                  Download a backup of all domain data. Use this to transfer data between environments.
                </p>
                <Button 
                  onClick={handleExport} 
                  disabled={isExporting}
                  variant="default"
                  className="w-full flex items-center justify-center gap-2"
                >
                  {isExporting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Exporting...
                    </>
                  ) : (
                    <>
                      <Download className="h-4 w-4" />
                      Export Domain Data
                    </>
                  )}
                </Button>
              </div>
              
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Import Domain Data</h3>
                <p className="text-muted-foreground mb-3">
                  Restore from a backup or import data from another environment.
                </p>
                <div className="flex flex-col space-y-2">
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept=".json"
                    className="block w-full text-sm text-gray-500
                      file:mr-4 file:py-2 file:px-4
                      file:rounded-md file:border-0
                      file:text-sm file:font-semibold
                      file:bg-primary file:text-primary-foreground
                      hover:file:bg-primary/90"
                  />
                  <Button 
                    onClick={handleImport} 
                    disabled={isImporting || !selectedFile}
                    variant="default"
                    className="w-full flex items-center justify-center gap-2"
                  >
                    {isImporting ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Importing...
                      </>
                    ) : (
                      <>
                        <Upload className="h-4 w-4" />
                        Import Domain Data
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}