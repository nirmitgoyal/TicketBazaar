import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Shield, Eye, Bell, Mail, Phone } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function PrivacySettings() {
  const { toast } = useToast();
  const [settings, setSettings] = useState({
    showContactInfo: false,
    emailNotifications: true,
    smsNotifications: false,
    profileVisibility: true,
    dataCollection: false,
    marketingEmails: false,
    pushNotifications: true,
    locationSharing: false,
  });

  const handleSettingChange = (setting: keyof typeof settings) => {
    setSettings(prev => ({
      ...prev,
      [setting]: !prev[setting]
    }));
  };

  const handleSaveSettings = () => {
    // In a real app, this would save to the backend
    toast({
      title: "Settings Updated",
      description: "Your privacy settings have been saved successfully.",
    });
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <Shield className="h-8 w-8 text-blue-600" />
        <div>
          <h1 className="text-3xl font-bold">Privacy Settings</h1>
          <p className="text-gray-600 mt-1">Manage your privacy and data preferences</p>
        </div>
      </div>

      <div className="grid gap-6">
        {/* Profile Privacy */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5" />
              Profile Privacy
            </CardTitle>
            <CardDescription>
              Control who can see your profile and contact information
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Show Contact Information</Label>
                <p className="text-sm text-gray-600">
                  Allow other users to see your contact details on listings
                </p>
              </div>
              <Switch
                checked={settings.showContactInfo}
                onCheckedChange={() => handleSettingChange('showContactInfo')}
              />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Profile Visibility</Label>
                <p className="text-sm text-gray-600">
                  Make your profile visible in search results
                </p>
              </div>
              <Switch
                checked={settings.profileVisibility}
                onCheckedChange={() => handleSettingChange('profileVisibility')}
              />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Location Sharing</Label>
                <p className="text-sm text-gray-600">
                  Share your general location to show nearby tickets
                </p>
              </div>
              <Switch
                checked={settings.locationSharing}
                onCheckedChange={() => handleSettingChange('locationSharing')}
              />
            </div>
          </CardContent>
        </Card>

        {/* Communication Preferences */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Communication Preferences
            </CardTitle>
            <CardDescription>
              Choose how you want to receive notifications and updates
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5 flex items-center gap-2">
                <Mail className="h-4 w-4" />
                <div>
                  <Label>Email Notifications</Label>
                  <p className="text-sm text-gray-600">
                    Receive important updates via email
                  </p>
                </div>
              </div>
              <Switch
                checked={settings.emailNotifications}
                onCheckedChange={() => handleSettingChange('emailNotifications')}
              />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div className="space-y-0.5 flex items-center gap-2">
                <Phone className="h-4 w-4" />
                <div>
                  <Label>SMS Notifications</Label>
                  <p className="text-sm text-gray-600">
                    Get notified via text message for urgent updates
                  </p>
                </div>
              </div>
              <Switch
                checked={settings.smsNotifications}
                onCheckedChange={() => handleSettingChange('smsNotifications')}
              />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Push Notifications</Label>
                <p className="text-sm text-gray-600">
                  Receive browser notifications for real-time updates
                </p>
              </div>
              <Switch
                checked={settings.pushNotifications}
                onCheckedChange={() => handleSettingChange('pushNotifications')}
              />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Marketing Emails</Label>
                <p className="text-sm text-gray-600">
                  Receive promotional offers and platform updates
                </p>
              </div>
              <Switch
                checked={settings.marketingEmails}
                onCheckedChange={() => handleSettingChange('marketingEmails')}
              />
            </div>
          </CardContent>
        </Card>

        {/* Data & Analytics */}
        <Card>
          <CardHeader>
            <CardTitle>Data & Analytics</CardTitle>
            <CardDescription>
              Control how your data is used for analytics and improvements
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Analytics Data Collection</Label>
                <p className="text-sm text-gray-600">
                  Help improve the platform by sharing anonymous usage data
                </p>
              </div>
              <Switch
                checked={settings.dataCollection}
                onCheckedChange={() => handleSettingChange('dataCollection')}
              />
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex gap-4 pt-4">
          <Button onClick={handleSaveSettings} className="flex-1">
            Save Privacy Settings
          </Button>
          <Button 
            variant="outline" 
            onClick={() => window.history.back()}
            className="flex-1"
          >
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );
}