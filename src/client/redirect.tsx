import { render } from 'hono/jsx/dom'
import RedirectPage from '@/components/RedirectPage'

const container = document.getElementById('redirect-container')
const scriptTag = document.querySelector('script[data-code]')
const code = scriptTag?.getAttribute('data-code') || ''

if (container && code) {
  render(<RedirectPage code={code} />, container)
}
