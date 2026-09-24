import { ApplicantShell } from '../../components/layout/ApplicantShell'
import { Card, Badge, EmptyState } from '../../components/ui'
import { applicantNotifications } from '../../lib/mockData'

export default function Notifications() {
  return (
    <ApplicantShell title="Notifications">
      <div className="max-w-content max-w-2xl">
        <h2 className="font-display text-2xl font-bold text-ink mb-6">Notifications</h2>
        {applicantNotifications.length === 0 ? (
          <Card><EmptyState title="No notifications yet" description="Updates on your applications will show up here." /></Card>
        ) : (
          <Card padded={false}>
            <div className="divide-y divide-line">
              {applicantNotifications.map((n) => (
                <div key={n.id} className={`flex items-start gap-4 px-6 py-4 ${n.unread ? 'bg-brand-50/40' : ''}`}>
                  <span className={`w-1.5 h-1.5 rounded-full mt-2 shrink-0 ${n.unread ? 'bg-brand-500' : 'bg-line'}`} />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm text-ink">{n.text}</p>
                    <p className="text-xs text-ink-faint mt-1">{n.time}</p>
                  </div>
                  {n.tag && <Badge tone={n.tone || 'gray'}>{n.tag}</Badge>}
                </div>
              ))}
            </div>
          </Card>
        )}
      </div>
    </ApplicantShell>
  )
}
