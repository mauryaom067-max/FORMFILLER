import { Link } from 'react-router-dom'
import { AdminShell } from '../../components/layout/AdminShell'
import { Card, Badge, statusTone } from '../../components/ui'
import { adminKpis, adminApplications, adminActivityLog } from '../../lib/mockData'

export default function AdminDashboard() {
  return (
    <AdminShell title="Dashboard">
      <div className="max-w-content">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Kpi label="Total Applicants" value={adminKpis.totalApplicants.toLocaleString('en-IN')} />
          <Kpi label="Total Applications" value={adminKpis.totalApplications.toLocaleString('en-IN')} />
          <Kpi label="Active Operators" value={adminKpis.activeOperators} />
          <Kpi label="Completed Applications" value={adminKpis.completedApplications.toLocaleString('en-IN')} />
        </div>

        <div className="grid lg:grid-cols-[1.4fr_1fr] gap-6">
          <Card padded={false}>
            <div className="flex items-center justify-between px-6 py-4 border-b border-line">
              <h3 className="font-medium text-ink">Recent applications</h3>
              <Link to="/admin/applications" className="text-sm text-brand-600 hover:text-brand-700">View all</Link>
            </div>
            <div className="divide-y divide-line">
              {adminApplications.slice(0, 5).map((a) => (
                <div key={a.id} className="flex items-center justify-between px-6 py-3.5">
                  <div>
                    <p className="text-sm font-medium text-ink">{a.applicant}</p>
                    <p className="text-xs text-ink-faint mt-0.5 mono-data">{a.id} \u00b7 {a.form}</p>
                  </div>
                  <Badge tone={statusTone(a.status)}>{a.status}</Badge>
                </div>
              ))}
            </div>
          </Card>

          <Card padded={false}>
            <div className="flex items-center justify-between px-6 py-4 border-b border-line">
              <h3 className="font-medium text-ink">Recent activity</h3>
              <Link to="/admin/activity" className="text-sm text-brand-600 hover:text-brand-700">View all</Link>
            </div>
            <div className="divide-y divide-line">
              {adminActivityLog.slice(0, 5).map((r, i) => (
                <div key={i} className="px-6 py-3.5">
                  <p className="text-sm text-ink">{r.action}</p>
                  <p className="text-xs text-ink-faint mt-0.5">{r.actor} \u00b7 {r.time}</p>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </AdminShell>
  )
}

function Kpi({ label, value }) {
  return (
    <Card className="p-5">
      <p className="text-2xl font-display font-bold text-ink">{value}</p>
      <p className="text-sm text-ink-faint mt-1">{label}</p>
    </Card>
  )
}
