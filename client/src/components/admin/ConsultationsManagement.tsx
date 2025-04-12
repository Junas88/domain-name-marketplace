import { Consultation } from "@shared/schema";
import { Loader2 } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";

interface ConsultationsManagementProps {
  consultations: Consultation[];
  isLoading: boolean;
}

export default function ConsultationsManagement({ consultations, isLoading }: ConsultationsManagementProps) {
  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold">Domain Finder Consultations</h2>
      {consultations.length === 0 ? (
        <div className="text-center py-8 border rounded-md">
          <p className="text-gray-500">No consultation requests received yet.</p>
        </div>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Budget</TableHead>
                <TableHead>Industry</TableHead>
                <TableHead>Message</TableHead>
                <TableHead>Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {consultations.map((consultation) => (
                <TableRow key={consultation.id}>
                  <TableCell className="font-medium">{consultation.name}</TableCell>
                  <TableCell>{consultation.email}</TableCell>
                  <TableCell>{consultation.phone}</TableCell>
                  <TableCell>${consultation.budget}</TableCell>
                  <TableCell>
                    <Badge variant="secondary">{consultation.industry}</Badge>
                  </TableCell>
                  <TableCell className="max-w-md truncate">{consultation.message}</TableCell>
                  <TableCell>{format(new Date(consultation.createdAt), "MMM d, yyyy")}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}