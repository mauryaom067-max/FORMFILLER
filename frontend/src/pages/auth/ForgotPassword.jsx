import { useState } from 'react'
import { Link } from 'react-router-dom'

import { PublicHeader } from '../../components/layout/PublicChrome'
import {
  Button,
  Input,
  Card,
} from '../../components/ui'

import { supabase } from '../../lib/supabase'


export default function ForgotPassword() {
  const [email, setEmail] = useState('')

  const [sent, setSent] =
    useState(false)

  const [loading, setLoading] =
    useState(false)

  const [error, setError] =
    useState('')


  async function handleSubmit(e) {
    e.preventDefault()

    setError('')
    setSent(false)

    const cleanEmail =
      email.trim().toLowerCase()

    if (!cleanEmail) {
      setError(
        'Please enter your email address.'
      )

      return
    }

    try {
      setLoading(true)

      // -----------------------------------------------
      // SEND SUPABASE PASSWORD RESET EMAIL
      // -----------------------------------------------

      const {
        error: resetError,
      } =
        await supabase.auth.resetPasswordForEmail(
          cleanEmail,
          {
            redirectTo:
              `${window.location.origin}/reset-password`,
          }
        )

      if (resetError) {
        throw resetError
      }

      setSent(true)

    } catch (error) {
      console.error(
        'Password reset error:',
        error
      )

      setError(
        error?.message ||
        'Unable to send password reset email.'
      )

    } finally {
      setLoading(false)
    }
  }


  return (
    <div className="min-h-screen bg-white flex flex-col">

      <PublicHeader />

      <div className="flex-1 flex items-center justify-center px-6 py-16">

        <Card className="w-full max-w-sm p-8">

          {!sent ? (
            <>

              <h1 className="font-display text-2xl font-bold text-ink">
                Reset your password
              </h1>

              <p className="text-sm text-ink-faint mt-1.5 mb-7">
                We&apos;ll email you a link to reset your password.
              </p>


              {/* ERROR */}

              {error && (
                <div className="mb-5 rounded-lg border border-danger/20 bg-danger-bg px-4 py-3">

                  <p className="text-sm text-danger">
                    {error}
                  </p>

                </div>
              )}


              {/* FORM */}

              <form
                className="space-y-4"
                onSubmit={handleSubmit}
              >

                <Input
                  label="Email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) =>
                    setEmail(e.target.value)
                  }
                  autoComplete="email"
                  required
                />


                <Button
                  type="submit"
                  className="w-full"
                  size="lg"
                  disabled={loading}
                >
                  {loading
                    ? 'Sending...'
                    : 'Send reset link'}
                </Button>

              </form>

            </>
          ) : (

            <div className="text-center py-4">

              <div className="w-11 h-11 rounded-full bg-success-bg text-success flex items-center justify-center mx-auto mb-4">
                &#10003;
              </div>

              <h1 className="font-display text-xl font-bold text-ink">
                Check your email
              </h1>

              <p className="text-sm text-ink-faint mt-2">
                We&apos;ve sent a password reset link to:
              </p>

              <p className="text-sm font-medium text-ink mt-2 break-all">
                {email}
              </p>

              <p className="text-xs text-ink-faint mt-3">
                Open the email and click the reset link to create a new password.
              </p>

            </div>

          )}


          <p className="text-sm text-ink-faint mt-6 text-center">

            <Link
              to="/login"
              className="text-brand-600 font-medium hover:text-brand-700"
            >
              Back to log in
            </Link>

          </p>

        </Card>

      </div>

    </div>
  )
}