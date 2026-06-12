import { useStaggerFadeUp } from '../hooks/useScrollAnimation';
import { trpc } from '@/providers/trpc';

export default function Parceiros() {
  const sectionRef = useStaggerFadeUp<HTMLElement>({ childSelector: '.animate-item', stagger: 0.06, threshold: 0.05 });
  const { data: items, isLoading } = trpc.admin.partners.list.useQuery();
  const active = items?.filter((p) => p.active) ?? [];

  if (!isLoading && active.length === 0) return null;

  return (
    <section id="parceiros" ref={sectionRef} className="py-12" style={{ backgroundColor: '#FFFFFF', borderTop: '1px solid #E5E2DE' }}>
      <div className="container-main">
        <p className="animate-item text-center text-xs font-medium uppercase tracking-[0.2em] mb-8" style={{ color: '#6B6B6B' }}>
          Parceiros & Fornecedores
        </p>

        {isLoading ? (
          <div className="flex flex-wrap justify-center gap-8">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="animate-item w-28 h-12 bg-[#E5E2DE] rounded-lg animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="animate-item flex flex-wrap justify-center items-center gap-8 md:gap-12">
            {active.map((partner) => {
              const img = (
                <img src={partner.logo} alt={partner.name} loading="lazy"
                  className="h-10 max-w-[120px] object-contain grayscale hover:grayscale-0 transition-all duration-300 opacity-60 hover:opacity-100" />
              );
              return partner.url ? (
                <a key={partner.id} href={partner.url} target="_blank" rel="noopener noreferrer" title={partner.name}>
                  {img}
                </a>
              ) : (
                <div key={partner.id} title={partner.name}>{img}</div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
