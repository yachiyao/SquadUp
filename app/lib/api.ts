'use client';

import type { ApiErrorBody } from '@/types/room';
import { getToken } from './clientStorage';

export class ApiError extends Error {
  constructor(
    public status: number,
    public body: ApiErrorBody,
  ) {
    super(body.message ?? body.code);
  }
  get code() {
    return this.body.code;
  }
}

/** Thin fetch wrapper: JSON in/out, device token header, and normalized errors (status 0 = network). */
export async function api<T>(path: string, init: RequestInit & { json?: unknown } = {}): Promise<T> {
  const { json, headers, ...rest } = init;
  let res: Response;
  try {
    res = await fetch(path, {
      ...rest,
      credentials: 'same-origin',
      headers: {
        'x-squad-token': getToken(),
        ...(json !== undefined ? { 'Content-Type': 'application/json' } : {}),
        ...headers,
      },
      body: json !== undefined ? JSON.stringify(json) : rest.body,
    });
  } catch {
    throw new ApiError(0, { code: 'NETWORK' });
  }
  let body: unknown = null;
  try {
    body = await res.json();
  } catch {
    /* non-JSON error page */
  }
  if (!res.ok) {
    throw new ApiError(res.status, (body as ApiErrorBody) ?? { code: res.status >= 500 ? 'INTERNAL' : 'UNKNOWN' });
  }
  return body as T;
}

export const fetcher = <T,>(path: string) => api<T>(path);
