import { Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export default function OffersManagement() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Domain Offers</CardTitle>
          <CardDescription>View and manage offers from potential buyers</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-gray-500 mb-4">No offers received yet.</p>
          </div>
        </CardContent>
      </Card>
      
      <div className="mt-6">
        <Card>
          <CardHeader>
            <CardTitle>Offer Statistics</CardTitle>
            <CardDescription>Overview of offers received and conversion rates</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              <div className="flex flex-col">
                <span className="text-sm font-medium text-gray-500">Total Offers</span>
                <span className="text-2xl font-bold">0</span>
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-medium text-gray-500">Avg. Offer Amount</span>
                <span className="text-2xl font-bold">$0</span>
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-medium text-gray-500">Conversion Rate</span>
                <span className="text-2xl font-bold">0%</span>
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-medium text-gray-500">Pending Offers</span>
                <span className="text-2xl font-bold">0</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}