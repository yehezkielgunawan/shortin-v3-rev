import { useReducer, useRef } from "hono/jsx";
import { formReducer, initialFormState } from "@/lib/formReducer";
import { generateQRCodePNG, generateQRCodeWithText } from "@/lib/qrcode";

export default function ShortenForm() {
  const [state, dispatch] = useReducer(formReducer, initialFormState);
  const latestSubmission = useRef(0);
  const copyResetTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const resultSubmission = latestSubmission.current;
  const shortUrl = state.result
    ? `${window.location.origin}/${state.result.shortCode}`
    : "";

  const handleSubmit = async (e: Event) => {
    e.preventDefault();

    const submission = ++latestSubmission.current;
    clearTimeout(copyResetTimer.current);
    copyResetTimer.current = undefined;
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
      if (submission !== latestSubmission.current) return;

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
      if (submission !== latestSubmission.current) return;
      dispatch({ type: "SUBMIT_ERROR", payload: err.message });
    }
  };

  const handleCopy = async () => {
    if (!state.result) return;

    try {
      await navigator.clipboard.writeText(shortUrl);
      if (resultSubmission !== latestSubmission.current) return;

      dispatch({ type: "COPY_SUCCESS" });
      clearTimeout(copyResetTimer.current);
      copyResetTimer.current = setTimeout(() => {
        copyResetTimer.current = undefined;
        dispatch({ type: "COPY_RESET" });
      }, 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

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
      if (resultSubmission !== latestSubmission.current) return;
      dispatch({ type: "QR_CODE_SUCCESS", payload: qrDataUrl });
    } catch (err) {
      if (resultSubmission !== latestSubmission.current) return;
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
      if (resultSubmission !== latestSubmission.current) return;

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
    <div class="form-area">
      <form onSubmit={handleSubmit} class="shorten-form" aria-label="URL shortening form">
        <div>
          <label for="url" class="field-label">
            Destination URL <span class="required-mark" aria-hidden="true">*</span>
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
            class="text-field"
          />
          <p id="url-hint" class="sr-only">
            Enter the full URL you want to shorten, including https://
          </p>
        </div>

        <div>
          <label
            for="shortCodeInput"
            class="field-label"
          >
            Custom code <span class="optional-label">Optional</span>
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
            class="text-field"
          />
          <p id="shortcode-hint" class="field-hint">
            Only letters, numbers, hyphens, and underscores. Leave empty for a random code.
          </p>
        </div>

        <button
          type="submit"
          disabled={state.loading}
          aria-busy={state.loading}
          class="primary-button submit-button"
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
          class="result-panel"
          aria-labelledby="success-heading"
        >
          <h2 id="success-heading" class="result-heading">
            Your link is ready.
          </h2>
          <label for="shortened-url" class="field-label">Your shortened URL</label>
          <div class="result-row">
            <input
              type="text"
              id="shortened-url"
              value={shortUrl}
              readonly
              aria-readonly="true"
              class="text-field result-url"
            />
            <button
              type="button"
              onClick={handleCopy}
              aria-label={state.copied ? "URL copied to clipboard" : "Copy shortened URL to clipboard"}
              class="primary-button copy-button"
            >
              {state.copied ? "Copied!" : "Copy"}
            </button>
          </div>
          <p class="result-details">
            <span class="sr-only">URL details: </span>
            Created: <time datetime={state.result.createdAt}>{new Date(state.result.createdAt).toLocaleString()}</time>
            <span aria-hidden="true"> | </span>
            <span class="sr-only">, </span>
            Clicks: {state.result.count}
          </p>

          {/* QR Code Button */}
          <div class="qr-actions">
            <button
              type="button"
              onClick={handleGenerateQRCode}
              disabled={state.qrCodeLoading}
              aria-busy={state.qrCodeLoading}
              class="secondary-button"
            >
              {state.qrCodeLoading ? (
                <>
                  <svg aria-hidden="true" class="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Generating...
                </>
              ) : (
                <>
                  <svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                  </svg>
                  {state.showQrCode && state.qrCodeDataUrl ? "Regenerate QR Code" : "Generate QR Code"}
                </>
              )}
            </button>
          </div>

          {/* QR Code Display */}
          {state.showQrCode && state.qrCodeDataUrl && (
            <div class="qr-display">
              <div class="qr-image">
                <img 
                  src={state.qrCodeDataUrl} 
                  alt={`QR Code for ${shortUrl}`}
                  width="256"
                  height="256"
                  class="qr-code"
                />
                <p class="qr-url">
                  {shortUrl}
                </p>
              </div>
              <button
                type="button"
                onClick={handleDownloadQRCode}
                class="secondary-button"
              >
                <svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
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
          class="feedback feedback-warning"
        >
          <p>
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
          class="feedback feedback-error"
        >
          <p>
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
