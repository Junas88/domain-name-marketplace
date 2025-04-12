import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { FileUp, FileDown, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function EbooksManagement() {
  const { toast } = useToast();
  const [uploading, setUploading] = useState(false);
  const [ebooks] = useState([
    { 
      id: 1, 
      name: "Domain Marketing Guide.pdf", 
      size: "1.2 MB", 
      downloadCount: 367, 
      dateAdded: "Mar 15, 2025" 
    }
  ]);
  
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    const file = files[0];
    
    // For demo purposes, we're just showing a success toast
    setUploading(true);
    
    setTimeout(() => {
      setUploading(false);
      toast({
        title: "File Uploaded",
        description: `${file.name} was uploaded successfully.`,
      });
    }, 1500);
  };
  
  const handleDeleteEbook = (id: number) => {
    if (window.confirm("Are you sure you want to delete this ebook?")) {
      toast({
        title: "Ebook Deleted",
        description: "The ebook has been deleted successfully.",
      });
    }
  };
  
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Upload New Ebook</CardTitle>
          <CardDescription>Upload PDF files for your ebook downloads</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid w-full max-w-sm items-center gap-1.5">
            <Label htmlFor="ebook">Ebook File (PDF)</Label>
            <Input 
              id="ebook" 
              type="file" 
              accept=".pdf" 
              onChange={handleFileUpload}
              disabled={uploading}
            />
          </div>
          {uploading && (
            <div className="mt-4">
              <p className="text-sm">Uploading...</p>
              <div className="w-full mt-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                <div className="h-full bg-primary animate-pulse w-1/2"></div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Manage Ebooks</CardTitle>
          <CardDescription>View and manage your uploaded ebook files</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="p-2 text-left font-medium">File Name</th>
                  <th className="p-2 text-left font-medium">Size</th>
                  <th className="p-2 text-left font-medium">Downloads</th>
                  <th className="p-2 text-left font-medium">Date Added</th>
                  <th className="p-2 text-left font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {ebooks.map((ebook) => (
                  <tr key={ebook.id} className="border-b">
                    <td className="p-2">{ebook.name}</td>
                    <td className="p-2">{ebook.size}</td>
                    <td className="p-2">{ebook.downloadCount}</td>
                    <td className="p-2">{ebook.dateAdded}</td>
                    <td className="p-2">
                      <div className="flex space-x-2">
                        <Button size="sm" variant="outline">
                          <FileDown className="h-4 w-4 mr-1" />
                          Download
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="text-red-600 border-red-200 hover:bg-red-50" 
                          onClick={() => handleDeleteEbook(ebook.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Ebook Download Statistics</CardTitle>
          <CardDescription>Track the performance of your ebooks</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            <div className="p-4 border rounded-md">
              <div className="text-sm font-medium text-gray-500">Total Downloads</div>
              <div className="text-2xl font-bold">367</div>
            </div>
            <div className="p-4 border rounded-md">
              <div className="text-sm font-medium text-gray-500">Download Rate</div>
              <div className="text-2xl font-bold">12.5%</div>
              <div className="text-xs text-gray-500">Of total website visitors</div>
            </div>
            <div className="p-4 border rounded-md">
              <div className="text-sm font-medium text-gray-500">Average Daily</div>
              <div className="text-2xl font-bold">8.2</div>
              <div className="text-xs text-gray-500">Downloads per day</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}