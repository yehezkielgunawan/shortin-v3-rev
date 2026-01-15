import { Hono } from "hono";
import { renderer } from "@/renderer";
import { Script } from "vite-ssr-components/hono";

type Bindings = {
  API_ENDPOINT: string;
};

const app = new Hono<{ Bindings: Bindings }>();

app.use(renderer);

// Main page
app.get("/", (c) => {
  return c.render(
    <main
      id="main-content"
      class="min-h-screen bg-linear-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8"
      role="main"
    >
      <div class="max-w-2xl mx-auto">
        <article class="bg-white rounded-lg shadow-xl p-8">
          <header class="mb-8 text-center">
            <h1 class="text-4xl font-bold text-gray-900 mb-2">URL Shortener</h1>
            <p class="text-gray-600">Shorten your long URLs instantly</p>
          </header>

          <div
            id="shorten-form-container"
            aria-label="URL shortening form"
          ></div>
        </article>

        <footer class="mt-8 text-center text-sm text-gray-500">
          <p>A simple, fast, and accessible URL shortener.</p>
        </footer>
      </div>

      <Script type="module" src="/src/client/main.tsx" />
    </main>
  );
});

// Redirect page with loading screen
app.get("/:code", async (c) => {
  const code = c.req.param("code");

  return c.render(
    <>
      <div id="redirect-container"></div>

      <Script type="module" src="/src/client/redirect.tsx" data-code={code} />
    </>
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
    return c.json(data, response.status as any);
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
    return c.json(data, response.status as any);
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

    const response = await fetch(`${apiEndpoint}/${code}/stats`);
    const data = await response.json();
    return c.json(data, response.status as any);
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
    return c.json(data, response.status as any);
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

    const response = await fetch(`${apiEndpoint}/${code}`, {
      method: "DELETE",
    });

    const data = await response.json();
    return c.json(data, response.status as any);
  } catch (error) {
    return c.json({ error: "Failed to delete URL" }, 500);
  }
});

export default app;
