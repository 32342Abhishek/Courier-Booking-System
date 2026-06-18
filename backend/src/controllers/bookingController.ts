import { Response, NextFunction } from 'express';
import Booking from '../models/Booking';
import Shipment from '../models/Shipment';
import { AuthRequest } from '../middleware/auth';
import { generateTrackingNumber } from '../utils/trackingGenerator';

export const createBooking = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { senderName, senderPhone, senderAddress, receiverName, receiverPhone, receiverAddress, packageType, packageWeight, packageImage, calculatedPrice } = req.body;
    if (!senderName || !senderPhone || !senderAddress || !receiverName || !receiverPhone || !receiverAddress || !packageType || !packageWeight) {
      res.status(400).json({ success: false, message: 'All fields are required.' }); return;
    }
    if (packageWeight <= 0) { res.status(400).json({ success: false, message: 'Package weight must be greater than 0.' }); return; }
    
    const booking = await Booking.create({ 
      customer: req.user?.id, 
      senderName, 
      senderPhone, 
      senderAddress,
      receiverName, 
      receiverPhone, 
      receiverAddress,
      packageType, 
      packageWeight, 
      packageImage: packageImage || '',
      calculatedPrice: calculatedPrice || 0,
      status: 'Pending' 
    });
    res.status(201).json({ success: true, data: booking });
  } catch (error) { next(error); }
};

export const getMyBookings = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const bookings = await Booking.find({ customer: req.user?.id }).populate('shipment', 'trackingNumber status').sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: bookings.length, data: bookings });
  } catch (error) { next(error); }
};

export const getAllBookings = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const bookings = await Booking.find().populate('customer', 'name email').populate('shipment', 'trackingNumber status').sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: bookings.length, data: bookings });
  } catch (error) { next(error); }
};

export const approveBooking = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) { res.status(404).json({ success: false, message: 'Booking not found.' }); return; }
    if (booking.status !== 'Pending') { res.status(400).json({ success: false, message: `Booking is already ${booking.status}.` }); return; }
    const trackingNumber = await generateTrackingNumber();
    const shipment = await Shipment.create({ trackingNumber, booking: booking._id, status: 'Approved', statusHistory: [{ status: 'Approved', timestamp: new Date(), note: 'Booking approved by admin' }] });
    booking.status = 'Approved';
    booking.shipment = shipment._id as any;
    await booking.save();
    res.status(200).json({ success: true, message: 'Booking approved and shipment created.', data: { booking, shipment } });
  } catch (error) { next(error); }
};

export const rejectBooking = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) { res.status(404).json({ success: false, message: 'Booking not found.' }); return; }
    if (booking.status !== 'Pending') { res.status(400).json({ success: false, message: `Booking is already ${booking.status}.` }); return; }
    booking.status = 'Rejected';
    await booking.save();
    res.status(200).json({ success: true, message: 'Booking rejected.', data: booking });
  } catch (error) { next(error); }
};
