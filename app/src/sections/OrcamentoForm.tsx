import { useState } from 'react';
import { Send, CheckCircle, Phone, Mail, MessageSquare, Wrench } from 'lucide-react';
import { useStaggerFadeUp } from '../hooks/useScrollAnimation';
import { trpc } from '@/providers/trpc';

const SERVICES = [
  'Sanca de Gesso',
  'Forro de Gesso',
  'Drywall',
  'Reboco / Regularização',
  'Pintura e Acabamento',
  'Reforma Completa',
  'Outro / Não sei ainda',
];

const empty = { name: '', phone: '', email: '', service: '', message: '' };

export default function OrcamentoForm() {
  const sectionRef = useStaggerFadeUp<HTMLElement>({ childSelector: '.animate-item', stagger: 0.08, threshold: 0.05 });
  const [form, setForm] = useState(empty);
  const [errors, setErrors] = useState<Partial<typeof empty>>({});
  const [sent, setSent] = useState(false);

  const { data: configs } = trpc.admin.config.list.useQuery();
  const get = (key: string, fb: string) => configs?.find((c) => c.key === key)?.value || fb;
  const whatsappNumber = get('whatsappNumber', '5511999999999');
  const whatsappMessage = get('whatsappMessage', 'Olá! Vim pelo site e gostaria de um orçamento.');

  const submitMutation = trpc.admin.leads.submit.useMutation({
    onSuccess: () => { setSent(true); setForm(empty); },
  });

  const validate = () => {
    const e: Partial<typeof empty> = {};
    if (!form.name.trim()) e.name = 'Informe seu nome';
    if (!form.phone.trim()) e.phone = 'Informe seu telefone';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    submitMutation.mutate(form);
  };

  const inp = (key: keyof typeof empty) => ({
    value: form[key],
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
      setForm({ ...form, [key]: e.target.value }),
  });

  return (
    <section
      id="orcamento"
      ref={sectionRef}
      className="section-padding"
      style={{ background: 'linear-gradient(135deg, #1A1A1A 0%, #2D2D2D 100%)' }}
    >
      <div className="container-main">
        <div className="grid lg:grid-cols-2 gap-12 items-center">

          {/* Left — copy */}
          <div>
            <div className="animate-item mb-4">
              <span className="inline-block text-xs font-medium uppercase tracking-[0.15em] px-4 py-1.5 rounded-full"
                style={{ backgroundColor: 'rgba(212,167,75,0.15)', color: '#D4A74B', border: '1px solid rgba(212,167,75,0.3)' }}>
                Orçamento Gratuito
              </span>
            </div>
            <h2 className="animate-item font-display font-semibold mb-4 text-white"
              style={{ fontSize: 'clamp(1.75rem, 3.5vw, 3rem)', lineHeight: 1.2, letterSpacing: '-0.02em' }}>
              Solicite seu Orçamento Sem Compromisso
            </h2>
            <p className="animate-item text-lg mb-8" style={{ color: 'rgba(255,255,255,0.7)' }}>
              Preencha o formulário e entraremos em contato em até 2 horas com um orçamento personalizado para o seu projeto.
            </p>

            <div className="animate-item space-y-4">
              {[
                { icon: Phone, text: 'Resposta em até 2 horas' },
                { icon: MessageSquare, text: 'Atendimento via WhatsApp ou ligação' },
                { icon: Wrench, text: 'Visita técnica gratuita' },
                { icon: Mail, text: 'Orçamento detalhado por escrito' },
              ].map(({ icon: Icon, text }) => (
                <div key={text} className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
                    style={{ backgroundColor: 'rgba(212,167,75,0.15)' }}>
                    <Icon className="w-4 h-4" style={{ color: '#D4A74B' }} />
                  </div>
                  <span className="text-sm" style={{ color: 'rgba(255,255,255,0.8)' }}>{text}</span>
                </div>
              ))}
            </div>

            <div className="animate-item mt-8 pt-8" style={{ borderTop: '1px solid rgba(255,255,255,0.1)' }}>
              <p className="text-xs mb-3" style={{ color: 'rgba(255,255,255,0.4)' }}>Ou fale diretamente:</p>
              <a href={`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(whatsappMessage)}`}
                target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sm font-medium px-5 py-3 rounded-lg transition-all hover:scale-105"
                style={{ backgroundColor: '#25D366', color: '#fff' }}>
                <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
                Chamar no WhatsApp
              </a>
            </div>
          </div>

          {/* Right — form */}
          <div className="animate-item">
            <div className="bg-white rounded-2xl p-8">
              {sent ? (
                <div className="text-center py-6">
                  <CheckCircle className="w-16 h-16 mx-auto mb-4" style={{ color: '#22C55E' }} />
                  <h3 className="text-xl font-semibold text-[#1A1A1A] mb-2">Solicitação enviada!</h3>
                  <p className="text-sm text-[#6B6B6B]">Entraremos em contato em até 2 horas para agendar uma visita técnica gratuita.</p>
                  <button onClick={() => setSent(false)} className="mt-5 text-sm font-medium underline" style={{ color: '#D4A74B' }}>
                    Fazer outra solicitação
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-[#1A1A1A] mb-1">Nome completo *</label>
                    <input type="text" placeholder="Seu nome" {...inp('name')}
                      className={`w-full px-3 py-2.5 text-sm rounded-lg border ${errors.name ? 'border-red-400' : 'border-[#E5E2DE]'} focus:outline-none focus:ring-2 focus:ring-[#D4A74B]/50`} />
                    {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-[#1A1A1A] mb-1">WhatsApp *</label>
                      <input type="tel" placeholder="(11) 99999-9999" {...inp('phone')}
                        className={`w-full px-3 py-2.5 text-sm rounded-lg border ${errors.phone ? 'border-red-400' : 'border-[#E5E2DE]'} focus:outline-none focus:ring-2 focus:ring-[#D4A74B]/50`} />
                      {errors.phone && <p className="text-xs text-red-500 mt-1">{errors.phone}</p>}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-[#1A1A1A] mb-1">E-mail</label>
                      <input type="email" placeholder="seu@email.com" {...inp('email')}
                        className="w-full px-3 py-2.5 text-sm rounded-lg border border-[#E5E2DE] focus:outline-none focus:ring-2 focus:ring-[#D4A74B]/50" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[#1A1A1A] mb-1">Serviço de interesse</label>
                    <select {...inp('service')}
                      className="w-full px-3 py-2.5 text-sm rounded-lg border border-[#E5E2DE] focus:outline-none focus:ring-2 focus:ring-[#D4A74B]/50">
                      <option value="">Selecione...</option>
                      {SERVICES.map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[#1A1A1A] mb-1">Descreva seu projeto <span className="font-normal text-[#6B6B6B]">(opcional)</span></label>
                    <textarea {...inp('message')} rows={3} placeholder="Ex: quarto de 15m², quero sanca com LED e forro rebaixado..."
                      className="w-full px-3 py-2.5 text-sm rounded-lg border border-[#E5E2DE] focus:outline-none focus:ring-2 focus:ring-[#D4A74B]/50 resize-none" />
                  </div>

                  <button type="submit" disabled={submitMutation.isPending}
                    className="w-full inline-flex items-center justify-center gap-2 text-sm font-semibold px-6 py-3.5 rounded-lg transition-all disabled:opacity-60"
                    style={{ backgroundColor: '#D4A74B', color: '#1A1A1A' }}>
                    {submitMutation.isPending ? 'Enviando...' : <><Send className="w-4 h-4" /> Solicitar Orçamento Gratuito</>}
                  </button>

                  <p className="text-xs text-center" style={{ color: '#6B6B6B' }}>
                    Seus dados são usados apenas para entrar em contato. Sem spam.
                  </p>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
