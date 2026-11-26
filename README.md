# Shortin - URL Shortener

A minimalist, responsive, and accessible URL shortener service built with **Hono JS** and **Tailwind CSS**, deployed on **Cloudflare Workers**.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Hono](https://img.shields.io/badge/hono-4.x-orange.svg)
![Tailwind CSS](https://img.shields.io/badge/tailwindcss-4.x-06B6D4.svg)

## ✨ Features

- 🔗 **URL Shortening** - Shorten long URLs instantly with auto-generated or custom short codes
- 📋 **Copy to Clipboard** - One-click copy for generated short URLs
- 📱 **QR Code Generation** - Generate downloadable QR codes for your shortened URLs
- 📊 **Visit Statistics** - Track how many times your shortened links have been clicked
- ♿ **Accessible (a11y)** - WCAG 2.1 compliant with screen reader support, keyboard navigation, and reduced motion support
- 📱 **Responsive Design** - Beautiful UI that works on all devices
- ⚡ **Edge Deployed** - Runs on Cloudflare Workers for ultra-fast global performance
- 🔄 **Smart Redirects** - 2-second loading screen with countdown before redirect

## 🛠️ Tech Stack

| Technology | Purpose |
|------------|---------|
| [Hono](https://hono.dev) | Ultra-fast web framework |
| [Tailwind CSS v4](https://tailwindcss.com) | Utility-first CSS framework |
| [Vite](https://vitejs.dev) | Build tool and dev server |
| [Cloudflare Workers](https://workers.cloudflare.com) | Edge deployment platform |
| [Vitest](https://vitest.dev) | Unit testing framework |
| [qrcode](https://www.npmjs.com/package/qrcode) | QR code generation |
| [Plus Jakarta Sans](https://fonts.google.com/specimen/Plus+Jakarta+Sans) | Typography |

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) 26 LTS, as specified in `.nvmrc` (`nvm install` and `nvm use`)
- [pnpm](https://pnpm.io/) at the version pinned in `package.json`

### Installation

```bash
# Clone the repository
git clone https://github.com/yehezkielgunawan/shortin-v3-rev.git
cd shortin-v3-rev

# Install dependencies
pnpm install --frozen-lockfile
```

### Development

```bash
# Start development server on port 3000
pnpm dev
```

The app will be available at `http://localhost:3000`

### Testing

```bash
# Run tests in watch mode
pnpm test

# Run tests once (CI mode)
pnpm test:ci

# Run tests with coverage report
pnpm test:coverage
```

### Build & Deploy

```bash
# Run the CI checks: unit tests, production build, and a Wrangler deploy dry run
pnpm check

# Build for production
pnpm build

# Preview production build locally
pnpm cf:preview

# Deploy to the Worker configured for local CLI use
pnpm cf:deploy
```

Production deploys to `shortin-v3` are started manually from `main` in GitHub
Actions. Before running the workflow, configure the `production` GitHub
environment to allow deployments only from `main`. Store
`CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID` as environment secrets and
remove any repository-level copies once the environment secrets are in place.
PR checks and the deploy dry run do not require these credentials.

### Type Generation

Generate/synchronize types based on your Worker configuration:

```bash
pnpm cf-typegen
```

## 📖 Usage

### Shortening a URL

1. Enter your long URL in the input field
2. (Optional) Add a custom short code
3. Click "Shorten URL"
4. Copy the generated short URL

### Generating a QR Code

1. After shortening a URL, click the "Generate QR Code" button
2. The QR code will be displayed with the shortened URL below it
3. Click "Download QR Code" to save it as a PNG image

### Accessing a Shortened URL

Visit `https://shortin-api.yehezgun.com/{shortCode}` to be redirected to the original URL.

## 🔌 API Reference

The app proxies requests to the backend API through `/api/*` routes.

### Create Short URL

```http
POST /api/shorten
Content-Type: application/json

{
  "url": "https://www.example.com/some/long/url",
  "shortCodeInput": "custom-code"  // optional
}
```

**Response (201)**
```json
{
  "id": "id_1620000000000_1234",
  "url": "https://www.example.com/some/long/url",
  "shortCode": "custom-code",
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z",
  "count": 0
}
```

### Get Original URL

```http
GET /api/{shortCode}
```

**Response (200)**
```json
{
  "url": "https://www.example.com/some/long/url"
}
```

### Get Visit Statistics

```http
GET /api/{shortCode}/stats
```

**Response (200)**
```json
{
  "count": 42
}
```

### Update Destination URL

```http
PUT /api/{shortCode}
Content-Type: application/json

{
  "url": "https://www.example.com/new/url"
}
```

**Response (200)**
```json
{
  "message": "Short code updated successfully"
}
```

### Delete Short URL

```http
DELETE /api/{shortCode}
```

**Response (200)**
```json
{
  "message": "Short code deleted successfully"
}
```

### Error Responses

| Status | Response |
|--------|----------|
| 400 | `{ "error": "URL is required" }` |
| 400 | `{ "error": "Short code already in use" }` |
| 404 | `{ "error": "Short code not found" }` |
| 500 | `{ "error": "Failed to shorten URL" }` |

## 📁 Project Structure

```
shortin-v3-rev/
├── src/
│   ├── client/           # Client-side hydration scripts
│   │   ├── main.tsx      # Main page hydration
│   │   └── redirect.tsx  # Redirect page hydration
│   ├── components/       # JSX Components
│   │   ├── ShortenForm.tsx
│   │   └── RedirectPage.tsx
│   ├── lib/              # Shared utilities
│   │   ├── formReducer.ts
│   │   └── qrcode.ts     # QR code generation utility
│   ├── test/             # Test files
│   │   ├── setup.ts
│   │   ├── index.test.ts
│   │   └── formReducer.test.ts
│   ├── index.tsx         # Main Hono app & routes
│   ├── renderer.tsx      # HTML renderer
│   └── style.css         # Global styles
├── public/               # Static assets
├── dist/                 # Build output
├── vite.config.ts        # Vite configuration
├── vitest.config.ts      # Vitest configuration
├── wrangler.jsonc        # Cloudflare Workers config
└── package.json
```

## ♿ Accessibility Features

This app is built with accessibility in mind:

- **Semantic HTML** - Proper use of `<main>`, `<article>`, `<header>`, `<footer>` landmarks
- **ARIA Labels** - Screen reader-friendly labels and live regions
- **Keyboard Navigation** - Skip links and proper focus management
- **Color Contrast** - WCAG AA compliant color contrast ratios
- **Reduced Motion** - Respects `prefers-reduced-motion` user preference
- **High Contrast Mode** - Supports `prefers-contrast: high` media query
- **Form Accessibility** - Proper labels, error announcements, and validation messages

## 🔧 Environment Variables

Configure the following in your Cloudflare Workers environment:

| Variable | Description | Default |
|----------|-------------|---------|
| `API_ENDPOINT` | Backend API URL | `https://shortin-api.yehezgun.com` |

## 📜 Scripts Reference

| Script | Description |
|--------|-------------|
| `pnpm dev` | Start development server |
| `pnpm build` | Build for production |
| `pnpm test` | Run tests in watch mode |
| `pnpm test:ci` | Run tests once |
| `pnpm test:coverage` | Run tests with coverage |
| `pnpm cf:preview` | Preview production build |
| `pnpm cf:deploy` | Deploy to Cloudflare Workers |
| `pnpm cf-typegen` | Generate Cloudflare types |
| `pnpm up-latest` | Update all dependencies |

## 📄 License

This project is open-source and available under the [MIT License](LICENSE).

## 🙏 Acknowledgments

- [Hono](https://hono.dev) - Fast, lightweight web framework
- [Tailwind CSS](https://tailwindcss.com) - Utility-first CSS
- [Cloudflare Workers](https://workers.cloudflare.com) - Edge computing platform
- [Plus Jakarta Sans](https://fonts.google.com/specimen/Plus+Jakarta+Sans) - Beautiful typography

---

Made with ❤️ by [Yehezkiel Gunawan](https://yehezgun.com)
