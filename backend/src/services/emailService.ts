import axios from 'axios';
import logger from '../utils/logger';

interface EmailRecipient {
  name?: string;
  email: string;
}

/**
 * Send an email using Brevo API via Axios
 */
export const sendEmail = async (
  to: string | EmailRecipient[],
  subject: string,
  text: string,
  htmlContent?: string
) => {
  try {
    const apiKey = process.env.BREVO_API_KEY;
    if (!apiKey) {
      logger.warn('BREVO_API_KEY missing in environment. Email not sent.');
      return;
    }

    const senderEmail = process.env.SENDER_EMAIL || process.env.EMAIL_USER;
    const senderName = "E-Library Team";

    const recipients = Array.isArray(to)
      ? to
      : [{ email: to }];

    const payload = {
      sender: { name: senderName, email: senderEmail },
      to: recipients,
      subject,
      textContent: text,
      htmlContent: htmlContent || undefined,
    };

    const response = await axios.post(
      'https://api.brevo.com/v3/smtp/email',
      payload,
      {
        headers: {
          'api-key': apiKey,
          'Content-Type': 'application/json',
        },
      }
    );

    logger.info(`Email sent to ${JSON.stringify(recipients)}: ${response.data?.messageId || 'Success'}`);
  } catch (error: any) {
    logger.error('Email failed:', error.response?.data || error.message);
    // We don't throw here to ensure main flow continues in controllers if needed, 
    // but authController handles rollback if this fails, so consider coordination.
    throw error;
  }
};

// --- E-Library Templates ---

export const getWelcomeEmail = (userName: string) => ({
  subject: "Welcome to E-Library!",
  text: `
Hello ${userName},

Welcome to E-Library! We are thrilled to have you on board.
Explore our vast collection of books, borrow your favorites, and enjoy reading.

Happy Reading,
The E-Library Team
`
});

export const getVerificationEmail = (userName: string, verificationLink: string) => ({
  subject: "Verify Your Email - E-Library",
  text: `
Hello ${userName},

Thank you for signing up for E-Library!
Please verify your email address by clicking the link below:

${verificationLink}

If you did not create this account, you can safely ignore this email.

Regards,
E-Library Team
`,
  htmlContent: `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
      <h2 style="color: #6366f1;">Welcome to E-Library!</h2>
      <p>Thank you for signing up. Please verify your email to activate your account:</p>
      <a href="${verificationLink}" style="display: inline-block; padding: 12px 24px; background-color: #6366f1; color: white; text-decoration: none; border-radius: 6px; font-weight: bold; margin: 20px 0;">Verify Email Address</a>
      <p style="color: #64748b; font-size: 0.875rem;">If you did not create this account, you can safely ignore this email.</p>
    </div>
    `
});

export const getResetPasswordEmail = (userName: string, resetLink: string) => ({
  subject: "Reset Your Password - E-Library",
  text: `
Hello ${userName},

We received a request to reset your password for your E-Library account.
Click the link below to set a new password:

${resetLink}

This link will expire in 10 minutes. If you did not request this, please ignore this email.

Regards,
E-Library Team
`,
  htmlContent: `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
      <h2 style="color: #6366f1;">Password Reset Request</h2>
      <p>You requested a password reset. Click the button below to set a new password:</p>
      <a href="${resetLink}" style="display: inline-block; padding: 12px 24px; background-color: #6366f1; color: white; text-decoration: none; border-radius: 6px; font-weight: bold; margin: 20px 0;">Reset Password</a>
      <p style="color: #64748b; font-size: 0.875rem;">This link will expire in 10 minutes. If you did not request this, you can safely ignore this email.</p>
    </div>
    `
});

export const getBookBorrowedEmail = (userName: string, bookTitle: string, dueDate: string) => ({
  subject: `Book Borrowed: ${bookTitle}`,
  text: `
Hello ${userName},

You have successfully borrowed "${bookTitle}".
Due Date: ${dueDate}

Please ensure you return the book by the due date to avoid fines.

Happy Reading,
E-Library Team
`
});

export const getReturnConfirmedEmail = (userName: string, bookTitle: string) => ({
  subject: `Return Confirmed: ${bookTitle}`,
  text: `
Hello ${userName},

We have received and confirmed your return of "${bookTitle}".
Thank you for using E-Library!

Regards,
E-Library Team
`
});

export const getOverdueReminderEmail = (userName: string, bookTitle: string, fineAmount: number) => ({
  subject: `Overdue Alert: ${bookTitle}`,
  text: `
Hello ${userName},

The book "${bookTitle}" is currently overdue.
Current Fine: ₹${fineAmount}

Please return the book as soon as possible to prevent further fines.

Regards,
E-Library Team
`
});

export const getFinePaidEmail = (userName: string, amount: number) => ({
  subject: `Fine Payment Confirmed: ₹${amount}`,
  text: `
Hello ${userName},

Your fine payment of ₹${amount} has been successfully processed.

Thank you,
E-Library Team
`
});

// Wrapper functions for compatibility with existing codebase
export const sendVerificationEmail = async (email: string, token: string, userName: string = "User") => {
  const verificationLink = `${process.env.CLIENT_URL || "http://localhost:5173"}/verify-email/${token}`;
  const template = getVerificationEmail(userName, verificationLink);
  return sendEmail(email, template.subject, template.text, template.htmlContent);
};

export const sendResetEmail = async (email: string, resetToken: string, userName: string = "User") => {
  const resetLink = `${process.env.CLIENT_URL || "http://localhost:5173"}/reset-password/${resetToken}`;
  const template = getResetPasswordEmail(userName, resetLink);
  return sendEmail(email, template.subject, template.text, template.htmlContent);
};
