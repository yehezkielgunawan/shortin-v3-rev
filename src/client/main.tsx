import { render } from 'hono/jsx/dom'
import ShortenForm from '@/components/ShortenForm'

const container = document.getElementById('shorten-form-container')
if (container) {
  render(<ShortenForm />, container)
}
