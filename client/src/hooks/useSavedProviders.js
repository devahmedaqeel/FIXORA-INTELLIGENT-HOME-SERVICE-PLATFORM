import { useCallback, useEffect, useState } from 'react';
import { getSavedProviderIds, saveProvider, unsaveProvider } from '../services/account.service';
import { useToast } from '../context/ToastContext';

/** Saved-provider IDs for the signed-in customer, with an optimistic toggle. */
export function useSavedProviders() {
  const [ids, setIds] = useState([]);
  const toast = useToast();

  useEffect(() => {
    getSavedProviderIds().then(setIds).catch(() => {});
  }, []);

  const toggle = useCallback(
    async (providerId, save) => {
      setIds((list) => (save ? [...new Set([...list, providerId])] : list.filter((id) => id !== providerId)));
      try {
        const result = save ? await saveProvider(providerId) : await unsaveProvider(providerId);
        setIds(result.savedProviderIds);
        toast.success(save ? 'Saved to your providers' : 'Removed from saved providers');
      } catch (err) {
        setIds((list) => (save ? list.filter((id) => id !== providerId) : [...list, providerId]));
        toast.error(err);
      }
    },
    [toast],
  );

  return { savedIds: ids, toggleSaved: toggle };
}
