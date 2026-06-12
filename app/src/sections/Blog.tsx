import { useStaggerFadeUp } from '../hooks/useScrollAnimation';
import { trpc } from '@/providers/trpc';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router';

function formatDate(date: Date) {
  return new Date(date).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' });
}

export default function Blog() {
  const sectionRef = useStaggerFadeUp<HTMLElement>({ childSelector: '.animate-item', stagger: 0.1, threshold: 0.05 });
  const { data: allPosts, isLoading } = trpc.admin.posts.list.useQuery();

  const posts = allPosts?.filter((p) => p.active).slice(0, 3) ?? [];

  if (!isLoading && posts.length === 0) return null;

  return (
    <section id="dicas" ref={sectionRef} className="section-padding" style={{ backgroundColor: '#F5F3F0' }}>
      <div className="container-main">
        <div className="flex items-end justify-between mb-10 flex-wrap gap-4">
          <div>
            <div className="animate-item mb-3">
              <span className="inline-block text-xs font-medium uppercase tracking-[0.15em] px-4 py-1.5 rounded-full"
                style={{ backgroundColor: 'rgba(212,167,75,0.12)', color: '#D4A74B', border: '1px solid rgba(212,167,75,0.3)' }}>
                Dicas & Conteúdo
              </span>
            </div>
            <h2 className="animate-item font-display font-semibold"
              style={{ fontSize: 'clamp(2rem, 4vw, 3.5rem)', color: '#1A1A1A', lineHeight: 1.2, letterSpacing: '-0.02em' }}>
              Aprenda com os Especialistas
            </h2>
          </div>
          <Link to="/dicas" className="animate-item inline-flex items-center gap-2 text-sm font-medium text-[#D4A74B] hover:gap-3 transition-all">
            Ver todos os artigos <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {isLoading ? (
          <div className="grid md:grid-cols-3 gap-6">
            {[0, 1, 2].map((i) => (
              <div key={i} className="animate-item bg-white rounded-xl overflow-hidden border border-[#E5E2DE] animate-pulse">
                <div className="h-48 bg-[#E5E2DE]" />
                <div className="p-5 space-y-3">
                  <div className="h-4 bg-[#E5E2DE] rounded w-3/4" />
                  <div className="h-3 bg-[#E5E2DE] rounded w-full" />
                  <div className="h-3 bg-[#E5E2DE] rounded w-2/3" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid md:grid-cols-3 gap-6">
            {posts.map((post) => (
              <Link key={post.id} to={`/dicas/${post.slug}`}
                className="animate-item group bg-white rounded-xl overflow-hidden border border-[#E5E2DE] hover:shadow-md transition-all duration-300 flex flex-col">
                {post.image ? (
                  <img src={post.image} alt={post.title} loading="lazy"
                    className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-500" />
                ) : (
                  <div className="w-full h-48 flex items-center justify-center"
                    style={{ backgroundColor: 'rgba(212,167,75,0.1)' }}>
                    <span className="text-4xl">📝</span>
                  </div>
                )}
                <div className="p-5 flex flex-col flex-1">
                  <p className="text-xs text-[#6B6B6B] mb-2">{formatDate(post.publishedAt)}</p>
                  <h3 className="font-semibold text-[#1A1A1A] mb-2 leading-snug group-hover:text-[#D4A74B] transition-colors line-clamp-2">
                    {post.title}
                  </h3>
                  {post.excerpt && <p className="text-sm text-[#6B6B6B] line-clamp-3 flex-1">{post.excerpt}</p>}
                  <span className="inline-flex items-center gap-1 text-xs font-medium mt-4" style={{ color: '#D4A74B' }}>
                    Ler artigo <ArrowRight className="w-3 h-3" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
