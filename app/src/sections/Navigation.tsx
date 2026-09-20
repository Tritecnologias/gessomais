import { useState, useEffect } from 'react';
import { Link } from 'react-router';
import { MessageCircle, Menu, X } from 'lucide-react';
import { trpc } from '@/providers/trpc';

const navLinks = [
  { label: 'Serviços', href: '#servicos' },
  { label: 'Portfólio', href: '#portfolio' },
  { label: 'Catálogo', href: '#catalogo' },
  { label: 'Dicas', href: '/dicas', external: true },
  { label: 'Orçamento', href: '#orcamento' },
  { label: 'Trabalhe Conosco', href: '#trabalhe-conosco' },
];

export default function Navigation() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const { data: configs } = trpc.admin.config.list.useQuery();
  const get = (key: string, fallback: string) =>
    configs?.find((c) => c.key === key)?.value || fallback;

  const companyName = get('footerCompanyName', 'VSN Soluções em Gesso').toUpperCase();
  const configHeaderLogo = configs?.find((c) => c.key === 'headerLogo');
  const headerLogo = configHeaderLogo?.value ? configHeaderLogo.value : '/images/vsn2-crop.webp';
  const logoHeight = parseInt(get('headerLogoHeight', '46'), 10) || 46;
  const whatsappNumber = get('whatsappNumber', '5511999999999');
  const whatsappMessage = get('whatsappMessage', 'Olá! Vim pelo site e gostaria de um orçamento.');
  const whatsappLink = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(whatsappMessage)}`;

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > window.innerHeight * 0.8);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    setMobileOpen(false);
    if (window.location.pathname !== '/') {
      window.location.href = '/' + href;
      return;
    }
    document.querySelector(href)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <nav
      className="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
      style={{
        background: 'rgba(255, 255, 255, 0.97)',
        backdropFilter: 'blur(12px)',
        borderBottom: scrolled ? '1px solid rgba(229, 231, 235, 0.9)' : '1px solid rgba(229, 231, 235, 0.5)',
        boxShadow: scrolled ? '0 4px 20px -2px rgba(0, 0, 0, 0.07)' : '0 1px 3px rgba(0, 0, 0, 0.03)',
      }}
    >
      <div className="container-main flex items-center justify-between h-[72px]">
        {/* Logo */}
        <a
          href="#"
          onClick={(e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
          className="flex items-center gap-3 transition-opacity duration-200 hover:opacity-85 py-1"
          aria-label={companyName}
        >
          {headerLogo ? (
            <img
              src={headerLogo}
              alt={companyName}
              width={Math.round(logoHeight * 1.51)}
              height={logoHeight}
              fetchPriority="high"
              decoding="async"
              className="w-auto object-contain transition-all"
              style={{ height: `${logoHeight}px`, maxHeight: '54px', aspectRatio: '408 / 270' }}
            />
          ) : (
            <span className="font-display text-2xl font-bold text-[#012D76]">
              {companyName}
            </span>
          )}
        </a>

        {/* Desktop Links */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => {
            const cls = "text-xs font-semibold uppercase tracking-[0.08em] transition-colors duration-200 text-[#1E293B] hover:text-[#012D76] relative py-1 group";
            const underline = <span className="absolute -bottom-1 left-0 w-0 h-[2px] bg-[#012D76] transition-all duration-300 group-hover:w-full rounded-full" />;
            return link.external ? (
              <Link key={link.href} to={link.href} className={cls}>
                {link.label}{underline}
              </Link>
            ) : (
              <a key={link.href} href={link.href} onClick={(e) => handleNavClick(e, link.href)} className={cls}>
                {link.label}{underline}
              </a>
            );
          })}
        </div>

        {/* CTA Button */}
        <div className="hidden md:block">
          <a
            href={whatsappLink}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 text-xs font-semibold tracking-wide uppercase px-5 py-3 rounded-lg bg-[#012D76] text-white hover:bg-[#023892] shadow-sm hover:shadow-md transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
          >
            <span>Orçamento Grátis</span>
            <MessageCircle className="w-4 h-4 text-[#25D366]" />
          </a>
        </div>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden p-2 text-[#1E293B] hover:text-[#012D76] transition-colors"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Menu"
        >
          {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="md:hidden bg-white/98 backdrop-blur-xl border-t border-slate-200 shadow-xl">
          <div className="container-main py-6 flex flex-col gap-3">
            {navLinks.map((link) =>
              link.external ? (
                <Link
                  key={link.href}
                  to={link.href}
                  onClick={() => setMobileOpen(false)}
                  className="text-sm font-semibold uppercase tracking-[0.08em] text-[#1E293B] hover:text-[#012D76] hover:bg-slate-50 px-3 py-2 rounded-lg transition-colors"
                >
                  {link.label}
                </Link>
              ) : (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={(e) => handleNavClick(e, link.href)}
                  className="text-sm font-semibold uppercase tracking-[0.08em] text-[#1E293B] hover:text-[#012D76] hover:bg-slate-50 px-3 py-2 rounded-lg transition-colors"
                >
                  {link.label}
                </a>
              )
            )}
            <a
              href={whatsappLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 text-xs font-semibold tracking-wide uppercase px-5 py-3 rounded-lg bg-[#012D76] text-white hover:bg-[#023892] shadow-sm transition-all mt-2 w-full"
            >
              <span>Orçamento Grátis</span>
              <MessageCircle className="w-4 h-4 text-[#25D366]" />
            </a>
          </div>
        </div>
      )}
    </nav>
  );
}
