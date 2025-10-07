const nodemailer = require('nodemailer');

// For testing, use Ethereal (fake SMTP)
let transporter;

const setupTransporter = async () => {
  if (process.env.NODE_ENV === 'production') {
    // Use Gmail in production
    return nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_APP_PASSWORD
      }
    });
  } else {
    // Use Ethereal for testing
    const testAccount = await nodemailer.createTestAccount();
    return nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });
  }
};

const sendOTP = async (email, otp, purpose, transporter) => {
  const subject = purpose === 'signup' ? 'Verify Your Account' : 'Login Verification';
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #333;">${subject}</h2>
      <p>Your OTP for ${purpose} is:</p>
      <div style="font-size: 24px; font-weight: bold; color: #007bff; margin: 20px 0;">
        ${otp}
      </div>
      <p>This OTP will expire in 10 minutes.</p>
      <p>If you didn't request this, please ignore this email.</p>
    </div>
  `;

  const mailOptions = {
    from: process.env.NODE_ENV === 'production' ? process.env.EMAIL_USER : 'test@example.com',
    to: email,
    subject,
    html
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log(`OTP sent to ${email}`);
    const previewUrl = process.env.NODE_ENV !== 'production' ? nodemailer.getTestMessageUrl(info) : null;
    if (previewUrl) {
      console.log('Preview URL: ' + previewUrl);
    }
    return { previewUrl };
  } catch (error) {
    console.error('Error sending email:', error);
    throw new Error('Failed to send OTP email');
  }
};

module.exports = { sendOTP };
