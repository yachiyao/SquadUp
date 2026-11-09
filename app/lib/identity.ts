import { NextResponse } from 'next/server';
import { ZodError } from 'zod';
import { getSession } from './auth';
import { DomainError, errors } from './errors';
import { fieldErrorsFrom, UUID_RE } from './validation';

export const TOKEN_HEADER = 'x-squad-token';

export interface Actor {
  /** Set when signed in with Google (Free Member). */
  userId: string | null;
  /** Anonymous per-device UUID from localStorage (null if the client did not send a valid one). */
  token: string | null;
}

export async function buildActor(rawToken: string | null | undefined): Promise<Actor> {
  const session = await getSession();
  return { userId: session?.user?.id ?? null, token: rawToken && UUID_RE.test(rawToken) ? rawToken : null };
}

export const getActor = (req: Request) => buildActor(req.headers.get(TOKEN_HEADER));

export function requireToken(actor: Actor): string {
  if (!actor.token) throw errors.validation({ token: 'required' });
  return actor.token;
}

/** Parse JSON body, mapping malformed JSON to a 400. */
export async function readJson(req: Request): Promise<unknown> {
  try {
    return await req.json();
  } catch {
    throw errors.validation({ body: 'invalid_json' });
  }
}

export function toResponse(e: unknown): NextResponse {
  if (e instanceof DomainError) {
    return NextResponse.json({ code: e.code, message: e.message, ...e.extra }, { status: e.status });
  }
  if (e instanceof ZodError) {
    return NextResponse.json({ code: 'VALIDATION', fieldErrors: fieldErrorsFrom(e) }, { status: 400 });
  }
  console.error('[api] unexpected error', e);
  return NextResponse.json({ code: 'INTERNAL' }, { status: 500 });
}

/** Wrap a route handler so every failure becomes a consistent JSON error. */
export function handle<A extends unknown[]>(fn: (...args: A) => Promise<Response>) {
  return async (...args: A): Promise<Response> => {
    try {
      return await fn(...args);
    } catch (e) {
      return toResponse(e);
    }
  };
}
