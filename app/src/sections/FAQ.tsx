import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { useStaggerFadeUp } from '../hooks/useScrollAnimation';
import { trpc } from '@/providers/trpc';

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const sectionRef = useStaggerFadeUp<HTMLElement>({
    childSelector: '.animate-item',
    stagger: 0.08,
    threshold: 0.1,
  });

  const { data, isLoading } = trpc.admin.faqs.list.useQuery();
  const faqs = data?.filter((f) => f.active) ?? [];

  const toggle = (index: number) => setOpenIndex(openIndex === index ? null : index);

  return (
    <section id="faq" ref={sectionRef} className="section-padding" style={{ backgroundColor: '#F5F3F0' }}>
      <div className="container-main max-w-[800px]">
        {/* Header */}
        <div className="text-center mb-12">
          <h2
            className="animate-item font-display font-semibold mb-4"
            style={{ fontSize: 'clamp(2rem, 4vw, 3.5rem)', color: '#1A1A1A', lineHeight: 1.2, letterSpacing: '-0.02em' }}
          >
            Perguntas Frequentes
          </h2>
          <p className="animate-item text-lg" style={{ color: '#6B6B6B' }}>
            Tire suas dúvidas antes de começar
          </p>
        </div>

        {/* Accordion */}
        <div className="flex flex-col gap-3">
          {isLoading
            ? [...Array(4)].map((_, i) => (
                <div key={i} className="animate-pulse bg-white rounded-lg border h-14" style={{ borderColor: '#E5E2DE' }} />
              ))
            : faqs.map((faq, i) => (
                <div
                  key={faq.id}
                  className="animate-item bg-white rounded-lg border overflow-hidden transition-all duration-300"
                  style={{ borderColor: '#E5E2DE' }}
                >
                  <button
                    onClick={() => toggle(i)}
                    className="w-full flex items-center justify-between p-5 text-left cursor-pointer"
                  >
                    <span className="text-base font-semibold text-[#1A1A1A] pr-4">{faq.question}</span>
                    <ChevronDown
                      className="w-5 h-5 text-[#6B6B6B] flex-shrink-0 transition-transform duration-300"
                      style={{ transform: openIndex === i ? 'rotate(180deg)' : 'rotate(0deg)' }}
                    />
                  </button>
                  <div
                    className="overflow-hidden transition-all duration-300 ease-out"
                    style={{ maxHeight: openIndex === i ? '300px' : '0', opacity: openIndex === i ? 1 : 0 }}
                  >
                    <div
                      className="px-5 pb-5 text-sm leading-relaxed"
                      style={{
                        color: '#6B6B6B',
                        borderTop: openIndex === i ? '1px solid #E5E2DE' : 'none',
                        paddingTop: openIndex === i ? '0.75rem' : '0',
                      }}
                    >
                      {faq.answer}
                    </div>
                  </div>
                </div>
              ))}
        </div>
      </div>
    </section>
  );
}
