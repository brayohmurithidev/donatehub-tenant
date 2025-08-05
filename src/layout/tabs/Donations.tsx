import {Card, CardContent, CardDescription, CardHeader, CardTitle,} from "@/components/ui/card";
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow,} from "@/components/ui/table";
import {Button} from "@/components/ui/button";
import {Badge} from "@/components/ui/badge";
import {Download} from "lucide-react";
import {useGetDonations} from "@/hooks/api/useDonation";
import {LoadingSpinner} from "@/components/loadingSpinner";
import type {DonationType} from "@/lib/types";

function formatDate(date: string) {
  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "numeric",
    hour12: true,
  });
}

const Donations = () => {
  const { data: donations, isLoading } = useGetDonations();
  if (isLoading)
    return (
      <div className="flex justify-center items-center w-screen mt-6">
        <LoadingSpinner size={40} />
      </div>
    );

  if (!donations) {
    return (
      <Card className="p-3">
        <CardHeader className="flex flex-col items-center justify-center space-y-4">
          <p className="text-xl font-semibold">No Donations yet!</p>
        </CardHeader>
      </Card>
    );
  }
  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <CardTitle>Donation History</CardTitle>
            <CardDescription>
              Track all donations received across your campaigns
            </CardDescription>
          </div>
          <Button variant="outline" className="flex items-center space-x-2">
            <Download className="h-4 w-4" />
            <span>Export</span>
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Donor</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Campaign</TableHead>
              <TableHead>Method</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {donations.map((donation: DonationType) => {
              return (
                <TableRow key={donation.id}>
                  <TableCell className="font-medium">
                    {donation?.donor_name || "Anonymous"}
                  </TableCell>
                  <TableCell>KES {donation?.amount.toLocaleString()}</TableCell>
                  <TableCell>{donation?.campaign?.title ?? "N/A"}</TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {donation?.method.toUpperCase()}
                    </Badge>
                  </TableCell>
                  <TableCell>{formatDate(donation.donated_at)}</TableCell>
                  <TableCell>
                    <Badge
                      className={`${donation.status === "SUCCESS" ? "bg-green-600" : "bg-red-500"}`}
                    >
                      {donation.status === "SUCCESS" ? "PAID" : "NOT PAID"}
                    </Badge>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default Donations;
