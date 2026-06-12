import { useRef } from 'react';
import { MessageCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import { useStaggerFadeUp } from '../hooks/useScrollAnimation';
import { trpc } from '@/providers/trpc';

export default function Catalogo() {
  const sectionRef = useStaggerFadeUp<HTMLElement>({
    childSelector: '.animate-item',
    stagger: 0.1,
    threshold: 0.1,
  });

  const sliderRef = useRef<HTMLDivElement>(null);

  const { data: products, isLoading } = trpc.admin.products.list.useQuery();
  const { data: configs } = trpc.admin.config.list.useQuery();

  const activeProducts = products?.filter((p) => p.active) ?? [];

  const get = (key: string, fallback: string) =>
    configs?.find((c) => c.key === key)?.value || fallback;

  const whatsappNumber = get('whatsappNumber', '5511999999999');
  const whatsappMessage = get('whatsappMessage', 'Olá! Vim pelo site e gostaria de comprar ');
  const whatsappBase = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(whatsappMessage)}`;

  const scrollSlider = (direction: 'left' | 'right') => {
    if (sliderRef.current) {
      sliderRef.current.scrollBy({ left: direction === 'left' ? -296 : 296, behavior: 'smooth' });
    }
  };

  return (
    <section id="catalogo" ref={sectionRef} className="section-padding" style={{ backgroundColor: '#F5F3F0' }}>
      <div className="container-main">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-12 gap-4">
          <h2
            className="animate-item font-display font-semibold"
            style={{ fontSize: 'clamp(2rem, 4vw, 3.5rem)', color: '#1A1A1A', lineHeight: 1.2, letterSpacing: '-0.02em' }}
          >
            Nosso Catálogo
          </h2>
          <a
            href="#"
            onClick={(e) => e.preventDefault()}
            className="animate-item inline-flex items-center text-sm font-semibold text-[#D4A74B] hover:underline"
          >
            Ver todos os produtos
            <ChevronRight className="ml-1 w-4 h-4" />
          </a>
        </div>
      </div>

      {/* Slider */}
      <div className="animate-item relative container-main">
        <button
          onClick={() => scrollSlider('left')}
          className="hidden lg:flex absolute -left-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full border items-center justify-center transition-all duration-300 hover:bg-[#D4A74B] hover:border-[#D4A74B] group"
          style={{ borderColor: '#E5E2DE' }}
        >
          <ChevronLeft className="w-5 h-5 text-[#6B6B6B] group-hover:text-white transition-colors" />
        </button>
        <button
          onClick={() => scrollSlider('right')}
          className="hidden lg:flex absolute -right-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full border items-center justify-center transition-all duration-300 hover:bg-[#D4A74B] hover:border-[#D4A74B] group"
          style={{ borderColor: '#E5E2DE' }}
        >
          <ChevronRight className="w-5 h-5 text-[#6B6B6B] group-hover:text-white transition-colors" />
        </button>

        <div
          ref={sliderRef}
          className="flex gap-6 overflow-x-auto hide-scrollbar pb-4 scroll-smooth"
          style={{ scrollSnapType: 'x mandatory' }}
        >
          {isLoading
            ? [...Array(4)].map((_, i) => (
                <div
                  key={i}
                  className="flex-shrink-0 w-[260px] md:w-[280px] bg-white rounded-xl border animate-pulse"
                  style={{ borderColor: '#E5E2DE', scrollSnapAlign: 'start' }}
                >
                  <div className="aspect-square bg-gray-200" />
                  <div className="p-5 space-y-3">
                    <div className="h-4 bg-gray-200 rounded w-3/4" />
                    <div className="h-3 bg-gray-100 rounded w-full" />
                    <div className="h-6 bg-gray-200 rounded w-1/2" />
                    <div className="h-10 bg-gray-100 rounded" />
                  </div>
                </div>
              ))
            : activeProducts.map((product) => (
                <div
                  key={product.id}
                  className="flex-shrink-0 w-[260px] md:w-[280px] bg-white rounded-xl border overflow-hidden transition-all duration-300 hover:-translate-y-1 group"
                  style={{ borderColor: '#E5E2DE', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', scrollSnapAlign: 'start' }}
                >
                  {/* Image */}
                  <div className="relative aspect-square overflow-hidden">
                    <img
                      src={product.image || '/images/catalogo-sanca-led.jpg'}
                      alt={product.name}
                      loading="lazy"
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                    />
                    {product.badge && (
                      <div className="absolute top-3 right-3">
                        <span
                          className="text-[0.65rem] font-medium uppercase tracking-wider px-3 py-1 rounded-full"
                          style={{ backgroundColor: product.badgeColor || '#D4A74B', color: product.badgeTextColor || '#1A1A1A' }}
                        >
                          {product.badge}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="p-5">
                    <h3 className="text-base font-semibold text-[#1A1A1A] mb-1">{product.name}</h3>
                    <p className="text-sm mb-3 line-clamp-2" style={{ color: '#6B6B6B' }}>
                      {product.description}
                    </p>
                    <div className="flex items-baseline gap-2 mb-4">
                      <span className="text-xl font-bold" style={{ color: '#22C55E' }}>
                        R$ {product.price}/{product.unit}
                      </span>
                      {product.oldPrice && (
                        <span className="text-sm line-through" style={{ color: '#6B6B6B' }}>
                          R$ {product.oldPrice}
                        </span>
                      )}
                    </div>
                    <a
                      href={`${whatsappBase}${encodeURIComponent(product.name)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-primary w-full text-xs py-3"
                    >
                      Comprar no WhatsApp
                      <MessageCircle className="ml-2 w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>
              ))}
        </div>
      </div>
    </section>
  );
}
