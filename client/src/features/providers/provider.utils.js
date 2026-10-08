/** Profile completeness checklist shown to providers awaiting verification. */
export function profileChecklist(provider, serviceCount = provider?.activeServiceCount || 0) {
  if (!provider) return [];
  return [
    { label: 'Profile photo', done: Boolean(provider.photoURL) },
    { label: 'Bio (at least 30 characters)', done: (provider.bio || '').length >= 30 },
    { label: 'Phone number', done: Boolean(provider.phone) },
    { label: 'At least one service category', done: (provider.categoryIds || []).length > 0 },
    { label: 'At least one service area', done: (provider.areaIds || []).length > 0 },
    { label: 'At least one active service', done: serviceCount > 0 },
  ];
}

export const providerDisplayName = (provider) => provider?.businessName || provider?.displayName || 'Provider';

export const serviceAreaSummary = (provider, max = 2) => {
  const areas = provider?.serviceAreas || [];
  if (!areas.length) return (provider?.cities || []).join(', ');
  const names = areas.slice(0, max).map((a) => `${a.areaName}, ${a.city}`);
  return areas.length > max ? `${names.join(' · ')} +${areas.length - max} more` : names.join(' · ');
};
