import axios from 'axios'

const httpClient = axios.create({
  baseURL: import.meta.env.VITE_APP_API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    timeout: 1000
  }
})

export default httpClient
