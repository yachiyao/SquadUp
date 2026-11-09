import en from '@/messages/en.json';

type Messages = typeof en;

declare global {
  // Compile-time checked translation keys (en.json is the source of truth).
  interface IntlMessages extends Messages {}
}

export {};
