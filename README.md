# KANZUMALL — Premium Traditional Menswear Website

A cinematic, production-quality website for **Kanzumall**, a Tanzanian clothing business specializing in traditional men's Kanzu garments and related accessories.

This is an **animated product showcase with WhatsApp enquiries**, not a full e-commerce checkout system.

---

## Quick Start

**No build tools required.** The website runs directly in any modern browser.

### Option 1: Local Development Server (Recommended)

A local server is required for the Three.js hero scene to load textures correctly.

```bash
# Using Python
python -m http.server 8000

# Using Node.js
npx serve

# Using PHP
php -S localhost:8000
```

Then open `http://localhost:8000` in your browser.

### Option 2: VS Code Live Server

Install the [Live Server](https://marketplace.visualstudio.com/items?itemName=ritwickdey.LiveServer) extension, right-click `index.html`, and select "Open with Live Server".

### Option 3: Direct File Open

Open `index.html` directly in your browser. The Three.js hero will fall back to the CSS-only version due to CORS restrictions on `file://` URLs. All other features work normally.

---

## Project Structure

```
kanzumall/
├── index.html                          # Single-page website (all sections)
├── README.md                           # This file
├── css/
│   ├── variables.css                   # Design tokens & custom properties
│   ├── base.css                        # Reset, typography, buttons, layout
│   ├── animations.css                  # Scroll reveal & keyframe animations
│   ├── navigation.css                  # Nav bar & mobile menu
│   ├── hero.css                        # Cinematic hero section & fallback
│   ├── collections.css                 # Collection category cards
│   ├── products.css                    # Product grid & cards (light bg)
│   ├── wedding.css                     # Wedding & occasion section
│   ├── story.css                       # Brand story section
│   ├── accessories.css                 # Accessories section
│   └── contact.css                     # Contact, footer & WhatsApp FAB
├── js/
│   ├── app.js                          # Main orchestrator (DOMContentLoaded)
│   ├── hero-scene.js                   # Three.js cinematic 3D environment
│   ├── navigation.js                   # Nav scroll, hamburger, smooth scroll
│   ├── scroll-animations.js            # IntersectionObserver reveal system
│   └── products.js                     # Product data, rendering, WhatsApp links
└── assets/
    └── images/
        ├── brand/
        │   └── logo-original.jpg       # Official Kanzumall logo (supplied)
        ├── hero/
        │   └── hero-ceremonial-robe.jpg # Hero section image (supplied)
        ├── products/
        │   ├── classic-kanzu-white.jpg  # Classic white Kanzu (supplied)
        │   └── ceremonial-gold-robe.jpg # Gold bisht/robe (supplied)
        ├── collections/                 # Collection cover images (add here)
        ├── wedding/                     # Wedding section images (add here)
        └── accessories/                 # Accessory images (add here)
```

---

## Technology Stack

| Technology | Version | Purpose |
|-----------|---------|---------|
| HTML5 | — | Semantic page structure |
| CSS3 | — | Styling, animations, responsive layout |
| Vanilla JavaScript | ES5+ | Interaction, rendering, animation |
| [Three.js](https://threejs.org/) | r160 | Cinematic 3D hero environment |
| [Google Fonts](https://fonts.google.com/) | — | Playfair Display (serif) & Inter (sans) |
| [Material Symbols](https://fonts.google.com/icons) | Outlined | UI icons |

**No frameworks.** No React, Vue, Angular, or build tools required.

Three.js is loaded from CDN (`unpkg.com`). All other code is vanilla.

---

## Asset Replacement Guide

### Replacing Product Images

1. Add your images to the appropriate `assets/images/` subdirectory
2. Open `js/products.js`
3. Find the `PRODUCTS`, `COLLECTIONS`, or `ACCESSORIES` arrays
4. Update the `image` property with the new file path

**Recommended image dimensions:**
- Product photos: **800×1067px** (3:4 aspect ratio)
- Collection covers: **800×1000px** (4:5 aspect ratio)
- Hero image: **800×1200px** (2:3 aspect ratio, portrait)
- Accessories: **800×800px** (1:1 square)

**Format recommendations:** WebP preferred for smaller file sizes, JPEG as fallback. Optimize to under 200KB per image.

### Replacing the Logo

Replace `assets/images/brand/logo-original.jpg` with the official logo file. The logo is displayed as a circle (`border-radius: 50%`), so a square image works best.

### Adding Real Product Data

In `js/products.js`, each product object has these fields:

```javascript
{
    id: 'unique-slug',              // URL-friendly identifier
    name: 'Product Display Name',   // Shown on the card
    category: 'Category Name',      // Shown above the name
    image: 'assets/images/...',     // Path to product image
    price: null,                    // Set to string like '150,000 TSh' or null
    badge: 'New Arrival',           // Optional badge text, or null
    isSample: true                  // Set to false for real products
}
```

Products with `isSample: true` show a subtle "Sample listing" note. Remove the flag or set to `false` for confirmed inventory.

---

## Customization

### Colors

Edit `css/variables.css` to change the color palette:

```css
:root {
    --color-obsidian:  #151311;   /* Primary dark background */
    --color-chocolate: #38261D;   /* Secondary dark */
    --color-gold:      #D4B46A;   /* Accent, CTAs, highlights */
    --color-ivory:     #F5F0E6;   /* Light backgrounds, text */
    --color-burgundy:  #7A2332;   /* Accent color */
}
```

### Typography

Change the Google Fonts `<link>` in `index.html` and update the font-family variables in `css/variables.css`:

```css
--font-serif: 'Playfair Display', Georgia, serif;
--font-sans: 'Inter', -apple-system, sans-serif;
```

### WhatsApp Number

Search and replace `255753803803` across all files to change the business contact number. The number appears in:
- `index.html` (nav, hero, wedding, contact, footer, FAB)
- `js/products.js` (WhatsApp link generator)

---

## WhatsApp Integration

All enquiry buttons use the [WhatsApp Click to Chat API](https://faq.whatsapp.com/5913398998672934):

```
https://wa.me/255753803803?text=URL_ENCODED_MESSAGE
```

### Message Types

- **Product enquiry:** Pre-fills "Hello Kanzumall, I am interested in [product name]. Please share the available sizes, colors, price, and ordering details."
- **General enquiry:** Pre-fills "Hello Kanzumall, I would like to learn more about your collection."
- **Wedding enquiry:** Pre-fills a wedding-specific message

All messages are **editable by the customer** before sending. No automatic messages are sent.

---

## Browser Support

| Browser | Minimum Version |
|---------|----------------|
| Chrome | 90+ |
| Firefox | 90+ |
| Safari | 15+ |
| Edge | 90+ |
| Mobile Chrome | 90+ |
| Mobile Safari | 15+ |

The Three.js hero requires **WebGL 2.0**. An automatic CSS fallback displays when WebGL is unavailable or on mobile devices (< 768px viewport width).

---

## Accessibility

- Semantic HTML5 structure (`<header>`, `<main>`, `<section>`, `<footer>`, `<nav>`)
- ARIA labels on interactive elements and landmarks
- Keyboard navigation with visible focus states (gold outline)
- `prefers-reduced-motion` respected — all animations disabled
- WebGL canvas marked `aria-hidden="true"` with visual CSS fallback
- Descriptive `alt` text on meaningful images
- Minimum touch target size of 44×44px
- Color contrast meets WCAG AA for body text

---

## Performance

- **Three.js** loaded from CDN (deferred at end of `<body>`)
- **Images** lazy-loaded below the fold (`loading="lazy"`)
- **CSS animations** use `transform` and `opacity` (GPU-accelerated)
- **Three.js rendering** capped at 60fps, pauses when tab is hidden
- **Mobile devices** skip WebGL entirely (CSS-only hero)
- **Pixel ratio** capped at 2× to prevent excessive GPU usage
- **Scroll handlers** throttled via `requestAnimationFrame`
- **Three.js cleanup** properly disposes geometries, materials, textures, and renderer

---

## Known Limitations

| Item | Status | Notes |
|------|--------|-------|
| Product data | Sample | Replace with real inventory in `js/products.js` |
| Some images | Placeholder | Gradient backgrounds shown for missing images |
| Business address | On enquiry | Exact address not confirmed |
| Opening hours | On enquiry | Hours not confirmed |
| Prices | On enquiry | Only one price seen (150,000 TSh); not applied globally |
| E-commerce | Not included | By design — WhatsApp enquiry model |
| Three.js on file:// | Falls back to CSS | CORS prevents texture loading from file:// URLs |
| IE11 | Not supported | Modern browsers only |

---

## SEO

- Semantic HTML with proper heading hierarchy (h1 → h4)
- Meta description and Open Graph tags
- Twitter Card meta tags
- Theme color for mobile browsers
- Descriptive page title: "Kanzumall — Premium Traditional Menswear | Tanzania"
- Alt text on all meaningful images
- Clean, readable URL structure (single-page with hash anchors)

---

## License

Custom website built for Kanzumall. All product images and brand assets are property of Kanzumall.

---

## Contact

**Kanzumall**
- WhatsApp: [+255 753 803 803](https://wa.me/255753803803)
- Instagram: [@kanzumall](https://www.instagram.com/kanzumall/)
- Location: Dar es Salaam, Tanzania
