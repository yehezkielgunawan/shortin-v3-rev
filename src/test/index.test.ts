import { describe, it, expect, vi, afterEach } from "vitest";
import app from "@/index";

describe("Hono App Routes", () => {
  describe("GET / - Main Page", () => {
    it("should return the main page with 200 status", async () => {
      const res = await app.request("/");

      expect(res.status).toBe(200);
      const html = await res.text();
      expect(html).toContain("URL Shortener");
      expect(html).toContain("shorten-form-container");
    });

    it("should include page title", async () => {
      const res = await app.request("/");

      const html = await res.text();
      expect(html).toContain("Shortin - URL Shortener");
    });

    it("should include accessibility attributes", async () => {
      const res = await app.request("/");

      const html = await res.text();
      expect(html).toContain('role="main"');
      expect(html).toContain('id="main-content"');
      expect(html).toContain('lang="en"');
    });

    it("should include semantic HTML structure", async () => {
      const res = await app.request("/");

      const html = await res.text();
      expect(html).toContain("<main");
      expect(html).toContain("<article");
      expect(html).toContain("<header");
      expect(html).toContain("<footer");
    });

    it("should include skip link for keyboard navigation", async () => {
      const res = await app.request("/");

      const html = await res.text();
      expect(html).toContain('href="#main-content"');
      expect(html).toContain("Skip to main content");
    });

    it("should include client script for form hydration", async () => {
      const res = await app.request("/");

      const html = await res.text();
      expect(html).toContain('/src/client/main.tsx');
      expect(html).toContain('type="module"');
    });
  });

  describe("GET /:code - Redirect Page", () => {
    it("should return redirect page with code parameter", async () => {
      const res = await app.request("/abc123");

      expect(res.status).toBe(200);
      const html = await res.text();
      expect(html).toContain("redirect-container");
      expect(html).toContain('data-code="abc123"');
    });

    it("should handle various short codes", async () => {
      const codes = ["test", "my-link", "12345", "a_b_c"];

      for (const code of codes) {
        const res = await app.request(`/${code}`);
        expect(res.status).toBe(200);
        const html = await res.text();
        expect(html).toContain(`data-code="${code}"`);
      }
    });

    it("should include client script for redirect handling", async () => {
      const res = await app.request("/testcode");

      const html = await res.text();
      expect(html).toContain('/src/client/redirect.tsx');
      expect(html).toContain('type="module"');
    });
  });

  describe("API Routes Structure", () => {
    const env = { API_ENDPOINT: "https://shortin-api.example" };
    const url = "https://example.com";

    afterEach(() => vi.unstubAllGlobals());

    it.each([{ url }, { url, shortCodeInput: "" }])(
      "POST /api/shorten lets the backend generate the alias for %j",
      async (body) => {
        const result = {
          id: "id_1",
          url,
          shortCode: "aB3xYz",
          createdAt: "2026-11-26T00:00:00.000Z",
          updatedAt: "2026-11-26T00:00:00.000Z",
          count: 0,
        };
        const fetchMock = vi
          .fn()
          .mockResolvedValue(Response.json(result, { status: 201 }));
        vi.stubGlobal("fetch", fetchMock);

        const res = await app.request(
          "/api/shorten",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
          },
          env,
        );

        expect(fetchMock).toHaveBeenCalledExactlyOnceWith(`${env.API_ENDPOINT}/shorten`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ url }),
        });
        expect(res.status).toBe(201);
        expect(await res.json()).toEqual(result);
      },
    );

    it("POST /api/shorten forwards a custom alias and relays a duplicate-alias error", async () => {
      const body = JSON.stringify({ url, shortCodeInput: "Custom123" });
      const error = { error: "Short code already in use" };
      const fetchMock = vi
        .fn()
        .mockResolvedValue(Response.json(error, { status: 400 }));
      vi.stubGlobal("fetch", fetchMock);

      const res = await app.request(
        "/api/shorten",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body,
        },
        env,
      );

      expect(fetchMock).toHaveBeenCalledExactlyOnceWith(`${env.API_ENDPOINT}/shorten`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body,
      });
      expect(res.status).toBe(400);
      expect(await res.json()).toEqual(error);
    });

    it("GET /api/:code route exists", async () => {
      const res = await app.request("/api/testcode");

      expect(res.status).toBe(500);
      const data = await res.json();
      expect(data.error).toBe("Failed to fetch URL");
    });

    it.each([
      { status: 200, body: { count: 42 } },
      { status: 404, body: { error: "Short code not found" } },
    ])("GET /api/:code/stats relays an upstream $status", async ({ status, body }) => {
      const fetchMock = vi.fn().mockResolvedValue(Response.json(body, { status }));
      vi.stubGlobal("fetch", fetchMock);

      const res = await app.request("/api/testcode/stats", undefined, env);

      expect(fetchMock).toHaveBeenCalledExactlyOnceWith(
        `${env.API_ENDPOINT}/shorten/testcode/stats`,
      );
      expect(res.status).toBe(status);
      expect(await res.json()).toEqual(body);
    });

    it("PUT /api/:code route exists", async () => {
      const res = await app.request("/api/testcode", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: "https://example.com/new" }),
      });

      expect(res.status).toBe(500);
      const data = await res.json();
      expect(data.error).toBe("Failed to update URL");
    });

    it("DELETE /api/:code route exists", async () => {
      const res = await app.request("/api/testcode", {
        method: "DELETE",
      });

      expect(res.status).toBe(500);
      const data = await res.json();
      expect(data.error).toBe("Failed to delete URL");
    });
  });
});
