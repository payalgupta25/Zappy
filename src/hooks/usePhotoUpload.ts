import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export function usePhotoUpload() {
  const [uploading, setUploading] = useState(false);

  const uploadPhoto = async (file: File, folder: string): Promise<string | null> => {
    setUploading(true);
    
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${folder}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('event-photos')
        .upload(fileName, file);

      if (uploadError) {
        console.error('Upload error:', uploadError);
        toast.error('Failed to upload photo');
        return null;
      }

      const { data } = supabase.storage
        .from('event-photos')
        .getPublicUrl(fileName);

      toast.success('Photo uploaded successfully');
      return data.publicUrl;
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload photo');
      return null;
    } finally {
      setUploading(false);
    }
  };

  return { uploadPhoto, uploading };
}
