import nodemailer from 'nodemailer';
import twilio from 'twilio';

// Config variables
const {
  SMTP_HOST,
  SMTP_PORT,
  SMTP_USER,
  SMTP_PASS,
  SMTP_FROM,
  TWILIO_ACCOUNT_SID,
  TWILIO_AUTH_TOKEN,
  TWILIO_PHONE_NUMBER
} = process.env;

export const sendOtpEmail = async (email: string, code: string): Promise<boolean> => {
  if (SMTP_HOST && SMTP_USER && SMTP_PASS) {
    try {
      const transporter = nodemailer.createTransport({
        host: SMTP_HOST,
        port: parseInt(SMTP_PORT || '587', 10),
        secure: SMTP_PORT === '465', // true for 465, false for other ports
        auth: {
          user: SMTP_USER,
          pass: SMTP_PASS,
        },
      });

      const mailOptions = {
        from: SMTP_FROM || `"SwiftShip Verification" <${SMTP_USER}>`,
        to: email,
        subject: 'SwiftShip Verification Code',
        text: `Your verification code is ${code}. It will expire in 5 minutes.`,
        html: `
          <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #f4f4f5; border-radius: 10px; max-width: 500px; margin: auto;">
            <h2 style="color: #6366f1; text-align: center;">SwiftShip Verification</h2>
            <p>Hello,</p>
            <p>Your 6-digit verification code is:</p>
            <div style="font-size: 32px; font-weight: bold; letter-spacing: 5px; text-align: center; padding: 15px; background-color: #ffffff; border-radius: 8px; border: 1px solid #e4e4e7; margin: 20px 0; color: #1e1b4b;">
              ${code}
            </div>
            <p style="color: #71717a; font-size: 12px; text-align: center;">This code will expire in 5 minutes. If you did not request this code, please ignore this email.</p>
          </div>
        `,
      };

      await transporter.sendMail(mailOptions);
      console.log(`✉️ [EMAIL SENT] OTP successfully sent to email: ${email}`);
      return true;
    } catch (error) {
      console.error(`❌ [EMAIL ERROR] Failed to send email to ${email}:`, error);
    }
  }

  // Fallback: Console logging
  console.log(`\n--------------------------------------------`);
  console.log(`✉️  [OTP SERVICE] (Simulated Email) Verification code for ${email}: ${code}`);
  console.log(`--------------------------------------------\n`);
  return false;
};

export const sendOtpSms = async (phone: string, code: string): Promise<boolean> => {
  if (TWILIO_ACCOUNT_SID && TWILIO_AUTH_TOKEN && TWILIO_PHONE_NUMBER) {
    try {
      const client = twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);
      await client.messages.create({
        body: `Your SwiftShip verification code is ${code}. It expires in 5 minutes.`,
        from: TWILIO_PHONE_NUMBER,
        to: phone,
      });
      console.log(`📱 [SMS SENT] OTP successfully sent to phone: ${phone}`);
      return true;
    } catch (error) {
      console.error(`❌ [SMS ERROR] Failed to send SMS to ${phone}:`, error);
    }
  }

  // Fallback: Console logging
  console.log(`\n--------------------------------------------`);
  console.log(`📱 [SMS SERVICE] (Simulated SMS) Verification code sent to phone ${phone}: ${code}`);
  console.log(`--------------------------------------------\n`);
  return false;
};
