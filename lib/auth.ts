import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import { connectDB } from './mongodb';
import { User } from '@/models/User';

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      name: 'credentials',
      credentials: {
        identifier: { label: 'Email or Staff ID', type: 'text' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.identifier || !credentials?.password) return null;
        await connectDB();

        const identifier = String(credentials.identifier).trim();

        // Try email first, then staffId
        const user =
          (await User.findOne({ email: identifier.toLowerCase() }).select('+password')) ||
          (await User.findOne({ staffId: identifier.toUpperCase() }).select('+password'));

        if (!user || !user.password) return null;

        const isValid = await bcrypt.compare(String(credentials.password), user.password);
        if (!isValid) return null;

        return {
          id: user._id.toString(),
          name: user.name,
          email: user.email ?? null,
          role: user.role,
          staffId: user.staffId ?? null,
          mustChangePassword: user.mustChangePassword ?? false,
        } as any;
      },
    }),
  ],
  session: { strategy: 'jwt' },
  pages: { signIn: '/login' },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = (user as any).id;
        token.role = (user as any).role;
        token.staffId = (user as any).staffId;
        token.mustChangePassword = (user as any).mustChangePassword;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id;
        (session.user as any).role = token.role;
        (session.user as any).staffId = token.staffId;
        (session.user as any).mustChangePassword = token.mustChangePassword;
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
});