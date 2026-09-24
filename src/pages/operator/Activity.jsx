import { OperatorShell } from '../../components/layout/OperatorShell'
import { Card, Table, Badge, statusTone } from '../../components/ui'
import { adminActivityLog } from '../../lib/mockData'

export default function OperatorActivity() {
  const rows = adminActivityLog.filter((r) => r.actor === 'Priya Sharma' || r.role === 'System')

  return (
    <OperatorShell title="Activity">
      <div className="max-w-content">
        <h2 className="font-display text-2xl font-bold text-ink mb-6">Your recent activity</h2>
        <Card padded>
          <Table columns={['Time', 'Action', 'Application', 'Status']}>
            {rows.map((r, i) => (
              <tr key={i}>
                <td className="py-3.5 pr-4 text-ink-faint mono-data">{r.time}</td>
                <td className="py-3.5 pr-4 text-ink">{r.action}</td>
                <td className="py-3.5 pr-4 text-ink-soft mono-data">{r.application}</td>
                <td className="py-3.5 pr-4"><Badge tone={statusTone(r.status)}>{r.status}</Badge></td>
              </tr>
            ))}
          </Table>
        </Card>
      </div>
    </OperatorShell>
  )
}
