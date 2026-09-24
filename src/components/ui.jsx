import { useEffect } from 'react'

export function Logo({ size = 'md', dark = false }) {
  const px = size === 'sm' ? 22 : size === 'lg' ? 34 : 26
  return (
    <span className="inline-flex items-center gap-2 select-none">
      <svg width={px} height={px} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="32" height="32" rx="8" fill={dark ? '#FFFFFF' : '#2C5CE0'} />
        <path d="M10 9H22" stroke={dark ? '#2C5CE0' : 'white'} strokeWidth="2.2" strokeLinecap="round" />
        <path d="M10 15.5H19" stroke={dark ? '#2C5CE0' : 'white'} strokeWidth="2.2" strokeLinecap="round" />
        <path d="M10 22H16" stroke={dark ? '#2C5CE0' : 'white'} strokeWidth="2.2" strokeLinecap="round" />
      </svg>
      <span className={`font-display font-bold tracking-tight ${size === 'lg' ? 'text-2xl' : 'text-lg'} ${dark ? 'text-white' : 'text-ink'}`}>
        FormFiller
      </span>
    </span>
  )
}

export function Button({ children, variant = 'primary', size = 'md', className = '', as: As = 'button', ...props }) {
  const base = 'inline-flex items-center justify-center gap-2 font-medium rounded-card transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed'
  const sizes = { sm: 'text-sm px-3 py-1.5', md: 'text-sm px-4 py-2.5', lg: 'text-[15px] px-5 py-3' }
  const variants = {
    primary: 'bg-brand-500 text-white hover:bg-brand-600 active:bg-brand-700',
    secondary: 'bg-white text-ink border border-line hover:border-ink/30 hover:bg-surface',
    ghost: 'text-ink-soft hover:bg-surface hover:text-ink',
    danger: 'bg-white text-danger border border-danger/30 hover:bg-danger/5',
    dark: 'bg-ink text-white hover:bg-black',
  }
  return (
    <As className={`${base} ${sizes[size]} ${variants[variant]} ${className}`} {...props}>
      {children}
    </As>
  )
}

export function Badge({ children, tone = 'gray', className = '' }) {
  const tones = {
    gray: 'bg-surface text-ink-soft border-line',
    blue: 'bg-brand-50 text-brand-600 border-brand-100',
    green: 'bg-success-bg text-success border-success/20',
    amber: 'bg-warning-bg text-warning border-warning/20',
    red: 'bg-danger-bg text-danger border-danger/20',
    dark: 'bg-ink text-white border-ink',
  }
  return (
    <span className={`inline-flex items-center gap-1.5 border rounded-full px-2.5 py-1 text-xs font-medium ${tones[tone]} ${className}`}>
      {children}
    </span>
  )
}

export function statusTone(status) {
  const map = {
    New: 'gray', Assigned: 'blue', Processing: 'blue', 'Under Review': 'amber',
    'Correction Required': 'amber', Approved: 'green', Submitted: 'green', Completed: 'green',
    Paid: 'green', Pending: 'amber', Failed: 'red', Refunded: 'gray',
    Active: 'green', Inactive: 'gray', Busy: 'amber', 'Needs attention': 'amber', 'Payment pending': 'amber',
    'In progress': 'blue', Waiting: 'gray',
  }
  return map[status] || 'gray'
}

export function Card({ children, className = '', padded = true }) {
  return (
    <div className={`bg-white border border-line rounded-card shadow-card ${padded ? 'p-6' : ''} ${className}`}>
      {children}
    </div>
  )
}

export function SectionLabel({ children }) {
  return <p className="text-sm font-medium text-brand-600 mb-3">{children}</p>
}

export function Input({ label, hint, locked, ...props }) {
  return (
    <label className="block">
      {label && (
        <span className="flex items-center gap-1.5 text-sm font-medium text-ink mb-1.5">
          {label}
          {locked && <LockIcon />}
        </span>
      )}
      <input
        disabled={locked}
        className={`w-full rounded-lg border px-3.5 py-2.5 text-sm outline-none transition-colors ${
          locked
            ? 'bg-surface border-line text-ink-soft cursor-not-allowed'
            : 'bg-white border-line focus:border-brand-500 focus:ring-2 focus:ring-brand-100'
        }`}
        {...props}
      />
      {hint && <span className="block text-xs text-ink-faint mt-1.5">{hint}</span>}
    </label>
  )
}

export function LockIcon({ className = '' }) {
  return (
    <svg className={`w-3.5 h-3.5 text-ink-faint ${className}`} viewBox="0 0 16 16" fill="none">
      <rect x="3.5" y="7" width="9" height="6.5" rx="1.5" stroke="currentColor" strokeWidth="1.3" />
      <path d="M5.5 7V5a2.5 2.5 0 0 1 5 0v2" stroke="currentColor" strokeWidth="1.3" />
    </svg>
  )
}

export function Modal({ open, onClose, title, children, footer, width = 'max-w-md' }) {
  useEffect(() => {
    if (!open) return
    const onKey = (e) => e.key === 'Escape' && onClose?.()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-ink/40 backdrop-blur-[2px] animate-[fadeIn_150ms_ease-out]" onClick={onClose} />
      <div className={`relative w-full ${width} bg-white rounded-card shadow-pop border border-line p-6 animate-[popIn_180ms_ease-out]`}>
        {title && <h3 className="font-display text-lg font-semibold text-ink mb-2">{title}</h3>}
        <div className="text-sm text-ink-soft">{children}</div>
        {footer && <div className="mt-6 flex items-center justify-end gap-3">{footer}</div>}
      </div>
      <style>{`
        @keyframes fadeIn { from { opacity: 0 } to { opacity: 1 } }
        @keyframes popIn { from { opacity: 0; transform: translateY(6px) scale(0.98) } to { opacity: 1; transform: translateY(0) scale(1) } }
      `}</style>
    </div>
  )
}

export function Drawer({ open, onClose, title, children, width = 'max-w-md' }) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-ink/30" onClick={onClose} />
      <div className={`relative w-full ${width} h-full bg-white border-l border-line shadow-pop p-6 overflow-y-auto animate-[slideIn_200ms_ease-out]`}>
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-display text-lg font-semibold text-ink">{title}</h3>
          <button onClick={onClose} className="text-ink-faint hover:text-ink text-xl leading-none">&times;</button>
        </div>
        {children}
      </div>
      <style>{`@keyframes slideIn { from { transform: translateX(24px); opacity: 0.6 } to { transform: translateX(0); opacity: 1 } }`}</style>
    </div>
  )
}

export function Tabs({ tabs, active, onChange }) {
  return (
    <div className="flex items-center gap-6 border-b border-line">
      {tabs.map((t) => (
        <button
          key={t}
          onClick={() => onChange(t)}
          className={`relative pb-3 text-sm font-medium transition-colors ${
            active === t ? 'text-ink' : 'text-ink-faint hover:text-ink-soft'
          }`}
        >
          {t}
          {active === t && <span className="absolute left-0 right-0 -bottom-px h-0.5 bg-brand-500 rounded-full" />}
        </button>
      ))}
    </div>
  )
}

export function Table({ columns, children }) {
  return (
    <div className="overflow-x-auto -mx-6 px-6">
      <table className="w-full text-sm min-w-[720px]">
        <thead>
          <tr className="text-left text-xs font-medium text-ink-faint uppercase tracking-wide border-b border-line">
            {columns.map((c) => (
              <th key={c} className="pb-3 pr-4 font-medium normal-case text-[13px]">{c}</th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-line">{children}</tbody>
      </table>
    </div>
  )
}

export function ProgressSteps({ steps, current }) {
  return (
    <div className="flex items-center w-full">
      {steps.map((s, i) => {
        const state = i < current ? 'done' : i === current ? 'current' : 'upcoming'
        return (
          <div key={s} className="flex items-center flex-1 last:flex-none">
            <div className="flex items-center gap-2.5">
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold shrink-0 transition-colors ${
                  state === 'done'
                    ? 'bg-brand-500 text-white'
                    : state === 'current'
                    ? 'bg-white border-2 border-brand-500 text-brand-500'
                    : 'bg-surface border border-line text-ink-faint'
                }`}
              >
                {state === 'done' ? '\u2713' : i + 1}
              </div>
              <span className={`text-sm whitespace-nowrap ${state === 'upcoming' ? 'text-ink-faint' : 'text-ink font-medium'}`}>{s}</span>
            </div>
            {i < steps.length - 1 && (
              <div className={`h-px flex-1 mx-3 ${i < current ? 'bg-brand-500' : 'bg-line'}`} />
            )}
          </div>
        )
      })}
    </div>
  )
}

export function Timeline({ items }) {
  return (
    <div>
      {items.map((item, i) => (
        <div key={item.id} className="flex gap-4">
          <div className="flex flex-col items-center">
            <div
              className={`w-3 h-3 rounded-full mt-1 shrink-0 ${
                item.done ? 'bg-brand-500' : 'bg-line border-2 border-white ring-1 ring-line'
              }`}
            />
            {i < items.length - 1 && <div className={`w-px flex-1 ${item.done ? 'bg-brand-200' : 'bg-line'}`} style={{ minHeight: 28 }} />}
          </div>
          <div className="pb-7">
            <p className={`text-sm font-medium ${item.done ? 'text-ink' : 'text-ink-faint'}`}>{item.label}</p>
            {item.time && <p className="text-xs text-ink-faint mt-0.5">{item.time}</p>}
          </div>
        </div>
      ))}
    </div>
  )
}

export function EmptyState({ title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-16 px-6">
      <div className="w-11 h-11 rounded-full bg-brand-50 flex items-center justify-center mb-4">
        <svg className="w-5 h-5 text-brand-500" viewBox="0 0 20 20" fill="none">
          <rect x="4" y="3" width="12" height="14" rx="2" stroke="currentColor" strokeWidth="1.4" />
          <path d="M7 7h6M7 10h6M7 13h3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
        </svg>
      </div>
      <p className="font-medium text-ink mb-1">{title}</p>
      {description && <p className="text-sm text-ink-faint max-w-sm mb-5">{description}</p>}
      {action}
    </div>
  )
}

export function Toast({ message, tone = 'default', onDismiss }) {
  return (
    <div className="fixed bottom-6 right-6 z-[60] animate-[slideUp_200ms_ease-out]">
      <div className={`flex items-center gap-3 rounded-card border shadow-pop px-4 py-3 text-sm bg-white ${
        tone === 'success' ? 'border-success/30' : tone === 'error' ? 'border-danger/30' : 'border-line'
      }`}>
        <span className={`w-2 h-2 rounded-full ${tone === 'success' ? 'bg-success' : tone === 'error' ? 'bg-danger' : 'bg-brand-500'}`} />
        <span className="text-ink">{message}</span>
        {onDismiss && <button onClick={onDismiss} className="text-ink-faint hover:text-ink ml-2">&times;</button>}
      </div>
      <style>{`@keyframes slideUp { from { transform: translateY(8px); opacity: 0 } to { transform: translateY(0); opacity: 1 } }`}</style>
    </div>
  )
}

export function Checkbox({ label, ...props }) {
  return (
    <label className="flex items-center gap-2.5 text-sm text-ink-soft cursor-pointer select-none">
      <input type="checkbox" className="w-4 h-4 rounded border-line text-brand-500 focus:ring-brand-200" {...props} />
      {label}
    </label>
  )
}
