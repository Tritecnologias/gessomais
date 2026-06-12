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

  const companyName = get('footerCompanyName', 'Gesso Premium').toUpperCase();
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
    document.querySelector(href)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <nav
      className="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
      style={{
        background: scrolled ? 'rgba(255,255,255,0.95)' : 'rgba(0,0,0,0.82)',
        backdropFilter: scrolled ? 'blur(12px)' : 'none',
        boxShadow: scrolled ? '0 2px 16px rgba(0,0,0,0.08)' : 'none',
      }}
    >
      <div className="container-main flex items-center justify-between h-[72px]">
        {/* Logo */}
        <a
          href="#"
          onClick={(e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
          className="font-display text-2xl font-bold transition-colors duration-300"
          style={{ color: scrolled ? '#1A1A1A' : '#FFFFFF' }}
        >
          {companyName}
        </a>

        {/* Desktop Links */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => {
            const cls = "text-xs font-medium uppercase tracking-[0.1em] transition-colors duration-300 hover:text-[#D4A74B] relative group";
            const style = { color: scrolled ? '#1A1A1A' : '#FFFFFF' };
            const underline = <span className="absolute bottom-0 left-0 w-0 h-[1px] bg-[#D4A74B] transition-all duration-300 group-hover:w-full" />;
            return link.external ? (
              <Link key={link.href} to={link.href} className={cls} style={style}>
                {link.label}{underline}
              </Link>
            ) : (
              <a key={link.href} href={link.href} onClick={(e) => handleNavClick(e, link.href)} className={cls} style={style}>
                {link.label}{underline}
              </a>
            );
          })}
        </div>

        {/* CTA Button */}
        <div className="hidden md:block">
          <a href={whatsappLink} target="_blank" rel="noopener noreferrer" className="btn-primary text-xs py-3 px-5">
            Orçamento Grátis
            <MessageCircle className="ml-2 w-4 h-4" />
          </a>
        </div>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden p-2"
          onClick={() => setMobileOpen(!mobileOpen)}
          style={{ color: scrolled ? '#1A1A1A' : '#FFFFFF' }}
        >
          {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="md:hidden bg-white/95 backdrop-blur-lg border-t border-[#E5E2DE]">
          <div className="container-main py-6 flex flex-col gap-4">
            {navLinks.map((link) =>
              link.external ? (
                <Link key={link.href} to={link.href} onClick={() => setMobileOpen(false)}
                  className="text-sm font-medium uppercase tracking-[0.1em] text-[#1A1A1A] hover:text-[#D4A74B] transition-colors">
                  {link.label}
                </Link>
              ) : (
                <a key={link.href} href={link.href} onClick={(e) => handleNavClick(e, link.href)}
                  className="text-sm font-medium uppercase tracking-[0.1em] text-[#1A1A1A] hover:text-[#D4A74B] transition-colors">
                  {link.label}
                </a>
              )
            )}
            <a href={whatsappLink} target="_blank" rel="noopener noreferrer" className="btn-primary text-xs py-3 px-5 mt-2 w-full">
              Orçamento Grátis
              <MessageCircle className="ml-2 w-4 h-4" />
            </a>
          </div>
        </div>
      )}
    </nav>
  );
}
