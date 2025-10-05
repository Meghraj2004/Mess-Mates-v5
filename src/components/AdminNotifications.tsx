import { useState } from 'react';
import { Bell, Send, Users, User, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, db } from '@/lib/firebase';
import { collection, addDoc, Timestamp, getDocs } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { createNotification } from './NotificationsPanel';

export const AdminNotifications = () => {
  const [user] = useAuthState(auth);
  const [notification, setNotification] = useState({
    title: '',
    message: '',
    type: 'general' as 'leave_approved' | 'leave_rejected' | 'payment_due' | 'announcement' | 'general',
    recipient: 'all' as 'all' | 'specific',
    recipientEmail: ''
  });
  const [sending, setSending] = useState(false);
  const { toast } = useToast();

  const handleSendNotification = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !notification.title || !notification.message) return;

    setSending(true);
    try {
      if (notification.recipient === 'all') {
        // Get all users and send notification to each
        const usersSnapshot = await getDocs(collection(db, 'users'));
        const users = usersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        // Create notifications for all users
        const notificationPromises = users.map(userData =>
          createNotification(
            userData.id,
            notification.type,
            notification.title,
            notification.message
          )
        );

        await Promise.all(notificationPromises);
        
        toast({
          title: "Notifications Sent!",
          description: `Sent to ${users.length} users successfully`,
        });
      } else {
        // Send to specific user
        const usersSnapshot = await getDocs(collection(db, 'users'));
        const targetUser = usersSnapshot.docs.find(doc => 
          doc.data().email === notification.recipientEmail
        );

        if (targetUser) {
          await createNotification(
            targetUser.id,
            notification.type,
            notification.title,
            notification.message
          );
          
          toast({
            title: "Notification Sent!",
            description: `Sent to ${notification.recipientEmail} successfully`,
          });
        } else {
          toast({
            title: "User Not Found",
            description: "Could not find user with that email",
            variant: "destructive",
          });
        }
      }

      // Reset form
      setNotification({
        title: '',
        message: '',
        type: 'general',
        recipient: 'all',
        recipientEmail: ''
      });
    } catch (error) {
      console.error('Error sending notification:', error);
      toast({
        title: "Error",
        description: "Failed to send notification",
        variant: "destructive",
      });
    } finally {
      setSending(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-5 w-5" />
          Send Notifications
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSendNotification} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={notification.title}
                onChange={(e) => setNotification(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Notification title"
                required
              />
            </div>
            
            <div>
              <Label htmlFor="type">Type</Label>
              <Select 
                value={notification.type} 
                onValueChange={(value: any) => setNotification(prev => ({ ...prev, type: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="general">General</SelectItem>
                  <SelectItem value="announcement">Announcement</SelectItem>
                  <SelectItem value="payment_due">Payment Due</SelectItem>
                  <SelectItem value="leave_approved">Leave Approved</SelectItem>
                  <SelectItem value="leave_rejected">Leave Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="message">Message</Label>
            <Textarea
              id="message"
              value={notification.message}
              onChange={(e) => setNotification(prev => ({ ...prev, message: e.target.value }))}
              placeholder="Notification message"
              rows={3}
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="recipient">Send To</Label>
              <Select 
                value={notification.recipient} 
                onValueChange={(value: any) => setNotification(prev => ({ ...prev, recipient: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      All Users
                    </div>
                  </SelectItem>
                  <SelectItem value="specific">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      Specific User
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {notification.recipient === 'specific' && (
              <div>
                <Label htmlFor="recipientEmail">User Email</Label>
                <Input
                  id="recipientEmail"
                  type="email"
                  value={notification.recipientEmail}
                  onChange={(e) => setNotification(prev => ({ ...prev, recipientEmail: e.target.value }))}
                  placeholder="user@example.com"
                  required
                />
              </div>
            )}
          </div>

          <Button type="submit" disabled={sending} className="w-full">
            {sending ? (
              <>
                <AlertCircle className="h-4 w-4 mr-2 animate-spin" />
                Sending...
              </>
            ) : (
              <>
                <Send className="h-4 w-4 mr-2" />
                Send Notification
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};