// House of Daraja — Push Notification System

const VAPID_PUBLIC_KEY = import.meta.env.VITE_VAPID_PUBLIC_KEY || '';

// Register service worker
export async function registerServiceWorker() {
  if (!('serviceWorker' in navigator)) return null;
  try {
    const reg = await navigator.serviceWorker.register('/sw.js');
    console.log('[HD] Service worker registered');
    return reg;
  } catch (err) {
    console.error('[HD] SW registration failed:', err);
    return null;
  }
}

// Request notification permission
export async function requestNotificationPermission() {
  if (!('Notification' in window)) return 'unsupported';
  if (Notification.permission === 'granted') return 'granted';
  if (Notification.permission === 'denied') return 'denied';
  const result = await Notification.requestPermission();
  return result;
}

// Subscribe to push notifications
export async function subscribeToPush() {
  try {
    const reg = await navigator.serviceWorker.ready;
    const existing = await reg.pushManager.getSubscription();
    if (existing) return existing;

    if (!VAPID_PUBLIC_KEY) {
      console.warn('[HD] VAPID key not configured');
      return null;
    }

    const sub = await reg.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
    });

    // Save subscription to backend
    await fetch('/functions/savePushSubscription', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ subscription: sub.toJSON() }),
    });

    return sub;
  } catch (err) {
    console.error('[HD] Push subscription failed:', err);
    return null;
  }
}

// Show local notification (no server needed)
export function showLocalNotification(title, body, options = {}) {
  if (!('Notification' in window) || Notification.permission !== 'granted') return;
  new Notification(title, {
    body,
    icon: '/hd-icon-192.png',
    badge: '/hd-badge-72.png',
    ...options,
  });
}

// Notification templates
export const notify = {
  orderConfirmed: (amount) => showLocalNotification(
    'Order Confirmed ✦',
    `Your order of ₦${amount?.toLocaleString()} has been confirmed. We're preparing your piece.`,
    { tag: 'order-confirmed' }
  ),
  dropLive: (dropName) => showLocalNotification(
    `${dropName} is now LIVE ◈`,
    'Secure your piece before it sells out.',
    { tag: 'drop-live' }
  ),
  orderShipped: (tracking) => showLocalNotification(
    'Your Order is on the Way ◆',
    `Tracking: ${tracking}. Estimated delivery: 3-5 business days.`,
    { tag: 'order-shipped' }
  ),
  atelierUpdate: (status) => showLocalNotification(
    'Atelier Update ✦',
    `Your bespoke commission status: ${status}`,
    { tag: 'atelier-update' }
  ),
  welcomeBack: (name) => showLocalNotification(
    `Welcome back, ${name} ◉`,
    'New collections have arrived since your last visit.',
    { tag: 'welcome-back' }
  ),
};

// Helper
function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  return Uint8Array.from([...rawData].map(c => c.charCodeAt(0)));
}
