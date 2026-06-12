import { useEffect } from 'react';
import { trpc } from '@/providers/trpc';

export function useSeo() {
  const { data: configs } = trpc.admin.config.list.useQuery();

  const get = (key: string, fallback: string) =>
    configs?.find((c) => c.key === key)?.value || fallback;

  const title = get('seoTitle', 'Gesso Premium | Sancas, Forros e Drywall');
  const description = get('seoDescription', 'Especialistas em gesso decorativo, sancas iluminadas, forros e drywall. Orçamento grátis em 24h. Garantia de 5 anos.');

  useEffect(() => {
    if (!configs) return;

    document.title = title;

    let metaDesc = document.querySelector<HTMLMetaElement>('meta[name="description"]');
    if (!metaDesc) {
      metaDesc = document.createElement('meta');
      metaDesc.name = 'description';
      document.head.appendChild(metaDesc);
    }
    metaDesc.content = description;
  }, [title, description, configs]);
}
