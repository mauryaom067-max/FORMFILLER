import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
} from 'react'

import {
  jeeMainForm,
  applicationTimeline,
  initialChatMessages,
} from './mockData'

import { apiRequest } from './api/client'

const AppCtx = createContext(null)

// ======================================================
// LOCAL STORAGE KEYS
// ======================================================

const AUTH_TOKEN_KEY =
  'formfiller_access_token'

const REFRESH_TOKEN_KEY =
  'formfiller_refresh_token'

const USER_KEY =
  'formfiller_user'

const PROFILE_KEY =
  'formfiller_profile'

const ROLE_KEY =
  'formfiller_role'

// ======================================================
// API BASE URL
// ======================================================

const API_BASE_URL =
  import.meta.env.VITE_API_URL ||
  'http://localhost:5000'

// ======================================================
// JEE MAIN DOCUMENT INITIAL STATE
// ======================================================

const createInitialDocState = () =>
  Object.fromEntries(
    jeeMainForm.documents.map((document) => [
      document.key,
      {
        permission: false,

        status: document.inVault
          ? 'idle'
          : 'not_uploaded',

        file: null,

        previewUrl: null,

        source: document.inVault
          ? 'vault'
          : null,

        documentId: null,

        applicationDocumentId: null,
      },
    ])
  )

// ======================================================
// HELPER
// ======================================================

function getErrorMessage(
  error,
  fallback = 'Something went wrong'
) {
  if (error?.message) {
    return error.message
  }

  return fallback
}

// ======================================================
// DOCUMENT TYPE MAP
// ======================================================

const DOCUMENT_TYPE_MAP = {
  photograph: 'photograph',
  photo: 'photograph',

  signature: 'signature',

  '10th_marksheet':
    '10th_marksheet',

  marksheet_10:
    '10th_marksheet',

  '12th_marksheet':
    '12th_marksheet',

  marksheet_12:
    '12th_marksheet',

  caste_certificate:
    'caste_certificate',

  aadhaar: 'aadhaar',

  pan: 'pan',

  income_certificate:
    'income_certificate',

  domicile: 'domicile',
}

// ======================================================
// PROVIDER
// ======================================================

export function AppProvider({
  children,
}) {
  // ====================================================
  // AUTH STATE
  // ====================================================

  const [role, setRoleState] =
    useState(() => {
      return (
        localStorage.getItem(
          ROLE_KEY
        ) || null
      )
    })

  const [user, setUser] =
    useState(() => {
      try {
        const saved =
          localStorage.getItem(
            USER_KEY
          )

        return saved
          ? JSON.parse(saved)
          : null
      } catch {
        return null
      }
    })

  const [profile, setProfile] =
    useState(() => {
      try {
        const saved =
          localStorage.getItem(
            PROFILE_KEY
          )

        return saved
          ? JSON.parse(saved)
          : null
      } catch {
        return null
      }
    })

  const [accessToken, setAccessToken] =
    useState(() => {
      return localStorage.getItem(
        AUTH_TOKEN_KEY
      )
    })

  const [refreshToken, setRefreshToken] =
    useState(() => {
      return localStorage.getItem(
        REFRESH_TOKEN_KEY
      )
    })

  const [authLoading, setAuthLoading] =
    useState(true)

  // ====================================================
  // APPLICATION STATE
  // ====================================================

  const [
    jeeApplication,
    setJeeApplication,
  ] = useState(null)

  const [
    applicationLoading,
    setApplicationLoading,
  ] = useState(false)

  const [
    applicationError,
    setApplicationError,
  ] = useState('')

  // ====================================================
  // DOCUMENT STATE
  // ====================================================

  const [
    docState,
    setDocState,
  ] = useState(
    createInitialDocState()
  )

  const [
    documentError,
    setDocumentError,
  ] = useState('')

  // ====================================================
  // OTHER APP STATE
  // ====================================================

  const [flowStep, setFlowStep] =
    useState(0)

  const [
    paymentStatus,
    setPaymentStatus,
  ] = useState('unpaid')

  const [timeline, setTimeline] =
    useState(
      applicationTimeline
    )

  const [
    chatMessages,
    setChatMessages,
  ] = useState(
    initialChatMessages
  )

  const [
    reviewApproved,
    setReviewApproved,
  ] = useState(false)

  const [
    correctionRequested,
    setCorrectionRequested,
  ] = useState(false)

  const [
    operatorSentForReview,
    setOperatorSentForReview,
  ] = useState(false)

  const [
    livePhotoState,
    setLivePhotoState,
  ] = useState('idle')

  // ====================================================
  // SET ROLE
  // ====================================================

  const setRole = useCallback(
    (nextRole) => {
      setRoleState(nextRole)

      if (nextRole) {
        localStorage.setItem(
          ROLE_KEY,
          nextRole
        )
      } else {
        localStorage.removeItem(
          ROLE_KEY
        )
      }
    },
    []
  )

  // ====================================================
  // SAVE AUTH SESSION
  // ====================================================

  const setAuthSession =
    useCallback(
      ({
        user: nextUser,
        profile: nextProfile,
        session,
      }) => {
        const nextAccessToken =
          session?.access_token ||
          null

        const nextRefreshToken =
          session?.refresh_token ||
          null

        setUser(
          nextUser || null
        )

        setProfile(
          nextProfile || null
        )

        setAccessToken(
          nextAccessToken
        )

        setRefreshToken(
          nextRefreshToken
        )

        if (nextUser) {
          localStorage.setItem(
            USER_KEY,
            JSON.stringify(
              nextUser
            )
          )
        } else {
          localStorage.removeItem(
            USER_KEY
          )
        }

        if (nextProfile) {
          localStorage.setItem(
            PROFILE_KEY,
            JSON.stringify(
              nextProfile
            )
          )
        } else {
          localStorage.removeItem(
            PROFILE_KEY
          )
        }

        if (nextAccessToken) {
          localStorage.setItem(
            AUTH_TOKEN_KEY,
            nextAccessToken
          )
        } else {
          localStorage.removeItem(
            AUTH_TOKEN_KEY
          )
        }

        if (nextRefreshToken) {
          localStorage.setItem(
            REFRESH_TOKEN_KEY,
            nextRefreshToken
          )
        } else {
          localStorage.removeItem(
            REFRESH_TOKEN_KEY
          )
        }

        const nextRole =
          nextProfile?.role ||
          nextUser?.user_metadata
            ?.role ||
          'applicant'

        setRole(nextRole)
      },
      [setRole]
    )

  // ====================================================
  // UPDATE ACCESS TOKEN
  // ====================================================

  const updateAccessToken =
    useCallback(
      (token) => {
        const nextToken =
          token || null

        setAccessToken(
          nextToken
        )

        if (nextToken) {
          localStorage.setItem(
            AUTH_TOKEN_KEY,
            nextToken
          )
        } else {
          localStorage.removeItem(
            AUTH_TOKEN_KEY
          )
        }
      },
      []
    )

  // ====================================================
  // LOAD CURRENT USER
  // ====================================================

  const loadCurrentUser =
    useCallback(
      async () => {
        const token =
          localStorage.getItem(
            AUTH_TOKEN_KEY
          )

        if (!token) {
          setUser(null)
          setProfile(null)
          setAuthLoading(false)

          return null
        }

        try {
          const data =
            await apiRequest(
              '/api/auth/me',
              {
                headers: {
                  Authorization:
                    `Bearer ${token}`,
                },
              }
            )

          const currentUser =
            data?.user || null

          const currentProfile =
            data?.profile || null

          setUser(
            currentUser
          )

          setProfile(
            currentProfile
          )

          if (currentUser) {
            localStorage.setItem(
              USER_KEY,
              JSON.stringify(
                currentUser
              )
            )
          }

          if (currentProfile) {
            localStorage.setItem(
              PROFILE_KEY,
              JSON.stringify(
                currentProfile
              )
            )

            if (
              currentProfile.role
            ) {
              setRole(
                currentProfile.role
              )
            }
          }

          return currentUser
        } catch (error) {
          console.error(
            'Load current user error:',
            error
          )

          if (
            error?.message
              ?.toLowerCase()
              .includes('token')
          ) {
            setAccessToken(null)

            localStorage.removeItem(
              AUTH_TOKEN_KEY
            )
          }

          return null
        }
      },
      [setRole]
    )

  // ====================================================
  // INITIAL AUTH CHECK
  // ====================================================

  useEffect(() => {
    let mounted = true

    async function initialize() {
      try {
        await loadCurrentUser()
      } finally {
        if (mounted) {
          setAuthLoading(false)
        }
      }
    }

    initialize()

    return () => {
      mounted = false
    }
  }, [loadCurrentUser])

  // ====================================================
  // LOGOUT
  // ====================================================

  const logout =
    useCallback(
      async () => {
        const token =
          localStorage.getItem(
            AUTH_TOKEN_KEY
          )

        try {
          if (token) {
            await apiRequest(
              '/api/auth/logout',
              {
                method: 'POST',

                headers: {
                  Authorization:
                    `Bearer ${token}`,
                },
              }
            )
          }
        } catch (error) {
          console.warn(
            'Logout API error:',
            error
          )
        }

        setUser(null)
        setProfile(null)
        setAccessToken(null)
        setRefreshToken(null)
        setRole(null)

        setJeeApplication(null)

        setDocState(
          createInitialDocState()
        )

        localStorage.removeItem(
          AUTH_TOKEN_KEY
        )

        localStorage.removeItem(
          REFRESH_TOKEN_KEY
        )

        localStorage.removeItem(
          USER_KEY
        )

        localStorage.removeItem(
          PROFILE_KEY
        )

        localStorage.removeItem(
          ROLE_KEY
        )
      },
      [setRole]
    )

  // ====================================================
  // LOAD JEE MAIN FORM
  // ====================================================

  const loadJeeMainForm =
    useCallback(
      async () => {
        const data =
          await apiRequest(
            '/api/forms/JEE-MAIN'
          )

        if (!data?.form) {
          throw new Error(
            'JEE Main form was not found.'
          )
        }

        return data.form
      },
      []
    )

  // ====================================================
  // LOAD MY APPLICATIONS
  // ====================================================

  const loadMyApplications =
    useCallback(
      async () => {
        if (!accessToken) {
          throw new Error(
            'Authorization token is required'
          )
        }

        return apiRequest(
          '/api/applications',
          {
            headers: {
              Authorization:
                `Bearer ${accessToken}`,
            },
          }
        )
      },
      [accessToken]
    )

  // ====================================================
  // LOAD APPLICATION BY ID
  // ====================================================

  const loadApplication =
    useCallback(
      async (applicationId) => {
        if (!applicationId) {
          return null
        }

        if (!accessToken) {
          throw new Error(
            'Authorization token is required'
          )
        }

        const data =
          await apiRequest(
            `/api/applications/${applicationId}`,
            {
              headers: {
                Authorization:
                  `Bearer ${accessToken}`,
              },
            }
          )

        const application =
          data?.application ||
          data?.data ||
          data

        if (application) {
          setJeeApplication(
            application
          )
        }

        return application
      },
      [accessToken]
    )

  // ====================================================
  // LOAD APPLICATION DOCUMENTS
  // ====================================================

  const loadApplicationDocuments =
    useCallback(
      async (application) => {
        if (!application?.id) {
          return []
        }

        if (!accessToken) {
          return []
        }

        try {
          const data =
            await apiRequest(
              `/api/applications/${application.id}/documents`,
              {
                headers: {
                  Authorization:
                    `Bearer ${accessToken}`,
                },
              }
            )

          const documents =
            Array.isArray(
              data?.documents
            )
              ? data.documents
              : []

          const nextState =
            createInitialDocState()

          documents.forEach(
            (
              applicationDocument
            ) => {
              const key =
                applicationDocument.document_type

              if (!nextState[key]) {
                return
              }

              nextState[key] = {
                ...nextState[key],

                permission:
                  true,

                status:
                  applicationDocument.status ===
                  'rejected'
                    ? 'not_uploaded'
                    : 'ready',

                documentId:
                  applicationDocument.document_id,

                applicationDocumentId:
                  applicationDocument.id,

                source:
                  applicationDocument
                    .documents
                    ?.source ||
                  'vault',
              }
            }
          )

          setDocState(
            nextState
          )

          return documents
        } catch (error) {
          console.error(
            'Load application documents error:',
            error
          )

          return []
        }
      },
      [accessToken]
    )

  // ====================================================
  // ENSURE JEE APPLICATION
  //
  // IMPORTANT:
  // We DO NOT call /api/applicant here.
  //
  // /api/applications already authenticates the
  // logged-in user and resolves the applicant.
  // ====================================================

  const ensureJeeApplication =
    useCallback(
      async (currentUser = user) => {
        if (!currentUser?.id) {
          setJeeApplication(null)

          throw new Error(
            'Please login to continue.'
          )
        }

        if (!accessToken) {
          throw new Error(
            'Authorization token is required'
          )
        }

        setApplicationLoading(
          true
        )

        setApplicationError('')

        try {
          // ==========================================
          // 1. GET JEE MAIN FORM
          // ==========================================

          const form =
            await loadJeeMainForm()

          if (!form?.id) {
            throw new Error(
              'JEE Main form was not found.'
            )
          }

          // ==========================================
          // 2. GET USER APPLICATIONS
          // ==========================================

          const applicationsResponse =
            await loadMyApplications()

          const applications =
            Array.isArray(
              applicationsResponse
                ?.applications
            )
              ? applicationsResponse.applications
              : Array.isArray(
                  applicationsResponse
                )
                ? applicationsResponse
                : []

          // ==========================================
          // 3. FIND JEE MAIN APPLICATION
          // ==========================================

          let existingApplication =
            applications.find(
              (application) =>
                application.form_id ===
                form.id
            )

          // ==========================================
          // 4. CREATE IF MISSING
          // ==========================================

          if (!existingApplication) {
            const createResponse =
              await apiRequest(
                '/api/applications',
                {
                  method: 'POST',

                  headers: {
                    Authorization:
                      `Bearer ${accessToken}`,
                  },

                  body: JSON.stringify({
                    formId:
                      form.id,

                    formCode:
                      form.form_code,

                    status:
                      'draft',

                    currentStep: 1,

                    formData: {},
                  }),
                }
              )

            existingApplication =
              createResponse?.application ||
              createResponse?.data ||
              createResponse

            if (
              !existingApplication?.id
            ) {
              throw new Error(
                'Application could not be created.'
              )
            }
          }

          // ==========================================
          // 5. STORE APPLICATION
          // ==========================================

          const finalApplication = {
            ...existingApplication,

            form,
          }

          setJeeApplication(
            finalApplication
          )

          // ==========================================
          // 6. LOAD APPLICATION DOCUMENTS
          // ==========================================

          await loadApplicationDocuments(
            finalApplication
          )

          return finalApplication
        } catch (error) {
          console.error(
            'Ensure JEE application error:',
            error
          )

          const message =
            getErrorMessage(
              error,
              'Unable to prepare your JEE Main application.'
            )

          setApplicationError(
            message
          )

          throw error
        } finally {
          setApplicationLoading(
            false
          )
        }
      },
      [
        user,
        accessToken,
        loadJeeMainForm,
        loadMyApplications,
        loadApplicationDocuments,
      ]
    )

  // ====================================================
  // GRANT VAULT PERMISSION
  // ====================================================

  const grantPermission =
    useCallback(
      async (key) => {
        setDocumentError('')

        if (!user?.id) {
          setDocumentError(
            'Please login to continue.'
          )

          return false
        }

        if (!accessToken) {
          setDocumentError(
            'Authorization token is required'
          )

          return false
        }

        if (!jeeApplication?.id) {
          setDocumentError(
            'JEE Main application is not ready yet.'
          )

          return false
        }

        const documentType =
          DOCUMENT_TYPE_MAP[key] ||
          key

        setDocState(
          (state) => ({
            ...state,

            [key]: {
              ...state[key],

              permission:
                true,

              status:
                'processing',

              source:
                'vault',
            },
          })
        )

        try {
          const response =
            await apiRequest(
              `/api/applications/${jeeApplication.id}/documents`,
              {
                method: 'POST',

                headers: {
                  Authorization:
                    `Bearer ${accessToken}`,
                },

                body: JSON.stringify({
                  documentType,

                  source:
                    'vault',

                  isRequired:
                    true,
                }),
              }
            )

          const applicationDocument =
            response?.applicationDocument ||
            response?.data ||
            response

          setDocState(
            (state) => ({
              ...state,

              [key]: {
                ...state[key],

                permission:
                  true,

                status:
                  'ready',

                source:
                  'vault',

                documentId:
                  applicationDocument
                    ?.document_id ||
                  null,

                applicationDocumentId:
                  applicationDocument
                    ?.id ||
                  null,
              },
            })
          )

          return true
        } catch (error) {
          console.error(
            'Grant document permission error:',
            error
          )

          setDocState(
            (state) => ({
              ...state,

              [key]: {
                ...state[key],

                permission:
                  false,

                status:
                  'idle',

                source:
                  'vault',
              },
            })
          )

          setDocumentError(
            getErrorMessage(
              error,
              'Unable to use this document.'
            )
          )

          return false
        }
      },
      [
        user,
        accessToken,
        jeeApplication,
      ]
    )

  // ====================================================
  // UPLOAD DOCUMENT
  // ====================================================

  const uploadDocument =
    useCallback(
      async (
        key,
        file = null
      ) => {
        setDocumentError('')

        if (!file) {
          setDocumentError(
            'Please select a document.'
          )

          return false
        }

        if (!user?.id) {
          setDocumentError(
            'Please login to continue.'
          )

          return false
        }

        if (!accessToken) {
          setDocumentError(
            'Authorization token is required'
          )

          return false
        }

        if (!jeeApplication?.id) {
          setDocumentError(
            'JEE Main application is not ready yet.'
          )

          return false
        }

        const documentType =
          DOCUMENT_TYPE_MAP[key] ||
          key

        // ==========================================
        // PREVIEW
        // ==========================================

        const previewUrl =
          URL.createObjectURL(
            file
          )

        setDocState(
          (state) => ({
            ...state,

            [key]: {
              ...state[key],

              permission:
                true,

              status:
                'uploading',

              file,

              previewUrl,

              source:
                'upload',
            },
          })
        )

        try {
          // ==========================================
          // FORM DATA
          // ==========================================

          const formData =
            new FormData()

          formData.append(
            'file',
            file
          )

          formData.append(
            'documentType',
            documentType
          )

          formData.append(
            'source',
            'upload'
          )

          // ==========================================
          // UPLOAD TO DOCUMENT API
          // ==========================================

          const response =
            await fetch(
              `${API_BASE_URL}/api/documents/upload`,
              {
                method: 'POST',

                headers: {
                  Authorization:
                    `Bearer ${accessToken}`,
                },

                credentials:
                  'include',

                body: formData,
              }
            )

          const data =
            await response.json()

          if (!response.ok) {
            throw new Error(
              data?.message ||
                'Document upload failed'
            )
          }

          const uploadedDocument =
            data?.document ||
            data?.data ||
            data

          if (
            !uploadedDocument?.id
          ) {
            throw new Error(
              'Document uploaded but document ID was not returned.'
            )
          }

          // ==========================================
          // ATTACH TO APPLICATION
          // ==========================================

          const attachResponse =
            await apiRequest(
              `/api/applications/${jeeApplication.id}/documents`,
              {
                method: 'POST',

                headers: {
                  Authorization:
                    `Bearer ${accessToken}`,
                },

                body: JSON.stringify({
                  documentId:
                    uploadedDocument.id,

                  documentType,

                  source:
                    'upload',

                  isRequired:
                    true,
                }),
              }
            )

          const applicationDocument =
            attachResponse
              ?.applicationDocument ||
            attachResponse?.data ||
            attachResponse

          // ==========================================
          // READY
          // ==========================================

          setDocState(
            (state) => ({
              ...state,

              [key]: {
                ...state[key],

                permission:
                  true,

                status:
                  'ready',

                file,

                previewUrl,

                source:
                  'upload',

                documentId:
                  uploadedDocument.id,

                applicationDocumentId:
                  applicationDocument
                    ?.id ||
                  null,
              },
            })
          )

          return true
        } catch (error) {
          console.error(
            'Upload document error:',
            error
          )

          URL.revokeObjectURL(
            previewUrl
          )

          setDocState(
            (state) => ({
              ...state,

              [key]: {
                ...state[key],

                permission:
                  false,

                status:
                  'not_uploaded',

                file:
                  null,

                previewUrl:
                  null,

                source:
                  null,

                documentId:
                  null,

                applicationDocumentId:
                  null,
              },
            })
          )

          setDocumentError(
            getErrorMessage(
              error,
              'Unable to upload document.'
            )
          )

          return false
        }
      },
      [
        user,
        accessToken,
        jeeApplication,
      ]
    )

  // ====================================================
  // UPDATE APPLICATION DATA
  // ====================================================

  const updateApplicationData =
    useCallback(
      async (
        formData,
        currentStep = null
      ) => {
        if (!jeeApplication?.id) {
          throw new Error(
            'Application is not available.'
          )
        }

        if (!accessToken) {
          throw new Error(
            'Authorization token is required'
          )
        }

        const payload = {}

        if (
          formData !== undefined
        ) {
          payload.formData =
            formData
        }

        if (
          currentStep !== null
        ) {
          payload.currentStep =
            currentStep
        }

        const response =
          await apiRequest(
            `/api/applications/${jeeApplication.id}`,
            {
              method: 'PATCH',

              headers: {
                Authorization:
                  `Bearer ${accessToken}`,
              },

              body: JSON.stringify(
                payload
              ),
            }
          )

        const updated =
          response?.application ||
          response?.data ||
          response

        if (updated) {
          setJeeApplication(
            (previous) => ({
              ...previous,
              ...updated,
            })
          )
        }

        return updated
      },
      [
        jeeApplication,
        accessToken,
      ]
    )

  // ====================================================
  // UPDATE APPLICATION STEP
  // ====================================================

  const updateApplicationStep =
    useCallback(
      async (step) => {
        if (!jeeApplication?.id) {
          throw new Error(
            'Application is not available.'
          )
        }

        return updateApplicationData(
          undefined,
          step
        )
      },
      [
        jeeApplication,
        updateApplicationData,
      ]
    )

  // ====================================================
  // CHAT
  // ====================================================

  const addChatMessage =
    useCallback(
      (msg) => {
        setChatMessages(
          (messages) => [
            ...messages,

            {
              id:
                messages.length +
                1,

              time:
                'Just now',

              ...msg,
            },
          ]
        )
      },
      []
    )

  // ====================================================
  // CORRECTION REQUEST
  // ====================================================

  const requestCorrection =
    useCallback(
      (text) => {
        setCorrectionRequested(
          true
        )

        setReviewApproved(
          false
        )

        addChatMessage({
          from:
            'applicant',

          text,
        })

        setTimeout(() => {
          addChatMessage({
            from:
              'system',

            text:
              'Correction requested',

            tone:
              'amber',
          })
        }, 500)

        setTimeout(() => {
          addChatMessage({
            from:
              'operator',

            text:
              "Got it — I'll fix this and share an updated review shortly.",
          })
        }, 1400)

        setTimeout(() => {
          addChatMessage({
            from:
              'system',

            text:
              'Updated review available',

            tone:
              'blue',
          })

          setCorrectionRequested(
            false
          )
        }, 3200)
      },
      [addChatMessage]
    )

  // ====================================================
  // CONTEXT VALUE
  // ====================================================

  const value = {
    // AUTH
    role,
    setRole,
    user,
    setUser,
    profile,
    setProfile,
    accessToken,
    refreshToken,
    authLoading,
    setAuthSession,
    updateAccessToken,
    loadCurrentUser,
    logout,

    // APPLICATION
    jeeApplication,
    setJeeApplication,
    applicationLoading,
    applicationError,
    setApplicationError,
    ensureJeeApplication,
    loadJeeMainForm,
    loadMyApplications,
    loadApplication,
    updateApplicationData,
    updateApplicationStep,

    // DOCUMENTS
    docState,
    setDocState,
    documentError,
    setDocumentError,
    grantPermission,
    uploadDocument,
    loadApplicationDocuments,

    // FLOW
    flowStep,
    setFlowStep,
    paymentStatus,
    setPaymentStatus,
    timeline,
    setTimeline,

    // CHAT
    chatMessages,
    addChatMessage,

    // REVIEW
    reviewApproved,
    setReviewApproved,
    correctionRequested,
    requestCorrection,
    operatorSentForReview,
    setOperatorSentForReview,

    // LIVE PHOTO
    livePhotoState,
    setLivePhotoState,
  }

  return (
    <AppCtx.Provider
      value={value}
    >
      {children}
    </AppCtx.Provider>
  )
}

// ======================================================
// USE APP
// ======================================================

export function useApp() {
  const ctx =
    useContext(AppCtx)

  if (!ctx) {
    throw new Error(
      'useApp must be used within AppProvider'
    )
  }

  return ctx
}