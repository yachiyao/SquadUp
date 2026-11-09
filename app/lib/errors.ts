export type ErrorCode =
  | 'VALIDATION'
  | 'NOT_FOUND'
  | 'EXPIRED'
  | 'FINALIZED'
  | 'FULL'
  | 'PASSCODE_REQUIRED'
  | 'PASSCODE_WRONG'
  | 'RATE_LIMITED'
  | 'UNAUTHENTICATED'
  | 'FORBIDDEN'
  | 'MEMBER_ONLY_EXPIRY'
  | 'CANNOT_KICK_HOST'
  | 'INTERNAL';

/** Domain failure with an HTTP status; thrown by lib code, rendered by `toResponse`. */
export class DomainError extends Error {
  constructor(
    public code: ErrorCode,
    public status: number,
    public extra: Record<string, unknown> = {},
    message?: string,
  ) {
    super(message ?? code);
  }
}

export const errors = {
  validation: (fieldErrors: Record<string, string> = {}) => new DomainError('VALIDATION', 400, { fieldErrors }),
  notFound: () => new DomainError('NOT_FOUND', 404),
  expired: (extra: Record<string, unknown> = {}) => new DomainError('EXPIRED', 410, extra),
  finalized: () => new DomainError('FINALIZED', 423),
  full: (count: number, max: number) =>
    new DomainError('FULL', 409, { count, max }, `Event is already full (${count}/${max})`),
  forbidden: () => new DomainError('FORBIDDEN', 403),
  unauthenticated: () => new DomainError('UNAUTHENTICATED', 401),
};
