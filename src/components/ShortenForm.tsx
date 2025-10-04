import { useState } from 'hono/jsx'

export default function ShortenForm() {
  const [url, setUrl] = useState('')
  const [shortCodeInput, setShortCodeInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState('')
  const [warning, setWarning] = useState('')
  const [copied, setCopied] = useState(false)

  const handleSubmit = async (e: Event) => {
    e.preventDefault()
    
    // Reset states
    setResult(null)
    setError('')
    setWarning('')
    setLoading(true)

    try {
      const response = await fetch('/api/shorten', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          url, 
          shortCodeInput: shortCodeInput || undefined 
        })
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to shorten URL')
      }
      
      setResult(data)
      
      // Check if there's a warning about old code
      if (data.warning) {
        setWarning(data.warning)
      }
      
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleCopy = async () => {
    if (!result) return
    
    const shortUrl = window.location.origin + '/r/' + result.shortCode
    try {
      await navigator.clipboard.writeText(shortUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  const shortUrl = result ? window.location.origin + '/r/' + result.shortCode : ''

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
            value={url}
            onInput={(e) => setUrl((e.target as HTMLInputElement).value)}
            class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
          />
        </div>
        
        <div>
          <label for="shortCodeInput" class="block text-sm font-medium text-gray-700 mb-2">
            Custom Short Code (optional)
          </label>
          <input
            type="text"
            id="shortCodeInput"
            placeholder="custom123"
            pattern="[a-zA-Z0-9-_]+"
            value={shortCodeInput}
            onInput={(e) => setShortCodeInput((e.target as HTMLInputElement).value)}
            class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
          />
          <p class="mt-1 text-xs text-gray-500">Only letters, numbers, hyphens, and underscores</p>
        </div>
        
        <button
          type="submit"
          disabled={loading}
          class="w-full bg-indigo-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Shortening...' : 'Shorten URL'}
        </button>
      </form>
      
      {result && (
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
              class={`px-4 py-2 ${copied ? 'bg-green-800' : 'bg-green-600'} text-white rounded-lg font-semibold hover:bg-green-700 transition`}
            >
              {copied ? 'Copied!' : 'Copy'}
            </button>
          </div>
          <div class="mt-3 text-sm text-gray-600">
            Created: {new Date(result.createdAt).toLocaleString()} | Clicks: {result.count}
          </div>
        </div>
      )}
      
      {warning && (
        <div class="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p class="text-yellow-800 flex items-start gap-2">
            <span class="text-xl">⚠️</span>
            <span>{warning}</span>
          </p>
        </div>
      )}
      
      {error && (
        <div class="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p class="text-red-800 flex items-start gap-2">
            <span class="text-xl">❌</span>
            <span>{error}</span>
          </p>
        </div>
      )}
    </div>
  )
}
