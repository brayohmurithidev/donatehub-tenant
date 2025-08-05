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
import {CalendarIcon, Plus} from "lucide-react";
import {Calendar} from "@/components/ui/calendar";
import {Popover, PopoverContent, PopoverTrigger,} from "@/components/ui/popover";

import {format} from "date-fns";
import {cn} from "@/lib/utils";
import * as Yup from "yup";
import {useFormik} from "formik";
import {useState} from "react";

type CreateCampaignModalProps = {
    isOpen: boolean;
    setIsOpen: (val: boolean) => void;
    onSubmit: (formData: FormData) => void; // handle submit externally
};

const CreateCampaignModal = ({
                                 isOpen,
                                 setIsOpen,
                                 onSubmit,
                             }: CreateCampaignModalProps) => {
    const [startDate, setStartDate] = useState<Date | undefined>();
    const [endDate, setEndDate] = useState<Date | undefined>();

    const formik = useFormik({
        initialValues: {
            title: "",
            goal_amount: "",
            description: "",
            image: null as File | null,
        },
        validationSchema: Yup.object({
            title: Yup.string().required("Title is required"),
            goal_amount: Yup.number()
                .typeError("Must be a number")
                .positive("Must be positive")
                .required("Goal is required"),
            description: Yup.string().required("Description is required"),
            image: Yup.mixed().nullable(),
        }),
        onSubmit: (values) => {
            if (!startDate || !endDate) {
                alert("Please select start and end dates.");
                return;
            }

            const formData = new FormData();
            formData.append("title", values.title);
            formData.append("goal_amount", values.goal_amount);
            formData.append("description", values.description);
            formData.append("start_date", startDate.toISOString());
            formData.append("end_date", endDate.toISOString());
            if (values.image) formData.append("image", values.image);

            onSubmit(formData);
            setIsOpen(false);
        },
    });

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button className="flex items-center space-x-2">
                    <Plus className="h-4 w-4" />
                    <span>Create Campaign</span>
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle>Create New Campaign</DialogTitle>
                    <DialogDescription>
                        Set up a new fundraising campaign for your organization
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={formik.handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <Label htmlFor="title">Campaign Title</Label>
                            <Input
                                id="title"
                                name="title"
                                placeholder="Enter campaign title"
                                value={formik.values.title}
                                onChange={formik.handleChange}
                            />
                            {formik.touched.title && formik.errors.title && (
                                <p className="text-sm text-red-500">{formik.errors.title}</p>
                            )}
                        </div>
                        <div>
                            <Label htmlFor="goal_amount">Funding Goal ($)</Label>
                            <Input
                                id="goal_amount"
                                name="goal_amount"
                                type="number"
                                placeholder="50000"
                                value={formik.values.goal_amount}
                                onChange={formik.handleChange}
                            />
                            {formik.touched.goal_amount && formik.errors.goal_amount && (
                                <p className="text-sm text-red-500">
                                    {formik.errors.goal_amount}
                                </p>
                            )}
                        </div>
                    </div>

                    <div>
                        <Label htmlFor="description">Description</Label>
                        <Textarea
                            id="description"
                            name="description"
                            placeholder="Describe your campaign goals and impact..."
                            rows={4}
                            value={formik.values.description}
                            onChange={formik.handleChange}
                        />
                        {formik.touched.description && formik.errors.description && (
                            <p className="text-sm text-red-500">
                                {formik.errors.description}
                            </p>
                        )}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <Label>Start Date</Label>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant={"outline"}
                                        className={cn(
                                            "w-full justify-start text-left font-normal",
                                            !startDate && "text-muted-foreground"
                                        )}
                                    >
                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                        {startDate ? format(startDate, "PPP") : "Pick a start date"}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0" align="start">
                                    <Calendar
                                        mode="single"
                                        selected={startDate}
                                        onSelect={setStartDate}
                                        initialFocus
                                    />
                                </PopoverContent>
                            </Popover>
                        </div>
                        <div>
                            <Label>End Date</Label>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant={"outline"}
                                        className={cn(
                                            "w-full justify-start text-left font-normal",
                                            !endDate && "text-muted-foreground"
                                        )}
                                    >
                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                        {endDate ? format(endDate, "PPP") : "Pick an end date"}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0" align="start">
                                    <Calendar
                                        mode="single"
                                        selected={endDate}
                                        onSelect={setEndDate}
                                        initialFocus
                                    />
                                </PopoverContent>
                            </Popover>
                        </div>
                    </div>

                    <div>
                        <Label htmlFor="image">Campaign Image</Label>
                        <Input
                            id="image"
                            name="image"
                            type="file"
                            accept="image/*"
                            onChange={(e) =>
                                formik.setFieldValue("image", e.currentTarget.files?.[0] || null)
                            }
                        />
                        {formik.touched.image && formik.errors.image && (
                            <p className="text-sm text-red-500">{formik.errors.image}</p>
                        )}
                    </div>

                    <div className="flex justify-end space-x-2">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setIsOpen(false)}
                        >
                            Cancel
                        </Button>
                        <Button type="submit">Create Campaign</Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
};

export default CreateCampaignModal;