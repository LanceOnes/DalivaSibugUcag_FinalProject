import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api'

export const axiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  },
})

axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem('belly_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  } else {
    const guestToken = localStorage.getItem('belly_guest_token')
    if (guestToken) {
      config.headers['X-Guest-Token'] = guestToken
    }
  }
  if (config.data instanceof FormData) {
    delete config.headers['Content-Type']
  }
  return config
})

axiosInstance.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('belly_token')
      localStorage.removeItem('belly_user')
      window.dispatchEvent(new Event('belly-auth-logout'))
    }
    return Promise.reject(error)
  },
)

/** @deprecated Use axiosInstance */
export const api = axiosInstance
