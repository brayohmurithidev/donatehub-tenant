import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {Badge} from "@/components/ui/badge";
import {Progress} from "@/components/ui/progress";
import {DollarSign, Target, TrendingUp, UserIcon} from "lucide-react";

const stats = [
    { label: "Total Raised", value: "KES 1,230,000", icon: DollarSign },
    { label: "Total Donors", value: "318", icon: UserIcon },
    { label: "Active Campaigns", value: "12", icon: Target },
    { label: "Success Rate", value: "87%", icon: TrendingUp },
];

const recentDonations = [
    { id: 1, donorName: "Alice", campaignId: 1, amount: 5000, paymentMethod: "mpesa" },
    { id: 2, donorName: "Bob", campaignId: 2, amount: 12000, paymentMethod: "paypal" },
    { id: 3, donorName: "", campaignId: 1, amount: 3000, paymentMethod: "card" },
    { id: 4, donorName: "James", campaignId: 3, amount: 2000, paymentMethod: "bank" },
];

const campaigns = [
    { id: 1, title: "School Supplies for Kids", raised: 65000, goal: 100000, status: "active" },
    { id: 2, title: "Clean Water Project", raised: 92000, goal: 100000, status: "active" },
    { id: 3, title: "Emergency Medical Fund", raised: 70000, goal: 80000, status: "active" },
];

export default function Overview() {
    return (
        <div className="space-y-6">
            {/* Stats cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {stats.map((stat) => (
                    <Card key={stat.label}>
                        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                            <CardTitle className="text-sm font-medium">{stat.label}</CardTitle>
                            <stat.icon className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stat.value}</div>
                            <p className="text-xs text-muted-foreground">+20.1% from last month</p>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Donations & Top Campaigns */}
            <div className="grid lg:grid-cols-2 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Recent Donations</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {recentDonations.map((donation) => {
                                const campaign = campaigns.find((c) => c.id === donation.campaignId);
                                return (
                                    <div key={donation.id} className="flex items-center justify-between">
                                        <div>
                                            <p className="font-medium">{donation.donorName || "Anonymous"}</p>
                                            <p className="text-sm text-muted-foreground">{campaign?.title}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-semibold">KES {donation.amount.toLocaleString()}</p>
                                            <Badge variant="outline" className="text-xs uppercase">
                                                {donation.paymentMethod}
                                            </Badge>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Top Performing Campaigns</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {campaigns
                                .filter((c) => c.status === "active")
                                .map((campaign) => (
                                    <div key={campaign.id}>
                                        <div className="flex justify-between text-sm mb-1">
                                            <span className="font-medium">{campaign.title}</span>
                                            <span>KES {campaign.raised.toLocaleString()}</span>
                                        </div>
                                        <Progress
                                            value={(campaign.raised / campaign.goal) * 100}
                                            className="h-2"
                                        />
                                    </div>
                                ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}