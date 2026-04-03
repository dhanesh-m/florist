# Floral Doctor — Floral Doctor. Canada

A premium, minimal portfolio website for a Canadian florist brand. Built with Next.js 14 (App Router) and Tailwind CSS.

## Features

- **Premium design** — Soft pastel palette (beige, blush pink, off-white), elegant typography (Playfair Display + Source Sans 3)
- **Fully responsive** — Mobile-first design
- **SEO optimized** — Metadata per page, semantic HTML
- **WhatsApp integration** — Dynamic enquiry links for each product
- **Smooth animations** — Fade-in effects, image hover zoom
- **Fast loading** — next/image optimization, lazy loading

## Setup

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Admin (separate app)

Content is edited in the sibling project `../dr.florist-admin`. The admin runs on **port 3001** (this site uses **3000**).

From **this** folder you can start the admin with:

```bash
npm run admin
```

Or from `../dr.florist-admin`: `npm install` once, then `npm run dev`, and open [http://localhost:3001](http://localhost:3001).

Do not use [http://localhost:3000](http://localhost:3000) for the admin — that is the public site.

## Configuration

### WhatsApp Number
Edit `src/lib/whatsapp.ts` and replace `WHATSAPP_NUMBER` with your actual number (with country code, no + or spaces):

```ts
const WHATSAPP_NUMBER = "1234567890"; // e.g. 14165551234 for Canada
```

### Products
Edit `src/data/products.ts` to add or modify flower arrangements.

## Project Structure

```
src/
├── app/
│   ├── layout.tsx          # Root layout, fonts, metadata
│   ├── page.tsx            # Home page
│   ├── not-found.tsx       # 404 page
│   └── collection/
│       ├── page.tsx        # Collection grid
│       └── [slug]/page.tsx # Product detail
├── components/
│   ├── Navbar.tsx
│   ├── Footer.tsx
│   ├── HeroSection.tsx
│   ├── CategorySection.tsx
│   ├── WhyChooseUs.tsx
│   ├── GalleryPreview.tsx
│   ├── ProductCard.tsx
│   ├── ProductGrid.tsx
│   └── WhatsAppButton.tsx
├── data/
│   └── products.ts         # Product data
└── lib/
    └── whatsapp.ts         # WhatsApp URL helper
```

## Tech Stack

- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
