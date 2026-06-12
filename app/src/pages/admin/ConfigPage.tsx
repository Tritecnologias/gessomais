import { useState } from "react";
import { toast } from "sonner";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { trpc } from "@/providers/trpc";
import { Save, Check } from "lucide-react";

type FieldType = "text" | "textarea" | "number" | "url";

interface ConfigField {
  key: string;
  label: string;
  type: FieldType;
  placeholder: string;
}

interface ConfigGroup {
  title: string;
  fields: ConfigField[];
}

const configGroups: ConfigGroup[] = [
  {
    title: "Seção Hero",
    fields: [
      { key: "heroTitle", label: "Título", type: "text", placeholder: "Transforme Seu Ambiente..." },
      { key: "heroDescription", label: "Descrição", type: "textarea", placeholder: "Sancas iluminadas..." },
    ],
  },
  {
    title: "Estatísticas",
    fields: [
      { key: "statProjects", label: "Projetos Entregues", type: "number", placeholder: "1200" },
      { key: "statYears", label: "Anos de Experiência", type: "number", placeholder: "15" },
      { key: "statSatisfaction", label: "Taxa de Satisfação (%)", type: "number", placeholder: "98" },
      { key: "statDelivery", label: "Tempo Médio de Entrega (h)", type: "number", placeholder: "72" },
    ],
  },
  {
    title: "Seção de Vídeo",
    fields: [
      { key: "videoTitle", label: "Título", type: "text", placeholder: "Veja Nosso Trabalho em Ação" },
      { key: "videoDescription", label: "Descrição", type: "text", placeholder: "Processo profissional, acabamento impecável..." },
      { key: "videoSrc", label: "URL do Vídeo (.mp4)", type: "url", placeholder: "https://..." },
      { key: "videoPoster", label: "URL da Capa do Vídeo (imagem)", type: "url", placeholder: "https://..." },
    ],
  },
  {
    title: "WhatsApp",
    fields: [
      { key: "whatsappNumber", label: "Número (DDI+DDD+número)", type: "text", placeholder: "5511999999999" },
      { key: "whatsappMessage", label: "Mensagem Padrão", type: "textarea", placeholder: "Olá! Vim pelo site..." },
    ],
  },
  {
    title: "Rodapé",
    fields: [
      { key: "footerCompanyName", label: "Nome da Empresa", type: "text", placeholder: "Gesso Premium" },
      { key: "footerTagline", label: "Slogan", type: "text", placeholder: "Transformando ambientes desde 2010" },
      { key: "footerPhone", label: "Telefone", type: "text", placeholder: "(11) 99999-9999" },
      { key: "footerEmail", label: "E-mail", type: "text", placeholder: "contato@gessopremium.com.br" },
      { key: "footerHours", label: "Horário de Atendimento", type: "text", placeholder: "Seg - Sáb: 8h às 18h" },
      { key: "footerInstagram", label: "Link Instagram", type: "url", placeholder: "https://instagram.com/..." },
      { key: "footerFacebook", label: "Link Facebook", type: "url", placeholder: "https://facebook.com/..." },
      { key: "footerYoutube", label: "Link YouTube", type: "url", placeholder: "https://youtube.com/..." },
      { key: "footerCopyright", label: "Texto de Copyright", type: "text", placeholder: "© 2025 Gesso Premium. Todos os direitos reservados." },
    ],
  },
  {
    title: "CTA Final",
    fields: [
      { key: "ctaBadge", label: "Badge (texto do selo)", type: "text", placeholder: "🔥 VAGAS LIMITADAS PARA ESTE MÊS" },
      { key: "ctaTitle", label: "Título", type: "text", placeholder: "Pronto para Transformar Seu Ambiente?" },
      { key: "ctaDescription", label: "Descrição", type: "textarea", placeholder: "Orçamento grátis em 24h..." },
      { key: "ctaSecondaryText", label: "Texto Secundário", type: "text", placeholder: "Resposta em até 2h | Orçamento sem compromisso" },
    ],
  },
  {
    title: "Antes e Depois — Card 1",
    fields: [
      { key: "antesDepoisCard1Image", label: "URL da Imagem", type: "url", placeholder: "/images/antes-depois-1.jpg" },
      { key: "antesDepoisCard1Badge", label: "Badge", type: "text", placeholder: "ECONOMIA DE 40%" },
      { key: "antesDepoisCard1Title", label: "Título", type: "text", placeholder: "Sala de Estar Iluminada" },
      { key: "antesDepoisCard1Description", label: "Descrição", type: "text", placeholder: "Sanca de gesso com LED + forro rebaixado com spots" },
    ],
  },
  {
    title: "Antes e Depois — Card 2",
    fields: [
      { key: "antesDepoisCard2Image", label: "URL da Imagem", type: "url", placeholder: "/images/antes-depois-2.jpg" },
      { key: "antesDepoisCard2Badge", label: "Badge", type: "text", placeholder: "5 ANOS DE GARANTIA" },
      { key: "antesDepoisCard2Title", label: "Título", type: "text", placeholder: "Quarto Renovado" },
      { key: "antesDepoisCard2Description", label: "Descrição", type: "text", placeholder: "Forro de gesso novo + iluminação embutida" },
    ],
  },
  {
    title: "SEO",
    fields: [
      { key: "seoTitle", label: "Título da Página", type: "text", placeholder: "Gesso Premium | Sancas, Forros e Drywall" },
      { key: "seoDescription", label: "Descrição (meta description)", type: "textarea", placeholder: "Especialistas em gesso decorativo..." },
    ],
  },
];

export default function ConfigPage() {
  useAdminAuth();
  const utils = trpc.useUtils();
  const { data: configs, isLoading } = trpc.admin.config.list.useQuery();
  const [saved, setSaved] = useState<string | null>(null);

  const setMutation = trpc.admin.config.set.useMutation({
    onSuccess: (_, vars) => {
      utils.admin.config.list.invalidate();
      setSaved(vars.key);
      setTimeout(() => setSaved(null), 2000);
    },
    onError: (err) => toast.error(err.message),
  });

  const getValue = (key: string) =>
    configs?.find((c) => c.key === key)?.value || "";

  const handleSave = (key: string, value: string) => {
    setMutation.mutate({ key, value });
  };

  if (isLoading) {
    return <div className="text-center py-8 text-[#6B6B6B]">Carregando...</div>;
  }

  return (
    <div>
      <h2 className="text-xl font-semibold text-[#1A1A1A] mb-6">
        Configurações do Site
      </h2>

      <div className="space-y-8">
        {configGroups.map((group) => (
          <div key={group.title}>
            <h3 className="text-sm font-bold text-[#6B6B6B] uppercase tracking-wider mb-3 px-1">
              {group.title}
            </h3>
            <div className="space-y-3">
              {group.fields.map((cfg) => {
                const value = getValue(cfg.key);
                const isSaved = saved === cfg.key;
                return (
                  <div
                    key={cfg.key}
                    className="bg-white rounded-xl border border-[#E5E2DE] p-5"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <label className="text-sm font-semibold text-[#1A1A1A]">
                        {cfg.label}
                      </label>
                      <span className="text-xs text-[#6B6B6B] font-mono bg-[#F5F3F0] px-2 py-1 rounded">
                        {cfg.key}
                      </span>
                    </div>

                    {cfg.type === "textarea" ? (
                      <textarea
                        defaultValue={value}
                        placeholder={cfg.placeholder}
                        rows={3}
                        id={`input-${cfg.key}`}
                        className="w-full px-3 py-2 text-sm rounded-lg border border-[#E5E2DE] focus:outline-none focus:ring-2 focus:ring-[#D4A74B]/50 mb-3"
                      />
                    ) : (
                      <input
                        type={cfg.type === "number" ? "number" : "text"}
                        defaultValue={value}
                        placeholder={cfg.placeholder}
                        id={`input-${cfg.key}`}
                        className="w-full px-3 py-2 text-sm rounded-lg border border-[#E5E2DE] focus:outline-none focus:ring-2 focus:ring-[#D4A74B]/50 mb-3"
                      />
                    )}

                    <div className="flex items-center justify-between">
                      <p className="text-xs text-[#6B6B6B] truncate max-w-[60%]">
                        Atual: {value || "(vazio)"}
                      </p>
                      <button
                        onClick={() => {
                          const el = document.getElementById(`input-${cfg.key}`) as HTMLInputElement | HTMLTextAreaElement;
                          handleSave(cfg.key, el.value);
                        }}
                        disabled={setMutation.isPending}
                        className="inline-flex items-center gap-2 text-xs font-semibold px-4 py-2 rounded-lg transition-all duration-200 shrink-0"
                        style={{
                          backgroundColor: isSaved ? "#22C55E" : "#D4A74B",
                          color: isSaved ? "#fff" : "#1A1A1A",
                        }}
                      >
                        {isSaved ? (
                          <>
                            <Check className="w-3.5 h-3.5" />
                            Salvo!
                          </>
                        ) : (
                          <>
                            <Save className="w-3.5 h-3.5" />
                            Salvar
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
