import { useState } from 'react';
import { Star, ChevronLeft, ChevronRight } from 'lucide-react';
import { useStaggerFadeUp } from '../hooks/useScrollAnimation';
import { trpc } from '@/providers/trpc';

export default function Depoimentos() {
  const [active, setActive] = useState(0);
  const sectionRef = useStaggerFadeUp<HTMLElement>({
    childSelector: '.animate-item',
    stagger: 0.15,
    threshold: 0.1,
  });

  const { data, isLoading } = trpc.admin.testimonials.list.useQuery();
  const testimonials = data?.filter((t) => t.active) ?? [];

  const prev = () => setActive((a) => (a === 0 ? testimonials.length - 1 : a - 1));
  const next = () => setActive((a) => (a === testimonials.length - 1 ? 0 : a + 1));

  if (isLoading || testimonials.length === 0) return null;

  return (
    <section id="depoimentos" ref={sectionRef} className="section-padding bg-white">
      <div className="container-main">
        {/* Header */}
        <div className="text-center mb-12">
          <h2
            className="animate-item font-display font-semibold mb-4"
            style={{ fontSize: 'clamp(2rem, 4vw, 3.5rem)', color: '#1A1A1A', lineHeight: 1.2, letterSpacing: '-0.02em' }}
          >
            O Que Nossos Clientes Dizem
          </h2>
          <p className="animate-item text-lg" style={{ color: '#6B6B6B' }}>
            A satisfação de quem confiou em nós
          </p>
        </div>

        {/* Carousel */}
        <div className="animate-item relative max-w-[700px] mx-auto">
          {/* Arrows */}
          <button
            onClick={prev}
            className="hidden md:flex absolute -left-16 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full border items-center justify-center transition-all duration-300 hover:bg-[#D4A74B] hover:border-[#D4A74B] group"
            style={{ borderColor: '#E5E2DE' }}
          >
            <ChevronLeft className="w-5 h-5 text-[#6B6B6B] group-hover:text-white transition-colors" />
          </button>
          <button
            onClick={next}
            className="hidden md:flex absolute -right-16 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full border items-center justify-center transition-all duration-300 hover:bg-[#D4A74B] hover:border-[#D4A74B] group"
            style={{ borderColor: '#E5E2DE' }}
          >
            <ChevronRight className="w-5 h-5 text-[#6B6B6B] group-hover:text-white transition-colors" />
          </button>

          {/* Card */}
          <div className="relative pt-8">
            {testimonials.map((t, i) => (
              <div
                key={t.id}
                className="transition-all duration-500"
                style={{ display: i === active ? 'block' : 'none', opacity: i === active ? 1 : 0 }}
              >
                <div className="rounded-xl p-8 relative" style={{ backgroundColor: '#F5F3F0' }}>
                  {/* Photo */}
                  <div
                    className="absolute -top-8 left-8 w-[60px] h-[60px] rounded-full overflow-hidden border-[3px] border-white"
                    style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}
                  >
                    {t.image ? (
                      <img src={t.image} alt={t.name} loading="lazy" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-[#D4A74B] flex items-center justify-center text-xl font-bold text-[#1A1A1A]">
                        {t.name.charAt(0)}
                      </div>
                    )}
                  </div>

                  {/* Stars */}
                  <div className="flex gap-1 mt-4 mb-4">
                    {[...Array(5)].map((_, j) => (
                      <Star
                        key={j}
                        className="w-4 h-4"
                        style={{ color: j < t.rating ? '#D4A74B' : '#E5E2DE' }}
                        fill={j < t.rating ? '#D4A74B' : 'transparent'}
                      />
                    ))}
                  </div>

                  {/* Text */}
                  <p className="text-base italic mb-6 leading-relaxed" style={{ color: '#1A1A1A' }}>
                    "{t.text}"
                  </p>

                  {/* Author */}
                  <div>
                    <h4 className="text-base font-semibold text-[#1A1A1A]">{t.name}</h4>
                    <p className="text-sm" style={{ color: '#6B6B6B' }}>{t.location}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Dots */}
          <div className="flex justify-center gap-2 mt-8">
            {testimonials.map((_, i) => (
              <button
                key={i}
                onClick={() => setActive(i)}
                className="w-2.5 h-2.5 rounded-full transition-all duration-300"
                style={{
                  backgroundColor: i === active ? '#D4A74B' : 'transparent',
                  border: i === active ? '1px solid #D4A74B' : '1px solid #E5E2DE',
                }}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
