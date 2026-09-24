import { useNavigate } from 'react-router-dom'
import { AdminShell } from '../../components/layout/AdminShell'
import { Card, Table, Badge, statusTone, Button } from '../../components/ui'
import { adminApplicants } from '../../lib/mockData'

export default function AdminApplicants() {
  const navigate = useNavigate()
  return (
    <AdminShell title="Applicants">
      <div className="max-w-content">
        <h2 className="font-display text-2xl font-bold text-ink mb-6">Applicants</h2>
        <Card>
          <Table columns={['Applicant', 'Applications', 'Latest Form', 'Status', 'Joined', 'Action']}>
            {adminApplicants.map((a) => (
              <tr key={a.id}>
                <td className="py-3.5 pr-4">
                  <p className="text-ink font-medium">{a.name}</p>
                  <p className="text-xs text-ink-faint mono-data">{a.id}</p>
                </td>
                <td className="py-3.5 pr-4 text-ink-soft">{a.applications}</td>
                <td className="py-3.5 pr-4 text-ink-soft">{a.latestForm}</td>
                <td className="py-3.5 pr-4"><Badge tone={statusTone(a.status)}>{a.status}</Badge></td>
                <td className="py-3.5 pr-4 text-ink-faint">{a.joined}</td>
                <td className="py-3.5 pr-4">
                  <Button size="sm" variant="secondary" onClick={() => navigate(`/admin/applicants/${a.id}`)}>View</Button>
                </td>
              </tr>
            ))}
          </Table>
        </Card>
      </div>
    </AdminShell>
  )
}
