import { useState, useEffect } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, db } from '@/lib/firebase';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { updateProfile, updatePassword, EmailAuthProvider, reauthenticateWithCredential } from 'firebase/auth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar,
  Shield,
  Save,
  Lock,
  Edit
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';

const ADMIN_EMAILS = [
  'megharajdandgavhal2004@gmail.com',
  'sohamk5404@gmail.com', 
  'dandgavhalchetan20@gmail.com'
];

interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  joinedAt?: any;
  role?: string;
  avatar?: string;
}

export default function Profile() {
  const [user] = useAuthState(auth);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const { toast } = useToast();

  const isAdmin = user?.email && ADMIN_EMAILS.includes(user.email);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return;

      try {
        const userDocRef = doc(db, 'users', user.uid);
        const userDoc = await getDoc(userDocRef);
        
        if (userDoc.exists()) {
          const userData = userDoc.data() as UserProfile;
          setProfile({ ...userData, id: user.uid });
          setFormData({
            name: userData.name || user.displayName || '',
            phone: userData.phone || '',
            address: userData.address || '',
            currentPassword: '',
            newPassword: '',
            confirmPassword: ''
          });
        } else {
          // Create new profile if doesn't exist
          const newProfile: UserProfile = {
            id: user.uid,
            name: user.displayName || user.email?.split('@')[0] || 'User',
            email: user.email || '',
            role: isAdmin ? 'admin' : 'user',
            joinedAt: new Date(),
          };
          
          await setDoc(userDocRef, newProfile);
          setProfile(newProfile);
          setFormData({
            name: newProfile.name,
            phone: '',
            address: '',
            currentPassword: '',
            newPassword: '',
            confirmPassword: ''
          });
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load profile data",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [user, isAdmin, toast]);

  const handleSaveProfile = async () => {
    if (!user || !profile) return;

    setSaving(true);
    try {
      const userDocRef = doc(db, 'users', user.uid);
      const updatedData = {
        name: formData.name,
        phone: formData.phone,
        address: formData.address,
        updatedAt: new Date()
      };

      await updateDoc(userDocRef, updatedData);
      
      // Update Firebase Auth profile
      await updateProfile(user, {
        displayName: formData.name
      });

      setProfile(prev => prev ? { ...prev, ...updatedData } : null);
      setEditing(false);

      toast({
        title: "Profile Updated",
        description: "Your profile has been updated successfully",
      });
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update profile",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async () => {
    if (!user) return;

    if (formData.newPassword !== formData.confirmPassword) {
      toast({
        variant: "destructive",
        title: "Password Mismatch",
        description: "New passwords do not match",
      });
      return;
    }

    if (formData.newPassword.length < 6) {
      toast({
        variant: "destructive",
        title: "Password Too Short",
        description: "Password must be at least 6 characters long",
      });
      return;
    }

    setChangingPassword(true);
    try {
      // Re-authenticate user
      const credential = EmailAuthProvider.credential(
        user.email!,
        formData.currentPassword
      );
      await reauthenticateWithCredential(user, credential);
      
      // Update password
      await updatePassword(user, formData.newPassword);
      
      setFormData(prev => ({
        ...prev,
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      }));

      toast({
        title: "Password Changed",
        description: "Your password has been updated successfully",
      });
    } catch (error: any) {
      console.error('Error changing password:', error);
      toast({
        variant: "destructive",
        title: "Password Change Failed",
        description: error.code === 'auth/wrong-password' 
          ? "Current password is incorrect" 
          : "Failed to change password",
      });
    } finally {
      setChangingPassword(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <User className="h-12 w-12 animate-pulse mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="text-center p-8">
        <p className="text-muted-foreground">Profile not found</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Profile Header */}
      <Card className="bg-gradient-card shadow-elegant border-0">
        <CardHeader className="text-center pb-6">
          <div className="flex flex-col items-center space-y-4">
            <Avatar className="w-24 h-24 shadow-glow">
              <AvatarImage src={profile.avatar} />
              <AvatarFallback className="text-2xl bg-gradient-primary text-primary-foreground">
                {profile.name.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-3xl font-bold text-foreground">{profile.name}</h1>
              <p className="text-muted-foreground">{profile.email}</p>
              {isAdmin && (
                <Badge variant="default" className="mt-2">
                  <Shield className="w-3 h-3 mr-1" />
                  Administrator
                </Badge>
              )}
            </div>
          </div>
        </CardHeader>
      </Card>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Profile Information */}
        <Card className="bg-gradient-card shadow-card border-0">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5 text-primary" />
              Profile Information
            </CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setEditing(!editing)}
            >
              <Edit className="h-4 w-4 mr-2" />
              {editing ? 'Cancel' : 'Edit'}
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-muted-foreground" />
                {editing ? (
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Enter your full name"
                  />
                ) : (
                  <span className="flex-1">{profile.name}</span>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span className="flex-1 text-muted-foreground">{profile.email}</span>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-muted-foreground" />
                {editing ? (
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                    placeholder="Enter your phone number"
                  />
                ) : (
                  <span className="flex-1">{profile.phone || 'Not provided'}</span>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                {editing ? (
                  <Input
                    id="address"
                    value={formData.address}
                    onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                    placeholder="Enter your address"
                  />
                ) : (
                  <span className="flex-1">{profile.address || 'Not provided'}</span>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Joined Date</Label>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="flex-1">
                  {profile.joinedAt ? 
                    format(new Date(profile.joinedAt?.seconds * 1000 || profile.joinedAt), 'PPP') 
                    : 'Recently joined'
                  }
                </span>
              </div>
            </div>

            {editing && (
              <Button onClick={handleSaveProfile} disabled={saving} className="w-full">
                <Save className="h-4 w-4 mr-2" />
                {saving ? 'Saving...' : 'Save Changes'}
              </Button>
            )}
          </CardContent>
        </Card>

        {/* Security Settings */}
        <Card className="bg-gradient-card shadow-card border-0">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="h-5 w-5 text-primary" />
              Security Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="currentPassword">Current Password</Label>
                <Input
                  id="currentPassword"
                  type="password"
                  value={formData.currentPassword}
                  onChange={(e) => setFormData(prev => ({ ...prev, currentPassword: e.target.value }))}
                  placeholder="Enter current password"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="newPassword">New Password</Label>
                <Input
                  id="newPassword"
                  type="password"
                  value={formData.newPassword}
                  onChange={(e) => setFormData(prev => ({ ...prev, newPassword: e.target.value }))}
                  placeholder="Enter new password"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm New Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                  placeholder="Confirm new password"
                />
              </div>

              <Button 
                onClick={handleChangePassword} 
                disabled={changingPassword || !formData.currentPassword || !formData.newPassword}
                className="w-full"
                variant="secondary"
              >
                <Lock className="h-4 w-4 mr-2" />
                {changingPassword ? 'Changing Password...' : 'Change Password'}
              </Button>
            </div>

            <Separator />

            <div className="bg-muted/30 p-4 rounded-lg">
              <h4 className="font-medium mb-2">Security Tips</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Use a strong password with at least 8 characters</li>
                <li>• Include uppercase, lowercase, numbers, and symbols</li>
                <li>• Don't share your password with anyone</li>
                <li>• Change your password regularly</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}