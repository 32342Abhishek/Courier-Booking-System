import { Request, Response, NextFunction } from 'express';
import Shipment from '../models/Shipment';
import { AuthRequest } from '../middleware/auth';
import { ShipmentStatus } from '../models/Shipment';

const STATUS_ORDER: ShipmentStatus[] = ['Approved', 'In Transit', 'Delivered'];

export const trackShipment = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const shipment = await Shipment.findOne({ trackingNumber: req.params.trackingNumber })
      .populate({ path: 'booking', select: 'bookingId receiverName packageType packageWeight senderName createdAt', populate: { path: 'customer', select: 'name email' } });
    if (!shipment) { res.status(404).json({ success: false, message: `No shipment found with tracking number ${req.params.trackingNumber}. Please check and try again.` }); return; }
    res.status(200).json({ success: true, data: shipment });
  } catch (error) { next(error); }
};

export const getAllShipments = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const shipments = await Shipment.find()
      .populate({ path: 'booking', select: 'bookingId receiverName packageWeight packageType senderName', populate: { path: 'customer', select: 'name email' } })
      .sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: shipments.length, data: shipments });
  } catch (error) { next(error); }
};

export const updateShipmentStatus = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { status, note } = req.body;
    if (!status) { res.status(400).json({ success: false, message: 'Status is required.' }); return; }
    if (!STATUS_ORDER.includes(status as ShipmentStatus)) { res.status(400).json({ success: false, message: `Invalid status. Must be one of: ${STATUS_ORDER.join(', ')}` }); return; }
    const shipment = await Shipment.findById(req.params.id);
    if (!shipment) { res.status(404).json({ success: false, message: 'Shipment not found.' }); return; }
    const currentIndex = STATUS_ORDER.indexOf(shipment.status);
    const newIndex = STATUS_ORDER.indexOf(status as ShipmentStatus);
    if (newIndex <= currentIndex) { res.status(400).json({ success: false, message: `Cannot move from "${shipment.status}" to "${status}". Status can only move forward.` }); return; }
    shipment.status = status as ShipmentStatus;
    shipment.statusHistory.push({ status: status as ShipmentStatus, timestamp: new Date(), note: note || `Status updated to ${status}` });
    await shipment.save();
    res.status(200).json({ success: true, message: `Shipment status updated to ${status}.`, data: shipment });
  } catch (error) { next(error); }
};
