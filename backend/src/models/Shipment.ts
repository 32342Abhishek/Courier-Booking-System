import mongoose, { Document, Schema } from 'mongoose';

export type ShipmentStatus = 'Approved' | 'In Transit' | 'Delivered';

export interface IStatusHistory {
  status: ShipmentStatus;
  timestamp: Date;
  note?: string;
}

export interface IShipment extends Document {
  trackingNumber: string;
  booking: mongoose.Types.ObjectId;
  status: ShipmentStatus;
  statusHistory: IStatusHistory[];
  createdAt: Date;
  updatedAt: Date;
}

const StatusHistorySchema = new Schema<IStatusHistory>(
  {
    status: { type: String, enum: ['Approved', 'In Transit', 'Delivered'], required: true },
    timestamp: { type: Date, default: Date.now },
    note: { type: String, trim: true },
  },
  { _id: false }
);

const ShipmentSchema = new Schema<IShipment>(
  {
    trackingNumber: { type: String, unique: true, required: true },
    booking: { type: Schema.Types.ObjectId, ref: 'Booking', required: true },
    status: { type: String, enum: ['Approved', 'In Transit', 'Delivered'], default: 'Approved' },
    statusHistory: { type: [StatusHistorySchema], default: [] },
  },
  { timestamps: true }
);

const Shipment = mongoose.model<IShipment>('Shipment', ShipmentSchema);
export default Shipment;
