import {
  useEffect,
  useState,
} from 'react'

import {
  useNavigate,
} from 'react-router-dom'

import {
  ApplicantShell,
} from '../../components/layout/ApplicantShell'

import {
  Card,
  Button,
  ProgressSteps,
  Badge,
} from '../../components/ui'

import {
  apiRequest,
} from '../../lib/api/client'

import {
  useApp,
} from '../../lib/store'


const STEPS = [
  'Documents',
  'Application',
  'Payment',
  'Processing',
  'Review',
  'Submitted',
]


export default function Payment() {

  const navigate = useNavigate()

  const {
    jeeApplication,
  } = useApp()


  // =====================================================
  // STATE
  // =====================================================

  const [
    application,
    setApplication,
  ] = useState(null)

  const [
    loading,
    setLoading,
  ] = useState(true)

  const [
    processing,
    setProcessing,
  ] = useState(false)

  const [
    paid,
    setPaid,
  ] = useState(false)

  const [
    paymentMethod,
    setPaymentMethod,
  ] = useState('upi')

  const [
    error,
    setError,
  ] = useState('')


  // =====================================================
  // LOAD APPLICATION
  // =====================================================

  useEffect(() => {

    let cancelled = false


    async function loadApplication() {

      try {

        setLoading(true)

        setError('')


        // -----------------------------------------------
        // GET APPLICATION ID
        // -----------------------------------------------

        const applicationId =
          jeeApplication?.id


        if (!applicationId) {

          throw new Error(
            'Application not found. Please complete the application first.'
          )

        }


        // -----------------------------------------------
        // GET APPLICATION FROM BACKEND
        // -----------------------------------------------

        const response =
          await apiRequest(
            `/api/applications/${applicationId}`
          )


        if (cancelled) {
          return
        }


        const loadedApplication =
          response?.application


        if (!loadedApplication) {

          throw new Error(
            'Application data was not returned by the server.'
          )

        }


        setApplication(
          loadedApplication
        )


        // -----------------------------------------------
        // CHECK PAYMENT STATUS
        // -----------------------------------------------

        if (
          loadedApplication.status ===
          'paid'
        ) {

          setPaid(true)

        }

      } catch (err) {

        console.error(
          'Payment page load error:',
          err
        )


        if (!cancelled) {

          setError(
            err?.message ||
            'Unable to load payment details.'
          )

        }

      } finally {

        if (!cancelled) {

          setLoading(false)

        }

      }

    }


    loadApplication()


    return () => {

      cancelled = true

    }

  }, [
    jeeApplication,
  ])


  // =====================================================
  // FORM DATA
  // =====================================================

  const form =
    application?.forms


  const applicationFee =
    Number(
      form?.application_fee || 0
    )


  const serviceFee =
    Number(
      form?.service_fee || 0
    )


  const totalFee =
    Number(
      form?.total_fee ||
      applicationFee +
      serviceFee
    )


  // =====================================================
  // FORMAT MONEY
  // =====================================================

  function formatMoney(
    amount
  ) {

    return `₹${Number(
      amount || 0
    ).toLocaleString(
      'en-IN'
    )}`

  }


  // =====================================================
  // PAYMENT
  // =====================================================

  async function handlePayment() {

    try {

      setProcessing(true)

      setError('')


      if (!application?.id) {

        throw new Error(
          'Application ID is missing.'
        )

      }


      // -------------------------------------------------
      // CURRENTLY PAYMENT CONFIRMATION IS PREPARED
      // BY BACKEND.
      // -------------------------------------------------

      const response =
        await apiRequest(
          `/api/applications/${application.id}/prepare-payment`,
          {
            method: 'POST',

            body: JSON.stringify({
              paymentMethod,
            }),
          }
        )


      if (
        !response?.success
      ) {

        throw new Error(
          response?.message ||
          'Unable to prepare payment.'
        )

      }


      // -------------------------------------------------
      // TEMPORARY PAYMENT SUCCESS
      //
      // Actual Razorpay/payment gateway integration
      // will be connected in the next step.
      // -------------------------------------------------

      setPaid(true)

    } catch (err) {

      console.error(
        'Payment error:',
        err
      )


      setError(
        err?.message ||
        'Payment could not be processed.'
      )

    } finally {

      setProcessing(false)

    }

  }


  // =====================================================
  // BACK
  // =====================================================

  function handleBack() {

    navigate(
      '/forms/jee-main/application'
    )

  }


  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {

    return (

      <ApplicantShell
        title="JEE Main"
        subtitle="Step 3 of 6 · Payment"
      >

        <div className="max-w-content">

          <ProgressSteps
            steps={STEPS}
            current={2}
          />

          <Card className="mt-8">

            <div className="py-12 text-center">

              <p className="text-sm text-ink-faint">

                Loading payment details...

              </p>

            </div>

          </Card>

        </div>

      </ApplicantShell>

    )

  }


  // =====================================================
  // ERROR
  // =====================================================

  if (error && !application) {

    return (

      <ApplicantShell
        title="JEE Main"
        subtitle="Step 3 of 6 · Payment"
      >

        <div className="max-w-content">

          <ProgressSteps
            steps={STEPS}
            current={2}
          />

          <div className="mt-8 rounded-xl border border-red-200 bg-red-50 px-4 py-3">

            <p className="text-sm text-red-700">

              {error}

            </p>

          </div>

          <div className="mt-6">

            <Button
              variant="secondary"
              onClick={handleBack}
            >
              Back
            </Button>

          </div>

        </div>

      </ApplicantShell>

    )

  }


  // =====================================================
  // PAYMENT SUCCESS
  // =====================================================

  if (paid) {

    return (

      <ApplicantShell
        title="JEE Main"
        subtitle="Step 3 of 6 · Payment"
      >

        <div className="max-w-content max-w-xl">

          <ProgressSteps
            steps={STEPS}
            current={2}
          />

          <Card className="mt-8 text-center py-12">

            <div className="w-14 h-14 rounded-full bg-success-bg text-success flex items-center justify-center mx-auto mb-4 text-2xl">

              ✓

            </div>


            <h2 className="font-display text-xl font-bold text-ink">

              Payment successful

            </h2>


            <p className="text-sm text-ink-faint mt-2">

              Your application is moving to
              processing.

            </p>


            <Badge
              tone="green"
              className="mt-4"
            >

              Paid

            </Badge>


            <div className="mt-8">

              <Button
                size="lg"
                onClick={() =>
                  navigate(
                    '/forms/jee-main/processing'
                  )
                }
              >

                Continue

              </Button>

            </div>

          </Card>

        </div>

      </ApplicantShell>

    )

  }


  // =====================================================
  // PAYMENT PAGE
  // =====================================================

  return (

    <ApplicantShell
      title="JEE Main"
      subtitle="Step 3 of 6 · Payment"
    >

      <div className="max-w-content max-w-xl">

        {/* PROGRESS */}

        <ProgressSteps
          steps={STEPS}
          current={2}
        />


        {/* HEADER */}

        <h2 className="font-display text-2xl font-bold text-ink mt-8 mb-6">

          Payment

        </h2>


        {/* ERROR */}

        {error && (

          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3">

            <p className="text-sm text-red-700">

              {error}

            </p>

          </div>

        )}


        {/* FEE CARD */}

        <Card>

          <div className="space-y-3 text-sm">

            <Row
              label="Application Fee"
              value={formatMoney(
                applicationFee
              )}
            />


            <Row
              label="FormFiller Service Fee"
              value={formatMoney(
                serviceFee
              )}
            />


            <div className="h-px bg-line my-2" />


            <Row
              label="Total"
              value={formatMoney(
                totalFee
              )}
              bold
            />

          </div>

        </Card>


        {/* PAYMENT METHOD */}

        <Card className="mt-4">

          <SectionRadio
            label="UPI"
            value="upi"
            selected={
              paymentMethod ===
              'upi'
            }
            onChange={
              setPaymentMethod
            }
          />


          <SectionRadio
            label="Debit / Credit Card"
            value="card"
            selected={
              paymentMethod ===
              'card'
            }
            onChange={
              setPaymentMethod
            }
          />


          <SectionRadio
            label="Net Banking"
            value="netbanking"
            selected={
              paymentMethod ===
              'netbanking'
            }
            onChange={
              setPaymentMethod
            }
          />

        </Card>


        {/* ACTIONS */}

        <div className="flex justify-between mt-8">

          <Button
            variant="secondary"
            onClick={handleBack}
            disabled={processing}
          >

            Back

          </Button>


          <Button
            size="lg"
            onClick={
              handlePayment
            }
            disabled={
              processing
            }
          >

            {processing
              ? 'Processing...'
              : `Pay ${formatMoney(
                  totalFee
                )}`}

          </Button>

        </div>

      </div>

    </ApplicantShell>

  )

}


// =====================================================
// ROW
// =====================================================

function Row({
  label,
  value,
  bold = false,
}) {

  return (

    <div className="flex items-center justify-between">

      <span
        className={
          bold
            ? 'font-medium text-ink'
            : 'text-ink-soft'
        }
      >

        {label}

      </span>


      <span
        className={
          bold
            ? 'font-display font-bold text-ink text-lg'
            : 'text-ink font-medium'
        }
      >

        {value}

      </span>

    </div>

  )

}


// =====================================================
// PAYMENT RADIO
// =====================================================

function SectionRadio({
  label,
  value,
  selected,
  onChange,
}) {

  return (

    <label className="flex items-center gap-3 py-2.5 cursor-pointer">

      <input
        type="radio"
        name="payment-method"
        value={value}
        checked={selected}
        onChange={() =>
          onChange(value)
        }
        className="w-4 h-4 text-brand-500 focus:ring-brand-200"
      />


      <span className="text-sm text-ink">

        {label}

      </span>

    </label>

  )

}