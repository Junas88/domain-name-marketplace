import { useState, useRef } from 'react';
import { useToast } from "@/hooks/use-toast";
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Download, Upload, AlertTriangle } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { apiRequest } from '@/lib/queryClient';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export default function BackupRestore() {
  const { toast } = useToast();
  const [isBackingUp, setIsBackingUp] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);
  const [progress, setProgress] = useState(0);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleBackup = async () => {
    setIsBackingUp(true);
    
    try {
      const timestamp = new Date().toISOString().split('T')[0];
      
      const response = await apiRequest('GET', '/api/admin/backup', undefined, {
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0',
        }
      });
      
      if (!response.ok) {
        throw new Error(`Failed to create backup: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      // Create and download backup file
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = `domain-guide-backup-${timestamp}.json`;
      document.body.appendChild(a);
      a.click();
      
      // Cleanup
      window.URL.revokeObjectURL(url);
      a.remove();
      
      toast({
        title: "Backup Created Successfully",
        description: "Your backup file has been downloaded",
      });
    } catch (error) {
      console.error('Backup error:', error);
      toast({
        title: "Backup Failed",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive",
      });
    } finally {
      setIsBackingUp(false);
    }
  };
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFile(e.target.files[0]);
    }
  };
  
  const handleRestore = async () => {
    if (!selectedFile) {
      toast({
        title: "No File Selected",
        description: "Please select a backup file to restore",
        variant: "destructive",
      });
      return;
    }
    
    setIsRestoring(true);
    setProgress(10);
    
    try {
      // Read the file content
      const reader = new FileReader();
      
      const filePromise = new Promise<string>((resolve, reject) => {
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
      });
      
      reader.readAsText(selectedFile);
      const fileContent = await filePromise;
      
      setProgress(30);
      
      // Parse the JSON
      const backupData = JSON.parse(fileContent);
      
      setProgress(50);
      
      // Send it to the API
      const response = await apiRequest('POST', '/api/admin/restore', backupData, {
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      setProgress(80);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Restore failed');
      }
      
      setProgress(100);
      
      // Reset file input
      setSelectedFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      
      toast({
        title: "Restore Completed Successfully",
        description: "Your data has been restored from the backup",
      });
      
      // Force page reload after short delay
      setTimeout(() => {
        window.location.reload();
      }, 1500);
      
    } catch (error) {
      console.error('Restore error:', error);
      toast({
        title: "Restore Failed",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive",
      });
    } finally {
      setIsRestoring(false);
    }
  };
  
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">Backup & Restore</CardTitle>
        <CardDescription>Create and restore backups of your domain data</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Backup Card */}
          <Card className="border border-muted">
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center">
                <Download className="h-4 w-4 mr-2" />
                Create Backup
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Download a complete backup of all domain data, content, and settings.
              </p>
            </CardContent>
            <CardFooter>
              <Button 
                onClick={handleBackup} 
                disabled={isBackingUp}
                className="w-full"
              >
                {isBackingUp ? 'Creating Backup...' : 'Download Backup'}
              </Button>
            </CardFooter>
          </Card>
          
          {/* Restore Card */}
          <Card className="border border-muted">
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center">
                <Upload className="h-4 w-4 mr-2" />
                Restore Backup
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-muted-foreground">
                Upload and restore a previously created backup file.
              </p>
              
              <div>
                <Label htmlFor="backup-file">Select backup file</Label>
                <div className="mt-1">
                  <input
                    ref={fileInputRef}
                    id="backup-file"
                    type="file"
                    accept=".json"
                    onChange={handleFileChange}
                    className="block w-full text-sm text-slate-500
                      file:mr-4 file:py-2 file:px-4
                      file:rounded-md file:border-0
                      file:text-sm file:font-semibold
                      file:bg-secondary file:text-foreground
                      hover:file:bg-secondary/80
                      cursor-pointer"
                  />
                </div>
                {selectedFile && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Selected: {selectedFile.name}
                  </p>
                )}
              </div>
              
              {isRestoring && (
                <div className="space-y-1">
                  <Progress value={progress} className="h-2" />
                  <p className="text-xs text-muted-foreground text-right">
                    {progress}% complete
                  </p>
                </div>
              )}
            </CardContent>
            <CardFooter>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button 
                    variant="outline"
                    disabled={!selectedFile || isRestoring}
                    className="w-full"
                  >
                    {isRestoring ? 'Restoring...' : 'Restore from Backup'}
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle className="flex items-center">
                      <AlertTriangle className="h-5 w-5 mr-2 text-amber-500" />
                      Confirm Restore Operation
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                      This will replace all current data with the data from the backup file.
                      This action cannot be undone. Are you sure you want to continue?
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleRestore}>
                      Yes, Restore Data
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </CardFooter>
          </Card>
        </div>
        
        <div className="text-sm text-muted-foreground bg-muted p-3 rounded-md">
          <p className="font-medium">Important Notes:</p>
          <ul className="list-disc list-inside mt-1 space-y-1">
            <li>Backups include all domains, content, settings, and relationships</li>
            <li>Restoring will replace existing data that matches IDs in the backup</li>
            <li>Restore operations cannot be undone - create a new backup before restoring</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}