import React, {useState} from "react";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {Label} from "@/components/ui/label";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {Textarea} from "@/components/ui/textarea";
import {useGetCampaign} from "@/hooks/api/useCampaigns";
import {format} from "date-fns";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue,} from "@/components/ui/select";
import {Calendar} from "@/components/ui/calendar";
import {CalendarIcon, Target, Users, DollarSign, Calendar as CalendarIcon2, Building2, Edit, X} from "lucide-react";
import {cn} from "@/lib/utils";
import {Popover, PopoverContent, PopoverTrigger,} from "@/components/ui/popover";
import {useMutation, useQueryClient} from "@tanstack/react-query";
import API from "@/lib/api";
import type {AxiosError} from "axios";
import {toast} from "sonner";
import type {AxiosErrorResponse} from "@/lib/types";
import {Badge} from "@/components/ui/badge";
import {Progress} from "@/components/ui/progress";

type ViewCampaignSheetProps = {
  children: React.ReactNode;
  campaignId?: string;
};

interface Campaign {
  title: string;
  description: string;
  goal_amount: string;
  start_date: string;
  end_date: string;
  image_url: string;
  status: string;
  percent_funded: number;
  days_left: number;
  total_donors: number;
  tenant: {
    name: string;
  };
}

// Payload used when updating a campaign via the form
interface CampaignUpdatePayload {
  title: string;
  description: string;
  goal_amount: string;
  start_date: string;
  end_date: string;
  image_url: string;
  status: string;
}

export function ViewCampaignSheet({
  children,
  campaignId,
}: ViewCampaignSheetProps) {
  const { data: campaign, isLoading } = useGetCampaign(campaignId);
  const [editMode, setEditMode] = useState(false);
  const queryClient = useQueryClient();

  const { mutate, isPending } = useMutation<Campaign, AxiosError, CampaignUpdatePayload>({
    mutationFn: async (data) => {
      const res = await API.put(`/campaigns/${campaignId}`, data);
      return res.data;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["campaigns"],
      });
      await queryClient.invalidateQueries({
        queryKey: ["campaign", campaignId],
      });
      setEditMode(false);
      toast.success("Campaign updated successfully");
    },
    onError: (err) => {
      const axiosError = err as AxiosError<AxiosErrorResponse>;
      toast.error("Error updating campaign", {
        description: axiosError.response?.data?.detail || axiosError.message,
      });
    },
  });

  const [form, setForm] = useState({
    title: "",
    description: "",
    goal_amount: "",
    start_date: "",
    end_date: "",
    image_url: "",
    status: "active",
  });

  React.useEffect(() => {
    if (campaign) {
      setForm({
        title: campaign.title,
        description: campaign.description,
        goal_amount: campaign.goal_amount,
        start_date: campaign.start_date,
        end_date: campaign.end_date,
        image_url: campaign.image_url,
        status: campaign.status,
      });
    }
  }, [campaign]);

  const handleChange = (key: string, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const getStatusColor = (status: string) => {
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
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-16">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          <p className="text-gray-600">Loading campaign details...</p>
        </div>
      </div>
    );
  }
  
  if (!campaign) return <div>Campaign not found</div>;

  return (
    <Sheet>
      <SheetTrigger asChild>{children}</SheetTrigger>
      <SheetContent className="w-[95vw] sm:max-w-4xl overflow-auto p-0">
        <div className="h-full flex flex-col">
          {/* Header */}
          <SheetHeader className="p-6 border-b border-gray-200 bg-white">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <SheetTitle className="text-2xl font-bold text-gray-900">
                {editMode ? "Edit Campaign" : campaign.title}
              </SheetTitle>
                <SheetDescription className="text-gray-600 mt-1">
                {editMode
                    ? "Update campaign information below"
                    : "View and manage campaign details"}
              </SheetDescription>
            </div>
              <div className="flex items-center gap-2">
            <Button
                  variant={editMode ? "outline" : "default"}
                  size="sm"
              onClick={() => setEditMode((prev) => !prev)}
                  className={editMode ? "border-danger text-danger hover:bg-danger-50" : ""}
                >
                  {editMode ? (
                    <>
                      <X className="h-4 w-4 mr-2" />
                      Cancel
                    </>
                  ) : (
                    <>
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </>
                  )}
            </Button>
                <SheetClose asChild>
                  <Button variant="outline" size="sm">Close</Button>
                </SheetClose>
              </div>
          </div>
        </SheetHeader>

          <div className="flex-1 overflow-auto">
            <div className="grid lg:grid-cols-2 gap-0 h-full">
              {/* Left Column - Campaign Image and Stats */}
              <div className="p-6 bg-gray-50">
                {/* Campaign Image */}
                <div className="mb-6">
                  <Label className="text-sm font-medium text-gray-700 mb-2 block">Campaign Image</Label>
                  {campaign.image_url ? (
                    <div className="relative rounded-lg overflow-hidden">
                      <img
                        src={campaign.image_url}
                        alt={campaign.title}
                        className="w-full h-64 object-cover rounded-lg"
                      />
                      <div className="absolute top-3 left-3">
                        <Badge 
                          className={`bg-${getStatusColor(campaign.status)} text-white border-0 shadow-lg`}
                        >
                          {campaign.status.charAt(0).toUpperCase() + campaign.status.slice(1)}
                        </Badge>
                      </div>
                    </div>
                  ) : (
                    <div className="w-full h-64 bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg flex items-center justify-center">
                      <div className="text-center">
                        <Target className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                        <p className="text-sm text-gray-500">No image available</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Campaign Stats */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Campaign Statistics</h3>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white p-4 rounded-lg border border-gray-200">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-success-100 rounded-full flex items-center justify-center">
                          <DollarSign className="h-5 w-5 text-success" />
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Progress</p>
                          <p className="text-lg font-bold text-gray-900">
                            {campaign.percent_funded?.toFixed(1) || "0"}%
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-white p-4 rounded-lg border border-gray-200">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                          <Users className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Donors</p>
                          <p className="text-lg font-bold text-gray-900">
                            {campaign.total_donors || "0"}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-white p-4 rounded-lg border border-gray-200">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-warning-100 rounded-full flex items-center justify-center">
                          <Target className="h-5 w-5 text-warning" />
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Goal</p>
                          <p className="text-lg font-bold text-gray-900">
                            KES {campaign.goal_amount?.toLocaleString() || "0"}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-white p-4 rounded-lg border border-gray-200">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-info-100 rounded-full flex items-center justify-center">
                          <CalendarIcon2 className="h-5 w-5 text-info" />
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Days Left</p>
                          <p className="text-lg font-bold text-gray-900">
                            {campaign.days_left || "0"}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="bg-white p-4 rounded-lg border border-gray-200">
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-gray-700">Funding Progress</span>
                        <span className="text-lg font-bold text-gray-900">
                          {campaign.percent_funded?.toFixed(1) || "0"}%
                        </span>
                      </div>
                      <Progress 
                        value={campaign.percent_funded || 0} 
                        className="h-3 bg-gray-200"
                      />
                    </div>
                  </div>

                  {/* Tenant Info */}
                  <div className="bg-white p-4 rounded-lg border border-gray-200">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-secondary-100 rounded-full flex items-center justify-center">
                        <Building2 className="h-5 w-5 text-secondary" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Organization</p>
                        <p className="font-medium text-gray-900">{campaign.tenant?.name || "Unknown"}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column - Campaign Details Form */}
              <div className="p-6">
                <div className="space-y-6">
          {/* Title */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-700">Campaign Title</Label>
            <Input
              value={form.title}
              onChange={(e) => handleChange("title", e.target.value)}
              readOnly={!editMode}
                      className={editMode ? "border-primary focus:border-primary focus:ring-primary" : "bg-gray-50"}
            />
          </div>

          {/* Goal Amount */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-700">Goal Amount (KES)</Label>
            <Input
              type="number"
              value={form.goal_amount}
              onChange={(e) => handleChange("goal_amount", e.target.value)}
              readOnly={!editMode}
                      className={editMode ? "border-primary focus:border-primary focus:ring-primary" : "bg-gray-50"}
            />
          </div>

          {/* Description */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-700">Description</Label>
            <Textarea
              rows={4}
              value={form.description}
              onChange={(e) => handleChange("description", e.target.value)}
              readOnly={!editMode}
                      className={editMode ? "border-primary focus:border-primary focus:ring-primary" : "bg-gray-50"}
            />
          </div>

          {/* Status */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-700">Status</Label>
            {editMode ? (
              <Select
                value={form.status}
                onValueChange={(val) => handleChange("status", val)}
              >
                        <SelectTrigger className="border-primary focus:border-primary focus:ring-primary">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            ) : (
                      <Input 
                        value={form.status} 
                        readOnly 
                        className="bg-gray-50"
                      />
            )}
          </div>

                  {/* Dates */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-gray-700">Start Date</Label>
            {editMode ? (
              <DatePicker
                value={form.start_date}
                onChange={(val) => handleChange("start_date", val)}
              />
            ) : (
              <Input
                          value={campaign?.start_date ? format(new Date(campaign.start_date), "PPP") : ""}
                readOnly
                          className="bg-gray-50"
              />
            )}
          </div>

                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-gray-700">End Date</Label>
            {editMode ? (
              <DatePicker
                value={form.end_date}
                onChange={(val) => handleChange("end_date", val)}
              />
            ) : (
              <Input
                          value={campaign?.end_date ? format(new Date(campaign.end_date), "PPP") : ""}
                readOnly
                          className="bg-gray-50"
              />
            )}
                    </div>
          </div>

                  {/* Image Upload (Edit Mode) */}
                  {editMode && (
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-gray-700">Update Campaign Image</Label>
                <Input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      handleChange("image_url", URL.createObjectURL(file));
                    }
                  }}
                        className="border-primary focus:border-primary focus:ring-primary"
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <SheetFooter className="p-6 border-t border-gray-200 bg-white">
            {editMode ? (
              <div className="flex gap-3 w-full">
                <Button 
                  disabled={isPending} 
                  onClick={() => mutate(form)}
                  className="flex-1 bg-primary hover:bg-primary-light"
                >
                  {isPending ? "Updating..." : "Save Changes"}
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setEditMode(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            ) : (
              <div className="w-full text-center text-sm text-gray-500">
                Click "Edit" to modify campaign details
              </div>
            )}
          </SheetFooter>
        </div>
      </SheetContent>
    </Sheet>
  );
}

// Reusable Date Picker
function DatePicker({
  value,
  onChange,
}: {
  value: string;
  onChange: (val: string) => void;
}) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "w-full justify-start text-left font-normal border-primary focus:border-primary focus:ring-primary",
            !value && "text-muted-foreground",
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {value ? format(new Date(value), "PPP") : <span>Select date</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={new Date(value)}
          onSelect={(date) => date && onChange(date.toISOString())}
          initialFocus
        />
      </PopoverContent>
    </Popover>
  );
}
