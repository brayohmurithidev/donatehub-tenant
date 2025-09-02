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
import type {AxiosError} from "axios";
import type {AxiosErrorResponse} from "@/lib/types";

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

const mpesaIntegrationValidationSchema = Yup.object({
  shortcode: Yup.string()
    .required("Shortcode is required")
    .min(1, "Shortcode must be greater than 0"),
  consumer_secret: Yup.string().required("Consumer secret is required"),
  consumer_key: Yup.string().required("Consumer key is required"),
  callback_url: Yup.string().required("Callback url is required"),
  name: Yup.string().required("Name is required"),
  account_reference: Yup.string().required("Account reference is required"),
  environment: Yup.string().required("Environment is required"),
  passkey: Yup.string().required("Passkey is required"),
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

interface MpesaTestPayload {
  phone: string;
  amount: number;
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

  const mutation = useMutation<MpesaConfig, AxiosError, MpesaConfig>({
    mutationFn: async (data) => {
      const res = await API.put("/mpesa/update-payment", data);
      return res.data;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["mpesa"] });
      setEditMode(false);
      toast.success("Payment method updated successfully", {
        description: "You can now use your new payment method to make payments",
      });
    },
    onError: (err) => {
      console.log("error", err);
      toast.error("Error updating payment method", {
        description: err?.message,
      });
    },
  });

  if (mutation?.error) console.log(mutation.error);

  const testMutation = useMutation<
    MpesaTestPayload,
    AxiosError,
    MpesaTestPayload
  >({
    mutationFn: async (data) => {
      return await API.post("/mpesa/test-integration", data);
    },
    onError: (err) => {
      const axiosError = err as AxiosError<AxiosErrorResponse>;
      toast.error("Error Testing payment method", {
        description: axiosError.response?.data?.detail || axiosError.message,
      });
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["mpesa"] });
      setTestMode(false);
      toast.success("Payment method verified successfully", {
        description: "You can now use your new payment method to make payments",
      });
    },
  });

  return (
    <Sheet>
      <SheetTrigger asChild>{children}</SheetTrigger>
      <SheetContent className="w-[90vw] sm:max-w-2xl overflow-auto px-8 py-4">
        <SheetHeader>
          <div className="flex items-center justify-between mt-8">
            <div>
              <SheetTitle>Mpesa Integration</SheetTitle>
              <SheetDescription>Mpesa payment method</SheetDescription>
            </div>

            {mpesa && (
              <Button
                disabled={testMode}
                onClick={() => setEditMode(!editMode)}
                className={`${editMode ? 'bg-danger hover:bg-danger-dark' : 'bg-primary hover:bg-primary-dark'} text-white`}
              >
                {editMode ? "Cancel Edit" : "Edit Payment Method"}
              </Button>
            )}
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
        {mpesa ? (
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
                  <Button 
                    onClick={() => handleSubmit()}
                    className="w-full bg-primary hover:bg-primary-dark text-white py-3"
                    disabled={mutation.isPending}
                  >
                    {mutation.isPending ? "Updating..." : "Update Payment Method"}
                  </Button>
                ) : !mpesa?.is_verified ? (
                  <Button 
                    disabled={testMode} 
                    onClick={() => setTestMode(true)}
                    className="w-full bg-success hover:bg-success-dark text-white py-3"
                  >
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
                        <div className="grid md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label className="text-sm font-medium text-gray-700">Phone Number</Label>
                            <Input
                              type="text"
                              placeholder="254712345678"
                              value={phone}
                              name="phone"
                              onChange={handleChange}
                              onBlur={handleBlur}
                              disabled={testMutation.isPending}
                              className={`border-gray-300 focus:border-primary focus:ring-primary ${
                                errors.phone && touched.phone ? "border-destructive" : ""
                              }`}
                            />
                            {errors.phone && touched.phone && (
                              <p className="text-destructive text-xs">{errors.phone}</p>
                            )}
                          </div>
                          <div className="space-y-2">
                            <Label className="text-sm font-medium text-gray-700">Test Amount</Label>
                            <Input
                              type="number"
                              placeholder="1"
                              value={amount || ""}
                              name="amount"
                              onChange={handleChange}
                              onBlur={handleBlur}
                              className={`border-gray-300 focus:border-primary focus:ring-primary ${
                                errors.amount && touched.amount ? "border-destructive" : ""
                              }`}
                              disabled={testMutation.isPending}
                            />
                            {errors.amount && touched.amount && (
                              <p className="text-destructive text-xs">{errors.amount}</p>
                            )}
                          </div>
                        </div>
                        <div className="flex gap-3 pt-2">
                          <Button
                            disabled={
                              amount < 1 || phone === "" || testMutation.isPending
                            }
                            variant="secondary"
                            onClick={() => handleSubmit()}
                            className="cursor-pointer bg-success hover:bg-success-dark text-white flex-1"
                          >
                            {testMutation.isPending
                              ? "Sending STK Push..."
                              : "Send STK Push"}
                          </Button>
                          <Button
                            onClick={() => setTestMode(false)}
                            variant="outline"
                            disabled={testMutation.isPending}
                            className="border-gray-300 hover:bg-gray-50"
                          >
                            Cancel Test
                          </Button>
                        </div>
                      </>
                    )}
                  </Formik>
                )}
              </>
            )}
          </Formik>
        ) : (
          //    NO MPESA INTEGRATION CREATE
          <Formik
            initialValues={{
              name: "",
              shortcode: "",
              consumer_secret: "",
              consumer_key: "",
              callback_url: "",
              account_reference: "",
              environment: "sandbox",
              passkey: "",
            }}
            validationSchema={mpesaIntegrationValidationSchema}
            onSubmit={(values) => console.log(values)}
          >
            {({
              values: {
                name,
                consumer_key,
                consumer_secret,
                passkey,
                shortcode,
                callback_url,
                environment,
                account_reference,
              },
              handleChange,
              handleSubmit,
              setFieldValue,
              errors,
              touched,
              handleBlur,
            }) => (
              <>
                <div className="grid gap-2">
                  <Label>Name</Label>
                  <Input
                    type="text"
                    placeholder="Enter organization name"
                    value={name || ""}
                    name="name"
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className={` ${errors.name && touched.name ? "border-destructive" : ""}`}
                  />
                  <p
                    className={`text-sm ${errors.name && touched.name ? "text-red-500" : ""}`}
                  >
                    {errors?.name}
                  </p>
                </div>

                <div className="grid gap-2">
                  <Label>Short Code</Label>
                  <Input
                    type="text"
                    placeholder="Enter test amount"
                    value={shortcode || ""}
                    name="shortcode"
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className={` ${errors.shortcode && touched.shortcode ? "border-destructive" : ""}`}
                    // disabled={testMutation.isPending}
                  />
                  <p
                    className={`text-sm ${errors.shortcode && touched.shortcode ? "text-red-500" : ""}`}
                  >
                    {errors?.shortcode}
                  </p>
                </div>
                <div className="grid gap-2">
                  <Label>Account Reference</Label>
                  <Input
                    type="text"
                    placeholder="Enter test amount"
                    value={account_reference || ""}
                    name="account_reference"
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className={` ${errors.account_reference && touched.account_reference ? "border-destructive" : ""}`}
                    // disabled={testMutation.isPending}
                  />
                  <p
                    className={`text-sm ${errors.account_reference && touched.account_reference ? "text-red-500" : ""}`}
                  >
                    {errors?.account_reference}
                  </p>
                </div>
                <div className="grid gap-2">
                  <Label>Consumer Key</Label>
                  <div className="relative">
                    <Input
                      type={show.consumerKey ? "text" : "password"}
                      value={consumer_key}
                      name="consumer_key"
                      placeholder="********"
                      onChange={handleChange}
                      className={` ${errors.consumer_key && touched.consumer_key ? "border-destructive" : ""}`}
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
                  <p
                    className={`text-sm ${errors.consumer_key && touched.consumer_key ? "text-red-500" : ""}`}
                  >
                    {errors?.consumer_key}
                  </p>
                </div>

                <div className="grid gap-2">
                  <Label>Consumer Secret</Label>
                  <div className="relative">
                    <Input
                      type={show.consumerSecret ? "text" : "password"}
                      value={consumer_secret}
                      name="consumer_secret"
                      placeholder="********"
                      onChange={handleChange}
                      className={` ${errors.consumer_secret && touched.consumer_secret ? "border-destructive" : ""}`}
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
                  <p
                    className={`text-sm ${errors.consumer_secret && touched.consumer_secret ? "text-red-500" : ""}`}
                  >
                    {errors?.consumer_secret}
                  </p>
                </div>

                <div className="grid gap-2">
                  <Label>Passkey</Label>
                  <div className="relative">
                    <Input
                      type={show.passkey ? "text" : "password"}
                      value={passkey}
                      name="passkey"
                      placeholder="********"
                      onChange={handleChange}
                      className={` ${errors.passkey && touched.passkey ? "border-destructive" : ""}`}
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
                  <p
                    className={`text-sm ${errors.passkey && touched.passkey ? "text-red-500" : ""}`}
                  >
                    {errors?.passkey}
                  </p>
                </div>

                <div className="grid gap-2">
                  <Label>Environment</Label>
                  <Select
                    onValueChange={(val) => setFieldValue("environment", val)}
                    name="environment"
                    value={environment}
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
                    className={` ${errors.callback_url && touched.callback_url ? "border-destructive" : ""}`}
                  />
                  <p
                    className={`text-sm ${errors.callback_url && touched.callback_url ? "text-red-500" : ""}`}
                  >
                    {errors?.callback_url}
                  </p>
                </div>
                <Button 
                  onClick={() => handleSubmit()}
                  className="w-full bg-primary hover:bg-primary-dark text-white py-3"
                >
                  Add M-PESA Integration
                </Button>
              </>
            )}
          </Formik>
        )}
      </SheetContent>
    </Sheet>
  );
};

export default MpesaIntegrationSheet;
