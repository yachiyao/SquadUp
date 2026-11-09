import { cn } from '@/lib/utils';

const PALETTE = [
  'bg-brand-100 text-brand-800',
  'bg-peach-100 text-peach-700',
  'bg-sky-100 text-sky-800',
  'bg-rose-100 text-rose-800',
  'bg-violet-100 text-violet-800',
  'bg-amber-100 text-amber-800',
];

function hash(s: string) {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return h;
}

export interface Person {
  id: string;
  nickname: string;
  image?: string | null;
}

export function Avatar({ person, className }: { person: Person; className?: string }) {
  const initial = [...person.nickname.trim()][0]?.toUpperCase() ?? '?';
  return person.image ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={person.image}
      alt=""
      referrerPolicy="no-referrer"
      className={cn('h-7 w-7 shrink-0 rounded-full object-cover', className)}
    />
  ) : (
    <span
      aria-hidden
      className={cn(
        'flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold',
        PALETTE[hash(person.id) % PALETTE.length],
        className,
      )}
    >
      {initial}
    </span>
  );
}

/** Avatar + nickname pill, used for "who is available" lists. */
export function AvatarChip({ person, highlight }: { person: Person; highlight?: boolean }) {
  return (
    <span
      className={cn(
        'inline-flex max-w-full items-center gap-1.5 rounded-full py-0.5 pl-0.5 pr-2.5 text-xs font-medium',
        highlight ? 'bg-brand-600 text-white' : 'bg-stone-100 text-ink-soft',
      )}
    >
      <Avatar person={person} className="h-6 w-6 text-[11px]" />
      <span className="truncate">{person.nickname}</span>
    </span>
  );
}

export function AvatarStack({ people, max = 4 }: { people: Person[]; max?: number }) {
  const shown = people.slice(0, max);
  const rest = people.length - shown.length;
  return (
    <span className="flex items-center -space-x-2">
      {shown.map((p) => (
        <Avatar key={p.id} person={p} className="h-7 w-7 ring-2 ring-white" />
      ))}
      {rest > 0 && (
        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-stone-100 text-[11px] font-bold text-ink-soft ring-2 ring-white">
          +{rest}
        </span>
      )}
    </span>
  );
}
