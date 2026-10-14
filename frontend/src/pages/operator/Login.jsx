import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

import {
  Logo,
  Button,
  Input,
  Card,
} from '../../components/ui'

import { useApp } from '../../lib/store'


const API_BASE_URL =
  import.meta.env.VITE_API_URL ||
  'http://localhost:5000'


export default function OperatorLogin() {
  const navigate = useNavigate()

  const { setRole } = useApp()

  const [email, setEmail] =
    useState('')

  const [password, setPassword] =
    useState('')

  const [loading, setLoading] =
    useState(false)

  const [error, setError] =
    useState('')


  // ====================================================
  // LOGIN
  // ====================================================

  async function handleSubmit(e) {
    e.preventDefault()

    setError('')

    if (!email || !password) {
      setError(
        'Email and password are required.'
      )

      return
    }


    try {
      setLoading(true)


      // ------------------------------------------------
      // OPERATOR LOGIN API
      // ------------------------------------------------

      const response =
        await fetch(
          `${API_BASE_URL}/api/operator/login`,
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
            }),
          }
        )


      const data =
        await response.json()


      if (!response.ok) {
        throw new Error(
          data?.message ||
          'Operator login failed'
        )
      }


      // ------------------------------------------------
      // VERIFY RESPONSE
      // ------------------------------------------------

      if (
        !data?.user ||
        !data?.profile ||
        !data?.session?.access_token
      ) {
        throw new Error(
          'Invalid operator login response'
        )
      }


      // ------------------------------------------------
      // VERIFY OPERATOR ROLE
      // ------------------------------------------------

      if (
        data.profile.role !==
        'operator'
      ) {
        throw new Error(
          'This account does not have operator access.'
        )
      }


      // ------------------------------------------------
      // SAVE AUTH SESSION
      // ------------------------------------------------

      localStorage.setItem(
        'formfiller_access_token',
        data.session.access_token
      )

      localStorage.setItem(
        'formfiller_refresh_token',
        data.session.refresh_token ||
          ''
      )


      // ------------------------------------------------
      // SAVE USER
      // ------------------------------------------------

      localStorage.setItem(
        'formfiller_user',
        JSON.stringify(
          data.user
        )
      )


      // ------------------------------------------------
      // SAVE OPERATOR PROFILE
      // ------------------------------------------------

      localStorage.setItem(
        'formfiller_profile',
        JSON.stringify(
          data.profile
        )
      )


      localStorage.setItem(
        'formfiller_role',
        'operator'
      )


      // ------------------------------------------------
      // UPDATE APP STATE
      // ------------------------------------------------

      if (setRole) {
        setRole('operator')
      }


      // ------------------------------------------------
      // GO TO DASHBOARD
      // ------------------------------------------------

      navigate(
        '/operator'
      )

    } catch (error) {
      console.error(
        'Operator login error:',
        error
      )

      setError(
        error.message ||
        'Unable to login as operator'
      )

    } finally {
      setLoading(false)
    }
  }


  return (
    <div className="min-h-screen bg-surface flex flex-col">

      {/* ==================================================
          HEADER
      ================================================== */}

      <div className="h-16 flex items-center px-8">

        <Link to="/">
          <Logo />
        </Link>

      </div>


      {/* ==================================================
          LOGIN
      ================================================== */}

      <div className="flex-1 flex items-center justify-center px-6 pb-16">

        <Card className="w-full max-w-sm p-8">

          <p className="text-xs font-medium text-brand-600 mb-2">
            Operator access
          </p>


          <h1 className="font-display text-2xl font-bold text-ink">
            Operator log in
          </h1>


          <p className="text-sm text-ink-faint mt-1.5 mb-7">
            Access is provisioned by your FormFiller admin.
          </p>


          {/* ==================================================
              ERROR
          ================================================== */}

          {error && (
            <div className="mb-5 rounded-lg border border-danger/20 bg-danger-bg px-4 py-3">

              <p className="text-sm text-danger">
                {error}
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

            <Input
              label="Work email"
              type="email"
              placeholder="you@formfiller.in"
              value={email}
              onChange={(e) =>
                setEmail(
                  e.target.value
                )
              }
              autoComplete="username"
              required
            />


            <Input
              label="Password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) =>
                setPassword(
                  e.target.value
                )
              }
              autoComplete="current-password"
              required
            />


            <Button
              type="submit"
              className="w-full"
              size="lg"
              disabled={loading}
            >
              {loading
                ? 'Logging in...'
                : 'Log in'}
            </Button>

          </form>

        </Card>

      </div>

    </div>
  )
}