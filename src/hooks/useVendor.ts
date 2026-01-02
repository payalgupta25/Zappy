import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';

const API_BASE_URL =
  import.meta.env.VITE_API_URL
    ? `${import.meta.env.VITE_API_URL}/api`
    : '/api';
export interface Vendor {
  _id: string;
  name: string;
  phone?: string;
  email?: string;
  createdAt: string;
  updatedAt: string;
}

export function useVendor() {
  const { user } = useAuth();
  const [vendor, setVendor] = useState<Vendor | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setVendor(null);
      setLoading(false);
      return;
    }

    const fetchVendor = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(`${API_BASE_URL}/vendors`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await response.json();
        setVendor(data[0] || null);
      } catch (error) {
        console.error('Error fetching vendor:', error);
      }
      setLoading(false);
    };

    fetchVendor();
  }, [user]);

  const createVendor = async (name: string, email?: string, phone?: string) => {
    const token = localStorage.getItem('token');
    if (!token) return { error: new Error('No token') };

    try {
      const response = await fetch(`${API_BASE_URL}/api/vendors`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ name, email, phone }),
      });
      if (response.ok) {
        const data = await response.json();
        setVendor(data);
        return { data, error: null };
      } else {
        const error = await response.json();
        return { data: null, error };
      }
    } catch (error) {
      return { data: null, error };
    }
  };

  return { vendor, loading, createVendor };
}
