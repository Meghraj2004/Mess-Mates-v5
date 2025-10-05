import { useState, useRef } from 'react';
import { Upload, Camera, CheckCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';

interface QRImageUploaderProps {
  onQRDetected: (data: string) => void;
  onMarkAttendance: () => void;
  todaysMenu: any;
  todayAttended: boolean;
}

export const QRImageUploader = ({ 
  onQRDetected, 
  onMarkAttendance, 
  todaysMenu, 
  todayAttended 
}: QRImageUploaderProps) => {
  const [processing, setProcessing] = useState(false);
  const [scannedData, setScannedData] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setProcessing(true);
    
    try {
      // Create a canvas to read the image
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      
      img.onload = async () => {
        canvas.width = img.width;
        canvas.height = img.height;
        ctx?.drawImage(img, 0, 0);
        
        try {
          // Use a simple QR code detection library
          const QrScanner = (await import('qr-scanner')).default;
          const result = await QrScanner.scanImage(img, { returnDetailedScanResult: true });
          
          if (result?.data) {
            setScannedData(result.data);
            onQRDetected(result.data);
            toast({
              title: "QR Code Detected!",
              description: "QR code scanned successfully from image.",
            });
          }
        } catch (error) {
          console.error('QR scan error:', error);
          toast({
            title: "No QR Code Found",
            description: "Could not detect a valid QR code in the image.",
            variant: "destructive",
          });
        }
        
        setProcessing(false);
      };
      
      img.src = URL.createObjectURL(file);
    } catch (error) {
      console.error('Error processing image:', error);
      toast({
        title: "Error",
        description: "Failed to process the uploaded image.",
        variant: "destructive",
      });
      setProcessing(false);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <Card className="bg-gradient-card shadow-elegant border-0">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="h-5 w-5 text-primary" />
          Upload QR Code Image
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-center">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileUpload}
            className="hidden"
          />
          
          <Button
            onClick={triggerFileInput}
            disabled={processing}
            className="w-full"
            variant="outline"
          >
            {processing ? (
              <div className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                Processing...
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Camera className="h-4 w-4" />
                Choose Image
              </div>
            )}
          </Button>
          
          <p className="text-xs text-muted-foreground mt-2">
            Upload an image containing a QR code to mark attendance
          </p>
        </div>

        {scannedData && (
          <div className="space-y-4 p-4 bg-muted/20 rounded-lg">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <span className="font-medium">QR Code Detected!</span>
            </div>
            
            {todaysMenu && (
              <div className="space-y-2">
                <h4 className="font-medium">Today's Menu:</h4>
                <div className="grid grid-cols-1 gap-2">
                  {['breakfast', 'lunch', 'dinner'].map((meal) => (
                    todaysMenu[meal] && (
                      <div key={meal} className="text-sm">
                        <span className="font-medium capitalize">{meal}:</span> {todaysMenu[meal]}
                      </div>
                    )
                  ))}
                </div>
              </div>
            )}
            
            <div className="flex flex-col gap-2">
              {todayAttended ? (
                <Badge variant="default" className="bg-green-500 justify-center">
                  ✓ Attendance Already Marked
                </Badge>
              ) : (
                <Button onClick={onMarkAttendance} className="w-full">
                  Mark Attendance
                </Button>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};