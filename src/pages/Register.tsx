import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {Input} from "@/components/ui/input";
import {Textarea} from "@/components/ui/textarea";
import {ErrorMessage, Field, Formik} from "formik";
import {ArrowLeft, Building, Eye, EyeOff, Globe, Heart, Lock, Mail, MapPin, Phone, Upload, User,} from "lucide-react";
import {useState} from "react";
import {Label} from "@/components/ui/label";
import * as Yup from "yup";
import {Button} from "@/components/ui/button";
import {useMutation} from "@tanstack/react-query";
import API from "@/lib/api";
import {toast} from "sonner";

interface RegisterProps {
  name: string;
  full_name: string;
  email: string;
  phone: string;
  location: string;
  website: string;
  description: string;
  password: string;
  confirmPassword: string;
  agreeToTerms: boolean;
}

const registerSchema = Yup.object().shape({
  name: Yup.string()
    .min(2, "NGO name must be at least 2 characters")
    .required("NGO name is required"),
  full_name: Yup.string()
    .min(2, "Contact person name must be at least 2 characters")
    .required("Contact person is required"),
  email: Yup.string()
    .email("Invalid email address")
    .required("Email is required"),
  phone: Yup.string()
    .matches(/^(\+254|0)[17]\d{8}$/, "Please enter a valid Kenyan phone number")
    .required("Phone number is required"),
  location: Yup.string().required("Location is required"),
  website: Yup.string().url("Please enter a valid URL"),
  description: Yup.string()
    .min(50, "Description must be at least 50 characters")
    .required("Description is required"),
  password: Yup.string()
    .min(8, "Password must be at least 8 characters")
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      "Password must contain at least one uppercase letter, one lowercase letter, and one number",
    )
    .required("Password is required"),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref("password")], "Passwords must match")
    .required("Please confirm your password"),
  agreeToTerms: Yup.boolean()
    .oneOf([true], "You must agree to the terms and conditions")
    .required("You must agree to the terms and conditions"),
});

const Register = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const mutation = useMutation({
    mutationFn: async (data) => {
      const res = await API.post("/tenants", data);
      return res.data;
    },
  });

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <Card className="shadow-sm border border-gray-200 bg-white">
          <CardHeader className="space-y-1">
            {/* Logo */}
            <div className="text-center mb-6">
              <div className="inline-flex items-center space-x-2 mb-4">
                <div className="bg-green-500 p-2 rounded-lg">
                  <Heart className="h-6 w-6 text-white" />
                </div>
                <span className="text-2xl font-bold text-gray-900">
                  DonateKenya
                </span>
              </div>
            </div>
            <CardTitle className="text-2xl font-bold text-center text-gray-900">
              Join Our Platform
            </CardTitle>
            <p className="text-center text-gray-600">
              Register your NGO to start receiving donations
            </p>
          </CardHeader>
          <CardContent>
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                NGO Registration
              </h3>
              <p className="text-sm text-gray-600">
                Fill out the form below to register your organization
              </p>
            </div>

            <Formik
              initialValues={{
                name: "",
                full_name: "",
                email: "",
                phone: "",
                location: "",
                website: "",
                description: "",
                password: "",
                confirmPassword: "",
                agreeToTerms: false,
              }}
              validationSchema={registerSchema}
              enableReinitialize={true}
              onSubmit={(values, { resetForm }) => {
                const { full_name, email, password, confirmPassword, ...rest } =
                  values;
                const admin = {
                  full_name,
                  email,
                  password,
                };
                const createData = {
                  ...rest,
                  email,
                  admin,
                };
                mutation.mutate(createData, {
                  onSuccess: () => {
                    resetForm();
                    toast.success("NGO registration successful", {
                      description:
                        "We will review your NGO and get back to you shortly",
                    });
                  },
                  onError: (error) => {
                    console.log(error);
                    toast.error("NGO registration failed", {
                      description: error?.response?.data?.detail,
                    });
                  },
                });
              }}
            >
              {({
                errors,
                touched,
                values,
                setFieldValue,
                handleChange,
                handleSubmit,
                handleBlur,
              }) => (
                <div className="space-y-6">
                  {/* Organization Information */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900">
                      Organization Information
                    </h3>

                    <div className="space-y-2">
                      <Label htmlFor="ngoName">NGO Name *</Label>
                      <div className="relative">
                        <Building className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input
                          id="name"
                          name="name"
                          value={values.name}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          placeholder="Your NGO's official name"
                          className={`pl-10 ${errors.name && touched.name ? "border-destructive" : ""}`}
                        />
                      </div>
                      <ErrorMessage
                        name="name"
                        component="div"
                        className="text-sm text-destructive"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="logo">Organization Logo</Label>
                      <div className="relative">
                        <Upload className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Field
                          as={Input}
                          id="logo"
                          name="logo"
                          type="file"
                          accept="image/*"
                          className="pl-10"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="description">
                        Organization Description *
                      </Label>
                      <Textarea
                        id="description"
                        name="description"
                        value={values.description}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        placeholder="Describe your organization's mission, vision, and activities..."
                        rows={4}
                        className={
                          errors.description && touched.description
                            ? "border-destructive"
                            : ""
                        }
                      />
                      <ErrorMessage
                        name="description"
                        component="div"
                        className="text-sm text-destructive"
                      />
                    </div>
                  </div>

                  {/* Contact Information */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900">
                      Contact Information
                    </h3>

                    <div className="space-y-2">
                      <Label htmlFor="contactPerson">Contact Person *</Label>
                      <div className="relative">
                        <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input
                          id="full_name"
                          name="full_name"
                          value={values.full_name}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          placeholder="Full name"
                          className={`pl-10 ${errors.full_name && touched.full_name ? "border-destructive" : ""}`}
                        />
                      </div>
                      <ErrorMessage
                        name="full_name"
                        component="div"
                        className="text-sm text-destructive"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="email">Email Address *</Label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                          <Input
                            id="email"
                            name="email"
                            type="email"
                            value={values.email}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            placeholder="contact@yourngo.org"
                            className={`pl-10 ${errors.email && touched.email ? "border-destructive" : ""}`}
                          />
                        </div>
                        <ErrorMessage
                          name="email"
                          component="div"
                          className="text-sm text-destructive"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="phone">Phone Number *</Label>
                        <div className="relative">
                          <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                          <Input
                            id="phone"
                            name="phone"
                            value={values.phone}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            placeholder="+254 700 000000"
                            className={`pl-10 ${errors.phone && touched.phone ? "border-destructive" : ""}`}
                          />
                        </div>
                        <ErrorMessage
                          name="phone"
                          component="div"
                          className="text-sm text-destructive"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="location">Location *</Label>
                        <div className="relative">
                          <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                          <Input
                            id="location"
                            name="location"
                            value={values.location}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            placeholder="City, County"
                            className={`pl-10 ${errors.location && touched.location ? "border-destructive" : ""}`}
                          />
                        </div>
                        <ErrorMessage
                          name="location"
                          component="div"
                          className="text-sm text-destructive"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="website">Website URL</Label>
                        <div className="relative">
                          <Globe className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                          <Input
                            id="website"
                            name="website"
                            value={values.website}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            placeholder="https://www.yourngo.org"
                            className={
                              errors.website && touched.website
                                ? "border-destructive"
                                : ""
                            }
                          />
                        </div>
                        <ErrorMessage
                          name="website"
                          component="div"
                          className="text-sm text-destructive"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Account Security */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900">
                      Account Security
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="password">Password *</Label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                          <Input
                            id="password"
                            name="password"
                            value={values.password}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            type={showPassword ? "text" : "password"}
                            placeholder="Create a strong password"
                            className={`pl-10 pr-10 ${errors.password && touched.password ? "border-destructive" : ""}`}
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                          >
                            {showPassword ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                          </button>
                        </div>
                        <ErrorMessage
                          name="password"
                          component="div"
                          className="text-sm text-destructive"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="confirmPassword">
                          Confirm Password *
                        </Label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                          <Input
                            id="confirmPassword"
                            name="confirmPassword"
                            value={values.confirmPassword}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            type={showConfirmPassword ? "text" : "password"}
                            placeholder="Confirm your password"
                            className={`pl-10 pr-10 ${errors.confirmPassword && touched.confirmPassword ? "border-destructive" : ""}`}
                          />
                          <button
                            type="button"
                            onClick={() =>
                              setShowConfirmPassword(!showConfirmPassword)
                            }
                            className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                          >
                            {showConfirmPassword ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                          </button>
                        </div>
                        <ErrorMessage
                          name="confirmPassword"
                          component="div"
                          className="text-sm text-destructive"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Terms and Conditions */}
                  <div className="space-y-4">
                    <div className="flex items-start space-x-2">
                      <input
                        type="checkbox"
                        id="agreeToTerms"
                        name="agreeToTerms"
                        checked={values.agreeToTerms}
                        onChange={(e) =>
                          setFieldValue("agreeToTerms", e.target.checked)
                        }
                        className="mt-1 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <Label
                        htmlFor="agreeToTerms"
                        className="text-sm text-gray-600"
                      >
                        I agree to the{" "}
                        <a
                          href="/terms"
                          className="text-blue-600 hover:underline"
                        >
                          Terms and Conditions
                        </a>{" "}
                        and{" "}
                        <a
                          href="/privacy"
                          className="text-blue-600 hover:underline"
                        >
                          Privacy Policy
                        </a>
                      </Label>
                    </div>
                    <ErrorMessage
                      name="agreeToTerms"
                      component="div"
                      className="text-sm text-destructive"
                    />
                  </div>

                  <Button
                    type="button"
                    onClick={() => handleSubmit()}
                    className="w-full bg-gradient-to-r from-blue-500 to-green-500 hover:from-blue-600 hover:to-green-600 text-white cursor-pointer"
                    disabled={mutation.isPending}
                  >
                    {mutation.isPending
                      ? "Creating account..."
                      : "Create NGO Account"}
                  </Button>

                  <div className="text-center text-sm text-gray-600">
                    Already have an account?{" "}
                    <a href="/login" className="text-blue-600 hover:underline">
                      Sign in here
                    </a>
                  </div>

                  <div className="bg-green-100 border border-green-200 rounded-lg p-4 text-sm text-green-800">
                    After registration, our team will verify your NGO within
                    24-48 hours. You&apos;ll receive an email confirmation once
                    approved.
                  </div>
                </div>
              )}
            </Formik>
          </CardContent>
        </Card>

        {/* Back to Home Link */}
        <div className="text-center mt-6">
          <a
            href="/"
            className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="mr-1 h-4 w-4" />
            Back to Home
          </a>
        </div>
      </div>
    </div>
  );
};

export default Register;
