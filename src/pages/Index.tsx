import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '@/lib/firebase';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { HeroButton } from '@/components/ui/hero-button';
import { 
  Utensils, 
  QrCode, 
  MessageSquare, 
  Calendar,
  IndianRupee,
  Users,
  CheckCircle,
  ArrowRight
} from 'lucide-react';

const ADMIN_EMAILS = [
  'megharajdandgavhal2004@gmail.com',
  'sohamk5404@gmail.com', 
  'dandgavhalchetan20@gmail.com'
];

const Index = () => {
  const [user, loading] = useAuthState(auth);
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && user) {
      const isAdmin = user.email && ADMIN_EMAILS.includes(user.email);
      navigate(isAdmin ? '/admin' : '/dashboard');
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-hero">
        <div className="text-center">
          <Utensils className="h-12 w-12 animate-pulse mx-auto mb-4 text-primary-foreground" />
          <p className="text-primary-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  const features = [
    {
      icon: QrCode,
      title: "QR Attendance",
      description: "Mark your meal attendance with QR code scanning"
    },
    {
      icon: Calendar,
      title: "Weekly Menu",
      description: "View updated weekly menu and plan your meals"
    },
    {
      icon: MessageSquare,
      title: "Feedback System",
      description: "Submit feedback and complaints easily"
    },
    {
      icon: IndianRupee,
      title: "Bill Estimation",
      description: "Track your monthly meal expenses automatically"
    },
    {
      icon: Users,
      title: "Admin Dashboard",
      description: "Comprehensive management tools for administrators"
    },
    {
      icon: CheckCircle,
      title: "Leave Management",
      description: "Request leaves for meal deductions"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-hero relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-20 sm:-top-40 -right-20 sm:-right-40 w-40 h-40 sm:w-80 sm:h-80 rounded-full bg-primary/20 animate-pulse"></div>
        <div className="absolute -bottom-20 sm:-bottom-40 -left-20 sm:-left-40 w-30 h-30 sm:w-60 sm:h-60 rounded-full bg-secondary/20 animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-48 h-48 sm:w-96 sm:h-96 rounded-full bg-primary-glow/10 animate-pulse delay-500"></div>
      </div>

      {/* Hero Section - Mobile Optimized */}
      <section className="relative py-12 sm:py-24 px-3 sm:px-4 z-10">
        <div className="container mx-auto text-center">
          {/* Logo Badge - Mobile Responsive */}
          <div className="inline-flex items-center gap-2 sm:gap-3 bg-background/10 backdrop-blur-md px-4 sm:px-8 py-2 sm:py-4 rounded-full mb-6 sm:mb-12 border border-primary-foreground/20 shadow-glow hover:shadow-elegant transition-all duration-300">
            <Utensils className="h-6 w-6 sm:h-10 sm:w-10 text-primary-foreground animate-bounce" />
            <span className="font-bold text-lg sm:text-2xl text-primary-foreground">MessMates</span>
          </div>
          
          {/* Main Heading - Mobile Responsive */}
          <div className="mb-4 sm:mb-8">
            <h1 className="text-3xl sm:text-5xl md:text-6xl lg:text-8xl font-bold text-primary-foreground mb-2 sm:mb-4 leading-tight tracking-tight px-2">
              Revolutionize Your
            </h1>
            <div className="relative inline-block px-2">
              <span className="text-3xl sm:text-5xl md:text-6xl lg:text-8xl font-bold bg-gradient-to-r from-accent to-primary-glow bg-clip-text text-transparent animate-pulse">
                Mess Experience
              </span>
              <div className="absolute -inset-1 sm:-inset-2 bg-gradient-to-r from-accent/20 to-primary-glow/20 rounded-lg blur-xl animate-pulse"></div>
            </div>
          </div>
          
          {/* Enhanced Description - Mobile Responsive */}
          <p className="text-sm sm:text-lg md:text-xl lg:text-2xl text-primary-foreground/80 mb-8 sm:mb-16 max-w-4xl mx-auto leading-relaxed px-4">
            Transform your mess management with our comprehensive solution featuring 
            <span className="text-primary-glow font-semibold"> QR code attendance</span>, 
            <span className="text-accent font-semibold"> real-time menu updates</span>, 
            intelligent feedback systems, and automated billing - all in one powerful platform.
          </p>
          
          {/* Enhanced CTA Buttons - Mobile Responsive */}
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-6 justify-center items-center mb-8 sm:mb-16 px-4">
            <HeroButton 
              variant="hero" 
              size="lg" 
              onClick={() => navigate('/login')}
              className="w-full sm:w-auto sm:min-w-[250px] h-12 sm:h-14 text-base sm:text-lg font-semibold shadow-glow hover:shadow-elegant transition-all duration-300 transform hover:scale-105"
            >
              <span className="flex items-center justify-center gap-2">
                Start Your Journey
                <ArrowRight className="h-5 w-5 sm:h-6 sm:w-6 group-hover:translate-x-1 transition-transform duration-200" />
              </span>
            </HeroButton>
            <HeroButton 
              variant="outline" 
              size="lg"
              onClick={() => navigate('/login')}
              className="w-full sm:w-auto sm:min-w-[250px] h-12 sm:h-14 text-base sm:text-lg font-semibold border-2 border-primary-foreground/30 hover:border-primary-foreground/60 backdrop-blur-md"
            >
              Administrator Access
            </HeroButton>
          </div>

          {/* Stats Preview - Mobile Responsive */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-8 max-w-2xl mx-auto px-4">
            <div className="text-center">
              <div className="text-2xl sm:text-3xl font-bold text-primary-glow mb-1 sm:mb-2">24/7</div>
              <div className="text-xs sm:text-sm text-primary-foreground/70">Access</div>
            </div>
            <div className="text-center">
              <div className="text-2xl sm:text-3xl font-bold text-accent mb-1 sm:mb-2">QR</div>
              <div className="text-xs sm:text-sm text-primary-foreground/70">Attendance</div>
            </div>
            <div className="text-center">
              <div className="text-2xl sm:text-3xl font-bold text-secondary mb-1 sm:mb-2">Real-time</div>
              <div className="text-xs sm:text-sm text-primary-foreground/70">Updates</div>
            </div>
            <div className="text-center">
              <div className="text-2xl sm:text-3xl font-bold text-primary-glow mb-1 sm:mb-2">Smart</div>
              <div className="text-xs sm:text-sm text-primary-foreground/70">Billing</div>
            </div>
          </div>
        </div>
      </section>

      {/* Enhanced Features Section - Mobile Responsive */}
      <section className="py-12 sm:py-24 px-3 sm:px-4 bg-background/10 backdrop-blur-md relative z-10">
        <div className="container mx-auto">
          <div className="text-center mb-10 sm:mb-20 px-4">
            <div className="inline-block mb-4 sm:mb-6">
              <span className="text-primary-glow text-sm sm:text-lg font-semibold mb-2 block">POWERFUL FEATURES</span>
              <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-primary-foreground mb-4 sm:mb-6 leading-tight">
                Everything You Need
                <span className="block text-2xl sm:text-3xl md:text-4xl lg:text-5xl bg-gradient-to-r from-secondary to-primary-glow bg-clip-text text-transparent">
                  & More
                </span>
              </h2>
            </div>
            <p className="text-sm sm:text-lg md:text-xl text-primary-foreground/80 max-w-3xl mx-auto leading-relaxed">
              Discover a comprehensive suite of features designed to transform your mess management experience 
              with cutting-edge technology and user-friendly interfaces.
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-8 px-4">
            {features.map((feature, index) => (
              <Card 
                key={index} 
                className="group bg-background/10 backdrop-blur-sm border-primary-foreground/20 shadow-glow hover:shadow-elegant transition-all duration-500 hover:scale-[1.02] sm:hover:scale-[1.05] hover:rotate-1 relative overflow-hidden"
              >
                {/* Card Background Gradient */}
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-secondary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                
                <CardContent className="p-4 sm:p-8 text-center relative z-10">
                  <div className="inline-flex items-center justify-center w-14 h-14 sm:w-20 sm:h-20 bg-gradient-primary rounded-2xl sm:rounded-3xl mb-4 sm:mb-6 shadow-glow group-hover:shadow-elegant transition-all duration-300 group-hover:scale-110 group-hover:rotate-12">
                    <feature.icon className="h-7 w-7 sm:h-10 sm:w-10 text-primary-foreground group-hover:scale-110 transition-transform duration-300" />
                  </div>
                  <h3 className="text-base sm:text-xl font-bold text-primary-foreground mb-2 sm:mb-4 group-hover:text-primary-glow transition-colors duration-300">
                    {feature.title}
                  </h3>
                  <p className="text-xs sm:text-base text-primary-foreground/70 leading-relaxed group-hover:text-primary-foreground/90 transition-colors duration-300">
                    {feature.description}
                  </p>
                  
                  {/* Decorative Element */}
                  <div className="absolute top-4 right-4 w-2 h-2 bg-primary-glow rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Additional Feature Highlights */}
          <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-secondary rounded-2xl mb-4 mx-auto">
                <CheckCircle className="h-8 w-8 text-secondary-foreground" />
              </div>
              <h4 className="text-lg font-semibold text-primary-foreground mb-2">Instant Updates</h4>
              <p className="text-primary-foreground/70">Real-time synchronization across all devices</p>
            </div>
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-primary rounded-2xl mb-4 mx-auto">
                <Users className="h-8 w-8 text-primary-foreground" />
              </div>
              <h4 className="text-lg font-semibold text-primary-foreground mb-2">Multi-User Support</h4>
              <p className="text-primary-foreground/70">Seamless collaboration for administrators and users</p>
            </div>
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-secondary rounded-2xl mb-4 mx-auto">
                <Utensils className="h-8 w-8 text-secondary-foreground" />
              </div>
              <h4 className="text-lg font-semibold text-primary-foreground mb-2">Smart Analytics</h4>
              <p className="text-primary-foreground/70">Detailed insights and reporting capabilities</p>
            </div>
          </div>
        </div>
      </section>

      {/* Enhanced CTA Section */}
      <section className="py-24 px-4 relative z-10">
        <div className="container mx-auto text-center">
          <div className="relative bg-background/10 backdrop-blur-md rounded-3xl p-16 border border-primary-foreground/20 shadow-elegant overflow-hidden">
            {/* Background Pattern */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-secondary/10"></div>
            <div className="absolute top-0 left-0 w-full h-full">
              <div className="absolute top-8 left-8 w-4 h-4 bg-primary-glow/30 rounded-full animate-pulse"></div>
              <div className="absolute top-12 right-12 w-3 h-3 bg-accent/40 rounded-full animate-pulse delay-300"></div>
              <div className="absolute bottom-8 left-16 w-2 h-2 bg-secondary/50 rounded-full animate-pulse delay-700"></div>
              <div className="absolute bottom-16 right-8 w-5 h-5 bg-primary/20 rounded-full animate-pulse delay-1000"></div>
            </div>
            
            <div className="relative z-10">
              <div className="inline-block mb-8">
                <span className="text-accent text-lg font-semibold mb-4 block">JOIN THE REVOLUTION</span>
                <h2 className="text-5xl md:text-6xl font-bold text-primary-foreground mb-6 leading-tight">
                  Ready to Transform
                  <span className="block bg-gradient-to-r from-primary-glow to-secondary bg-clip-text ">
                    Your Mess Experience?
                  </span>
                </h2>
              </div>
              
              <p className="text-xl md:text-2xl text-primary-foreground/80 mb-12 max-w-3xl mx-auto leading-relaxed">
                Join thousands of satisfied users who have revolutionized their mess management with our 
                intelligent, efficient, and user-friendly platform.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-12">
                <HeroButton 
                  variant="hero" 
                  size="lg" 
                  onClick={() => navigate('/login')}
                  className="min-w-[300px] h-16 text-xl font-bold shadow-glow hover:shadow-elegant transition-all duration-300 transform hover:scale-105"
                >
                  Launch Your Journey
                  <ArrowRight className="h-6 w-6 ml-2 group-hover:translate-x-2 transition-transform duration-300" />
                </HeroButton>
                <div className="text-primary-foreground/60 text-sm">
                  ✨ No setup required • Free to start
                </div>
              </div>

              {/* Social Proof */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-8 text-primary-foreground/70">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-primary-glow" />
                  <span>Instant Setup</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-primary-glow" />
                  <span>Real-time Sync</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-primary-glow" />
                  <span>24/7 Support</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Footer */}
      <footer className="py-8 px-4 border-t border-primary-foreground/10 backdrop-blur-sm relative z-10">
        <div className="container mx-auto text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Utensils className="h-6 w-6 text-primary" />
            <span className="font-bold text-xl text-primary-foreground">Smart Mess Manager</span>
          </div>
          <p className="text-primary-foreground/60 text-sm">
            © 2024 Smart Mess Manager. Revolutionizing mess management with technology.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
