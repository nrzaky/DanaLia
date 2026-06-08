import axios from 'axios'

const rawBaseUrl = import.meta.env.VITE_API_BASE_URL || ''
const cleanBaseUrl = rawBaseUrl.replace(/\/+$/, '').replace(/\/api$/, '')
const baseURL = `${cleanBaseUrl}/api`

const api = axios.create({
  baseURL,
  headers: { 'Content-Type': 'application/json' },
})

export default api
