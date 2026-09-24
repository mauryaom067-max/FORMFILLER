import { useNavigate } from 'react-router-dom'
import { AdminShell } from '../../components/layout/AdminShell'
import { Card, Table, Badge, statusTone, Button } from '../../components/ui'
import { adminOperators } from '../../lib/mockData'

export default function AdminOperators() {
  const navigate = useNavigate()
  return (
    <AdminShell title="Operators">
      <div className="max-w-content">
        <h2 className="font-display text-2xl font-bold text-ink mb-6">Operators</h2>
        <Card>
          <Table columns={['Operator', 'Status', 'Current Application', 'Applications Today', 'Completed', 'Last Active', 'Action']}>
            {adminOperators.map((o) => (
              <tr key={o.id}>
                <td className="py-3.5 pr-4">
                  <p className="text-ink font-medium">{o.name}</p>
                  <p className="text-xs text-ink-faint mono-data">{o.id}</p>
                </td>
                <td className="py-3.5 pr-4"><Badge tone={statusTone(o.status)}>{o.status}</Badge></td>
                <td className="py-3.5 pr-4 text-ink-soft mono-data">{o.current}</td>
                <td className="py-3.5 pr-4 text-ink-soft">{o.today}</td>
                <td className="py-3.5 pr-4 text-ink-soft">{o.completed}</td>
                <td className="py-3.5 pr-4 text-ink-faint">{o.lastActive}</td>
                <td className="py-3.5 pr-4">
                  <Button size="sm" variant="secondary" onClick={() => navigate(`/admin/operators/${o.id}`)}>View</Button>
                </td>
              </tr>
            ))}
          </Table>
        </Card>
      </div>
    </AdminShell>
  )
}
