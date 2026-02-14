import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { generateOTP, sendVerificationEmail } from '@/lib/email';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    // Find pending user
    const pendingUser = await (prisma as any).pendingUser.findUnique({
      where: { email },
    });

    if (!pendingUser) {
      return NextResponse.json(
        { error: 'No pending signup found for this email. Please sign up first.' },
        { status: 404 }
      );
    }

    // Check rate limiting (prevent abuse)
    // Only allow resending if last OTP was sent more than 1 minute ago
    const lastSentTime = new Date(pendingUser.verificationTokenExpiry.getTime() - 10 * 60 * 1000);
    const oneMinuteAgo = new Date(Date.now() - 60 * 1000);
    
    if (lastSentTime > oneMinuteAgo) {
      return NextResponse.json(
        { error: 'Please wait at least 1 minute before requesting a new code' },
        { status: 429 }
      );
    }

    // Generate new OTP
    const otp = generateOTP();
    const expiryTime = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Update pending user with new OTP
    await (prisma as any).pendingUser.update({
      where: { id: pendingUser.id },
      data: {
        verificationToken: otp,
        verificationTokenExpiry: expiryTime,
      },
    });

    // Send verification email
    await sendVerificationEmail(email, otp);

    return NextResponse.json({
      message: 'Verification code sent successfully',
      email,
    });

  } catch (error) {
    console.error('Resend OTP error:', error);
    return NextResponse.json(
      { error: 'Failed to send verification code. Please try again.' },
      { status: 500 }
    );
  }
}