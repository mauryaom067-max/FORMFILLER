import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { OperatorShell } from '../../components/layout/OperatorShell'
import {
  Card,
  Badge,
  Button,
  statusTone,
} from '../../components/ui'

import { Icons } from '../../components/layout/AppShell'


const API_BASE_URL =
  import.meta.env.VITE_API_URL ||
  'http://localhost:5000'


export default function OperatorDashboard() {
  const navigate = useNavigate()

  const [dashboard, setDashboard] =
    useState(null)

  const [loading, setLoading] =
    useState(true)

  const [error, setError] =
    useState('')


  // ====================================================
  // LOAD OPERATOR DASHBOARD
  // ====================================================

  useEffect(() => {
    loadDashboard()
  }, [])


  async function loadDashboard() {
    try {
      setLoading(true)
      setError('')

      const token =
        localStorage.getItem(
          'formfiller_access_token'
        )

      if (!token) {
        setError(
          'Operator session not found. Please login again.'
        )

        return
      }


      const response =
        await fetch(
          `${API_BASE_URL}/api/operator/dashboard`,
          {
            method: 'GET',

            headers: {
              Authorization:
                `Bearer ${token}`,
            },

            credentials: 'include',
          }
        )


      const data =
        await response.json()


      if (!response.ok) {
        throw new Error(
          data?.message ||
          'Unable to load operator dashboard'
        )
      }


      setDashboard(data)

    } catch (error) {
      console.error(
        'Operator dashboard error:',
        error
      )

      setError(
        error.message ||
        'Unable to load dashboard'
      )

    } finally {
      setLoading(false)
    }
  }


  // ====================================================
  // LOADING STATE
  // ====================================================

  if (loading) {
    return (
      <OperatorShell
        title="Dashboard"
        topRight={<TopRight />}
      >
        <div className="max-w-content">

          <div className="flex items-center justify-center py-24">

            <div className="text-center">

              <div className="w-10 h-10 border-4 border-brand-200 border-t-brand-500 rounded-full animate-spin mx-auto" />

              <p className="text-sm text-ink-faint mt-4">
                Loading operator dashboard...
              </p>

            </div>

          </div>

        </div>
      </OperatorShell>
    )
  }


  // ====================================================
  // ERROR STATE
  // ====================================================

  if (error) {
    return (
      <OperatorShell
        title="Dashboard"
        topRight={<TopRight />}
      >
        <div className="max-w-content">

          <Card>

            <div className="py-12 text-center">

              <div className="w-14 h-14 rounded-full bg-danger-bg text-danger flex items-center justify-center mx-auto text-xl">
                !
              </div>

              <h3 className="font-display text-xl font-bold text-ink mt-5">
                Unable to load dashboard
              </h3>

              <p className="text-sm text-ink-faint mt-2">
                {error}
              </p>

              <Button
                className="mt-6"
                onClick={loadDashboard}
              >
                Try Again
              </Button>

            </div>

          </Card>

        </div>
      </OperatorShell>
    )
  }


  const operator =
    dashboard?.operator || {}

  const stats =
    dashboard?.stats || {}

  const applications =
    dashboard?.applications || []


  // ====================================================
  // CURRENT APPLICATIONS
  // ====================================================

  const activeApplications =
    applications.filter(
      (item) =>
        item?.assignment?.status !==
          'completed' &&
        item?.assignment?.status !==
          'cancelled'
    )


  const current =
    activeApplications[0] || null

  const waiting =
    activeApplications.slice(1)


  // ====================================================
  // OPERATOR STATUS
  // ====================================================

  const isActive =
    operator.operator_status ===
    'active'


  return (
    <OperatorShell
      title="Dashboard"
      topRight={<TopRight />}
    >

      <div className="max-w-content">

        {/* ==================================================
            HEADER
        ================================================== */}

        <div className="flex items-center justify-between mb-8">

          <div>

            <h2 className="font-display text-2xl font-bold text-ink">
              Welcome,{' '}
              {operator.full_name ||
                'Operator'}
            </h2>

            <p className="text-sm text-ink-faint mt-1">
              Here is your current application workload.
            </p>

          </div>


          <div
            className={`flex items-center gap-2.5 px-4 py-2 rounded-full border text-sm font-medium ${
              isActive
                ? 'border-success/30 bg-success-bg text-success'
                : 'border-line bg-white text-ink-faint'
            }`}
          >

            <span
              className={`w-2 h-2 rounded-full ${
                isActive
                  ? 'bg-success'
                  : 'bg-ink-faint'
              }`}
            />

            {isActive
              ? 'Active'
              : operator.operator_status ===
                'suspended'
                ? 'Suspended'
                : 'Inactive'}

          </div>

        </div>


        {/* ==================================================
            STATS
        ================================================== */}

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">

          <StatCard
            value={
              stats.active_workload ??
              0
            }
            label="Active applications"
          />

          <StatCard
            value={
              stats.assigned ??
              0
            }
            label="Assigned"
          />

          <StatCard
            value={
              stats.in_progress ??
              0
            }
            label="In progress"
          />

          <StatCard
            value={
              stats.awaiting_review ??
              0
            }
            label="Awaiting review"
          />

        </div>


        {/* ==================================================
            COMPLETED SUMMARY
        ================================================== */}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">

          <Card className="p-5">

            <p className="text-2xl font-display font-bold text-ink">
              {stats.completed ?? 0}
            </p>

            <p className="text-sm text-ink-faint mt-1">
              Completed applications
            </p>

          </Card>


          <Card className="p-5">

            <p className="text-2xl font-display font-bold text-ink">
              {stats.total ?? 0}
            </p>

            <p className="text-sm text-ink-faint mt-1">
              Total assigned applications
            </p>

          </Card>

        </div>


        {/* ==================================================
            CURRENT APPLICATION
        ================================================== */}

        {current ? (

          <Card className="mb-8 border-brand-200 bg-brand-50/40">

            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5">

              <div>

                <Badge
                  tone={
                    statusTone(
                      current.assignment?.status
                    )
                  }
                >
                  {formatStatus(
                    current.assignment?.status
                  )}
                </Badge>


                <p className="text-sm font-medium text-ink mt-3">

                  {getApplicantName(
                    current.application
                  )}

                  {' · '}

                  {getApplicationDisplayId(
                    current.application
                  )}

                </p>


                <p className="text-xs text-ink-faint mt-1">

                  JEE Main

                  {' · '}

                  Assigned{' '}

                  {formatDate(
                    current.assignment?.assigned_at
                  )}

                </p>

              </div>


              <Button
                onClick={() =>
                  navigate(
                    `/operator/workspace/${current.application.id}`
                  )
                }
              >
                Open Application
              </Button>

            </div>

          </Card>

        ) : (

          <Card className="mb-8">

            <div className="py-10 text-center">

              <div className="w-14 h-14 rounded-full bg-success-bg text-success flex items-center justify-center mx-auto text-xl">
                ✓
              </div>

              <h3 className="font-display text-lg font-bold text-ink mt-4">
                No active applications
              </h3>

              <p className="text-sm text-ink-faint mt-2">
                New applications will appear here automatically when they are assigned to you.
              </p>

            </div>

          </Card>

        )}


        {/* ==================================================
            WAITING APPLICATIONS
        ================================================== */}

        <h3 className="font-medium text-ink mb-4">
          My active applications
        </h3>


        <Card padded={false}>

          {waiting.length > 0 ? (

            <div className="divide-y divide-line">

              {waiting.map(
                (item) => {

                  const application =
                    item.application

                  const assignment =
                    item.assignment


                  return (
                    <button
                      key={
                        assignment.id
                      }
                      onClick={() =>
                        navigate(
                          `/operator/workspace/${application.id}`
                        )
                      }
                      className="w-full flex items-center justify-between px-6 py-4 hover:bg-surface transition-colors text-left"
                    >

                      <div>

                        <p className="text-sm font-medium text-ink">

                          {getApplicantName(
                            application
                          )}

                          {' · '}

                          {getApplicationDisplayId(
                            application
                          )}

                        </p>


                        <p className="text-xs text-ink-faint mt-0.5">

                          JEE Main

                          {' · '}

                          Assigned{' '}

                          {formatDate(
                            assignment.assigned_at
                          )}

                        </p>

                      </div>


                      <Badge
                        tone={
                          statusTone(
                            assignment.status
                          )
                        }
                      >
                        {formatStatus(
                          assignment.status
                        )}
                      </Badge>

                    </button>
                  )

                }
              )}

            </div>

          ) : (

            <div className="py-10 text-center">

              <p className="text-sm text-ink-faint">
                No additional active applications.
              </p>

            </div>

          )}

        </Card>

      </div>

    </OperatorShell>
  )
}


// ======================================================
// STAT CARD
// ======================================================

function StatCard({
  value,
  label,
}) {
  return (
    <Card className="p-5">

      <p className="text-2xl font-display font-bold text-ink">
        {value}
      </p>

      <p className="text-sm text-ink-faint mt-1">
        {label}
      </p>

    </Card>
  )
}


// ======================================================
// APPLICANT NAME
// ======================================================

function getApplicantName(
  application
) {
  const formData =
    application?.form_data || {}

  const personalDetails =
    formData.personalDetails || {}

  return (
    personalDetails.fullName ||
    personalDetails.full_name ||
    personalDetails.name ||
    'Applicant'
  )
}


// ======================================================
// APPLICATION DISPLAY ID
// ======================================================

function getApplicationDisplayId(
  application
) {
  return (
    application?.application_number ||
    application?.id ||
    'Application'
  )
}


// ======================================================
// FORMAT STATUS
// ======================================================

function formatStatus(
  status
) {
  if (!status) {
    return 'Unknown'
  }

  return status
    .replaceAll('_', ' ')
    .replace(
      /\b\w/g,
      (char) =>
        char.toUpperCase()
    )
}


// ======================================================
// FORMAT DATE
// ======================================================

function formatDate(
  date
) {
  if (!date) {
    return 'Not available'
  }

  try {
    return new Date(
      date
    ).toLocaleString(
      'en-IN',
      {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }
    )
  } catch {
    return 'Not available'
  }
}


// ======================================================
// TOP RIGHT
// ======================================================

function TopRight() {
  return (
    <div className="text-ink-faint w-5 h-5">
      {Icons.user}
    </div>
  )
}