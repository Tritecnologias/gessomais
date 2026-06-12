import { trpc } from "@/providers/trpc";

const serviceLinks = [
  'Forro de Gesso',
  'Drywall',
  'Sancas',
  'Divisórias',
];

export default function Footer() {
  const { data: configs } = trpc.admin.config.list.useQuery();

  const get = (key: string, fallback: string) =>
    configs?.find((c) => c.key === key)?.value || fallback;

  const companyName = get("footerCompanyName", "Gesso Premium");
  const tagline = get("footerTagline", "Transformando ambientes desde 2010");
  const phone = get("footerPhone", "(11) 99999-9999");
  const email = get("footerEmail", "contato@gessopremium.com.br");
  const hours = get("footerHours", "Seg - Sáb: 8h às 18h");
  const instagram = get("footerInstagram", "#");
  const facebook = get("footerFacebook", "#");
  const youtube = get("footerYoutube", "#");
  const copyright = get("footerCopyright", `© ${new Date().getFullYear()} ${companyName}. Todos os direitos reservados.`);

  const whatsappNumber = get("whatsappNumber", "5511999999999");
  const whatsappMessage = get("whatsappMessage", "Olá! Vim pelo site.");
  const whatsappLink = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(whatsappMessage)}`;

  const socialLinks = [
    { name: 'Instagram', href: instagram },
    { name: 'Facebook', href: facebook },
    { name: 'YouTube', href: youtube },
  ];

  return (
    <footer style={{ backgroundColor: '#1A1A1A' }}>
      <div className="container-main pt-16 pb-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
          {/* Column 1 - Logo */}
          <div>
            <h3 className="font-display text-xl font-bold text-white mb-3">
              {companyName.toUpperCase()}
            </h3>
            <p className="text-sm" style={{ color: '#6B6B6B' }}>
              {tagline}
            </p>
          </div>

          {/* Column 2 - Services */}
          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
              Serviços
            </h4>
            <ul className="flex flex-col gap-2">
              {serviceLinks.map((link) => (
                <li key={link}>
                  <a
                    href="#servicos"
                    onClick={(e) => {
                      e.preventDefault();
                      const el = document.querySelector('#servicos');
                      if (el) el.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className="text-sm transition-colors duration-300 hover:text-[#D4A74B]"
                    style={{ color: '#6B6B6B' }}
                  >
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3 - Contact */}
          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
              Atendimento
            </h4>
            <ul className="flex flex-col gap-2">
              <li>
                <a
                  href={whatsappLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm transition-colors duration-300 hover:text-[#D4A74B]"
                  style={{ color: '#6B6B6B' }}
                >
                  WhatsApp
                </a>
              </li>
              <li>
                <span className="text-sm" style={{ color: '#6B6B6B' }}>
                  {phone}
                </span>
              </li>
              <li>
                <span className="text-sm" style={{ color: '#6B6B6B' }}>
                  {email}
                </span>
              </li>
              <li>
                <span className="text-sm" style={{ color: '#6B6B6B' }}>
                  {hours}
                </span>
              </li>
            </ul>
          </div>

          {/* Column 4 - Social */}
          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
              Redes Sociais
            </h4>
            <ul className="flex flex-col gap-2">
              {socialLinks.map((link) => (
                <li key={link.name}>
                  <a
                    href={link.href === '#' ? '#' : link.href}
                    target={link.href !== '#' ? "_blank" : undefined}
                    rel="noopener noreferrer"
                    onClick={link.href === '#' ? (e) => e.preventDefault() : undefined}
                    className="text-sm transition-colors duration-300 hover:text-[#D4A74B]"
                    style={{ color: '#6B6B6B' }}
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Divider */}
        <div
          className="pt-8"
          style={{ borderTop: '1px solid rgba(255,255,255,0.1)' }}
        >
          <p className="text-center text-xs" style={{ color: '#6B6B6B' }}>
            {copyright}
          </p>
        </div>
      </div>
    </footer>
  );
}
