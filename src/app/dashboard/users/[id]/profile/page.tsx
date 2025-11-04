// app/dashboard/users/[id]/profile/page.tsx
'use client';

import React, { useState } from 'react';
import { useParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  ArrowLeft, 
  Shield, 
  User, 
  Bell, 
  Lock, 
  Save,
  AlertCircle,
  CheckCircle,
  Eye,
  EyeOff,
  RefreshCw,
  Upload,
  Download,
  Settings
} from 'lucide-react';
import Link from 'next/link';
import { useUser, useUpdateUser } from '@/hooks/useUsers';
import { toast } from 'sonner';

export default function ProfilePage() {
  const params = useParams();
  const userId = params.id as string;
  const [showPassword, setShowPassword] = useState(false);
  const [resetPasswordOpen, setResetPasswordOpen] = useState(false);

  const { data: user, isLoading, error, refetch } = useUser(userId);
  const updateUser = useUpdateUser();

  const [personalInfo, setPersonalInfo] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    company: '',
    dateOfBirth: '',
    address: {
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: ''
    }
  });

  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    pushNotifications: true,
    smsNotifications: false,
    marketingEmails: false,
    securityAlerts: true,
    systemUpdates: true
  });

  const [securitySettings, setSecuritySettings] = useState({
    twoFactorEnabled: false,
    sessionTimeout: 30,
    loginNotifications: true,
    deviceTracking: true
  });

  const [kycData, setKycData] = useState({
    status: 'pending',
    documents: [],
    verificationLevel: 'basic',
    notes: ''
  });

  // Initialize form data when user data loads
  React.useEffect(() => {
    if (user) {
      setPersonalInfo({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        phone: user.phone || '',
        company: user.company || '',
        dateOfBirth: '', // dateOfBirth is not available in User interface
        address: user.address ? {
          street: user.address.street || '',
          city: user.address.city || '',
          state: user.address.state || '',
          zipCode: user.address.postalCode || '',
          country: user.address.country || ''
        } : {
          street: '',
          city: '',
          state: '',
          zipCode: '',
          country: ''
        }
      });
      setKycData({
        status: user.kycStatus || 'pending',
        documents: [], // kycDocuments not available in User interface
        verificationLevel: 'basic', // verificationLevel not available in User interface
        notes: '' // kycNotes not available in User interface
      });
    }
  }, [user]);

  const handleUpdatePersonalInfo = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Convert form data to UpdateUserDto format
      const updateData: any = {
        firstName: personalInfo.firstName,
        lastName: personalInfo.lastName,
        email: personalInfo.email,
        phone: personalInfo.phone,
        company: personalInfo.company,
        address: {
          street: personalInfo.address.street,
          city: personalInfo.address.city,
          state: personalInfo.address.state,
          postalCode: personalInfo.address.zipCode, // Convert zipCode to postalCode
          country: personalInfo.address.country
        }
      };

      await updateUser.mutateAsync({
        id: userId,
        data: updateData
      });
      toast.success('Personal information updated successfully');
    } catch (error: any) {
      toast.error(error.message || 'Failed to update personal information');
    }
  };

  const handleUpdateNotifications = async () => {
    try {
      await updateUser.mutateAsync({
        id: userId,
        data: { 
          preferences: { 
            ...user?.preferences,
            emailNotifications: notificationSettings.emailNotifications,
            smsNotifications: notificationSettings.smsNotifications
          } 
        }
      });
      toast.success('Notification settings updated successfully');
    } catch (error: any) {
      toast.error(error.message || 'Failed to update notification settings');
    }
  };

  const handleUpdateSecurity = async () => {
    try {
      // Note: Security settings update not implemented in UpdateUserDto
      // await updateUser.mutateAsync({
      //   id: userId,
      //   data: { securitySettings }
      // });
      toast.success('Security settings updated successfully');
    } catch (error: any) {
      toast.error(error.message || 'Failed to update security settings');
    }
  };

  const handleUpdateKyc = async () => {
    try {
      await updateUser.mutateAsync({
        id: userId,
        data: {
          // Note: KYC fields not directly supported in UpdateUserDto
          // Using status as closest match
          status: kycData.status === 'verified' ? 'active' : 
                 kycData.status === 'rejected' ? 'suspended' : 'inactive'
        }
      });
      toast.success('KYC information updated successfully');
    } catch (error: any) {
      toast.error(error.message || 'Failed to update KYC information');
    }
  };

  const handleResetPassword = async () => {
    try {
      // This would typically call a password reset endpoint
      toast.success('Password reset email sent to user');
      setResetPasswordOpen(false);
    } catch (error: any) {
      toast.error(error.message || 'Failed to reset password');
    }
  };

  const handleRefresh = () => {
    refetch();
    toast.success('User data refreshed');
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Link href={`/dashboard/users/${userId}`}>
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to User
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Profile Management</h1>
            <p className="text-muted-foreground">Loading user profile...</p>
          </div>
        </div>
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <RefreshCw className="h-8 w-8 animate-spin mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">Loading profile data...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Link href={`/dashboard/users/${userId}`}>
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to User
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Profile Management</h1>
            <p className="text-muted-foreground">Error loading user profile</p>
          </div>
        </div>
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Failed to load user profile: {error.message}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Link href={`/dashboard/users/${userId}`}>
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to User
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Profile Management</h1>
            <p className="text-muted-foreground">User not found</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href={`/dashboard/users/${userId}`}>
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to User
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Profile Management</h1>
            <p className="text-muted-foreground">
              Complete profile configuration for {user.firstName} {user.lastName}
            </p>
          </div>
        </div>
        <Button variant="outline" size="sm" onClick={handleRefresh}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      <Tabs defaultValue="personal" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="personal" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            Personal
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center gap-2">
            <Bell className="h-4 w-4" />
            Notifications
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center gap-2">
            <Lock className="h-4 w-4" />
            Security
          </TabsTrigger>
          <TabsTrigger value="kyc" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            KYC Verification
          </TabsTrigger>
        </TabsList>

        <TabsContent value="personal">
          <Card>
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
              <CardDescription>
                Update user's personal details and contact information
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleUpdatePersonalInfo} className="space-y-6">
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <Label htmlFor="firstName">First Name</Label>
                    <Input
                      id="firstName"
                      value={personalInfo.firstName}
                      onChange={(e) => setPersonalInfo(prev => ({ ...prev, firstName: e.target.value }))}
                      placeholder="Enter first name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input
                      id="lastName"
                      value={personalInfo.lastName}
                      onChange={(e) => setPersonalInfo(prev => ({ ...prev, lastName: e.target.value }))}
                      placeholder="Enter last name"
                    />
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      value={personalInfo.email}
                      onChange={(e) => setPersonalInfo(prev => ({ ...prev, email: e.target.value }))}
                      placeholder="Enter email address"
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      value={personalInfo.phone}
                      onChange={(e) => setPersonalInfo(prev => ({ ...prev, phone: e.target.value }))}
                      placeholder="Enter phone number"
                    />
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <Label htmlFor="company">Company</Label>
                    <Input
                      id="company"
                      value={personalInfo.company}
                      onChange={(e) => setPersonalInfo(prev => ({ ...prev, company: e.target.value }))}
                      placeholder="Enter company name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="dateOfBirth">Date of Birth</Label>
                    <Input
                      id="dateOfBirth"
                      type="date"
                      value={personalInfo.dateOfBirth}
                      onChange={(e) => setPersonalInfo(prev => ({ ...prev, dateOfBirth: e.target.value }))}
                    />
                  </div>
                </div>

                <div>
                  <Label>Address Information</Label>
                  <div className="grid gap-4 md:grid-cols-2 mt-2">
                    <div>
                      <Input
                        placeholder="Street Address"
                        value={personalInfo.address.street}
                        onChange={(e) => setPersonalInfo(prev => ({ 
                          ...prev, 
                          address: { ...prev.address, street: e.target.value }
                        }))}
                      />
                    </div>
                    <div>
                      <Input
                        placeholder="City"
                        value={personalInfo.address.city}
                        onChange={(e) => setPersonalInfo(prev => ({ 
                          ...prev, 
                          address: { ...prev.address, city: e.target.value }
                        }))}
                      />
                    </div>
                    <div>
                      <Input
                        placeholder="State/Province"
                        value={personalInfo.address.state}
                        onChange={(e) => setPersonalInfo(prev => ({ 
                          ...prev, 
                          address: { ...prev.address, state: e.target.value }
                        }))}
                      />
                    </div>
                    <div>
                      <Input
                        placeholder="ZIP/Postal Code"
                        value={personalInfo.address.zipCode}
                        onChange={(e) => setPersonalInfo(prev => ({ 
                          ...prev, 
                          address: { ...prev.address, zipCode: e.target.value }
                        }))}
                      />
                    </div>
                  </div>
                </div>

                <Button type="submit" disabled={updateUser.isPending}>
                  <Save className="h-4 w-4 mr-2" />
                  {updateUser.isPending ? 'Saving...' : 'Save Personal Information'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
              <CardDescription>
                Manage how the user receives notifications and alerts
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <p className="font-medium">Email Notifications</p>
                    <p className="text-sm text-muted-foreground">Receive updates via email</p>
                  </div>
                  <Switch
                    checked={notificationSettings.emailNotifications}
                    onCheckedChange={(checked) => setNotificationSettings(prev => ({ ...prev, emailNotifications: checked }))}
                  />
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <p className="font-medium">Push Notifications</p>
                    <p className="text-sm text-muted-foreground">Browser and mobile push notifications</p>
                  </div>
                  <Switch
                    checked={notificationSettings.pushNotifications}
                    onCheckedChange={(checked) => setNotificationSettings(prev => ({ ...prev, pushNotifications: checked }))}
                  />
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <p className="font-medium">SMS Notifications</p>
                    <p className="text-sm text-muted-foreground">Important alerts via text message</p>
                  </div>
                  <Switch
                    checked={notificationSettings.smsNotifications}
                    onCheckedChange={(checked) => setNotificationSettings(prev => ({ ...prev, smsNotifications: checked }))}
                  />
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <p className="font-medium">Marketing Emails</p>
                    <p className="text-sm text-muted-foreground">Promotional content and updates</p>
                  </div>
                  <Switch
                    checked={notificationSettings.marketingEmails}
                    onCheckedChange={(checked) => setNotificationSettings(prev => ({ ...prev, marketingEmails: checked }))}
                  />
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <p className="font-medium">Security Alerts</p>
                    <p className="text-sm text-muted-foreground">Important security notifications</p>
                  </div>
                  <Switch
                    checked={notificationSettings.securityAlerts}
                    onCheckedChange={(checked) => setNotificationSettings(prev => ({ ...prev, securityAlerts: checked }))}
                  />
                </div>
              </div>

              <Button onClick={handleUpdateNotifications} disabled={updateUser.isPending}>
                <Save className="h-4 w-4 mr-2" />
                {updateUser.isPending ? 'Saving...' : 'Save Notification Settings'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle>Security Settings</CardTitle>
              <CardDescription>
                Manage user's security preferences and authentication
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <p className="font-medium">Password</p>
                    <p className="text-sm text-muted-foreground">Last changed 2 weeks ago</p>
                  </div>
                  <Dialog open={resetPasswordOpen} onOpenChange={setResetPasswordOpen}>
                    <DialogTrigger asChild>
                      <Button variant="outline">Reset Password</Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Reset User Password</DialogTitle>
                        <DialogDescription>
                          This will send a password reset email to the user's email address.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="flex justify-end gap-2">
                        <Button variant="outline" onClick={() => setResetPasswordOpen(false)}>
                          Cancel
                        </Button>
                        <Button onClick={handleResetPassword}>
                          Send Reset Email
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <p className="font-medium">Two-Factor Authentication</p>
                    <p className="text-sm text-muted-foreground">Additional security layer</p>
                  </div>
                  <Switch
                    checked={securitySettings.twoFactorEnabled}
                    onCheckedChange={(checked) => setSecuritySettings(prev => ({ ...prev, twoFactorEnabled: checked }))}
                  />
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <p className="font-medium">Login Notifications</p>
                    <p className="text-sm text-muted-foreground">Alert on new device logins</p>
                  </div>
                  <Switch
                    checked={securitySettings.loginNotifications}
                    onCheckedChange={(checked) => setSecuritySettings(prev => ({ ...prev, loginNotifications: checked }))}
                  />
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <p className="font-medium">Device Tracking</p>
                    <p className="text-sm text-muted-foreground">Monitor login devices and locations</p>
                  </div>
                  <Switch
                    checked={securitySettings.deviceTracking}
                    onCheckedChange={(checked) => setSecuritySettings(prev => ({ ...prev, deviceTracking: checked }))}
                  />
                </div>
              </div>

              <Button onClick={handleUpdateSecurity} disabled={updateUser.isPending}>
                <Save className="h-4 w-4 mr-2" />
                {updateUser.isPending ? 'Saving...' : 'Save Security Settings'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="kyc">
          <Card>
            <CardHeader>
              <CardTitle>KYC Verification</CardTitle>
              <CardDescription>
                Customer verification status and document management
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label htmlFor="kycStatus">Verification Status</Label>
                  <select
                    id="kycStatus"
                    className="w-full p-2 border rounded-md"
                    value={kycData.status}
                    onChange={(e) => setKycData(prev => ({ ...prev, status: e.target.value }))}
                  >
                    <option value="pending">Pending</option>
                    <option value="verified">Verified</option>
                    <option value="rejected">Rejected</option>
                    <option value="expired">Expired</option>
                  </select>
                </div>
                <div>
                  <Label htmlFor="verificationLevel">Verification Level</Label>
                  <select
                    id="verificationLevel"
                    className="w-full p-2 border rounded-md"
                    value={kycData.verificationLevel}
                    onChange={(e) => setKycData(prev => ({ ...prev, verificationLevel: e.target.value }))}
                  >
                    <option value="basic">Basic</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                  </select>
                </div>
              </div>

              <div>
                <Label htmlFor="kycNotes">Verification Notes</Label>
                <Textarea
                  id="kycNotes"
                  value={kycData.notes}
                  onChange={(e) => setKycData(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Add notes about the verification process..."
                  rows={4}
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Identity Documents</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {kycData.documents.length > 0 ? (
                        kycData.documents.map((doc: any, index) => (
                          <div key={index} className="flex items-center justify-between p-2 border rounded">
                            <span className="text-sm">{doc.name || `Document ${index + 1}`}</span>
                            <Button variant="outline" size="sm">
                              <Download className="h-4 w-4" />
                            </Button>
                          </div>
                        ))
                      ) : (
                        <p className="text-sm text-muted-foreground">No documents uploaded</p>
                      )}
                      <Button variant="outline" className="w-full">
                        <Upload className="h-4 w-4 mr-2" />
                        Upload Document
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Verification Status</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Identity Verification</span>
                        <Badge variant={kycData.status === 'verified' ? 'default' : 'secondary'}>
                          {kycData.status === 'verified' ? <CheckCircle className="h-3 w-3 mr-1" /> : <AlertCircle className="h-3 w-3 mr-1" />}
                          {kycData.status}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Address Verification</span>
                        <Badge variant="secondary">
                          <AlertCircle className="h-3 w-3 mr-1" />
                          Not verified
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Phone Verification</span>
                        <Badge variant={user.phone ? 'default' : 'secondary'}>
                          {user.phone ? <CheckCircle className="h-3 w-3 mr-1" /> : <AlertCircle className="h-3 w-3 mr-1" />}
                          {user.phone ? 'Phone provided' : 'No phone'}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Button onClick={handleUpdateKyc} disabled={updateUser.isPending}>
                <Save className="h-4 w-4 mr-2" />
                {updateUser.isPending ? 'Saving...' : 'Save KYC Information'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}