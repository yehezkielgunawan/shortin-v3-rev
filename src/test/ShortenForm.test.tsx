import { render } from "hono/jsx/dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import ShortenForm from "@/components/ShortenForm";
import { generateQRCodePNG, generateQRCodeWithText } from "@/lib/qrcode";

vi.mock("@/lib/qrcode", () => ({
  generateQRCodePNG: vi.fn(),
  generateQRCodeWithText: vi.fn(),
}));

describe("ShortenForm result actions", () => {
  const shortUrl = "http://localhost:3000/reused";
  const oldImage = "data:image/png;base64,b2xk";
  const newImage = "data:image/png;base64,bmV3";
  const fetchMock = vi.fn<typeof fetch>();
  const copy = vi.mocked(navigator.clipboard.writeText);
  const generate = vi.mocked(generateQRCodePNG);
  const prepareDownload = vi.mocked(generateQRCodeWithText);
  let container: HTMLDivElement;

  beforeEach(() => {
    vi.useFakeTimers();
    vi.stubGlobal("fetch", fetchMock);
    copy.mockResolvedValue(undefined);
    container = document.createElement("div");
    document.body.append(container);
    render(<ShortenForm />, container);
  });

  afterEach(() => {
    container.remove();
    vi.useRealTimers();
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
    vi.resetAllMocks();
  });

  async function submit(name: string) {
    const url = `https://example.com/${name}`;
    fetchMock.mockResolvedValueOnce(Response.json({
      id: name,
      url,
      shortCode: "reused",
      createdAt: "2026-11-26T00:00:00.000Z",
      updatedAt: "2026-11-26T00:00:00.000Z",
      count: 0,
    }, { status: 201 }));

    const input = container.querySelector<HTMLInputElement>("#url")!;
    input.value = url;
    input.dispatchEvent(new Event("input", { bubbles: true }));
    await vi.advanceTimersByTimeAsync(0);
    container.querySelector<HTMLButtonElement>('button[type="submit"]')!.click();
    await vi.advanceTimersByTimeAsync(0);
  }

  function copyButton() {
    return container.querySelector<HTMLButtonElement>('button[aria-label*="clipboard"]')!;
  }

  function qrButton() {
    return [...container.querySelectorAll<HTMLButtonElement>("button")].find(
      (button) => /^(Generate QR Code|Regenerate QR Code|Generating\.\.\.)$/.test(
        button.textContent?.trim() ?? "",
      ),
    )!;
  }

  function downloadButton() {
    return [...container.querySelectorAll<HTMLButtonElement>("button")].find(
      (button) => button.textContent?.trim() === "Download QR Code",
    )!;
  }

  it("shows a visible label for the generated link", async () => {
    await submit("first");
    const label = container.querySelector<HTMLLabelElement>('label[for="shortened-url"]');
    expect(label?.textContent).toContain("Your shortened URL");
    expect(label?.classList.contains("sr-only")).toBe(false);
  });

  it("ignores a clipboard write that finishes after a new result", async () => {
    const previousCopy = Promise.withResolvers<void>();
    copy.mockReturnValueOnce(previousCopy.promise);
    await submit("first");
    copyButton().click();
    await submit("second");

    previousCopy.resolve();
    await vi.advanceTimersByTimeAsync(0);
    expect(copyButton().getAttribute("aria-label")).toBe("Copy shortened URL to clipboard");
  });

  it("resets copy confirmation and lets the next result keep its own timeout", async () => {
    await submit("first");
    copyButton().click();
    await vi.advanceTimersByTimeAsync(1000);
    expect(copyButton().getAttribute("aria-label")).toBe("URL copied to clipboard");

    await submit("second");
    expect(copyButton().getAttribute("aria-label")).toBe("Copy shortened URL to clipboard");
    copyButton().click();
    await vi.advanceTimersByTimeAsync(1000);
    expect(copy).toHaveBeenLastCalledWith(shortUrl);
    expect(copyButton().getAttribute("aria-label")).toBe("URL copied to clipboard");
    await vi.advanceTimersByTimeAsync(1000);
    expect(copyButton().getAttribute("aria-label")).toBe("Copy shortened URL to clipboard");
  });

  it.each(["resolves", "rejects"])("keeps the current QR request pending when the previous one %s", async (outcome) => {
    const previousQr = Promise.withResolvers<string>();
    const currentQr = Promise.withResolvers<string>();
    generate.mockReturnValueOnce(previousQr.promise).mockReturnValueOnce(currentQr.promise);
    await submit("first");
    qrButton().click();
    await submit("second");
    expect(qrButton().disabled).toBe(false);
    qrButton().click();
    await vi.advanceTimersByTimeAsync(0);

    if (outcome === "resolves") previousQr.resolve(oldImage);
    else previousQr.reject(new Error("QR generation failed"));
    await vi.advanceTimersByTimeAsync(0);
    expect(qrButton().disabled).toBe(true);
    expect(container.querySelector("img")).toBeNull();

    currentQr.resolve(newImage);
    await vi.advanceTimersByTimeAsync(0);
    expect(generate).toHaveBeenLastCalledWith(shortUrl, expect.any(Object));
    expect(container.querySelector("img")?.getAttribute("src")).toBe(newImage);
  });

  it("downloads the current QR image and ignores a superseded download", async () => {
    const previousDownload = Promise.withResolvers<string>();
    const downloads: Array<{ filename: string; href: string }> = [];
    vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(function (
      this: HTMLAnchorElement,
    ) {
      downloads.push({ filename: this.download, href: this.href });
    });
    generate.mockResolvedValueOnce(oldImage).mockResolvedValueOnce(newImage);
    prepareDownload
      .mockReturnValueOnce(previousDownload.promise)
      .mockResolvedValueOnce(newImage);

    await submit("first");
    qrButton().click();
    await vi.advanceTimersByTimeAsync(0);
    downloadButton().click();

    await submit("second");
    expect(container.querySelector("img")).toBeNull();
    qrButton().click();
    await vi.advanceTimersByTimeAsync(0);
    downloadButton().click();
    await vi.advanceTimersByTimeAsync(0);
    previousDownload.resolve(oldImage);
    await vi.advanceTimersByTimeAsync(0);

    expect(prepareDownload).toHaveBeenLastCalledWith(newImage, shortUrl, expect.any(Object));
    expect(downloads).toEqual([{ filename: "qrcode-reused.png", href: newImage }]);
  });
});
