import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/lib/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { User, Bell, Clock, Upload, Briefcase, CheckCircle2, Users, MapPin, ShieldCheck } from 'lucide-react';
import { toast } from 'sonner';

export default function UserProfile() {
  const queryClient = useQueryClient();
  const { user: authUser } = useAuth();
  const [displayName, setDisplayName] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [uploading, setUploading] = useState(false);
  const [notifications, setNotifications] = useState({
    newJobAssigned: true,
    safeguardingAlerts: true,
    trainingExpiry: true,
    weeklyDigest: false
  });

  // Fetch current user
  const { data: user, isLoading } = useQuery({
    queryKey: ['currentUser'],
    queryFn: async () => {
      const currentUser = await base44.auth.me();
      if (currentUser) {
        setDisplayName(currentUser.full_name || '');
        setAvatarUrl(currentUser.avatar_url || '');
        setNotifications(currentUser.notification_preferences || {
          newJobAssigned: true,
          safeguardingAlerts: true,
          trainingExpiry: true,
          weeklyDigest: false
        });
      }
      return currentUser;
    }
  });

  // Fetch job stats for this user
  const { data: myJobs = [] } = useQuery({
    queryKey: ['profile-jobs', authUser?.full_name],
    queryFn: () => base44.entities.Job.filter({ volunteer_name: authUser?.full_name }),
    enabled: !!authUser?.full_name,
  });

  // Fetch clients for this coordinator
  const { data: myClients = [] } = useQuery({
    queryKey: ['profile-clients'],
    queryFn: () => base44.entities.Client.filter({ key_worker: authUser?.full_name }),
    enabled: !!authUser?.full_name,
  });

  const completedJobs = myJobs.filter(j => j.status === 'completed').length;
  const activeClients = myClients.filter(c => c.status === 'active').length;

  // Update profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: async (data) => {
      await base44.auth.updateMe({
        full_name: data.displayName,
        avatar_url: data.avatarUrl,
        notification_preferences: data.notifications
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUser'] });
      toast.success('Profile updated successfully');
    },
    onError: (error) => {
      toast.error('Failed to update profile: ' + error.message);
    }
  });

  // Handle avatar upload
  const handleAvatarUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setAvatarUrl(file_url);
      toast.success('Avatar uploaded successfully');
    } catch (error) {
      toast.error('Failed to upload avatar: ' + error.message);
    } finally {
      setUploading(false);
    }
  };

  const handleSaveProfile = () => {
    updateProfileMutation.mutate({
      displayName,
      avatarUrl,
      notifications
    });
  };

  const handleNotificationChange = (key) => {
    setNotifications(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-8">
      <div className="border-b">
        <h1 className="text-3xl font-bold tracking-tight mb-2">Profile Settings</h1>
        <p className="text-muted-foreground">Manage your account and preferences</p>
      </div>

          {/* Role & branch summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card>
          <CardContent className="pt-4 text-center">
            <p className="text-2xl font-bold text-primary">{myJobs.length}</p>
            <p className="text-xs text-muted-foreground mt-1">Total Jobs</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 text-center">
            <p className="text-2xl font-bold text-green-600">{completedJobs}</p>
            <p className="text-xs text-muted-foreground mt-1">Completed</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 text-center">
            <p className="text-2xl font-bold text-blue-600">{activeClients}</p>
            <p className="text-xs text-muted-foreground mt-1">My Clients</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 text-center">
            <p className="text-2xl font-bold text-amber-600">
              {myJobs.length > 0 ? Math.round((completedJobs / myJobs.length) * 100) : 0}%
            </p>
            <p className="text-xs text-muted-foreground mt-1">Completion Rate</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="profile" className="flex gap-2">
            <User className="w-4 h-4" />
            Profile
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex gap-2">
            <Bell className="w-4 h-4" />
            Notifications
          </TabsTrigger>
        </TabsList>

        {/* Profile Tab */}
        <TabsContent value="profile" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>Update your personal details and avatar</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Avatar Section */}
              <div className="space-y-4">
                <Label>Avatar</Label>
                <div className="flex items-center gap-4">
                  <Avatar className="w-20 h-20">
                    <AvatarImage src={avatarUrl} />
                    <AvatarFallback>
                      {displayName.split(' ').map(n => n[0]).join('').toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="space-y-2">
                    <label htmlFor="avatar-upload" className="cursor-pointer">
                      <Button
                        asChild
                        variant="outline"
                        disabled={uploading}
                        className="cursor-pointer"
                      >
                        <span>
                          <Upload className="w-4 h-4 mr-2" />
                          {uploading ? 'Uploading...' : 'Upload Avatar'}
                        </span>
                      </Button>
                      <input
                        id="avatar-upload"
                        type="file"
                        accept="image/*"
                        onChange={handleAvatarUpload}
                        disabled={uploading}
                        className="hidden"
                      />
                    </label>
                    <p className="text-xs text-muted-foreground">JPG, PNG up to 5MB</p>
                  </div>
                </div>
              </div>

              {/* Display Name */}
              <div className="space-y-2">
                <Label htmlFor="displayName">Display Name</Label>
                <Input
                  id="displayName"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="Your display name"
                />
              </div>

              {/* Email (Read-only) */}
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  value={user?.email || ''}
                  disabled
                  className="bg-muted"
                />
                <p className="text-xs text-muted-foreground">Your email cannot be changed</p>
              </div>

              {/* Role & Branch (Read-only) */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="flex items-center gap-1"><Briefcase className="w-3 h-3" /> Role</Label>
                  <div className="flex items-center gap-2 h-9 px-3 border rounded-md bg-muted text-sm">
                    <Badge variant="secondary" className="text-xs">{authUser?.org_role || authUser?.role || 'staff'}</Badge>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="flex items-center gap-1"><MapPin className="w-3 h-3" /> Branch</Label>
                  <div className="flex items-center h-9 px-3 border rounded-md bg-muted text-sm text-muted-foreground">
                    {authUser?.branch_name || 'Age UK Bury'}
                  </div>
                </div>
              </div>

              {/* DBS / Safeguarding reminder */}
              <div className="flex items-start gap-3 bg-green-50 border border-green-200 rounded-lg p-3 text-sm text-green-900">
                <ShieldCheck className="w-4 h-4 flex-shrink-0 mt-0.5 text-green-600" />
                <div>
                  <p className="font-semibold">Safeguarding compliant</p>
                  <p className="text-xs text-green-700 mt-0.5">Contact your coordinator to update your DBS or training records.</p>
                </div>
              </div>

              {/* Save Button */}
              <Button
                onClick={handleSaveProfile}
                disabled={updateProfileMutation.isPending}
                className="w-full"
              >
                {updateProfileMutation.isPending ? 'Saving...' : 'Save Changes'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications Tab */}
        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
              <CardDescription>Control how and when you receive notifications</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* New Job Assigned */}
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="space-y-1">
                  <Label className="text-base font-medium">New Job Assigned</Label>
                  <p className="text-sm text-muted-foreground">Notify me when a new job is assigned to me</p>
                </div>
                <Switch
                  checked={notifications.newJobAssigned}
                  onCheckedChange={() => handleNotificationChange('newJobAssigned')}
                />
              </div>

              {/* Safeguarding Alerts */}
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="space-y-1">
                  <Label className="text-base font-medium">Safeguarding Alerts</Label>
                  <p className="text-sm text-muted-foreground">Important safeguarding notices from your coordinator</p>
                </div>
                <Switch
                  checked={notifications.safeguardingAlerts}
                  onCheckedChange={() => handleNotificationChange('safeguardingAlerts')}
                />
              </div>

              {/* Training Expiry */}
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="space-y-1">
                  <Label className="text-base font-medium">Training Expiry Reminders</Label>
                  <p className="text-sm text-muted-foreground">Remind me when DBS or training is approaching expiry</p>
                </div>
                <Switch
                  checked={notifications.trainingExpiry}
                  onCheckedChange={() => handleNotificationChange('trainingExpiry')}
                />
              </div>

              {/* Weekly Digest */}
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="space-y-1">
                  <Label className="text-base font-medium">Weekly Summary</Label>
                  <p className="text-sm text-muted-foreground">A weekly email summarising my jobs and upcoming schedule</p>
                </div>
                <Switch
                  checked={notifications.weeklyDigest}
                  onCheckedChange={() => handleNotificationChange('weeklyDigest')}
                />
              </div>

              {/* Save Button */}
              <Button
                onClick={handleSaveProfile}
                disabled={updateProfileMutation.isPending}
                className="w-full"
              >
                {updateProfileMutation.isPending ? 'Saving...' : 'Save Preferences'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>


      </Tabs>
    </div>
  );
}