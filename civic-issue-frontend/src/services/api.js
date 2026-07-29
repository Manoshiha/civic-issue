import axios from 'axios'

const API = axios.create({
    baseURL: import.meta.env.VITE_API_URL
})

// Automatically attach token to every request
API.interceptors.request.use((config) => {
    const token = localStorage.getItem('token')
    if (token) {
        config.headers.Authorization = `Bearer ${token}`
    }
    return config
})

// Auth
export const registerUser  = (data) => API.post('/api/auth/register', data)
export const loginUser     = (data) => API.post('/api/auth/login', data)
export const getProfile    = ()     => API.get('/api/auth/profile')

//  Issues
export const createIssue   = (data) => API.post('/api/issues/create', data)
export const getAllIssues   = ()     => API.get('/api/issues/all')
export const getRecentIssues = ()   => API.get('/api/issues/recent')
export const getStats      = ()     => API.get('/api/issues/stats')
export const getMyIssues   = ()     => API.get('/api/issues/my-issues')
export const getIssueById  = (id)   => API.get(`/api/issues/${id}`)
export const updateStatus  = (data) => API.put('/api/issues/update-status', data)
export const upvoteIssue   = (id)   => API.post(`/api/issues/${id}/upvote`)
export const getDeptIssues = ()     => API.get('/api/issues/department')

//  AI 
export const classifyIssue = (data) => API.post('/api/ai/classify', data)

// Stats
export const getLeaderboard = ()    => API.get('/api/stats/leaderboard')