import { MessageCircle } from 'lucide-react';
import { useStaggerFadeUp } from '../hooks/useScrollAnimation';
import { trpc } from '@/providers/trpc';

export default function CTAFinal() {
  const sectionRef = useStaggerFadeUp<HTMLElement>({
    childSelector: '.animate-item',
    stagger: 0.15,
    threshold: 0.2,
  });

  const { data: configs } = trpc.admin.config.list.useQuery();
  const get = (key: string, fallback: string) =>
    configs?.find((c) => c.key === key)?.value || fallback;

  const badge = get('ctaBadge', '🔥 VAGAS LIMITADAS PARA ESTE MÊS');
  const title = get('ctaTitle', 'Pronto para Transformar Seu Ambiente?');
  const description = get('ctaDescription', 'Orçamento grátis em 24h. Atendimento personalizado. Garantia de 5 anos. Não espere mais para ter o ambiente dos seus sonhos.');
  const secondaryText = get('ctaSecondaryText', 'Resposta em até 2h | Orçamento sem compromisso');
  const whatsappNumber = get('whatsappNumber', '5511999999999');
  const whatsappMessage = get('whatsappMessage', 'Olá! Vim pelo site e gostaria de um orçamento.');
  const whatsappLink = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(whatsappMessage)}`;

  return (
    <section
      ref={sectionRef}
      className="section-padding"
      style={{
        background: 'linear-gradient(135deg, #1A1A1A 0%, #2D2D2D 100%)',
      }}
    >
      <div className="container-main max-w-[800px] text-center">
        {/* Badge */}
        <div className="animate-item mb-6">
          <span
            className="inline-block text-xs font-medium uppercase tracking-[0.15em] px-5 py-2 rounded-full"
            style={{
              backgroundColor: 'rgba(212, 167, 75, 0.15)',
              color: '#D4A74B',
              border: '1px solid rgba(212, 167, 75, 0.3)',
            }}
          >
            {badge}
          </span>
        </div>

        {/* Title */}
        <h2
          className="animate-item font-display font-semibold mb-4"
          style={{
            fontSize: 'clamp(2rem, 4vw, 3.5rem)',
            color: '#FFFFFF',
            lineHeight: 1.2,
            letterSpacing: '-0.02em',
          }}
        >
          {title}
        </h2>

        {/* Description */}
        <p
          className="animate-item text-lg mb-8 max-w-[560px] mx-auto"
          style={{ color: 'rgba(255,255,255,0.8)' }}
        >
          {description}
        </p>

        {/* CTA Button */}
        <div className="animate-item">
          <a
            href={whatsappLink}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center px-10 py-5 text-base font-semibold rounded-lg transition-all duration-300 hover:scale-105"
            style={{
              backgroundColor: '#D4A74B',
              color: '#1A1A1A',
              boxShadow: '0 8px 30px rgba(212,167,75,0.3)',
            }}
          >
            Pedir Orçamento Agora
            <MessageCircle className="ml-3 w-5 h-5" />
          </a>
        </div>

        {/* Secondary Info */}
        <p
          className="animate-item text-sm mt-6"
          style={{ color: 'rgba(255,255,255,0.5)' }}
        >
          {secondaryText}
        </p>
      </div>
    </section>
  );
}
