export function createPageUrl(pageName) {
  const map = {
    Home: '/',
    Shop: '/shop',
    ProductDetail: '/product',
    Marketplace: '/marketplace',
    Drops: '/drops',
    Heritage: '/heritage',
    Profile: '/profile',
    Orders: '/orders',
    Wishlist: '/wishlist',
    Atelier: '/atelier',
    VendorDashboard: '/vendor',
    AdminDashboard: '/admin',
  };
  return map[pageName] || '/';
}

export function formatPrice(amount, currency = '₦') {
  if (!amount && amount !== 0) return `${currency}0`;
  return `${currency}${amount.toLocaleString('en-NG')}`;
}

export function formatDate(dateStr) {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString('en-NG', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export function getCartCount() {
  try {
    const items = JSON.parse(localStorage.getItem('hd_cart') || '[]');
    return items.reduce((s, i) => s + (i.quantity || 1), 0);
  } catch {
    return 0;
  }
}

export function calculateTimeLeft(endTime) {
  const diff = new Date(endTime) - Date.now();
  if (diff <= 0) return { h: 0, m: 0, s: 0, expired: true };
  return {
    h: Math.floor(diff / 3600000),
    m: Math.floor((diff % 3600000) / 60000),
    s: Math.floor((diff % 60000) / 1000),
    expired: false,
  };
}
