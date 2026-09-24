import { Link } from 'react-router-dom'
import { ApplicantShell } from '../../components/layout/ApplicantShell'
import { Card, Button, Badge, statusTone } from '../../components/ui'
import { Icons } from '../../components/layout/AppShell'
import { NotificationsBell } from '../../components/Notifications'
import { applicant, applicantApplications, applicantNotifications } from '../../lib/mockData'

export default function Dashboard() {
  return (
    <ApplicantShell title="Overview" topRight={<TopRight />}>
      <div className="max-w-content">
        <h2 className="font-display text-2xl font-bold text-ink">Welcome back, {applicant.name.split(' ')[0]}</h2>
        <p className="text-ink-faint mt-1">Here\u2019s where your applications stand today.</p>

        <div className="grid sm:grid-cols-2 gap-4 mt-8">
          <Card className="p-6 flex items-center justify-between">
            <div>
              <p className="font-medium text-ink">Fill a new form</p>
              <p className="text-sm text-ink-faint mt-1">Start with JEE Main</p>
            </div>
            <Button as={Link} to="/forms">Start</Button>
          </Card>
          <Card className="p-6 flex items-center justify-between">
            <div>
              <p className="font-medium text-ink">Document Vault</p>
              <p className="text-sm text-ink-faint mt-1">4 documents stored</p>
            </div>
            <Button as={Link} to="/vault" variant="secondary">Open</Button>
          </Card>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-8">
          {[
            { label: 'Active', value: '1' },
            { label: 'Processing', value: '1' },
            { label: 'Awaiting Review', value: '0' },
            { label: 'Completed', value: '2' },
          ].map((s) => (
            <Card key={s.label} className="p-5">
              <p className="text-2xl font-display font-bold text-ink">{s.value}</p>
              <p className="text-sm text-ink-faint mt-1">{s.label}</p>
            </Card>
          ))}
        </div>

        <div className="mt-10">
          <h3 className="font-medium text-ink mb-4">Recent applications</h3>
          <Card padded={false}>
            <div className="divide-y divide-line">
              {applicantApplications.map((a) => (
                <Link
                  key={a.id}
                  to="/forms/jee-main/processing"
                  className="flex items-center justify-between px-6 py-4 hover:bg-surface transition-colors"
                >
                  <div>
                    <p className="text-sm font-medium text-ink">{a.form} \u00b7 {a.id}</p>
                    <p className="text-xs text-ink-faint mt-0.5">Operator: {a.operator} \u00b7 Updated {a.updated}</p>
                  </div>
                  <Badge tone={statusTone(a.status)}>{a.status}</Badge>
                </Link>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </ApplicantShell>
  )
}

function TopRight() {
  return (
    <>
      <NotificationsBell items={applicantNotifications} />
      <Link to="/profile" className="text-ink-faint hover:text-ink w-5 h-5">{Icons.user}</Link>
    </>
  )
}
