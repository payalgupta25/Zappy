import { useState } from 'react';
import { toast } from 'sonner';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

export function usePhotoUpload() {
  const [uploading, setUploading] = useState(false);

  const uploadPhoto = async (file: File, folder: string): Promise<string | null> => {
    setUploading(true);
    
    const formData = new FormData();
    formData.append('photo', file);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/upload`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        setUploading(false);
        return data.photoUrl;
      } else {
        toast.error('Failed to upload photo');
        setUploading(false);
        return null;
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload photo');
      setUploading(false);
      return null;
    }
  };

  return { uploadPhoto, uploading };
}
