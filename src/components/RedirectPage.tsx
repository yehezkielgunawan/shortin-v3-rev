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
      <section class="status-page" aria-labelledby="error-heading">
          <p class="eyebrow">Shortin / Link</p>
          <h1 id="error-heading">
            {notFound ? "Link Not Found" : "Unable to load this link"}
          </h1>
          <p class="status-description" role="alert">
            {notFound
              ? "Short code not found."
              : "Please try opening this link again in a moment."}
          </p>
          <a
            href="/"
            class="primary-button status-action"
          >
            Back to Shortin
          </a>
      </section>
    );
  }

  return (
    <section class="status-page" aria-labelledby="redirect-heading">
        <p class="eyebrow">Shortin / Link</p>

        <div class="sr-only" role="status" aria-live="polite" aria-atomic="true">
          {state.status === "loading"
            ? "Looking up link…"
            : `Redirecting you to your destination in ${state.seconds} ${state.seconds === 1 ? "second" : "seconds"}.`}
        </div>

        <h1 id="redirect-heading">
          {state.status === "loading" ? "Looking up link…" : "Redirecting..."}
        </h1>
        <p class="status-description">
          Please wait while we take you to your destination.
        </p>

        {state.status === "redirecting" && (
          <p class="countdown" aria-hidden="true">
            Redirecting in {state.seconds}s
          </p>
        )}
        <div class="progress-track" aria-hidden="true"><div class="progress-indicator"></div></div>
    </section>
  );
}
