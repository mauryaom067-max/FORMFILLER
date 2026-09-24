import { useState } from 'react'
import { AdminShell } from '../../components/layout/AdminShell'
import { Card, Table, Badge, statusTone, Tabs } from '../../components/ui'
import { adminApplications } from '../../lib/mockData'

const FILTERS = ['All', 'New', 'Assigned', 'Processing', 'Under Review', 'Correction Required', 'Approved', 'Submitted', 'Completed']

export default function AdminApplications() {
  const [filter, setFilter] = useState('All')
  const rows = filter === 'All' ? adminApplications : adminApplications.filter((a) => a.status === filter)

  return (
    <AdminShell title="Applications">
      <div className="max-w-content">
        <h2 className="font-display text-2xl font-bold text-ink mb-6">Applications</h2>
        <div className="mb-5 overflow-x-auto">
          <Tabs tabs={FILTERS} active={filter} onChange={setFilter} />
        </div>
        <Card>
          <Table columns={['Application ID', 'Applicant', 'Form', 'Operator', 'Status', 'Payment', 'Created', 'Updated']}>
            {rows.map((a) => (
              <tr key={a.id}>
                <td className="py-3.5 pr-4 mono-data text-ink-soft">{a.id}</td>
                <td className="py-3.5 pr-4 text-ink font-medium">{a.applicant}</td>
                <td className="py-3.5 pr-4 text-ink-soft">{a.form}</td>
                <td className="py-3.5 pr-4 text-ink-soft">{a.operator}</td>
                <td className="py-3.5 pr-4"><Badge tone={statusTone(a.status)}>{a.status}</Badge></td>
                <td className="py-3.5 pr-4"><Badge tone={statusTone(a.payment)}>{a.payment}</Badge></td>
                <td className="py-3.5 pr-4 text-ink-faint">{a.created}</td>
                <td className="py-3.5 pr-4 text-ink-faint">{a.updated}</td>
              </tr>
            ))}
          </Table>
        </Card>
      </div>
    </AdminShell>
  )
}
