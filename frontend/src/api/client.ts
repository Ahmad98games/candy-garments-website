import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios'

// Retry configuration
const MAX_RETRIES = 3
const RETRY_DELAY = 1000 // 1 second base delay

const client = axios.create({
  // Always use relative path. 
  // Dev: handled by Vite Proxy (vite.config.ts) -> localhost:5000
  // Prod: handled by Vercel Rewrites (vercel.json) -> Serverless Function
  baseURL: '/api',
  timeout: 10000, // Reduced to 10s for faster fallback
  headers: {
    'Content-Type': 'application/json',
    'X-Api-Version': '1'
  }
})

// Add retry count to request config
declare module 'axios' {
  export interface InternalAxiosRequestConfig {
    _retryCount?: number
  }
}

// Add a request interceptor
client.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Add a response interceptor with retry logic
client.interceptors.response.use(
  (response) => {
    return response
  },
  async (error: AxiosError) => {
    // Global Auth Error Handling
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      // Only redirect if not already on login page to avoid loops
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
      return Promise.reject(error);
    }

    const config = error.config as InternalAxiosRequestConfig

    // Initialize retry count
    if (!config._retryCount) {
      config._retryCount = 0
    }

    // Check if we should retry
    const shouldRetry = (
      config._retryCount < MAX_RETRIES &&
      (
        // Retry on network errors (backend not ready)
        error.code === 'ECONNREFUSED' ||
        error.code === 'ERR_NETWORK' ||
        !error.response ||
        // Retry on 5xx server errors
        (error.response && error.response.status >= 500)
      )
    )

    if (shouldRetry && config) {
      config._retryCount++

      // Exponential backoff: wait longer for each retry
      const delay = RETRY_DELAY * Math.pow(2, config._retryCount - 1)

      console.log(`Retrying request (attempt ${config._retryCount}/${MAX_RETRIES}) after ${delay}ms...`)

      await new Promise(resolve => setTimeout(resolve, delay))

      return client(config)
    }

    // Handle errors after retries exhausted
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      // Return the error message from the server if available, otherwise generic
      const data = error.response.data as { error?: any, message?: any, reason?: string }

      let errorMessage = 'An internal server error occurred';

      if (data) {
        if (typeof data === 'string') {
          errorMessage = data;
        } else if (data.message) {
          errorMessage = typeof data.message === 'object' ? JSON.stringify(data.message) : data.message;
        } else if (data.error) {
          errorMessage = typeof data.error === 'object' ? JSON.stringify(data.error) : data.error;
        } else if (data.reason) {
          errorMessage = data.reason;
        }
      }
      return Promise.reject(new Error(errorMessage))
    } else if (error.request) {
      // The request was made but no response was received
      return Promise.reject(new Error('Unable to reach the server. Please check your internet connection or try again later.'))
    } else {
      // Something happened in setting up the request
      return Promise.reject(new Error('Failed to make request. Please try again.'))
    }
  }
)

export default client

export async function trackEvent(event: {
  type: string
  path?: string
  sessionId?: string
  userId?: string
  referrer?: string
  userAgent?: string
  screen?: { width: number; height: number }
  payload?: any
}) {
  try {
    await client.post('/track', event)
  } catch { }
}