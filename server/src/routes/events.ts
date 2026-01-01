import express, { Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import Event from '../models/Event';
import Vendor from '../models/Vendor';
import auth from '../middleware/auth';
import otpGenerator from 'otp-generator';

declare global {
  namespace Express {
    interface Request {
      user?: { userId: string };
    }
  }
}

const router = express.Router();

// Get events for user's vendors
router.get('/', auth, async (req: Request, res: Response) => {
  try {
    const vendors = await Vendor.find({ user: req.user!.userId });
    const vendorIds = vendors.map(v => v._id);
    const events = await Event.find({ vendor: { $in: vendorIds } }).populate('vendor');
    res.json(events);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Create event
router.post('/', [
  auth,
  body('customerName').notEmpty(),
  body('customerPhone').notEmpty(),
  body('eventDate').notEmpty(),
  body('eventLocation').notEmpty(),
  body('vendorId').notEmpty(),
], async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { customerName, customerPhone, eventDate, eventLocation, vendorId } = req.body;

  try {
    const vendor = await Vendor.findOne({ _id: vendorId, user: req.user!.userId });
    if (!vendor) {
      return res.status(404).json({ message: 'Vendor not found' });
    }

    const event = new Event({
      customerName,
      customerPhone,
      eventDate,
      eventLocation,
      vendor: vendorId,
    });
    await event.save();
    await event.populate('vendor');
    res.status(201).json(event);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Update event
router.put('/:id', auth, async (req: Request, res: Response) => {
  try {
    const vendors = await Vendor.find({ user: req.user!.userId });
    const vendorIds = vendors.map(v => v._id);
    const event = await Event.findOneAndUpdate(
      { _id: req.params.id, vendor: { $in: vendorIds } },
      req.body,
      { new: true }
    ).populate('vendor');
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }
    res.json(event);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Check-in endpoint
router.post('/:id/checkin', auth, [
  body('photoUrl').notEmpty(),
  body('latitude').isNumeric(),
  body('longitude').isNumeric(),
], async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { photoUrl, latitude, longitude } = req.body;

  try {
    const vendors = await Vendor.find({ user: req.user!.userId });
    const vendorIds = vendors.map(v => v._id);
    const startOtp = otpGenerator.generate(4, { digits: true });
    const event = await Event.findOneAndUpdate(
      { _id: req.params.id, vendor: { $in: vendorIds } },
      {
        status: 'checked_in',
        checkInPhotoUrl: photoUrl,
        checkInLatitude: latitude,
        checkInLongitude: longitude,
        checkInTimestamp: new Date().toISOString(),
        startOtp: startOtp,
      },
      { new: true }
    ).populate('vendor');
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }
    res.json({ event, startOtp });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Verify start OTP
router.post('/:id/verify-start-otp', auth, [
  body('otp').notEmpty(),
], async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { otp } = req.body;

  try {
    const vendors = await Vendor.find({ user: req.user!.userId });
    const vendorIds = vendors.map(v => v._id);
    const event = await Event.findOne({ _id: req.params.id, vendor: { $in: vendorIds } });
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }
    if (event.startOtp !== otp) {
      return res.status(400).json({ message: 'Invalid OTP' });
    }
    event.status = 'started';
    event.startOtpVerifiedAt = new Date().toISOString();
    await event.save();
    res.json(event);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Setup complete
router.post('/:id/setup-complete', auth, [
  body('postSetupPhotoUrl').notEmpty(),
  body('postSetupNotes').optional(),
], async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { postSetupPhotoUrl, postSetupNotes } = req.body;

  try {
    const vendors = await Vendor.find({ user: req.user!.userId });
    const vendorIds = vendors.map(v => v._id);
    const closingOtp = otpGenerator.generate(4, { digits: true });
    const event = await Event.findOneAndUpdate(
      { _id: req.params.id, vendor: { $in: vendorIds } },
      {
        status: 'setup_complete',
        postSetupPhotoUrl,
        postSetupNotes,
        setupCompletedAt: new Date().toISOString(),
        closingOtp,
      },
      { new: true }
    ).populate('vendor');
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }
    res.json({ event, closingOtp });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Verify closing OTP
router.post('/:id/verify-closing-otp', auth, [
  body('otp').notEmpty(),
], async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { otp } = req.body;

  try {
    const vendors = await Vendor.find({ user: req.user!.userId });
    const vendorIds = vendors.map(v => v._id);
    const event = await Event.findOne({ _id: req.params.id, vendor: { $in: vendorIds } });
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }
    if (event.closingOtp !== otp) {
      return res.status(400).json({ message: 'Invalid OTP' });
    }
    event.status = 'completed';
    event.closingOtpVerifiedAt = new Date().toISOString();
    event.completedAt = new Date().toISOString();
    await event.save();
    res.json(event);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete event
router.delete('/:id', auth, async (req: Request, res: Response) => {
  try {
    const vendors = await Vendor.find({ user: req.user!.userId });
    const vendorIds = vendors.map(v => v._id);
    const event = await Event.findOneAndDelete({ _id: req.params.id, vendor: { $in: vendorIds } });
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }
    res.json({ message: 'Event deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;