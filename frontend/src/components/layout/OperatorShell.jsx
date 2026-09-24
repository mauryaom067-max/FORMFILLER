import { AppShell, Icons } from './AppShell'
import { operatorProfile } from '../../lib/mockData'

const nav = [
  { to: '/operator', label: 'Dashboard', icon: Icons.home, end: true },
  { to: '/operator/applications', label: 'Applications', icon: Icons.applications },
  { to: '/operator/activity', label: 'Activity', icon: Icons.activity },
  { to: '/operator/profile', label: 'Profile', icon: Icons.user },
]

export function OperatorShell({ title, subtitle, topRight, children }) {
  return (
    <AppShell
      nav={nav}
      roleLabel="Operator"
      userLabel={operatorProfile.name}
      userInitials={operatorProfile.avatarInitials}
      activeIndicator={
        <div>
          <h1 className="font-display text-lg font-semibold text-ink">{title}</h1>
          {subtitle && <p className="text-xs text-ink-faint mt-0.5">{subtitle}</p>}
        </div>
      }
      topRight={topRight}
    >
      {children}
    </AppShell>
  )
}
