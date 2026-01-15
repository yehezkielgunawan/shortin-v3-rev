import { useReducer } from "hono/jsx";

// Define the state shape
interface State {
  url: string;
  shortCodeInput: string;
  loading: boolean;
  result: any | null;
  error: string;
  warning: string;
  copied: boolean;
}

// Define action types
type Action =
  | { type: "SET_URL"; payload: string }
  | { type: "SET_SHORT_CODE"; payload: string }
  | { type: "SUBMIT_START" }
  | { type: "SUBMIT_SUCCESS"; payload: { result: any; warning?: string } }
  | { type: "SUBMIT_ERROR"; payload: string }
  | { type: "COPY_SUCCESS" }
  | { type: "COPY_RESET" }
  | { type: "RESET_MESSAGES" };

// Initial state
const initialState: State = {
  url: "",
  shortCodeInput: "",
  loading: false,
  result: null,
  error: "",
  warning: "",
  copied: false,
};

// Reducer function
function formReducer(state: State, action: Action): State {
  switch (action.type) {
    case "SET_URL":
      return { ...state, url: action.payload };

    case "SET_SHORT_CODE":
      return { ...state, shortCodeInput: action.payload };

    case "SUBMIT_START":
      return {
        ...state,
        loading: true,
        result: null,
        error: "",
        warning: "",
      };

    case "SUBMIT_SUCCESS":
      return {
        ...state,
        loading: false,
        result: action.payload.result,
        warning: action.payload.warning || "",
      };

    case "SUBMIT_ERROR":
      return {
        ...state,
        loading: false,
        error: action.payload,
      };

    case "COPY_SUCCESS":
      return { ...state, copied: true };

    case "COPY_RESET":
      return { ...state, copied: false };

    case "RESET_MESSAGES":
      return { ...state, error: "", warning: "" };

    default:
      return state;
  }
}

export default function ShortenForm() {
  const [state, dispatch] = useReducer(formReducer, initialState);

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
            placeholder="custom123"
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
            Only letters, numbers, hyphens, and underscores
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
