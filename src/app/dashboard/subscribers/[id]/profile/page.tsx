// app/dashboard/subscribers/[id]/profile/page.tsx
'use client';

import { useParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { 
  ArrowLeft, 
  Save, 
  Mail, 
  Phone, 
  Building, 
  MapPin,
  User,
  Shield,
  Bell
} from 'lucide-react';
import Link from 'next/link';
import { 
  useSubscriberProfile, 
  useUpdateSubscriberProfile, 
  useUpdateKycStatus 
} from '@/hooks/useSubscriberProfile';
import { useState, useEffect } from 'react';

export default function ProfileManagementPage() {
  const params = useParams();
  const id = params.id as string;
  
  const { data: profile, isLoading } = useSubscriberProfile(id);
  const updateProfile = useUpdateSubscriberProfile();
  const updateKyc = useUpdateKycStatus();

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    company: '',
    address: {
      street: '',
      city: '',
      state: '',
      country: '',
      zipCode: ''
    },
    preferences: {
      emailNotifications: true,
      smsNotifications: false,
      language: 'en'
    }
  });

  // Update form data when profile loads
  useEffect(() => {
    if (profile) {
      setFormData({
        firstName: profile.firstName || '',
        lastName: profile.lastName || '',
        phone: profile.phone || '',
        company: profile.company || '',
        address: profile.address || {
          street: '',
          city: '',
          state: '',
          country: '',
          zipCode: ''
        },
        preferences: profile.preferences || {
          emailNotifications: true,
          smsNotifications: false,
          language: 'en'
        }
      });
    }
  }, [profile]);

  if (isLoading && !profile) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 rounded-full bg-muted animate-pulse" />
          <div className="space-y-2">
            <div className="h-6 w-48 bg-muted rounded animate-pulse" />
            <div className="h-4 w-32 bg-muted rounded animate-pulse" />
          </div>
        </div>
        <div className="grid gap-6">
          {Array.from({ length: 3 }).map((_, index) => (
            <Card key={index}>
              <CardHeader>
                <div className="h-5 w-32 bg-muted rounded animate-pulse" />
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="space-y-2">
                      <div className="h-4 w-24 bg-muted rounded animate-pulse" />
                      <div className="h-10 w-full bg-muted rounded animate-pulse" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  const handleSave = async () => {
    try {
      await updateProfile.mutateAsync({
        subscriberId: id,
        data: formData
      });
      toast.success("Profile information has been successfully updated.");
    } catch (error) {
      console.error('Failed to update profile:', error);
      toast.error("Failed to update profile. Please try again.");
    }
  };

  const handleKycUpdate = async (status: 'verified' | 'rejected' | 'pending') => {
    try {
      await updateKyc.mutateAsync({
        subscriberId: id,
        data: { status }
      });
      toast.success(`KYC status has been updated to ${status}.`);
    } catch (error) {
      console.error('Failed to update KYC status:', error);
      toast.error("Failed to update KYC status. Please try again.");
    }
  };

  const getKycBadge = (kycStatus: string) => {
    const variants = {
      verified: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
      pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
      rejected: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
      not_started: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300',
    };
    return variants[kycStatus as keyof typeof variants] || variants.not_started;
  };

  const getKycStatusText = (status: string) => {
    const labels = {
      verified: 'Verified',
      pending: 'Pending Review',
      rejected: 'Rejected',
      not_started: 'Not Started'
    };
    return labels[status as keyof typeof labels] || 'Not Started';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href={`/dashboard/subscribers/${id}`}>
            <Button variant="outline" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold">Profile Management</h1>
            <p className="text-muted-foreground">
              Manage {profile?.firstName} {profile?.lastName}'s profile information
            </p>
          </div>
        </div>
        <Button 
          onClick={handleSave} 
          disabled={updateProfile.isPending}
        >
          <Save className="h-4 w-4 mr-2" />
          {updateProfile.isPending ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>

      <Tabs defaultValue="personal" className="space-y-6">
        <TabsList>
          <TabsTrigger value="personal" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            Personal Info
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Security & KYC
          </TabsTrigger>
          <TabsTrigger value="preferences" className="flex items-center gap-2">
            <Bell className="h-4 w-4" />
            Preferences
          </TabsTrigger>
        </TabsList>

        <TabsContent value="personal">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
                <CardDescription>
                  Update personal details and contact information
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name</Label>
                    <Input
                      id="firstName"
                      value={formData.firstName}
                      onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input
                      id="lastName"
                      value={formData.lastName}
                      onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    value={profile?.email || ''}
                    disabled
                    className="opacity-60"
                  />
                  <p className="text-xs text-muted-foreground">
                    Email cannot be changed
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="company">Company</Label>
                  <Input
                    id="company"
                    value={formData.company}
                    onChange={(e) => setFormData(prev => ({ ...prev, company: e.target.value }))}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Address Information</CardTitle>
                <CardDescription>
                  Shipping and billing address details
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="street">Street Address</Label>
                  <Input
                    id="street"
                    value={formData.address.street}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      address: { ...prev.address, street: e.target.value }
                    }))}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="city">City</Label>
                    <Input
                      id="city"
                      value={formData.address.city}
                      onChange={(e) => setFormData(prev => ({ 
                        ...prev, 
                        address: { ...prev.address, city: e.target.value }
                      }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="state">State</Label>
                    <Input
                      id="state"
                      value={formData.address.state}
                      onChange={(e) => setFormData(prev => ({ 
                        ...prev, 
                        address: { ...prev.address, state: e.target.value }
                      }))}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="country">Country</Label>
                    <Input
                      id="country"
                      value={formData.address.country}
                      onChange={(e) => setFormData(prev => ({ 
                        ...prev, 
                        address: { ...prev.address, country: e.target.value }
                      }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="zipCode">ZIP Code</Label>
                    <Input
                      id="zipCode"
                      value={formData.address.zipCode}
                      onChange={(e) => setFormData(prev => ({ 
                        ...prev, 
                        address: { ...prev.address, zipCode: e.target.value }
                      }))}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle>KYC Verification</CardTitle>
              <CardDescription>
                Know Your Customer verification status and documents
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <h3 className="font-semibold">Verification Status</h3>
                  <p className="text-sm text-muted-foreground">
                    Current KYC verification status
                  </p>
                </div>
                <Badge className={getKycBadge(profile?.kycStatus || 'not_started')}>
                  {getKycStatusText(profile?.kycStatus || 'not_started')}
                </Badge>
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <Button 
                  variant="outline"
                  onClick={() => handleKycUpdate('pending')}
                  disabled={updateKyc.isPending}
                >
                  Mark as Pending
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => handleKycUpdate('verified')}
                  disabled={updateKyc.isPending}
                >
                  Mark as Verified
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => handleKycUpdate('rejected')}
                  disabled={updateKyc.isPending}
                >
                  Mark as Rejected
                </Button>
              </div>

              <div className="space-y-4">
                <h3 className="font-semibold">Account Information</h3>
                <div className="grid gap-4 text-sm">
                  <div className="flex justify-between p-3 bg-muted rounded-lg">
                    <span>Member Since</span>
                    <span>{profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString() : 'N/A'}</span>
                  </div>
                  <div className="flex justify-between p-3 bg-muted rounded-lg">
                    <span>Last Activity</span>
                    <span>{profile?.lastActivity ? new Date(profile.lastActivity).toLocaleDateString() : 'N/A'}</span>
                  </div>
                  <div className="flex justify-between p-3 bg-muted rounded-lg">
                    <span>Total Spent</span>
                    <span>${profile?.totalSpent?.toFixed(2) || '0.00'}</span>
                  </div>
                  <div className="flex justify-between p-3 bg-muted rounded-lg">
                    <span>Active Subscriptions</span>
                    <span>{profile?.activeSubscriptions || 0}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="preferences">
          <Card>
            <CardHeader>
              <CardTitle>Communication Preferences</CardTitle>
              <CardDescription>
                Manage how and when you want to be contacted
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="space-y-1">
                  <Label htmlFor="email-notifications">Email Notifications</Label>
                  <p className="text-sm text-muted-foreground">
                    Receive important updates via email
                  </p>
                </div>
                <Switch
                  id="email-notifications"
                  checked={formData.preferences.emailNotifications}
                  onCheckedChange={(checked) => 
                    setFormData(prev => ({
                      ...prev,
                      preferences: { ...prev.preferences, emailNotifications: checked }
                    }))
                  }
                />
              </div>

              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="space-y-1">
                  <Label htmlFor="sms-notifications">SMS Notifications</Label>
                  <p className="text-sm text-muted-foreground">
                    Receive text message alerts
                  </p>
                </div>
                <Switch
                  id="sms-notifications"
                  checked={formData.preferences.smsNotifications}
                  onCheckedChange={(checked) => 
                    setFormData(prev => ({
                      ...prev,
                      preferences: { ...prev.preferences, smsNotifications: checked }
                    }))
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="language">Preferred Language</Label>
                <select
                  id="language"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  value={formData.preferences.language}
                  onChange={(e) => 
                    setFormData(prev => ({
                      ...prev,
                      preferences: { ...prev.preferences, language: e.target.value }
                    }))
                  }
                >
                  <option value="en">English</option>
                  <option value="es">Spanish</option>
                  <option value="fr">French</option>
                  <option value="de">German</option>
                </select>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}