import mongoose from 'mongoose';
import crypto from 'crypto';

const otpSchema = new mongoose.Schema({
  email: { type: String, required: true, lowercase: true, trim: true },
  otp: { type: String, required: true },
  expiresAt: { type: Date, required: true },
  used: { type: Boolean, default: false },
}, { timestamps: true });

otpSchema.index({ email: 1 });
otpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

otpSchema.statics.generate = function (email) {
  const otp = crypto.randomInt(100000, 999999).toString();
  return this.create({ email, otp, expiresAt: new Date(Date.now() + 10 * 60 * 1000) });
};

const Otp = mongoose.model('Otp', otpSchema);
export default Otp;
