import { useLayoutEffect, useState } from "hono/jsx";

interface RedirectPageProps {
  code: string;
}

type RedirectState =
  | { status: "loading" }
  | { status: "redirecting"; seconds: number }
  | { status: "not-found" }
  | { status: "error" };

export default function RedirectPage({ code }: RedirectPageProps) {
  const [state, setState] = useState<RedirectState>({ status: "loading" });

  useLayoutEffect(() => {
    const controller = new AbortController();
    const { signal } = controller;
    let countdownTimer: ReturnType<typeof setTimeout> | undefined;
    let navigationTimer: ReturnType<typeof setTimeout> | undefined;
    setState({ status: "loading" });

    async function lookUpDestination() {
      try {
        const response = await fetch("/api/" + code, { signal });
        if (signal.aborted) return;

        if (!response.ok) {
          setState({ status: response.status === 404 ? "not-found" : "error" });
          return;
        }

        const data = (await response.json()) as { url?: unknown } | null;
        if (signal.aborted) return;

        const destination = data?.url;
        if (typeof destination !== "string" || !destination.trim()) {
          setState({ status: "error" });
          return;
        }

        setState({ status: "redirecting", seconds: 2 });
        countdownTimer = setTimeout(() => {
          setState({ status: "redirecting", seconds: 1 });
        }, 1000);
        navigationTimer = setTimeout(() => {
          window.location.href = destination;
        }, 2000);
      } catch {
        if (!signal.aborted) setState({ status: "error" });
      }
    }

    void lookUpDestination();

    return () => {
      controller.abort();
      clearTimeout(countdownTimer);
      clearTimeout(navigationTimer);
    };
  }, [code]);

  if (state.status === "not-found" || state.status === "error") {
    const notFound = state.status === "not-found";
    return (
      <main
        class="min-h-screen bg-linear-to-br from-red-50 to-pink-100 flex items-center justify-center px-4"
        role="main"
        aria-labelledby="error-heading"
      >
        <div class="bg-white rounded-lg shadow-xl p-12 max-w-md w-full text-center">
          <div aria-hidden="true" class="text-6xl mb-4">❌</div>
          <h1 id="error-heading" class="text-2xl font-bold text-gray-900 mb-2">
            {notFound ? "Link Not Found" : "Unable to load this link"}
          </h1>
          <p class="text-gray-600 mb-6" role="alert">
            {notFound
              ? "Short code not found."
              : "Please try opening this link again in a moment."}
          </p>
          <a
            href="/"
            class="inline-block bg-indigo-600 text-white py-3 px-8 rounded-lg font-semibold hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition"
          >
            Go to Homepage
          </a>
        </div>
      </main>
    );
  }

  return (
    <main
      class="min-h-screen bg-linear-to-br from-indigo-50 to-purple-100 flex items-center justify-center px-4"
      role="main"
      aria-labelledby="redirect-heading"
    >
      <div class="bg-white rounded-lg shadow-xl p-12 max-w-md w-full text-center">
        <div class="mb-6" aria-hidden="true">
          <div
            class="inline-block animate-spin rounded-full h-16 w-16 border-4 border-gray-200 border-t-indigo-600"
          ></div>
        </div>

        <div class="sr-only" role="status" aria-live="polite" aria-atomic="true">
          {state.status === "loading"
            ? "Looking up link…"
            : `Redirecting you to your destination in ${state.seconds} ${state.seconds === 1 ? "second" : "seconds"}.`}
        </div>

        <h1 id="redirect-heading" class="text-2xl font-bold text-gray-900 mb-2">
          {state.status === "loading" ? "Looking up link…" : "Redirecting..."}
        </h1>
        <p class="text-gray-600 mb-4">
          Please wait while we take you to your destination.
        </p>

        {state.status === "redirecting" && (
          <p class="text-sm text-indigo-600 font-medium" aria-hidden="true">
            Redirecting in {state.seconds}s
          </p>
        )}
      </div>
    </main>
  );
}
