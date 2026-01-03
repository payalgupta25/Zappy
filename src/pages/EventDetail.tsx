import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useEvents, Event } from '@/hooks/useEvents';
import { useGeolocation } from '@/hooks/useGeolocation';
import { usePhotoUpload } from '@/hooks/usePhotoUpload';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, MapPin, Camera, CheckCircle, Clock, Send, Upload, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import EventStepper from '@/components/EventStepper';

const EventDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { events, loading, updateEvent, refetch } = useEvents();
  const { getLocation, loading: geoLoading, error: geoError } = useGeolocation();
  const { uploadPhoto, uploading } = usePhotoUpload();
  
  const [event, setEvent] = useState<Event | null>(null);
  const [otp, setOtp] = useState('');
  const [notes, setNotes] = useState('');
  const [updating, setUpdating] = useState(false);

  const checkInPhotoRef = useRef<HTMLInputElement>(null);
  const preSetupPhotoRef = useRef<HTMLInputElement>(null);
  const postSetupPhotoRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!loading && events.length > 0) {
      const found = events.find(e => e._id === id);
      if (found) {
        setEvent(found);
      } else {
        toast.error('Event not found');
        navigate('/dashboard');
      }
    }
  }, [events, loading, id, navigate]);

  if (loading || !event) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-4xl mx-auto space-y-6">
          <Skeleton className="h-16 w-full rounded-xl" />
          <Skeleton className="h-40 w-full rounded-xl" />
          <Skeleton className="h-80 w-full rounded-xl" />
        </div>
      </div>
    );
  }

  // Generate mock OTP
  const generateOtp = () => {
    return Math.floor(1000 + Math.random() * 9000).toString();
  };

  // Handle Check-In with photo and location
  const handleCheckIn = async (file: File) => {
    setUpdating(true);
    
    try {
      const location = await getLocation();
      const photoUrl = await uploadPhoto(file, 'check-in');
      
      if (photoUrl) {
        const token = localStorage.getItem('token');
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/events/${event._id}/checkin`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({
            photoUrl,
            latitude: location.latitude,
            longitude: location.longitude,
          }),
        });
        if (response.ok) {
          const data = await response.json();
          toast.success(`OTP sent to customer: ${data.startOtp}`);
          await refetch(); // refresh
        } else {
          toast.error('Failed to complete check-in');
        }
      }
    } catch (error) {
      console.error('Check-in error:', error);
      toast.error('Failed to complete check-in');
    }
    
    setUpdating(false);
  };

  // Verify start OTP
  const handleVerifyStartOtp = async () => {
    setUpdating(true);
    const token = localStorage.getItem('token');
    const response = await fetch(`${import.meta.env.VITE_API_URL}/api/events/${event._id}/verify-start-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ otp }),
    });
    if (response.ok) {
      setOtp('');
      toast.success('Event started!');
      await refetch();
    } else {
      const error = await response.json();
      toast.error(error.message || 'Invalid OTP');
    }
    setUpdating(false);
  };

  // Upload pre-setup photo
  const handlePreSetupPhoto = async (file: File) => {
    setUpdating(true);
    const photoUrl = await uploadPhoto(file, 'pre-setup');
    if (photoUrl) {
      await updateEvent(event._id, {
        preSetupPhotoUrl: photoUrl,
        preSetupNotes: notes || null,
      });
      setNotes('');
    }
    setUpdating(false);
  };

  // Upload post-setup photo and complete setup
  const handlePostSetupPhoto = async (file: File) => {
    setUpdating(true);
    const photoUrl = await uploadPhoto(file, 'post-setup');
    if (photoUrl) {
      const token = localStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/events/${event._id}/setup-complete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          postSetupPhotoUrl: photoUrl,
          postSetupNotes: notes || null,
        }),
      });
      if (response.ok) {
        const data = await response.json();
        setNotes('');
        toast.success(`Setup complete! Closing OTP sent: ${data.closingOtp}`);
        await refetch();
      } else {
        toast.error('Failed to complete setup');
      }
    }
    setUpdating(false);
  };

  // Verify closing OTP and complete event
  const handleVerifyClosingOtp = async () => {
    setUpdating(true);
    const token = localStorage.getItem('token');
    const response = await fetch(`${import.meta.env.VITE_API_URL}/api/events/${event._id}/verify-closing-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ otp }),
    });
    if (response.ok) {
      setOtp('');
      toast.success('Event completed successfully! 🎉');
      await refetch();
    } else {
      const error = await response.json();
      toast.error(error.message || 'Invalid OTP');
    }
    setUpdating(false);
  };

  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    handler: (file: File) => Promise<void>
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      handler(file);
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
          <div className="flex-1 min-w-0">
            <h1 className="text-xl font-bold text-foreground truncate">{event.customerName}</h1>
            <p className="text-sm text-muted-foreground flex items-center gap-1">
              <MapPin className="h-3 w-3" />
              {event.eventLocation}
            </p>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-8 space-y-6">
        {/* Progress Stepper */}
        <EventStepper status={event.status} />

        {/* Event Info Card */}
        <Card className="border-0 shadow-md">
          <CardContent className="p-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Customer</span>
                <p className="font-medium text-foreground">{event.customerName}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Phone</span>
                <p className="font-medium text-foreground">{event.customerPhone}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Date</span>
                <p className="font-medium text-foreground">{format(new Date(event.eventDate), 'MMM dd, yyyy')}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Location</span>
                <p className="font-medium text-foreground truncate">{event.eventLocation}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Action Cards based on status */}
        {event.status === 'pending' && (
          <Card className="border-0 shadow-xl animate-scale-in">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-primary" />
                Vendor Check-In
              </CardTitle>
              <CardDescription>
                Take a photo at the venue to check in. Your location will be captured automatically.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <input
                type="file"
                accept="image/*"
                capture="environment"
                ref={checkInPhotoRef}
                className="hidden"
                onChange={(e) => handleFileChange(e, handleCheckIn)}
              />
              <Button
                onClick={() => checkInPhotoRef.current?.click()}
                variant="hero"
                size="lg"
                className="w-full"
                disabled={updating || uploading || geoLoading}
              >
                {updating || uploading || geoLoading ? (
                  <Loader2 className="h-5 w-5 animate-spin mr-2" />
                ) : (
                  <Camera className="h-5 w-5 mr-2" />
                )}
                Take Check-In Photo
              </Button>
              {geoError && (
                <p className="text-destructive text-sm mt-2">{geoError}</p>
              )}
            </CardContent>
          </Card>
        )}

        {event.status === 'checked_in' && (
          <Card className="border-0 shadow-xl animate-scale-in">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Send className="h-5 w-5 text-primary" />
                Verify Customer OTP
              </CardTitle>
              <CardDescription>
                Enter the OTP provided by the customer to start the event.
                <br />
                <Badge variant="secondary" className="mt-2">
                  Mock OTP: {event.startOtp}
                </Badge>
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {event.checkInPhotoUrl && (
                <img 
                  src={event.checkInPhotoUrl} 
                  alt="Check-in" 
                  className="w-full h-48 object-cover rounded-lg"
                />
              )}
              {event.checkInLatitude && (
                <p className="text-sm text-muted-foreground">
                  📍 Location: {event.checkInLatitude.toFixed(4)}, {event.checkInLongitude?.toFixed(4)}
                </p>
              )}
              <div className="flex gap-2">
                <Input
                  placeholder="Enter 4-digit OTP"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  maxLength={4}
                  className="flex-1"
                />
                <Button 
                  onClick={handleVerifyStartOtp}
                  disabled={otp.length !== 4 || updating}
                >
                  {updating ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Verify'}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {event.status === 'started' && (
          <div className="space-y-6">
            {/* Pre-setup Photo */}
            <Card className="border-0 shadow-xl animate-scale-in">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Camera className="h-5 w-5 text-primary" />
                  Pre-Setup Photo
                </CardTitle>
                <CardDescription>
                  Capture the venue before setup begins
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {event.preSetupPhotoUrl ? (
                  <div className="space-y-2">
                    <img 
                      src={event.preSetupPhotoUrl} 
                      alt="Pre-setup" 
                      className="w-full h-48 object-cover rounded-lg"
                    />
                    {event.preSetupNotes && (
                      <p className="text-sm text-muted-foreground">📝 {event.preSetupNotes}</p>
                    )}
                    <Badge variant="outline" className="text-success">
                      <CheckCircle className="h-3 w-3 mr-1" /> Uploaded
                    </Badge>
                  </div>
                ) : (
                  <>
                    <div className="space-y-2">
                      <Label>Notes (optional)</Label>
                      <Textarea
                        placeholder="Add any notes about the venue..."
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                      />
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      capture="environment"
                      ref={preSetupPhotoRef}
                      className="hidden"
                      onChange={(e) => handleFileChange(e, handlePreSetupPhoto)}
                    />
                    <Button
                      onClick={() => preSetupPhotoRef.current?.click()}
                      variant="secondary"
                      className="w-full"
                      disabled={updating || uploading}
                    >
                      {updating || uploading ? (
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      ) : (
                        <Upload className="h-4 w-4 mr-2" />
                      )}
                      Upload Pre-Setup Photo
                    </Button>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Post-setup Photo */}
            {event.preSetupPhotoUrl && (
              <Card className="border-0 shadow-xl animate-scale-in">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Camera className="h-5 w-5 text-primary" />
                    Post-Setup Photo
                  </CardTitle>
                  <CardDescription>
                    Capture the venue after setup is complete
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Notes (optional)</Label>
                    <Textarea
                      placeholder="Add any notes about the setup..."
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                    />
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    capture="environment"
                    ref={postSetupPhotoRef}
                    className="hidden"
                    onChange={(e) => handleFileChange(e, handlePostSetupPhoto)}
                  />
                  <Button
                    onClick={() => postSetupPhotoRef.current?.click()}
                    variant="hero"
                    className="w-full"
                    disabled={updating || uploading}
                  >
                    {updating || uploading ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : (
                      <Upload className="h-4 w-4 mr-2" />
                    )}
                    Upload Post-Setup Photo & Complete Setup
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {event.status === 'setup_complete' && (
          <Card className="border-0 shadow-xl animate-scale-in">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-success" />
                Closing Confirmation
              </CardTitle>
              <CardDescription>
                Get the closing OTP from the customer to complete the event.
                <br />
                <Badge variant="secondary" className="mt-2">
                  Mock OTP: {event.closingOtp}
                </Badge>
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                {event.preSetupPhotoUrl && (
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Before</p>
                    <img 
                      src={event.preSetupPhotoUrl} 
                      alt="Pre-setup" 
                      className="w-full h-32 object-cover rounded-lg"
                    />
                  </div>
                )}
                {event.postSetupPhotoUrl && (
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">After</p>
                    <img 
                      src={event.postSetupPhotoUrl} 
                      alt="Post-setup" 
                      className="w-full h-32 object-cover rounded-lg"
                    />
                  </div>
                )}
              </div>
              <div className="flex gap-2">
                <Input
                  placeholder="Enter closing OTP"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  maxLength={4}
                  className="flex-1"
                />
                <Button 
                  onClick={handleVerifyClosingOtp}
                  variant="success"
                  disabled={otp.length !== 4 || updating}
                >
                  {updating ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Complete'}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {event.status === 'completed' && (
          <Card className="border-0 shadow-xl bg-success/10 animate-scale-in">
            <CardContent className="p-8 text-center">
              <div className="w-16 h-16 rounded-full bg-success/20 flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="h-8 w-8 text-success" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-2">Event Completed!</h3>
              <p className="text-muted-foreground mb-4">
                This event was successfully completed on{' '}
                {event.completedAt && format(new Date(event.completedAt), 'MMM dd, yyyy at h:mm a')}
              </p>
              <div className="grid grid-cols-2 gap-4 mt-6">
                {event.preSetupPhotoUrl && (
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Before</p>
                    <img 
                      src={event.preSetupPhotoUrl} 
                      alt="Pre-setup" 
                      className="w-full h-32 object-cover rounded-lg"
                    />
                  </div>
                )}
                {event.postSetupPhotoUrl && (
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">After</p>
                    <img 
                      src={event.postSetupPhotoUrl} 
                      alt="Post-setup" 
                      className="w-full h-32 object-cover rounded-lg"
                    />
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
};

export default EventDetail;
