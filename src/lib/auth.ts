import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';
import { prisma } from './prisma';
import { UserRole } from '@prisma/client';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-change-in-production';
const ADMIN_EMAILS = (process.env.ADMIN_EMAILS || '').split(',').map(e => e.trim());

export interface JWTPayload {
  userId: number;
  email: string;
  role: UserRole;
}

// ========================================
// PASSWORD FUNCTIONS
// ========================================

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

// ========================================
// TOKEN FUNCTIONS (EXPORTED!)
// ========================================

export function generateToken(payload: JWTPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}

export function verifyToken(token: string): JWTPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JWTPayload;
  } catch {
    return null;
  }
}

// ========================================
// COOKIE FUNCTIONS (EXPORTED!)
// ========================================

export async function setAuthCookie(token: string) {
  const cookieStore = await cookies();
  cookieStore.set('auth-token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: '/',
  });
}

export async function getAuthCookie(): Promise<string | undefined> {
  const cookieStore = await cookies();
  const cookie = cookieStore.get('auth-token');
  
  console.log('🔍 [getAuthCookie] Cookie exists:', !!cookie);
  if (cookie) {
    console.log('🔍 [getAuthCookie] Cookie value length:', cookie.value.length);
  }
  
  return cookie?.value;
}

export async function removeAuthCookie() {
  const cookieStore = await cookies();
  cookieStore.delete('auth-token');
}

// ========================================
// USER FUNCTIONS
// ========================================

export async function getCurrentUser() {
  console.log('🔍 [getCurrentUser] Starting...');
  
  const token = await getAuthCookie();
  
  if (!token) {
    console.log('❌ [getCurrentUser] No token found');
    return null;
  }

  console.log('🔍 [getCurrentUser] Token found, verifying...');
  
  const payload = verifyToken(token);
  
  if (!payload) {
    console.log('❌ [getCurrentUser] Token verification failed');
    return null;
  }

  console.log('🔍 [getCurrentUser] Token verified, payload:', {
    userId: payload.userId,
    email: payload.email,
    role: payload.role
  });

  const user = await prisma.user.findUnique({
    where: { id: payload.userId },
    include: {
      studentProfile: true,
      interviewerProfile: true,
    },
  });

  if (user) {
    console.log('✅ [getCurrentUser] User found:', {
      id: user.id,
      email: user.email,
      role: user.role,
      hasStudentProfile: !!user.studentProfile,
      hasInterviewerProfile: !!user.interviewerProfile
    });
  } else {
    console.log('❌ [getCurrentUser] User not found in database for userId:', payload.userId);
  }

  return user;
}

export function isAdminEmail(email: string): boolean {
  return ADMIN_EMAILS.includes(email);
}

// ========================================
// AUTH MIDDLEWARE (EXPORTED!)
// ========================================

export async function requireAuth(allowedRoles?: UserRole[]) {
  console.log('🔍 [requireAuth] Called with roles:', allowedRoles);
  
  const user = await getCurrentUser();
  
  if (!user) {
    console.log('❌ [requireAuth] No user, throwing Unauthorized');
    throw new Error('Unauthorized');
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    console.log('❌ [requireAuth] User role not allowed. User role:', user.role, 'Allowed:', allowedRoles);
    throw new Error('Forbidden');
  }

  console.log('✅ [requireAuth] User authorized:', { id: user.id, role: user.role });
  
  return user;
}