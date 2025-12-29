import { EventStatus } from '@/hooks/useEvents';
import { MapPin, Send, Camera, CheckCircle, Flag } from 'lucide-react';

interface EventStepperProps {
  status: EventStatus;
}

const steps = [
  { key: 'pending', label: 'Check-In', icon: MapPin },
  { key: 'checked_in', label: 'OTP', icon: Send },
  { key: 'started', label: 'Setup', icon: Camera },
  { key: 'setup_complete', label: 'Close', icon: CheckCircle },
  { key: 'completed', label: 'Done', icon: Flag },
];

const statusOrder: EventStatus[] = ['pending', 'checked_in', 'started', 'setup_complete', 'completed'];

const EventStepper = ({ status }: EventStepperProps) => {
  const currentIndex = statusOrder.indexOf(status);

  return (
    <div className="flex items-center justify-between bg-card rounded-xl p-4 shadow-md">
      {steps.map((step, index) => {
        const isCompleted = index < currentIndex;
        const isCurrent = index === currentIndex;
        const isPending = index > currentIndex;

        return (
          <div key={step.key} className="flex items-center">
            <div className="flex flex-col items-center">
              <div
                className={`
                  w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300
                  ${isCompleted ? 'bg-success text-success-foreground' : ''}
                  ${isCurrent ? 'gradient-primary text-primary-foreground animate-pulse-glow' : ''}
                  ${isPending ? 'bg-muted text-muted-foreground' : ''}
                `}
              >
                <step.icon className="h-5 w-5" />
              </div>
              <span 
                className={`text-xs mt-2 font-medium ${
                  isCurrent ? 'text-primary' : 
                  isCompleted ? 'text-success' : 
                  'text-muted-foreground'
                }`}
              >
                {step.label}
              </span>
            </div>
            {index < steps.length - 1 && (
              <div 
                className={`
                  w-8 h-1 mx-1 rounded-full transition-all duration-300
                  ${index < currentIndex ? 'bg-success' : 'bg-muted'}
                `}
              />
            )}
          </div>
        );
      })}
    </div>
  );
};

export default EventStepper;
