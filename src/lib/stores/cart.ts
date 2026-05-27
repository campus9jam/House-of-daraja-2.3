import { writable, derived } from 'svelte/store';
import { browser } from '$app/environment';

export interface CartItem {
  id: string;
  product_id: string;
  name: string;
  price: number;
  image: string;
  size?: string;
  quantity: number;
  department: string;
}

function createCartStore() {
  const stored = browser ? localStorage.getItem('hd_cart') : null;
  const initial: CartItem[] = stored ? JSON.parse(stored) : [];

  const { subscribe, set, update } = writable<CartItem[]>(initial);

  if (browser) {
    subscribe(items => localStorage.setItem('hd_cart', JSON.stringify(items)));
  }

  return {
    subscribe,
    add(item: Omit<CartItem, 'quantity'>) {
      update(items => {
        const key = item.product_id + (item.size ?? '');
        const existing = items.find(i => i.product_id + (i.size ?? '') === key);
        if (existing) {
          return items.map(i => i.product_id + (i.size ?? '') === key ? { ...i, quantity: i.quantity + 1 } : i);
        }
        return [...items, { ...item, quantity: 1 }];
      });
    },
    remove(productId: string, size?: string) {
      update(items => items.filter(i => !(i.product_id === productId && i.size === size)));
    },
    updateQty(productId: string, size: string | undefined, qty: number) {
      if (qty <= 0) { this.remove(productId, size); return; }
      update(items => items.map(i => i.product_id === productId && i.size === size ? { ...i, quantity: qty } : i));
    },
    clear() { set([]); }
  };
}

export const cart = createCartStore();
export const cartCount = derived(cart, $c => $c.reduce((sum, i) => sum + i.quantity, 0));
export const cartTotal = derived(cart, $c => $c.reduce((sum, i) => sum + i.price * i.quantity, 0));
