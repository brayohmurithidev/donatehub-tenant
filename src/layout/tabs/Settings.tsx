import {useEffect, useState} from "react";
import {Card, CardContent, CardDescription, CardHeader, CardTitle,} from "@/components/ui/card";
import {Input} from "@/components/ui/input";
import {Label} from "@/components/ui/label";
import {Button} from "@/components/ui/button";
import {Textarea} from "@/components/ui/textarea";
import {Badge} from "@/components/ui/badge";
import {CheckCircle, CreditCard, Eye, XCircleIcon, Building2, Mail, Phone, MapPin, Globe, Save, User, Shield, Settings as SettingsIcon} from "lucide-react";
import {useGetTenant} from "@/hooks/api/useTenant";
import {LoadingSpinner} from "@/components/loadingSpinner";
import {Formik} from "formik";
import type {Tenant} from "@/lib/types";
import MpesaIntegrationSheet from "@/components/MpesaIntegration";
import {useGetMpesaIntegration} from "@/hooks/api/useMpesa";
import {toast} from "sonner";

const SettingsTab = () => {
  const { data: tenant, isLoading } = useGetTenant();
  const { data: mpesa } = useGetMpesaIntegration();
  const [initialData, setInitialData] = useState<Tenant>({
    id: "",
    name: "",
    description: "",
    website: "",
    email: "",
    phone: "",
    location: "",
  });

  useEffect(() => {
    if (tenant) {
      setInitialData({
        id: tenant.id,
        name: tenant.name,
        description: tenant.description,
        website: tenant.website,
        email: tenant.email,
        phone: tenant.phone,
        location: tenant.location,
      });
    }
  }, [tenant]);

  const handleProfileUpdate = async (values: Tenant) => {
    try {
      // TODO: Implement actual API call to update tenant profile
      console.log("Updating profile:", values);
      toast.success("Profile updated successfully!");
    } catch (error) {
      toast.error("Failed to update profile. Please try again.");
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-16">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          <p className="text-gray-600">Loading settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900">Organization Settings</h2>
        <p className="text-gray-600 mt-2">Manage your organization profile and integrations</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Organization Profile */}
        <Card className="border-0 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-primary-50 to-primary-100 border-b border-primary-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
                  <Building2 className="h-5 w-5 text-white" />
                </div>
                <div>
                  <CardTitle className="text-lg text-gray-900">Organization Profile</CardTitle>
                  <CardDescription className="text-gray-700">
                    Update your organization information
                  </CardDescription>
                </div>
              </div>
              {tenant?.is_Verified ? (
                <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-full shadow-sm">
                  <CheckCircle className="h-4 w-4 text-success" />
                  <Badge variant="secondary" className="bg-success text-white border-0">
                    Verified
                  </Badge>
                </div>
              ) : (
                <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-full shadow-sm">
                  <XCircleIcon className="h-4 w-4 text-danger" />
                  <Badge variant="secondary" className="bg-danger text-white border-0">
                    Not Verified
                  </Badge>
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            <Formik
              initialValues={initialData}
              enableReinitialize={true}
              onSubmit={handleProfileUpdate}
            >
              {({
                values: { name, description, website, email, phone, location },
                handleSubmit,
                handleChange,
                isSubmitting,
              }) => (
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Organization Name */}
                  <div className="space-y-2">
                    <Label htmlFor="orgName" className="text-sm font-medium text-gray-700">
                      Organization Name
                    </Label>
                    <div className="relative">
                      <Building2 className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        id="orgName"
                        name="name"
                        value={name}
                        onChange={handleChange}
                        className="pl-10 border-gray-300 focus:border-primary focus:ring-primary"
                        placeholder="Enter organization name"
                      />
                    </div>
                  </div>

                  {/* Location */}
                  <div className="space-y-2">
                    <Label htmlFor="orgLocation" className="text-sm font-medium text-gray-700">
                      Location
                    </Label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        id="orgLocation"
                        name="location"
                        value={location}
                        onChange={handleChange}
                        className="pl-10 border-gray-300 focus:border-primary focus:ring-primary"
                        placeholder="Enter organization location"
                      />
                    </div>
                  </div>

                  {/* Description */}
                  <div className="space-y-2">
                    <Label htmlFor="orgDescription" className="text-sm font-medium text-gray-700">
                      Description
                    </Label>
                    <Textarea
                      id="orgDescription"
                      name="description"
                      value={description}
                      rows={4}
                      onChange={handleChange}
                      className="border-gray-300 focus:border-primary focus:ring-primary resize-none"
                      placeholder="Describe your organization's mission and activities"
                    />
                  </div>

                  {/* Email */}
                  <div className="space-y-2">
                    <Label htmlFor="orgEmail" className="text-sm font-medium text-gray-700">
                      Email Address
                    </Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        id="orgEmail"
                        name="email"
                        type="email"
                        value={email}
                        onChange={handleChange}
                        className="pl-10 border-gray-300 focus:border-primary focus:ring-primary"
                        placeholder="Enter email address"
                      />
                    </div>
                  </div>

                  {/* Phone */}
                  <div className="space-y-2">
                    <Label htmlFor="orgPhone" className="text-sm font-medium text-gray-700">
                      Phone Number
                    </Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        id="orgPhone"
                        name="phone"
                        value={phone}
                        onChange={handleChange}
                        className="pl-10 border-gray-300 focus:border-primary focus:ring-primary"
                        placeholder="Enter phone number"
                      />
                    </div>
                  </div>

                  {/* Website */}
                  <div className="space-y-2">
                    <Label htmlFor="orgWebsite" className="text-sm font-medium text-gray-700">
                      Website
                    </Label>
                    <div className="relative">
                      <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        id="orgWebsite"
                        name="website"
                        value={website || ""}
                        onChange={handleChange}
                        className="pl-10 border-gray-300 focus:border-primary focus:ring-primary"
                        placeholder="Enter website URL (optional)"
                      />
                    </div>
                  </div>

                  {/* Save Button */}
                  <Button 
                    type="submit" 
                    className="w-full bg-primary hover:bg-primary-dark text-white font-medium py-3"
                    disabled={isSubmitting}
                  >
                    <Save className="h-4 w-4 mr-2" />
                    {isSubmitting ? "Saving..." : "Save Changes"}
                  </Button>
                </form>
              )}
            </Formik>
          </CardContent>
        </Card>

        {/* Payment Integration */}
        <Card className="border-0 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-success-50 to-success-100 border-b border-success-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-success rounded-full flex items-center justify-center">
                <CreditCard className="h-5 w-5 text-white" />
              </div>
              <div>
                <CardTitle className="text-lg text-gray-900">Payment Integration</CardTitle>
                <CardDescription className="text-gray-700">
                  Configure your payment methods and accounts
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            {/* Stripe Integration */}
            <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg bg-white hover:bg-gray-50 transition-colors">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                  <CreditCard className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900">Stripe</p>
                  <p className="text-sm text-gray-600">Credit & Debit Cards</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge className="bg-success text-white border-0">Active</Badge>
                <Button size="sm" variant="outline" className="border-gray-300">
                  <SettingsIcon className="h-4 w-4 mr-2" />
                  Configure
                </Button>
              </div>
            </div>

            {/* M-PESA Integration */}
            <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg bg-white hover:bg-gray-50 transition-colors">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center">
                  <img className="h-6 w-6" src="/mpesa.png" alt="M-PESA" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900">M-PESA</p>
                  <p className="text-sm text-gray-600">
                    {mpesa?.is_active ? "Mobile Money Integration" : "Mobile Money Service"}
                  </p>
                </div>
              </div>
              {mpesa?.is_active ? (
                <div className="flex items-center gap-2">
                  <Badge className="bg-success text-white border-0">Active</Badge>
                  {mpesa?.is_verified ? (
                    <Badge className="bg-info text-white border-0">Verified</Badge>
                  ) : (
                    <Badge className="bg-warning text-white border-0">Pending</Badge>
                  )}
                  <MpesaIntegrationSheet mpesa={mpesa}>
                    <Button size="sm" className="bg-primary hover:bg-primary-dark text-white">
                      <Eye className="h-4 w-4 mr-2" />
                      View
                    </Button>
                  </MpesaIntegrationSheet>
                </div>
              ) : (
                <MpesaIntegrationSheet>
                  <Button size="sm" className="bg-primary hover:bg-primary-dark text-white">
                    Connect
                  </Button>
                </MpesaIntegrationSheet>
              )}
            </div>

            {/* Integration Status */}
            <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <div className="flex items-center gap-2 mb-3">
                <Shield className="h-4 w-4 text-info" />
                <h4 className="font-medium text-gray-900">Integration Status</h4>
              </div>
              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex items-center justify-between">
                  <span>Stripe:</span>
                  <Badge className="bg-success text-white border-0 text-xs">Connected</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span>M-PESA:</span>
                  <Badge className={mpesa?.is_active ? "bg-success text-white border-0 text-xs" : "bg-gray-500 text-white border-0 text-xs"}>
                    {mpesa?.is_active ? "Connected" : "Not Connected"}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span>Environment:</span>
                  <Badge className={mpesa?.environment === "sandbox" ? "bg-warning text-white border-0 text-xs" : "bg-success text-white border-0 text-xs"}>
                    {mpesa?.environment === "sandbox" ? "Sandbox" : "Production"}
                  </Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Admin Information */}
      {tenant?.admin && (
        <Card className="border-0 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-info-50 to-info-100 border-b border-info-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-info rounded-full flex items-center justify-center">
                <User className="h-5 w-5 text-white" />
              </div>
              <div>
                <CardTitle className="text-lg text-gray-900">Administrator</CardTitle>
                <CardDescription className="text-gray-700">
                  Primary account holder information
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700">Full Name</Label>
                <p className="text-gray-900 font-medium">{tenant.admin.full_name}</p>
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700">Email</Label>
                <p className="text-gray-900 font-medium">{tenant.admin.email}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default SettingsTab;
