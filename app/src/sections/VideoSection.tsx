import { useRef, useState } from 'react';
import { Play } from 'lucide-react';
import { useParallax, useStaggerFadeUp } from '../hooks/useScrollAnimation';
import { trpc } from "@/providers/trpc";

export default function VideoSection() {
  const videoRef = useParallax<HTMLDivElement>({ yPercent: 15 });
  const sectionRef = useStaggerFadeUp<HTMLElement>({
    childSelector: '.animate-item',
    stagger: 0.1,
    threshold: 0.1,
  });

  const innerVideoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const { data: configs } = trpc.admin.config.list.useQuery();
  const get = (key: string, fallback: string) =>
    configs?.find((c) => c.key === key)?.value || fallback;

  const title = get("videoTitle", "Veja Nosso Trabalho em Ação");
  const description = get("videoDescription", "Processo profissional, acabamento impecável, cliente satisfeito");
  const videoSrc = get("videoSrc", "/images/hero-video.jpg");
  const videoPoster = get("videoPoster", "/images/hero-video.jpg");

  const handlePlay = () => {
    if (innerVideoRef.current) {
      innerVideoRef.current.play();
      setIsPlaying(true);
    }
  };

  return (
    <section ref={sectionRef} className="section-padding" style={{ backgroundColor: '#1A1A1A' }}>
      <div className="container-main">
        {/* Header */}
        <div className="text-center mb-12">
          <h2
            className="animate-item font-display font-semibold mb-4"
            style={{
              fontSize: 'clamp(2rem, 4vw, 3.5rem)',
              color: '#FFFFFF',
              lineHeight: 1.2,
              letterSpacing: '-0.02em',
            }}
          >
            {title}
          </h2>
          <p
            className="animate-item text-lg"
            style={{ color: 'rgba(255,255,255,0.7)' }}
          >
            {description}
          </p>
        </div>

        {/* Video Container */}
        <div className="animate-item max-w-[1000px] mx-auto">
          <div
            className="relative rounded-xl overflow-hidden"
            style={{ boxShadow: '0 20px 60px rgba(0,0,0,0.4)' }}
          >
            <div ref={videoRef} className="w-full">
              <div className="relative aspect-video">
                <video
                  ref={innerVideoRef}
                  className="w-full h-full object-cover"
                  loop
                  muted
                  playsInline
                  poster={videoPoster}
                >
                  <source src={videoSrc} type="video/mp4" />
                </video>
                <img
                  src={videoPoster}
                  alt="Processo de instalação de gesso"
                  className="absolute inset-0 w-full h-full object-cover"
                />

                {!isPlaying && (
                  <button
                    onClick={handlePlay}
                    className="absolute inset-0 flex items-center justify-center z-10 cursor-pointer group"
                  >
                    <div
                      className="w-20 h-20 rounded-full bg-white flex items-center justify-center transition-transform duration-300 group-hover:scale-110"
                      style={{ boxShadow: '0 4px 20px rgba(0,0,0,0.2)' }}
                    >
                      <Play className="w-8 h-8 text-[#1A1A1A] ml-1" fill="#1A1A1A" />
                    </div>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
