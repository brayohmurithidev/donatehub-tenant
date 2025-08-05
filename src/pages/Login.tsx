import {useState} from "react";
import {ErrorMessage, Field, Form, Formik} from "formik";
import * as Yup from "yup";

import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {Input} from "@/components/ui/input";
import {Label} from "@/components/ui/label";
import {Button} from "@/components/ui/button";
import {ArrowLeft, Eye, EyeOff, Heart, Lock, Mail} from "lucide-react";
import {useMutation} from "@tanstack/react-query";
import API from "@/lib/api";
import {useNavigate} from "react-router";
import {useAuth} from "@/context/AuthContext";

const loginSchema = Yup.object().shape({
  email: Yup.string()
    .email("Invalid email address")
    .required("Email is required"),
  password: Yup.string()
    .min(6, "Password must be at least 6 characters")
    .required("Password is required"),
});

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const mutation = useMutation({
    mutationFn: async (formData: FormData) => {
      const res = await API.post("/auth/login", formData);
      return res.data;
    },
    onSuccess: (data) => {
      login(data.access_token, data.user);
      navigate("/");
    },
  });

  // const handleSubmit = async (
  //   values: { email: string; password: string },
  //   { setSubmitting }: { setSubmitting: (isSubmitting: boolean) => void },
  // ) => {
  //   setIsLoading(true);
  //   setTimeout(() => {
  //     console.log("Login attempt:", values);
  //     setIsLoading(false);
  //     setSubmitting(false);
  //   }, 2000);
  // };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card className="shadow-sm border bg-white">
          <CardHeader className="space-y-1">
            <div className="text-center mb-6">
              <div className="inline-flex items-center space-x-2 mb-4">
                <div className="bg-blue-500 p-2 rounded-lg">
                  <Heart className="h-6 w-6 text-white" />
                </div>
                <span className="text-2xl font-bold text-gray-900">
                  DonateKenya
                </span>
              </div>
            </div>
            <CardTitle className="text-2xl font-bold text-center text-gray-900">
              Welcome Back
            </CardTitle>
            <p className="text-center text-gray-600">
              Sign in to your NGO account
            </p>
          </CardHeader>

          <CardContent>
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Sign In
              </h3>
              <p className="text-sm text-gray-600">
                Enter your credentials to access your NGO dashboard.
              </p>
            </div>

            <Formik
              initialValues={{ email: "", password: "" }}
              validationSchema={loginSchema}
              onSubmit={(values: { email: string; password: string }) =>
                {
                  const formData = new FormData();
                  formData.append("username", values.email)
                  formData.append("password", values.password)

                  mutation.mutate(formData)
                }
              }
            >
              {({ errors, touched }) => (
                <Form className="space-y-4">
                  {/* Email */}
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Field
                        as={Input}
                        id="email"
                        name="email"
                        type="email"
                        placeholder="your-ngo@email.com"
                        className={`pl-10 ${errors.email && touched.email ? "border-destructive" : ""}`}
                      />
                    </div>
                    <ErrorMessage
                      name="email"
                      component="div"
                      className="text-sm text-destructive"
                    />
                  </div>

                  {/* Password */}
                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Field
                        as={Input}
                        id="password"
                        name="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Enter your password"
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

                  {/* Remember Me / Forgot */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="remember"
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <Label
                        htmlFor="remember"
                        className="text-sm text-gray-600"
                      >
                        Remember me
                      </Label>
                    </div>
                    <a
                      href="/forgot-password"
                      className="text-sm text-blue-600 hover:underline"
                    >
                      Forgot password?
                    </a>
                  </div>

                  {/* Submit */}
                  <Button
                    type="submit"
                    className="w-full cursor-pointer"
                    disabled={mutation.isPending}
                  >
                    {mutation.isPending ? "Signing in..." : "Sign In"}
                  </Button>

                  {/* Register */}
                  <div className="text-center text-sm text-gray-600">
                    Don&apos;t have an account?{" "}
                    <a
                      href="/register"
                      className="text-blue-600 hover:underline"
                    >
                      Register your NGO
                    </a>
                  </div>

                  {/* Demo info */}
                  <div className="bg-gray-100 rounded-lg p-4 text-sm text-gray-600">
                    <strong>Demo credentials:</strong> Use any email and
                    password to sign in and explore the dashboard.
                  </div>
                </Form>
              )}
            </Formik>
          </CardContent>
        </Card>

        {/* Back to Home */}
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

export default Login;
