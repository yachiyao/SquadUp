import { NextResponse } from 'next/server';
import { z } from 'zod';
import { DomainError, errors } from '@/lib/errors';
import { handle, readJson } from '@/lib/identity';
import { clearRateLimit, rateLimit } from '@/lib/rateLimit';
import { prisma } from '@/lib/prisma';
import { unlockCookieName, unlockToken, verifyPasscode } from '@/lib/passcode';

export const dynamic = 'force-dynamic';

const bodySchema = z.object({ passcode: z.string().min(1).max(64) });

export const POST = handle(async (req: Request, { params }: { params: { id: string } }) => {
  const { passcode } = bodySchema.parse(await readJson(req));
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'local';
  const key = `unlock:${params.id}:${ip}`;

  const limit = rateLimit(key, 8, 5 * 60_000);
  if (!limit.ok) throw new DomainError('RATE_LIMITED', 429, { retryAfterSec: limit.retryAfterSec });

  const event = await prisma.event.findUnique({
    where: { id: params.id },
    select: { id: true, passcode: true, expiresAt: true, title: true },
  });
  if (!event) throw errors.notFound();
  if (event.expiresAt.getTime() <= Date.now()) throw errors.expired({ title: event.title });
  if (!event.passcode) return NextResponse.json({ ok: true });

  if (!verifyPasscode(passcode, event.passcode)) throw new DomainError('PASSCODE_WRONG', 403);

  clearRateLimit(key);
  const res = NextResponse.json({ ok: true });
  res.cookies.set(unlockCookieName(event.id), unlockToken(event.id, event.passcode), {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 60 * 60 * 24 * 30,
  });
  return res;
});
