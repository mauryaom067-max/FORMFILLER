import { Link } from 'react-router-dom'
import { OperatorShell } from '../../components/layout/OperatorShell'
import { Card, Badge, statusTone, EmptyState } from '../../components/ui'
import { operatorQueue } from '../../lib/mockData'

export default function OperatorApplications() {
  return (
    <OperatorShell title="Applications" subtitle="Everything assigned to you">
      <div className="max-w-content">
        <h2 className="font-display text-2xl font-bold text-ink mb-6">Your applications</h2>
        {operatorQueue.length === 0 ? (
          <Card><EmptyState title="Nothing assigned right now" description="New applications will appear here as they\u2019re assigned to you." /></Card>
        ) : (
          <Card padded={false}>
            <div className="divide-y divide-line">
              {operatorQueue.map((a) => (
                <Link
                  key={a.id}
                  to={`/operator/workspace/${a.id}`}
                  className="flex items-center justify-between px-6 py-4 hover:bg-surface transition-colors"
                >
                  <div>
                    <p className="text-sm font-medium text-ink">{a.applicant} \u00b7 {a.id}</p>
                    <p className="text-xs text-ink-faint mt-0.5">{a.form} \u00b7 Assigned {a.assignedAt}</p>
                  </div>
                  <Badge tone={statusTone(a.status)}>{a.status}</Badge>
                </Link>
              ))}
            </div>
          </Card>
        )}
      </div>
    </OperatorShell>
  )
}
