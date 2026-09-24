import { Link } from 'react-router-dom'
import { ApplicantShell } from '../../components/layout/ApplicantShell'
import { Card, Badge, statusTone, Button, EmptyState } from '../../components/ui'
import { applicantApplications } from '../../lib/mockData'

export default function Applications() {
  return (
    <ApplicantShell title="My Applications">
      <div className="max-w-content">
        <h2 className="font-display text-2xl font-bold text-ink mb-6">My applications</h2>
        {applicantApplications.length === 0 ? (
          <Card>
            <EmptyState
              title="No applications yet"
              description="Start your first application and we\u2019ll walk you through it."
              action={<Button as={Link} to="/forms">Fill a new form</Button>}
            />
          </Card>
        ) : (
          <Card padded={false}>
            <div className="divide-y divide-line">
              {applicantApplications.map((a) => (
                <Link
                  key={a.id}
                  to="/forms/jee-main/processing"
                  className="flex items-center justify-between px-6 py-5 hover:bg-surface transition-colors"
                >
                  <div>
                    <p className="text-sm font-medium text-ink">{a.form}</p>
                    <p className="text-xs text-ink-faint mt-1">{a.id} \u00b7 Operator: {a.operator} \u00b7 Updated {a.updated}</p>
                  </div>
                  <Badge tone={statusTone(a.status)}>{a.status}</Badge>
                </Link>
              ))}
            </div>
          </Card>
        )}
      </div>
    </ApplicantShell>
  )
}
