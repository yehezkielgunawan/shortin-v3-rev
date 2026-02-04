import { useReducer } from "hono/jsx";
import { formReducer, initialFormState } from "@/lib/formReducer";
import { generateQRCodePNG, generateQRCodeWithText } from "@/lib/qrcode";

export default function ShortenForm() {
  const [state, dispatch] = useReducer(formReducer, initialFormState);

  const handleSubmit = async (e: Event) => {
    e.preventDefault();

    dispatch({ type: "SUBMIT_START" });

    try {
      const response = await fetch("/api/shorten", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url: state.url,
          shortCodeInput: state.shortCodeInput || undefined,
        }),
      });

      const data = (await response.json()) as any;

      if (!response.ok) {
        throw new Error(data.error || "Failed to shorten URL");
      }

      dispatch({
        type: "SUBMIT_SUCCESS",
        payload: {
          result: data,
          warning: data.warning,
        },
      });
    } catch (err: any) {
      dispatch({ type: "SUBMIT_ERROR", payload: err.message });
    }
  };

  const handleCopy = async () => {
    if (!state.result) return;

    const shortUrl = `${window.location.origin}/${state.result.shortCode}`;
    try {
      await navigator.clipboard.writeText(shortUrl);
      dispatch({ type: "COPY_SUCCESS" });
      setTimeout(() => dispatch({ type: "COPY_RESET" }), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const shortUrl = state.result
    ? `${window.location.origin}/${state.result.shortCode}`
    : "";

  const handleGenerateQRCode = async () => {
    if (!state.result) return;
    
    dispatch({ type: "QR_CODE_START" });
    
    try {
      const qrDataUrl = await generateQRCodePNG(shortUrl, {
        size: 256,
        margin: 2,
        darkColor: '#000000',
        lightColor: '#ffffff',
      });
      dispatch({ type: "QR_CODE_SUCCESS", payload: qrDataUrl });
    } catch (err) {
      console.error("Failed to generate QR code:", err);
      dispatch({ type: "QR_CODE_HIDE" });
    }
  };

  const handleDownloadQRCode = async () => {
    if (!state.qrCodeDataUrl || !state.result) return;
    
    try {
      // Generate QR code image with URL text using Canvas
      const imageWithText = await generateQRCodeWithText(
        state.qrCodeDataUrl,
        shortUrl,
        {
          qrSize: 256,
          padding: 20,
          fontSize: 14,
          fontFamily: "monospace",
          backgroundColor: "#ffffff",
          textColor: "#374151",
        }
      );
      
      const link = document.createElement('a');
      link.download = `qrcode-${state.result.shortCode}.png`;
      link.href = imageWithText;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error("Failed to generate downloadable QR code:", err);
    }
  };

  return (
    <div class="space-y-6">
      <form onSubmit={handleSubmit} class="space-y-6" aria-label="URL shortening form">
        <div>
          <label for="url" class="block text-sm font-medium text-gray-700 mb-2">
            Enter Long URL <span class="text-red-500" aria-hidden="true">*</span>
            <span class="sr-only">(required)</span>
          </label>
          <input
            type="url"
            id="url"
            name="url"
            required
            aria-required="true"
            aria-describedby="url-hint"
            placeholder="https://example.com/long/url"
            value={state.url}
            onInput={(e) =>
              dispatch({
                type: "SET_URL",
                payload: (e.target as HTMLInputElement).value,
              })
            }
            class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
          />
          <p id="url-hint" class="sr-only">
            Enter the full URL you want to shorten, including https://
          </p>
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
            placeholder="Leave empty for random code"
            pattern="[a-zA-Z0-9-_]+"
            aria-describedby="shortcode-hint"
            value={state.shortCodeInput}
            onInput={(e) =>
              dispatch({
                type: "SET_SHORT_CODE",
                payload: (e.target as HTMLInputElement).value,
              })
            }
            class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
          />
          <p id="shortcode-hint" class="mt-1 text-xs text-gray-500">
            Only letters, numbers, hyphens, and underscores. Leave empty for a random code.
          </p>
        </div>

        <button
          type="submit"
          disabled={state.loading}
          aria-busy={state.loading}
          class="w-full bg-indigo-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {state.loading ? (
            <>
              <span class="sr-only">Please wait, </span>
              Shortening...
            </>
          ) : (
            "Shorten URL"
          )}
        </button>
      </form>

      {/* Live region for status announcements */}
      <div aria-live="polite" aria-atomic="true" class="sr-only">
        {state.loading && "Shortening your URL, please wait."}
        {state.result && `Success! Your shortened URL is ${shortUrl}`}
        {state.copied && "URL copied to clipboard"}
      </div>

      {state.result && (
        <section 
          class="mt-8 p-6 bg-green-50 border border-green-200 rounded-lg"
          aria-labelledby="success-heading"
        >
          <h2 id="success-heading" class="text-lg font-semibold text-green-900 mb-3">
            <span aria-hidden="true">✓ </span>
            URL Shortened Successfully
          </h2>
          <div class="flex items-center gap-2">
            <label for="shortened-url" class="sr-only">
              Your shortened URL
            </label>
            <input
              type="text"
              id="shortened-url"
              value={shortUrl}
              readonly
              aria-readonly="true"
              class="flex-1 px-4 py-2 bg-white border border-green-300 rounded-lg text-gray-900 font-mono text-sm"
            />
            <button
              type="button"
              onClick={handleCopy}
              aria-label={state.copied ? "URL copied to clipboard" : "Copy shortened URL to clipboard"}
              class={`px-4 py-2 ${state.copied ? "bg-green-800" : "bg-green-600"} text-white rounded-lg font-semibold hover:bg-green-700 transition`}
            >
              {state.copied ? "Copied!" : "Copy"}
            </button>
          </div>
          <p class="mt-3 text-sm text-gray-600">
            <span class="sr-only">URL details: </span>
            Created: <time datetime={state.result.createdAt}>{new Date(state.result.createdAt).toLocaleString()}</time>
            <span aria-hidden="true"> | </span>
            <span class="sr-only">, </span>
            Clicks: {state.result.count}
          </p>

          {/* QR Code Button */}
          <div class="mt-4 pt-4 border-t border-green-200">
            <button
              type="button"
              onClick={handleGenerateQRCode}
              disabled={state.qrCodeLoading}
              aria-busy={state.qrCodeLoading}
              class="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {state.qrCodeLoading ? (
                <>
                  <svg class="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Generating...
                </>
              ) : (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                  </svg>
                  {state.showQrCode && state.qrCodeDataUrl ? "Regenerate QR Code" : "Generate QR Code"}
                </>
              )}
            </button>
          </div>

          {/* QR Code Display */}
          {state.showQrCode && state.qrCodeDataUrl && (
            <div class="mt-4 flex flex-col items-center gap-4">
              <div class="p-4 bg-white rounded-lg shadow-sm border border-gray-200 flex flex-col items-center">
                <img 
                  src={state.qrCodeDataUrl} 
                  alt={`QR Code for ${shortUrl}`}
                  class="w-64 h-64"
                />
                <p class="mt-3 text-sm text-gray-700 font-mono break-all text-center max-w-[256px]">
                  {shortUrl}
                </p>
              </div>
              <button
                type="button"
                onClick={handleDownloadQRCode}
                class="inline-flex items-center gap-2 px-4 py-2 bg-gray-800 text-white rounded-lg font-semibold hover:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition"
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Download QR Code
              </button>
            </div>
          )}
        </section>
      )}

      {state.warning && (
        <div 
          role="alert" 
          aria-live="polite"
          class="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg"
        >
          <p class="text-yellow-800 flex items-start gap-2">
            <span aria-hidden="true" class="text-xl">⚠️</span>
            <span>
              <span class="sr-only">Warning: </span>
              {state.warning}
            </span>
          </p>
        </div>
      )}

      {state.error && (
        <div 
          role="alert" 
          aria-live="assertive"
          class="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg"
        >
          <p class="text-red-800 flex items-start gap-2">
            <span aria-hidden="true" class="text-xl">❌</span>
            <span>
              <span class="sr-only">Error: </span>
              {state.error}
            </span>
          </p>
        </div>
      )}
    </div>
  );
}
