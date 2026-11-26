import { render } from "hono/jsx/dom";
import { useState } from "hono/jsx";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import RedirectPage from "@/components/RedirectPage";

describe("RedirectPage", () => {
  const home = "http://localhost:3000";
  const destination = "https://example.com/destination";
  let container: HTMLDivElement;
  let fetchMock: ReturnType<typeof vi.fn<typeof fetch>>;

  beforeEach(() => {
    vi.useFakeTimers({
      toFake: [
        "setTimeout",
        "clearTimeout",
        "setInterval",
        "clearInterval",
        "requestAnimationFrame",
        "cancelAnimationFrame",
      ],
    });
    fetchMock = vi.fn<typeof fetch>();
    vi.stubGlobal("fetch", fetchMock);
    window.location.href = home;
    container = document.createElement("div");
    document.body.append(container);
  });

  afterEach(() => {
    render(<></>, container);
    container.remove();
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  it("starts the two-second countdown only after the lookup succeeds", async () => {
    const lookup = Promise.withResolvers<Response>();
    fetchMock.mockReturnValueOnce(lookup.promise);
    render(<RedirectPage code="first" />, container);

    await vi.advanceTimersByTimeAsync(3000);
    expect(container.querySelector("h1")?.textContent).toBe("Looking up link…");
    expect(container.textContent).not.toContain("Redirecting in");
    expect(window.location.href).toBe(home);

    lookup.resolve(Response.json({ url: destination }));
    await vi.advanceTimersByTimeAsync(0);
    expect(container.textContent).toContain("Redirecting in 2s");

    await vi.advanceTimersByTimeAsync(1000);
    expect(container.textContent).toContain("Redirecting in 1s");
    await vi.advanceTimersByTimeAsync(999);
    expect(window.location.href).toBe(home);
    await vi.advanceTimersByTimeAsync(1);
    expect(window.location.href).toBe(destination);
  });

  it.each([
    { status: 404, heading: "Link Not Found" },
    { status: 500, heading: "Unable to load this link" },
    { status: 200, heading: "Unable to load this link" },
  ])("shows the appropriate error for HTTP $status without a destination", async ({ status, heading }) => {
    fetchMock.mockResolvedValueOnce(Response.json({}, { status }));
    render(<RedirectPage code="first" />, container);

    await vi.advanceTimersByTimeAsync(3000);
    expect(container.querySelector("h1")?.textContent).toBe(heading);
    expect(container.querySelector("a")?.getAttribute("href")).toBe("/");
    expect(window.location.href).toBe(home);
  });

  it("shows a lookup error when the request fails", async () => {
    fetchMock.mockRejectedValueOnce(new TypeError("Failed to fetch"));
    render(<RedirectPage code="first" />, container);

    await vi.advanceTimersByTimeAsync(3000);
    expect(container.querySelector("h1")?.textContent).toBe("Unable to load this link");
    expect(window.location.href).toBe(home);
  });

  it("aborts an old lookup when the code changes and ignores its late response", async () => {
    const firstLookup = Promise.withResolvers<Response>();
    fetchMock.mockReturnValueOnce(firstLookup.promise);
    fetchMock.mockResolvedValueOnce(Response.json({}, { status: 404 }));

    function Example() {
      const [code, setCode] = useState("first");
      return (
        <>
          <button onClick={() => setCode("second")}>Change code</button>
          <RedirectPage code={code} />
        </>
      );
    }

    render(<Example />, container);
    await vi.advanceTimersByTimeAsync(20);
    const firstSignal = fetchMock.mock.calls[0]?.[1]?.signal;
    container.querySelector("button")?.click();
    await vi.advanceTimersByTimeAsync(20);

    expect(firstSignal?.aborted).toBe(true);
    expect(fetchMock.mock.calls[1]?.[0]).toBe("/api/second");
    firstLookup.resolve(Response.json({ url: destination }));
    await vi.advanceTimersByTimeAsync(3000);
    expect(container.querySelector("h1")?.textContent).toBe("Link Not Found");
    expect(window.location.href).toBe(home);
  });

  it.each(["lookup", "countdown"])("cleans up when unmounted during %s", async (phase) => {
    const lookup = Promise.withResolvers<Response>();
    fetchMock.mockReturnValueOnce(lookup.promise);

    function Example() {
      const [visible, setVisible] = useState(true);
      return (
        <>
          <button onClick={() => setVisible(false)}>Unmount redirect</button>
          {visible && <RedirectPage code="first" />}
        </>
      );
    }

    render(<Example />, container);
    await vi.advanceTimersByTimeAsync(20);
    const signal = fetchMock.mock.calls[0]?.[1]?.signal;
    if (phase === "countdown") {
      lookup.resolve(Response.json({ url: destination }));
      await vi.advanceTimersByTimeAsync(0);
      expect(container.textContent).toContain("Redirecting in 2s");
    }

    container.querySelector("button")?.click();
    await vi.advanceTimersByTimeAsync(0);

    expect(container.querySelector("h1")).toBeNull();
    expect(signal?.aborted).toBe(true);
    expect(vi.getTimerCount()).toBe(0);
    if (phase === "lookup") lookup.resolve(Response.json({ url: destination }));
    await vi.advanceTimersByTimeAsync(3000);
    expect(window.location.href).toBe(home);
  });
});
