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
import {CalendarIcon} from "lucide-react";
import {cn} from "@/lib/utils";
import {Popover, PopoverContent, PopoverTrigger,} from "@/components/ui/popover";
import {useMutation, useQueryClient} from "@tanstack/react-query";
import API from "@/lib/api";
import type {AxiosError} from "axios";
import {toast} from "sonner";
import type {AxiosErrorResponse} from "@/lib/types";

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
}

export function ViewCampaignSheet({
  children,
  campaignId,
}: ViewCampaignSheetProps) {
  const { data: campaign, isLoading } = useGetCampaign(campaignId);
  const [editMode, setEditMode] = useState(false);
  const queryClient = useQueryClient();

  const { mutate, isPending } = useMutation<Campaign, AxiosError, Campaign>({
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

  if (isLoading) return <div>Loading...</div>;
  if (!campaign) return <div>Campaign not found</div>;

  return (
    <Sheet>
      <SheetTrigger asChild>{children}</SheetTrigger>
      <SheetContent className="w-[90vw] sm:max-w-3xl overflow-auto p-4">
        <SheetHeader>
          <div className="flex justify-between items-center mt-8">
            <div>
              <SheetTitle>
                {editMode ? "Edit Campaign" : campaign.title}
              </SheetTitle>
              <SheetDescription>
                {editMode
                  ? "You can edit the campaign fields below"
                  : "Campaign Details"}
              </SheetDescription>
            </div>
            <Button
              // variant="secondary"
              className="px-8 py-3"
              onClick={() => setEditMode((prev) => !prev)}
            >
              {editMode ? "Cancel Edit" : "Edit"}
            </Button>
          </div>
        </SheetHeader>

        <div className="grid gap-6 py-4 px-2">
          {/* Title */}
          <div className="grid gap-2">
            <Label>Title</Label>
            <Input
              value={form.title}
              onChange={(e) => handleChange("title", e.target.value)}
              readOnly={!editMode}
            />
          </div>

          {/* Goal Amount */}
          <div className="grid gap-2">
            <Label>Goal Amount (KES)</Label>
            <Input
              type="number"
              value={form.goal_amount}
              onChange={(e) => handleChange("goal_amount", e.target.value)}
              readOnly={!editMode}
            />
          </div>

          {/* Description */}
          <div className="grid gap-2">
            <Label>Description</Label>
            <Textarea
              rows={4}
              value={form.description}
              onChange={(e) => handleChange("description", e.target.value)}
              readOnly={!editMode}
            />
          </div>

          {/* Status */}
          <div className="grid gap-2">
            <Label>Status</Label>
            {editMode ? (
              <Select
                value={form.status}
                onValueChange={(val) => handleChange("status", val)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            ) : (
              <Input value={form.status} readOnly />
            )}
          </div>

          {/* Start Date */}
          <div className="grid gap-2">
            <Label>Start Date</Label>
            {editMode ? (
              <DatePicker
                value={form.start_date}
                onChange={(val) => handleChange("start_date", val)}
              />
            ) : (
              <Input
                // value={format(new Date(form.start_date), "PPP")}
                value={
                  campaign?.start_date
                    ? new Date(campaign.start_date).toISOString().split("T")[0]
                    : ""
                }
                readOnly
              />
            )}
          </div>

          {/* End Date */}
          <div className="grid gap-2">
            <Label>End Date</Label>
            {editMode ? (
              <DatePicker
                value={form.end_date}
                onChange={(val) => handleChange("end_date", val)}
              />
            ) : (
              <Input
                // value={format(new Date(form.end_date), "PPP")}
                value={
                  campaign?.end_date
                    ? new Date(campaign.end_date).toISOString().split("T")[0]
                    : ""
                }
                readOnly
              />
            )}
          </div>

          {/* Image */}
          <div className="grid gap-2">
            <Label>Campaign Image</Label>
            {editMode ? (
              <>
                {form.image_url && (
                  <img
                    src={
                      typeof form.image_url === "string"
                        ? form.image_url
                        : URL.createObjectURL(form.image_url)
                    }
                    alt="Campaign"
                    className="w-sm max-h-72 object-cover rounded-md"
                  />
                )}
                <Input
                  // value={form.image_url}
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      handleChange("image_url", URL.createObjectURL(file));
                    }
                  }}
                />
              </>
            ) : (
              <img
                src={form.image_url}
                alt="Campaign"
                className="w-sm max-h-72 object-cover rounded-md"
              />
            )}
          </div>

          {/* Read-only fields */}
          <div className="grid gap-2 text-sm text-muted-foreground">
            <p>
              <strong>Funding Progress:</strong> {campaign.percent_funded}%
            </p>
            <p>
              <strong>Days Left:</strong> {campaign.days_left}
            </p>
            <p>
              <strong>Total Donors:</strong> {campaign.total_donors}
            </p>
            <p>
              <strong>Tenant:</strong> {campaign.tenant.name}
            </p>
          </div>
        </div>

        <SheetFooter>
          {editMode ? (
            <Button disabled={isPending} onClick={() => mutate(form)}>
              {`${isPending ? "Updating Campaign" : "Save Changes"}`}
            </Button>
          ) : null}
          <SheetClose asChild>
            <Button variant="outline">Close</Button>
          </SheetClose>
        </SheetFooter>
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
            "w-full justify-start text-left font-normal",
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
