import { useState, useEffect } from "hono/jsx";

interface RedirectPageProps {
  code: string;
}

export default function RedirectPage({ code }: RedirectPageProps) {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function redirect() {
      try {
        const response = await fetch("/api/" + code);
        const data = await response.json();

        if (!mounted) return;

        if (response.ok && data.url) {
          setTimeout(() => {
            if (mounted) {
              window.location.href = data.url;
            }
          }, 2000);
        } else {
          throw new Error(data.error || "Short code not found");
        }
      } catch (err: any) {
        if (mounted) {
          setError(err.message);
          setLoading(false);
        }
      }
    }

    redirect();

    return () => {
      mounted = false;
    };
  }, [code]);

  if (error) {
    return (
      <div class="min-h-screen bg-gradient-to-br from-red-50 to-pink-100 flex items-center justify-center px-4">
        <div class="bg-white rounded-lg shadow-xl p-12 max-w-md w-full text-center">
          <div class="text-6xl mb-4">❌</div>
          <h1 class="text-2xl font-bold text-gray-900 mb-2">Error</h1>
          <p class="text-gray-600 mb-4">{error}</p>
          <a
            href="/"
            class="inline-block bg-indigo-600 text-white py-2 px-6 rounded-lg font-semibold hover:bg-indigo-700 transition"
          >
            Go Home
          </a>
        </div>
      </div>
    );
  }

  return (
    <div class="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-100 flex items-center justify-center px-4">
      <div class="bg-white rounded-lg shadow-xl p-12 max-w-md w-full text-center">
        <div class="mb-6">
          <div class="inline-block animate-spin rounded-full h-16 w-16 border-4 border-gray-200 border-t-indigo-600"></div>
        </div>
        <h1 class="text-2xl font-bold text-gray-900 mb-2">Redirecting...</h1>
        <p class="text-gray-600">
          Please wait while we take you to your destination.
        </p>
      </div>
    </div>
  );
}
