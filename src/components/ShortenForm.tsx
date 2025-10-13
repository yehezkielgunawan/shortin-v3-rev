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

    const shortUrl = window.location.origin + state.result.shortCode;
    try {
      await navigator.clipboard.writeText(shortUrl);
      dispatch({ type: "COPY_SUCCESS" });
      setTimeout(() => dispatch({ type: "COPY_RESET" }), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const shortUrl = state.result
    ? window.location.origin + state.result.shortCode
    : "";

  return (
    <div class="space-y-6">
      <form onSubmit={handleSubmit} class="space-y-6">
        <div>
          <label for="url" class="block text-sm font-medium text-gray-700 mb-2">
            Enter Long URL
          </label>
          <input
            type="url"
            id="url"
            required
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
            placeholder="custom123"
            pattern="[a-zA-Z0-9-_]+"
            value={state.shortCodeInput}
            onInput={(e) =>
              dispatch({
                type: "SET_SHORT_CODE",
                payload: (e.target as HTMLInputElement).value,
              })
            }
            class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
          />
          <p class="mt-1 text-xs text-gray-500">
            Only letters, numbers, hyphens, and underscores
          </p>
        </div>

        <button
          type="submit"
          disabled={state.loading}
          class="w-full bg-indigo-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {state.loading ? "Shortening..." : "Shorten URL"}
        </button>
      </form>

      {state.result && (
        <div class="mt-8 p-6 bg-green-50 border border-green-200 rounded-lg">
          <h3 class="text-lg font-semibold text-green-900 mb-3">Success!</h3>
          <div class="flex items-center gap-2">
            <input
              type="text"
              value={shortUrl}
              readonly
              class="flex-1 px-4 py-2 bg-white border border-green-300 rounded-lg text-gray-900 font-mono text-sm"
            />
            <button
              onClick={handleCopy}
              class={`px-4 py-2 ${state.copied ? "bg-green-800" : "bg-green-600"} text-white rounded-lg font-semibold hover:bg-green-700 transition`}
            >
              {state.copied ? "Copied!" : "Copy"}
            </button>
          </div>
          <div class="mt-3 text-sm text-gray-600">
            Created: {new Date(state.result.createdAt).toLocaleString()} |
            Clicks: {state.result.count}
          </div>
        </div>
      )}

      {state.warning && (
        <div class="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p class="text-yellow-800 flex items-start gap-2">
            <span class="text-xl">⚠️</span>
            <span>{state.warning}</span>
          </p>
        </div>
      )}

      {state.error && (
        <div class="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p class="text-red-800 flex items-start gap-2">
            <span class="text-xl">❌</span>
            <span>{state.error}</span>
          </p>
        </div>
      )}
    </div>
  );
}
