import type { NextAuthOptions } from 'next-auth';
import { getServerSession } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';
import { prisma } from './prisma';

const devLoginEnabled = process.env.NODE_ENV !== 'production' && process.env.DEV_LOGIN === 'true';

export const googleConfigured = Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET);

export const authOptions: NextAuthOptions = {
  session: { strategy: 'jwt', maxAge: 60 * 60 * 24 * 60 },
  secret: process.env.NEXTAUTH_SECRET,
  pages: { signIn: '/' },
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID ?? 'unset',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? 'unset',
    }),
    ...(devLoginEnabled
      ? [
          CredentialsProvider({
            id: 'dev',
            name: 'Dev login',
            credentials: { name: { label: 'Name', type: 'text' } },
            async authorize(creds) {
              const name = (creds?.name || 'Dev User').toString().slice(0, 40);
              const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-') || 'dev';
              const user = await prisma.user.upsert({
                where: { email: `${slug}@dev.local` },
                update: { name },
                create: { email: `${slug}@dev.local`, name },
              });
              return { id: user.id, name: user.name, email: user.email, image: user.image };
            },
          }),
        ]
      : []),
  ],
  callbacks: {
    async jwt({ token, user, account }) {
      if (account && user) {
        if (account.provider === 'google' && user.email) {
          const dbUser = await prisma.user.upsert({
            where: { email: user.email },
            update: { name: user.name ?? undefined, image: user.image ?? undefined },
            create: { email: user.email, name: user.name, image: user.image },
          });
          token.uid = dbUser.id;
        } else {
          token.uid = user.id;
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user && token.uid) session.user.id = token.uid as string;
      return session;
    },
  },
};

export const getSession = () => getServerSession(authOptions);
