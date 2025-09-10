import nconf from 'nconf';
import User from '../../models/user'; // adjust path if different
import { sendEmail } from '../../libs/email';
import {
  generateVerificationToken,
  tokenExpiryHours,
} from '../../libs/verification'; 
import { authWithSession } from '../../middlewares/auth';

const BASE_URL = nconf.get('BASE_URL') || 'https://habitica.com';


// Controller for verification-related endpoints.
// Exports an array of route configs (method, url, middlewares, handler)

export default {
  // POST /api/v3/user/send-verification
  sendVerification: {
    method: 'POST',
    url: '/user/send-verification',
    middlewares: [authWithSession],
    async handler(req, res) {
      const user = req.user;

      // If already verified, no need to send again
      if (user.verification?.verified) {
        return res.status(400).json({ error: 'Email already verified' });
      }

      // Generate token
      const token = generateVerificationToken();
      user.verification = {
        verified: false,
        token,
        tokenExpires: tokenExpiryHours(48),
      };
      await user.save();

      const verifyUrl = `${BASE_URL}/verify-email?token=${token}`;

      await sendEmail({
        to: user.email,
        subject: 'Verify your Habitica account',
        html: `
          <p>Hello ${user.profile?.name || 'Adventurer'},</p>
          <p>Please verify your email by clicking the link below:</p>
          <p><a href="${verifyUrl}">${verifyUrl}</a></p>
          <p>Thanks for joining Habitica!</p>
        `,
        text: `Verify your email: ${verifyUrl}`,
      });

      return res.status(200).json({
        success: true,
        message: 'Verification email sent successfully',
      });
    },
  },

  // GET /api/v3/user/verify/:token
  verifyEmail: {
    method: 'GET',
    url: '/user/verify/:token',
    middlewares: [],
    async handler(req, res) {
      const { token } = req.params;
      if (!token) {
        return res.status(400).json({ error: 'Missing token' });
      }

      const user = await User.findOne({ 'verification.token': token });
      if (!user) {
        return res.status(400).json({ error: 'Invalid or expired token' });
      }

      if (user.verification.tokenExpires && user.verification.tokenExpires < new Date()) {
        return res.status(400).json({ error: 'Token expired' });
      }

      user.verification.verified = true;
      user.verification.token = null;
      user.verification.tokenExpires = null;
      await user.save();

      return res.status(200).json({
        success: true,
        message: 'Email verified successfully',
      });
    },
  },
};
