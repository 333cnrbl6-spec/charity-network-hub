import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { User, Bell, Clock, Upload } from 'lucide-react';
import { toast } from 'sonner';

export default function UserProfile() {
  const queryClient = useQueryClient();
  const [displayName, setDisplayName] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [uploading, setUploading] = useState(false);
  const [notifications, setNotifications] = useState({
    mentions: true,
    discussionUpdates: true,
    commentReplies: true,
    weeklyDigest: false
  });

  // Fetch current user
  const { data: user, isLoading } = useQuery({
    queryKey: ['currentUser'],
    queryFn: async () => {
      const currentUser = await base44.auth.me();
      if (currentUser) {
        setDisplayName(currentUser.full_name || '');
        const userData = await base44.auth.me();
        setAvatarUrl(userData.avatar_url || '');
        setNotifications(userData.notification_preferences || {
          mentions: true,
          discussionUpdates: true,
          commentReplies: true,
          weeklyDigest: false
        });
      }
      return currentUser;
    }
  });

  // Fetch user activity (discussions and comments)
  const { data: userActivity = [] } = useQuery({
    queryKey: ['userActivity', user?.email],
    queryFn: async () => {
      if (!user?.email) return [];
      const discussions = await base44.entities.Discussion.filter({ initiator: user.email }, '-created_at', 50);
      const comments = await base44.entities.Comment.filter({ author: user.email }, '-created_at', 50);
      return [...discussions, ...comments].sort((a, b) => 
        new Date(b.created_at || b.created_at) - new Date(a.created_at || a.created_at)
      ).slice(0, 20);
    },
    enabled: !!user?.email
  });

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

      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="profile" className="flex gap-2">
            <User className="w-4 h-4" />
            Profile
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex gap-2">
            <Bell className="w-4 h-4" />
            Notifications
          </TabsTrigger>
          <TabsTrigger value="activity" className="flex gap-2">
            <Clock className="w-4 h-4" />
            Activity
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
                <p className="text-xs text-muted-foreground">This is how you'll appear in discussions and comments</p>
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
              {/* @mentions */}
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="space-y-1">
                  <Label className="text-base font-medium">@Mentions</Label>
                  <p className="text-sm text-muted-foreground">Notify me when someone mentions me</p>
                </div>
                <Switch
                  checked={notifications.mentions}
                  onCheckedChange={() => handleNotificationChange('mentions')}
                />
              </div>

              {/* Discussion Updates */}
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="space-y-1">
                  <Label className="text-base font-medium">Discussion Updates</Label>
                  <p className="text-sm text-muted-foreground">Notify me of new comments in discussions I started</p>
                </div>
                <Switch
                  checked={notifications.discussionUpdates}
                  onCheckedChange={() => handleNotificationChange('discussionUpdates')}
                />
              </div>

              {/* Comment Replies */}
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="space-y-1">
                  <Label className="text-base font-medium">Comment Replies</Label>
                  <p className="text-sm text-muted-foreground">Notify me when someone replies to my comments</p>
                </div>
                <Switch
                  checked={notifications.commentReplies}
                  onCheckedChange={() => handleNotificationChange('commentReplies')}
                />
              </div>

              {/* Weekly Digest */}
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="space-y-1">
                  <Label className="text-base font-medium">Weekly Digest</Label>
                  <p className="text-sm text-muted-foreground">Send me a weekly summary of activity</p>
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

        {/* Activity Tab */}
        <TabsContent value="activity" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Your Activity</CardTitle>
              <CardDescription>Recent discussions and comments</CardDescription>
            </CardHeader>
            <CardContent>
              {userActivity.length === 0 ? (
                <div className="text-center py-8">
                  <Clock className="w-12 h-12 text-muted-foreground mx-auto mb-2 opacity-30" />
                  <p className="text-muted-foreground">No activity yet</p>
                </div>
              ) : (
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {userActivity.map(item => (
                    <div
                      key={item.id}
                      className="p-4 border rounded-lg hover:bg-accent transition-colors"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">
                            {item.title || item.content?.substring(0, 60)}
                          </p>
                          <p className="text-sm text-muted-foreground mt-1">
                            {item.context_type ? 'Discussion' : 'Comment'}
                            {item.context_data && ` • ${item.context_data.report_week || item.context_data.product_name || ''}`}
                          </p>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <p className="text-xs text-muted-foreground">
                            {new Date(item.created_at).toLocaleDateString('en-GB')}
                          </p>
                          {item.reply_count > 0 && (
                            <p className="text-xs font-medium text-primary">
                              {item.reply_count} replies
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}