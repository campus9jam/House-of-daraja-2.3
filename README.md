# House of Daraja 2.3

> **"Wear Your Worth"** · **"Sovereign Heritage"** · **"Neural Link Active"**

A luxury, heritage-first, offline-capable digital atelier and commerce platform bridging traditional Sahelian aesthetics with an AI-augmented, event-driven web infrastructure.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18 + Vite 5 |
| Styling | Tailwind CSS 3 (Golden Ratio design system) |
| Routing | React Router v6 |
| Backend/DB | Base44 (entities + backend functions) |
| AI Layer | Leema AI (OpenRouter / Gemma-4) |
| Payments | OPay integration |
| PWA | Service Worker + Push Notifications |
| Deploy | Vercel (CI/CD via GitHub Actions) |

---

## Design System

- **Colors:** Black `#050505` · Gold `#C5A059` · White
- **Typography:** Cormorant Garamond (serif) + Montserrat (sans)
- **Grid:** 62% / 38% golden ratio splits throughout
- **Motion:** 0.3s · 0.5s · 0.8s premium timing scale
- **Languages:** EN · HA · YO · IG · FR · AR (RTL support)

---

## Pages (19 routes)

| Route | Page |
|---|---|
| `/` | Home — Hero carousel + featured products |
| `/shop` | Shop — Full product catalogue |
| `/product/:id` | Product Detail — Immersive product view |
| `/marketplace` | Marketplace — P2P vendor products |
| `/drops` | Drops — Live + scheduled limited releases |
| `/heritage` | Heritage — Cultural archive |
| `/community` | Community — YouTube media archive |
| `/live-auction/:id` | Live Auction — Real-time bidding room |
| `/atelier` | Atelier — Bespoke commission portal |
| `/auth` | Auth — Sign in / Register |
| `/profile` | Profile — Identity + status tier |
| `/orders` | Orders — Purchase history |
| `/wishlist` | Wishlist — Saved items |
| `/rewards` | Rewards — XP, tiers, achievements |
| `/wallet` | Wallet — Digital ledger + escrow |
| `/checkout` | Checkout — OPay-ready checkout flow |
| `/vendor` | Vendor Dashboard — Artisan metrics |
| `/seller-studio` | Seller Studio — Product listing wizard |
| `/admin` | Admin Dashboard — Platform management |

---

## Getting Started

```bash
# Install
npm install

# Dev server
npm run dev

# Production build
npm run build

# Preview build
npm run preview
```

---

## Environment Variables

Copy `.env.example` to `.env`:

```env
VITE_APP_ID=your_base44_app_id
VITE_OPAY_MERCHANT_ID=your_opay_merchant_id
VITE_OPAY_PUBLIC_KEY=your_opay_public_key
VITE_VAPID_PUBLIC_KEY=your_vapid_key
OPENROUTER_API_KEY=your_openrouter_key
```

---

## CI/CD Pipeline

Deployed via **GitHub Actions → Vercel**.

| Branch | Environment | Trigger |
|---|---|---|
| `main` | Production | Push to main |
| `develop` | Preview | Push to develop |
| Any PR | Preview | Pull request to main |

### Setting up Vercel secrets in GitHub

Add these to your repo's **Settings → Secrets → Actions**:

| Secret | Description |
|---|---|
| `VERCEL_TOKEN` | From vercel.com → Account Settings → Tokens |
| `VERCEL_ORG_ID` | From `.vercel/project.json` after `vercel link` |
| `VERCEL_PROJECT_ID` | From `.vercel/project.json` after `vercel link` |
| `VITE_APP_ID` | Your Base44 app ID |

---

## Architecture

```
src/
├── api/              # Base44 client + entity bindings
├── pages/            # 19 route-level page components
│   ├── Home.jsx
│   ├── Shop.jsx
│   ├── Drops.jsx
│   ├── Community.jsx     # YouTube RSS media archive
│   ├── LiveAuction.jsx   # Real-time bidding room
│   ├── Rewards.jsx       # XP + tier system
│   ├── Wallet.jsx        # Ledger + escrow
│   ├── SellerStudio.jsx  # 3-step product wizard
│   └── ...
├── App.jsx           # Shell: Splash, Navbar, Cart, Leema AI
├── index.css         # Tailwind + golden ratio utilities
└── utils/
    └── notifications.js  # PWA push notification service
```

---

## Brand Voice

> Luxury first. Never compromise tone. The golden ratio is not decoration — it controls perception of value.

---

*House of Daraja · v2.3 · Sovereign Platform*
