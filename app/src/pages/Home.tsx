import Navigation from '../sections/Navigation';
import Hero from '../sections/Hero';
import Parceiros from '../sections/Parceiros';
import AntesDepois from '../sections/AntesDepois';
import Servicos from '../sections/Servicos';
import Portfolio from '../sections/Portfolio';
import VideoSection from '../sections/VideoSection';
import Catalogo from '../sections/Catalogo';
import Depoimentos from '../sections/Depoimentos';
import Estatisticas from '../sections/Estatisticas';
import FAQ from '../sections/FAQ';
import Blog from '../sections/Blog';
import Calculadora from '../sections/Calculadora';
import OrcamentoForm from '../sections/OrcamentoForm';
import TrabalheConosco from '../sections/TrabalheConosco';
import CTAFinal from '../sections/CTAFinal';
import Footer from '../sections/Footer';
import WhatsAppFloat from '../components/WhatsAppFloat';
import { useSeo } from '../hooks/useSeo';

export default function Home() {
  useSeo();
  return (
    <>
      <Navigation />
      <main>
        <Hero />
        <Parceiros />
        <AntesDepois />
        <Servicos />
        <Portfolio />
        <VideoSection />
        <Catalogo />
        <Depoimentos />
        <Estatisticas />
        <Blog />
        <FAQ />
        <Calculadora />
        <OrcamentoForm />
        <TrabalheConosco />
        <CTAFinal />
      </main>
      <Footer />
      <WhatsAppFloat />
    </>
  );
}
