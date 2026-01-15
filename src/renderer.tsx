import { jsxRenderer } from 'hono/jsx-renderer'
import { Link, ViteClient } from 'vite-ssr-components/hono'

export const renderer = jsxRenderer(({ children }) => {
  return (
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta name="color-scheme" content="light" />
        <title>Shortin - URL Shortener</title>
        <meta name="description" content="A minimalist and accessible URL shortener service. Shorten your long URLs instantly with custom short codes." />
        <meta name="theme-color" content="#4f46e5" />
        <link rel="icon" href="/favicon.ico" type="image/x-icon" />
        <ViteClient />
        <Link href="/src/style.css" rel="stylesheet" />
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
  )
})
