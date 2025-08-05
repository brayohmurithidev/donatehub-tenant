import {Card, CardContent, CardDescription, CardHeader, CardTitle,} from "@/components/ui/card";
import {Button} from "@/components/ui/button";
import {Progress} from "@/components/ui/progress";
import {Eye} from "lucide-react";
import {useGetCampaigns} from "@/hooks/api/useCampaigns";
import CreateCampaignModal from "@/components/CreateCampaignModal";
import {useState} from "react";
import {LoadingSpinner} from "@/components/loadingSpinner";
import type {Campaign} from "@/lib/types";
import {Badge} from "@/components/ui/badge";
import {ViewCampaignSheet} from "@/components/ViewCampaignSheet";

// const dummyCampaigns = [
//   {
//     id: "1",
//     title: "Clean Water for All",
//     category: "Health",
//     status: "active",
//     createdAt: "2025-07-10",
//     raised: 350000,
//     goal: 1000000,
//     supporters: 120,
//     endDate: "2025-08-15",
//   },
//   {
//     id: "2",
//     title: "Education for Every Child",
//     category: "Education",
//     status: "completed",
//     createdAt: "2025-06-01",
//     raised: 1000000,
//     goal: 1000000,
//     supporters: 450,
//     endDate: "2025-07-01",
//   },
//   {
//     id: "3",
//     title: "Feed the Hungry",
//     category: "Food & Relief",
//     status: "active",
//     createdAt: "2025-07-20",
//     raised: 200000,
//     goal: 500000,
//     supporters: 95,
//     endDate: "2025-08-30",
//   },
// ];

function formatDate(date: string) {
  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function getDaysLeft(endDate: string) {
  const today = new Date();
  const end = new Date(endDate);
  const diff = Math.ceil(
    (end.getTime() - today.getTime()) / (1000 * 60 * 60 * 24),
  );
  return diff > 0 ? `${diff} days` : "0 days";
}

export default function Campaigns() {
  const { data: campaigns, isLoading: fetchingCampaigns } = useGetCampaigns();
  const [isOpen, setIsOpen] = useState(false);

  if (fetchingCampaigns)
    return (
      <div className="flex justify-center items-center w-screen mt-6">
        <LoadingSpinner size={40} />
      </div>
    );

  if (!campaigns) {
    return (
      <Card className="p-3">

        <CardHeader className="flex flex-col items-center justify-center space-y-4">
          <p className="text-xl font-semibold">No campaigns found!</p>
          <CreateCampaignModal
            isOpen={isOpen}
            setIsOpen={setIsOpen}
            onSubmit={() => console.log}
          />
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Your Campaigns</CardTitle>

        <CardDescription>
          Manage and monitor all your fundraising campaigns
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {campaigns.length > 0 &&
            campaigns.map((campaign: Campaign) => (
              <div key={campaign.id} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h3 className="font-semibold">{campaign.title}</h3>
                    <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                      <Badge
                        variant={
                          campaign.status === "active" ? "default" : "secondary"
                        }
                      >
                        {campaign.status.charAt(0).toUpperCase() +
                          campaign.status.slice(1)}
                      </Badge>
                      {/*<span>{campaign.category}</span>*/}
                      <span>•</span>
                      <span>Created {formatDate(campaign?.created_at)}</span>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                      {campaign?.id && <ViewCampaignSheet campaignId={campaign?.id}>
                          <Button size="sm" variant="outline">
                              <Eye className="h-4 w-4"/> View Campaign
                          </Button>
                      </ViewCampaignSheet>}

                    {/*<Button size="sm" variant="outline">*/}
                    {/*  <Edit className="h-4 w-4" />*/}
                    {/*</Button>*/}
                    {/*<Button size="sm" variant="outline">*/}
                    {/*  <Trash2 className="h-4 w-4" />*/}
                    {/*</Button>*/}
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-3">
                  <div>
                    <p className="text-sm text-muted-foreground">Raised</p>
                    <p className="font-semibold">
                      KES {campaign?.current_amount.toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Goal</p>
                    <p className="font-semibold">
                      KES {campaign.goal_amount.toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Supporters</p>
                    <p className="font-semibold">{campaign.total_donors}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Days Left</p>
                    <p className="font-semibold">
                      {campaign?.status === "completed"
                        ? "Completed"
                        : getDaysLeft(campaign.end_date)}
                    </p>
                  </div>
                </div>

                <Progress  value={campaign?.percent_funded} className="h-3" />
              </div>
            ))}
        </div>
      </CardContent>
    </Card>
  );
}
