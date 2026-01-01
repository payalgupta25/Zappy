import { Event, EventStatus } from '@/hooks/useEvents';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapPin, Clock, User, ChevronRight } from 'lucide-react';
import { format } from 'date-fns';

interface EventCardProps {
  event: Event;
  onClick?: () => void;
}

const statusConfig: Record<EventStatus, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
  pending: { label: 'Pending', variant: 'secondary' },
  checked_in: { label: 'Checked In', variant: 'default' },
  started: { label: 'In Progress', variant: 'default' },
  setup_complete: { label: 'Setup Done', variant: 'default' },
  completed: { label: 'Completed', variant: 'outline' },
};

const EventCard = ({ event, onClick }: EventCardProps) => {
  const status = statusConfig[event.status];
  const isActive = event.status !== 'pending' && event.status !== 'completed';

  return (
    <Card 
      className={`cursor-pointer transition-all duration-200 hover:shadow-lg border-0 shadow-md ${
        isActive ? 'ring-2 ring-primary/20 shadow-primary/10' : ''
      }`}
      onClick={onClick}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <Badge variant={status.variant} className="font-medium">
                {status.label}
              </Badge>
              {isActive && (
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                </span>
              )}
            </div>
            
            <h3 className="font-semibold text-foreground truncate mb-3">
              {event.customerName}
            </h3>
            
            <div className="space-y-1.5">
              <div className="flex items-center text-sm text-muted-foreground">
                <MapPin className="h-4 w-4 mr-2 flex-shrink-0 text-primary/70" />
                <span className="truncate">{event.eventLocation}</span>
              </div>
              <div className="flex items-center text-sm text-muted-foreground">
                <Clock className="h-4 w-4 mr-2 flex-shrink-0 text-primary/70" />
                <span>{format(new Date(event.eventDate), 'MMM dd, yyyy')}</span>
              </div>
              <div className="flex items-center text-sm text-muted-foreground">
                <User className="h-4 w-4 mr-2 flex-shrink-0 text-primary/70" />
                <span>{event.customerPhone}</span>
              </div>
            </div>
          </div>
          
          <ChevronRight className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-1" />
        </div>
      </CardContent>
    </Card>
  );
};

export default EventCard;
