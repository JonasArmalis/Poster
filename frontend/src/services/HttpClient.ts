import axios from 'axios'

const httpClient = axios.create({
  baseURL: import.meta.env.VITE_APP_API_BASE_URL,
  timeout: 1000,
  headers: {
    'Content-Type': 'application/json'
  }
})

export default httpClient
