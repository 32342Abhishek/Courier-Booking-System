import mongoose, { Document, Schema } from 'mongoose';

export type BookingStatus = 'Pending' | 'Approved' | 'Rejected';
export type PackageType = 'Document' | 'Parcel' | 'Fragile' | 'Heavy';

export interface IBooking extends Document {
  bookingId: string;
  customer: mongoose.Types.ObjectId;
  senderName: string;
  senderPhone: string;
  senderAddress: string;
  receiverName: string;
  receiverPhone: string;
  receiverAddress: string;
  packageType: PackageType;
  packageWeight: number;
  packageImage?: string;
  calculatedPrice?: number;
  status: BookingStatus;
  shipment?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const BookingSchema = new Schema<IBooking>(
  {
    bookingId: { type: String, unique: true },
    customer: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    senderName: { type: String, required: [true, 'Sender name is required'], trim: true },
    senderPhone: { type: String, required: [true, 'Sender phone is required'], trim: true, match: [/^[0-9+\-\s()]{7,15}$/, 'Enter a valid phone number'] },
    senderAddress: { type: String, required: [true, 'Sender address is required'], trim: true },
    receiverName: { type: String, required: [true, 'Receiver name is required'], trim: true },
    receiverPhone: { type: String, required: [true, 'Receiver phone is required'], trim: true, match: [/^[0-9+\-\s()]{7,15}$/, 'Enter a valid phone number'] },
    receiverAddress: { type: String, required: [true, 'Receiver address is required'], trim: true },
    packageType: { type: String, enum: ['Document', 'Parcel', 'Fragile', 'Heavy'], required: true },
    packageWeight: { type: Number, required: true, min: [0.1, 'Weight must be at least 0.1 kg'], max: [1000, 'Weight cannot exceed 1000 kg'] },
    packageImage: { type: String, default: '' },
    calculatedPrice: { type: Number, default: 0 },
    status: { type: String, enum: ['Pending', 'Approved', 'Rejected'], default: 'Pending' },
    shipment: { type: Schema.Types.ObjectId, ref: 'Shipment', default: null },
  },
  { timestamps: true }
);

BookingSchema.pre('save', async function (next) {
  if (!this.bookingId) {
    const count = await mongoose.model('Booking').countDocuments();
    this.bookingId = `BK-${String(count + 1).padStart(4, '0')}`;
  }
  next();
});

const Booking = mongoose.model<IBooking>('Booking', BookingSchema);
export default Booking;
