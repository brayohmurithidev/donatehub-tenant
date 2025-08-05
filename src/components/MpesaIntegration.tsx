import {Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger,} from "@/components/ui/sheet";
import React, {useEffect, useState} from "react";
import {Input} from "@/components/ui/input";
import {Label} from "@/components/ui/label";
import {Formik} from "formik";
import {Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue,} from "@/components/ui/select";
import {Button} from "@/components/ui/button";
import {CheckCircle, Eye, EyeOff} from "lucide-react";
import {useMutation, useQueryClient} from "@tanstack/react-query";
import API from "@/lib/api";
import {toast} from "sonner";
import * as Yup from "yup";
import {Alert, AlertTitle} from "@/components/ui/alert";

const testValidationSchema = Yup.object({
  phone: Yup.string()
    .required("Phone number is required")
    .matches(
      /^254\d{9}$/,
      "Phone number must start with country code and be 12 digits (e.g., 254712345678)",
    ),
  amount: Yup.number()
    .required("Amount is required")
    .min(1, "Amount must be greater than 0"),
});

interface MpesaConfig {
  id?: string;
  shortcode: string;
  consumer_secret: string;
  callback_url: string;
  account_reference: string;
  is_active?: boolean;
  name: string;
  consumer_key: string;
  passkey: string;
  environment: string;
  is_verified?: boolean;
}

type MpesaIntegrationProps = {
  children: React.ReactNode;
  mpesa?: MpesaConfig;
};

const MpesaIntegrationSheet = ({ children, mpesa }: MpesaIntegrationProps) => {
  const queryClient = useQueryClient();
  const [editMode, setEditMode] = useState(false);
  const [testMode, setTestMode] = useState(false);
  const [show, setShow] = useState({
    consumerKey: false,
    consumerSecret: false,
    passkey: false,
  });
  const [initialData, setInitialData] = useState<MpesaConfig>({
    shortcode: "",
    consumer_secret: "",
    callback_url: "",
    account_reference: "",
    name: "",
    consumer_key: "",
    passkey: "",
    environment: "",
  });

  useEffect(() => {
    if (mpesa) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { consumer_secret, consumer_key, passkey, ...rest } = mpesa;
      setInitialData({
        ...rest,
        consumer_secret: "",
        consumer_key: "",
        passkey: "",
      });
    }
  }, [mpesa]);

  const mutation = useMutation({
    mutationFn: async (data) => {
      const res = await API.put("/mpesa/update-payment", data);
      return res.data;
    },
    onSuccess: async (data) => {
      await queryClient.invalidateQueries({ queryKey: ["mpesa"] });
      console.log(data.response)
      setEditMode(false);
      toast.success("Payment method updated successfully", {
        description: "You can now use your new payment method to make payments",
      });
    },
    onError: (err) => {
      console.log("error", err)
      toast.error("Error updating payment method", {
        description: err?.message,
      });
    },
  });

  if(mutation?.error) console.log(mutation.error)

  const testMutation = useMutation({
    mutationFn: async (data) => {
      const res = await API.post("/mpesa/test-integration", data);
      return res.data;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["mpesa"] });
      setTestMode(false);
      toast.success("Payment method verified successfully", {
        description: "You can now use your new payment method to make payments",
      });
    },
    onError: (err) => {
      toast.error("Error Testing payment method", {
        description: err.response?.data?.detail,
      });
    },
  });

  return (
    <Sheet>
      <SheetTrigger asChild>{children}</SheetTrigger>
      <SheetContent className="w-[90vw] sm:max-w-2xl overflow-auto px-8">
        <SheetHeader>
          <div className="flex items-center justify-between mt-8">
            <div>
              <SheetTitle>Mpesa Integration</SheetTitle>
              <SheetDescription>Add payment method</SheetDescription>
            </div>

            <Button disabled={testMode} onClick={() => setEditMode(!editMode)}>
              {editMode ? "Cancel Edit" : "Edit Payment Method"}
            </Button>
          </div>
          {mpesa?.is_verified && (
            <Alert className="items-center">
              <CheckCircle size={68} />
              <AlertTitle className="text-green-600 text-lg">
                Method: Verified
              </AlertTitle>
            </Alert>
          )}
        </SheetHeader>
        {mpesa && (
          <Formik
            enableReinitialize={true}
            onSubmit={(values: MpesaConfig) => mutation.mutate(values)}
            initialValues={initialData}
          >
            {({
              values: {
                shortcode,
                consumer_secret,
                consumer_key,
                callback_url,
                account_reference,
                name,
                passkey,
                environment,
              },
              handleSubmit,
              handleChange,
              setFieldValue,
            }) => (
              <>
                <div className="grid gap-2">
                  <Label>ShortCode</Label>
                  <Input
                    type="number"
                    value={shortcode}
                    name="shortcode"
                    onChange={handleChange}
                    disabled={!editMode}
                  />
                </div>
                <div className="grid gap-2">
                  <Label>Name</Label>
                  <Input
                    type="text"
                    value={name}
                    name="name"
                    onChange={handleChange}
                    disabled={!editMode}
                  />
                </div>
                <div className="grid gap-2">
                  <Label>Account Reference</Label>
                  <Input
                    type="text"
                    value={account_reference}
                    name="account_reference"
                    onChange={handleChange}
                    disabled={!editMode}
                  />
                </div>

                <div className="grid gap-2">
                  <Label>Consumer Key</Label>
                  <div className="relative">
                    <Input
                      type={show.consumerKey ? "text" : "password"}
                      value={consumer_key}
                      name="consumer_key"
                      onChange={handleChange}
                      disabled={!editMode}
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setShow({ ...show, consumerKey: !show.consumerKey })
                      }
                      className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                    >
                      {show.consumerKey ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>

                <div className="grid gap-2">
                  <Label>Consumer Secret</Label>
                  <div className="relative">
                    <Input
                      type={show.consumerSecret ? "text" : "password"}
                      value={consumer_secret}
                      name="consumer_secret"
                      onChange={handleChange}
                      disabled={!editMode}
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setShow({
                          ...show,
                          consumerSecret: !show.consumerSecret,
                        })
                      }
                      className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                    >
                      {show.consumerSecret ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>

                <div className="grid gap-2">
                  <Label>Passkey</Label>
                  <div className="relative">
                    <Input
                      type={show.passkey ? "text" : "password"}
                      value={passkey}
                      name="passkey"
                      onChange={handleChange}
                      disabled={!editMode}
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setShow({ ...show, passkey: !show.passkey })
                      }
                      className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                    >
                      {show.passkey ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>

                <div className="grid gap-2">
                  <Label>Environment</Label>
                  <Select
                    onValueChange={(val) => setFieldValue("environment", val)}
                    name="environment"
                    value={environment}
                    disabled={!editMode}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select Environment" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectItem value="sandbox">Sandbox</SelectItem>
                        <SelectItem value="production">Production</SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label>Callback URL</Label>
                  <Input
                    type="text"
                    value={callback_url}
                    name="callback_url"
                    onChange={handleChange}
                    disabled={!editMode}
                  />
                </div>

                {editMode ? (
                  <Button onClick={() => handleSubmit()}>
                    Update Payment Method
                  </Button>
                ) : !mpesa?.is_verified ? (
                  <Button disabled={testMode} onClick={() => setTestMode(true)}>
                    Test Payment Integration
                  </Button>
                ) : null}

                {testMode && (
                  <Formik
                    initialValues={{ phone: "", amount: 1 }}
                    onSubmit={(values: { phone: string; amount: number }) =>
                      testMutation.mutate(values)
                    }
                    validationSchema={testValidationSchema}
                  >
                    {({
                      values: { phone, amount },
                      handleChange,
                      handleSubmit,
                      errors,
                      touched,
                      handleBlur,
                    }) => (
                      <>
                        <div className="grid gap-2">
                          <Label>Phone Number</Label>
                          <Input
                            type="text"
                            placeholder="Enter phone: e.g 254712345478"
                            value={phone}
                            name="phone"
                            onChange={handleChange}
                            onBlur={handleBlur}
                            disabled={testMutation.isPending}
                            className={` ${errors.phone && touched.phone ? "border-destructive" : ""}`}
                          />
                          <p
                            className={` text-sm ${errors.phone && touched.phone ? "text-red-500" : ""}`}
                          >
                            {errors?.phone}
                          </p>
                        </div>
                        <div className="grid gap-2">
                          <Label>Amount</Label>
                          <Input
                            type="number"
                            placeholder="Enter test amount"
                            value={amount || ""}
                            name="amount"
                            onChange={handleChange}
                            onBlur={handleBlur}
                            className={` ${errors.amount && touched.amount ? "border-destructive" : ""}`}
                            disabled={testMutation.isPending}
                          />
                          <p
                            className={`text-sm ${errors.amount && touched.amount ? "text-red-500" : ""}`}
                          >
                            {errors?.amount}
                          </p>
                        </div>
                        <Button
                          disabled={
                            amount < 1 || phone === "" || testMutation.isPending
                          }
                          variant="secondary"
                          onClick={() => handleSubmit()}
                          className="cursor-pointer"
                        >
                          {testMutation.isPending
                            ? "Sending STK Push"
                            : "Send STK Push"}
                        </Button>
                        <Button
                          onClick={() => setTestMode(false)}
                          variant="outline"
                          disabled={testMutation.isPending}
                        >
                          Close Test
                        </Button>
                      </>
                    )}
                  </Formik>
                )}
              </>
            )}
          </Formik>
        )}
      </SheetContent>
    </Sheet>
  );
};

export default MpesaIntegrationSheet;
