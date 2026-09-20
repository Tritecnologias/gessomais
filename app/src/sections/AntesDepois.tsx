import { useStaggerFadeUp, useCountUpAnimation } from '../hooks/useScrollAnimation';
import { trpc } from '@/providers/trpc';

export default function AntesDepois() {
  const sectionRef = useStaggerFadeUp<HTMLElement>({
    childSelector: '.animate-item',
    stagger: 0.1,
    threshold: 0.1,
  });

  const { data: configs } = trpc.admin.config.list.useQuery();
  const get = (key: string, fallback: string) =>
    configs?.find((c) => c.key === key)?.value || fallback;

  const stat1Ref = useCountUpAnimation<HTMLSpanElement>(Number(get('statProjects', '1200')), { suffix: '+' });
  const stat2Ref = useCountUpAnimation<HTMLSpanElement>(Number(get('statSatisfaction', '98')), { suffix: '%' });
  const stat3Ref = useCountUpAnimation<HTMLSpanElement>(Number(get('statDelivery', '72')), { suffix: 'h' });

  const cards = [
    {
      image: get('antesDepoisCard1Image', '/images/antes-depois-1.jpg'),
      badge: get('antesDepoisCard1Badge', 'ECONOMIA DE 40%'),
      title: get('antesDepoisCard1Title', 'Sala de Estar Iluminada'),
      description: get('antesDepoisCard1Description', 'Sanca de gesso com LED + forro rebaixado com spots'),
    },
    {
      image: get('antesDepoisCard2Image', '/images/antes-depois-2.jpg'),
      badge: get('antesDepoisCard2Badge', '5 ANOS DE GARANTIA'),
      title: get('antesDepoisCard2Title', 'Quarto Renovado'),
      description: get('antesDepoisCard2Description', 'Forro de gesso novo + iluminação embutida'),
    },
  ];

  return (
    <section
      id="antes-depois"
      ref={sectionRef}
      className="section-padding"
      style={{ backgroundColor: '#F5F3F0' }}
    >
      <div className="container-main">
        {/* Header */}
        <div className="text-center mb-12">
          <h2
            className="animate-item font-display font-semibold mb-4"
            style={{
              fontSize: 'clamp(2rem, 4vw, 3.5rem)',
              color: '#1A1A1A',
              lineHeight: 1.2,
              letterSpacing: '-0.02em',
            }}
          >
            Transformações Reais
          </h2>
          <p className="animate-item text-lg" style={{ color: '#6B6B6B' }}>
            Veja a diferença que nossos serviços fazem no dia a dia dos nossos clientes
          </p>
        </div>

        {/* Cards Grid */}
        <div className="grid md:grid-cols-2 gap-6 md:gap-8 mb-16">
          {cards.map((card, i) => (
            <div
              key={i}
              className="animate-item bg-white rounded-2xl p-4 sm:p-5 border border-[#E5E2DE] shadow-sm hover:shadow-md transition-shadow flex flex-col"
            >
              {/* Image Container with Antes/Depois badges */}
              <div className="relative rounded-xl overflow-hidden group">
                <img
                  src={card.image}
                  alt={card.title}
                  loading="lazy"
                  className="w-full aspect-[4/3] object-cover transition-transform duration-500 group-hover:scale-105"
                />
                {/* Labels overlay */}
                <div className="absolute inset-0 flex pointer-events-none">
                  <div className="flex-1 flex items-start justify-start p-3 sm:p-4">
                    <span
                      className="text-[11px] sm:text-xs font-semibold uppercase tracking-wider px-2.5 py-1 rounded backdrop-blur-sm shadow-sm"
                      style={{ backgroundColor: 'rgba(26,26,26,0.75)', color: '#fff' }}
                    >
                      ANTES
                    </span>
                  </div>
                  <div
                    className="w-[2px] h-[80%] self-center"
                    style={{ backgroundColor: 'rgba(255,255,255,0.85)' }}
                  />
                  <div className="flex-1 flex items-start justify-end p-3 sm:p-4">
                    <span
                      className="text-[11px] sm:text-xs font-semibold uppercase tracking-wider px-2.5 py-1 rounded backdrop-blur-sm shadow-sm"
                      style={{ backgroundColor: 'rgba(26,26,26,0.75)', color: '#fff' }}
                    >
                      DEPOIS
                    </span>
                  </div>
                </div>
              </div>

              {/* Card Content */}
              <div className="pt-4 flex flex-col flex-1">
                {card.badge && (
                  <div className="mb-2.5">
                    <span
                      className="inline-flex items-center text-[11px] sm:text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-full shadow-sm"
                      style={{ backgroundColor: '#012D76', color: '#FFFFFF' }}
                    >
                      {card.badge}
                    </span>
                  </div>
                )}
                <h3 className="text-lg sm:text-xl font-bold text-[#1A1A1A] mb-1.5 leading-snug">
                  {card.title}
                </h3>
                <p className="text-sm leading-relaxed" style={{ color: '#6B6B6B' }}>
                  {card.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Stats Row */}
        <div
          className="animate-item pt-12"
          style={{ borderTop: '1px solid #E5E2DE' }}
        >
          <div className="flex flex-col md:flex-row justify-center items-center gap-8 md:gap-16">
            <div className="text-center">
              <span
                ref={stat1Ref}
                className="font-display font-bold text-5xl md:text-6xl block"
                style={{ color: '#012D76' }}
              >
                0
              </span>
              <span className="text-sm mt-2 block" style={{ color: '#6B6B6B' }}>
                Projetos Concluídos
              </span>
            </div>
            <div className="text-center">
              <span
                ref={stat2Ref}
                className="font-display font-bold text-5xl md:text-6xl block"
                style={{ color: '#012D76' }}
              >
                0
              </span>
              <span className="text-sm mt-2 block" style={{ color: '#6B6B6B' }}>
                Clientes Satisfeitos
              </span>
            </div>
            <div className="text-center">
              <span
                ref={stat3Ref}
                className="font-display font-bold text-5xl md:text-6xl block"
                style={{ color: '#012D76' }}
              >
                0
              </span>
              <span className="text-sm mt-2 block" style={{ color: '#6B6B6B' }}>
                Tempo Médio de Entrega
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
