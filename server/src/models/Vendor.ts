import mongoose, { Document, Schema } from 'mongoose';

export interface IVendor extends Document {
  name: string;
  email?: string;
  phone?: string;
  user: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const VendorSchema: Schema = new Schema({
  name: { type: String, required: true },
  email: { type: String },
  phone: { type: String },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
}, {
  timestamps: true,
});

export default mongoose.model<IVendor>('Vendor', VendorSchema);