import { NavLink } from 'react-router-dom'
import { Logo } from '../ui'

export function AppShell({ nav, roleLabel, userLabel, userInitials, activeIndicator, children, topRight }) {
  return (
    <div className="min-h-screen flex bg-surface">
      <aside className="w-60 shrink-0 border-r border-line bg-white flex flex-col">
        <div className="h-16 flex items-center px-5 border-b border-line">
          <Logo size="sm" />
        </div>
        <nav className="flex-1 py-4 px-3 space-y-0.5">
          {nav.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive ? 'bg-brand-50 text-brand-600' : 'text-ink-soft hover:bg-surface hover:text-ink'
                }`
              }
            >
              <span className="w-4 h-4">{item.icon}</span>
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="p-3 border-t border-line">
          <div className="flex items-center gap-2.5 px-2 py-2">
            <div className="w-8 h-8 rounded-full bg-ink text-white text-xs font-semibold flex items-center justify-center">
              {userInitials}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-ink truncate">{userLabel}</p>
              <p className="text-xs text-ink-faint">{roleLabel}</p>
            </div>
          </div>
        </div>
      </aside>
      <div className="flex-1 min-w-0 flex flex-col">
        <header className="h-16 border-b border-line bg-white flex items-center justify-between px-8 shrink-0">
          <div>{activeIndicator}</div>
          <div className="flex items-center gap-4">{topRight}</div>
        </header>
        <main className="flex-1 p-8 overflow-y-auto">{children}</main>
      </div>
    </div>
  )
}

export const Icons = {
  home: (
    <svg viewBox="0 0 16 16" fill="none"><path d="M2 7.5 8 2l6 5.5V14a1 1 0 0 1-1 1h-3v-4.5H6V15H3a1 1 0 0 1-1-1V7.5Z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" /></svg>
  ),
  form: (
    <svg viewBox="0 0 16 16" fill="none"><rect x="3" y="1.5" width="10" height="13" rx="1.5" stroke="currentColor" strokeWidth="1.3" /><path d="M5.5 5h5M5.5 8h5M5.5 11h3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" /></svg>
  ),
  vault: (
    <svg viewBox="0 0 16 16" fill="none"><rect x="2" y="6" width="12" height="8" rx="1.5" stroke="currentColor" strokeWidth="1.3" /><path d="M5 6V4.5a3 3 0 0 1 6 0V6" stroke="currentColor" strokeWidth="1.3" /><circle cx="8" cy="10" r="1.1" fill="currentColor" /></svg>
  ),
  applications: (
    <svg viewBox="0 0 16 16" fill="none"><path d="M3 2.5h7l3 3V14a.5.5 0 0 1-.5.5h-9A.5.5 0 0 1 3 14V2.5Z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" /><path d="M6 8.5h4M6 11h4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" /></svg>
  ),
  bell: (
    <svg viewBox="0 0 16 16" fill="none"><path d="M4 6.5a4 4 0 0 1 8 0c0 3 1 4 1 4H3s1-1 1-4Z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" /><path d="M6.5 12.5a1.5 1.5 0 0 0 3 0" stroke="currentColor" strokeWidth="1.3" /></svg>
  ),
  user: (
    <svg viewBox="0 0 16 16" fill="none"><circle cx="8" cy="5.5" r="2.5" stroke="currentColor" strokeWidth="1.3" /><path d="M3 14c0-2.5 2.2-4 5-4s5 1.5 5 4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" /></svg>
  ),
  chart: (
    <svg viewBox="0 0 16 16" fill="none"><path d="M2.5 13.5V6M8 13.5V2.5M13.5 13.5V9" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" /></svg>
  ),
  operators: (
    <svg viewBox="0 0 16 16" fill="none"><circle cx="5.5" cy="5.5" r="2" stroke="currentColor" strokeWidth="1.3" /><circle cx="11" cy="5.5" r="2" stroke="currentColor" strokeWidth="1.3" /><path d="M1.5 13.5c0-2 1.7-3.3 4-3.3s4 1.3 4 3.3M9 10.6c1.9.2 3 1.4 3 2.9" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" /></svg>
  ),
  payments: (
    <svg viewBox="0 0 16 16" fill="none"><rect x="1.5" y="4" width="13" height="9" rx="1.5" stroke="currentColor" strokeWidth="1.3" /><path d="M1.5 7h13" stroke="currentColor" strokeWidth="1.3" /></svg>
  ),
  activity: (
    <svg viewBox="0 0 16 16" fill="none"><path d="M2 8.5h2.5L6 4l3 9 1.5-4.5H14" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" /></svg>
  ),
}
