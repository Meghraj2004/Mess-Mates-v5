import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { 
  collection, 
  addDoc, 
  serverTimestamp, 
  query, 
 
  getDocs,
  updateDoc,
  doc,
  onSnapshot
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { 
  Users, 
  CreditCard, 
  Banknote, 
  CheckCircle, 
  Clock, 
  History,
  IndianRupee,
  User,
  Calendar
} from 'lucide-react';

interface User {
  id: string;
  email: string;
  name?: string;
  displayName?: string;
}

interface Payment {
  id: string;
  userId: string;
  userEmail: string;
  userName: string;
  amount: number;
  paymentMethod: 'online' | 'offline';
  transactionId?: string;
  status: 'pending' | 'verified' | 'rejected';
  createdAt: any;
  verifiedAt?: any;
  verifiedBy?: string;
  month: string;
}

export function AdminPaymentManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [isOfflineDialogOpen, setIsOfflineDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [offlineAmount, setOfflineAmount] = useState('');
  const [isProcessing, setIsProcessing] = useState<string | null>(null);
  const [showAllPayments, setShowAllPayments] = useState(false);
  const { toast } = useToast();

  // Load users and payments
  useEffect(() => {
    loadUsers();
    
    // Real-time payments listener
    const paymentsQuery = query(collection(db, 'payments'));
    const unsubscribe = onSnapshot(paymentsQuery, (snapshot) => {
      const paymentsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Payment[];
      setPayments(paymentsData.sort((a, b) => 
        b.createdAt?.seconds - a.createdAt?.seconds
      ));
    });

    return () => unsubscribe();
  }, []);

  const loadUsers = async () => {
    try {
      const usersQuery = query(collection(db, 'users'));
      const querySnapshot = await getDocs(usersQuery);
      const usersData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as User[];
      setUsers(usersData);
    } catch (error) {
      console.error('Error loading users:', error);
    }
  };

  const handleOfflinePayment = async () => {
    if (!selectedUser || !offlineAmount.trim()) {
      toast({
        title: "Error",
        description: "Please select user and enter amount",
        variant: "destructive",
      });
      return;
    }

    const amount = parseFloat(offlineAmount);
    if (isNaN(amount) || amount <= 0) {
      toast({
        title: "Error", 
        description: "Please enter a valid amount",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing('offline');

    try {
      await addDoc(collection(db, 'payments'), {
        userId: selectedUser.id,
        userEmail: selectedUser.email,
        userName: selectedUser.displayName || selectedUser.name || 'Unknown',
        amount: amount,
        currency: 'INR',
        paymentMethod: 'offline',
        status: 'verified', // Offline payments are immediately verified
        month: new Date().toLocaleString('default', { month: 'long', year: 'numeric' }),
        createdAt: serverTimestamp(),
        verifiedAt: serverTimestamp(),
        verifiedBy: 'Admin',
        transactionId: `CASH-${Date.now()}`,
      });

      toast({
        title: "Success",
        description: `Offline payment of ₹${amount} recorded for ${selectedUser.email}`,
      });

      setIsOfflineDialogOpen(false);
      setSelectedUser(null);
      setOfflineAmount('');
    } catch (error) {
      console.error('Error processing offline payment:', error);
      toast({
        title: "Error",
        description: "Failed to process offline payment",
        variant: "destructive",
      });
    }

    setIsProcessing(null);
  };

  const handlePaymentVerification = async (paymentId: string, action: 'verify' | 'reject') => {
    setIsProcessing(paymentId);

    try {
      const paymentRef = doc(db, 'payments', paymentId);
      await updateDoc(paymentRef, {
        status: action === 'verify' ? 'verified' : 'rejected',
        verifiedAt: serverTimestamp(),
        verifiedBy: 'Admin',
      });

      toast({
        title: "Success",
        description: `Payment ${action === 'verify' ? 'verified' : 'rejected'} successfully`,
      });
    } catch (error) {
      console.error('Error updating payment:', error);
      toast({
        title: "Error",
        description: "Failed to update payment status",
        variant: "destructive",
      });
    }

    setIsProcessing(null);
  };

  const getUserPaymentStatus = (userId: string) => {
    const currentMonth = new Date().toLocaleString('default', { month: 'long', year: 'numeric' });
    const userPayment = payments.find(p => 
      p.userId === userId && 
      p.month === currentMonth && 
      p.status === 'verified'
    );
    return userPayment ? 'paid' : 'unpaid';
  };

  const getPendingPayments = () => {
    return payments.filter(p => p.status === 'pending');
  };

  const getTotalRevenue = () => {
    return payments
      .filter(p => p.status === 'verified')
      .reduce((total, p) => total + p.amount, 0);
  };

  const getMonthlyRevenue = () => {
    const currentMonth = new Date().toLocaleString('default', { month: 'long', year: 'numeric' });
    return payments
      .filter(p => p.status === 'verified' && p.month === currentMonth)
      .reduce((total, p) => total + p.amount, 0);
  };

  return (
    <div className="space-y-6">
      {/* Revenue Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
            <IndianRupee className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">₹{getMonthlyRevenue().toLocaleString()}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <IndianRupee className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{getTotalRevenue().toLocaleString()}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Payments</CardTitle>
            <Clock className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-500">{getPendingPayments().length}</div>
          </CardContent>
        </Card>
      </div>

      {/* User Payment Management */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            User Payment Management
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {users.map((user) => (
              <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg bg-background/50">
                <div className="flex items-center gap-3">
                  <User className="h-8 w-8 text-muted-foreground" />
                  <div>
                    <p className="font-medium">{user.email}</p>
                    <p className="text-sm text-muted-foreground">
                      {user.displayName || user.name || 'No display name'}
                    </p>
                  </div>
                  <Badge variant={getUserPaymentStatus(user.id) === 'paid' ? 'default' : 'secondary'}>
                    {getUserPaymentStatus(user.id) === 'paid' ? 'Paid' : 'Unpaid'}
                  </Badge>
                </div>
                
                <div className="flex items-center gap-2">
                  {/* Online Payment Status */}
                  <Badge variant="outline" className="text-blue-600 border-blue-200">
                    Online
                  </Badge>
                  
                  {/* Offline Payment Button */}
                  <Dialog open={isOfflineDialogOpen && selectedUser?.id === user.id} onOpenChange={setIsOfflineDialogOpen}>
                    <DialogTrigger asChild>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setSelectedUser(user)}
                        className="text-blue-600 border-blue-200 hover:bg-blue-50"
                      >
                        <Banknote className="h-4 w-4 mr-1" />
                        Cash
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Record Offline Payment</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <Label>User</Label>
                          <p className="text-sm text-muted-foreground">{user.email}</p>
                        </div>
                        <div>
                          <Label htmlFor="amount">Amount (₹)</Label>
                          <Input
                            id="amount"
                            type="number"
                            placeholder="Enter amount"
                            value={offlineAmount}
                            onChange={(e) => setOfflineAmount(e.target.value)}
                          />
                        </div>
                        <Button
                          onClick={handleOfflinePayment}
                          disabled={isProcessing === 'offline'}
                          className="w-full"
                        >
                          {isProcessing === 'offline' ? 'Processing...' : 'Record Payment'}
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Pending Online Payments */}
      {getPendingPayments().length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Pending Online Payments ({getPendingPayments().length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {getPendingPayments().map((payment) => (
                <div key={payment.id} className="border rounded-lg p-4 bg-background/50">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <p className="font-medium">{payment.userEmail}</p>
                      <p className="text-sm text-muted-foreground">
                        ₹{payment.amount} • {payment.transactionId}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {payment.createdAt?.toDate?.()?.toLocaleString() || 'Recently'}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => handlePaymentVerification(payment.id, 'verify')}
                        disabled={isProcessing === payment.id}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Verify
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handlePaymentVerification(payment.id, 'reject')}
                        disabled={isProcessing === payment.id}
                      >
                        Reject
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* All Payments History */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="flex items-center gap-2">
              <History className="h-5 w-5" />
              Payment History ({payments.length})
            </CardTitle>
            <Button
              variant="ghost"
              onClick={() => setShowAllPayments(!showAllPayments)}
            >
              {showAllPayments ? 'Hide' : 'Show All'}
            </Button>
          </div>
        </CardHeader>
        {showAllPayments && (
          <CardContent>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {payments.map((payment) => (
                <div key={payment.id} className="border rounded-lg p-3 bg-background/50">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-medium text-sm">{payment.userEmail}</p>
                        <Badge
                          variant={payment.paymentMethod === 'online' ? 'outline' : 'secondary'}
                          className={payment.paymentMethod === 'online' ? 'text-blue-600' : 'text-white-600'}
                        >
                          {payment.paymentMethod}
                        </Badge>
                        <Badge
                          variant={
                            payment.status === 'verified' ? 'default' :
                            payment.status === 'rejected' ? 'destructive' : 'secondary'
                          }
                        >
                          {payment.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        ₹{payment.amount} • {payment.month}
                      </p>
                      {payment.transactionId && (
                        <p className="text-xs text-muted-foreground">
                          Transaction: {payment.transactionId}
                        </p>
                      )}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {payment.createdAt?.toDate?.()?.toLocaleDateString() || 'Recently'}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        )}
      </Card>
    </div>
  );
}