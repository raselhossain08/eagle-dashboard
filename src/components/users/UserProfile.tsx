// app/dashboard/users/components/UserProfile.tsx
'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { User } from '@/types/users';
import { useUpdateUser } from '@/hooks/use-mutations';
import { Edit, Save, X, Upload, MapPin, Globe } from 'lucide-react';

interface UserProfileProps {
  user: User;
}

export function UserProfile({ user }: UserProfileProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    phone: user.phone || '',
    company: user.company || '',
    address: user.address || {
      street: '',
      city: '',
      state: '',
      country: '',
      postalCode: ''
    },
    preferences: user.preferences,
  });

  const updateUserMutation = useUpdateUser();

  const handleSave = async () => {
    try {
      await updateUserMutation.mutateAsync({
        id: user.id,
        data: formData,
      });
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to update user:', error);
    }
  };

  const handleCancel = () => {
    setFormData({
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phone: user.phone || '',
      company: user.company || '',
      address: user.address || {
        street: '',
        city: '',
        state: '',
        country: '',
        postalCode: ''
      },
      preferences: user.preferences,
    });
    setIsEditing(false);
  };

  return (
    <div className="space-y-6">
      {/* Personal Information */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Personal Information</CardTitle>
              <CardDescription>
                Basic user information and contact details
              </CardDescription>
            </div>
            {!isEditing ? (
              <Button onClick={() => setIsEditing(true)}>
                <Edit className="h-4 w-4 mr-2" />
                Edit Profile
              </Button>
            ) : (
              <div className="flex gap-2">
                <Button variant="outline" onClick={handleCancel}>
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
                <Button onClick={handleSave} disabled={updateUserMutation.isPending}>
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </Button>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="firstName">First Name</Label>
              <Input
                id="firstName"
                value={formData.firstName}
                onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
                disabled={!isEditing}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">Last Name</Label>
              <Input
                id="lastName"
                value={formData.lastName}
                onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
                disabled={!isEditing}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
              disabled={!isEditing}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number</Label>
            <Input
              id="phone"
              value={formData.phone}
              onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
              disabled={!isEditing}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="company">Company</Label>
            <Input
              id="company"
              value={formData.company}
              onChange={(e) => setFormData(prev => ({ ...prev, company: e.target.value }))}
              disabled={!isEditing}
            />
          </div>
        </CardContent>
      </Card>

      {/* Address Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Address Information
          </CardTitle>
          <CardDescription>
            User's physical address and location details
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
              disabled={!isEditing}
            />
          </div>
          
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="city">City</Label>
              <Input
                id="city"
                value={formData.address.city}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  address: { ...prev.address, city: e.target.value }
                }))}
                disabled={!isEditing}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="state">State/Province</Label>
              <Input
                id="state"
                value={formData.address.state}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  address: { ...prev.address, state: e.target.value }
                }))}
                disabled={!isEditing}
              />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="country">Country</Label>
              <Input
                id="country"
                value={formData.address.country}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  address: { ...prev.address, country: e.target.value }
                }))}
                disabled={!isEditing}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="postalCode">Postal Code</Label>
              <Input
                id="postalCode"
                value={formData.address.postalCode}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  address: { ...prev.address, postalCode: e.target.value }
                }))}
                disabled={!isEditing}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Notification Preferences */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            Preferences
          </CardTitle>
          <CardDescription>
            Manage user preferences and notification settings
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="email-notifications" className="flex flex-col space-y-1">
              <span>Email Notifications</span>
              <span className="font-normal text-sm text-muted-foreground">
                Receive notifications via email
              </span>
            </Label>
            <Switch
              id="email-notifications"
              checked={formData.preferences.emailNotifications}
              onCheckedChange={(checked) => setFormData(prev => ({
                ...prev,
                preferences: {
                  ...prev.preferences,
                  emailNotifications: checked
                }
              }))}
              disabled={!isEditing}
            />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="sms-notifications" className="flex flex-col space-y-1">
              <span>SMS Notifications</span>
              <span className="font-normal text-sm text-muted-foreground">
                Receive notifications via SMS
              </span>
            </Label>
            <Switch
              id="sms-notifications"
              checked={formData.preferences.smsNotifications}
              onCheckedChange={(checked) => setFormData(prev => ({
                ...prev,
                preferences: {
                  ...prev.preferences,
                  smsNotifications: checked
                }
              }))}
              disabled={!isEditing}
            />
          </div>

          {/* Push notifications not implemented in UserPreferences interface */}

          <div className="grid gap-4 md:grid-cols-2 pt-4">
            <div className="space-y-2">
              <Label htmlFor="language">Language</Label>
              <Select
                value={formData.preferences.language}
                onValueChange={(value) => setFormData(prev => ({
                  ...prev,
                  preferences: { ...prev.preferences, language: value }
                }))}
                disabled={!isEditing}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="es">Spanish</SelectItem>
                  <SelectItem value="fr">French</SelectItem>
                  <SelectItem value="de">German</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="timezone">Timezone</Label>
              <Select
                value={formData.preferences.timezone}
                onValueChange={(value) => setFormData(prev => ({
                  ...prev,
                  preferences: { ...prev.preferences, timezone: value }
                }))}
                disabled={!isEditing}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="UTC">UTC</SelectItem>
                  <SelectItem value="EST">Eastern Time</SelectItem>
                  <SelectItem value="PST">Pacific Time</SelectItem>
                  <SelectItem value="CET">Central European</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* KYC Status */}
      <Card>
        <CardHeader>
          <CardTitle>KYC Verification</CardTitle>
          <CardDescription>
            Customer verification status and document management
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Verification Status</p>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant={
                  user.kycStatus === 'verified' ? 'default' : 
                  user.kycStatus === 'pending' ? 'secondary' : 'destructive'
                }>
                  {user.kycStatus.toUpperCase()}
                </Badge>
                <span className="text-sm text-muted-foreground">
                  {user.kycStatus === 'verified' ? 'Verified on Jan 15, 2024' :
                   user.kycStatus === 'pending' ? 'Awaiting verification' :
                   'Verification rejected'}
                </span>
              </div>
            </div>
            <Button variant="outline">
              {user.kycStatus === 'pending' ? 'Review Documents' : 'View Details'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}