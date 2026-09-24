import { AdminShell } from '../../components/layout/AdminShell'
import { Card, Table, Badge, statusTone } from '../../components/ui'
import { adminActivityLog } from '../../lib/mockData'

export default function AdminActivityLog() {
  return (
    <AdminShell title="Activity Logs">
      <div className="max-w-content">
        <h2 className="font-display text-2xl font-bold text-ink mb-6">Activity log</h2>
        <Card>
          <Table columns={['Time', 'Actor', 'Role', 'Action', 'Application', 'Status']}>
            {adminActivityLog.map((r, i) => (
              <tr key={i}>
                <td className="py-3.5 pr-4 text-ink-faint mono-data">{r.time}</td>
                <td className="py-3.5 pr-4 text-ink font-medium">{r.actor}</td>
                <td className="py-3.5 pr-4 text-ink-soft">{r.role}</td>
                <td className="py-3.5 pr-4 text-ink-soft">{r.action}</td>
                <td className="py-3.5 pr-4 mono-data text-ink-soft">{r.application}</td>
                <td className="py-3.5 pr-4"><Badge tone={statusTone(r.status)}>{r.status}</Badge></td>
              </tr>
            ))}
          </Table>
        </Card>
      </div>
    </AdminShell>
  )
}
