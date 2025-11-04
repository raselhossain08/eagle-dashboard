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
import { Skeleton } from '@/components/ui/skeleton';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
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
  Bell,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  RefreshCw,
  History,
  DollarSign,
  Calendar,
  Settings,
  Activity
} from 'lucide-react';
import Link from 'next/link';
import { 
  useSubscriberProfile, 
  useUpdateSubscriberProfile, 
  useUpdateKycStatus 
} from '@/hooks/useSubscriberProfile';
import { ApiErrorHandler } from '@/components/api-error-handler';
import { RoleBasedAccess } from '@/components/role-based-access';
import { ErrorBoundary } from '@/components/error-boundary';
import { useState, useEffect } from 'react';

export default function ProfileManagementPage() {
  const params = useParams();
  const id = params.id as string;
  
  // Mock user role - replace with actual auth
  const userRole = 'super_admin';
  const requiredRoles = ['super_admin', 'admin', 'support'];
  
  // State management
  const [activeTab, setActiveTab] = useState('personal');
  const [isKycDialogOpen, setIsKycDialogOpen] = useState(false);
  const [selectedKycStatus, setSelectedKycStatus] = useState<'verified' | 'rejected' | 'pending'>('pending');
  const [kycNotes, setKycNotes] = useState('');
  
  // API hooks with proper error handling
  const { 
    data: profile, 
    isLoading: profileLoading, 
    error: profileError, 
    refetch: refetchProfile 
  } = useSubscriberProfile(id);
  
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

  // Loading skeleton component
  const LoadingSkeleton = () => (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Skeleton className="h-12 w-12 rounded-full" />
        <div className="space-y-2">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-32" />
        </div>
      </div>
      <div className="grid gap-6">
        {Array.from({ length: 3 }).map((_, index) => (
          <Card key={index}>
            <CardHeader>
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-4 w-48" />
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="space-y-2">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-10 w-full" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );

  // Early return for loading state
  if (profileLoading && !profile) {
    return (
      <ErrorBoundary>
        <RoleBasedAccess requiredRoles={requiredRoles} userRole={userRole}>
          <div className="container mx-auto px-4 py-8">
            <LoadingSkeleton />
          </div>
        </RoleBasedAccess>
      </ErrorBoundary>
    );
  }

  // Error state
  if (profileError) {
    return (
      <ErrorBoundary>
        <RoleBasedAccess requiredRoles={requiredRoles} userRole={userRole}>
          <div className="container mx-auto px-4 py-8">
            <ApiErrorHandler 
              error={profileError}
              onRetry={refetchProfile}
              variant="page"
              fallbackMessage="Failed to load subscriber profile"
            />
          </div>
        </RoleBasedAccess>
      </ErrorBoundary>
    );
  }

  if (!profile) {
    return (
      <ErrorBoundary>
        <RoleBasedAccess requiredRoles={requiredRoles} userRole={userRole}>
          <div className="container mx-auto px-4 py-8">
            <div className="flex flex-col items-center justify-center py-12">
              <XCircle className="h-16 w-16 text-muted-foreground mb-4" />
              <h2 className="text-xl font-semibold mb-2">Subscriber Not Found</h2>
              <p className="text-muted-foreground text-center mb-6">
                The subscriber profile you're looking for could not be found or you don't have permission to view it.
              </p>
              <div className="flex gap-3">
                <Link href="/dashboard/subscribers">
                  <Button variant="outline">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Subscribers
                  </Button>
                </Link>
                <Button onClick={() => refetchProfile()}>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Try Again
                </Button>
              </div>
            </div>
          </div>
        </RoleBasedAccess>
      </ErrorBoundary>
    );
  }

  const handleSave = async () => {
    try {
      // Validate required fields
      if (!formData.firstName.trim() || !formData.lastName.trim()) {
        toast.error("First name and last name are required.");
        return;
      }

      if (formData.phone && !/^\+?[\d\s-()]+$/.test(formData.phone)) {
        toast.error("Please enter a valid phone number.");
        return;
      }

      await updateProfile.mutateAsync({
        subscriberId: id,
        data: formData
      });
      
      toast.success("Profile information has been successfully updated.", {
        description: `Updated profile for ${formData.firstName} ${formData.lastName}`,
      });
      
      // Refetch profile to ensure UI is in sync
      refetchProfile();
    } catch (error: any) {
      console.error('Failed to update profile:', error);
      const errorMessage = error?.response?.data?.message || error?.message || "Failed to update profile";
      toast.error("Profile Update Failed", {
        description: errorMessage,
      });
    }
  };

  const handleKycUpdate = async (status: 'verified' | 'rejected' | 'pending', notes?: string) => {
    try {
      await updateKyc.mutateAsync({
        subscriberId: id,
        data: { 
          status,
          reason: notes 
        }
      });
      
      const statusLabels = {
        verified: 'Verified',
        rejected: 'Rejected',
        pending: 'Pending Review'
      };
      
      toast.success(`KYC Status Updated`, {
        description: `Status changed to ${statusLabels[status]}${notes ? ` - ${notes}` : ''}`,
      });
      
      setIsKycDialogOpen(false);
      setKycNotes('');
      refetchProfile();
    } catch (error: any) {
      console.error('Failed to update KYC status:', error);
      const errorMessage = error?.response?.data?.message || error?.message || "Failed to update KYC status";
      toast.error("KYC Update Failed", {
        description: errorMessage,
      });
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
    <ErrorBoundary>
      <RoleBasedAccess requiredRoles={requiredRoles} userRole={userRole}>
        <div className="container mx-auto px-4 py-8 space-y-6">
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
            <div className="flex gap-3">
              {profileLoading && (
                <Button variant="ghost" size="sm" disabled>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                </Button>
              )}
              <Button 
                onClick={handleSave} 
                disabled={updateProfile.isPending || profileLoading}
                className="relative"
              >
                {updateProfile.isPending ? (
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Save className="h-4 w-4 mr-2" />
                )}
                {updateProfile.isPending ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
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
              <TabsTrigger value="activity" className="flex items-center gap-2">
                <Activity className="h-4 w-4" />
                Activity
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
              <div className="grid gap-6 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle>KYC Verification</CardTitle>
                    <CardDescription>
                      Know Your Customer verification status and documents
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="flex items-center justify-between p-4 border rounded-lg bg-muted/30">
                      <div className="space-y-1">
                        <h3 className="font-semibold flex items-center gap-2">
                          <Shield className="h-4 w-4" />
                          Current Status
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          Last updated: {profile?.lastActivity ? new Date(profile.lastActivity).toLocaleDateString() : 'Recently'}
                        </p>
                      </div>
                      <Badge className={getKycBadge(profile?.kycStatus || 'not_started')}>
                        {getKycStatusText(profile?.kycStatus || 'not_started')}
                      </Badge>
                    </div>

                    <div className="space-y-3">
                      <h4 className="font-medium">Update KYC Status</h4>
                      <div className="grid gap-3">
                        <AlertDialog open={isKycDialogOpen} onOpenChange={setIsKycDialogOpen}>
                          <div className="grid gap-2 md:grid-cols-3">
                            <AlertDialogTrigger asChild>
                              <Button 
                                variant="outline"
                                onClick={() => {
                                  setSelectedKycStatus('pending');
                                  setIsKycDialogOpen(true);
                                }}
                                disabled={updateKyc.isPending}
                                className="w-full"
                              >
                                <Clock className="h-4 w-4 mr-2" />
                                Pending
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogTrigger asChild>
                              <Button 
                                variant="outline"
                                onClick={() => {
                                  setSelectedKycStatus('verified');
                                  setIsKycDialogOpen(true);
                                }}
                                disabled={updateKyc.isPending}
                                className="w-full"
                              >
                                <CheckCircle className="h-4 w-4 mr-2" />
                                Verified
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogTrigger asChild>
                              <Button 
                                variant="outline"
                                onClick={() => {
                                  setSelectedKycStatus('rejected');
                                  setIsKycDialogOpen(true);
                                }}
                                disabled={updateKyc.isPending}
                                className="w-full"
                              >
                                <XCircle className="h-4 w-4 mr-2" />
                                Rejected
                              </Button>
                            </AlertDialogTrigger>
                          </div>
                          
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>
                                Update KYC Status to {selectedKycStatus}
                              </AlertDialogTitle>
                              <AlertDialogDescription>
                                You are about to change the KYC verification status for {profile?.firstName} {profile?.lastName}. 
                                This action will be logged and may affect the subscriber's access to certain features.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <div className="space-y-4">
                              <div className="space-y-2">
                                <Label htmlFor="kyc-notes">Notes (Optional)</Label>
                                <Textarea
                                  id="kyc-notes"
                                  placeholder="Add any notes about this KYC status change..."
                                  value={kycNotes}
                                  onChange={(e) => setKycNotes(e.target.value)}
                                  rows={3}
                                />
                              </div>
                            </div>
                            <AlertDialogFooter>
                              <AlertDialogCancel onClick={() => {
                                setKycNotes('');
                                setIsKycDialogOpen(false);
                              }}>
                                Cancel
                              </AlertDialogCancel>
                              <AlertDialogAction 
                                onClick={() => handleKycUpdate(selectedKycStatus, kycNotes)}
                                disabled={updateKyc.isPending}
                              >
                                {updateKyc.isPending ? (
                                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                                ) : (
                                  <CheckCircle className="h-4 w-4 mr-2" />
                                )}
                                Update Status
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Security Information</CardTitle>
                    <CardDescription>
                      Account security details and compliance
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid gap-4 text-sm">
                      <div className="flex justify-between items-center p-3 bg-muted/30 rounded-lg">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          <span>Member Since</span>
                        </div>
                        <span className="font-medium">
                          {profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString() : 'N/A'}
                        </span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-muted/30 rounded-lg">
                        <div className="flex items-center gap-2">
                          <Activity className="h-4 w-4" />
                          <span>Last Activity</span>
                        </div>
                        <span className="font-medium">
                          {profile?.lastActivity ? new Date(profile.lastActivity).toLocaleDateString() : 'N/A'}
                        </span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-muted/30 rounded-lg">
                        <div className="flex items-center gap-2">
                          <DollarSign className="h-4 w-4" />
                          <span>Total Spent</span>
                        </div>
                        <span className="font-medium text-green-600">
                          ${profile?.totalSpent?.toFixed(2) || '0.00'}
                        </span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-muted/30 rounded-lg">
                        <div className="flex items-center gap-2">
                          <Settings className="h-4 w-4" />
                          <span>Active Subscriptions</span>
                        </div>
                        <Badge variant="secondary">
                          {profile?.activeSubscriptions || 0}
                        </Badge>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-muted/30 rounded-lg">
                        <div className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4" />
                          <span>Account Status</span>
                        </div>
                        <Badge className={profile?.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                          {profile?.status || 'Unknown'}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>



            <TabsContent value="preferences">
              <Card>
                <CardHeader>
                  <CardTitle>Communication Preferences</CardTitle>
                  <CardDescription>
                    Manage how and when the subscriber wants to be contacted
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
                    <Select 
                      value={formData.preferences.language} 
                      onValueChange={(value) => 
                        setFormData(prev => ({
                          ...prev,
                          preferences: { ...prev.preferences, language: value }
                        }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="en">English</SelectItem>
                        <SelectItem value="es">Spanish</SelectItem>
                        <SelectItem value="fr">French</SelectItem>
                        <SelectItem value="de">German</SelectItem>
                        <SelectItem value="ja">Japanese</SelectItem>
                        <SelectItem value="ko">Korean</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="activity">
              <Card>
                <CardHeader>
                  <CardTitle>Recent Activity & Summary</CardTitle>
                  <CardDescription>
                    Overview of subscriber activity and key metrics
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-6 md:grid-cols-2">
                    <div className="space-y-4">
                      <h3 className="font-semibold flex items-center gap-2">
                        <Activity className="h-4 w-4" />
                        Account Summary
                      </h3>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center p-3 bg-muted/30 rounded-lg">
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-blue-500" />
                            <span>Member Since</span>
                          </div>
                          <span className="font-medium">
                            {profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString() : 'N/A'}
                          </span>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-muted/30 rounded-lg">
                          <div className="flex items-center gap-2">
                            <Activity className="h-4 w-4 text-green-500" />
                            <span>Last Activity</span>
                          </div>
                          <span className="font-medium">
                            {profile?.lastActivity ? new Date(profile.lastActivity).toLocaleDateString() : 'N/A'}
                          </span>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-muted/30 rounded-lg">
                          <div className="flex items-center gap-2">
                            <DollarSign className="h-4 w-4 text-green-600" />
                            <span>Total Spent</span>
                          </div>
                          <span className="font-semibold text-green-600">
                            ${profile?.totalSpent?.toFixed(2) || '0.00'}
                          </span>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-muted/30 rounded-lg">
                          <div className="flex items-center gap-2">
                            <Settings className="h-4 w-4 text-purple-500" />
                            <span>Active Subscriptions</span>
                          </div>
                          <Badge variant="secondary">
                            {profile?.activeSubscriptions || 0}
                          </Badge>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h3 className="font-semibold flex items-center gap-2">
                        <Shield className="h-4 w-4" />
                        Security Status
                      </h3>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center p-3 bg-muted/30 rounded-lg">
                          <div className="flex items-center gap-2">
                            <CheckCircle className="h-4 w-4 text-blue-500" />
                            <span>Account Status</span>
                          </div>
                          <Badge 
                            className={
                              profile?.status === 'active' 
                                ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' 
                                : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
                            }
                          >
                            {profile?.status || 'Unknown'}
                          </Badge>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-muted/30 rounded-lg">
                          <div className="flex items-center gap-2">
                            <Shield className="h-4 w-4 text-purple-500" />
                            <span>KYC Status</span>
                          </div>
                          <Badge className={getKycBadge(profile?.kycStatus || 'not_started')}>
                            {getKycStatusText(profile?.kycStatus || 'not_started')}
                          </Badge>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-muted/30 rounded-lg">
                          <div className="flex items-center gap-2">
                            <History className="h-4 w-4 text-orange-500" />
                            <span>Total History</span>
                          </div>
                          <span className="font-medium">
                            {profile?.subscriptionHistory || 0} subscriptions
                          </span>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-muted/30 rounded-lg">
                          <div className="flex items-center gap-2">
                            <DollarSign className="h-4 w-4 text-amber-500" />
                            <span>Lifetime Value</span>
                          </div>
                          <span className="font-semibold text-amber-600">
                            ${profile?.lifetimeValue?.toFixed(2) || '0.00'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </RoleBasedAccess>
    </ErrorBoundary>
  );
}