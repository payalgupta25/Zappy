import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useVendor } from './useVendor';
import { toast } from 'sonner';

export type EventStatus = 'pending' | 'checked_in' | 'started' | 'setup_complete' | 'completed';

export interface Event {
  id: string;
  vendor_id: string;
  customer_name: string;
  customer_phone: string;
  event_location: string;
  event_date: string;
  status: EventStatus;
  check_in_photo_url: string | null;
  check_in_latitude: number | null;
  check_in_longitude: number | null;
  check_in_timestamp: string | null;
  start_otp: string | null;
  start_otp_verified_at: string | null;
  pre_setup_photo_url: string | null;
  pre_setup_notes: string | null;
  post_setup_photo_url: string | null;
  post_setup_notes: string | null;
  setup_completed_at: string | null;
  closing_otp: string | null;
  closing_otp_verified_at: string | null;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
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

    const { data, error } = await supabase
      .from('events')
      .select('*')
      .eq('vendor_id', vendor.id)
      .order('event_date', { ascending: false });

    if (error) {
      console.error('Error fetching events:', error);
      toast.error('Failed to load events');
    } else {
      setEvents(data as Event[]);
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

    const { data, error } = await supabase
      .from('events')
      .insert({
        ...eventData,
        vendor_id: vendor.id,
      })
      .select()
      .single();

    if (error) {
      toast.error('Failed to create event');
      return { data: null, error };
    }

    toast.success('Event created successfully');
    await fetchEvents();
    return { data: data as Event, error: null };
  };

  const updateEvent = async (eventId: string, updates: Partial<Event>) => {
    const { data, error } = await supabase
      .from('events')
      .update(updates)
      .eq('id', eventId)
      .select()
      .single();

    if (error) {
      toast.error('Failed to update event');
      return { data: null, error };
    }

    await fetchEvents();
    return { data: data as Event, error: null };
  };

  return {
    events,
    loading,
    createEvent,
    updateEvent,
    refetch: fetchEvents,
  };
}
