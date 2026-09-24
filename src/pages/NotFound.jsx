import { Link } from 'react-router-dom'
import { Logo, Button } from '../components/ui'

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white px-6 text-center">
      <Link to="/" className="mb-10"><Logo /></Link>
      <p className="text-sm font-medium text-brand-600 mb-2">Page not found</p>
      <h1 className="font-display text-2xl font-bold text-ink max-w-sm">
        We couldn\u2019t find the page you were looking for.
      </h1>
      <p className="text-sm text-ink-faint mt-3 max-w-sm">
        It may have been moved, or the link may be incorrect. Check the address, or head back to the homepage.
      </p>
      <Button as={Link} to="/" className="mt-8">Go to homepage</Button>
    </div>
  )
}
