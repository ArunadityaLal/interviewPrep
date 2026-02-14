// lib/email.ts
// Simple email utility using Nodemailer (works with Gmail, Outlook, etc.)

import nodemailer from 'nodemailer';

// Email transporter configuration
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
});

// Generate 6-digit OTP
export function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Send verification email with OTP
export async function sendVerificationEmail(email: string, otp: string): Promise<void> {
  const appName = process.env.NEXT_PUBLIC_APP_NAME || 'InterviewPrep Live';
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

  const mailOptions = {
    from: `"${appName}" <${process.env.SMTP_USER}>`,
    to: email,
    subject: `Verify Your Email - ${appName}`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
              line-height: 1.6;
              color: #334155;
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
            }
            .container {
              background: linear-gradient(to bottom right, #f8fafc, #eef2ff);
              border-radius: 16px;
              padding: 40px;
              box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            }
            .logo {
              text-align: center;
              margin-bottom: 30px;
            }
            .logo-box {
              display: inline-block;
              width: 60px;
              height: 60px;
              background: linear-gradient(to bottom right, #6366f1, #8b5cf6);
              border-radius: 12px;
              margin-bottom: 10px;
            }
            .title {
              font-size: 28px;
              font-weight: 700;
              color: #0f172a;
              text-align: center;
              margin-bottom: 10px;
            }
            .subtitle {
              text-align: center;
              color: #64748b;
              margin-bottom: 30px;
            }
            .otp-container {
              background: white;
              border: 3px dashed #e2e8f0;
              border-radius: 12px;
              padding: 30px;
              text-align: center;
              margin: 30px 0;
            }
            .otp-label {
              font-size: 14px;
              color: #64748b;
              text-transform: uppercase;
              letter-spacing: 1px;
              margin-bottom: 10px;
            }
            .otp-code {
              font-size: 48px;
              font-weight: 800;
              color: #6366f1;
              letter-spacing: 8px;
              font-family: 'Courier New', monospace;
            }
            .expiry {
              text-align: center;
              color: #ef4444;
              font-size: 14px;
              margin-top: 20px;
            }
            .footer {
              text-align: center;
              color: #94a3b8;
              font-size: 14px;
              margin-top: 40px;
              padding-top: 30px;
              border-top: 1px solid #e2e8f0;
            }
            .warning {
              background: #fef2f2;
              border-left: 4px solid #ef4444;
              padding: 15px;
              margin-top: 20px;
              border-radius: 8px;
              font-size: 14px;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="logo">
              <div class="logo-box"></div>
              <h1 class="title">Verify Your Email</h1>
              <p class="subtitle">Welcome to ${appName}!</p>
            </div>
            
            <p style="text-align: center; margin-bottom: 30px;">
              Thank you for signing up! Please use the verification code below to complete your registration.
            </p>
            
            <div class="otp-container">
              <div class="otp-label">Your Verification Code</div>
              <div class="otp-code">${otp}</div>
            </div>
            
            <p class="expiry">
              ⏰ This code will expire in 10 minutes
            </p>
            
            <div class="warning">
              <strong>⚠️ Security Notice:</strong> Never share this code with anyone. Our team will never ask for your verification code.
            </div>
            
            <div class="footer">
              <p>If you didn't create an account with ${appName}, please ignore this email.</p>
              <p style="margin-top: 10px;">
                © ${new Date().getFullYear()} ${appName}. All rights reserved.
              </p>
            </div>
          </div>
        </body>
      </html>
    `,
    text: `
      Welcome to ${appName}!
      
      Your verification code is: ${otp}
      
      This code will expire in 10 minutes.
      
      If you didn't create an account, please ignore this email.
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('✅ Verification email sent to:', email);
  } catch (error) {
    console.error('❌ Failed to send verification email:', error);
    throw new Error('Failed to send verification email');
  }
}

// Send welcome email after verification
export async function sendWelcomeEmail(email: string, name: string): Promise<void> {
  const appName = process.env.NEXT_PUBLIC_APP_NAME || 'InterviewPrep Live';

  const mailOptions = {
    from: `"${appName}" <${process.env.SMTP_USER}>`,
    to: email,
    subject: `Welcome to ${appName}! 🎉`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              line-height: 1.6;
              color: #334155;
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
            }
            .container {
              background: linear-gradient(to bottom right, #f8fafc, #eef2ff);
              border-radius: 16px;
              padding: 40px;
            }
            .title {
              font-size: 32px;
              font-weight: 700;
              color: #0f172a;
              text-align: center;
              margin-bottom: 20px;
            }
            .emoji {
              font-size: 64px;
              text-align: center;
              margin-bottom: 20px;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="emoji">🎉</div>
            <h1 class="title">Welcome, ${name}!</h1>
            <p style="text-align: center;">
              Your email has been verified successfully. You're all set to start your interview preparation journey!
            </p>
          </div>
        </body>
      </html>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error('Failed to send welcome email:', error);
    // Don't throw - welcome email is not critical
  }
}