import { AppShell, Icons } from './AppShell'
import { NotificationsBell } from '../Notifications'
import { adminNotifications } from '../../lib/mockData'

const nav = [
  { to: '/admin', label: 'Dashboard', icon: Icons.chart, end: true },
  { to: '/admin/applicants', label: 'Applicants', icon: Icons.user },
  { to: '/admin/applications', label: 'Applications', icon: Icons.applications },
  { to: '/admin/operators', label: 'Operators', icon: Icons.operators },
  { to: '/admin/forms', label: 'Forms', icon: Icons.form },
  { to: '/admin/payments', label: 'Payments', icon: Icons.payments },
  { to: '/admin/activity', label: 'Activity Logs', icon: Icons.activity },
]

export function AdminShell({ title, subtitle, children }) {
  return (
    <AppShell
      nav={nav}
      roleLabel="Admin"
      userLabel="Admin"
      userInitials="AD"
      activeIndicator={
        <div className="flex items-center gap-3">
          <div>
            <h1 className="font-display text-lg font-semibold text-ink">{title}</h1>
            {subtitle && <p className="text-xs text-ink-faint mt-0.5">{subtitle}</p>}
          </div>
        </div>
      }
      topRight={
        <>
          <div className="relative hidden md:block">
            <input
              placeholder="Search"
              className="text-sm bg-surface border border-line rounded-lg pl-3 pr-3 py-1.5 w-52 outline-none focus:border-brand-500"
            />
          </div>
          <NotificationsBell items={adminNotifications} />
          <div className="w-8 h-8 rounded-full bg-ink text-white text-xs font-semibold flex items-center justify-center">AD</div>
        </>
      }
    >
      {children}
    </AppShell>
  )
}
