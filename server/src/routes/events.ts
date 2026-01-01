import express, { Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import Event from '../models/Event';
import Vendor from '../models/Vendor';
import auth from '../middleware/auth';

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