import { notFound } from 'next/navigation';

// Unknown URLs under a locale render the localized 404 below.
export default function CatchAll() {
  notFound();
}
