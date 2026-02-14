import { AuthOptions } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import { prisma } from './prisma';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-change-in-production';

interface JWTPayload {
  userId: number;
  email: string;
  role: string;
}

function generateToken(payload: JWTPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}

export const authOptions: AuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async jwt({ token, account, profile }) {
      console.log('🔍 [jwt] Callback - account:', !!account, 'profile:', !!profile);
      
      // ONLY runs on initial sign-in when account exists
      if (account?.provider === 'google' && profile?.email) {
        console.log('✅ [jwt] Google sign-in detected!');
        
        try {
          const email = profile.email;
          const googleId = account.providerAccountId;
          const name = (profile as any).name || email.split('@')[0];
          const profilePicture = (profile as any).picture || null;
          
          console.log('📸 [jwt] Profile data:', { name, profilePicture });
          
          // Find or create user
          let user = await prisma.user.findUnique({
            where: { email },
          });

          if (user) {
            console.log('✅ User found:', user.id);
            // Update with Google data if not set
            await prisma.user.update({
              where: { id: user.id },
              data: { 
                googleId,
                provider: 'GOOGLE',
                name: name,
                profilePicture: profilePicture,
              },
            });
          } else {
            console.log('✅ Creating new user');
            user = await prisma.user.create({
              data: {
                email,
                name,
                googleId,
                role: 'STUDENT',
                provider: 'GOOGLE',
                profilePicture,
                passwordHash: '', // No password for Google accounts
              },
            });
            console.log('✅ User created:', user.id);
          }

          // Generate custom JWT
          const customToken = generateToken({
            userId: user.id,
            email: user.email,
            role: user.role,
          });

          // Store in NextAuth token
          token.customToken = customToken;
          token.userId = user.id;
          token.userRole = user.role;

          // Set our custom cookie
          const cookieStore = await cookies();
          cookieStore.set('auth-token', customToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 60 * 60 * 24 * 7,
            path: '/',
          });

          console.log('✅ Cookie set, customToken generated!');
          
        } catch (error) {
          console.error('❌ Error:', error);
        }
      }
      
      return token;
    },
    
    async session({ session, token }) {
      if (token.customToken) {
        (session as any).customToken = token.customToken;
        (session as any).userId = token.userId;
        (session as any).userRole = token.userRole;
      }
      return session;
    },
    
    async redirect({ url, baseUrl }) {
      console.log('🔍 [redirect] url:', url, 'baseUrl:', baseUrl);
      
      // After Google sign-in, redirect to student dashboard
      if (url.includes('/api/auth/callback/google')) {
        console.log('✅ [redirect] Redirecting to dashboard');
        return `${baseUrl}/student/dashboard`;
      }
      
      // Allows relative callback URLs
      if (url.startsWith('/')) return `${baseUrl}${url}`;
      // Allows callback URLs on the same origin
      if (new URL(url).origin === baseUrl) return url;
      
      return baseUrl;
    },
  },
  pages: {
    signIn: '/login/student',
    error: '/login/student',
  },
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: 'jwt',
  },
};