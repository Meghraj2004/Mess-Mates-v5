import React, { useState, useEffect } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, db } from '@/lib/firebase';
import { signOut, deleteUser, createUserWithEmailAndPassword } from 'firebase/auth';
import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  getDocs,
  query,
  orderBy,
  serverTimestamp,
  setDoc,
  where
} from 'firebase/firestore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Utensils,
  Users,
  MessageSquare,
  IndianRupee,
  QrCode,
  Calendar,
  Clock,
  CheckCircle,
  LogOut,
  X,
  Plus,
  Edit,
  Trash2,
  UserCheck,
  UserX,
  DollarSign,
  AlertCircle,
  FileText,
  Download,
  TrendingUp,
  Eye,
  BarChart3,
  User,
  Settings,
  Megaphone,
  Bell
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useRealtimeMenu, useRealtimeFeedback, useRealtimeAttendance, useRealtimeLeaves, useRealtimePayments, useRealtimeUsers } from '@/hooks/useRealtimeData';
import { useNavigate } from 'react-router-dom';
import QRCodeGenerator from '@/components/QRCodeGenerator';

import { AdminNotifications } from '@/components/AdminNotifications';
import { AdminPaymentManagement } from '@/components/AdminPaymentManagement';
import { AnnouncementsManagement } from '@/components/AnnouncementsManagement';
import { format } from 'date-fns';
import { saveAs } from 'file-saver';

export default function AdminDashboard() {
  const [user] = useAuthState(auth);
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [newItem, setNewItem] = useState({
    day: '',
    mealType: '',
    items: ''
  });
  const [editingItem, setEditingItem] = useState<any>(null);
  const [qrData, setQrData] = useState('');
  const [generatingQR, setGeneratingQR] = useState(false);
  const [feedbackResponse, setFeedbackResponse] = useState('');
  const [selectedFeedback, setSelectedFeedback] = useState<any>(null);
  const [allUsers, setAllUsers] = useState<any[]>([]);
  const [newUser, setNewUser] = useState({ email: '', password: '', name: '', role: 'user' });
  const [usersLoading, setUsersLoading] = useState(false);
  const { toast } = useToast();

  // Real-time data hooks
  const { menu: menuItems, loading: menuLoading } = useRealtimeMenu();
  const { feedback, loading: feedbackLoading } = useRealtimeFeedback();
  const { attendance, loading: attendanceLoading } = useRealtimeAttendance(null);
  const { leaves, loading: leavesLoading } = useRealtimeLeaves(null);
  const { payments, loading: paymentsLoading } = useRealtimePayments(null);
  const { users: realtimeUsers, loading: realtimeUsersLoading } = useRealtimeUsers();

  // Use real-time users data
  useEffect(() => {
    setAllUsers(realtimeUsers);
    setUsersLoading(realtimeUsersLoading);
  }, [realtimeUsers, realtimeUsersLoading]);

  const generateQRCode = async () => {
    setGeneratingQR(true);
    try {
      const today = new Date();
      const qrValue = `meal-attendance-${format(today, 'yyyy-MM-dd')}-${Date.now()}`;

      await addDoc(collection(db, 'daily_qr'), {
        date: format(today, 'yyyy-MM-dd'),
        qrValue,
        mealType: 'general',
        createdAt: serverTimestamp(),
        createdBy: user?.email
      });

      setQrData(qrValue);
      toast({
        title: "QR Code Generated!",
        description: "Today's attendance QR code is ready",
      });
    } catch (error) {
      console.error('Error generating QR code:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to generate QR code",
      });
    } finally {
      setGeneratingQR(false);
    }
  };

  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newItem.day || !newItem.mealType || !newItem.items) {
      toast({
        variant: "destructive",
        title: "Missing fields",
        description: "Please fill in all fields",
      });
      return;
    }

    try {
      await addDoc(collection(db, 'weekly_menu'), {
        ...newItem,
        createdAt: serverTimestamp(),
        createdBy: user?.email
      });

      setNewItem({ day: '', mealType: '', items: '' });

      toast({
        title: "Menu item added",
        description: "New menu item has been added successfully",
      });
    } catch (error) {
      console.error('Error adding menu item:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to add menu item",
      });
    }
  };

  const handleUpdateItem = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!editingItem || !editingItem.day || !editingItem.mealType || !editingItem.items) {
      toast({
        variant: "destructive",
        title: "Missing fields",
        description: "Please fill in all fields",
      });
      return;
    }

    try {
      const itemRef = doc(db, 'weekly_menu', editingItem.id);
      await updateDoc(itemRef, {
        day: editingItem.day,
        mealType: editingItem.mealType,
        items: editingItem.items,
        updatedAt: serverTimestamp()
      });

      setEditingItem(null);

      toast({
        title: "Menu item updated",
        description: "Menu item has been updated successfully",
      });
    } catch (error) {
      console.error('Error updating menu item:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update menu item",
      });
    }
  };

  const handleDeleteItem = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'weekly_menu', id));

      toast({
        title: "Menu item deleted",
        description: "Menu item has been deleted successfully",
      });
    } catch (error) {
      console.error('Error deleting menu item:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete menu item",
      });
    }
  };

  const handleFeedbackResponse = async (feedbackId: string, status: string, response?: string) => {
    try {
      const feedbackRef = doc(db, 'feedback', feedbackId);
      await updateDoc(feedbackRef, {
        status,
        adminResponse: response || '',
        respondedAt: serverTimestamp(),
        respondedBy: user?.email
      });

      setSelectedFeedback(null);
      setFeedbackResponse('');

      toast({
        title: "Feedback Updated",
        description: `Feedback marked as ${status}`,
      });
    } catch (error) {
      console.error('Error updating feedback:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update feedback",
      });
    }
  };

  const handleLeaveResponse = async (leaveId: string, status: string) => {
    try {
      const leaveRef = doc(db, 'leave_requests', leaveId);
      await updateDoc(leaveRef, {
        status,
        respondedAt: serverTimestamp(),
        respondedBy: user?.email
      });

      toast({
        title: "Leave Request Updated",
        description: `Leave request ${status}`,
      });
    } catch (error) {
      console.error('Error updating leave request:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update leave request",
      });
    }
  };

  const exportAttendanceData = () => {
    if (attendance.length === 0) {
      toast({
        variant: "destructive",
        title: "No Data",
        description: "No attendance data to export",
      });
      return;
    }

    const csvData = attendance.map(record => ({
      Date: format(new Date(record.timestamp?.seconds * 1000 || record.timestamp), 'yyyy-MM-dd'),
      Time: format(new Date(record.timestamp?.seconds * 1000 || record.timestamp), 'HH:mm:ss'),
      Email: record.userEmail,
      MealType: record.mealType || 'general'
    }));

    const csvContent = [
      Object.keys(csvData[0]).join(','),
      ...csvData.map(row => Object.values(row).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    saveAs(blob, `attendance-data-${format(new Date(), 'yyyy-MM-dd')}.csv`);

    toast({
      title: "Data Exported",
      description: "Attendance data has been downloaded",
    });
  };

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newUser.email || !newUser.password || !newUser.name) {
      toast({
        variant: "destructive",
        title: "Missing fields",
        description: "Please fill in all fields",
      });
      return;
    }

    try {
      // Create user in Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, newUser.email, newUser.password);

      // Add user data to Firestore
      await setDoc(doc(db, 'users', userCredential.user.uid), {
        email: newUser.email,
        name: newUser.name,
        role: newUser.role,
        createdAt: serverTimestamp(),
        createdBy: user?.email
      });

      setNewUser({ email: '', password: '', name: '', role: 'user' });

      // Refresh users list
      const usersSnapshot = await getDocs(collection(db, 'users'));
      const users = usersSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setAllUsers(users);

      toast({
        title: "User added",
        description: "New user has been created successfully",
      });
    } catch (error: any) {
      console.error('Error adding user:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to add user",
      });
    }
  };

  const handleDeleteUser = async (userId: string, userEmail: string) => {
    const ADMIN_EMAILS = [
      'megharajdandgavhal2004@gmail.com',
      'sohamk5404@gmail.com',
      'dandgavhalchetan20@gmail.com',
      'priyankachitte2005@gmail.com'
    ];

    if (ADMIN_EMAILS.includes(userEmail)) {
      toast({
        variant: "destructive",
        title: "Cannot delete admin",
        description: "Cannot delete admin users",
      });
      return;
    }

    try {
      // Delete user document from Firestore
      await deleteDoc(doc(db, 'users', userId));

      // Refresh users list
      const usersSnapshot = await getDocs(collection(db, 'users'));
      const users = usersSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setAllUsers(users);

      toast({
        title: "User deleted",
        description: "User has been deleted successfully",
      });
    } catch (error) {
      console.error('Error deleting user:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete user",
      });
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      toast({
        title: "Logged out successfully",
        description: "See you next time!",
      });
      navigate('/login');
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Logout failed",
        description: "Please try again",
      });
    }
  };

  // Calculate real-time stats
  const activeUsers = allUsers.length; // Total registered users
  const uniqueAttendanceUsers = new Set(attendance.map(record => record.userId)).size; // Users who have attended
  const pendingFeedbacks = feedback.filter(f => f.status === 'pending').length;
  const pendingLeaves = leaves.filter(l => l.status === 'pending').length;
  const pendingPayments = payments.filter(p => p.status === 'pending').length;
  
  // Fix revenue calculations - use 'verified' status instead of 'paid'
  const totalRevenue = payments.filter(p => p.status === 'verified' || p.status === 'paid').reduce((sum, p) => sum + p.amount, 0);
  const currentMonth = new Date().toLocaleString('default', { month: 'long', year: 'numeric' });
  const monthlyRevenue = payments.filter(p => 
    (p.status === 'verified' || p.status === 'paid') && p.month === currentMonth
  ).reduce((sum, p) => sum + p.amount, 0);

  const handlePaymentVerification = async (paymentId: string, status: 'paid' | 'rejected') => {
    try {
      const paymentRef = doc(db, 'payments', paymentId);
      await updateDoc(paymentRef, {
        status,
        verifiedAt: serverTimestamp(),
        verifiedBy: user?.email
      });

      toast({
        title: "Payment Updated",
        description: `Payment ${status === 'paid' ? 'verified' : 'rejected'} successfully`,
      });
    } catch (error) {
      console.error('Error updating payment:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update payment",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/5">
      {/* Mobile-Responsive Header */}
      <header className="bg-background/80 backdrop-blur-sm border-b shadow-card sticky top-0 z-50">
        <div className="container mx-auto px-3 sm:px-4 py-3 sm:py-4">
          {/* Top Row - Logo and Title */}
          <div className="flex justify-between items-center mb-2 sm:mb-0">
            <div className="flex items-center gap-2">
              <Utensils className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
              <img src="/assets/Logo.png" alt="MessMate" className="h-6 w-6 sm:h-8 sm:w-8" />
              <span className="font-bold text-base sm:text-xl">MessMates</span>
            </div>
            <span className="hidden sm:inline-block font-bold text-base sm:text-xl border-2 border-primary rounded-md px-2 py-1">
              Admin Dashboard
            </span>
            
            {/* Mobile Menu Icon */}
            <div className="sm:hidden flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate('/profile')}
                className="p-2"
              >
                <User className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleLogout}
                className="p-2"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Bottom Row - User Info and Buttons (Desktop) */}
          <div className="hidden sm:flex items-center justify-between gap-4">
            <span className="text-sm sm:text-base font-bold text-primary bg-primary/10 px-3 py-1 rounded-lg shadow-sm border border-primary/30 truncate max-w-xs">
              Welcome, <span className="text-primary truncate">{user?.email}</span>
            </span>           
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate('/profile')}
                className="relative overflow-hidden border-2 border-primary text-primary font-semibold px-4 py-2 rounded-md transition-all duration-300 group hover:bg-primary hover:text-white hover:scale-105 shadow-md"
              >
                <span className="absolute inset-0 bg-primary opacity-0 group-hover:opacity-20 transition-opacity duration-300 rounded-md"></span>
                <User className="h-4 w-4 mr-2 transition-transform duration-300 group-hover:rotate-[-20deg] group-hover:scale-125" />
                <span className="relative z-10">Profile</span>
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={handleLogout}
                className="relative overflow-hidden border-2 border-primary text-primary font-semibold px-4 py-2 rounded-md transition-all duration-300 group hover:bg-primary hover:text-white hover:scale-105 shadow-md"
              >
                <span className="absolute inset-0 bg-primary opacity-0 group-hover:opacity-20 transition-opacity duration-300 rounded-md"></span>
                <LogOut className="h-4 w-4 mr-2 transition-transform duration-300 group-hover:rotate-[-20deg] group-hover:scale-125" />
                <span className="relative z-10">Logout</span>
              </Button>
            </div>
          </div>
          
          {/* Mobile Welcome Text */}
          <div className="sm:hidden mt-2">
            <span className="text-xs font-semibold text-primary">Admin Dashboard</span>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-3 sm:px-4 py-4 sm:py-8">
        {/* Mobile-Responsive Stats Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 sm:gap-6 mb-6 sm:mb-8">
          <Card className="bg-gradient-card shadow-card border-0 hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-3 sm:p-4">
              <CardTitle className="text-xs sm:text-sm font-medium">Active Users</CardTitle>
              <Users className="h-3 w-3 sm:h-4 sm:w-4 text-primary" />
            </CardHeader>
            <CardContent className="p-3 sm:p-4 pt-0">
              <div className="text-xl sm:text-2xl font-bold text-primary">{activeUsers}</div>
              <p className="text-[10px] sm:text-xs text-muted-foreground">registered users</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-card shadow-card border-0 hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-3 sm:p-4">
              <CardTitle className="text-xs sm:text-sm font-medium">Monthly Revenue</CardTitle>
              <IndianRupee className="h-3 w-3 sm:h-4 sm:w-4 text-green-500" />
            </CardHeader>
            <CardContent className="p-3 sm:p-4 pt-0">
              <div className="text-xl sm:text-2xl font-bold text-green-500">₹{monthlyRevenue.toLocaleString()}</div>
              <p className="text-[10px] sm:text-xs text-muted-foreground">this month</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-card shadow-card border-0 hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-3 sm:p-4">
              <CardTitle className="text-xs sm:text-sm font-medium">Pending Payments</CardTitle>
              <DollarSign className="h-3 w-3 sm:h-4 sm:w-4 text-orange-500" />
            </CardHeader>
            <CardContent className="p-3 sm:p-4 pt-0">
              <div className="text-xl sm:text-2xl font-bold text-orange-500">{pendingPayments}</div>
              <p className="text-[10px] sm:text-xs text-muted-foreground">need verification</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-card shadow-card border-0 hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-3 sm:p-4">
              <CardTitle className="text-xs sm:text-sm font-medium">Pending Feedbacks</CardTitle>
              <MessageSquare className="h-3 w-3 sm:h-4 sm:w-4 text-destructive" />
            </CardHeader>
            <CardContent className="p-3 sm:p-4 pt-0">
              <div className="text-xl sm:text-2xl font-bold text-destructive">{pendingFeedbacks}</div>
              <p className="text-[10px] sm:text-xs text-muted-foreground">need response</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-card shadow-card border-0 hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-3 sm:p-4">
              <CardTitle className="text-xs sm:text-sm font-medium">Pending Leaves</CardTitle>
              <Calendar className="h-3 w-3 sm:h-4 sm:w-4 text-yellow-500" />
            </CardHeader>
            <CardContent className="p-3 sm:p-4 pt-0">
              <div className="text-xl sm:text-2xl font-bold text-yellow-500">{pendingLeaves}</div>
              <p className="text-[10px] sm:text-xs text-muted-foreground">need approval</p>
            </CardContent>
          </Card>
        </div>

        {/* Mobile-Responsive Admin Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4 sm:space-y-6">
          {/* Mobile: Dropdown-style tabs */}
          <div className="block sm:hidden">
            <Select value={activeTab} onValueChange={setActiveTab}>
              <SelectTrigger className="w-full h-12 text-left border-2 border-primary/20 hover:border-primary/40 focus:border-primary bg-background/50">
                <SelectValue placeholder="Select section">
                  {activeTab === 'overview' && '📊 Overview'}
                  {activeTab === 'menu' && '🍽️ Menu Management'}
                  {activeTab === 'users' && '👥 User Management'}
                  {activeTab === 'payments' && '💰 Payment Verification'}
                  {activeTab === 'qr' && '📱 QR Code Scanner'}
                  {activeTab === 'attendance' && '📈 Attendance Reports'}
                  {activeTab === 'feedback' && '💬 Feedback Management'}
                  {activeTab === 'leaves' && '📅 Leave Requests'}
                  {activeTab === 'announcements' && '📢 Announcements'}
                </SelectValue>
              </SelectTrigger>
              <SelectContent className="w-full">
                <SelectItem value="overview">📊 Overview</SelectItem>
                <SelectItem value="menu">🍽️ Menu Management</SelectItem>
                <SelectItem value="users">👥 User Management</SelectItem>
                <SelectItem value="payments">💰 Payment Verification</SelectItem>
                <SelectItem value="qr">📱 QR Code Scanner</SelectItem>
                <SelectItem value="attendance">📈 Attendance Reports</SelectItem>
                <SelectItem value="feedback">💬 Feedback Management</SelectItem>
                <SelectItem value="leaves">📅 Leave Requests</SelectItem>
                <SelectItem value="announcements">📢 Announcements</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Desktop: Original grid layout with scroll */}
          <div className="hidden sm:block overflow-x-auto scrollbar-hide">
            <TabsList className="grid w-full grid-cols-9 min-w-[800px] h-12">
              <TabsTrigger value="overview" className="text-xs lg:text-sm h-10 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                Overview
              </TabsTrigger>
              <TabsTrigger value="menu" className="flex items-center gap-1 text-xs lg:text-sm h-10 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                <Utensils className="h-3 w-3 lg:h-4 lg:w-4" />
                <span className="hidden lg:inline">Menu</span>
              </TabsTrigger>
              <TabsTrigger value="users" className="flex items-center gap-1 text-xs lg:text-sm h-10 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                <Users className="h-3 w-3 lg:h-4 lg:w-4" />
                <span className="hidden lg:inline">Users</span>
              </TabsTrigger>
              <TabsTrigger value="payments" className="flex items-center gap-1 text-xs lg:text-sm h-10 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                <IndianRupee className="h-3 w-3 lg:h-4 lg:w-4" />
                <span className="hidden lg:inline">Payments</span>
              </TabsTrigger>
              <TabsTrigger value="qr" className="flex items-center gap-1 text-xs lg:text-sm h-10 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                <QrCode className="h-3 w-3 lg:h-4 lg:w-4" />
                <span className="hidden lg:inline">QR</span>
              </TabsTrigger>
              <TabsTrigger value="attendance" className="flex items-center gap-1 text-xs lg:text-sm h-10 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                <BarChart3 className="h-3 w-3 lg:h-4 lg:w-4" />
                <span className="hidden lg:inline">Attendance</span>
              </TabsTrigger>
              <TabsTrigger value="feedback" className="flex items-center gap-1 text-xs lg:text-sm h-10 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                <MessageSquare className="h-3 w-3 lg:h-4 lg:w-4" />
                <span className="hidden lg:inline">Feedback</span>
              </TabsTrigger>
              <TabsTrigger value="leaves" className="flex items-center gap-1 text-xs lg:text-sm h-10 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                <Calendar className="h-3 w-3 lg:h-4 lg:w-4" />
                <span className="hidden lg:inline">Leaves</span>
              </TabsTrigger>
              <TabsTrigger value="announcements" className="flex items-center gap-1 text-xs lg:text-sm h-10 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                <Megaphone className="h-3 w-3 lg:h-4 lg:w-4" />
                <span className="hidden lg:inline">Comms</span>
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid gap-3 sm:gap-4 grid-cols-2 lg:grid-cols-4">
              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-3 sm:p-4">
                  <CardTitle className="text-xs sm:text-sm font-medium">Total Users</CardTitle>
                  <Users className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent className="p-3 sm:p-4 pt-0">
                  <div className="text-xl sm:text-2xl font-bold">{allUsers.length}</div>
                </CardContent>
              </Card>
              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-3 sm:p-4">
                  <CardTitle className="text-xs sm:text-sm font-medium">Today's Attendance</CardTitle>
                  <Calendar className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent className="p-3 sm:p-4 pt-0">
                  <div className="text-xl sm:text-2xl font-bold">{attendance.filter(a => {
                    const today = new Date().toISOString().split('T')[0];
                    return a.date === today || (a.timestamp && new Date(a.timestamp.seconds * 1000).toISOString().split('T')[0] === today);
                  }).length}</div>
                </CardContent>
              </Card>
              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-3 sm:p-4">
                  <CardTitle className="text-xs sm:text-sm font-medium">Pending Leaves</CardTitle>
                  <Clock className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent className="p-3 sm:p-4 pt-0">
                  <div className="text-xl sm:text-2xl font-bold">{pendingLeaves}</div>
                </CardContent>
              </Card>
              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-3 sm:p-4">
                  <CardTitle className="text-xs sm:text-sm font-medium">Total Revenue</CardTitle>
                  <IndianRupee className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent className="p-3 sm:p-4 pt-0">
                  <div className="text-xl sm:text-2xl font-bold">₹{totalRevenue.toLocaleString()}</div>
                </CardContent>
              </Card>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <AdminNotifications />
            </div>
          </TabsContent>

          <TabsContent value="menu">
            <div className="space-y-4 sm:space-y-6">
              {/* Add New Menu Item */}
              <Card className="bg-gradient-card shadow-elegant border-0">
                <CardHeader className="p-4 sm:p-6">
                  <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                    <Plus className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                    {editingItem ? 'Edit Menu Item' : 'Add Menu Item'}
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 sm:p-6 pt-0">
                  <form onSubmit={editingItem ? handleUpdateItem : handleAddItem} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="day" className="text-sm">Day</Label>
                        <Select
                          value={editingItem ? editingItem.day : newItem.day}
                          onValueChange={(value) => editingItem ? setEditingItem({ ...editingItem, day: value }) : setNewItem(prev => ({ ...prev, day: value }))}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select day" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Monday">Monday</SelectItem>
                            <SelectItem value="Tuesday">Tuesday</SelectItem>
                            <SelectItem value="Wednesday">Wednesday</SelectItem>
                            <SelectItem value="Thursday">Thursday</SelectItem>
                            <SelectItem value="Friday">Friday</SelectItem>
                            <SelectItem value="Saturday">Saturday</SelectItem>
                            <SelectItem value="Sunday">Sunday</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="mealType">Meal Type</Label>
                        <Select
                          value={editingItem ? editingItem.mealType : newItem.mealType}
                          onValueChange={(value) => editingItem ? setEditingItem({ ...editingItem, mealType: value }) : setNewItem(prev => ({ ...prev, mealType: value }))}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select meal type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Breakfast">Breakfast</SelectItem>
                            <SelectItem value="Lunch">Lunch</SelectItem>
                            <SelectItem value="Dinner">Dinner</SelectItem>
                            <SelectItem value="Snack">Snack</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="items">Menu Items</Label>
                        <Input
                          id="items"
                          value={editingItem ? editingItem.items : newItem.items}
                          onChange={(e) => editingItem ? setEditingItem({ ...editingItem, items: e.target.value }) : setNewItem(prev => ({ ...prev, items: e.target.value }))}
                          placeholder="e.g., Rice, Dal, Vegetables"
                          required
                        />
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button type="submit" disabled={menuLoading}>
                        {editingItem ? 'Update Item' : 'Add Item'}
                      </Button>
                      {editingItem && (
                        <Button type="button" variant="outline" onClick={() => setEditingItem(null)}>
                          Cancel
                        </Button>
                      )}
                    </div>
                  </form>
                </CardContent>
              </Card>

              {/* Menu Items List */}
              <Card className="bg-gradient-card shadow-elegant border-0">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Utensils className="h-5 w-5 text-primary" />
                    Menu Items ({menuItems.length} items)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {menuItems.length > 0 ? (
                    <div className="space-y-4">
                      {menuItems.map((item) => (
                        <div key={item.id} className="border rounded-lg p-4 bg-background/50">
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                <h3 className="font-semibold">{item.day}</h3>
                                <Badge variant="secondary">{item.mealType}</Badge>
                              </div>
                              <p className="text-muted-foreground">{item.items}</p>
                            </div>
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => setEditingItem(item)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => handleDeleteItem(item.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Utensils className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">No menu items added yet</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="users">
            <div className="space-y-6">
              {/* Add New User */}
              <Card className="bg-gradient-card shadow-elegant border-0">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Plus className="h-5 w-5 text-primary" />
                    Add New User
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleAddUser} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                          id="email"
                          type="email"
                          value={newUser.email}
                          onChange={(e) => setNewUser(prev => ({ ...prev, email: e.target.value }))}
                          placeholder="user@example.com"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="password">Password</Label>
                        <Input
                          id="password"
                          type="password"
                          value={newUser.password}
                          onChange={(e) => setNewUser(prev => ({ ...prev, password: e.target.value }))}
                          placeholder="Enter password"
                          required
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">Name</Label>
                        <Input
                          id="name"
                          value={newUser.name}
                          onChange={(e) => setNewUser(prev => ({ ...prev, name: e.target.value }))}
                          placeholder="Full name"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="role">Role</Label>
                        <Select value={newUser.role} onValueChange={(value) => setNewUser(prev => ({ ...prev, role: value }))}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="user">User</SelectItem>
                            <SelectItem value="admin">Admin</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <Button type="submit" disabled={usersLoading}>
                      Add User
                    </Button>
                  </form>
                </CardContent>
              </Card>

              {/* Users List */}
              <Card className="bg-gradient-card shadow-elegant border-0">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-primary" />
                    All Users ({allUsers.length} users)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {allUsers.length > 0 ? (
                    <div className="space-y-4">
                      {allUsers.map((userItem) => (
                        <div key={userItem.id} className="border rounded-lg p-4 bg-background/50">
                          <div className="flex justify-between items-center">
                            <div>
                              <h3 className="font-semibold">{userItem.name || userItem.email}</h3>
                              <p className="text-sm text-muted-foreground">{userItem.email}</p>
                              <Badge variant="outline" className="mt-1">
                                {userItem.role || 'user'}
                              </Badge>
                            </div>
                            {!['megharajdandgavhal2004@gmail.com', 'sohamk5404@gmail.com', 'dandgavhalchetan20@gmail.com', 'priyankachitte2005@gmail.com'].includes(userItem.email) && (
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => handleDeleteUser(userItem.id, userItem.email)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">No users found</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="payments">
            <AdminPaymentManagement />
          </TabsContent>

          <TabsContent value="qr">
            <QRCodeGenerator
              onGenerate={generateQRCode}
              qrData={qrData}
              isGenerating={generatingQR}
            />
          </TabsContent>

          <TabsContent value="attendance">
            <Card className="bg-gradient-card shadow-elegant border-0">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5 text-primary" />
                    Attendance Records ({attendance.length} records)
                  </CardTitle>
                  <Button onClick={exportAttendanceData} variant="outline">
                    <Download className="h-4 w-4 mr-2" />
                    Export Data
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {attendance.length > 0 ? (
                  <div className="space-y-4">
                    {attendance.slice(0, 50).map((record) => (
                      <div key={record.id} className="border rounded-lg p-4 bg-background/50">
                        <div className="flex justify-between items-center">
                          <div>
                            <h3 className="font-semibold">{record.userEmail}</h3>
                            <p className="text-sm text-muted-foreground">
                              {format(new Date(record.timestamp?.seconds * 1000 || record.timestamp), 'MMM dd, yyyy hh:mm a')}
                            </p>
                          </div>
                          <Badge variant="outline">
                            {record.mealType || 'General'}
                          </Badge>
                        </div>
                      </div>
                    ))}
                    {attendance.length > 50 && (
                      <p className="text-center text-muted-foreground text-sm">
                        Showing latest 50 records. Export for complete data.
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No attendance records yet</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="feedback">
            <Card className="bg-gradient-card shadow-elegant border-0">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5 text-primary" />
                  Feedback Management ({feedback.length} feedback)
                </CardTitle>
              </CardHeader>
              <CardContent>
                {feedback.length > 0 ? (
                  <div className="space-y-4">
                    {feedback.map((item) => (
                      <div key={item.id} className="border rounded-lg p-4 bg-background/50">
                        <div className="flex justify-between items-start mb-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <Badge variant={
                                item.status === 'resolved' ? 'default' :
                                  item.status === 'pending' ? 'secondary' : 'destructive'
                              }>
                                {item.status}
                              </Badge>
                              <span className="text-sm text-muted-foreground">
                                {item.rating}/5 stars
                              </span>
                            </div>
                            <p className="font-medium mb-1">{item.userEmail}</p>
                            <p className="text-sm text-muted-foreground mb-2">{item.feedback}</p>
                            {item.adminResponse && (
                              <div className="mt-2 p-2 bg-muted/50 rounded">
                                <p className="text-sm"><strong>Admin Response:</strong> {item.adminResponse}</p>
                              </div>
                            )}
                          </div>
                          {item.status === 'pending' && (
                            <div className="flex gap-2 ml-4">
                              <Button
                                size="sm"
                                onClick={() => setSelectedFeedback(item)}
                                variant="outline"
                              >
                                <MessageSquare className="h-4 w-4 mr-1" />
                                Respond
                              </Button>
                              <Button
                                size="sm"
                                onClick={() => handleFeedbackResponse(item.id, 'resolved')}
                                className="bg-green-600 hover:bg-green-700"
                              >
                                <CheckCircle className="h-4 w-4 mr-1" />
                                Resolve
                              </Button>
                            </div>
                          )}
                        </div>
                        {item.createdAt && (
                          <p className="text-xs text-muted-foreground">
                            Submitted on {format(new Date(item.createdAt.seconds * 1000), 'MMM dd, yyyy hh:mm a')}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No feedback received yet</p>
                  </div>
                )}

                {/* Feedback Response Dialog */}
                {selectedFeedback && (
                  <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
                    <Card className="max-w-md w-full">
                      <CardHeader>
                        <CardTitle>Respond to Feedback</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div>
                          <p className="text-sm text-muted-foreground mb-2">Original feedback:</p>
                          <p className="text-sm">{selectedFeedback.feedback}</p>
                        </div>
                        <div>
                          <Label htmlFor="response">Your Response</Label>
                          <Textarea
                            id="response"
                            value={feedbackResponse}
                            onChange={(e) => setFeedbackResponse(e.target.value)}
                            placeholder="Enter your response..."
                            rows={3}
                          />
                        </div>
                        <div className="flex gap-2">
                          <Button
                            onClick={() => handleFeedbackResponse(selectedFeedback.id, 'resolved', feedbackResponse)}
                            disabled={!feedbackResponse.trim()}
                          >
                            Send Response
                          </Button>
                          <Button
                            variant="outline"
                            onClick={() => {
                              setSelectedFeedback(null);
                              setFeedbackResponse('');
                            }}
                          >
                            Cancel
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="leaves">
            <Card className="bg-gradient-card shadow-elegant border-0">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-primary" />
                  Leave Requests ({leaves.length} total)
                </CardTitle>
              </CardHeader>
              <CardContent>
                {leaves.length > 0 ? (
                  <div className="space-y-4">
                    {leaves.map((leave) => (
                      <div key={leave.id} className="border rounded-lg p-4 bg-background/50">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-semibold">
                                {format(new Date(leave.startDate), 'MMM dd')} - {format(new Date(leave.endDate), 'MMM dd, yyyy')}
                              </h4>
                              <Badge variant={
                                leave.status === 'approved' ? 'default' :
                                  leave.status === 'rejected' ? 'destructive' : 'secondary'
                              }>
                                {leave.status}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">{leave.userEmail}</p>
                            <p className="text-sm">Meal Type: {leave.mealType}</p>
                          </div>
                          {leave.status === 'pending' && (
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                onClick={() => handleLeaveResponse(leave.id, 'approved')}
                                className="bg-green-600 hover:bg-green-700"
                              >
                                <CheckCircle className="h-4 w-4 mr-1" />
                                Approve
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => handleLeaveResponse(leave.id, 'rejected')}
                              >
                                <X className="h-4 w-4 mr-1" />
                                Reject
                              </Button>
                            </div>
                          )}
                        </div>
                        <p className="text-sm mb-2">
                          <span className="font-medium">Reason:</span> {leave.reason}
                        </p>
                        {leave.createdAt && (
                          <p className="text-xs text-muted-foreground">
                            Requested on {format(new Date(leave.createdAt.seconds * 1000), 'MMM dd, yyyy hh:mm a')}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No leave requests yet</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="announcements">
            <AnnouncementsManagement />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}