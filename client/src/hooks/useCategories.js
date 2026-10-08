import { useEffect, useState } from 'react';
import { listCategories } from '../services/catalog.service';

/* Active categories rarely change, so they are shared across components for the session. */
let cache = null;
let inflight = null;

export function invalidateCategories() {
  cache = null;
}

export function useCategories() {
  const [state, setState] = useState({ categories: cache || [], loading: !cache, error: null });

  useEffect(() => {
    if (cache) return undefined;
    let active = true;
    inflight ||= listCategories().finally(() => {
      inflight = null;
    });
    inflight
      .then((categories) => {
        cache = categories;
        if (active) setState({ categories, loading: false, error: null });
      })
      .catch((error) => active && setState({ categories: [], loading: false, error }));
    return () => {
      active = false;
    };
  }, []);

  return state;
}
