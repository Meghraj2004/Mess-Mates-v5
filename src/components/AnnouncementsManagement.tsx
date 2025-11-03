import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { 
  collection, 
  addDoc, 
  serverTimestamp, 
  onSnapshot,
  updateDoc,
  deleteDoc,
  doc,
  query,
  orderBy
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '@/lib/firebase';
import { 
  Megaphone, 
  Plus, 
  Edit, 
  Trash2, 
  Users, 
  User, 
  Calendar,
  AlertCircle,
  CheckCircle
} from 'lucide-react';

interface Announcement {
  id: string;
  title: string;
  content: string;
  type: 'general' | 'urgent' | 'info';
  targetAudience: 'all' | 'specific';
  targetUsers?: string[];
  createdAt: any;
  createdBy: string;
  isActive: boolean;
  expiresAt?: any;
}

export function AnnouncementsManagement() {
  const [user] = useAuthState(auth);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingAnnouncement, setEditingAnnouncement] = useState<Announcement | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    type: 'general' as 'general' | 'urgent' | 'info',
    targetAudience: 'all' as 'all' | 'specific',
    targetUsers: [] as string[],
    expiresIn: '7'
  });

  // Load announcements and users
  useEffect(() => {
    // Load announcements
    const announcementsQuery = query(
      collection(db, 'announcements'),
      orderBy('createdAt', 'desc')
    );

    const unsubscribeAnnouncements = onSnapshot(announcementsQuery, (snapshot) => {
      const announcementsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Announcement[];
      setAnnouncements(announcementsData);
    });

    // Load users for targeting
    const usersQuery = query(collection(db, 'users'));
    const unsubscribeUsers = onSnapshot(usersQuery, (snapshot) => {
      const usersData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setUsers(usersData);
    });

    return () => {
      unsubscribeAnnouncements();
      unsubscribeUsers();
    };
  }, []);

  const resetForm = () => {
    setFormData({
      title: '',
      content: '',
      type: 'general',
      targetAudience: 'all',
      targetUsers: [],
      expiresIn: '7'
    });
    setEditingAnnouncement(null);
  };

  const handleCreateAnnouncement = async () => {
    if (!formData.title.trim() || !formData.content.trim()) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);

    try {
      const expirationDate = new Date();
      expirationDate.setDate(expirationDate.getDate() + parseInt(formData.expiresIn));

      const announcementData = {
        title: formData.title,
        content: formData.content,
        type: formData.type,
        targetAudience: formData.targetAudience,
        targetUsers: formData.targetAudience === 'specific' ? formData.targetUsers : [],
        createdAt: serverTimestamp(),
        createdBy: user?.email || 'Admin',
        isActive: true,
        expiresAt: serverTimestamp(),
      };

      if (editingAnnouncement) {
        // Update existing announcement
        const announcementRef = doc(db, 'announcements', editingAnnouncement.id);
        await updateDoc(announcementRef, {
          ...announcementData,
          updatedAt: serverTimestamp(),
          updatedBy: user?.email || 'Admin',
        });

        toast({
          title: "Success",
          description: "Announcement updated successfully",
        });
      } else {
        // Create new announcement
        await addDoc(collection(db, 'announcements'), announcementData);

        // Create notifications for users
        if (formData.targetAudience === 'all') {
          // Send to all users
          for (const targetUser of users) {
            const notificationData = {
              userId: targetUser.id,
              userEmail: targetUser.email,
              title: `📢 ${formData.title}`,
              message: formData.content,
              type: 'announcement',
              priority: formData.type === 'urgent' ? 'high' : 'normal',
              read: false,
              isRead: false,
              createdAt: serverTimestamp(),
              createdBy: user?.email || 'Admin',
              announcementId: null,
            };
            await addDoc(collection(db, 'notifications'), notificationData);
          }
        } else {
          // Send to specific users
          for (const userId of formData.targetUsers) {
            const targetUser = users.find(u => u.id === userId);
            if (targetUser) {
              const notificationData = {
                userId: userId,
                userEmail: targetUser.email,
                title: `📢 ${formData.title}`,
                message: formData.content,
                type: 'announcement',
                priority: formData.type === 'urgent' ? 'high' : 'normal',
                read: false,
                isRead: false,
                createdAt: serverTimestamp(),
                createdBy: user?.email || 'Admin',
                announcementId: null,
              };
              await addDoc(collection(db, 'notifications'), notificationData);
            }
          }
        }

        toast({
          title: "Success",
          description: `Announcement sent to ${formData.targetAudience === 'all' ? 'all users' : formData.targetUsers.length + ' users'}`,
        });
      }

      resetForm();
      setIsCreateDialogOpen(false);
    } catch (error) {
      console.error('Error creating/updating announcement:', error);
      toast({
        title: "Error",
        description: "Failed to save announcement",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleEditAnnouncement = (announcement: Announcement) => {
    setEditingAnnouncement(announcement);
    setFormData({
      title: announcement.title,
      content: announcement.content,
      type: announcement.type,
      targetAudience: announcement.targetAudience,
      targetUsers: announcement.targetUsers || [],
      expiresIn: '7'
    });
    setIsCreateDialogOpen(true);
  };

  const handleDeleteAnnouncement = async (announcementId: string) => {
    try {
      await deleteDoc(doc(db, 'announcements', announcementId));
      toast({
        title: "Success",
        description: "Announcement deleted successfully",
      });
    } catch (error) {
      console.error('Error deleting announcement:', error);
      toast({
        title: "Error",
        description: "Failed to delete announcement",
        variant: "destructive",
      });
    }
  };

  const handleToggleActive = async (announcement: Announcement) => {
    try {
      const announcementRef = doc(db, 'announcements', announcement.id);
      await updateDoc(announcementRef, {
        isActive: !announcement.isActive,
        updatedAt: serverTimestamp(),
        updatedBy: user?.email || 'Admin',
      });

      toast({
        title: "Success",
        description: `Announcement ${!announcement.isActive ? 'activated' : 'deactivated'}`,
      });
    } catch (error) {
      console.error('Error toggling announcement:', error);
      toast({
        title: "Error",
        description: "Failed to update announcement",
        variant: "destructive",
      });
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'urgent': return 'bg-red-100 text-red-800';
      case 'info': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'urgent': return <AlertCircle className="h-4 w-4" />;
      case 'info': return <CheckCircle className="h-4 w-4" />;
      default: return <Megaphone className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with Create Button */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Megaphone className="h-6 w-6" />
            Announcements & Notices
          </h2>
          <p className="text-muted-foreground">Manage announcements and notifications for users</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="h-4 w-4 mr-2" />
              Create Announcement
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingAnnouncement ? 'Edit Announcement' : 'Create New Announcement'}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  placeholder="Announcement title"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                />
              </div>

              <div>
                <Label htmlFor="content">Content *</Label>
                <Textarea
                  id="content"
                  placeholder="Announcement content"
                  value={formData.content}
                  onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                  rows={4}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="type">Type</Label>
                  <Select 
                    value={formData.type} 
                    onValueChange={(value) => setFormData(prev => ({ ...prev, type: value as 'general' | 'urgent' | 'info' }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="general">General</SelectItem>
                      <SelectItem value="urgent">Urgent</SelectItem>
                      <SelectItem value="info">Information</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="audience">Target Audience</Label>
                  <Select 
                    value={formData.targetAudience} 
                    onValueChange={(value) => setFormData(prev => ({ 
                      ...prev, 
                      targetAudience: value as 'all' | 'specific',
                      targetUsers: value === 'all' ? [] : prev.targetUsers 
                    }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Users</SelectItem>
                      <SelectItem value="specific">Specific Users</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {formData.targetAudience === 'specific' && (
                <div>
                  <Label htmlFor="users">Select Users</Label>
                  <div className="border rounded-md p-3 max-h-40 overflow-y-auto">
                    {users.map((user) => (
                      <div key={user.id} className="flex items-center space-x-2 py-1">
                        <input
                          type="checkbox"
                          id={user.id}
                          checked={formData.targetUsers.includes(user.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setFormData(prev => ({
                                ...prev,
                                targetUsers: [...prev.targetUsers, user.id]
                              }));
                            } else {
                              setFormData(prev => ({
                                ...prev,
                                targetUsers: prev.targetUsers.filter(id => id !== user.id)
                              }));
                            }
                          }}
                          className="rounded"
                        />
                        <label htmlFor={user.id} className="text-sm">
                          {user.email} ({user.name || 'Unknown'})
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-2">
                <Button 
                  variant="outline" 
                  onClick={() => setIsCreateDialogOpen(false)}
                  disabled={isProcessing}
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleCreateAnnouncement}
                  disabled={isProcessing}
                >
                  {isProcessing ? 'Processing...' : (editingAnnouncement ? 'Update' : 'Create')} Announcement
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Announcements List */}
      <div className="space-y-4">
        {announcements.length > 0 ? (
          announcements.map((announcement) => (
            <Card key={announcement.id} className={`${!announcement.isActive ? 'opacity-60' : ''}`}>
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-3">
                    {getTypeIcon(announcement.type)}
                    <div>
                      <CardTitle className="text-lg">{announcement.title}</CardTitle>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge className={getTypeColor(announcement.type)}>
                          {announcement.type}
                        </Badge>
                        <Badge variant="outline">
                          {announcement.targetAudience === 'all' ? (
                            <><Users className="h-3 w-3 mr-1" /> All Users</>
                          ) : (
                            <><User className="h-3 w-3 mr-1" /> {announcement.targetUsers?.length || 0} Users</>
                          )}
                        </Badge>
                        <Badge variant={announcement.isActive ? "default" : "secondary"}>
                          {announcement.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleToggleActive(announcement)}
                    >
                      {announcement.isActive ? 'Deactivate' : 'Activate'}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEditAnnouncement(announcement)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDeleteAnnouncement(announcement.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-2">{announcement.content}</p>
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    Created: {announcement.createdAt ? new Date(announcement.createdAt.seconds * 1000).toLocaleDateString() : 'Unknown'}
                  </span>
                  <span>By: {announcement.createdBy}</span>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Megaphone className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground text-center">No announcements created yet</p>
              <p className="text-sm text-muted-foreground text-center mt-1">
                Create your first announcement to communicate with users
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}