import { useState, useEffect } from 'react';
import { useVendor } from './useVendor';
import { toast } from 'sonner';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

export type EventStatus = 'pending' | 'checked_in' | 'started' | 'setup_complete' | 'completed';

export interface Event {
  _id: string;
  vendor: string;
  customerName: string;
  customerPhone: string;
  eventLocation: string;
  eventDate: string;
  status: EventStatus;
  checkInPhotoUrl?: string;
  checkInLatitude?: number;
  checkInLongitude?: number;
  checkInTimestamp?: string;
  startOtp?: string;
  startOtpVerifiedAt?: string;
  preSetupPhotoUrl?: string;
  preSetupNotes?: string;
  postSetupPhotoUrl?: string;
  postSetupNotes?: string;
  setupCompletedAt?: string;
  closingOtp?: string;
  closingOtpVerifiedAt?: string;
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export function useEvents() {
  const { vendor } = useVendor();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchEvents = async () => {
    if (!vendor) {
      setEvents([]);
      setLoading(false);
      return;
    }

    const token = localStorage.getItem('token');
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/events`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setEvents(data);
      } else {
        toast.error('Failed to load events');
      }
    } catch (error) {
      console.error('Error fetching events:', error);
      toast.error('Failed to load events');
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchEvents();
  }, [vendor]);

  const createEvent = async (eventData: {
    customer_name: string;
    customer_phone: string;
    event_location: string;
    event_date: string;
  }) => {
    if (!vendor) return { error: new Error('Vendor not found') };

    const token = localStorage.getItem('token');
    if (!token) return { error: new Error('No token') };

    try {
      const response = await fetch(`${API_BASE_URL}/events`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          customerName: eventData.customer_name,
          customerPhone: eventData.customer_phone,
          eventLocation: eventData.event_location,
          eventDate: eventData.event_date,
          vendorId: vendor._id,
        }),
      });
      if (response.ok) {
        const data = await response.json();
        toast.success('Event created successfully');
        await fetchEvents();
        return { data, error: null };
      } else {
        const error = await response.json();
        toast.error('Failed to create event');
        return { data: null, error };
      }
    } catch (error) {
      toast.error('Failed to create event');
      return { data: null, error };
    }
  };

  const updateEvent = async (eventId: string, updates: Partial<Event>) => {
    const token = localStorage.getItem('token');
    if (!token) return { data: null, error: new Error('No token') };

    try {
      const response = await fetch(`${API_BASE_URL}/events/${eventId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(updates),
      });
      if (response.ok) {
        const data = await response.json();
        await fetchEvents();
        return { data, error: null };
      } else {
        const error = await response.json();
        toast.error('Failed to update event');
        return { data: null, error };
      }
    } catch (error) {
      toast.error('Failed to update event');
      return { data: null, error };
    }
  };

  return {
    events,
    loading,
    createEvent,
    updateEvent,
    refetch: fetchEvents,
  };
}
