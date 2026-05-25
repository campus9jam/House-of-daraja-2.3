import { createClient } from '@base44/sdk';

export const base44 = createClient({
  appId: import.meta.env.VITE_APP_ID || '6a12b89641a0e26160b7fbc7',
});
