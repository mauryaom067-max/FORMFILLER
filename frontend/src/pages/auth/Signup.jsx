import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

import {
  PublicHeader,
} from '../../components/layout/PublicChrome'

import {
  Button,
  Input,
  Card,
  Checkbox,
} from '../../components/ui'

import {
  useApp,
} from '../../lib/store'

const API_BASE_URL =
  import.meta.env.VITE_API_URL ||
  'http://localhost:5000'

export default function Signup() {
  const navigate = useNavigate()

  const {
    setRole,
    setAuthSession,
  } = useApp()

  // ======================================================
  // FORM STATE
  // ======================================================

  const [fullName, setFullName] =
    useState('')

  const [email, setEmail] =
    useState('')

  const [phone, setPhone] =
    useState('')

  const [password, setPassword] =
    useState('')

  const [agreed, setAgreed] =
    useState(true)

  // ======================================================
  // UI STATE
  // ======================================================

  const [loading, setLoading] =
    useState(false)

  const [error, setError] =
    useState('')

  const [success, setSuccess] =
    useState('')

  // ======================================================
  // SIGNUP
  // ======================================================

  async function handleSubmit(event) {
    event.preventDefault()

    setError('')
    setSuccess('')

    // ----------------------------------------------------
    // BASIC VALIDATION
    // ----------------------------------------------------

    if (!fullName.trim()) {
      setError(
        'Full name is required.'
      )
      return
    }

    if (!email.trim()) {
      setError(
        'Email is required.'
      )
      return
    }

    if (!phone.trim()) {
      setError(
        'Mobile number is required.'
      )
      return
    }

    if (!/^[0-9]{10}$/.test(phone.trim())) {
      setError(
        'Please enter a valid 10-digit mobile number.'
      )
      return
    }

    if (!password) {
      setError(
        'Password is required.'
      )
      return
    }

    if (password.length < 8) {
      setError(
        'Password must be at least 8 characters.'
      )
      return
    }

    if (!agreed) {
      setError(
        'Please accept the Terms and Privacy Policy.'
      )
      return
    }

    try {
      setLoading(true)

      // ==================================================
      // REAL BACKEND SIGNUP
      // ==================================================

      const response =
        await fetch(
          `${API_BASE_URL}/api/auth/signup`,
          {
            method: 'POST',

            headers: {
              'Content-Type':
                'application/json',
            },

            body: JSON.stringify({
              email:
                email.trim(),
              password,
              fullName:
                fullName.trim(),
              phone:
                phone.trim(),
            }),
          }
        )

      const data =
        await response.json()

      // ==================================================
      // ERROR
      // ==================================================

      if (!response.ok) {
        throw new Error(
          data?.message ||
            'Unable to create account.'
        )
      }

      // ==================================================
      // SESSION AVAILABLE
      // ==================================================

      if (
        data?.session?.access_token
      ) {
        setAuthSession({
          user: data.user,
          profile:
            data.profile ||
            null,
          session:
            data.session,
        })

        setRole(
          data?.profile?.role ||
            'applicant'
        )

        navigate(
          '/dashboard',
          {
            replace: true,
          }
        )

        return
      }

      // ==================================================
      // SESSION NOT AVAILABLE
      // ==================================================

      // This can happen if Supabase email
      // confirmation is enabled.

      setSuccess(
        'Account created successfully. Please check your email to confirm your account, then login.'
      )
    } catch (err) {
      console.error(
        'Signup error:',
        err
      )

      setError(
        err?.message ||
          'Unable to create account. Please try again.'
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

          <h1 className="font-display text-2xl font-bold text-ink">
            Create your account
          </h1>

          <p className="text-sm text-ink-faint mt-1.5 mb-7">
            Store your documents once, reuse them everywhere.
          </p>

          {/* ==================================================
              ERROR
          ================================================== */}

          {error && (
            <div className="mb-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3">
              <p className="text-sm text-red-700">
                {error}
              </p>
            </div>
          )}

          {/* ==================================================
              SUCCESS
          ================================================== */}

          {success && (
            <div className="mb-5 rounded-lg border border-green-200 bg-green-50 px-4 py-3">
              <p className="text-sm text-green-700">
                {success}
              </p>
            </div>
          )}

          {/* ==================================================
              FORM
          ================================================== */}

          <form
            className="space-y-4"
            onSubmit={handleSubmit}
          >

            {/* FULL NAME */}

            <Input
              label="Full name"
              placeholder="As per your documents"
              value={fullName}
              onChange={(event) =>
                setFullName(
                  event.target.value
                )
              }
              required
              disabled={loading}
            />

            {/* EMAIL */}

            <Input
              label="Email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(event) =>
                setEmail(
                  event.target.value
                )
              }
              required
              disabled={loading}
            />

            {/* MOBILE */}

            <Input
              label="Mobile number"
              type="tel"
              placeholder="10-digit number"
              value={phone}
              onChange={(event) =>
                setPhone(
                  event.target.value.replace(
                    /\D/g,
                    ''
                  ).slice(0, 10)
                )
              }
              required
              disabled={loading}
            />

            {/* PASSWORD */}

            <Input
              label="Password"
              type="password"
              placeholder="At least 8 characters"
              value={password}
              onChange={(event) =>
                setPassword(
                  event.target.value
                )
              }
              required
              disabled={loading}
            />

            {/* TERMS */}

            <Checkbox
              label={
                <>
                  I agree to the{' '}
                  <a
                    className="text-brand-600"
                    href="#"
                    onClick={(event) =>
                      event.preventDefault()
                    }
                  >
                    Terms
                  </a>{' '}
                  and{' '}
                  <a
                    className="text-brand-600"
                    href="#"
                    onClick={(event) =>
                      event.preventDefault()
                    }
                  >
                    Privacy Policy
                  </a>
                </>
              }
              checked={agreed}
              onChange={(event) =>
                setAgreed(
                  event.target.checked
                )
              }
              required
              disabled={loading}
            />

            {/* SUBMIT */}

            <Button
              type="submit"
              className="w-full"
              size="lg"
              disabled={loading}
            >
              {loading
                ? 'Creating account...'
                : 'Create account'}
            </Button>

          </form>

          {/* LOGIN */}

          <p className="text-sm text-ink-faint mt-6 text-center">

            Already have an account?

            {' '}

            <Link
              to="/login"
              className="text-brand-600 font-medium hover:text-brand-700"
            >
              Log in
            </Link>

          </p>

        </Card>

      </div>

    </div>
  )
}