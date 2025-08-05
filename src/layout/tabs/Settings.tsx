import {useEffect, useState} from "react";
import {Card, CardContent, CardDescription, CardHeader, CardTitle,} from "@/components/ui/card";
import {Input} from "@/components/ui/input";
import {Label} from "@/components/ui/label";
import {Button} from "@/components/ui/button";
import {Textarea} from "@/components/ui/textarea";
import {Badge} from "@/components/ui/badge";
import {CheckCircle, CreditCard, Eye, Settings, XCircleIcon,} from "lucide-react";
import {useGetTenant} from "@/hooks/api/useTenant";
import {LoadingSpinner} from "@/components/loadingSpinner";
import {Formik} from "formik";
import type {Tenant} from "@/lib/types";
import MpesaIntegrationSheet from "@/components/MpesaIntegration";
import {useGetMpesaIntegration} from "@/hooks/api/useMpesa";

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

  if (isLoading) return <LoadingSpinner />;

  return (
    <div className="grid lg:grid-cols-2 gap-6">
      {/* Org Profile */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Organization Profile</CardTitle>
            {tenant?.is_Verified ? (
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <p className="text-sm font-semibold text-green-600">Verified</p>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <XCircleIcon className="h-5 w-5 text-red-600" />
                <p className="text-sm font-semibold text-red-600">
                  Not Verified
                </p>
              </div>
            )}
          </div>

          <CardDescription>
            Update your organization information
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Formik
            initialValues={initialData}
            enableReinitialize={true}
            onSubmit={(values) => console.log(values)}
          >
            {({
              values: { name, description, website, email, phone, location },
              handleSubmit,
              handleChange,
            }) => (
              <>
                <div>
                  <Label htmlFor="orgName">Organization Name</Label>
                  <Input
                    id="orgName"
                    name="name"
                    defaultValue="Hope Foundation"
                    value={name}
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <Label htmlFor="orgLocation">Organization Name</Label>
                  <Input
                    id="orgLocation"
                    name="location"
                    defaultValue="Hope Foundation"
                    value={location}
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <Label htmlFor="orgDescription">Description</Label>
                  <Textarea
                    id="orgDescription"
                    name="description"
                    value={description}
                    defaultValue="Providing education and healthcare to underserved communities"
                    rows={3}
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <Label htmlFor="orgName">Email</Label>
                  <Input
                    id="orgEmail"
                    name="email"
                    defaultValue="info@example.org"
                    value={email}
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <Label htmlFor="orgPhone">Phone Number</Label>
                  <Input
                    id="orgPhone"
                    name="phone"
                    defaultValue="+254712345678"
                    value={phone}
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <Label htmlFor="orgWebsite">Website</Label>
                  <Input
                    id="orgWebsite"
                    name="website"
                    value={website}
                    onChange={handleChange}
                    defaultValue="https://hopefoundation.org"
                  />
                </div>
                <Button onClick={() => handleSubmit}>Save Changes</Button>
              </>
            )}
          </Formik>
        </CardContent>
      </Card>

      {/* Payment Integration */}
      <Card>
        <CardHeader>
          <CardTitle>Payment Integration</CardTitle>
          <CardDescription>
            Configure your payment methods and accounts
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-3 border rounded-lg">
            <div className="flex items-center space-x-3">
              <CreditCard className="h-5 w-5 text-gray-600" />
              <div>
                <p className="font-medium">Stripe</p>
                <p className="text-sm text-gray-600">Connected</p>
              </div>
            </div>
            <Badge variant="secondary">Active</Badge>
          </div>

          <div className="flex items-center justify-between p-3 border rounded-lg">
            <div className="flex items-center space-x-3">
              {/*<div className="h-5 w-5 bg-green-600 rounded"></div>*/}
              <img className="h-5 w-5" src="/mpesa.png" alt="mpesa" />
              <div>
                <p className="font-medium">M-PESA</p>
                <p className="text-sm text-gray-600">
                  {mpesa?.is_active ? "Connected" : "Not Connected"}
                </p>
              </div>
            </div>
            {mpesa?.is_active ? (
              <div className="flex items-center space-x-2">
                <Badge variant="secondary">Active</Badge>
                {mpesa?.is_verified ? (
                  <Badge variant="secondary">Tested</Badge>
                ) : (
                  <Badge variant="destructive">Not Tested</Badge>
                )}
                <MpesaIntegrationSheet mpesa={mpesa}>
                  <Button size="sm">
                    <Eye className="h-4 w-4" />
                    View
                  </Button>
                </MpesaIntegrationSheet>
              </div>
            ) : (
              <MpesaIntegrationSheet>
                <Button size="sm" variant="outline">
                  Connect
                </Button>
              </MpesaIntegrationSheet>
            )}
          </div>

          <Button className="w-full">
            <Settings className="h-4 w-4 mr-2" />
            Configure Payment Settings
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default SettingsTab;
