import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import multer from 'multer';
import path from 'path';
import { createClient } from '@supabase/supabase-js';
import authRoutes from './routes/auth';
import vendorRoutes from './routes/vendors';
import eventRoutes from './routes/events';

dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.VITE_SUPABASE_ANON_KEY!
);

const app = express();
const PORT = process.env.PORT || 5000;

const corsOptions = process.env.CORS_ORIGIN ? { origin: process.env.CORS_ORIGIN } : {};
app.use(cors(corsOptions));
app.use(express.json());

// Configure multer for file uploads (memory storage for Supabase)
const storage = multer.memoryStorage();
const upload = multer({ storage });

mongoose.connect(process.env.MONGODB_URI!)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

app.use('/api/auth', authRoutes);
app.use('/api/vendors', vendorRoutes);
app.use('/api/events', eventRoutes);

app.get('/api/test', (req, res) => {
  res.json({ message: 'Server is working' });
});

app.post('/api/upload', upload.single('photo'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const fileName = `photo-${Date.now()}-${Math.round(Math.random() * 1E9)}${path.extname(req.file.originalname)}`;
    const fileBuffer = req.file.buffer;
    const fileType = req.file.mimetype;

    const { data, error } = await supabase.storage
      .from('uploads') // Make sure this bucket exists in Supabase
      .upload(fileName, fileBuffer, {
        contentType: fileType,
        upsert: false
      });

    if (error) {
      console.error('Supabase upload error:', error);
      return res.status(500).json({ message: 'Upload failed' });
    }

    const { data: publicUrlData } = supabase.storage
      .from('uploads')
      .getPublicUrl(fileName);

    console.log('Uploaded file:', fileName);
    res.json({ photoUrl: publicUrlData.publicUrl });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ message: 'Upload failed' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});