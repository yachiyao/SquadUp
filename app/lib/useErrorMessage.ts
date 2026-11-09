'use client';

import { useTranslations } from 'next-intl';
import { ApiError } from './api';

/**
 * Turn any thrown value into a translated, user-facing sentence.
 * Network loss (status 0), race-condition rejections (409), expiry (410) and locks (423)
 * each get their own copy.
 */
export function useErrorMessage() {
  const t = useTranslations('errors');
  return (e: unknown): string => {
    if (e instanceof ApiError) {
      switch (e.code) {
        case 'NETWORK':
          return t('network');
        case 'FULL':
          return t('full', { count: e.body.count ?? 0, max: e.body.max ?? 0 });
        case 'EXPIRED':
          return t('expired');
        case 'FINALIZED':
          return t('finalized');
        case 'NOT_FOUND':
          return t('notFound');
        case 'PASSCODE_WRONG':
          return t('passcodeWrong');
        case 'RATE_LIMITED':
          return t('rateLimited', { seconds: e.body.retryAfterSec ?? 60 });
        case 'UNAUTHENTICATED':
          return t('unauthenticated');
        case 'FORBIDDEN':
        case 'CANNOT_KICK_HOST':
          return t('forbidden');
        case 'VALIDATION': {
          const first = Object.values(e.body.fieldErrors ?? {})[0];
          if (first && t.has(first as never)) return t(first as never);
          return t('validation');
        }
      }
    }
    return t('generic');
  };
}
