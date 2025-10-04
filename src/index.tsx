import { Hono } from "hono";
import { renderer } from "./renderer";

type Bindings = {
  API_ENDPOINT: string;
};

const app = new Hono<{ Bindings: Bindings }>();

app.use(renderer);

// Main page
app.get("/", (c) => {
  return c.render(
    <div class="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
      <div class="max-w-2xl mx-auto">
        <div class="bg-white rounded-lg shadow-xl p-8">
          <h1 class="text-4xl font-bold text-gray-900 mb-2 text-center">
            URL Shortener
          </h1>
          <p class="text-gray-600 text-center mb-8">
            Shorten your long URLs instantly
          </p>

          <form id="shorten-form" class="space-y-6">
            <div>
              <label
                for="url"
                class="block text-sm font-medium text-gray-700 mb-2"
              >
                Enter Long URL
              </label>
              <input
                type="url"
                id="url"
                name="url"
                required
                placeholder="https://example.com/long/url"
                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
              />
            </div>

            <div>
              <label
                for="shortCodeInput"
                class="block text-sm font-medium text-gray-700 mb-2"
              >
                Custom Short Code (optional)
              </label>
              <input
                type="text"
                id="shortCodeInput"
                name="shortCodeInput"
                placeholder="custom123"
                pattern="[a-zA-Z0-9-_]+"
                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
              />
              <p class="mt-1 text-xs text-gray-500">
                Only letters, numbers, hyphens, and underscores
              </p>
            </div>

            <button
              type="submit"
              class="w-full bg-indigo-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Shorten URL
            </button>
          </form>

          <div
            id="result"
            class="hidden mt-8 p-6 bg-green-50 border border-green-200 rounded-lg"
          >
            <h3 class="text-lg font-semibold text-green-900 mb-3">Success!</h3>
            <div class="flex items-center gap-2">
              <input
                type="text"
                id="short-url"
                readonly
                class="flex-1 px-4 py-2 bg-white border border-green-300 rounded-lg text-gray-900 font-mono text-sm"
              />
              <button
                id="copy-btn"
                class="px-4 py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition"
              >
                Copy
              </button>
            </div>
            <div id="stats" class="mt-3 text-sm text-gray-600"></div>
          </div>

          <div
            id="warning"
            class="hidden mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg"
          >
            <p class="text-yellow-800 flex items-start gap-2">
              <span class="text-xl">⚠️</span>
              <span id="warning-message"></span>
            </p>
          </div>

          <div
            id="error"
            class="hidden mt-4 p-4 bg-red-50 border border-red-200 rounded-lg"
          >
            <p class="text-red-800 flex items-start gap-2">
              <span class="text-xl">❌</span>
              <span id="error-message"></span>
            </p>
          </div>
        </div>
      </div>

      <script
        type="module"
        dangerouslySetInnerHTML={{
          __html: `
          const form = document.getElementById('shorten-form');
          const resultDiv = document.getElementById('result');
          const errorDiv = document.getElementById('error');
          const warningDiv = document.getElementById('warning');
          const shortUrlInput = document.getElementById('short-url');
          const copyBtn = document.getElementById('copy-btn');
          const statsDiv = document.getElementById('stats');

          form.addEventListener('submit', async (e) => {
            e.preventDefault();

            // Hide previous messages
            resultDiv.classList.add('hidden');
            errorDiv.classList.add('hidden');
            warningDiv.classList.add('hidden');

            const submitBtn = form.querySelector('button[type="submit"]');
            submitBtn.disabled = true;
            submitBtn.textContent = 'Shortening...';

            const formData = new FormData(form);
            const url = formData.get('url');
            const shortCodeInput = formData.get('shortCodeInput');

            try {
              const response = await fetch('/api/shorten', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  url,
                  shortCodeInput: shortCodeInput || undefined
                })
              });

              const data = await response.json();

              if (!response.ok) {
                throw new Error(data.error || 'Failed to shorten URL');
              }

              // Show result
              const shortUrl = window.location.origin + '/' + data.shortCode;
              shortUrlInput.value = shortUrl;
              resultDiv.classList.remove('hidden');
              statsDiv.textContent = 'Created: ' + new Date(data.createdAt).toLocaleString() + ' | Clicks: ' + data.count;

              // Check if there's a warning about old code
              if (data.warning) {
                document.getElementById('warning-message').textContent = data.warning;
                warningDiv.classList.remove('hidden');
              }

            } catch (error) {
              document.getElementById('error-message').textContent = error.message;
              errorDiv.classList.remove('hidden');
            } finally {
              submitBtn.disabled = false;
              submitBtn.textContent = 'Shorten URL';
            }
          });

          copyBtn.addEventListener('click', async () => {
            try {
              await navigator.clipboard.writeText(shortUrlInput.value);
              const originalText = copyBtn.textContent;
              copyBtn.textContent = 'Copied!';
              copyBtn.classList.add('bg-green-800');
              setTimeout(() => {
                copyBtn.textContent = originalText;
                copyBtn.classList.remove('bg-green-800');
              }, 2000);
            } catch (err) {
              console.error('Failed to copy:', err);
            }
          });
        `,
        }}
      />
    </div>,
  );
});

// Redirect page with loading screen
app.get("/:code", async (c) => {
  const code = c.req.param("code");

  return c.render(
    <div class="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-100 flex items-center justify-center px-4">
      <div class="bg-white rounded-lg shadow-xl p-12 max-w-md w-full text-center">
        <div class="mb-6">
          <div class="inline-block animate-spin rounded-full h-16 w-16 border-4 border-gray-200 border-t-indigo-600"></div>
        </div>
        <h1 class="text-2xl font-bold text-gray-900 mb-2">Redirecting...</h1>
        <p class="text-gray-600">
          Please wait while we take you to your destination.
        </p>
      </div>

      <script
        type="module"
        dangerouslySetInnerHTML={{
          __html: `
          const code = '${code}';

          async function redirect() {
            try {
              const response = await fetch('/api/' + code);
              const data = await response.json();

              if (response.ok && data.url) {
                setTimeout(() => {
                  window.location.href = data.url;
                }, 3000);
              } else {
                throw new Error(data.error || 'Short code not found');
              }
            } catch (error) {
              document.body.innerHTML = '<div class="min-h-screen bg-gradient-to-br from-red-50 to-pink-100 flex items-center justify-center px-4"><div class="bg-white rounded-lg shadow-xl p-12 max-w-md w-full text-center"><div class="text-6xl mb-4">❌</div><h1 class="text-2xl font-bold text-gray-900 mb-2">Error</h1><p class="text-gray-600 mb-4">' + error.message + '</p><a href="/" class="inline-block bg-indigo-600 text-white py-2 px-6 rounded-lg font-semibold hover:bg-indigo-700 transition">Go Home</a></div></div>';
            }
          }

          redirect();
        `,
        }}
      />

      <style
        dangerouslySetInnerHTML={{
          __html: `
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
          .animate-spin {
            animation: spin 1s linear infinite;
          }
        `,
        }}
      />
    </div>,
  );
});

// API Proxy Routes
// POST /api/shorten - Create short URL
app.post("/api/shorten", async (c) => {
  try {
    const body = await c.req.json();
    const apiEndpoint =
      c.env.API_ENDPOINT || "https://shortin-api.yehezgun.com";

    const response = await fetch(`${apiEndpoint}/shorten`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const data = await response.json();
    return c.json(data, response.status);
  } catch (error) {
    return c.json({ error: "Failed to shorten URL" }, 500);
  }
});

// GET /api/:code - Get original URL
app.get("/api/:code", async (c) => {
  try {
    const code = c.req.param("code");
    const apiEndpoint =
      c.env.API_ENDPOINT || "https://shortin-api.yehezgun.com";

    const response = await fetch(`${apiEndpoint}/${code}`);
    const data = await response.json();
    return c.json(data, response.status);
  } catch (error) {
    return c.json({ error: "Failed to fetch URL" }, 500);
  }
});

// GET /api/:code/stats - Get visit stats
app.get("/api/:code/stats", async (c) => {
  try {
    const code = c.req.param("code");
    const apiEndpoint =
      c.env.API_ENDPOINT || "https://shortin-api.yehezgun.com";

    const response = await fetch(`${apiEndpoint}/api/${code}/stats`);
    const data = await response.json();
    return c.json(data, response.status);
  } catch (error) {
    return c.json({ error: "Failed to fetch stats" }, 500);
  }
});

// PUT /api/:code - Update destination URL
app.put("/api/:code", async (c) => {
  try {
    const code = c.req.param("code");
    const body = await c.req.json();
    const apiEndpoint =
      c.env.API_ENDPOINT || "https://shortin-api.yehezgun.com";

    const response = await fetch(`${apiEndpoint}/${code}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const data = await response.json();
    return c.json(data, response.status);
  } catch (error) {
    return c.json({ error: "Failed to update URL" }, 500);
  }
});

// DELETE /api/:code - Delete short URL
app.delete("/api/:code", async (c) => {
  try {
    const code = c.req.param("code");
    const apiEndpoint =
      c.env.API_ENDPOINT || "https://shortin-api.yehezgun.com";

    const response = await fetch(`${apiEndpoint}/api/${code}`, {
      method: "DELETE",
    });

    const data = await response.json();
    return c.json(data, response.status);
  } catch (error) {
    return c.json({ error: "Failed to delete URL" }, 500);
  }
});

export default app;
