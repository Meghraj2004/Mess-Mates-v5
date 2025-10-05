import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '@/lib/firebase';
import { Navigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';

interface AuthGuardProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
}

const ADMIN_EMAILS = [
  'megharajdandgavhal2004@gmail.com',
  'sohamk5404@gmail.com', 
  'dandgavhalchetan20@gmail.com'
];

export const AuthGuard = ({ children, requireAdmin = false }: AuthGuardProps) => {
  const [user, loading] = useAuthState(auth);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (requireAdmin && !ADMIN_EMAILS.includes(user.email || '')) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};