import { useState } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '../ui/card';
import { UploadCloud, Check, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';

interface FileUploaderProps {
  pageKey: string;
  onSuccess?: () => void;
}

export default function FileUploader({ pageKey, onSuccess }: FileUploaderProps) {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [error, setError] = useState("");
  const { toast } = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0] || null;
    setFile(selectedFile);
    setUploadSuccess(false);
    setError("");
  };

  const handleUpload = async () => {
    if (!file) {
      setError("Please select a file to upload");
      return;
    }

    setUploading(true);
    setError("");
    
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await fetch(`/api/admin/page-contents/${pageKey}/upload`, {
        method: 'POST',
        body: formData,
        credentials: 'include'
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Upload failed');
      }
      
      setUploadSuccess(true);
      toast({
        title: "Upload Successful",
        description: "File has been uploaded successfully",
      });
      
      if (onSuccess) {
        onSuccess();
      }
    } catch (err: any) {
      setError(err.message || 'Error uploading file');
      toast({
        title: "Upload Failed",
        description: err.message || 'Error uploading file',
        variant: "destructive"
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Upload File for {pageKey}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
            <UploadCloud className="mx-auto h-12 w-12 text-gray-400" />
            <div className="mt-2">
              <label htmlFor="file-upload" className="cursor-pointer text-blue-600 hover:text-blue-800">
                Select a file
              </label>
              <Input
                id="file-upload"
                type="file"
                className="hidden"
                onChange={handleFileChange}
                accept={pageKey === 'ebook-section' ? '.pdf' : '.pdf,.doc,.docx,.jpg,.jpeg,.png'}
              />
            </div>
            <p className="mt-1 text-sm text-gray-500">{pageKey === 'ebook-section' ? 'PDF files up to 10MB' : 'PDF, DOC, DOCX, JPG, JPEG, PNG up to 10MB'}</p>
          </div>
          
          {file && (
            <div className="flex items-center space-x-2 bg-gray-100 p-2 rounded">
              <div className="flex-1 truncate">{file.name}</div>
              <div className="text-gray-500 text-sm">{(file.size / 1024 / 1024).toFixed(2)} MB</div>
            </div>
          )}
          
          {error && (
            <div className="flex items-center text-red-500 space-x-2">
              <AlertCircle className="h-4 w-4" />
              <span className="text-sm">{error}</span>
            </div>
          )}
          
          {uploadSuccess && (
            <div className="flex items-center text-green-500 space-x-2">
              <Check className="h-4 w-4" />
              <span className="text-sm">File uploaded successfully</span>
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter>
        <Button 
          onClick={handleUpload} 
          disabled={!file || uploading}
          className="w-full"
        >
          {uploading ? 'Uploading...' : 'Upload File'}
        </Button>
      </CardFooter>
    </Card>
  );
}