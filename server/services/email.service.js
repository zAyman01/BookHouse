import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '..', '..', '.env') });

let transporter = null;

const getTransporter = async () => {
  if (transporter) return transporter;

  if (process.env.SMTP_HOST && process.env.SMTP_USER) {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT) || 587,
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  } else {
    const testAccount = await nodemailer.createTestAccount();
    transporter = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: { user: testAccount.user, pass: testAccount.pass },
    });
    console.log('📧 Using Ethereal test email account:', testAccount.user);
  }
  return transporter;
};

export const sendOtpEmail = async (to, otp) => {
  try {
    const t = await getTransporter();
    const info = await t.sendMail({
      from: `"BookHouse" <${process.env.SMTP_USER || 'noreply@bookhouse.com'}>`,
      to,
      subject: 'Your BookHouse Password Reset Code',
      html: `
        <div style="font-family: 'Inter', system-ui, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px 24px; background: #FAF8F5; border-radius: 12px;">
          <div style="text-align: center; margin-bottom: 24px;">
            <h1 style="font-family: 'Playfair Display', Georgia, serif; font-size: 22px; font-weight: 400; color: #1A1A2E; margin: 0;">
              book<span style="font-weight: 700;">House</span>
            </h1>
          </div>
          <div style="background: #fff; border-radius: 8px; padding: 24px; box-shadow: 0 1px 3px rgba(0,0,0,0.04);">
            <h2 style="font-size: 18px; font-weight: 600; color: #1A1A2E; margin: 0 0 8px;">Reset Your Password</h2>
            <p style="font-size: 14px; color: #6B6570; line-height: 1.6; margin: 0 0 20px;">
              Use the code below to reset your password. This code expires in 10 minutes.
            </p>
            <div style="text-align: center; padding: 16px; background: #FAF8F5; border-radius: 6px; letter-spacing: 8px; font-size: 32px; font-weight: 700; color: #1B3A6B;">
              ${otp}
            </div>
            <p style="font-size: 12px; color: #9C95A0; margin-top: 20px; text-align: center;">
              If you didn't request this, you can safely ignore this email.
            </p>
          </div>
        </div>
      `,
    });

    if (process.env.NODE_ENV === 'development') {
      const previewUrl = nodemailer.getTestMessageUrl(info);
      if (previewUrl) console.log('📧 OTP email preview:', previewUrl);
    }
    return true;
  } catch (err) {
    console.error('Failed to send OTP email:', err.message);
    return false;
  }
};

export const sendSaleNotification = async (to, { bookTitle, buyerName, amount }) => {
  try {
    const t = await getTransporter();
    const info = await t.sendMail({
      from: `"BookHouse Sales" <${process.env.SMTP_USER || 'sales@bookhouse.com'}>`,
      to,
      subject: `🎉 Your book "${bookTitle}" was purchased!`,
      html: `
        <div style="font-family: 'Inter', system-ui, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px 24px; background: #FAF8F5; border-radius: 12px;">
          <div style="text-align: center; margin-bottom: 24px;">
            <h1 style="font-family: 'Playfair Display', Georgia, serif; font-size: 22px; font-weight: 400; color: #1A1A2E; margin: 0;">
              book<span style="font-weight: 700;">House</span>
            </h1>
          </div>
          <div style="background: #fff; border-radius: 8px; padding: 24px; box-shadow: 0 1px 3px rgba(0,0,0,0.04);">
            <h2 style="font-size: 18px; font-weight: 600; color: #1A1A2E; margin: 0 0 8px;">New Sale! 🎉</h2>
            <p style="font-size: 14px; color: #6B6570; line-height: 1.6; margin: 0 0 16px;">
              ${buyerName} just purchased <strong>"${bookTitle}"</strong> for <strong>$${amount.toFixed(2)}</strong>.
            </p>
            <p style="font-size: 12px; color: #9C95A0; margin: 0;">
              Check your dashboard for the latest analytics.
            </p>
          </div>
        </div>
      `,
    });

    if (process.env.NODE_ENV === 'development') {
      const previewUrl = nodemailer.getTestMessageUrl(info);
      if (previewUrl) console.log('📧 Sale notification preview:', previewUrl);
    }
    return true;
  } catch (err) {
    console.error('Failed to send sale notification:', err.message);
    return false;
  }
};
