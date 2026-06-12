import { Home, Layout, Lightbulb, Columns, Wrench, Paintbrush, ArrowRight } from 'lucide-react';
import { useStaggerFadeUp } from '../hooks/useScrollAnimation';
import { trpc } from '@/providers/trpc';
import type { LucideIcon } from 'lucide-react';

const iconMap: Record<string, LucideIcon> = {
  Home,
  Layout,
  Lightbulb,
  Columns,
  Wrench,
  Paintbrush,
};

export default function Servicos() {
  const sectionRef = useStaggerFadeUp<HTMLElement>({
    childSelector: '.animate-item',
    stagger: 0.15,
    threshold: 0.1,
  });

  const { data: services, isLoading } = trpc.admin.services.list.useQuery();
  const activeServices = services?.filter((s) => s.active) ?? [];

  return (
    <section id="servicos" ref={sectionRef} className="section-padding bg-white">
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
            Nossos Serviços
          </h2>
          <p className="animate-item text-lg" style={{ color: '#6B6B6B' }}>
            Do projeto à execução, cuidamos de cada detalhe para entregar o acabamento perfeito
          </p>
        </div>

        {/* Grid */}
        {isLoading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="rounded-xl bg-gray-200 aspect-[3/4] mb-4" />
                <div className="h-5 bg-gray-200 rounded mb-2 w-3/4" />
                <div className="h-4 bg-gray-100 rounded w-full" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {activeServices.map((service) => {
              const Icon = iconMap[service.icon] ?? Home;
              return (
                <div key={service.id} className="animate-item group">
                  {/* Image Container */}
                  <div className="relative rounded-xl overflow-hidden mb-4">
                    <img
                      src={service.image || '/images/servico-forro.jpg'}
                      alt={service.title}
                      loading="lazy"
                      className="w-full aspect-[3/4] object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                    />
                    {/* Icon */}
                    <div
                      className="absolute top-4 left-4 w-12 h-12 rounded-full flex items-center justify-center"
                      style={{ backgroundColor: '#fff', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}
                    >
                      <Icon className="w-5 h-5 text-[#1A1A1A]" />
                    </div>
                  </div>

                  {/* Content */}
                  <h3 className="text-xl font-semibold text-[#1A1A1A] mb-2">{service.title}</h3>
                  <p className="text-sm mb-3 line-clamp-2" style={{ color: '#6B6B6B' }}>
                    {service.description}
                  </p>
                  <a
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      document.querySelector('#catalogo')?.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className="inline-flex items-center text-sm font-semibold text-[#D4A74B] hover:underline transition-all"
                  >
                    Saiba mais
                    <ArrowRight className="ml-1 w-4 h-4" />
                  </a>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
