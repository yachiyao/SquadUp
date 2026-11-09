import * as React from 'react';
import { cn } from '@/lib/utils';

const tones = {
  brand: 'bg-brand-50 text-brand-700 ring-brand-100',
  peach: 'bg-peach-100 text-peach-700 ring-peach-200',
  stone: 'bg-stone-100 text-ink-soft ring-stone-200',
  red: 'bg-red-50 text-red-700 ring-red-100',
} as const;

export function Badge({
  tone = 'stone',
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLSpanElement> & { tone?: keyof typeof tones }) {
  return (
    <span
      className={cn('inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ring-1 ring-inset', tones[tone], className)}
      {...props}
    >
      {children}
    </span>
  );
}

export function Card({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <section className={cn('rounded-3xl bg-white p-4 shadow-soft', className)} {...props} />;
}
