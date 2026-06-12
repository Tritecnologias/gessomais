import { useParams, Link } from 'react-router';
import { ArrowLeft } from 'lucide-react';
import { trpc } from '@/providers/trpc';
import Navigation from '../sections/Navigation';
import Footer from '../sections/Footer';

function formatDate(date: Date) {
  return new Date(date).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });
}

export default function BlogPostPage() {
  const { slug } = useParams<{ slug: string }>();
  const { data: post, isLoading } = trpc.admin.posts.getBySlug.useQuery({ slug: slug ?? '' }, { enabled: !!slug });

  return (
    <>
      <Navigation />
      <main className="pt-[72px]">
        <div className="section-padding">
          <div className="container-main max-w-[720px]">
            <Link to="/dicas" className="inline-flex items-center gap-2 text-sm text-[#6B6B6B] hover:text-[#1A1A1A] mb-8 transition-colors">
              <ArrowLeft className="w-4 h-4" /> Todos os artigos
            </Link>

            {isLoading ? (
              <div className="space-y-4 animate-pulse">
                <div className="h-8 bg-[#E5E2DE] rounded w-3/4" />
                <div className="h-4 bg-[#E5E2DE] rounded w-1/4" />
                <div className="h-64 bg-[#E5E2DE] rounded-xl" />
                <div className="space-y-2">
                  {[0,1,2,3,4].map((i) => <div key={i} className="h-4 bg-[#E5E2DE] rounded" />)}
                </div>
              </div>
            ) : !post || !post.active ? (
              <div className="text-center py-20">
                <p className="text-[#6B6B6B] text-lg">Artigo não encontrado.</p>
                <Link to="/dicas" className="mt-4 inline-block text-[#D4A74B] underline text-sm">Ver todos os artigos</Link>
              </div>
            ) : (
              <article>
                <h1 className="font-display font-semibold mb-3"
                  style={{ fontSize: 'clamp(1.75rem, 3.5vw, 2.75rem)', color: '#1A1A1A', lineHeight: 1.2, letterSpacing: '-0.02em' }}>
                  {post.title}
                </h1>
                <p className="text-sm text-[#6B6B6B] mb-6">{formatDate(post.publishedAt)}</p>

                {post.image && (
                  <img src={post.image} alt={post.title}
                    className="w-full rounded-xl mb-8 object-cover max-h-[400px]" />
                )}

                {post.excerpt && (
                  <p className="text-lg font-medium text-[#1A1A1A] mb-6 pb-6 border-b border-[#E5E2DE] leading-relaxed">
                    {post.excerpt}
                  </p>
                )}

                <div className="prose prose-lg max-w-none text-[#1A1A1A]"
                  style={{ lineHeight: 1.8 }}
                  dangerouslySetInnerHTML={{ __html: post.content.replace(/\n/g, '<br/>') }} />
              </article>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
