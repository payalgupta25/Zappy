import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowRight, MapPin, Camera, Clock, CheckCircle, Zap } from 'lucide-react';

const Index = () => {
  const navigate = useNavigate();

  const features = [
    { 
      icon: MapPin, 
      title: 'GPS Check-In', 
      desc: 'Arrive at venue and check in with precise geolocation tracking' 
    },
    { 
      icon: Camera, 
      title: 'Photo Documentation', 
      desc: 'Capture before and after setup photos with optional notes' 
    },
    { 
      icon: Clock, 
      title: 'Real-time Tracking', 
      desc: 'Monitor event progress through each stage of execution' 
    },
    { 
      icon: CheckCircle, 
      title: 'OTP Verification', 
      desc: 'Secure customer confirmation at start and completion' 
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 gradient-dark opacity-95" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,hsl(24_95%_53%/0.15),transparent_50%)]" />
        
        <div className="relative max-w-4xl mx-auto px-6 py-20 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-8 animate-fade-in">
            <Zap className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium text-primary">Vendor Event Day Tracker</span>
          </div>

          <h1 className="text-5xl md:text-6xl font-bold text-primary-foreground mb-6 animate-slide-up">
            Zappy<span className="text-primary">.</span>
          </h1>
          
          <p className="text-xl text-primary-foreground/70 mb-10 max-w-2xl mx-auto animate-slide-up" style={{ animationDelay: '0.1s' }}>
            Streamline your event execution with real-time tracking, photo documentation, and secure OTP verification.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-slide-up" style={{ animationDelay: '0.2s' }}>
            <Button 
              variant="hero" 
              size="xl"
              onClick={() => navigate('/auth')}
            >
              Get Started
              <ArrowRight className="h-5 w-5 ml-2" />
            </Button>
            <Button 
              variant="outline" 
              size="xl"
              className="border-primary-foreground/20 text-black hover:bg-primary-foreground/10"
              onClick={() => navigate('/auth')}
            >
              Sign In
            </Button>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="max-w-4xl mx-auto px-6 py-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-foreground mb-4">
            Everything You Need
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Track vendor activities from arrival to event completion with our comprehensive toolkit.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {features.map((feature, index) => (
            <div
              key={index}
              className="group p-6 rounded-2xl bg-card border border-border shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1 animate-slide-up"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                <feature.icon className="h-6 w-6 text-primary-foreground" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">{feature.title}</h3>
              <p className="text-muted-foreground">{feature.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-card border-t border-border">
        <div className="max-w-4xl mx-auto px-6 py-16 text-center">
          <h2 className="text-2xl font-bold text-foreground mb-4">
            Ready to streamline your events?
          </h2>
          <p className="text-muted-foreground mb-8">
            Join vendors who trust Zappy for seamless event execution.
          </p>
          <Button variant="hero" size="lg" onClick={() => navigate('/auth')}>
            Start Tracking Events
            <ArrowRight className="h-5 w-5 ml-2" />
          </Button>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-accent text-accent-foreground py-8">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <p className="font-bold text-lg mb-2">
            Zappy<span className="text-primary">.</span>
          </p>
          <p className="text-sm text-accent-foreground/60">
            © 2024 Zappy. Vendor Event Day Tracker.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
