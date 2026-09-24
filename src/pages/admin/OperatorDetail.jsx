import { useParams, Link } from 'react-router-dom'
import { AdminShell } from '../../components/layout/AdminShell'
import { Card, Badge, statusTone, Table } from '../../components/ui'
import { adminOperators, adminApplications } from '../../lib/mockData'

export default function AdminOperatorDetail() {
  const { id } = useParams()
  const operator = adminOperators.find((o) => o.id === id) || adminOperators[0]
  const apps = adminApplications.filter((a) => a.operator === operator.name)

  return (
    <AdminShell title="Operator" subtitle={operator.id}>
      <div className="max-w-content">
        <Link to="/admin/operators" className="text-sm text-ink-faint hover:text-ink">&larr; Back to operators</Link>

        <div className="grid lg:grid-cols-[1fr_2fr] gap-6 mt-4">
          <Card>
            <div className="flex items-center gap-3 mb-5">
              <div className="w-12 h-12 rounded-full bg-ink text-white flex items-center justify-center font-semibold">
                {operator.name.split(' ').map((n) => n[0]).join('')}
              </div>
              <div>
                <p className="font-medium text-ink">{operator.name}</p>
                <p className="text-xs text-ink-faint">{operator.id}</p>
              </div>
            </div>
            <div className="space-y-3 text-sm">
              <Row label="Status" value={<Badge tone={statusTone(operator.status)}>{operator.status}</Badge>} />
              <Row label="Current assignment" value={operator.current} />
              <Row label="Applications today" value={operator.today} />
              <Row label="Completed (all time)" value={operator.completed} />
              <Row label="Last active" value={operator.lastActive} />
            </div>
          </Card>

          <Card padded>
            <h3 className="font-medium text-ink mb-4">Application history</h3>
            {apps.length === 0 ? (
              <p className="text-sm text-ink-faint">No applications assigned yet.</p>
            ) : (
              <Table columns={['Application', 'Applicant', 'Status', 'Updated']}>
                {apps.map((a) => (
                  <tr key={a.id}>
                    <td className="py-3 pr-4 mono-data text-ink-soft">{a.id}</td>
                    <td className="py-3 pr-4 text-ink">{a.applicant}</td>
                    <td className="py-3 pr-4"><Badge tone={statusTone(a.status)}>{a.status}</Badge></td>
                    <td className="py-3 pr-4 text-ink-faint">{a.updated}</td>
                  </tr>
                ))}
              </Table>
            )}
          </Card>
        </div>
      </div>
    </AdminShell>
  )
}

function Row({ label, value }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-ink-faint">{label}</span>
      <span className="text-ink font-medium">{value}</span>
    </div>
  )
}
