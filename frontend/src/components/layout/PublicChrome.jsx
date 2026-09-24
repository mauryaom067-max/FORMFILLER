import { Link } from 'react-router-dom'
import { Logo, Button } from '../ui'

const links = [
  { label: 'How It Works', href: '#how-it-works' },
  { label: 'Features', href: '#features' },
  { label: 'Security', href: '#security' },
  { label: 'Forms', href: '#forms' },
  { label: 'FAQ', href: '#faq' },
]

export function PublicHeader() {
  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur border-b border-line">
      <div className="max-w-content mx-auto px-8 h-16 flex items-center justify-between">
        <Link to="/"><Logo /></Link>
        <nav className="hidden lg:flex items-center gap-8">
          {links.map((l) => (
            <a key={l.label} href={l.href} className="text-sm text-ink-soft hover:text-ink transition-colors">
              {l.label}
            </a>
          ))}
        </nav>
        <div className="flex items-center gap-3">
          <Link to="/login" className="text-sm font-medium text-ink-soft hover:text-ink hidden sm:block">
            Log in
          </Link>
          <Button as={Link} to="/signup" size="sm">Get Started</Button>
        </div>
      </div>
      <div className="border-t border-line bg-surface">
        <div className="max-w-content mx-auto px-8 py-1.5 flex items-center justify-end gap-5 text-xs text-ink-faint">
          <Link to="/operator/login" className="hover:text-ink-soft">Log in as operator</Link>
          <span className="text-line">|</span>
          <Link to="/admin/login" className="hover:text-ink-soft">Log in as admin</Link>
        </div>
      </div>
    </header>
  )
}

export function PublicFooter() {
  return (
    <footer className="border-t border-line bg-white">
      <div className="max-w-content mx-auto px-8 py-12 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <Logo size="sm" />
        <div className="flex flex-wrap items-center gap-x-8 gap-y-2 text-sm text-ink-soft">
          <a href="#" className="hover:text-ink">Privacy</a>
          <a href="#" className="hover:text-ink">Terms</a>
          <a href="#security" className="hover:text-ink">Security</a>
          <a href="#" className="hover:text-ink">Contact</a>
        </div>
      </div>
      <div className="border-t border-line">
        <p className="max-w-content mx-auto px-8 py-4 text-xs text-ink-faint">
          &copy; 2026 FormFiller. Designed with privacy and security in mind.
        </p>
      </div>
    </footer>
  )
}
