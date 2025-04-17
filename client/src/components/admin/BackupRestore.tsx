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
      
      const response = await fetch('/api/admin/backup', {
        method: 'GET',
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
      const response = await fetch('/api/admin/restore', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(backupData)
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
    <div>
      <div className="flex flex-col space-y-3">
        <div>
          <Label htmlFor="backup-file" className="text-sm mb-1.5">Select backup file (.json)</Label>
          <div className="flex items-center gap-2">
            <input
              ref={fileInputRef}
              id="backup-file"
              type="file"
              accept=".json"
              onChange={handleFileChange}
              className="flex-1 text-xs text-slate-500 border border-slate-200 rounded py-1 px-2
                file:mr-2 file:py-1 file:px-2
                file:rounded file:border-0
                file:text-xs file:font-medium
                file:bg-blue-50 file:text-blue-600
                hover:file:bg-blue-100"
            />
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button 
                  variant="outline"
                  size="sm"
                  disabled={!selectedFile || isRestoring}
                  className="h-8 whitespace-nowrap"
                >
                  {isRestoring ? 'Restoring...' : 'Restore'}
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
          </div>
          {selectedFile && (
            <p className="text-xs text-blue-600 mt-1 font-medium">
              Selected: {selectedFile.name}
            </p>
          )}
        </div>
        
        {isRestoring && (
          <div className="space-y-1">
            <Progress value={progress} className="h-1.5" />
            <p className="text-xs text-slate-500 text-right">
              {progress}% complete
            </p>
          </div>
        )}
      </div>
    </div>
  );
}