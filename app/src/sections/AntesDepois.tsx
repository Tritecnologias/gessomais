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
        <div className="grid md:grid-cols-2 gap-8 mb-16">
          {cards.map((card, i) => (
            <div key={i} className="animate-item">
              <div className="relative rounded-xl overflow-hidden group">
                <img
                  src={card.image}
                  alt={card.title}
                  loading="lazy"
                  className="w-full aspect-[4/3] object-cover"
                />
                {/* Labels overlay */}
                <div className="absolute inset-0 flex">
                  <div className="flex-1 flex items-start justify-start p-4">
                    <span
                      className="text-xs font-medium uppercase tracking-[0.1em] px-3 py-1.5 rounded"
                      style={{ backgroundColor: 'rgba(26,26,26,0.7)', color: '#fff' }}
                    >
                      ANTES
                    </span>
                  </div>
                  <div
                    className="w-[2px] h-[80%] self-center"
                    style={{ backgroundColor: 'rgba(255,255,255,0.8)' }}
                  />
                  <div className="flex-1 flex items-start justify-end p-4">
                    <span
                      className="text-xs font-medium uppercase tracking-[0.1em] px-3 py-1.5 rounded"
                      style={{ backgroundColor: 'rgba(26,26,26,0.7)', color: '#fff' }}
                    >
                      DEPOIS
                    </span>
                  </div>
                </div>
                {/* Badge */}
                <div className="absolute top-4 right-4">
                  <span
                    className="text-xs font-medium uppercase tracking-[0.1em] px-3 py-1.5 rounded-full"
                    style={{ backgroundColor: '#D4A74B', color: '#1A1A1A' }}
                  >
                    {card.badge}
                  </span>
                </div>
              </div>
              <div className="mt-4">
                <h3 className="text-xl font-semibold text-[#1A1A1A] mb-1">{card.title}</h3>
                <p className="text-sm" style={{ color: '#6B6B6B' }}>{card.description}</p>
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
                style={{ color: '#D4A74B' }}
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
                style={{ color: '#D4A74B' }}
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
                style={{ color: '#D4A74B' }}
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
