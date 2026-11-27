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
        <meta name="theme-color" content="#f7f6ef" />
        <link rel="icon" href="/favicon.ico" type="image/x-icon" />
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="manifest" href="/manifest.json" />
        <ViteClient />
        <Link href="/src/style.css" rel="stylesheet" />

        {/* Open Graph */}
        <meta property="og:title" content="Shortin - URL Shortener" />
        <meta
          property="og:description"
          content="A minimalist and accessible URL shortener service. Shorten your long URLs instantly with custom short codes."
        />
        <meta
          property="og:image"
          content="https://og-image.yehezgun.com/og?title=Shortin&description=A+minimalist+and+accessible+URL+shortener+service&siteName=shortin.yehezgun.com&social=Twitter%3A+%40yehezgun&image=https%3A%2F%2Fshortin.yehezgun.com%2Fimages%2Ficons%2Ficon512_maskable.png"
        />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:image:type" content="image/png" />
        <meta property="og:url" content="https://shortin.yehezgun.com" />
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="Shortin" />
        <meta property="og:locale" content="en_US" />

        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Shortin - URL Shortener" />
        <meta
          name="twitter:description"
          content="A minimalist and accessible URL shortener service. Shorten your long URLs instantly with custom short codes."
        />
        <meta
          name="twitter:image"
          content="https://og-image.yehezgun.com/og?title=Shortin&description=A+minimalist+and+accessible+URL+shortener+service&siteName=shortin.yehezgun.com&social=Twitter%3A+%40yehezgun&image=https%3A%2F%2Fshortin.yehezgun.com%2Fimages%2Ficons%2Ficon512_maskable.png"
        />
        <meta name="twitter:creator" content="@yehezgun" />
      </head>
      <body class="antialiased">
        {/* Skip to main content link for keyboard navigation */}
        <a
          href="#main-content"
          class="skip-link"
        >
          Skip to main content
        </a>
        <div class="site-shell">
          <header class="site-header">
            <a class="wordmark" href="/" aria-label="Shortin home">Shortin<span aria-hidden="true">.</span></a>
            <span class="site-header-note">A little link goes a long way.</span>
          </header>
          {children}
          <footer class="site-footer">Made for sharing.</footer>
        </div>
      </body>
    </html>
  );
});
