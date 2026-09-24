import { AdminShell } from '../../components/layout/AdminShell'
import { Card, Table, Badge, statusTone } from '../../components/ui'
import { adminPayments } from '../../lib/mockData'

export default function AdminPayments() {
  return (
    <AdminShell title="Payments">
      <div className="max-w-content">
        <h2 className="font-display text-2xl font-bold text-ink mb-6">Payments</h2>
        <Card>
          <Table columns={['Payment ID', 'Application', 'Applicant', 'Amount', 'Status', 'Method', 'Date']}>
            {adminPayments.map((p) => (
              <tr key={p.id}>
                <td className="py-3.5 pr-4 mono-data text-ink-soft">{p.id}</td>
                <td className="py-3.5 pr-4 mono-data text-ink-soft">{p.application}</td>
                <td className="py-3.5 pr-4 text-ink font-medium">{p.applicant}</td>
                <td className="py-3.5 pr-4 text-ink mono-data">{p.amount}</td>
                <td className="py-3.5 pr-4"><Badge tone={statusTone(p.status)}>{p.status}</Badge></td>
                <td className="py-3.5 pr-4 text-ink-soft">{p.method}</td>
                <td className="py-3.5 pr-4 text-ink-faint">{p.date}</td>
              </tr>
            ))}
          </Table>
        </Card>
      </div>
    </AdminShell>
  )
}
