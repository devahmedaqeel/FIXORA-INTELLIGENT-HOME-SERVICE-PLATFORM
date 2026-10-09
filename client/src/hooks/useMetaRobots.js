import { useEffect } from 'react';

/**
 * Injects <meta name="robots" content="noindex, nofollow"> for the lifetime of the mounted
 * layout. Used by private dashboards (admin/customer/provider) only — public pages never
 * call this, so they stay indexable by default. This is an SEO hygiene signal, not an
 * access-control mechanism: every private route is still guarded server-side regardless.
 */
export function useMetaRobots(content = 'noindex, nofollow') {
  useEffect(() => {
    let tag = document.querySelector('meta[name="robots"]');
    const created = !tag;
    if (!tag) {
      tag = document.createElement('meta');
      tag.setAttribute('name', 'robots');
      document.head.appendChild(tag);
    }
    const previous = tag.getAttribute('content');
    tag.setAttribute('content', content);
    return () => {
      if (created) tag.remove();
      else if (previous !== null) tag.setAttribute('content', previous);
    };
  }, [content]);
}
