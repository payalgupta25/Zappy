import express, { Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
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

// Get vendors for user
router.get('/', auth, async (req: Request, res: Response) => {
  try {
    const vendors = await Vendor.find({ user: req.user!.userId });
    res.json(vendors);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Create vendor
router.post('/', [
  auth,
  body('name').notEmpty(),
], async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { name, email, phone } = req.body;

  try {
    const vendor = new Vendor({ name, email, phone, user: req.user!.userId });
    await vendor.save();
    res.status(201).json(vendor);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Update vendor
router.put('/:id', auth, async (req: Request, res: Response) => {
  try {
    const vendor = await Vendor.findOneAndUpdate(
      { _id: req.params.id, user: req.user!.userId },
      req.body,
      { new: true }
    );
    if (!vendor) {
      return res.status(404).json({ message: 'Vendor not found' });
    }
    res.json(vendor);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete vendor
router.delete('/:id', auth, async (req: Request, res: Response) => {
  try {
    const vendor = await Vendor.findOneAndDelete({ _id: req.params.id, user: req.user!.userId });
    if (!vendor) {
      return res.status(404).json({ message: 'Vendor not found' });
    }
    res.json({ message: 'Vendor deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;