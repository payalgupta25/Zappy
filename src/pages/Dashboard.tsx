import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useVendor } from '@/hooks/useVendor';
import { useEvents } from '@/hooks/useEvents';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, Calendar, MapPin, User, LogOut, ChevronRight } from 'lucide-react';
import EventCard from '@/components/EventCard';

const Dashboard = () => {
  const { user, loading: authLoading, signOut } = useAuth();
  const { vendor, loading: vendorLoading, createVendor } = useVendor();
  const { events, loading: eventsLoading } = useEvents();
  const navigate = useNavigate();
  const [vendorName, setVendorName] = useState('');
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };

  const handleCreateVendor = async () => {
    if (!vendorName.trim()) return;
    setCreating(true);
    await createVendor(vendorName.trim());
    setCreating(false);
  };

  if (authLoading || vendorLoading) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-4xl mx-auto space-y-6">
          <Skeleton className="h-20 w-full rounded-xl" />
          <Skeleton className="h-40 w-full rounded-xl" />
          <Skeleton className="h-40 w-full rounded-xl" />
        </div>
      </div>
    );
  }

  const todayEvents = events.filter(
    e => e.eventDate === new Date().toISOString().split('T')[0]
  );
  
  const activeEvents = events.filter(
    e => e.status !== 'completed' && e.status !== 'pending'
  );

  const stats = [
    { label: "Today's Events", value: todayEvents.length, icon: Calendar },
    { label: 'Active Events', value: activeEvents.length, icon: MapPin },
    { label: 'Total Events', value: events.length, icon: User },
  ];

  if (!vendor) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Create Your Vendor Profile</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="vendorName">Vendor Name</Label>
              <Input
                id="vendorName"
                value={vendorName}
                onChange={(e) => setVendorName(e.target.value)}
                placeholder="Enter your vendor name"
              />
            </div>
            <Button onClick={handleCreateVendor} disabled={creating} className="w-full">
              {creating ? 'Creating...' : 'Create Vendor'}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              Zappy<span className="text-primary">.</span>
            </h1>
            <p className="text-sm text-muted-foreground">
              Welcome, {vendor?.name || 'Vendor'}
            </p>
          </div>
          <Button variant="ghost" size="icon" onClick={handleSignOut}>
            <LogOut className="h-5 w-5" />
          </Button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-8 space-y-8">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          {stats.map((stat, index) => (
            <Card 
              key={index} 
              className="border-0 shadow-md animate-slide-up"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <CardContent className="p-4 flex items-center gap-4">
                <div className="p-3 rounded-xl bg-primary/10">
                  <stat.icon className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Create Event Button */}
        <Button 
          onClick={() => navigate('/events/new')} 
          variant="hero" 
          size="lg"
          className="w-full"
        >
          <Plus className="h-5 w-5" />
          Create New Event
        </Button>

        {/* Events List */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-foreground">Your Events</h2>
            {events.length > 0 && (
              <Button variant="ghost" size="sm" onClick={() => navigate('/events')}>
                View All <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            )}
          </div>

          {eventsLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-32 w-full rounded-xl" />
              ))}
            </div>
          ) : events.length === 0 ? (
            <Card className="border-dashed border-2 border-muted">
              <CardContent className="p-8 text-center">
                <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2">No Events Yet</h3>
                <p className="text-muted-foreground mb-4">
                  Create your first event to get started
                </p>
                <Button onClick={() => navigate('/events/new')}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Event
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {events.slice(0, 5).map((event, index) => (
                <div 
                  key={event._id}
                  className="animate-slide-up"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <EventCard 
                    event={event} 
                    onClick={() => navigate(`/events/${event._id}`)} 
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
