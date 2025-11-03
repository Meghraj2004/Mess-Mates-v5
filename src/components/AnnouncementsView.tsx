import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, db } from '@/lib/firebase';
import { 
  collection, 
  query, 
  orderBy, 
  onSnapshot
} from 'firebase/firestore';
import { 
  Megaphone, 
  Calendar, 
  User, 
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
}

export function AnnouncementsView() {
  const [user] = useAuthState(auth);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    // Query for announcements that are either for all users or specifically for this user
    const announcementsQuery = query(
      collection(db, 'announcements'),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(announcementsQuery, (snapshot) => {
      const announcementsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Announcement[];

      // Filter announcements for this user
      const userAnnouncements = announcementsData.filter(announcement => {
        if (!announcement.isActive) return false;
        
        if (announcement.targetAudience === 'all') {
          return true;
        } else if (announcement.targetAudience === 'specific') {
          return announcement.targetUsers?.includes(user.uid);
        }
        return false;
      });

      setAnnouncements(userAnnouncements);
      setLoading(false);
    }, (error) => {
      console.error('Error fetching announcements:', error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'urgent': return 'bg-red-100 text-red-800 border-red-200';
      case 'info': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'urgent': return <AlertCircle className="h-4 w-4 text-red-500" />;
      case 'info': return <CheckCircle className="h-4 w-4 text-blue-500" />;
      default: return <Megaphone className="h-4 w-4 text-gray-500" />;
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Megaphone className="h-5 w-5" />
            Announcements
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-3">
            <div className="h-4 bg-muted rounded w-3/4"></div>
            <div className="h-4 bg-muted rounded w-1/2"></div>
            <div className="h-4 bg-muted rounded w-5/6"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Megaphone className="h-5 w-5" />
          Announcements
          {announcements.length > 0 && (
            <Badge variant="secondary" className="ml-auto">
              {announcements.length}
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-80">
          {announcements.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">
              <Megaphone className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p>No announcements at the moment</p>
              <p className="text-sm">Check back later for updates</p>
            </div>
          ) : (
            <div className="space-y-4">
              {announcements.map((announcement) => (
                <div
                  key={announcement.id}
                  className={`p-4 rounded-lg border transition-all hover:shadow-md ${
                    announcement.type === 'urgent' 
                      ? 'border-red-200 bg-red-50/50' 
                      : announcement.type === 'info'
                      ? 'border-blue-200 bg-blue-50/50'
                      : 'border-gray-200 bg-gray-50/50'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {getTypeIcon(announcement.type)}
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-sm leading-none">
                          {announcement.title}
                        </h3>
                        <Badge 
                          className={getTypeColor(announcement.type)}
                          variant="outline"
                        >
                          {announcement.type}
                        </Badge>
                        {announcement.targetAudience === 'specific' && (
                          <Badge variant="outline" className="text-xs">
                            <User className="h-3 w-3 mr-1" />
                            Personal
                          </Badge>
                        )}
                      </div>
                      
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {announcement.content}
                      </p>
                      
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {announcement.createdAt?.toDate?.()?.toLocaleDateString() || 'Recently'}
                        </div>
                        <div className="flex items-center gap-1">
                          <User className="h-3 w-3" />
                          {announcement.createdBy}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}