import { useState, useEffect } from "react";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { trpc } from "@/providers/trpc";
import { toast } from "sonner";
import { Calculator, Save, RotateCcw } from "lucide-react";

interface ConfigField {
  key: string;
  label: string;
  unit: string;
  defaultValue: string;
  hint?: string;
  min?: number;
  step?: number;
}

const SERVICES: { id: string; label: string; icon: string; fields: ConfigField[] }[] = [
  {
    id: "gesso_paredes",
    label: "Gesso Liso em Paredes",
    icon: "🏠",
    fields: [
      { key: "calc_gp_gesso_kg_m2", label: "Consumo de gesso", unit: "kg/m²", defaultValue: "1.5", hint: "Quanto kg de gesso por m² de parede", min: 0.1, step: 0.1 },
      { key: "calc_gp_saco_kg", label: "Peso do saco de gesso", unit: "kg/saco", defaultValue: "20", hint: "Peso padrão do saco (ex: 20kg)", min: 1 },
      { key: "calc_gp_agua_litros_m2", label: "Consumo de água", unit: "litros/m²", defaultValue: "0.7", min: 0.1, step: 0.1 },
      { key: "calc_gp_lixa_m2", label: "Área por folha de lixa", unit: "m²/folha", defaultValue: "10", min: 1 },
    ],
  },
  {
    id: "gesso_teto",
    label: "Forro / Teto de Gesso",
    icon: "⬜",
    fields: [
      { key: "calc_gt_gesso_kg_m2", label: "Consumo de gesso", unit: "kg/m²", defaultValue: "1.2", min: 0.1, step: 0.1 },
      { key: "calc_gt_saco_kg", label: "Peso do saco de gesso", unit: "kg/saco", defaultValue: "20", min: 1 },
      { key: "calc_gt_tela_m2_rolo", label: "Área de tela por rolo", unit: "m²/rolo", defaultValue: "50", min: 1 },
      { key: "calc_gt_agua_litros_m2", label: "Consumo de água", unit: "litros/m²", defaultValue: "0.6", min: 0.1, step: 0.1 },
      { key: "calc_gt_lixa_m2", label: "Área por folha de lixa", unit: "m²/folha", defaultValue: "12", min: 1 },
    ],
  },
  {
    id: "drywall",
    label: "Drywall (Parede Seca)",
    icon: "📦",
    fields: [
      { key: "calc_dw_placa_m2", label: "Área de cada placa", unit: "m²/placa", defaultValue: "2.88", hint: "Placa padrão 1,20×2,40m = 2,88m²", min: 0.1, step: 0.01 },
      { key: "calc_dw_perda_pct", label: "Percentual de perdas", unit: "%", defaultValue: "10", min: 0, step: 1 },
      { key: "calc_dw_montante_esp_cm", label: "Espaçamento entre montantes", unit: "cm", defaultValue: "60", hint: "Distância entre perfis montante", min: 30, step: 5 },
      { key: "calc_dw_parafusos_por_placa", label: "Parafusos por placa", unit: "un/placa", defaultValue: "25", min: 1 },
      { key: "calc_dw_parafusos_cx", label: "Parafusos por caixa", unit: "un/cx", defaultValue: "500", min: 1 },
      { key: "calc_dw_fita_m_rolo", label: "Fita por rolo", unit: "m/rolo", defaultValue: "50", min: 1 },
      { key: "calc_dw_massa_kg_balde", label: "Massa por balde", unit: "kg/balde", defaultValue: "25", min: 1 },
    ],
  },
  {
    id: "reboco",
    label: "Reboco / Emboço",
    icon: "🧱",
    fields: [
      { key: "calc_rb_argamassa_kg_m2", label: "Consumo de argamassa", unit: "kg/m²", defaultValue: "12", min: 1 },
      { key: "calc_rb_saco_kg", label: "Peso do saco de argamassa", unit: "kg/saco", defaultValue: "20", min: 1 },
      { key: "calc_rb_areia_kg_m2", label: "Consumo de areia", unit: "kg/m²", defaultValue: "1.5", min: 0.1, step: 0.1 },
      { key: "calc_rb_tela_perda_pct", label: "Sobreposição de tela", unit: "%", defaultValue: "5", min: 0, step: 1 },
      { key: "calc_rb_agua_litros_m2", label: "Consumo de água", unit: "litros/m²", defaultValue: "2.5", min: 0.1, step: 0.1 },
    ],
  },
];

export default function CalculadoraConfigPage() {
  useAdminAuth();
  const { data: configData = [], refetch } = trpc.admin.config.list.useQuery();
  const setConfig = trpc.admin.config.set.useMutation({
    onError: (e) => toast.error(e.message),
  });

  const [values, setValues] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [activeService, setActiveService] = useState(SERVICES[0].id);

  useEffect(() => {
    const map: Record<string, string> = {};
    configData.forEach((c) => { map[c.key] = c.value; });
    setValues(map);
  }, [configData]);

  function get(key: string, fallback: string) {
    return values[key] ?? fallback;
  }

  function set(key: string, val: string) {
    setValues((prev) => ({ ...prev, [key]: val }));
  }

  async function saveService(serviceId: string) {
    const svc = SERVICES.find((s) => s.id === serviceId);
    if (!svc) return;
    setSaving(true);
    try {
      await Promise.all(
        svc.fields.map((f) =>
          setConfig.mutateAsync({ key: f.key, value: get(f.key, f.defaultValue) || f.defaultValue })
        )
      );
      toast.success(`Configurações de "${svc.label}" salvas!`);
      refetch();
    } catch {
      // errors handled per mutation
    } finally {
      setSaving(false);
    }
  }

  function resetService(serviceId: string) {
    const svc = SERVICES.find((s) => s.id === serviceId);
    if (!svc) return;
    const updates: Record<string, string> = {};
    svc.fields.forEach((f) => { updates[f.key] = f.defaultValue; });
    setValues((prev) => ({ ...prev, ...updates }));
    toast.info("Valores restaurados para o padrão. Clique em Salvar para confirmar.");
  }

  const currentService = SERVICES.find((s) => s.id === activeService)!;

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <Calculator className="w-6 h-6 text-[#D4A74B]" />
        <h2 className="text-2xl font-display font-bold text-[#1A1A1A]">Calculadora — Coeficientes</h2>
      </div>
      <p className="text-sm text-[#6B6B6B] mb-6 max-w-2xl">
        Configure os coeficientes de consumo de material por serviço. Esses valores são usados pela calculadora na página inicial para gerar as estimativas.
      </p>

      {/* Service tabs */}
      <div className="flex gap-2 flex-wrap mb-6">
        {SERVICES.map((s) => (
          <button
            key={s.id}
            onClick={() => setActiveService(s.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all border ${
              activeService === s.id
                ? "bg-[#1A1A1A] text-white border-[#1A1A1A]"
                : "bg-white text-[#6B6B6B] border-[#E5E2DE] hover:border-[#1A1A1A]"
            }`}
          >
            <span>{s.icon}</span> {s.label}
          </button>
        ))}
      </div>

      {/* Fields for active service */}
      <div className="bg-white rounded-2xl border border-[#E5E2DE] p-6">
        <div className="flex items-center gap-3 mb-6">
          <span className="text-2xl">{currentService.icon}</span>
          <div>
            <h3 className="text-base font-semibold text-[#1A1A1A]">{currentService.label}</h3>
            <p className="text-xs text-[#9CA3AF]">Altere os valores e clique em Salvar</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-6">
          {currentService.fields.map((field) => (
            <div key={field.key}>
              <label className="block text-sm font-medium text-[#1A1A1A] mb-1">
                {field.label}
                <span className="ml-1.5 text-xs text-[#9CA3AF] font-normal">({field.unit})</span>
              </label>
              {field.hint && (
                <p className="text-xs text-[#9CA3AF] mb-1.5">{field.hint}</p>
              )}
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min={field.min ?? 0}
                  step={field.step ?? 1}
                  value={get(field.key, field.defaultValue)}
                  onChange={(e) => set(field.key, e.target.value)}
                  className="w-full border border-[#E5E2DE] rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#D4A74B]"
                />
                <span className="text-xs text-[#9CA3AF] shrink-0 w-16">{field.unit}</span>
              </div>
              <p className="text-[10px] text-[#C4B99A] mt-1">padrão: {field.defaultValue}</p>
            </div>
          ))}
        </div>

        <div className="flex items-center gap-3 pt-4 border-t border-[#E5E2DE]">
          <button
            onClick={() => saveService(activeService)}
            disabled={saving}
            className="flex items-center gap-2 bg-[#D4A74B] text-[#1A1A1A] font-semibold text-sm px-6 py-2.5 rounded-lg hover:bg-[#c49640] transition-colors disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {saving ? "Salvando..." : "Salvar Configurações"}
          </button>
          <button
            onClick={() => resetService(activeService)}
            className="flex items-center gap-2 border border-[#E5E2DE] text-[#6B6B6B] font-medium text-sm px-4 py-2.5 rounded-lg hover:bg-[#F5F3F0] transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
            Restaurar Padrões
          </button>
        </div>
      </div>

      {/* Preview hint */}
      <div className="mt-4 bg-[#F5F3F0] rounded-xl p-4 text-xs text-[#6B6B6B]">
        <strong className="text-[#1A1A1A]">Como funciona:</strong> Os coeficientes são multiplicados pela área informada pelo visitante.
        Ex: Gesso em Paredes com 1,5 kg/m² e saco de 20kg → 24m² = <strong>2 sacos</strong> (24 × 1,5 / 20 = 1,8 → arredonda para cima = 2).
      </div>
    </div>
  );
}
