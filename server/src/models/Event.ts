import mongoose, { Document, Schema } from 'mongoose';

export type EventStatus = 'pending' | 'checked_in' | 'started' | 'setup_complete' | 'completed';

export interface IEvent extends Document {
  customerName: string;
  customerPhone: string;
  eventDate: string;
  eventLocation: string;
  vendor: mongoose.Types.ObjectId;
  status: EventStatus;
  checkInLatitude?: number;
  checkInLongitude?: number;
  checkInPhotoUrl?: string;
  checkInTimestamp?: string;
  startOtp?: string;
  startOtpVerifiedAt?: string;
  setupCompletedAt?: string;
  preSetupNotes?: string;
  preSetupPhotoUrl?: string;
  postSetupNotes?: string;
  postSetupPhotoUrl?: string;
  closingOtp?: string;
  closingOtpVerifiedAt?: string;
  completedAt?: string;
  createdAt: Date;
  updatedAt: Date;
}

const EventSchema: Schema = new Schema({
  customerName: { type: String, required: true },
  customerPhone: { type: String, required: true },
  eventDate: { type: String, required: true },
  eventLocation: { type: String, required: true },
  vendor: { type: mongoose.Schema.Types.ObjectId, ref: 'Vendor', required: true },
  status: { type: String, enum: ['pending', 'checked_in', 'started', 'setup_complete', 'completed'], default: 'pending' },
  checkInLatitude: { type: Number },
  checkInLongitude: { type: Number },
  checkInPhotoUrl: { type: String },
  checkInTimestamp: { type: String },
  startOtp: { type: String },
  startOtpVerifiedAt: { type: String },
  setupCompletedAt: { type: String },
  preSetupNotes: { type: String },
  preSetupPhotoUrl: { type: String },
  postSetupNotes: { type: String },
  postSetupPhotoUrl: { type: String },
  closingOtp: { type: String },
  closingOtpVerifiedAt: { type: String },
  completedAt: { type: String },
}, {
  timestamps: true,
});

export default mongoose.model<IEvent>('Event', EventSchema);