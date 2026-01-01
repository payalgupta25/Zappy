import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useEvents } from '@/hooks/useEvents';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ArrowLeft, Calendar, MapPin, User, Phone } from 'lucide-react';
import { toast } from 'sonner';

const CreateEvent = () => {
  const navigate = useNavigate();
  const { createEvent } = useEvents();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    customer_name: '',
    customer_phone: '',
    event_location: '',
    event_date: new Date().toISOString().split('T')[0],
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.customer_name || !formData.customer_phone || !formData.event_location) {
      toast.error('Please fill in all required fields');
      return;
    }

    setLoading(true);
    const { data, error } = await createEvent(formData);
    setLoading(false);

    if (!error && data) {
      navigate(`/events/${data._id}`);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/dashboard')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-xl font-bold text-foreground">Create Event</h1>
            <p className="text-sm text-muted-foreground">Add a new event to track</p>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-8">
        <Card className="border-0 shadow-xl animate-scale-in">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" />
              Event Details
            </CardTitle>
            <CardDescription>
              Enter the customer and event information
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="customer_name" className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Customer Name
                </Label>
                <Input
                  id="customer_name"
                  placeholder="Enter customer name"
                  value={formData.customer_name}
                  onChange={(e) => setFormData(prev => ({ ...prev, customer_name: e.target.value }))}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="customer_phone" className="flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  Customer Phone
                </Label>
                <Input
                  id="customer_phone"
                  type="tel"
                  placeholder="+1 234 567 8900"
                  value={formData.customer_phone}
                  onChange={(e) => setFormData(prev => ({ ...prev, customer_phone: e.target.value }))}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="event_location" className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  Event Location
                </Label>
                <Input
                  id="event_location"
                  placeholder="Enter venue address"
                  value={formData.event_location}
                  onChange={(e) => setFormData(prev => ({ ...prev, event_location: e.target.value }))}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="event_date" className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Event Date
                </Label>
                <Input
                  id="event_date"
                  type="date"
                  value={formData.event_date}
                  onChange={(e) => setFormData(prev => ({ ...prev, event_date: e.target.value }))}
                  required
                />
              </div>

              <div className="flex gap-4 pt-4">
                <Button 
                  type="button" 
                  variant="outline" 
                  className="flex-1"
                  onClick={() => navigate('/dashboard')}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  variant="hero"
                  className="flex-1" 
                  disabled={loading}
                >
                  {loading ? 'Creating...' : 'Create Event'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default CreateEvent;
