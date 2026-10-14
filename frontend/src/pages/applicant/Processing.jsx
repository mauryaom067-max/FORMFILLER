import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { ApplicantShell } from '../../components/layout/ApplicantShell'
import {
  Card,
  Button,
  ProgressSteps,
  Badge,
} from '../../components/ui'
import { Chat } from '../../components/Chat'
import { useApp } from '../../lib/store'

const STEPS = [
  'Documents',
  'Application',
  'Payment',
  'Processing',
  'Review',
  'Submitted',
]

export default function Processing() {
  const navigate = useNavigate()

  const {
    updateApplicationStep,
    jeeApplication,
    ensureJeeApplication,
    user,
  } = useApp()

  const [processing, setProcessing] = useState(true)
  const [application, setApplication] = useState(null)

  /*
   * Get the current JEE Main application.
   *
   * The real application ID is required for:
   * - Applicant ↔ Operator chat
   * - Application messages
   * - Operator assignment
   */
  useEffect(() => {
    async function loadApplication() {
      try {
        if (
          jeeApplication?.id
        ) {
          setApplication(jeeApplication)
          return
        }

        if (
          user &&
          ensureJeeApplication
        ) {
          const result =
            await ensureJeeApplication(user)

          if (result) {
            setApplication(result)
          }
        }
      } catch (error) {
        console.error(
          'Failed to load JEE application:',
          error
        )
      }
    }

    loadApplication()
  }, [
    jeeApplication,
    ensureJeeApplication,
    user,
  ])

  /*
   * Move application to Processing step.
   *
   * IMPORTANT:
   * There is NO automatic 3-second transition anymore.
   */
  useEffect(() => {
    async function startProcessing() {
      try {
        if (updateApplicationStep) {
          await updateApplicationStep(4)
        }
      } catch (error) {
        console.error(
          'Failed to update application step:',
          error
        )
      }
    }

    startProcessing()
  }, [updateApplicationStep])

  /*
   * Continue manually to Final Review.
   */
  function handleContinue() {
    navigate('/forms/jee-main/review')
  }

  const applicationId =
    application?.id ||
    jeeApplication?.id ||
    null

  return (
    <ApplicantShell
      title="JEE Main"
      subtitle="Step 4 of 6 · Processing"
    >
      <div className="max-w-content max-w-5xl">
        <ProgressSteps
          steps={STEPS}
          current={3}
        />

        <h2 className="font-display text-2xl font-bold text-ink mt-8 mb-6">
          Application processing
        </h2>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* LEFT SIDE */}
          <div className="lg:col-span-2 space-y-6">

            {/* Processing Status */}
            <Card>
              <div className="flex flex-col items-center text-center py-10">

                <div className="w-16 h-16 rounded-full bg-brand-50 border border-brand-100 flex items-center justify-center mb-6">
                  <div className="w-7 h-7 border-4 border-brand-200 border-t-brand-500 rounded-full animate-spin" />
                </div>

                <h3 className="font-display text-xl font-bold text-ink">
                  Your application is being processed
                </h3>

                <p className="text-sm text-ink-faint mt-3 max-w-md">
                  Your payment has been confirmed and your
                  application is now being processed by your
                  assigned FormFiller operator.
                </p>

                <Badge
                  tone="blue"
                  className="mt-5"
                >
                  Processing
                </Badge>

                <p className="text-xs text-ink-faint mt-4 max-w-md">
                  You can chat with your assigned operator
                  while your application is being processed.
                </p>

              </div>
            </Card>

            {/* Operator Status */}
            <Card>
              <div className="flex items-center justify-between">

                <div>
                  <p className="text-xs font-medium text-brand-600">
                    Assigned operator
                  </p>

                  <h3 className="font-display text-lg font-bold text-ink mt-1">
                    FormFiller Operator
                  </h3>

                  <p className="text-sm text-ink-faint mt-1">
                    Your operator is processing your application.
                  </p>
                </div>

                <Badge tone="green">
                  Assigned
                </Badge>

              </div>
            </Card>

            {/* Timeline */}
            <Card>
              <div className="space-y-6">

                <TimelineItem
                  title="Application received"
                  description="Your JEE Main application has been received."
                  status="completed"
                />

                <TimelineItem
                  title="Payment confirmed"
                  description="Application fee and FormFiller service fee confirmed."
                  status="completed"
                />

                <TimelineItem
                  title="Application processing"
                  description="Your application is currently being processed by the assigned operator."
                  status="active"
                />

                <TimelineItem
                  title="Final review"
                  description="Review the completed application before final submission."
                  status="pending"
                />

                <TimelineItem
                  title="Submission"
                  description="Final submission will happen after your approval."
                  status="pending"
                  last
                />

              </div>
            </Card>

            {/* Continue manually */}
            <Card>
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">

                <div>
                  <h3 className="font-medium text-ink">
                    Ready for final review?
                  </h3>

                  <p className="text-sm text-ink-faint mt-1">
                    Continue when you want to review your completed application.
                  </p>
                </div>

                <Button
                  size="lg"
                  onClick={handleContinue}
                >
                  Continue to Review
                </Button>

              </div>
            </Card>

          </div>

          {/* RIGHT SIDE — REAL-TIME CHAT */}
          <div className="lg:col-span-1">

            <Card className="p-0 overflow-hidden">

              <div className="px-5 py-4 border-b border-line">
                <div className="flex items-center justify-between">

                  <div>
                    <p className="text-xs font-medium text-brand-600">
                      Operator assistance
                    </p>

                    <h3 className="font-display text-lg font-bold text-ink mt-1">
                      Application Chat
                    </h3>
                  </div>

                  <div className="w-2.5 h-2.5 rounded-full bg-green-500" />

                </div>

                <p className="text-xs text-ink-faint mt-1">
                  Chat with your assigned operator in real time.
                </p>
              </div>

              {applicationId ? (
                <Chat
                  applicationId={applicationId}
                  selfRole="applicant"
                  otherName="FormFiller Operator"
                  quickReplies={[
                    'Any update?',
                    'I need help with my application.',
                    'Please check my application.',
                    'I need to report an error.',
                  ]}
                />
              ) : (
                <div className="p-6 text-center">
                  <div className="w-10 h-10 rounded-full bg-brand-50 flex items-center justify-center mx-auto mb-3">
                    <div className="w-5 h-5 border-2 border-brand-200 border-t-brand-500 rounded-full animate-spin" />
                  </div>

                  <p className="text-sm font-medium text-ink">
                    Connecting to application...
                  </p>

                  <p className="text-xs text-ink-faint mt-1">
                    Please wait while we load your application.
                  </p>
                </div>
              )}

            </Card>

          </div>

        </div>
      </div>
    </ApplicantShell>
  )
}

function TimelineItem({
  title,
  description,
  status,
  last = false,
}) {
  const dotClasses = {
    completed:
      'bg-brand-500 border-brand-500 text-white',

    active:
      'bg-white border-brand-500 text-brand-500',

    pending:
      'bg-white border-line text-ink-faint',
  }

  return (
    <div className="flex gap-4">

      <div className="flex flex-col items-center">

        <div
          className={`w-7 h-7 rounded-full border-2 flex items-center justify-center text-xs font-bold shrink-0 ${dotClasses[status]}`}
        >
          {status === 'completed'
            ? '✓'
            : ''}
        </div>

        {!last && (
          <div className="w-px flex-1 bg-line min-h-[48px] mt-1" />
        )}

      </div>

      <div className="pb-5">

        <h4
          className={`font-medium ${
            status === 'pending'
              ? 'text-ink-faint'
              : 'text-ink'
          }`}
        >
          {title}
        </h4>

        <p className="text-sm text-ink-faint mt-1">
          {description}
        </p>

      </div>

    </div>
  )
}