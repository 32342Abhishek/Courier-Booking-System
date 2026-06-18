import mongoose, { Document, Schema } from 'mongoose';

export interface IOTP extends Document {
  email: string;
  code: string;
  expiresAt: Date;
}

const OTPSchema = new Schema<IOTP>({
  email: { type: String, required: true, lowercase: true, trim: true },
  code: { type: String, required: true },
  expiresAt: { type: Date, required: true }
});

// Configure TTL index: automatically delete document after expiresAt timestamp
OTPSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const OTP = mongoose.model<IOTP>('OTP', OTPSchema);
export default OTP;
