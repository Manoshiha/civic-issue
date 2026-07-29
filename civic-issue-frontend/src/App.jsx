import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import Landing from './pages/Landing'
import Login from './pages/Login'
import Register from './pages/Register'
import ReportIssue from './pages/ReportIssue'
import Dashboard from './pages/Dashboard'
import AdminDashboard from './pages/AdminDashboard'
import LiveMap from './pages/LiveMap'
import IssueDetail from './pages/IssueDetail'

const ProtectedRoute = ({ children, allowedRole }) => {
    const { user, loading } = useAuth()

    // Wait for auth to load from localStorage
    if (loading) return <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        fontSize: '18px',
        color: '#888'
    }}>Loading...</div>

    if (!user) return <Navigate to="/login" />
    if (allowedRole && user.role !== allowedRole) return <Navigate to="/" />
    return children
}

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Landing />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/map" element={<LiveMap />} />
                <Route path="/issue/:id" element={<IssueDetail />} />
                <Route path="/report" element={
                    <ProtectedRoute><ReportIssue /></ProtectedRoute>
                } />
                <Route path="/dashboard" element={
                    <ProtectedRoute><Dashboard /></ProtectedRoute>
                } />
                <Route path="/admin" element={
                    <ProtectedRoute allowedRole="authority"><AdminDashboard /></ProtectedRoute>
                } />
            </Routes>
        </BrowserRouter>
    )
}

export default App