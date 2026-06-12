import { useStaggerFadeUp, useCountUpAnimation } from '../hooks/useScrollAnimation';
import { trpc } from '@/providers/trpc';

function StatItem({ value, suffix, label }: { value: number; suffix: string; label: string }) {
  const ref = useCountUpAnimation<HTMLSpanElement>(value, { duration: 2.5, suffix, threshold: 0.3 });
  return (
    <div className="animate-item text-center">
      <span
        ref={ref}
        className="font-display font-bold block"
        style={{ fontSize: 'clamp(3rem, 6vw, 4rem)', color: '#D4A74B', lineHeight: 1.1 }}
      >
        0
      </span>
      <span className="text-sm mt-3 block" style={{ color: 'rgba(255,255,255,0.7)' }}>
        {label}
      </span>
    </div>
  );
}

export default function Estatisticas() {
  const sectionRef = useStaggerFadeUp<HTMLElement>({
    childSelector: '.animate-item',
    stagger: 0.2,
    threshold: 0.3,
  });

  const { data: configs } = trpc.admin.config.list.useQuery();
  const get = (key: string, fallback: string) =>
    configs?.find((c) => c.key === key)?.value || fallback;

  const stats = [
    { value: Number(get('statProjects', '1200')), suffix: '+', label: 'Projetos Entregues' },
    { value: Number(get('statYears', '15')), suffix: '', label: 'Anos de Experiência' },
    { value: Number(get('statSatisfaction', '98')), suffix: '%', label: 'Taxa de Satisfação' },
    { value: Number(get('statDelivery', '72')), suffix: 'h', label: 'Tempo Médio de Entrega' },
  ];

  return (
    <section ref={sectionRef} className="section-padding" style={{ backgroundColor: '#1A1A1A' }}>
      <div className="container-main">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {stats.map((stat, i) => (
            <StatItem key={i} value={stat.value} suffix={stat.suffix} label={stat.label} />
          ))}
        </div>
      </div>
    </section>
  );
}
