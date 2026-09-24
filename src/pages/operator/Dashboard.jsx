import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { OperatorShell } from '../../components/layout/OperatorShell'
import { Card, Badge, Button, statusTone } from '../../components/ui'
import { Icons } from '../../components/layout/AppShell'
import { NotificationsBell } from '../../components/Notifications'
import { operatorQueue, operatorStats, operatorNotifications } from '../../lib/mockData'

export default function OperatorDashboard() {
  const [active, setActive] = useState(true)
  const navigate = useNavigate()
  const current = operatorQueue[0]
  const waiting = operatorQueue.slice(1)

  return (
    <OperatorShell title="Dashboard" topRight={<TopRight />}>
      <div className="max-w-content">
        <div className="flex items-center justify-between mb-8">
          <h2 className="font-display text-2xl font-bold text-ink">Good morning, Priya</h2>
          <button
            onClick={() => setActive((a) => !a)}
            className={`flex items-center gap-2.5 px-4 py-2 rounded-full border text-sm font-medium transition-colors ${
              active ? 'border-success/30 bg-success-bg text-success' : 'border-line bg-white text-ink-faint'
            }`}
          >
            <span className={`w-2 h-2 rounded-full ${active ? 'bg-success' : 'bg-ink-faint'}`} />
            I&apos;m {active ? 'Active' : 'Inactive'}
          </button>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-8">
          <Card className="p-5"><p className="text-2xl font-display font-bold text-ink">{operatorQueue.length - 1}</p><p className="text-sm text-ink-faint mt-1">Waiting applications</p></Card>
          <Card className="p-5"><p className="text-2xl font-display font-bold text-ink">{operatorStats.completedToday}</p><p className="text-sm text-ink-faint mt-1">Completed today</p></Card>
          <Card className="p-5"><p className="text-2xl font-display font-bold text-ink">{operatorStats.avgTime}</p><p className="text-sm text-ink-faint mt-1">Avg. time per application</p></Card>
        </div>

        <Card className="mb-8 border-brand-200 bg-brand-50/40">
          <div className="flex items-center justify-between">
            <div>
              <Badge tone="blue">New JEE Main Application</Badge>
              <p className="text-sm font-medium text-ink mt-3">{current.applicant} \u00b7 {current.id}</p>
              <p className="text-xs text-ink-faint mt-1">Assigned at {current.assignedAt} \u00b7 {current.form}</p>
            </div>
            <Button onClick={() => navigate(`/operator/workspace/${current.id}`)}>Open Application</Button>
          </div>
        </Card>

        <h3 className="font-medium text-ink mb-4">Waiting applications</h3>
        <Card padded={false}>
          <div className="divide-y divide-line">
            {waiting.map((a) => (
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
      </div>
    </OperatorShell>
  )
}

function TopRight() {
  return (
    <>
      <NotificationsBell items={operatorNotifications} />
      <div className="text-ink-faint w-5 h-5">{Icons.user}</div>
    </>
  )
}
