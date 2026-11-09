import { CalendarHeart, Link2, MapPinned, Sparkles } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { setRequestLocale } from 'next-intl/server';
import { JoinByCode } from '@/components/home/JoinByCode';
import { RecentRooms } from '@/components/home/RecentRooms';
import { buttonVariants } from '@/components/ui/button';
import { Link } from '@/i18n/navigation';
import { cn } from '@/lib/utils';

const DEMO = [0, 1, 2, 1, 0, 3, 4, 1, 2, 4, 5, 3, 0, 2, 3, 5, 4, 1, 0, 1, 2];
const DEMO_COLORS = ['#F5F5F4', '#DDF1E5', '#B4DFC6', '#7CC29E', '#3F9C71', '#1F5C42'];

export default function HomePage({ params }: { params: { locale: string } }) {
  setRequestLocale(params.locale);
  const t = useTranslations('home');

  const features = [
    { icon: CalendarHeart, title: t('f1Title'), body: t('f1Body') },
    { icon: MapPinned, title: t('f2Title'), body: t('f2Body') },
    { icon: Link2, title: t('f3Title'), body: t('f3Body') },
  ];

  return (
    <div className="space-y-6">
      <section className="relative overflow-hidden rounded-4xl bg-white px-5 pb-6 pt-7 shadow-soft">
        <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-peach-100/70" aria-hidden />
        <div className="relative">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-peach-100 px-3 py-1 text-xs font-bold text-peach-700">
            <Sparkles className="h-3.5 w-3.5" aria-hidden /> {t('badge')}
          </span>
          <h1 className="mt-3 text-[1.9rem] font-extrabold leading-tight tracking-tight text-ink">{t('heroTitle')}</h1>
          <p className="mt-2 text-base text-ink-soft">{t('heroSubtitle')}</p>

          <div className="mt-5 grid grid-cols-7 gap-1.5 rounded-3xl bg-cream p-3" aria-hidden>
            {DEMO.map((lvl, i) => (
              <span key={i} className="aspect-square rounded-lg" style={{ backgroundColor: DEMO_COLORS[lvl] }} />
            ))}
          </div>

          <Link href="/create" className={cn(buttonVariants({ size: 'lg' }), 'mt-5 w-full')}>
            {t('createCta')}
          </Link>
        </div>
      </section>

      <JoinByCode />
      <RecentRooms />

      <section className="grid gap-3">
        {features.map(({ icon: Icon, title, body }) => (
          <div key={title} className="flex gap-4 rounded-3xl bg-white p-4 shadow-soft">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-brand-50 text-brand-600">
              <Icon className="h-6 w-6" aria-hidden />
            </span>
            <div className="min-w-0">
              <h2 className="font-bold text-ink">{title}</h2>
              <p className="text-sm text-ink-soft">{body}</p>
            </div>
          </div>
        ))}
      </section>
    </div>
  );
}
