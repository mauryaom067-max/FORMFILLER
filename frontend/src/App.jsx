import { Routes, Route } from 'react-router-dom'

import Landing from './pages/Landing.jsx'
import NotFound from './pages/NotFound.jsx'
import Login from './pages/auth/Login.jsx'
import Signup from './pages/auth/Signup.jsx'
import ForgotPassword from './pages/auth/ForgotPassword.jsx'

import Dashboard from './pages/applicant/Dashboard.jsx'
import Vault from './pages/applicant/Vault.jsx'
import Forms from './pages/applicant/Forms.jsx'
import Applications from './pages/applicant/Applications.jsx'
import DocumentRequirements from './pages/applicant/DocumentRequirements.jsx'
import ApplicationForm from './pages/applicant/ApplicationForm.jsx'
import Payment from './pages/applicant/Payment.jsx'
import Processing from './pages/applicant/Processing.jsx'
import FinalReview from './pages/applicant/FinalReview.jsx'
import ApplicantNotifications from './pages/applicant/Notifications.jsx'
import ApplicantProfile from './pages/applicant/Profile.jsx'

import OperatorLogin from './pages/operator/Login.jsx'
import OperatorDashboard from './pages/operator/Dashboard.jsx'
import OperatorApplications from './pages/operator/Applications.jsx'
import OperatorWorkspace from './pages/operator/Workspace.jsx'
import OperatorActivity from './pages/operator/Activity.jsx'
import OperatorProfile from './pages/operator/Profile.jsx'

import AdminLogin from './pages/admin/Login.jsx'
import AdminDashboard from './pages/admin/Dashboard.jsx'
import AdminApplicants from './pages/admin/Applicants.jsx'
import AdminApplicantDetail from './pages/admin/ApplicantDetail.jsx'
import AdminApplications from './pages/admin/Applications.jsx'
import AdminOperators from './pages/admin/Operators.jsx'
import AdminOperatorDetail from './pages/admin/OperatorDetail.jsx'
import AdminForms from './pages/admin/Forms.jsx'
import AdminPayments from './pages/admin/Payments.jsx'
import AdminActivityLog from './pages/admin/ActivityLog.jsx'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />

      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/vault" element={<Vault />} />
      <Route path="/applications" element={<Applications />} />
      <Route path="/forms" element={<Forms />} />
      <Route path="/forms/jee-main/documents" element={<DocumentRequirements />} />
      <Route path="/forms/jee-main/application" element={<ApplicationForm />} />
      <Route path="/forms/jee-main/payment" element={<Payment />} />
      <Route path="/forms/jee-main/processing" element={<Processing />} />
      <Route path="/forms/jee-main/review" element={<FinalReview />} />
      <Route path="/notifications" element={<ApplicantNotifications />} />
      <Route path="/profile" element={<ApplicantProfile />} />

      <Route path="/operator/login" element={<OperatorLogin />} />
      <Route path="/operator" element={<OperatorDashboard />} />
      <Route path="/operator/applications" element={<OperatorApplications />} />
      <Route path="/operator/workspace/:id" element={<OperatorWorkspace />} />
      <Route path="/operator/activity" element={<OperatorActivity />} />
      <Route path="/operator/profile" element={<OperatorProfile />} />

      <Route path="/admin/login" element={<AdminLogin />} />
      <Route path="/admin" element={<AdminDashboard />} />
      <Route path="/admin/applicants" element={<AdminApplicants />} />
      <Route path="/admin/applicants/:id" element={<AdminApplicantDetail />} />
      <Route path="/admin/applications" element={<AdminApplications />} />
      <Route path="/admin/operators" element={<AdminOperators />} />
      <Route path="/admin/operators/:id" element={<AdminOperatorDetail />} />
      <Route path="/admin/forms" element={<AdminForms />} />
      <Route path="/admin/payments" element={<AdminPayments />} />
      <Route path="/admin/activity" element={<AdminActivityLog />} />

      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}
