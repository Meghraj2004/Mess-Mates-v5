import { useState, useEffect } from 'react';
import { Bell, X, Check, Clock, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, db } from '@/lib/firebase';
import { collection, query, where, orderBy, onSnapshot, doc, updateDoc, addDoc, Timestamp } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';

interface Notification {
  id: string;
  userId: string;
  type: 'leave_approved' | 'leave_rejected' | 'payment_due' | 'announcement' | 'general';
  title: string;
  message: string;
  read: boolean;
  createdAt: any;
  data?: any;
}

export const NotificationsPanel = () => {
  const [user] = useAuthState(auth);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, 'notifications'),
      where('userId', '==', user.uid)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const notificationsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Notification[];
      
      // Sort by createdAt in descending order (newest first)
      const sortedNotifications = notificationsData.sort((a, b) => {
        const aTime = a.createdAt?.seconds || 0;
        const bTime = b.createdAt?.seconds || 0;
        return bTime - aTime;
      });
      
      setNotifications(sortedNotifications);
      setLoading(false);
    }, (error) => {
      console.error('Error fetching notifications:', error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  const markAsRead = async (notificationId: string) => {
    try {
      await updateDoc(doc(db, 'notifications', notificationId), {
        read: true
      });
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'leave_approved':
        return <Check className="h-4 w-4 text-green-500" />;
      case 'leave_rejected':
        return <X className="h-4 w-4 text-red-500" />;
      case 'payment_due':
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      case 'announcement':
        return <Bell className="h-4 w-4 text-blue-500" />;
      default:
        return <Bell className="h-4 w-4 text-gray-500" />;
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notifications
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-2">
            <div className="h-4 bg-muted rounded w-3/4"></div>
            <div className="h-4 bg-muted rounded w-1/2"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-5 w-5" />
          Notifications
          {unreadCount > 0 && (
            <Badge variant="destructive" className="ml-auto">
              {unreadCount}
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-80">
          {notifications.length === 0 ? (
            <div className="text-center text-muted-foreground py-4">
              No notifications yet
            </div>
          ) : (
            <div className="space-y-3">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-3 rounded-lg border transition-colors ${
                    !notification.read 
                      ? 'bg-muted/50 border-primary/20' 
                      : 'bg-background border-border'
                  }`}
                  onClick={() => !notification.read && markAsRead(notification.id)}
                >
                  <div className="flex items-start gap-3">
                    {getNotificationIcon(notification.type)}
                    <div className="flex-1 space-y-1">
                      <p className="text-sm font-medium leading-none">
                        {notification.title}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {notification.message}
                      </p>
                       <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        {notification.createdAt?.seconds 
                          ? new Date(notification.createdAt.seconds * 1000).toLocaleString()
                          : notification.createdAt?.toDate?.()?.toLocaleString() || 'Just now'}
                      </div>
                    </div>
                    {!notification.read && (
                      <div className="w-2 h-2 bg-primary rounded-full"></div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

// Helper function to create notifications (can be used by other components)
export const createNotification = async (
  userId: string,
  type: string,
  title: string,
  message: string,
  data?: any
) => {
  try {
    await addDoc(collection(db, 'notifications'), {
      userId,
      type,
      title,
      message,
      read: false,
      createdAt: Timestamp.now(),
      data: data || null
    });
  } catch (error) {
    console.error('Error creating notification:', error);
  }
};