import { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '@/lib/firebase';
import { Upload, CreditCard, CheckCircle, Download, History } from 'lucide-react';

interface PaymentSectionProps {
  userPaymentStatus?: 'pending' | 'paid' | 'expired' | null;
  payments?: Array<{
    id: string;
    amount: number;
    transactionId?: string;
    paymentMethod: 'online' | 'offline';
    status: 'pending' | 'verified' | 'rejected';
    createdAt: any;
    verifiedAt?: any;
  }>;
}

export function PaymentSection({ userPaymentStatus, payments = [] }: PaymentSectionProps) {
  const [user] = useAuthState(auth);
  const { toast } = useToast();
  const [transactionId, setTransactionId] = useState('');
  const [paymentScreenshot, setPaymentScreenshot] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showHistory, setShowHistory] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPaymentScreenshot(file);
    }
  };

  const handleQRDownload = () => {
    const qrImage = document.querySelector('img[alt="Payment QR Code"]') as HTMLImageElement;
    if (!qrImage) {
      toast({
        title: "Error",
        description: "QR Code image not found",
        variant: "destructive",
      });
      return;
    }

    // Create canvas to convert image to downloadable format
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = qrImage.naturalWidth || 400;
    canvas.height = qrImage.naturalHeight || 400;
    
    ctx.drawImage(qrImage, 0, 0);
    
    // Convert to blob and download
    canvas.toBlob((blob) => {
      if (!blob) return;
      
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'MessMates-Payment-QR.png';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast({
        title: "Download Complete",
        description: "QR Code saved to your device",
      });
    }, 'image/png');
  };

  const handlePaymentSubmission = async () => {
    if (!user || !transactionId.trim()) {
      toast({
        title: "Error",
        description: "Please enter transaction ID",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      await addDoc(collection(db, 'payments'), {
        userId: user.uid,
        userEmail: user.email,
        userName: user.displayName || 'Unknown',
        amount: 2600,
        currency: 'INR',
        transactionId: transactionId.trim(),
        paymentMethod: 'online',
        paymentType: 'UPI',
        status: 'pending',
        month: new Date().toLocaleString('default', { month: 'long', year: 'numeric' }),
        createdAt: serverTimestamp(),
        verifiedAt: null,
        verifiedBy: null,
      });

      toast({
        title: "Payment Submitted",
        description: "Your payment has been submitted for verification",
      });

      setTransactionId('');
      setPaymentScreenshot(null);
    } catch (error) {
      console.error('Error submitting payment:', error);
      toast({
        title: "Error",
        description: "Failed to submit payment",
        variant: "destructive",
      });
    }
    
    setIsSubmitting(false);
  };

  const getStatusColor = () => {
    switch (userPaymentStatus) {
      case 'paid': return 'text-green-600';
      case 'pending': return 'text-yellow-600';
      case 'expired': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getStatusText = () => {
    switch (userPaymentStatus) {
      case 'paid': return 'Payment Verified ✓';
      case 'pending': return 'Payment Under Review';
      case 'expired': return 'Payment Expired';
      default: return 'Payment Required';
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <CardTitle className="flex items-center justify-center gap-2">
          <CreditCard className="h-5 w-5" />
          Monthly Meal Fees
        </CardTitle>
        <CardDescription>
          <span className={getStatusColor()}>{getStatusText()}</span>
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {userPaymentStatus !== 'paid' && (
          <>
            <div className="text-center">
              <p className="text-2xl font-bold text-primary">₹2,600</p>
              <p className="text-sm text-muted-foreground">Per Month</p>
            </div>

            <div className="flex justify-center">
              <img 
                src="assets/QRPay.png" 
                alt="Payment QR Code"
                className="w-64 h-64 object-contain border rounded-lg"
              />
            </div>

            <div className="flex justify-center">
              <Button
                onClick={handleQRDownload}
                variant="outline"
                size="sm"
                className="flex items-center gap-2"
              >
                <Download className="h-4 w-4" />
                Download QR Code
              </Button>
            </div>

            <div className="text-center text-sm text-muted-foreground">
              <p>Scan QR code with any UPI app</p>
              <p>UPI ID: megharajdandgavhal2004@okicici</p>
            </div>

            <div className="space-y-3">
              <div>
                <Label htmlFor="transactionId">Transaction ID *</Label>
                <Input
                  id="transactionId"
                  placeholder="Enter UPI transaction ID"
                  value={transactionId}
                  onChange={(e) => setTransactionId(e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="screenshot">Payment Screenshot (Optional)</Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="screenshot"
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="flex-1"
                  />
                  <Upload className="h-4 w-4 text-muted-foreground" />
                </div>
              </div>
            </div>
          </>
        )}

        {userPaymentStatus === 'paid' && (
          <div className="text-center py-8">
            <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
            <p className="text-green-600 font-medium">Payment Verified</p>
            <p className="text-sm text-muted-foreground">Your meal service is active</p>
          </div>
        )}

        {/* Payment History Section */}
        <div className="mt-6 border-t pt-4">
          <Button
            onClick={() => setShowHistory(!showHistory)}
            variant="ghost"
            className="w-full flex items-center justify-center gap-2"
          >
            <History className="h-4 w-4" />
            Payment History ({payments.length})
          </Button>
          
          {showHistory && (
            <div className="mt-4 space-y-3 max-h-64 overflow-y-auto">
              {payments.length > 0 ? (
                payments.map((payment) => (
                  <div key={payment.id} className="border rounded-lg p-3 bg-background/50">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">₹{payment.amount}</span>
                        <span 
                          className={`text-xs px-2 py-1 rounded-full ${
                            payment.paymentMethod === 'online' 
                              ? 'bg-blue-100 text-blue-700' 
                              : 'bg-blue-100 text-blue-700'
                          }`}
                        >
                          {payment.paymentMethod}
                        </span>
                        <span 
                          className={`text-xs px-2 py-1 rounded-full ${
                            payment.status === 'verified' 
                              ? 'bg-blue-100 text-blue-700' 
                              : payment.status === 'rejected'
                              ? 'bg-red-100 text-red-700'
                              : 'bg-yellow-100 text-yellow-700'
                          }`}
                        >
                          {payment.status}
                        </span>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {payment.createdAt?.toDate?.()?.toLocaleDateString() || 'Recently'}
                      </div>
                    </div>
                    {payment.transactionId && (
                      <p className="text-xs text-muted-foreground">
                        Transaction ID: {payment.transactionId}
                      </p>
                    )}
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <p>No payment history found</p>
                </div>
              )}
            </div>
          )}
        </div>
      </CardContent>

      {userPaymentStatus !== 'paid' && (
        <CardFooter>
          <Button 
            onClick={handlePaymentSubmission}
            disabled={isSubmitting || !transactionId.trim()}
            className="w-full"
          >
            {isSubmitting ? 'Submitting...' : 'Submit Payment'}
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}