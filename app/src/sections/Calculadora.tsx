import { useState } from "react";
import { Calculator, ChevronRight, Package } from "lucide-react";
import { trpc } from "@/providers/trpc";
import { toast } from "sonner";

type ServiceKey = "gesso_paredes" | "gesso_teto" | "drywall" | "reboco";
type CalcResult = { item: string; qty: number; unit: string; note?: string }[];

function buildServices(cfg: (key: string, fallback: string) => number) {
  return {
    gesso_paredes: {
      label: "Gesso Liso em Paredes",
      description: "Aplicação de gesso em paredes internas",
      icon: "🏠",
      calc: (area: number): CalcResult => {
        const kgM2 = cfg("calc_gp_gesso_kg_m2", "1.5");
        const sacoKg = cfg("calc_gp_saco_kg", "20");
        const aguaM2 = cfg("calc_gp_agua_litros_m2", "0.7");
        const lixaM2 = cfg("calc_gp_lixa_m2", "10");
        return [
          { item: `Gesso em pó (saco ${sacoKg}kg)`, qty: Math.ceil(area * kgM2 / sacoKg), unit: "sacos", note: `~${kgM2} kg/m²` },
          { item: "Água", qty: Math.ceil(area * aguaM2), unit: "litros" },
          { item: "Lixas (grão 120)", qty: Math.ceil(area / lixaM2), unit: "folhas" },
        ];
      },
    },
    gesso_teto: {
      label: "Forro / Teto de Gesso",
      description: "Forro de gesso liso ou com moldura",
      icon: "⬜",
      calc: (area: number): CalcResult => {
        const kgM2 = cfg("calc_gt_gesso_kg_m2", "1.2");
        const sacoKg = cfg("calc_gt_saco_kg", "20");
        const telaRolo = cfg("calc_gt_tela_m2_rolo", "50");
        const aguaM2 = cfg("calc_gt_agua_litros_m2", "0.6");
        const lixaM2 = cfg("calc_gt_lixa_m2", "12");
        return [
          { item: `Gesso em pó (saco ${sacoKg}kg)`, qty: Math.ceil(area * kgM2 / sacoKg), unit: "sacos", note: `~${kgM2} kg/m²` },
          { item: `Tela de fibra (${telaRolo}m²/rolo)`, qty: Math.ceil(area / telaRolo), unit: "rolos" },
          { item: "Água", qty: Math.ceil(area * aguaM2), unit: "litros" },
          { item: "Lixas (grão 120)", qty: Math.ceil(area / lixaM2), unit: "folhas" },
        ];
      },
    },
    drywall: {
      label: "Drywall (Parede Seca)",
      description: "Parede em gesso acartonado",
      icon: "📦",
      calc: (area: number): CalcResult => {
        const placaM2 = cfg("calc_dw_placa_m2", "2.88");
        const perdaPct = cfg("calc_dw_perda_pct", "10") / 100;
        const espCm = cfg("calc_dw_montante_esp_cm", "60") / 100;
        const parafusosPlaca = cfg("calc_dw_parafusos_por_placa", "25");
        const parafusosCx = cfg("calc_dw_parafusos_cx", "500");
        const fitaRolo = cfg("calc_dw_fita_m_rolo", "50");
        const massaBalde = cfg("calc_dw_massa_kg_balde", "25");
        const placas = Math.ceil((area / placaM2) * (1 + perdaPct));
        const perimeter = Math.ceil(Math.sqrt(area) * 4);
        return [
          { item: `Placas Drywall (${placaM2}m²)`, qty: placas, unit: "placas", note: `+${Math.round(perdaPct * 100)}% perdas` },
          { item: "Perfil Guia 70mm (barra 3m)", qty: Math.ceil(perimeter / 3 * 2), unit: "barras" },
          { item: "Perfil Montante 70mm (barra 3m)", qty: Math.ceil(area / espCm / 3), unit: "barras", note: `espaçamento ${Math.round(espCm * 100)}cm` },
          { item: `Parafusos drywall (cx ${parafusosCx}un)`, qty: Math.ceil(placas * parafusosPlaca / parafusosCx), unit: "caixas" },
          { item: `Fita para juntas (${fitaRolo}m/rolo)`, qty: Math.ceil(area * 0.3 / fitaRolo), unit: "rolos" },
          { item: `Massa para junta (balde ${massaBalde}kg)`, qty: Math.ceil(area * 0.5 / massaBalde), unit: "baldes" },
        ];
      },
    },
    reboco: {
      label: "Reboco / Emboço",
      description: "Chapisco + reboco em paredes externas ou internas",
      icon: "🧱",
      calc: (area: number): CalcResult => {
        const argKgM2 = cfg("calc_rb_argamassa_kg_m2", "12");
        const sacoKg = cfg("calc_rb_saco_kg", "20");
        const areiaKgM2 = cfg("calc_rb_areia_kg_m2", "1.5");
        const telaPerda = 1 + cfg("calc_rb_tela_perda_pct", "5") / 100;
        const aguaM2 = cfg("calc_rb_agua_litros_m2", "2.5");
        return [
          { item: `Argamassa AC-I (saco ${sacoKg}kg)`, qty: Math.ceil(area * argKgM2 / sacoKg), unit: "sacos", note: `~${argKgM2} kg/m²` },
          { item: "Areia média", qty: Math.ceil(area * areiaKgM2), unit: "kg" },
          { item: "Tela de revestimento", qty: Math.ceil(area * telaPerda), unit: "m²", note: `+${Math.round((telaPerda - 1) * 100)}% sobreposição` },
          { item: "Água", qty: Math.ceil(area * aguaM2), unit: "litros" },
        ];
      },
    },
  };
}

export default function Calculadora() {
  const [service, setService] = useState<ServiceKey | null>(null);
  const [area, setArea] = useState("");
  const [result, setResult] = useState<CalcResult | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);

  const submitLead = trpc.admin.leads.submit.useMutation({
    onSuccess: () => { toast.success("Solicitação enviada! Entraremos em contato."); setSent(true); setSubmitting(false); },
    onError: () => { toast.error("Erro ao enviar. Tente novamente."); setSubmitting(false); },
  });
  const { data: config = [] } = trpc.admin.config.list.useQuery();
  const cfgNum = (key: string, fallback: string) =>
    Number(config.find((c) => c.key === key)?.value ?? fallback) || Number(fallback);
  const get = (key: string, fallback = "") => config.find((c) => c.key === key)?.value ?? fallback;
  const whatsapp = get("whatsapp", "");

  const SERVICES = buildServices(cfgNum);

  function calculate() {
    if (!service || !area || Number(area) <= 0) return;
    setResult(SERVICES[service].calc(Number(area)));
  }

  function requestQuote() {
    if (!service || !area) return;
    const items = SERVICES[service].calc(Number(area));
    const message = `Olá! Usei a calculadora do site e preciso de orçamento:\n\nServiço: ${SERVICES[service].label}\nÁrea: ${area} m²\n\nMateriais estimados:\n${items.map((i) => `- ${i.qty} ${i.unit} de ${i.item}`).join("\n")}`;

    if (whatsapp) {
      window.open(`https://wa.me/55${whatsapp.replace(/\D/g, "")}?text=${encodeURIComponent(message)}`, "_blank");
    } else {
      setSubmitting(true);
      submitLead.mutate({
        name: "Calculadora — visitante",
        phone: "—",
        service: SERVICES[service].label,
        message: `Área: ${area}m²\n${items.map((i) => `${i.qty} ${i.unit} de ${i.item}`).join(", ")}`,
      });
    }
  }

  return (
    <section id="calculadora" className="py-20 bg-[#F5F3F0]">
      <div className="max-w-5xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <span className="inline-flex items-center gap-2 bg-[#D4A74B]/15 text-[#D4A74B] text-sm font-semibold px-4 py-1.5 rounded-full mb-4">
            <Calculator className="w-4 h-4" /> Calculadora de Materiais
          </span>
          <h2 className="text-3xl md:text-4xl font-display font-bold text-[#1A1A1A] mb-4">
            Descubra quanto material você precisa
          </h2>
          <p className="text-[#6B6B6B] max-w-xl mx-auto">
            Informe o tipo de serviço e a metragem da sua obra. Calculamos os materiais estimados na hora — sem compromisso.
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-[#E5E2DE] overflow-hidden">
          <div className="p-6 md:p-8">
            {/* Step 1 — choose service */}
            <div className="mb-8">
              <p className="text-sm font-semibold text-[#1A1A1A] mb-3">1. Selecione o serviço</p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {(Object.entries(SERVICES) as [ServiceKey, ServiceDef][]).map(([key, s]) => (
                  <button
                    key={key}
                    onClick={() => { setService(key); setResult(null); }}
                    className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 text-center transition-all ${
                      service === key
                        ? "border-[#D4A74B] bg-[#D4A74B]/5"
                        : "border-[#E5E2DE] hover:border-[#D4A74B]/50"
                    }`}
                  >
                    <span className="text-2xl">{s.icon}</span>
                    <span className="text-xs font-semibold text-[#1A1A1A] leading-tight">{s.label}</span>
                    <span className="text-[11px] text-[#9CA3AF] leading-tight hidden md:block">{s.description}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Step 2 — area */}
            <div className="mb-8">
              <p className="text-sm font-semibold text-[#1A1A1A] mb-3">2. Informe a área (m²)</p>
              <div className="flex gap-3 max-w-sm">
                <input
                  type="number"
                  min="1"
                  step="0.5"
                  value={area}
                  onChange={(e) => { setArea(e.target.value); setResult(null); }}
                  placeholder="Ex: 24"
                  className="flex-1 border border-[#E5E2DE] rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-[#D4A74B]"
                />
                <span className="flex items-center text-sm text-[#6B6B6B] font-medium">m²</span>
                <button
                  onClick={calculate}
                  disabled={!service || !area || Number(area) <= 0}
                  className="bg-[#1A1A1A] text-white font-semibold text-sm px-5 py-2.5 rounded-lg hover:bg-[#333] transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  Calcular <ChevronRight className="w-4 h-4" />
                </button>
              </div>
              <p className="text-xs text-[#9CA3AF] mt-2">
                Dica: para um cômodo de 4×6m → 24m². Para teto, use a área do piso.
              </p>
            </div>

            {/* Results */}
            {result && (
              <div className="border-t border-[#E5E2DE] pt-8">
                <div className="flex items-center gap-2 mb-4">
                  <Package className="w-5 h-5 text-[#D4A74B]" />
                  <p className="text-sm font-semibold text-[#1A1A1A]">
                    Estimativa para {area}m² — {service && SERVICES[service].label}
                  </p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-6">
                  {result.map((item, i) => (
                    <div key={i} className="bg-[#F5F3F0] rounded-xl p-4 flex items-start gap-3">
                      <div className="w-10 h-10 rounded-lg bg-[#D4A74B]/15 flex items-center justify-center shrink-0">
                        <span className="text-lg font-bold text-[#D4A74B]">{item.qty}</span>
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-[#1A1A1A]">{item.unit}</p>
                        <p className="text-xs text-[#6B6B6B] leading-tight">{item.item}</p>
                        {item.note && <p className="text-[10px] text-[#9CA3AF] mt-0.5">{item.note}</p>}
                      </div>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-[#9CA3AF] mb-6">
                  * Estimativa com base em consumos médios. Recomendamos adicionar 10-15% para eventuais perdas. Para orçamento preciso, solicite uma visita técnica.
                </p>
                {sent ? (
                  <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-sm text-green-700 font-medium text-center">
                    ✓ Solicitação enviada! Em breve entraremos em contato.
                  </div>
                ) : (
                  <button
                    onClick={requestQuote}
                    disabled={submitting}
                    className="w-full sm:w-auto bg-[#D4A74B] text-[#1A1A1A] font-bold text-sm px-8 py-3 rounded-xl hover:bg-[#c49640] transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {submitting ? "Enviando..." : "Solicitar Orçamento com Esses Materiais"}
                    <ChevronRight className="w-4 h-4" />
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
