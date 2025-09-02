import {Card, CardContent, CardDescription, CardHeader, CardTitle,} from "@/components/ui/card";
import {Button} from "@/components/ui/button";
import {Progress} from "@/components/ui/progress";
import {Eye, Plus, Target, Calendar, Users, DollarSign, TrendingUp, Image as ImageIcon} from "lucide-react";
import {useGetCampaigns} from "@/hooks/api/useCampaigns";
import CreateCampaignModal from "@/components/CreateCampaignModal";
import {useState} from "react";
import {LoadingSpinner} from "@/components/loadingSpinner";
import type {Campaign} from "@/lib/types";
import {Badge} from "@/components/ui/badge";
import {ViewCampaignSheet} from "@/components/ViewCampaignSheet";

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

function getStatusColor(status: string) {
  switch (status.toLowerCase()) {
    case 'active':
      return 'success';
    case 'completed':
      return 'primary';
    case 'cancelled':
      return 'danger';
    default:
      return 'secondary';
  }
}

function getStatusIcon(status: string) {
  switch (status.toLowerCase()) {
    case 'active':
      return Target;
    case 'completed':
      return TrendingUp;
    case 'cancelled':
      return Calendar;
    default:
      return Target;
  }
}

const Campaigns = () => {
  const { data: campaigns, isLoading: fetchingCampaigns } = useGetCampaigns();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  if (fetchingCampaigns) {
    return (
      <div className="flex justify-center items-center py-16">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          <p className="text-gray-600">Loading campaigns...</p>
        </div>
      </div>
    );
  }

  if (!campaigns || campaigns.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="max-w-md mx-auto">
          <div className="w-24 h-24 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Target className="h-12 w-12 text-primary" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No campaigns yet</h3>
          <p className="text-gray-600 mb-6">
            Start your first fundraising campaign to make a difference in your community.
          </p>
          <CreateCampaignModal
            isOpen={isCreateModalOpen}
            setIsOpen={setIsCreateModalOpen}
            onSubmit={() => console.log("Campaign created")}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Your Campaigns</h2>
          <p className="text-gray-600">Manage and monitor all your fundraising campaigns</p>
        </div>
        <CreateCampaignModal
          isOpen={isCreateModalOpen}
          setIsOpen={setIsCreateModalOpen}
          onSubmit={() => console.log("Campaign created")}
        />
      </div>

      {/* Campaigns Grid */}
      <div className="grid gap-8">
        {campaigns.map((campaign: Campaign, index: number) => {
          const StatusIcon = getStatusIcon(campaign.status);
          const statusColor = getStatusColor(campaign.status);
          
          return (
            <div key={campaign.id} className="relative">
              <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 group overflow-hidden">
                <div className="flex flex-col lg:flex-row">
                  {/* Campaign Image Section */}
                  <div className="lg:w-1/3 relative">
                    {campaign.image_url ? (
                      <div className="h-48 lg:h-full min-h-[200px] relative overflow-hidden">
                        <img
                          src={campaign.image_url}
                          alt={campaign.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        {/* Image Overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      </div>
                    ) : (
                      <div className="h-48 lg:h-full min-h-[200px] bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                        <div className="text-center">
                          <ImageIcon className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                          <p className="text-sm text-gray-500">No image</p>
                        </div>
                      </div>
                    )}
                    
                    {/* Status Badge on Image */}
                    <div className="absolute top-4 left-4">
                      <Badge 
                        className={`bg-${statusColor} text-white border-0 shadow-lg`}
                      >
                        <StatusIcon className="h-3 w-3 mr-1" />
                        {campaign.status.charAt(0).toUpperCase() + campaign.status.slice(1)}
                      </Badge>
                    </div>
                  </div>

                  {/* Campaign Content Section */}
                  <div className="lg:w-2/3">
                    <CardHeader className="pb-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <CardTitle className="text-2xl font-bold text-gray-900 mb-2 group-hover:text-primary transition-colors">
                            {campaign.title}
                          </CardTitle>
                          <CardDescription className="text-base text-gray-600 mb-3 line-clamp-2">
                            {campaign.description || "No description available"}
                          </CardDescription>
                          <div className="flex items-center gap-3 text-sm text-gray-500">
                            <span className="flex items-center gap-1">
                              <Calendar className="h-4 w-4" />
                              Created {formatDate(campaign?.created_at)}
                            </span>
                            <span className="flex items-center gap-1">
                              <Calendar className="h-4 w-4" />
                              Ends {formatDate(campaign.end_date)}
                            </span>
                          </div>
                        </div>
                        
                        {/* Action Buttons */}
                        <div className="flex items-center gap-2">
                          {campaign?.id && (
                            <ViewCampaignSheet campaignId={campaign?.id}>
                              <Button size="sm" className="bg-primary hover:bg-primary-light text-white">
                                <Eye className="h-4 w-4 mr-2" />
                                View Details
                              </Button>
                            </ViewCampaignSheet>
                          )}
                        </div>
                      </div>
                    </CardHeader>

                    <CardContent className="pt-0">
                      {/* Campaign Stats Grid */}
                      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                        <div className="text-center p-3 rounded-lg bg-success-50 border border-success-100">
                          <div className="flex items-center justify-center w-10 h-10 bg-success-100 rounded-full mx-auto mb-2">
                            <DollarSign className="h-5 w-5 text-success" />
                          </div>
                          <p className="text-sm text-gray-600 mb-1">Raised</p>
                          <p className="font-bold text-gray-900">
                            KES {campaign?.current_amount?.toLocaleString() || "0"}
                          </p>
                        </div>
                        
                        <div className="text-center p-3 rounded-lg bg-warning-50 border border-warning-100">
                          <div className="flex items-center justify-center w-10 h-10 bg-warning-100 rounded-full mx-auto mb-2">
                            <Target className="h-5 w-5 text-warning" />
                          </div>
                          <p className="text-sm text-gray-600 mb-1">Goal</p>
                          <p className="font-bold text-gray-900">
                            KES {campaign.goal_amount?.toLocaleString() || "0"}
                          </p>
                        </div>
                        
                        <div className="text-center p-3 rounded-lg bg-primary-50 border border-primary-100">
                          <div className="flex items-center justify-center w-10 h-10 bg-primary-100 rounded-full mx-auto mb-2">
                            <Users className="h-5 w-5 text-primary" />
                          </div>
                          <p className="text-sm text-gray-600 mb-1">Supporters</p>
                          <p className="font-bold text-gray-900">
                            {campaign.total_donors || "0"}
                          </p>
                        </div>
                        
                        <div className="text-center p-3 rounded-lg bg-info-50 border border-info-100">
                          <div className="flex items-center justify-center w-10 h-10 bg-info-100 rounded-full mx-auto mb-2">
                            <Calendar className="h-5 w-5 text-info" />
                          </div>
                          <p className="text-sm text-gray-600 mb-1">Time Left</p>
                          <p className="font-bold text-gray-900">
                            {campaign?.status === "completed"
                              ? "Completed"
                              : getDaysLeft(campaign.end_date)}
                          </p>
                        </div>
                      </div>

                      {/* Progress Bar */}
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium text-gray-700">Funding Progress</span>
                          <span className="text-lg font-bold text-gray-900">
                            {campaign?.percent_funded?.toFixed(1) || "0"}%
                          </span>
                        </div>
                        <Progress 
                          value={campaign?.percent_funded || 0} 
                          className="h-3 bg-gray-200"
                        />
                        <div className="flex justify-between text-xs text-gray-500">
                          <span>KES {campaign?.current_amount?.toLocaleString() || "0"} raised</span>
                          <span>KES {campaign.goal_amount?.toLocaleString() || "0"} goal</span>
                        </div>
                      </div>
                    </CardContent>
                  </div>
                </div>
              </Card>

              {/* Visual Separator */}
              {index < campaigns.length - 1 && (
                <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2">
                  <div className="w-1 h-4 bg-gradient-to-b from-gray-200 to-transparent"></div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Campaigns;
