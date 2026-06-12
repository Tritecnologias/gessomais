import { Link } from 'react-router';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { trpc } from '@/providers/trpc';
import Navigation from '../sections/Navigation';
import Footer from '../sections/Footer';

function formatDate(date: Date) {
  return new Date(date).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });
}

export default function BlogListPage() {
  const { data: allPosts, isLoading } = trpc.admin.posts.list.useQuery();
  const posts = allPosts?.filter((p) => p.active) ?? [];

  return (
    <>
      <Navigation />
      <main className="pt-[72px]">
        <div className="section-padding">
          <div className="container-main max-w-[900px]">
            <Link to="/" className="inline-flex items-center gap-2 text-sm text-[#6B6B6B] hover:text-[#1A1A1A] mb-8 transition-colors">
              <ArrowLeft className="w-4 h-4" /> Voltar ao início
            </Link>
            <h1 className="font-display font-semibold mb-2"
              style={{ fontSize: 'clamp(2rem, 4vw, 3.5rem)', color: '#1A1A1A', lineHeight: 1.2, letterSpacing: '-0.02em' }}>
              Dicas & Conteúdo
            </h1>
            <p className="text-lg text-[#6B6B6B] mb-10">Aprenda com quem entende de gesso, drywall e acabamentos.</p>

            {isLoading ? (
              <div className="space-y-4">
                {[0, 1, 2].map((i) => <div key={i} className="h-32 bg-[#E5E2DE] rounded-xl animate-pulse" />)}
              </div>
            ) : posts.length === 0 ? (
              <p className="text-[#6B6B6B]">Nenhum artigo publicado ainda.</p>
            ) : (
              <div className="space-y-6">
                {posts.map((post) => (
                  <Link key={post.id} to={`/dicas/${post.slug}`}
                    className="group flex gap-5 bg-white rounded-xl border border-[#E5E2DE] overflow-hidden hover:shadow-md transition-all">
                    {post.image && (
                      <img src={post.image} alt={post.title} loading="lazy"
                        className="w-36 h-28 object-cover shrink-0 group-hover:scale-105 transition-transform duration-500" />
                    )}
                    <div className="p-5 flex flex-col justify-center">
                      <p className="text-xs text-[#6B6B6B] mb-1">{formatDate(post.publishedAt)}</p>
                      <h2 className="font-semibold text-[#1A1A1A] mb-1 group-hover:text-[#D4A74B] transition-colors">{post.title}</h2>
                      {post.excerpt && <p className="text-sm text-[#6B6B6B] line-clamp-2">{post.excerpt}</p>}
                      <span className="inline-flex items-center gap-1 text-xs font-medium mt-2" style={{ color: '#D4A74B' }}>
                        Ler artigo <ArrowRight className="w-3 h-3" />
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
