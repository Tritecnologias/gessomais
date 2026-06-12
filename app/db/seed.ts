import { getDb } from "../api/queries/connection";
import { products, services, testimonials, faqs, siteConfig } from "./schema";

async function seed() {
  const db = getDb();

  // Seed products
  await db.insert(products).values([
    {
      name: "Sanca de Gesso com LED",
      description: "Sanca aberta com iluminação LED 3000K inclusa. Linha moderna.",
      image: "/images/catalogo-sanca-led.jpg",
      price: "89.90",
      oldPrice: "120.00",
      unit: "m",
      badge: "MAIS VENDIDO",
      badgeColor: "#22C55E",
      badgeTextColor: "#FFFFFF",
      sortOrder: 1,
      active: true,
    },
    {
      name: "Forro de Gesso 60x60",
      description: "Placa de gesso laminado, acabamento liso branco. Instalação inclusa.",
      image: "/images/catalogo-forro.jpg",
      price: "45.90",
      oldPrice: "58.00",
      unit: "m²",
      badge: "-20%",
      badgeColor: "#D4A74B",
      badgeTextColor: "#1A1A1A",
      sortOrder: 2,
      active: true,
    },
    {
      name: "Placa Drywall Standard",
      description: "Placa 120x180cm, espessura 12,5mm. Resistente à umidade.",
      image: "/images/catalogo-drywall.jpg",
      price: "38.50",
      oldPrice: "48.00",
      unit: "un",
      badge: "PROMO",
      badgeColor: "#D4A74B",
      badgeTextColor: "#1A1A1A",
      sortOrder: 3,
      active: true,
    },
    {
      name: "Moldura Decorativa Gesso",
      description: "Perfil clássico, pronta para pintura. Várias medidas disponíveis.",
      image: "/images/catalogo-moldura.jpg",
      price: "12.90",
      unit: "m",
      sortOrder: 4,
      active: true,
    },
    {
      name: "Spot LED Embutir 7W",
      description: "Luz amarela 3000K, bivolt, acabamento branco. Dimerizável.",
      image: "/images/catalogo-spot.jpg",
      price: "24.90",
      oldPrice: "32.00",
      unit: "un",
      badge: "PARCELADO",
      badgeColor: "rgba(212,167,75,0.2)",
      badgeTextColor: "#D4A74B",
      sortOrder: 5,
      active: true,
    },
    {
      name: "Coluna de Gesso Grega",
      description: "Estilo clássico romano, acabamento liso. Sob medida.",
      image: "/images/catalogo-coluna.jpg",
      price: "156.90",
      unit: "un",
      sortOrder: 6,
      active: true,
    },
  ]);

  // Seed services
  await db.insert(services).values([
    {
      title: "Forro de Gesso",
      description: "Acabamento liso e perfeito para qualquer ambiente. Ideal para esconder fiações, instalações e imperfeições no teto original.",
      image: "/images/servico-forro.jpg",
      icon: "Home",
      sortOrder: 1,
      active: true,
    },
    {
      title: "Drywall",
      description: "Paredes leves, resistentes e com acabamento premium. Perfeito para divisórias, revestimentos e renovações rápidas.",
      image: "/images/servico-drywall.jpg",
      icon: "Layout",
      sortOrder: 2,
      active: true,
    },
    {
      title: "Sancas e Iluminação",
      description: "Design sofisticado com iluminação indireta que transforma o astral de qualquer cômodo. Fitas LED embutidas inclusas.",
      image: "/images/servico-sanca.jpg",
      icon: "Lightbulb",
      sortOrder: 3,
      active: true,
    },
    {
      title: "Divisórias",
      description: "Separação elegante de ambientes com porta de correr embutida. Ideal para escritórios, salas e quartos.",
      image: "/images/servico-divisoria.jpg",
      icon: "Columns",
      sortOrder: 4,
      active: true,
    },
  ]);

  // Seed testimonials
  await db.insert(testimonials).values([
    {
      name: "Maria Helena Santos",
      location: "São Paulo, SP",
      text: "Fiquei impressionada com a rapidez e o capricho. Minha sala ficou exactamente como eu imaginava, com a sanca iluminada criando um ambiente super acolhedor. Recomendo demais!",
      image: "/images/depoimento-1.jpg",
      rating: 5,
      sortOrder: 1,
      active: true,
    },
    {
      name: "Roberto Campos",
      location: "Campinas, SP",
      text: "Contratamos para fazer a divisória do escritório e o resultado superou as expectativas. Acabamento impecável, equipe pontual e preço justo. Já estamos planejando a próxima obra.",
      image: "/images/depoimento-2.jpg",
      rating: 5,
      sortOrder: 2,
      active: true,
    },
    {
      name: "Ana e Pedro Lima",
      location: "Osasco, SP",
      text: "Nosso apartamento ganhou outra cara! O forro de gesso escondeu todas as imperfeições e os spots deram um toque moderno. Valeu cada centavo investido.",
      image: "/images/depoimento-3.jpg",
      rating: 5,
      sortOrder: 3,
      active: true,
    },
  ]);

  // Seed FAQs
  await db.insert(faqs).values([
    {
      question: "Quanto tempo leva a instalação?",
      answer: "O tempo varia conforme o tamanho do ambiente. Em média, uma sala de 20m² leva de 1 a 2 dias para a instalação completa do forro ou drywall. Para projetos maiores, enviamos um cronograma detalhado no orçamento.",
      sortOrder: 1,
      active: true,
    },
    {
      question: "Vocês dão garantia?",
      answer: "Sim! Todos os nossos serviços têm garantia de 5 anos contra defeitos de instalação. Produtos têm garantia do fabricante de até 2 anos. Qualquer problema, atendemos em até 48h.",
      sortOrder: 2,
      active: true,
    },
    {
      question: "Como funciona o orçamento?",
      answer: "É simples e grátis! Você nos envia fotos e medidas do ambiente pelo WhatsApp, ou agendamos uma visita técnica. Em até 24h enviamos o orçamento detalhado com materiais, mão de obra e prazo.",
      sortOrder: 3,
      active: true,
    },
    {
      question: "Atendem em qual região?",
      answer: "Atendemos toda a Grande São Paulo, ABC Paulista e cidades próximas em um raio de até 80km. Para cidades mais distantes, consulte-nos — frequentemente conseguimos atender com uma pequena taxa de deslocamento.",
      sortOrder: 4,
      active: true,
    },
    {
      question: "Posso parcelar o pagamento?",
      answer: "Sim! Aceitamos pagamento em até 12x no cartão de crédito, ou em 3x sem juros no PIX. Para obras acima de R$ 5.000, oferecemos condições especiais de parcelamento.",
      sortOrder: 5,
      active: true,
    },
    {
      question: "Preciso comprar material separado?",
      answer: "Não precisa se não quiser. Trabalhamos com duas modalidades: (1) serviço completo com material incluso, ou (2) apenas mão de obra se você já tiver o material. No orçamento detalhamos cada opção.",
      sortOrder: 6,
      active: true,
    },
  ]);

  // Seed site config
  await db.insert(siteConfig).values([
    { key: "heroTitle", value: "Transforme Seu Ambiente com Gesso e Drywall" },
    { key: "heroDescription", value: "Sancas iluminadas, forros perfeitos, divisórias elegantes e acabamentos que valorizam seu imóvel. Atendimento em toda região com garantia de 5 anos." },
    { key: "statProjects", value: "1200" },
    { key: "statYears", value: "15" },
    { key: "statSatisfaction", value: "98" },
    { key: "statDelivery", value: "72" },
    { key: "whatsappNumber", value: "5511999999999" },
    { key: "whatsappMessage", value: "Olá! Vim pelo site e gostaria de um orçamento." },
  ]);

  console.log("Seed completed successfully!");
}

seed().catch(console.error);
