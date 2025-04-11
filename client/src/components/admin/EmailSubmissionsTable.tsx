import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Search, Download } from 'lucide-react';
import { format } from 'date-fns';

interface EmailSubmission {
  id: number;
  email: string;
  source: string;
  downloadedAt: string;
}

export default function EmailSubmissionsTable() {
  const [searchQuery, setSearchQuery] = useState('');
  
  // Fetch email submissions
  const { data: emailSubmissions, isLoading, error } = useQuery<EmailSubmission[]>({
    queryKey: ['/api/admin/email-submissions'],
    refetchInterval: 30000, // Refresh every 30 seconds
  });
  
  // Filter submissions based on search query
  const filteredSubmissions = emailSubmissions?.filter(submission => 
    submission.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    submission.source.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Export to CSV
  const exportToCSV = () => {
    if (!emailSubmissions || emailSubmissions.length === 0) return;
    
    const headers = ['ID', 'Email', 'Source', 'Downloaded At'];
    const csvRows = [
      headers.join(','),
      ...emailSubmissions.map(submission => {
        const date = new Date(submission.downloadedAt);
        return [
          submission.id,
          `"${submission.email}"`, // Wrapped in quotes to handle emails with commas
          submission.source,
          format(date, 'yyyy-MM-dd HH:mm:ss')
        ].join(',');
      })
    ];
    
    const csvString = csvRows.join('\n');
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `email-submissions-${format(new Date(), 'yyyy-MM-dd')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Email Submissions</CardTitle>
        <CardDescription>Manage emails collected from ebook downloads and other sources</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex justify-between items-center mb-6">
          <div className="relative w-full md:w-1/3">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search emails..."
              className="pl-8"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </div>
          <Button 
            variant="outline" 
            className="ml-2 flex items-center"
            onClick={exportToCSV}
            disabled={!emailSubmissions || emailSubmissions.length === 0}
          >
            <Download className="mr-2 h-4 w-4" />
            Export CSV
          </Button>
        </div>
        
        <div className="rounded-md border">
          <Table>
            <TableCaption>Email submissions collected from your website</TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Source</TableHead>
                <TableHead>Date Submitted</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-4">Loading submissions...</TableCell>
                </TableRow>
              ) : error ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-red-500 py-4">
                    Error loading submissions
                  </TableCell>
                </TableRow>
              ) : !filteredSubmissions || filteredSubmissions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-4">
                    {searchQuery ? 'No matching submissions found' : 'No email submissions yet'}
                  </TableCell>
                </TableRow>
              ) : (
                filteredSubmissions.map(submission => (
                  <TableRow key={submission.id}>
                    <TableCell>{submission.id}</TableCell>
                    <TableCell className="font-medium">{submission.email}</TableCell>
                    <TableCell>{submission.source}</TableCell>
                    <TableCell>
                      {format(new Date(submission.downloadedAt), 'MMM d, yyyy h:mm a')}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}