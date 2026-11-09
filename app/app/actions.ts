'use server';

import { DomainError } from '@/lib/errors';
import { createEvent } from '@/lib/events';
import { buildActor } from '@/lib/identity';
import { createEventSchema, fieldErrorsFrom } from '@/lib/validation';

export type CreateEventResult =
  | { ok: true; id: string }
  | { ok: false; code: string; fieldErrors?: Record<string, string> };

/**
 * Server Action behind the create form. The anonymous device token is passed explicitly because
 * Server Actions cannot read custom request headers set from client code.
 */
export async function createEventAction(raw: unknown, token: string): Promise<CreateEventResult> {
  const parsed = createEventSchema.safeParse(raw);
  if (!parsed.success) return { ok: false, code: 'VALIDATION', fieldErrors: fieldErrorsFrom(parsed.error) };
  try {
    const actor = await buildActor(token);
    const { id } = await createEvent(parsed.data, actor);
    return { ok: true, id };
  } catch (e) {
    if (e instanceof DomainError) {
      return { ok: false, code: e.code, fieldErrors: e.extra.fieldErrors as Record<string, string> | undefined };
    }
    console.error('[createEventAction]', e);
    return { ok: false, code: 'INTERNAL' };
  }
}
