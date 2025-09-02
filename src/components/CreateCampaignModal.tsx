import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {Label} from "@/components/ui/label";
import {Input} from "@/components/ui/input";
import {Textarea} from "@/components/ui/textarea";
import {Button} from "@/components/ui/button";
import {Calendar as CalendarIcon, FileText, Image as ImageIcon, Plus, Target, Upload} from "lucide-react";
import {Calendar} from "@/components/ui/calendar";
import {Popover, PopoverContent, PopoverTrigger,} from "@/components/ui/popover";

import {format} from "date-fns";
import * as Yup from "yup";
import {Formik} from "formik";
import {cn} from "@/lib/utils";
import {useMutation, useQueryClient} from "@tanstack/react-query";
import type {AxiosError} from "axios";
import API from "@/lib/api";

type CreateCampaignModalProps = {
  isOpen: boolean;
  setIsOpen: (val: boolean) => void;
  onSubmit: (formData: FormData) => void;
};

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const SUPPORTED_FORMATS = ["image/png", "image/jpeg", "image/webp"];

interface CampaignResponse {
  id: string;
  title: string;
  description: string;
  status: "active" | "completed" | "cancelled";
  goal_amount: string;
  current_amount: string;
  start_date: string;
  end_date: string;
  image_url: string | null;
  tenant_id: string;
  created_at: string;
  updated_at: string;
  tenant: {
    id: string;
    name: string;
    website: string | null;
    logo_url: string;
  };
  percent_funded: number;
  days_left: number;
  total_donors: number;
}

interface CampaignFormValues {
  title: string;
  goal_amount: string;
  description: string;
  start_date: string;
  end_date: string;
  image: File | null;
}

const validationSchema = Yup.object({
  title: Yup.string().required("Title is required"),
  goal_amount: Yup.number()
    .typeError("Goal amount must be a number")
    .required("Goal amount is required"),
  description: Yup.string().required("Description is required"),
  start_date: Yup.date()
    .required("Start date is required")
    .typeError("Invalid date"),
  end_date: Yup.date()
    .required("End date is required")
    .min(Yup.ref("start_date"), "End date cannot be before start date")
    .typeError("Invalid date"),
  image: Yup.mixed<File>()
    .required("Image is required")
    .test("fileType", "Unsupported file format", (file) =>
      file ? SUPPORTED_FORMATS.includes(file.type) : false,
    )
    .test("fileSize", "File too large (max 5MB)", (file) =>
      file ? file.size <= MAX_FILE_SIZE : false,
    ),
});

const CreateCampaignModal = ({
  isOpen,
  setIsOpen,
  // onSubmit,
}: CreateCampaignModalProps) => {
  const queryClient = useQueryClient();

  // HANDLE SUBMIT
  const mutation = useMutation<
    CampaignResponse,
    AxiosError,
    CampaignFormValues
  >({
    mutationFn: async (values) => {
      const formData = new FormData();
      formData.append("title", values.title);
      formData.append("description", values.description);
      formData.append("start_date", values.start_date);
      formData.append("end_date", values.end_date);
      formData.append("goal_amount", values.goal_amount.toString());
      if (values.image) {
        formData.append("image", values.image);
      }

      console.log({ formData });
      const res = await API.post("/campaigns/", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return res.data;
    },
  });

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="flex items-center space-x-2 bg-gradient-primary hover:bg-gradient-primary-hover text-white shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105">
          <Plus className="h-4 w-4" />
          <span>Create Campaign</span>
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="text-center pb-6">
          {/*<div className="mx-auto w-16 h-16 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full flex items-center justify-center mb-4">*/}
          {/*  <Target className="h-8 w-8 text-blue-600" />*/}
          {/*</div>*/}
          <DialogTitle className="text-2xl text-center font-bold text-gray-900">
            Create New Campaign
          </DialogTitle>
          <DialogDescription className="text-gray-600 text-base">
            Set up a new fundraising campaign for your organization. Make it compelling to attract more donors.
          </DialogDescription>
        </DialogHeader>

        <Formik
          initialValues={{
            title: "",
            goal_amount: "",
            description: "",
            start_date: "",
            end_date: "",
            image: null as File | null,
          }}
          validationSchema={validationSchema}
          onSubmit={(values,{resetForm}) => mutation.mutate(values, {
            onSuccess: async () => {
              resetForm()
              await queryClient.invalidateQueries({queryKey: ["campaigns"]})
              setIsOpen(false);
            }
          })}
        >
          {({
            values,
            errors,
            touched,
            handleChange,
            handleSubmit,
            setFieldValue,
          }) => (
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Campaign Title & Goal Amount */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <Label htmlFor="title" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                                         <FileText className="h-4 w-4 text-primary" />
                    Campaign Title
                  </Label>
                  <Input
                    id="title"
                    name="title"
                    placeholder="e.g., Clean Water for Rural Communities"
                    value={values.title}
                    onChange={handleChange}
                    disabled={mutation.isPending}
                    className={cn(
                                             "h-12 text-base border-gray-300 focus:border-primary focus:ring-primary transition-colors",
                      errors.title && touched.title && "border-red-500 focus:border-red-500 focus:ring-red-500"
                    )}
                  />
                  {touched.title && errors.title && (
                    <p className="text-sm text-red-500 mt-1 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 bg-red-500 rounded-full"></span>
                      {errors.title}
                    </p>
                  )}
                </div>
                
                <div className="space-y-3">
                  <Label htmlFor="goal_amount" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                                         <Target className="h-4 w-4 text-success" />
                    Funding Goal (KES)
                  </Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 font-medium">KES</span>
                    <Input
                      id="goal_amount"
                      name="goal_amount"
                      type="number"
                      placeholder="500,000"
                      value={values.goal_amount}
                      onChange={handleChange}
                      disabled={mutation.isPending}
                      className={cn(
                                                 "h-12 text-base pl-12 border-gray-300 focus:border-success focus:ring-success transition-colors",
                        errors.goal_amount && touched.goal_amount && "border-red-500 focus:border-red-500 focus:ring-red-500"
                      )}
                    />
                  </div>
                  {touched.goal_amount && errors.goal_amount && (
                    <p className="text-sm text-red-500 mt-1 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 bg-red-500 rounded-full"></span>
                      {errors.goal_amount}
                    </p>
                  )}
                </div>
              </div>

              {/* Description */}
              <div className="space-y-3">
                <Label htmlFor="description" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                                     <FileText className="h-4 w-4 text-info" />
                  Campaign Description
                </Label>
                <Textarea
                  id="description"
                  name="description"
                  placeholder="Describe your campaign goals, the impact it will have, and why people should support it..."
                  rows={5}
                  disabled={mutation.isPending}
                  value={values.description}
                  onChange={handleChange}
                  className={cn(
                                         "text-base border-gray-300 focus:border-info focus:ring-info transition-colors resize-none",
                    errors.description && touched.description && "border-red-500 focus:border-red-500 focus:ring-red-500"
                  )}
                />
                {touched.description && errors.description && (
                  <p className="text-sm text-red-500 mt-1 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 bg-red-500 rounded-full"></span>
                    {errors.description}
                  </p>
                )}
              </div>

              {/* Campaign Dates */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Start Date */}
                <div className="space-y-3">
                  <Label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                                         <CalendarIcon className="h-4 w-4 text-warning" />
                    Start Date
                  </Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                                                     "h-12 w-full justify-start text-left font-normal border-gray-300 hover:border-warning-light focus:border-warning transition-colors",
                          errors.start_date && touched.start_date && "border-red-500",
                                                     !errors.start_date && values.start_date && "border-warning bg-warning-50"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4 text-warning" />
                        {values.start_date
                          ? format(new Date(values.start_date), "PPP")
                          : "Pick a start date"}
                      </Button>
                    </PopoverTrigger>
                                         <PopoverContent className="p-0 bg-white border-warning-200 shadow-xl">
                      <Calendar
                        mode="single"
                        captionLayout="dropdown"
                        selected={
                          values.start_date
                            ? new Date(values.start_date)
                            : undefined
                        }
                        onSelect={(date) =>
                          setFieldValue(
                            "start_date",
                            date ? date.toISOString() : "",
                          )
                        }
                        disabled={(date) => {
                          const today = new Date();
                          today.setHours(0, 0, 0, 0);
                          return date < today;
                        }}
                        className="rounded-md border-0"
                        classNames={{
                                                     day_selected: "bg-warning text-white hover:bg-warning-light",
                           day_today: "border-2 border-warning-light font-semibold",
                          head_cell: "text-gray-600 font-semibold",
                          caption: "text-lg font-semibold text-gray-900",
                        }}
                      />
                    </PopoverContent>
                  </Popover>
                  {errors.start_date && touched.start_date && (
                    <p className="text-sm text-red-500 mt-1 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 bg-red-500 rounded-full"></span>
                      {errors.start_date}
                    </p>
                  )}
                </div>

                {/* End Date */}
                <div className="space-y-3">
                  <Label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                                         <CalendarIcon className="h-4 w-4 text-danger" />
                    End Date
                  </Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                                                     "h-12 w-full justify-start text-left font-normal border-gray-300 hover:border-danger-light focus:border-danger transition-colors",
                          errors.end_date && touched.end_date && "border-red-500",
                                                     !errors.end_date && values.end_date && "border-danger bg-danger-50"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4 text-danger" />
                        {values.end_date
                          ? format(new Date(values.end_date), "PPP")
                          : "Pick an end date"}
                      </Button>
                    </PopoverTrigger>
                                         <PopoverContent className="p-0 bg-white border-danger-200 shadow-xl">
                      <Calendar
                        mode="single"
                        selected={
                          values.end_date
                            ? new Date(values.end_date)
                            : undefined
                        }
                        onSelect={(date) =>
                          setFieldValue(
                            "end_date",
                            date ? date.toISOString() : "",
                          )
                        }
                        disabled={(date) => {
                          const today = new Date();
                          today.setHours(0, 0, 0, 0);

                          const startDate = values.start_date
                            ? new Date(values.start_date)
                            : today;

                          startDate.setHours(0, 0, 0, 0);

                          return date < today || date < startDate;
                        }}
                        className="rounded-md border-0"
                        classNames={{
                                                     day_selected: "bg-danger text-white hover:bg-danger-light",
                           day_today: "border-2 border-danger-light font-semibold",
                          head_cell: "text-gray-600 font-semibold",
                          caption: "text-lg font-semibold text-gray-900",
                        }}
                      />
                    </PopoverContent>
                  </Popover>
                  {errors.end_date && touched.end_date && (
                    <p className="text-sm text-red-500 mt-1 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 bg-red-500 rounded-full"></span>
                      {errors.end_date}
                    </p>
                  )}
                </div>
              </div>

              {/* Campaign Image */}
              <div className="space-y-3">
                <Label htmlFor="image" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                                     <ImageIcon className="h-4 w-4 text-secondary" />
                  Campaign Image
                </Label>
                <div className="relative">
                  <Input
                    id="image"
                    name="image"
                    type="file"
                    accept="image/*"
                    onChange={(e) =>
                      setFieldValue("image", e.currentTarget.files?.[0] || null)
                    }
                    className={cn(
                                             "h-12 text-base border-gray-300 focus:border-secondary focus:ring-secondary transition-colors file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-secondary-50 file:text-secondary hover:file:bg-secondary-light",
                      errors.image && touched.image && "border-red-500 focus:border-red-500 focus:ring-red-500"
                    )}
                  />
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <Upload className="h-5 w-5 text-gray-400" />
                  </div>
                </div>
                <div className="text-xs text-gray-500 flex items-center gap-2">
                  <span>Supported formats: PNG, JPEG, WebP</span>
                  <span>•</span>
                  <span>Max size: 5MB</span>
                </div>
                {touched.image && errors.image && (
                  <p className="text-sm text-red-500 mt-1 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 bg-red-500 rounded-full"></span>
                    {errors.image}
                  </p>
                )}
              </div>

              {/* Error Display */}
              {mutation.error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                    <p className="text-red-700 text-sm font-medium">
                                             {mutation.error?.response?.data && 
                        typeof mutation.error.response.data === 'object' && 
                        'detail' in mutation.error.response.data 
                        ? String(mutation.error.response.data.detail)
                        : 'An error occurred while creating the campaign'}
                    </p>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row justify-end gap-3 pt-6 border-t border-gray-200">
                <Button
                  type="button"
                  variant="outline"
                  className="h-11 px-6 border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400 transition-colors"
                  onClick={() => setIsOpen(false)}
                  disabled={mutation.isPending}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={mutation.isPending}
                                     className="h-11 px-8 bg-gradient-primary hover:bg-gradient-primary-hover text-white shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 disabled:transform-none disabled:opacity-70"
                >
                  {mutation.isPending ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Creating Campaign...
                    </div>
                  ) : (
                    "Create Campaign"
                  )}
                </Button>
              </div>
            </form>
          )}
        </Formik>
      </DialogContent>
    </Dialog>
  );
};

export default CreateCampaignModal;
