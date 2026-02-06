import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Mail, Save, Upload, X } from 'lucide-react';
import { useUser } from '../lib/user-context';
import { userAPI } from '../lib/api';
import { toast } from 'sonner';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import BackButton from '../components/BackButton';

export default function ProfilePage() {
  const { user, updateUser } = useUser();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [avatar, setAvatar] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState('');
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const data = await userAPI.getProfile();
      if (data.user) {
        setName(data.user.name || '');
        setUsername(data.user.username || '');
        setEmail(data.user.email || '');
        setAvatarPreview(data.user.avatar || '');
        updateUser(data.user);
      }
    } catch (error) {
      toast.error('Failed to load profile');
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image size must be less than 5MB');
        return;
      }
      if (!file.type.startsWith('image/')) {
        toast.error('Please select an image file');
        return;
      }
      setAvatar(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUploadAvatar = async () => {
    if (!avatar) {
      toast.error('Please select an image first');
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('avatar', avatar);

      const response = await fetch('/api/user/avatar', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to upload avatar');
      }

      const data = await response.json();
      setAvatarPreview(data.avatar);
      updateUser({ ...user, avatar: data.avatar });
      setAvatar(null);
      toast.success('Avatar uploaded successfully');
    } catch (error) {
      toast.error(error.message || 'Failed to upload avatar');
    } finally {
      setUploading(false);
    }
  };

  const handleUpdateProfile = async () => {
    setLoading(true);
    try {
      const data = await userAPI.updateProfile({ name, username });
      updateUser(data.user);
      toast.success('Profile updated successfully');
    } catch (error) {
      toast.error(error.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <BackButton />
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">Profile</h1>
        <p className="text-muted-foreground">Manage your profile information</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Profile Picture</CardTitle>
            <CardDescription>Upload a profile picture</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col items-center gap-4">
              <Avatar className="h-32 w-32">
                <AvatarImage src={avatarPreview || '/placeholder-user.jpg'} alt={name} />
                <AvatarFallback className="text-4xl">
                  {name?.charAt(0)?.toUpperCase() || 'U'}
                </AvatarFallback>
              </Avatar>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
              />
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Choose Image
                </Button>
                {avatar && (
                  <>
                    <Button
                      onClick={handleUploadAvatar}
                      disabled={uploading}
                    >
                      {uploading ? 'Uploading...' : 'Upload'}
                    </Button>
                    <Button
                      variant="ghost"
                      onClick={() => {
                        setAvatar(null);
                        setAvatarPreview(user?.avatar || '');
                      }}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </>
                )}
              </div>
              <p className="text-xs text-muted-foreground text-center">
                Max file size: 5MB. Supported formats: JPG, PNG, GIF
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Profile Information</CardTitle>
            <CardDescription>Update your personal details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">
                <User className="w-4 h-4 inline mr-2" />
                Name
              </Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Your username"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">
                <Mail className="w-4 h-4 inline mr-2" />
                Email
              </Label>
              <Input
                id="email"
                type="email"
                value={email}
                disabled
                className="opacity-60 cursor-not-allowed"
              />
              <p className="text-xs text-muted-foreground">
                To change your email, go to Settings
              </p>
            </div>
            <Button onClick={handleUpdateProfile} disabled={loading} className="w-full">
              <Save className="w-4 h-4 mr-2" />
              {loading ? 'Saving...' : 'Save Changes'}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
