import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {Badge} from "@/components/ui/badge";
import {Progress} from "@/components/ui/progress";
import {DollarSign, Target, TrendingUp, Users, Heart} from "lucide-react";
import {useGetDashboardStats} from "@/hooks/api/useStats";

const Overview = () => {
  const { data: dashboardStats, isLoading } = useGetDashboardStats();

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-16">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          <p className="text-gray-600">Loading dashboard data...</p>
        </div>
      </div>
    );
  }

  // Format currency values
  const formatCurrency = (amount: number) => {
    return `KES ${amount?.toLocaleString() || '0'}`;
  };

  // Format percentage values
  const formatPercentage = (value: number) => {
    if (value === 0) return '0%';
    if (value < 1) {
      const percentage = value * 100;
      // Handle very small values that would show as 0.00%
      if (percentage < 0.01) return '<0.01%';
      return `${percentage.toFixed(2)}%`;
    }
    return `${value.toFixed(1)}%`;
  };

  // Get success rate color based on value
  const getSuccessRateColor = (rate: number) => {
    if (rate >= 80) return 'success';
    if (rate >= 60) return 'warning';
    if (rate >= 20) return 'info';
    return 'danger';
  };

  // Stats configuration with real data
  const statsConfig = [
    { 
      label: "Total Raised", 
      value: formatCurrency(dashboardStats?.total_amount_contributed || 0), 
      icon: DollarSign, 
      color: "success",
      description: "Total donations received"
    },
    { 
      label: "Total Donors", 
      value: dashboardStats?.total_donors || 0, 
      icon: Users, 
      color: "primary",
      description: "Unique contributors"
    },
    { 
      label: "Active Campaigns", 
      value: dashboardStats?.total_campaigns || 0, 
      icon: Target, 
      color: "warning",
      description: "Ongoing campaigns"
    },
    { 
      label: "Success Rate", 
      value: formatPercentage(dashboardStats?.overall_success_rate || 0), 
      icon: TrendingUp, 
      color: "info",
      description: "Overall campaign success"
    },
  ];

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      {/* <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Dashboard Overview</h2>
        <p className="text-gray-600">Here's what's happening with your campaigns and donations</p>
      </div> */}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsConfig.map((stat) => {
          const IconComponent = stat.icon;
          return (
            <Card key={stat.label} className="group hover:shadow-lg transition-all duration-300 border-0 shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between pb-3 space-y-0">
                <CardTitle className="text-sm font-medium text-gray-600">
                  {stat.label}
                </CardTitle>
                <div className={`p-2 rounded-lg bg-${stat.color}-50 group-hover:bg-${stat.color}-100 transition-colors`}>
                  <IconComponent className={`h-4 w-4 text-${stat.color}-600`} />
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="text-2xl font-bold text-gray-900">
                  {stat.value}
                </div>
                <p className="text-xs text-gray-500">
                  {stat.description}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Recent Activity Section */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent Donations */}
        <Card className="border-0 shadow-sm hover:shadow-lg transition-all duration-300">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-2">
              <Heart className="h-5 w-5 text-danger" />
              <CardTitle className="text-lg font-semibold">Recent Donations</CardTitle>
            </div>
            <p className="text-sm text-gray-600">Latest contributions to your campaigns</p>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {dashboardStats?.recent_donors && dashboardStats.recent_donors.length > 0 ? (
                dashboardStats.recent_donors.slice(0, 5).map((donation: any, i: number) => (
                  <div
                    key={`${donation.id}-${i}`}
                    className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center">
                        <Heart className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">
                          {donation.donor_name || "Anonymous"}
                        </p>
                        <p className="text-sm text-gray-600">
                          {donation.campaign_name || "Unknown Campaign"}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">
                        {formatCurrency(donation.amount)}
                      </p>
                      <Badge variant="outline" className="text-xs uppercase mt-1">
                        {donation.paymentMethod || "Unknown"}
                      </Badge>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Heart className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                  <p>No recent donations yet</p>
                  <p className="text-sm">Donations will appear here once they come in</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Top Performing Campaigns */}
        <Card className="border-0 shadow-sm hover:shadow-lg transition-all duration-300">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-2">
              <Target className="h-5 w-5 text-success" />
              <CardTitle className="text-lg font-semibold">Top Campaigns</CardTitle>
            </div>
            <p className="text-sm text-gray-600">Your best performing fundraising initiatives</p>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {dashboardStats?.top_performing_campaigns && dashboardStats.top_performing_campaigns.length > 0 ? (
                dashboardStats.top_performing_campaigns
                  .filter((campaign: any) => campaign.amount > 0) // Only show campaigns with actual donations
                  .slice(0, 5) // Limit to top 5
                  .map((campaign: any) => (
                    <div key={campaign.id} className="space-y-2">
                      <div className="flex justify-between items-start">
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-gray-900 truncate">
                            {campaign.title || "Untitled Campaign"}
                          </h4>
                          <p className="text-sm text-gray-600">
                            {formatCurrency(campaign.amount)} raised
                          </p>
                        </div>
                        <Badge 
                          variant="outline" 
                          className={`text-xs border-${getSuccessRateColor(campaign.success_rate)} text-${getSuccessRateColor(campaign.success_rate)}`}
                        >
                          {formatPercentage(campaign.success_rate)}
                        </Badge>
                      </div>
                      <Progress
                        value={Math.min(campaign.success_rate, 100)}
                        className="h-2"
                      />
                    </div>
                  ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Target className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                  <p>No campaigns yet</p>
                  <p className="text-sm">Create your first campaign to see performance data</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="border-0 shadow-sm bg-gradient-to-r from-primary-50 to-secondary-50">
        <CardContent className="p-6">
          <div className="text-center">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Ready to make an impact?</h3>
            <p className="text-gray-600 mb-4">Start a new campaign or explore your existing ones</p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary-light transition-colors font-medium">
                Create Campaign
              </button>
              <button className="px-6 py-2 border border-primary text-primary rounded-lg hover:bg-primary-50 transition-colors font-medium">
                View All Campaigns
              </button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Overview;
