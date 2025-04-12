import { useState } from "react";
import { EmailSubmission } from "@shared/schema";
import { Loader2, FileDown, Search } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { format } from "date-fns";

interface EmailSubmissionsManagementProps {
  emailSubmissions: EmailSubmission[];
  isLoading: boolean;
}

export default function EmailSubmissionsManagement({ emailSubmissions, isLoading }: EmailSubmissionsManagementProps) {
  const [searchTerm, setSearchTerm] = useState("");
  
  // Filter submissions based on search term
  const filteredSubmissions = emailSubmissions.filter(submission => {
    const searchLower = searchTerm.toLowerCase();
    return (
      submission.email.toLowerCase().includes(searchLower) ||
      (submission.source && submission.source.toLowerCase().includes(searchLower))
    );
  });
  
  // Export to CSV
  const exportToCSV = () => {
    const headers = ["Email", "Source", "Date"];
    const csvData = filteredSubmissions.map(submission => [
      submission.email,
      submission.source || "Unknown",
      format(new Date(submission.createdAt), "yyyy-MM-dd HH:mm:ss")
    ]);
    
    const csvContent = [
      headers.join(","),
      ...csvData.map(row => row.join(","))
    ].join("\n");
    
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `email-submissions-${format(new Date(), "yyyy-MM-dd")}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">Email Submissions</h2>
        <Button variant="outline" onClick={exportToCSV}>
          <FileDown className="h-4 w-4 mr-2" />
          Export to CSV
        </Button>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Email Subscribers</CardTitle>
          <CardDescription>Manage email subscribers for your ebook and marketing campaigns</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex mb-4">
            <div className="relative w-full max-w-sm">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
              <Input
                type="search"
                placeholder="Search emails..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          
          {filteredSubmissions.length === 0 ? (
            <div className="text-center py-8 border rounded-md">
              <p className="text-gray-500">No email submissions found.</p>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Email</TableHead>
                    <TableHead>Source</TableHead>
                    <TableHead>Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredSubmissions.map((submission) => (
                    <TableRow key={submission.id}>
                      <TableCell className="font-medium">{submission.email}</TableCell>
                      <TableCell>{submission.source || "Unknown"}</TableCell>
                      <TableCell>{format(new Date(submission.createdAt), "MMM d, yyyy")}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
          
          <div className="mt-4 text-sm text-gray-500">
            Showing {filteredSubmissions.length} of {emailSubmissions.length} email submissions
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Email Submission Statistics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            <div className="flex flex-col">
              <span className="text-sm font-medium text-gray-500">Total Submissions</span>
              <span className="text-2xl font-bold">{emailSubmissions.length}</span>
            </div>
            
            <div className="flex flex-col">
              <span className="text-sm font-medium text-gray-500">Unique Domains</span>
              <span className="text-2xl font-bold">
                {new Set(emailSubmissions.map(s => s.email.split('@')[1])).size}
              </span>
            </div>
            
            <div className="flex flex-col">
              <span className="text-sm font-medium text-gray-500">Last Submission</span>
              <span className="text-2xl font-bold">
                {emailSubmissions.length > 0 
                  ? format(new Date(emailSubmissions[emailSubmissions.length - 1].createdAt), "MMM d")
                  : "N/A"}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}