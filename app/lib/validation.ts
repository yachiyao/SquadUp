import { z } from 'zod';
import { isValidDateStr } from './dates';
import { isCoarseSlot, isHourRange } from './slots';

/**
 * Zod messages are stable error *codes* (not prose) so the same schemas run on the client and
 * the server and the UI translates them (see `errors.*` in messages/*.json).
 */
export const GUEST_EXPIRY_DAYS = [3, 5, 7] as const;
export const MEMBER_EXPIRY_DAYS = [3, 5, 7, 14, 30] as const;
export const MAX_PARTICIPANTS_LIMIT = 20;

const text = (max: number) => z.string().trim().min(1, 'required').max(max, 'too_long');

const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max, 'too_long')
    .optional()
    .transform((v) => (v ? v : undefined));

const optionalUrl = z
  .string()
  .trim()
  .max(500, 'too_long')
  .optional()
  .transform((v) => (v ? v : undefined))
  .refine((v) => {
    if (!v) return true;
    try {
      const u = new URL(v);
      return u.protocol === 'http:' || u.protocol === 'https:';
    } catch {
      return false;
    }
  }, 'invalid_url');

export const locationInputSchema = z.object({
  name: text(60),
  mapUrl: optionalUrl,
  notes: optionalText(120),
});

export const createEventSchema = z
  .object({
    title: text(80),
    hostNickname: text(24),
    locations: z.array(locationInputSchema).max(3, 'too_many'),
    passcode: z
      .string()
      .optional()
      .transform((v) => (v ? v : undefined))
      .refine((v) => v === undefined || /^\S{3,8}$/u.test(v), 'passcode_format'),
    maxParticipants: z
      .number({ invalid_type_error: 'capacity_range' })
      .int('capacity_range')
      .min(1, 'capacity_range')
      .max(MAX_PARTICIPANTS_LIMIT, 'capacity_range'),
    expiryDays: z.number().int().refine((n) => (MEMBER_EXPIRY_DAYS as readonly number[]).includes(n), 'invalid_expiry'),
    slotMode: z.enum(['COARSE', 'HOURLY']),
    hourStart: z.number().int().min(0).max(23).default(9),
    hourEnd: z.number().int().min(1).max(24).default(22),
  })
  .superRefine((v, ctx) => {
    if (v.slotMode === 'HOURLY' && v.hourEnd <= v.hourStart) {
      ctx.addIssue({ code: 'custom', path: ['hourEnd'], message: 'hours_range' });
    }
  });
export type CreateEventInput = z.infer<typeof createEventSchema>;

export const submitSchema = z.object({
  nickname: text(24),
  availabilities: z
    .array(
      z.object({
        date: z.string().refine(isValidDateStr, 'invalid_date'),
        slot: z.string().refine((s) => isCoarseSlot(s) || isHourRange(s), 'invalid_slot'),
      }),
    )
    .max(800, 'too_many'),
  locationOptionId: z.string().min(1).nullable().optional(),
});
export type SubmitInput = z.infer<typeof submitSchema>;

export const finalizeSchema = z.object({
  date: z.string().refine(isValidDateStr, 'invalid_date'),
  slot: z.string().refine((s) => isCoarseSlot(s) || isHourRange(s), 'invalid_slot'),
  locationOptionId: z.string().min(1).nullable().optional(),
});

export const savedSpotSchema = z.object({
  name: text(60),
  mapUrl: optionalUrl,
  notes: optionalText(120),
});

/** Flatten a zod error into `{ "locations.0.name": "required" }`. */
export function fieldErrorsFrom(error: z.ZodError): Record<string, string> {
  const out: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = issue.path.join('.');
    if (!(key in out)) out[key] = issue.message;
  }
  return out;
}

export const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
