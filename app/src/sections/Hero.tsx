import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { MessageCircle, ArrowRight, Check } from 'lucide-react';
import { trpc } from '@/providers/trpc';

export default function Hero() {
  const badgeRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const descRef = useRef<HTMLParagraphElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);
  const trustRef = useRef<HTMLDivElement>(null);

  const { data: configs } = trpc.admin.config.list.useQuery();
  const get = (key: string, fallback: string) =>
    configs?.find((c) => c.key === key)?.value || fallback;

  const title = get('heroTitle', 'Transforme Seu Ambiente com Gesso e Drywall');
  const description = get('heroDescription', 'Sancas iluminadas, forros perfeitos, divisórias elegantes e acabamentos que valorizam seu imóvel. Atendimento em toda região com garantia de 5 anos.');
  const whatsappNumber = get('whatsappNumber', '5511999999999');
  const whatsappMessage = get('whatsappMessage', 'Olá! Vim pelo site e gostaria de um orçamento.');
  const statProjects = get('statProjects', '1200');
  const statYears = get('statYears', '15');
  const whatsappLink = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(whatsappMessage)}`;

  useEffect(() => {
    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
    tl.to(badgeRef.current, { opacity: 1, y: 0, duration: 0.8 })
      .to(titleRef.current, { opacity: 1, y: 0, duration: 0.8 }, '-=0.6')
      .to(descRef.current, { opacity: 1, y: 0, duration: 0.8 }, '-=0.6')
      .to(ctaRef.current, { opacity: 1, y: 0, duration: 0.8 }, '-=0.6')
      .to(trustRef.current, { opacity: 1, y: 0, duration: 0.8 }, '-=0.5');
    return () => { tl.kill(); };
  }, []);

  const handleCatalogClick = (e: React.MouseEvent) => {
    e.preventDefault();
    document.querySelector('#catalogo')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="relative w-full min-h-[100dvh] overflow-hidden flex items-center">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <img
          src="/images/hero-video.jpg"
          alt="Ambiente com sanca de gesso iluminada"
          loading="eager"
          className="w-full h-full object-cover"
        />
      </div>

      {/* Gradient Overlay */}
      <div
        className="absolute inset-0 z-[1]"
        style={{ background: 'linear-gradient(to right, rgba(26,26,26,0.85) 0%, rgba(26,26,26,0.4) 50%, transparent 100%)' }}
      />

      {/* Content */}
      <div className="container-main relative z-[2] pt-20">
        <div className="max-w-[600px]">
          {/* Badge */}
          <div ref={badgeRef} className="inline-block mb-6 opacity-0" style={{ transform: 'translateY(30px)' }}>
            <span
              className="text-xs font-medium uppercase tracking-[0.15em] px-4 py-2 rounded-full"
              style={{ backgroundColor: 'rgba(212, 167, 75, 0.15)', color: '#D4A74B', border: '1px solid rgba(212, 167, 75, 0.3)' }}
            >
              ⚡ ORÇAMENTO GRÁTIS EM 24H
            </span>
          </div>

          {/* Title */}
          <h1
            ref={titleRef}
            className="font-display font-bold text-white mb-6 opacity-0"
            style={{ fontSize: 'clamp(3rem, 6vw, 5rem)', lineHeight: 1.1, letterSpacing: '-0.02em', transform: 'translateY(30px)' }}
          >
            {title}
          </h1>

          {/* Description */}
          <p
            ref={descRef}
            className="text-lg mb-8 opacity-0 max-w-[480px]"
            style={{ color: 'rgba(255,255,255,0.85)', transform: 'translateY(30px)' }}
          >
            {description}
          </p>

          {/* CTA Group */}
          <div ref={ctaRef} className="flex flex-wrap gap-4 mb-16 opacity-0" style={{ transform: 'translateY(30px)' }}>
            <a href={whatsappLink} target="_blank" rel="noopener noreferrer" className="btn-primary">
              Pedir Orçamento no WhatsApp
              <MessageCircle className="ml-2 w-4 h-4" />
            </a>
            <a
              href="#catalogo"
              onClick={handleCatalogClick}
              className="inline-flex items-center justify-center px-8 py-4 text-sm font-semibold rounded-lg border-2 border-white text-white transition-all duration-300 hover:bg-white hover:text-[#1A1A1A]"
            >
              Ver Catálogo
              <ArrowRight className="ml-2 w-4 h-4" />
            </a>
          </div>

          {/* Trust Bar */}
          <div ref={trustRef} className="flex flex-wrap items-center gap-4 md:gap-8 opacity-0" style={{ transform: 'translateY(30px)' }}>
            {[
              `${statProjects}+ Projetos Entregues`,
              `${statYears} Anos de Experiência`,
              get('heroGuarantee', 'Garantia de 5 Anos'),
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-2">
                {i > 0 && <div className="hidden md:block w-[1px] h-5 mr-2" style={{ backgroundColor: 'rgba(255,255,255,0.2)' }} />}
                <Check className="w-4 h-4 text-[#D4A74B] flex-shrink-0" />
                <span className="text-sm" style={{ color: 'rgba(255,255,255,0.6)' }}>{item}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
