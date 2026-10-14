import 'dotenv/config'

import express from 'express'
import cors from 'cors'
import helmet from 'helmet'

import authRoutes from './routes/auth.routes.js'
import operatorRoutes from './routes/operator.routes.js'
import profileRoutes from './routes/profile.routes.js'
import applicantRoutes from './routes/applicant.routes.js'
import documentRoutes from './routes/document.routes.js'
import formRoutes from './routes/form.routes.js'
import applicationRoutes from './routes/application.routes.js'
import applicationFinalFileRoutes from './routes/applicationFinalFile.routes.js'

import { supabase } from './config/supabase.js'

const app = express()

const PORT = process.env.PORT || 5000

const FRONTEND_URL =
  process.env.FRONTEND_URL ||
  'http://localhost:5173'

/*
 * =====================================================
 * SECURITY
 * =====================================================
 */

app.use(helmet())

/*
 * =====================================================
 * CORS
 * =====================================================
 */

app.use(
  cors({
    origin: FRONTEND_URL,
    credentials: true,
  })
)

/*
 * =====================================================
 * BODY PARSERS
 * =====================================================
 */

app.use(
  express.json({
    limit: '10mb',
  })
)

app.use(
  express.urlencoded({
    extended: true,
  })
)

/*
 * =====================================================
 * ROOT
 * =====================================================
 */

app.get('/', (req, res) => {
  return res.status(200).json({
    success: true,
    message: 'Welcome to FormFiller API',
  })
})

/*
 * =====================================================
 * HEALTH CHECK
 * =====================================================
 */

app.get('/api/health', (req, res) => {
  return res.status(200).json({
    success: true,
    message: 'FormFiller backend is running',
    service: 'formfiller-api',
    timestamp: new Date().toISOString(),
  })
})

/*
 * =====================================================
 * SUPABASE CONNECTION TEST
 * =====================================================
 */

app.get(
  '/api/supabase-test',
  async (req, res) => {
    try {
      const {
        data,
        error,
      } = await supabase
        .from('test_connection')
        .select('*')
        .limit(1)

      if (error) {
        console.error(
          'Supabase test error:',
          error
        )

        return res.status(500).json({
          success: false,
          message: 'Supabase connection failed',
          error: error.message,
        })
      }

      return res.status(200).json({
        success: true,
        message:
          'Supabase connected successfully',
        data,
      })
    } catch (error) {
      console.error(
        'Supabase test error:',
        error
      )

      return res.status(500).json({
        success: false,
        message: 'Supabase connection failed',
        error: error.message,
      })
    }
  }
)

/*
 * =====================================================
 * AUTH API
 * =====================================================
 */

app.use(
  '/api/auth',
  authRoutes
)

/*
 * =====================================================
 * OPERATOR API
 * =====================================================
 */

app.use(
  '/api/operator',
  operatorRoutes
)

/*
 * =====================================================
 * PROFILE API
 * =====================================================
 */

app.use(
  '/api/profile',
  profileRoutes
)

/*
 * =====================================================
 * APPLICANT API
 * =====================================================
 */

app.use(
  '/api/applicant',
  applicantRoutes
)

/*
 * =====================================================
 * DOCUMENT API
 * =====================================================
 */

app.use(
  '/api/documents',
  documentRoutes
)

/*
 * =====================================================
 * FORMS API
 * =====================================================
 */

app.use(
  '/api/forms',
  formRoutes
)

/*
 * =====================================================
 * APPLICATION API
 * =====================================================
 */

app.use(
  '/api/applications',
  applicationRoutes
)

/*
 * =====================================================
 * APPLICATION FINAL FILE API
 * =====================================================
 *
 * Handles:
 *
 * POST
 * /api/applications/:id/final-files
 *
 * GET
 * /api/applications/:id/final-files/current
 *
 * GET
 * /api/applications/:id/final-files
 *
 * This route handles:
 * - Operator screenshot upload
 * - Screenshot → PDF generation
 * - PDF versioning
 * - Current PDF retrieval
 * - PDF history
 *
 * The actual logic is inside:
 *
 * applicationFinalFile.controller.js
 *
 * =====================================================
 */

app.use(
  '/api/applications',
  applicationFinalFileRoutes
)

/*
 * =====================================================
 * 404 HANDLER
 * =====================================================
 */

app.use((req, res) => {
  return res.status(404).json({
    success: false,
    message: 'API route not found',
    path: req.originalUrl,
  })
})

/*
 * =====================================================
 * GLOBAL ERROR HANDLER
 * =====================================================
 */

app.use(
  (error, req, res, next) => {
    console.error(
      'Global server error:',
      error
    )

    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error:
        process.env.NODE_ENV === 'development'
          ? error.message
          : undefined,
    })
  }
)

/*
 * =====================================================
 * START SERVER
 * =====================================================
 */

app.listen(
  PORT,
  () => {
    console.log('')

    console.log(
      '🚀 FormFiller API running on:'
    )

    console.log(
      `   http://localhost:${PORT}`
    )

    console.log('')

    console.log(
      '❤️ Health check:'
    )

    console.log(
      `   http://localhost:${PORT}/api/health`
    )

    console.log('')

    console.log(
      '🗄️ Supabase test:'
    )

    console.log(
      `   http://localhost:${PORT}/api/supabase-test`
    )

    console.log('')

    console.log(
      '🔐 Auth API:'
    )

    console.log(
      `   http://localhost:${PORT}/api/auth`
    )

    console.log('')

    console.log(
      '👨‍💼 Operator API:'
    )

    console.log(
      `   http://localhost:${PORT}/api/operator`
    )

    console.log('')

    console.log(
      '👤 Profile API:'
    )

    console.log(
      `   http://localhost:${PORT}/api/profile`
    )

    console.log('')

    console.log(
      '📝 Applicant API:'
    )

    console.log(
      `   http://localhost:${PORT}/api/applicant`
    )

    console.log('')

    console.log(
      '📄 Documents API:'
    )

    console.log(
      `   http://localhost:${PORT}/api/documents`
    )

    console.log('')

    console.log(
      '📋 Forms API:'
    )

    console.log(
      `   http://localhost:${PORT}/api/forms`
    )

    console.log('')

    console.log(
      '📑 Applications API:'
    )

    console.log(
      `   http://localhost:${PORT}/api/applications`
    )

    console.log('')

    console.log(
      '📄 Final Application Files API:'
    )

    console.log(
      `   POST http://localhost:${PORT}/api/applications/:id/final-files`
    )

    console.log(
      `   GET  http://localhost:${PORT}/api/applications/:id/final-files/current`
    )

    console.log(
      `   GET  http://localhost:${PORT}/api/applications/:id/final-files`
    )

    console.log('')

    console.log(
      '💬 Chat API:'
    )

    console.log(
      `   http://localhost:${PORT}/api/applications/:id/messages`
    )

    console.log('')

    console.log(
      '✅ FormFiller backend is ready'
    )

    console.log('')
  }
)