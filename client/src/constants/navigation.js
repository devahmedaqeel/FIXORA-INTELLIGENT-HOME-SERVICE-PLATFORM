/** Sidebar navigation per role. `icon` keys map to components/common/Icon.jsx. */
export const NAVIGATION = {
  customer: [
    { to: '/customer/dashboard', label: 'Dashboard', icon: 'grid' },
    { to: '/customer/search', label: 'Find services', icon: 'search' },
    { to: '/customer/bookings', label: 'My bookings', icon: 'calendar' },
    { to: '/customer/saved', label: 'Saved providers', icon: 'heart' },
    { to: '/customer/reviews', label: 'Reviews', icon: 'star' },
    { to: '/customer/notifications', label: 'Notifications', icon: 'bell' },
    { to: '/customer/complaints', label: 'Complaints', icon: 'alert' },
    { to: '/customer/profile', label: 'Profile', icon: 'user' },
  ],
  provider: [
    { to: '/provider/dashboard', label: 'Dashboard', icon: 'grid' },
    { to: '/provider/bookings', label: 'Bookings', icon: 'calendar' },
    { to: '/provider/services', label: 'Services', icon: 'briefcase' },
    { to: '/provider/availability', label: 'Availability', icon: 'clock' },
    { to: '/provider/earnings', label: 'Earnings', icon: 'wallet' },
    { to: '/provider/commissions', label: 'Commissions', icon: 'file' },
    { to: '/provider/reviews', label: 'Reviews', icon: 'star' },
    { to: '/provider/notifications', label: 'Notifications', icon: 'bell' },
    { to: '/provider/complaints', label: 'Complaints', icon: 'alert' },
    { to: '/provider/profile', label: 'Profile', icon: 'user' },
    { to: '/provider/settings', label: 'Settings', icon: 'settings' },
  ],
  admin: [
    { to: '/admin/dashboard', label: 'Dashboard', icon: 'grid' },
    { to: '/admin/team', label: 'Admin team', icon: 'users' },
    { to: '/admin/provider-verification', label: 'Verification', icon: 'shield' },
    { to: '/admin/users', label: 'Users', icon: 'users' },
    { to: '/admin/customers', label: 'Customers', icon: 'user' },
    { to: '/admin/providers', label: 'Providers', icon: 'briefcase' },
    { to: '/admin/categories', label: 'Categories', icon: 'layers' },
    { to: '/admin/areas', label: 'Areas & ZIP', icon: 'map-pin' },
    { to: '/admin/bookings', label: 'Bookings', icon: 'calendar' },
    { to: '/admin/reviews', label: 'Reviews', icon: 'star' },
    { to: '/admin/complaints', label: 'Complaints', icon: 'alert' },
    { to: '/admin/payments', label: 'Payments', icon: 'wallet' },
    { to: '/admin/commissions', label: 'Commissions', icon: 'file' },
    { to: '/admin/financial-reports', label: 'Financial reports', icon: 'layers' },
    { to: '/admin/reports', label: 'Reports', icon: 'chart' },
    { to: '/admin/chatbot-queries', label: 'Chatbot queries', icon: 'message' },
    { to: '/admin/audit-logs', label: 'Audit logs', icon: 'inbox' },
    { to: '/admin/payment-settings', label: 'Payment settings', icon: 'settings' },
    { to: '/admin/settings', label: 'Settings', icon: 'settings' },
  ],
};

/**
 * Items shown in the bottom bar on phones. Customer/provider fill all 5 slots with
 * real destinations; admin keeps a 4th "More" slot (opens the sidebar) since the full
 * admin nav has too many destinations to flatten into a tab bar.
 */
export const MOBILE_PRIMARY = {
  customer: ['/customer/dashboard', '/customer/search', '/customer/bookings', '/customer/notifications', '/customer/profile'],
  provider: ['/provider/dashboard', '/provider/bookings', '/provider/services', '/provider/notifications', '/provider/profile'],
  admin: ['/admin/dashboard', '/admin/users', '/admin/providers', '/admin/bookings'],
};
