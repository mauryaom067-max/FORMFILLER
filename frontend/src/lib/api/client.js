const API_BASE_URL =
  import.meta.env.VITE_API_URL ||
  'http://localhost:5000'

const AUTH_TOKEN_KEY =
  'formfiller_access_token'

// ======================================================
// GET AUTH TOKEN
// ======================================================

function getAccessToken() {
  return localStorage.getItem(
    AUTH_TOKEN_KEY
  )
}

// ======================================================
// API REQUEST
// ======================================================

export async function apiRequest(
  endpoint,
  options = {}
) {
  const accessToken =
    getAccessToken()

  const headers = {
    ...(options.headers || {}),
  }

  // ----------------------------------------------------
  // JSON BODY
  // ----------------------------------------------------

  if (
    !(options.body instanceof FormData)
  ) {
    headers['Content-Type'] =
      'application/json'
  }

  // ----------------------------------------------------
  // AUTH
  // ----------------------------------------------------

  if (accessToken) {
    headers.Authorization =
      `Bearer ${accessToken}`
  }

  // ----------------------------------------------------
  // REQUEST
  // ----------------------------------------------------

  const response =
    await fetch(
      `${API_BASE_URL}${endpoint}`,
      {
        ...options,
        headers,
        credentials: 'include',
      }
    )

  // ----------------------------------------------------
  // RESPONSE
  // ----------------------------------------------------

  let data

  const contentType =
    response.headers.get(
      'content-type'
    )

  if (
    contentType?.includes(
      'application/json'
    )
  ) {
    data =
      await response.json()
  } else {
    data =
      await response.text()
  }

  // ----------------------------------------------------
  // AUTH ERROR
  // ----------------------------------------------------

  if (
    response.status === 401
  ) {
    throw new Error(
      data?.message ||
        'Your session has expired. Please login again.'
    )
  }

  // ----------------------------------------------------
  // OTHER ERROR
  // ----------------------------------------------------

  if (!response.ok) {
    throw new Error(
      data?.message ||
        `Request failed with status ${response.status}`
    )
  }

  return data
}

// ======================================================
// BACKEND HEALTH
// ======================================================

export async function checkBackendHealth() {
  return apiRequest(
    '/api/health'
  )
}

// ======================================================
// GET CURRENT AUTH TOKEN
// ======================================================

export function getAuthToken() {
  return getAccessToken()
}

// ======================================================
// CLEAR AUTH TOKEN
// ======================================================

export function clearAuthToken() {
  localStorage.removeItem(
    AUTH_TOKEN_KEY
  )

  localStorage.removeItem(
    'formfiller_refresh_token'
  )

  localStorage.removeItem(
    'formfiller_user'
  )

  localStorage.removeItem(
    'formfiller_profile'
  )

  localStorage.removeItem(
    'formfiller_role'
  )
}