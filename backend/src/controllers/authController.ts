import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User';
import OTP from '../models/OTP';
import { AuthRequest } from '../middleware/auth';

const signToken = (id: string): string =>
  jwt.sign({ id }, process.env.JWT_SECRET as string, { expiresIn: process.env.JWT_EXPIRES_IN || '7d' } as jwt.SignOptions);

const sendTokenResponse = (user: any, statusCode: number, res: Response): void => {
  const token = signToken(user._id.toString());
  res.status(statusCode).json({ success: true, token, user: { id: user._id, name: user.name, email: user.email, phone: user.phone, role: user.role } });
};

export const register = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { name, email, password, phone, otp } = req.body;
    if (!name || !email || !password) { res.status(400).json({ success: false, message: 'Please provide name, email, and password.' }); return; }
    
    const existingUser = await User.findOne({ email });
    if (existingUser) { res.status(400).json({ success: false, message: 'An account with this email already exists.' }); return; }

    if (!otp) {
      // Phase 1: Generate & Send OTP
      const code = Math.floor(100000 + Math.random() * 900000).toString();
      await OTP.deleteMany({ email });
      await OTP.create({ email, code, expiresAt: new Date(Date.now() + 5 * 60 * 1000) });

      console.log(`\n--------------------------------------------`);
      console.log(`✉️  [OTP SERVICE] Register verification code for ${email}: ${code}`);
      if (phone) {
        console.log(`📱 [SMS SERVICE] Register verification code sent to phone ${phone}: ${code}`);
      }
      console.log(`--------------------------------------------\n`);

      const message = phone 
        ? 'Verification OTP has been sent to your email and phone.'
        : 'Verification OTP has been sent to your email.';
      res.status(200).json({ success: true, requireOtp: true, message });
      return;
    }

    // Phase 2: Verify OTP
    const otpRecord = await OTP.findOne({ email, code: otp });
    if (!otpRecord) { res.status(400).json({ success: false, message: 'Invalid or expired OTP.' }); return; }
    
    await OTP.deleteOne({ _id: otpRecord._id });
    
    const user = await User.create({ name, email, phone, password, role: 'customer' });
    sendTokenResponse(user, 201, res);
  } catch (error) { next(error); }
};

export const login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { email, password, otp } = req.body;
    if (!email || !password) { res.status(400).json({ success: false, message: 'Please provide email and password.' }); return; }
    
    const user = await User.findOne({ email }).select('+password');
    if (!user) { res.status(401).json({ success: false, message: 'Invalid email or password.' }); return; }
    
    const isMatch = await user.comparePassword(password);
    if (!isMatch) { res.status(401).json({ success: false, message: 'Invalid email or password.' }); return; }

    if (!otp) {
      // Phase 1: Generate & Send OTP
      const code = Math.floor(100000 + Math.random() * 900000).toString();
      await OTP.deleteMany({ email });
      await OTP.create({ email, code, expiresAt: new Date(Date.now() + 5 * 60 * 1000) });

      console.log(`\n--------------------------------------------`);
      console.log(`✉️  [OTP SERVICE] Login verification code for ${email}: ${code}`);
      if (user.phone) {
        console.log(`📱 [SMS SERVICE] Login verification code sent to phone ${user.phone}: ${code}`);
      }
      console.log(`--------------------------------------------\n`);

      const message = user.phone 
        ? 'Verification OTP has been sent to your email and phone.'
        : 'Verification OTP has been sent to your email.';
      res.status(200).json({ success: true, requireOtp: true, message });
      return;
    }

    // Phase 2: Verify OTP
    const otpRecord = await OTP.findOne({ email, code: otp });
    if (!otpRecord) { res.status(400).json({ success: false, message: 'Invalid or expired OTP.' }); return; }
    
    await OTP.deleteOne({ _id: otpRecord._id });
    
    sendTokenResponse(user, 200, res);
  } catch (error) { next(error); }
};

export const getMe = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const user = await User.findById(req.user?.id);
    if (!user) { res.status(404).json({ success: false, message: 'User not found.' }); return; }
    res.status(200).json({ success: true, user: { id: user._id, name: user.name, email: user.email, role: user.role, createdAt: user.createdAt } });
  } catch (error) { next(error); }
};

export const createAdmin = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { name, email, password, adminSecret } = req.body;
    if (adminSecret !== process.env.JWT_SECRET) { res.status(403).json({ success: false, message: 'Invalid admin secret.' }); return; }
    const existingUser = await User.findOne({ email });
    if (existingUser) { res.status(400).json({ success: false, message: 'User already exists.' }); return; }
    const user = await User.create({ name, email, password, role: 'admin' });
    sendTokenResponse(user, 201, res);
  } catch (error) { next(error); }
};
