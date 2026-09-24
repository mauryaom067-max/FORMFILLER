import { useParams, Link } from 'react-router-dom'
import { AdminShell } from '../../components/layout/AdminShell'
import { Card, Badge, Table, statusTone } from '../../components/ui'
import { adminApplicants, adminApplications, adminActivityLog } from '../../lib/mockData'

export default function AdminApplicantDetail() {
  const { id } = useParams()
  const applicant = adminApplicants.find((a) => a.id === id) || adminApplicants[0]
  const apps = adminApplications.filter((a) => a.applicant === applicant.name)
  const activity = adminActivityLog.filter((a) => a.actor === applicant.name)

  return (
    <AdminShell title="Applicant" subtitle={applicant.id}>
      <div className="max-w-content">
        <Link to="/admin/applicants" className="text-sm text-ink-faint hover:text-ink">&larr; Back to applicants</Link>

        <div className="grid lg:grid-cols-[1fr_2fr] gap-6 mt-4">
          <Card>
            <div className="flex items-center gap-3 mb-5">
              <div className="w-12 h-12 rounded-full bg-ink text-white flex items-center justify-center font-semibold">
                {applicant.name.split(' ').map((n) => n[0]).join('')}
              </div>
              <div>
                <p className="font-medium text-ink">{applicant.name}</p>
                <p className="text-xs text-ink-faint">{applicant.id}</p>
              </div>
            </div>
            <div className="space-y-3 text-sm">
              <Row label="Aadhaar" value="XXXX XXXX 4821" />
              <Row label="Phone" value="**** ** 4821" />
              <Row label="Email" value="i****n@gmail.com" />
              <Row label="Joined" value={applicant.joined} />
              <Row label="Status" value={<Badge tone={statusTone(applicant.status)}>{applicant.status}</Badge>} />
            </div>
          </Card>

          <div className="space-y-6">
            <Card padded>
              <h3 className="font-medium text-ink mb-4">Application history</h3>
              <Table columns={['Application', 'Form', 'Operator', 'Status', 'Updated']}>
                {apps.map((a) => (
                  <tr key={a.id}>
                    <td className="py-3 pr-4 mono-data text-ink-soft">{a.id}</td>
                    <td className="py-3 pr-4 text-ink">{a.form}</td>
                    <td className="py-3 pr-4 text-ink-soft">{a.operator}</td>
                    <td className="py-3 pr-4"><Badge tone={statusTone(a.status)}>{a.status}</Badge></td>
                    <td className="py-3 pr-4 text-ink-faint">{a.updated}</td>
                  </tr>
                ))}
              </Table>
            </Card>

            <Card padded>
              <h3 className="font-medium text-ink mb-4">Activity</h3>
              {activity.length === 0 ? (
                <p className="text-sm text-ink-faint">No recent activity recorded.</p>
              ) : (
                <div className="space-y-3">
                  {activity.map((a, i) => (
                    <div key={i} className="text-sm">
                      <p className="text-ink">{a.action}</p>
                      <p className="text-xs text-ink-faint mt-0.5">{a.time}</p>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>
        </div>
      </div>
    </AdminShell>
  )
}

function Row({ label, value }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-ink-faint">{label}</span>
      <span className="text-ink font-medium mono-data">{value}</span>
    </div>
  )
}
