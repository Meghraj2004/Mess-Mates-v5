import { useState } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Utensils, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const ADMIN_EMAILS = [
  'megharajdandgavhal2004@gmail.com',
  'sohamk5404@gmail.com', 
  'dandgavhalchetan20@gmail.com',
  'priyankachitte2005@gmail.com'
];

export default function UserLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogin = async () => {
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      
      if (ADMIN_EMAILS.includes(email)) {
        navigate('/admin');
        toast({
          title: "Welcome Admin!",
          description: "Logged in successfully",
        });
      } else {
        navigate('/dashboard');
        toast({
          title: "Welcome!",
          description: "Logged in successfully",
        });
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Login failed",
        description: "Invalid email or password. Contact admin if you need an account.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/5 relative overflow-hidden">
      {/* Background Decorations */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-10 w-32 h-32 bg-primary/5 rounded-full blur-xl"></div>
        <div className="absolute bottom-20 right-10 w-48 h-48 bg-secondary/5 rounded-full blur-xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-accent/3 rounded-full blur-2xl"></div>
      </div>

      <div className="relative z-10 min-h-screen flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-md">
          {/* Logo and Branding */}
          <div className="text-center mb-8 space-y-4">
            <div className="inline-flex items-center gap-3 mb-6">
              <div className="relative">
                <div className="absolute inset-0 bg-primary/20 rounded-full blur-md"></div>
                <div className="relative bg-gradient-to-br from-primary to-primary/80 p-3 rounded-full shadow-lg">
                  <Utensils className="h-8 w-8 text-white" />
                </div>
              </div>
              <div>
                <h1 className="font-bold text-3xl bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                  MessMates
                </h1>
                <p className="text-sm text-muted-foreground/80">Smart Hub</p>
              </div>
            </div>
            <p className="text-muted-foreground max-w-sm mx-auto">
              Welcome back! Sign in to manage your mess meals efficiently and stay connected with your community.
            </p>
          </div>

          {/* Login Card */}
          <Card className="border-0 shadow-2xl bg-background/95 backdrop-blur-md hover:shadow-3xl transition-all duration-300">
            <CardHeader className="space-y-3 pb-6">
              <CardTitle className="text-2xl font-bold text-center bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                Sign In
              </CardTitle>
              <p className="text-center text-muted-foreground text-sm">
                Enter your credentials to access your dashboard
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium">
                    Email Address
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="your.email@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
                    className="h-11 border-2 border-border/50 hover:border-primary/50 focus:border-primary transition-colors"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-sm font-medium">
                    Password
                  </Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
                    className="h-11 border-2 border-border/50 hover:border-primary/50 focus:border-primary transition-colors"
                  />
                </div>
              </div>
              
              <Button 
                onClick={handleLogin} 
                disabled={loading || !email || !password}
                className="w-full h-11 bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 text-white font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Signing you in...</span>
                  </div>
                ) : (
                  <span>Sign In to Dashboard</span>
                )}
              </Button>

              {/* Additional Info */}
              <div className="text-center pt-4 border-t border-border/30">
                <p className="text-xs text-muted-foreground">
                  Need an account? Contact your administrator
                </p>
                <p className="text-xs text-muted-foreground/60 mt-1">
                  Secure login powered by Firebase Authentication
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Footer */}
          <div className="text-center mt-8 space-y-2">
            <p className="text-xs text-muted-foreground">
              © 2024 MessMates Smart Hub. All rights reserved.
            </p>
            <p className="text-xs text-muted-foreground/60">
              Built with React, Firebase & Tailwind CSS
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}