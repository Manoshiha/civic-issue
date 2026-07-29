import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { loginUser } from '../services/api'
import Navbar from '../components/Navbar'

const Login = () => {
    const [form, setForm] = useState({ email: '', password: '' })
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)
    const navigate = useNavigate()

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value })
        setError('')
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (!form.email || !form.password) {
            setError('Please fill in all fields')
            return
        }
        setLoading(true)
        try {
             console.log('Trying to login...')
            const res = await loginUser(form)
             console.log('Login response:', res.data)

            localStorage.setItem('token', res.data.token)
            localStorage.setItem('user', JSON.stringify(res.data.user))

            console.log('Token saved:', localStorage.getItem('token'))

            const role = res.data.user.role
            console.log('Role:', role)

            window.location.replace('http://localhost:5173/dashboard')
        }

        catch (err) {
        console.log('Login error:', err)
        console.log('Error response:', err.response)
        setError(err.response?.data?.message || 'Login failed')
        setLoading(false)
    }

    }

    return (
        <>
            <Navbar />
            <div style={styles.container}>
                <div style={styles.card}>

                    <div style={styles.header}>
                        <h1 style={styles.title}>🏙️ CivicFix</h1>
                        <h2 style={styles.subtitle}>Welcome Back</h2>
                        <p style={styles.desc}>Login to report and track civic issues</p>
                    </div>

                    <form onSubmit={handleSubmit} style={styles.form}>
                        <div style={styles.field}>
                            <label style={styles.label}>Email Address</label>
                            <input
                                type="email"
                                name="email"
                                value={form.email}
                                onChange={handleChange}
                                placeholder="you@email.com"
                                style={styles.input}
                            />
                        </div>

                        <div style={styles.field}>
                            <label style={styles.label}>Password</label>
                            <input
                                type="password"
                                name="password"
                                value={form.password}
                                onChange={handleChange}
                                placeholder="Enter your password"
                                style={styles.input}
                            />
                        </div>

                        {error && <p style={styles.error}>⚠️ {error}</p>}

                        <button
                            type="submit"
                            style={loading ? { ...styles.btn, opacity: 0.7 } : styles.btn}
                            disabled={loading}
                        >
                            {loading ? 'Logging in...' : 'Login'}
                        </button>
                    </form>

                    <p style={styles.footer}>
                        Don't have an account?{' '}
                        <a href="/register" style={styles.footerLink}>Register here</a>
                    </p>

                </div>
            </div>
            </>
            )
}

            const styles = {
                container: {
                minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#f5f7fa',
            padding: '20px',
    },
            card: {
                backgroundColor: '#fff',
            borderRadius: '16px',
            padding: '40px',
            width: '100%',
            maxWidth: '420px',
            boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
    },
            header: {textAlign: 'center', marginBottom: '30px' },
            title: {fontSize: '28px', color: '#1a1a2e', marginBottom: '8px' },
            subtitle: {fontSize: '20px', color: '#333', marginBottom: '6px' },
            desc: {color: '#888', fontSize: '14px' },
            form: {display: 'flex', flexDirection: 'column', gap: '18px' },
            field: {display: 'flex', flexDirection: 'column', gap: '6px' },
            label: {fontSize: '14px', fontWeight: 'bold', color: '#444' },
            input: {
                padding: '12px 16px',
            borderRadius: '8px',
            border: '1px solid #ddd',
            fontSize: '15px',
            outline: 'none',
    },
            error: {color: '#e94560', fontSize: '14px', textAlign: 'center' },
            btn: {
                backgroundColor: '#e94560',
            color: '#fff',
            padding: '14px',
            borderRadius: '8px',
            border: 'none',
            fontSize: '16px',
            fontWeight: 'bold',
            cursor: 'pointer',
            marginTop: '8px',
    },
            footer: {textAlign: 'center', marginTop: '20px', color: '#888', fontSize: '14px' },
            footerLink: {color: '#e94560', fontWeight: 'bold' },
}

            export default Login