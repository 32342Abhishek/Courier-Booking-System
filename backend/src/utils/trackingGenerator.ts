import Shipment from '../models/Shipment';

export const generateTrackingNumber = async (): Promise<string> => {
  const lastShipment = await Shipment.findOne().sort({ createdAt: -1 }).select('trackingNumber');
  if (!lastShipment) return 'TRK-1001';
  const lastNumber = parseInt(lastShipment.trackingNumber.split('-')[1], 10);
  return `TRK-${lastNumber + 1}`;
};
