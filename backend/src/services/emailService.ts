import nodemailer from "nodemailer";

export const sendResetEmail = async (to: string, resetToken: string) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const resetLink = `http://localhost:5173/reset-password/${resetToken}`;

  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to,
    subject: "Password Reset Request",
    html: `
      <h2>Password Reset</h2>
      <p>Click below to reset your password:</p>
      <a href="${resetLink}" style="font-size:16px;">Reset Password</a>
    `,
  });

  return true;
};

export const sendVerificationEmail = async (to: string, token: string) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const verificationLink = `http://localhost:5173/verify-email/${token}`;

  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to,
    subject: "Verify Your Email - E-Library",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
        <h2 style="color: #6366f1;">Welcome to E-Library!</h2>
        <p>Thank you for signing up. Please verify your email to activate your account:</p>
        <a href="${verificationLink}" style="display: inline-block; padding: 12px 24px; background-color: #6366f1; color: white; text-decoration: none; border-radius: 6px; font-weight: bold; margin: 20px 0;">Verify Email Address</a>
        <p style="color: #64748b; font-size: 0.875rem;">If you did not create this account, you can safely ignore this email.</p>
      </div>
    `,
  });

  return true;
};
