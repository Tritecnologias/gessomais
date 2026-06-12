import { useState } from 'react';
import { useStaggerFadeUp } from '../hooks/useScrollAnimation';
import { trpc } from '@/providers/trpc';

export default function Portfolio() {
  const sectionRef = useStaggerFadeUp<HTMLElement>({ childSelector: '.animate-item', stagger: 0.07, threshold: 0.05 });
  const { data: items, isLoading } = trpc.admin.portfolio.list.useQuery();
  const [activeCategory, setActiveCategory] = useState("Todos");

  const active = items?.filter((i) => i.active) ?? [];
  const categories = ["Todos", ...Array.from(new Set(active.map((i) => i.category))).sort()];
  const filtered = activeCategory === "Todos" ? active : active.filter((i) => i.category === activeCategory);

  if (!isLoading && active.length === 0) return null;

  return (
    <section id="portfolio" ref={sectionRef} className="section-padding" style={{ backgroundColor: '#FFFFFF' }}>
      <div className="container-main">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="animate-item mb-4">
            <span className="inline-block text-xs font-medium uppercase tracking-[0.15em] px-4 py-1.5 rounded-full"
              style={{ backgroundColor: 'rgba(212,167,75,0.12)', color: '#D4A74B', border: '1px solid rgba(212,167,75,0.3)' }}>
              Nosso Portfólio
            </span>
          </div>
          <h2 className="animate-item font-display font-semibold mb-4"
            style={{ fontSize: 'clamp(2rem, 4vw, 3.5rem)', color: '#1A1A1A', lineHeight: 1.2, letterSpacing: '-0.02em' }}>
            Obras Realizadas
          </h2>
          <p className="animate-item text-lg max-w-[520px] mx-auto" style={{ color: '#6B6B6B' }}>
            Cada projeto é único. Veja alguns dos trabalhos que entregamos com qualidade e precisão.
          </p>
        </div>

        {/* Category filter */}
        {categories.length > 2 && (
          <div className="animate-item flex flex-wrap justify-center gap-2 mb-10">
            {categories.map((cat) => (
              <button key={cat} onClick={() => setActiveCategory(cat)}
                className="text-xs font-medium px-4 py-2 rounded-full border transition-all duration-200"
                style={{
                  backgroundColor: activeCategory === cat ? '#D4A74B' : 'transparent',
                  color: activeCategory === cat ? '#1A1A1A' : '#6B6B6B',
                  borderColor: activeCategory === cat ? '#D4A74B' : '#E5E2DE',
                }}>
                {cat}
              </button>
            ))}
          </div>
        )}

        {/* Grid */}
        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="animate-item aspect-square bg-[#E5E2DE] rounded-xl animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {filtered.map((item) => (
              <div key={item.id} className="animate-item group relative rounded-xl overflow-hidden aspect-square">
                <img src={item.image} alt={item.title} loading="lazy"
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
                  <span className="text-xs font-medium uppercase tracking-wider px-2 py-1 rounded-full mb-2 w-fit"
                    style={{ backgroundColor: 'rgba(212,167,75,0.8)', color: '#1A1A1A' }}>
                    {item.category}
                  </span>
                  <p className="text-white font-semibold text-sm leading-tight">{item.title}</p>
                  {item.description && <p className="text-white/70 text-xs mt-1 line-clamp-2">{item.description}</p>}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
