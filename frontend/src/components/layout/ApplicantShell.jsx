import { AppShell, Icons } from './AppShell'
import { applicant } from '../../lib/mockData'

const nav = [
  { to: '/dashboard', label: 'Overview', icon: Icons.home, end: true },
  { to: '/forms', label: 'Fill New Form', icon: Icons.form },
  { to: '/vault', label: 'Document Vault', icon: Icons.vault },
  { to: '/applications', label: 'My Applications', icon: Icons.applications },
  { to: '/notifications', label: 'Notifications', icon: Icons.bell },
  { to: '/profile', label: 'Profile', icon: Icons.user },
]

export function ApplicantShell({ title, subtitle, topRight, children }) {
  return (
    <AppShell
      nav={nav}
      roleLabel="Applicant"
      userLabel={applicant.name}
      userInitials={applicant.avatarInitials}
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
