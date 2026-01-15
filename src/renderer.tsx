import { jsxRenderer } from "hono/jsx-renderer";
import { Link, ViteClient } from "vite-ssr-components/hono";

export const renderer = jsxRenderer(({ children }) => {
  return (
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta name="color-scheme" content="light" />
        <title>Shortin - URL Shortener</title>
        <meta
          name="description"
          content="A minimalist and accessible URL shortener service. Shorten your long URLs instantly with custom short codes."
        />
        <meta name="theme-color" content="#4f46e5" />
        <link rel="icon" href="/favicon.ico" type="image/x-icon" />
        <link rel="manifest" href="/manifest.json" />
        <ViteClient />
        <Link href="/src/style.css" rel="stylesheet" />

        {/* Twitter Card */}
        <meta name="twitter:card" content="summary" />
        <meta name="twitter:title" content="Shortin - URL Shortener" />
        <meta
          name="twitter:description"
          content="A minimalist and accessible URL shortener service. Shorten your long URLs instantly with custom short codes."
        />
        <meta name="twitter:image" content="/og-image.png" />

        {/* Open Graph */}
        <meta property="og:title" content="Shortin - URL Shortener" />
        <meta
          property="og:description"
          content="A minimalist and accessible URL shortener service. Shorten your long URLs instantly with custom short codes."
        />
        <meta property="og:image" content="/og-image.png" />
        <meta property="og:url" content="https://shortin.yehezgun.com" />
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="Shortin - URL Shortener" />
        <meta property="og:locale" content="en_US" />
        <meta property="og:image:width" content="1200" />

        {/* OG Image */}
        <meta
          property="og:image"
          content="https://og-image.yehezgun.com/og?title=Shortin&description=Quick+Link+Shortener+Made+Using+G-Sheet+API&siteName=yehezgun.com&social=Twitter%3A+%40yehezgun&image=https%3A%2F%2Fshortin.yehezgun.com%2Fimages%2Ficons%2Ficon512_maskable.png"
        />
      </head>
      <body class="antialiased">
        {/* Skip to main content link for keyboard navigation */}
        <a
          href="#main-content"
          class="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:bg-indigo-600 focus:text-white focus:px-4 focus:py-2 focus:rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Skip to main content
        </a>
        {children}
      </body>
    </html>
  );
});
