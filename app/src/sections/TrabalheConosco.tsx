import { useState } from 'react';
import { MapPin, Briefcase, ChevronRight, Send, CheckCircle } from 'lucide-react';
import { useStaggerFadeUp } from '../hooks/useScrollAnimation';
import { trpc } from '@/providers/trpc';

const TYPE_COLORS: Record<string, { bg: string; text: string }> = {
  CLT:      { bg: '#EFF6FF', text: '#2563EB' },
  PJ:       { bg: '#F0FDF4', text: '#16A34A' },
  Freelance:{ bg: '#FFF7ED', text: '#EA580C' },
  Estágio:  { bg: '#FAF5FF', text: '#9333EA' },
};

const AREAS = [
  'Gesseiro',
  'Instalador de Drywall',
  'Pintura e Acabamento',
  'Assistente de Obras',
  'Orçamentista',
  'Motorista / Entregador',
  'Outro',
];

const EXPERIENCES = [
  'Sem experiência',
  'Menos de 1 ano',
  '1 a 2 anos',
  '3 a 5 anos',
  'Mais de 5 anos',
];

const AVAILABILITIES = [
  'Imediata',
  '15 dias',
  '30 dias',
  'A combinar',
];

const emptyForm = {
  name: '',
  email: '',
  phone: '',
  area: '',
  experience: '',
  availability: '',
  hasCnh: false,
  hasVehicle: false,
  message: '',
};

function JobSkeleton() {
  return (
    <div className="bg-white rounded-xl border border-[#E5E2DE] p-6 animate-pulse">
      <div className="flex items-start justify-between mb-4">
        <div className="h-5 bg-[#E5E2DE] rounded w-48" />
        <div className="h-6 bg-[#E5E2DE] rounded-full w-16" />
      </div>
      <div className="flex gap-4 mb-4">
        <div className="h-4 bg-[#E5E2DE] rounded w-32" />
      </div>
      <div className="space-y-2 mb-5">
        <div className="h-3 bg-[#E5E2DE] rounded w-full" />
        <div className="h-3 bg-[#E5E2DE] rounded w-4/5" />
      </div>
      <div className="h-10 bg-[#E5E2DE] rounded-lg w-40" />
    </div>
  );
}

export default function TrabalheConosco() {
  const sectionRef = useStaggerFadeUp<HTMLElement>({
    childSelector: '.animate-item',
    stagger: 0.08,
    threshold: 0.05,
  });

  const { data: configs } = trpc.admin.config.list.useQuery();
  const get = (key: string, fallback: string) =>
    configs?.find((c) => c.key === key)?.value || fallback;

  const { data: jobs, isLoading: jobsLoading } = trpc.admin.jobOpenings.list.useQuery();
  const activeJobs = jobs?.filter((j) => j.active) ?? [];

  const whatsappNumber = get('whatsappNumber', '5511999999999');
  const companyName   = get('footerCompanyName', 'Gesso Premium');

  const [form, setForm] = useState(emptyForm);
  const [sent, setSent] = useState(false);
  const [errors, setErrors] = useState<Partial<typeof emptyForm>>({});

  const submitMutation = trpc.admin.jobApplications.submit.useMutation({
    onSuccess: () => { setSent(true); setForm(emptyForm); },
  });

  const validate = () => {
    const e: Partial<typeof emptyForm> = {};
    if (!form.name.trim())         e.name         = 'Informe seu nome';
    if (!form.email.trim())        e.email        = 'Informe seu e-mail';
    if (!form.phone.trim())        e.phone        = 'Informe seu telefone';
    if (!form.area)                e.area         = 'Selecione uma área';
    if (!form.experience)          e.experience   = 'Selecione sua experiência';
    if (!form.availability)        e.availability = 'Selecione sua disponibilidade';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    submitMutation.mutate(form);
  };

  const field = (key: keyof typeof emptyForm) => ({
    value: form[key] as string,
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
      setForm({ ...form, [key]: e.target.value }),
    className: `w-full px-3 py-2.5 text-sm rounded-lg border ${errors[key] ? 'border-red-400' : 'border-[#E5E2DE]'} focus:outline-none focus:ring-2 focus:ring-[#D4A74B]/50`,
  });

  return (
    <section
      id="trabalhe-conosco"
      ref={sectionRef}
      className="section-padding"
      style={{ backgroundColor: '#F5F3F0' }}
    >
      <div className="container-main">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="animate-item mb-4">
            <span
              className="inline-block text-xs font-medium uppercase tracking-[0.15em] px-4 py-1.5 rounded-full"
              style={{ backgroundColor: 'rgba(212,167,75,0.12)', color: '#D4A74B', border: '1px solid rgba(212,167,75,0.3)' }}
            >
              Faça Parte do Time
            </span>
          </div>
          <h2
            className="animate-item font-display font-semibold mb-4"
            style={{ fontSize: 'clamp(2rem, 4vw, 3.5rem)', color: '#1A1A1A', lineHeight: 1.2, letterSpacing: '-0.02em' }}
          >
            Trabalhe Conosco
          </h2>
          <p className="animate-item text-lg max-w-[560px] mx-auto" style={{ color: '#6B6B6B' }}>
            Junte-se a uma equipe apaixonada por transformar ambientes.
          </p>
        </div>

        {/* Vagas abertas */}
        {jobsLoading ? (
          <div className="grid md:grid-cols-2 gap-6 max-w-[900px] mx-auto mb-16">
            {[0, 1].map((i) => <div key={i} className="animate-item"><JobSkeleton /></div>)}
          </div>
        ) : activeJobs.length > 0 ? (
          <div className="grid md:grid-cols-2 gap-6 max-w-[900px] mx-auto mb-16">
            {activeJobs.map((job) => {
              const typeStyle = TYPE_COLORS[job.type] ?? { bg: '#F5F3F0', text: '#6B6B6B' };
              const message = `Olá! Vi a vaga de ${job.title} no site da ${companyName} e gostaria de me candidatar.`;
              const link = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
              return (
                <div key={job.id} className="animate-item bg-white rounded-xl border border-[#E5E2DE] p-6 hover:shadow-md transition-shadow duration-300 flex flex-col">
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <h3 className="text-lg font-semibold text-[#1A1A1A] leading-tight">{job.title}</h3>
                    <span className="shrink-0 text-xs font-semibold px-2.5 py-1 rounded-full" style={{ backgroundColor: typeStyle.bg, color: typeStyle.text }}>{job.type}</span>
                  </div>
                  {job.location && (
                    <div className="flex items-center gap-1.5 text-sm mb-3" style={{ color: '#6B6B6B' }}>
                      <MapPin className="w-3.5 h-3.5" />{job.location}
                      <span className="mx-2 opacity-30">|</span>
                      <Briefcase className="w-3.5 h-3.5" />{job.type}
                    </div>
                  )}
                  {job.description && <p className="text-sm mb-4 leading-relaxed flex-1" style={{ color: '#6B6B6B' }}>{job.description}</p>}
                  {job.requirements && (
                    <div className="mb-5">
                      <p className="text-xs font-semibold uppercase tracking-wider text-[#1A1A1A] mb-2">Requisitos</p>
                      <ul className="space-y-1">
                        {job.requirements.split('\n').filter(Boolean).map((req, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm" style={{ color: '#6B6B6B' }}>
                            <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-[#D4A74B] shrink-0" />
                            {req.replace(/^[-•*]\s*/, '')}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  <a href={link} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-sm font-semibold px-5 py-3 rounded-lg transition-all duration-200 hover:scale-[1.02] mt-auto" style={{ backgroundColor: '#D4A74B', color: '#1A1A1A' }}>
                    Quero Me Candidatar <ChevronRight className="w-4 h-4" />
                  </a>
                </div>
              );
            })}
          </div>
        ) : (
          /* Sem vagas abertas */
          <div className="animate-item max-w-[600px] mx-auto text-center mb-16">
            <div className="bg-white rounded-2xl border border-[#E5E2DE] px-8 py-10">
              <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-5" style={{ backgroundColor: 'rgba(212,167,75,0.12)' }}>
                <Briefcase className="w-8 h-8" style={{ color: '#D4A74B' }} />
              </div>
              <h3 className="text-xl font-semibold text-[#1A1A1A] mb-3">Nenhuma vaga aberta no momento</h3>
              <p className="text-sm leading-relaxed" style={{ color: '#6B6B6B' }}>
                No momento não temos vagas disponíveis, mas estamos sempre em busca de talentos.
                Preencha o formulário abaixo e entraremos em contato assim que surgir uma oportunidade.
              </p>
            </div>
          </div>
        )}

        {/* Formulário de candidatura */}
        <div className="animate-item max-w-[720px] mx-auto">
          <div className="bg-white rounded-2xl border border-[#E5E2DE] p-8">
            {sent ? (
              <div className="text-center py-8">
                <CheckCircle className="w-16 h-16 mx-auto mb-4" style={{ color: '#22C55E' }} />
                <h3 className="text-xl font-semibold text-[#1A1A1A] mb-2">Currículo enviado com sucesso!</h3>
                <p className="text-sm" style={{ color: '#6B6B6B' }}>
                  Recebemos suas informações. Entraremos em contato quando houver uma oportunidade compatível com seu perfil.
                </p>
                <button
                  onClick={() => setSent(false)}
                  className="mt-6 text-sm font-medium underline"
                  style={{ color: '#D4A74B' }}
                >
                  Enviar outro cadastro
                </button>
              </div>
            ) : (
              <>
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-[#1A1A1A] mb-1">Envie seu currículo</h3>
                  <p className="text-sm" style={{ color: '#6B6B6B' }}>
                    Preencha os campos abaixo e entraremos em contato quando surgir uma vaga para o seu perfil.
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Nome + Telefone */}
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-[#1A1A1A] mb-1">Nome completo *</label>
                      <input type="text" placeholder="Seu nome" {...field('name')} />
                      {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-[#1A1A1A] mb-1">WhatsApp *</label>
                      <input type="tel" placeholder="(11) 99999-9999" {...field('phone')} />
                      {errors.phone && <p className="text-xs text-red-500 mt-1">{errors.phone}</p>}
                    </div>
                  </div>

                  {/* E-mail */}
                  <div>
                    <label className="block text-sm font-medium text-[#1A1A1A] mb-1">E-mail *</label>
                    <input type="email" placeholder="seu@email.com" {...field('email')} />
                    {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
                  </div>

                  {/* Área + Experiência */}
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-[#1A1A1A] mb-1">Área de interesse *</label>
                      <select {...field('area')}>
                        <option value="">Selecione...</option>
                        {AREAS.map((a) => <option key={a} value={a}>{a}</option>)}
                      </select>
                      {errors.area && <p className="text-xs text-red-500 mt-1">{errors.area}</p>}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-[#1A1A1A] mb-1">Experiência na área *</label>
                      <select {...field('experience')}>
                        <option value="">Selecione...</option>
                        {EXPERIENCES.map((e) => <option key={e} value={e}>{e}</option>)}
                      </select>
                      {errors.experience && <p className="text-xs text-red-500 mt-1">{errors.experience}</p>}
                    </div>
                  </div>

                  {/* Disponibilidade */}
                  <div>
                    <label className="block text-sm font-medium text-[#1A1A1A] mb-1">Disponibilidade para início *</label>
                    <select {...field('availability')}>
                      <option value="">Selecione...</option>
                      {AVAILABILITIES.map((a) => <option key={a} value={a}>{a}</option>)}
                    </select>
                    {errors.availability && <p className="text-xs text-red-500 mt-1">{errors.availability}</p>}
                  </div>

                  {/* CNH + Veículo */}
                  <div className="flex flex-wrap gap-6 py-1">
                    <label className="flex items-center gap-2.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={form.hasCnh}
                        onChange={(e) => setForm({ ...form, hasCnh: e.target.checked })}
                        className="w-4 h-4 rounded border-[#E5E2DE] accent-[#D4A74B]"
                      />
                      <span className="text-sm text-[#1A1A1A]">Possuo CNH</span>
                    </label>
                    <label className="flex items-center gap-2.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={form.hasVehicle}
                        onChange={(e) => setForm({ ...form, hasVehicle: e.target.checked })}
                        className="w-4 h-4 rounded border-[#E5E2DE] accent-[#D4A74B]"
                      />
                      <span className="text-sm text-[#1A1A1A]">Possuo veículo próprio</span>
                    </label>
                  </div>

                  {/* Mensagem */}
                  <div>
                    <label className="block text-sm font-medium text-[#1A1A1A] mb-1">
                      Por que quer trabalhar conosco? <span className="font-normal text-[#6B6B6B]">(opcional)</span>
                    </label>
                    <textarea
                      {...field('message')}
                      rows={3}
                      placeholder="Conte um pouco sobre você, suas habilidades e motivações..."
                      className={`w-full px-3 py-2.5 text-sm rounded-lg border border-[#E5E2DE] focus:outline-none focus:ring-2 focus:ring-[#D4A74B]/50 resize-none`}
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={submitMutation.isPending}
                    className="w-full inline-flex items-center justify-center gap-2 text-sm font-semibold px-6 py-3.5 rounded-lg transition-all duration-200 disabled:opacity-60"
                    style={{ backgroundColor: '#D4A74B', color: '#1A1A1A' }}
                  >
                    {submitMutation.isPending ? 'Enviando...' : (
                      <><Send className="w-4 h-4" /> Enviar Meu Currículo</>
                    )}
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
