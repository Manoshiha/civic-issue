import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { registerUser } from '../services/api'
import Navbar from '../components/Navbar'

const Register = () => {
    const [form, setForm]       = useState({
        full_name: '', email: '', password: '',
        confirm_password: '', role: 'citizen', department_id: ''
    })
    const [errors, setErrors]   = useState({})
    const [success, setSuccess] = useState('')
    const [loading, setLoading] = useState(false)
    const navigate              = useNavigate()

    const departments = [
        { id: 1, name: 'Roads & Infrastructure' },
        { id: 2, name: 'Water & Drainage' },
        { id: 3, name: 'Waste Management' },
        { id: 4, name: 'Street Lighting' },
        { id: 5, name: 'Parks & Public Spaces' },
        { id: 6, name: 'General' },
    ]

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value })
        setErrors({ ...errors, [e.target.name]: '' })
    }

    const validate = () => {
        const newErrors = {}
        if (!form.full_name)                          newErrors.full_name = 'Name is required'
        if (!form.email)                              newErrors.email     = 'Email is required'
        if (!form.password)                           newErrors.password  = 'Password is required'
        if (form.password.length < 6)                 newErrors.password  = 'Minimum 6 characters'
        if (form.password !== form.confirm_password)  newErrors.confirm_password = 'Passwords do not match'
        if (form.role === 'authority' && !form.department_id) newErrors.department_id = 'Select a department'
        return newErrors
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        const newErrors = validate()
        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors)
            return
        }
        setLoading(true)
        try {
            await registerUser({
                full_name:     form.full_name,
                email:         form.email,
                password:      form.password,
                role:          form.role,
                department_id: form.role === 'authority' ? form.department_id : null
            })
            setSuccess('✅ Registration successful! Redirecting to login...')
            setTimeout(() => navigate('/login'), 2000)
        } catch (err) {
            setErrors({ general: err.response?.data?.message || 'Registration failed' })
        } finally {
            setLoading(false)
        }
    }

    return (
        <>
            <Navbar />
            <div style={styles.container}>
                <div style={styles.card}>
                    {/* Header */}
                    <div style={styles.header}>
                        <h1 style={styles.title}>🏙️ CivicFix</h1>
                        <h2 style={styles.subtitle}>Create Account</h2>
                        <p style={styles.desc}>Join us to report and fix civic issues</p>
                    </div>

                    {/* Success */}
                    {success && <p style={styles.success}>{success}</p>}

                    {/* Form */}
                    <form onSubmit={handleSubmit} style={styles.form}>
                        {/* Full Name */}
                        <div style={styles.field}>
                            <label style={styles.label}>Full Name</label>
                            <input
                                name="full_name"
                                value={form.full_name}
                                onChange={handleChange}
                                placeholder="Your full name"
                                style={styles.input}
                            />
                            {errors.full_name && <span style={styles.fieldError}>{errors.full_name}</span>}
                        </div>

                        {/* Email */}
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
                            {errors.email && <span style={styles.fieldError}>{errors.email}</span>}
                        </div>

                        {/* Password */}
                        <div style={styles.field}>
                            <label style={styles.label}>Password</label>
                            <input
                                type="password"
                                name="password"
                                value={form.password}
                                onChange={handleChange}
                                placeholder="Minimum 6 characters"
                                style={styles.input}
                            />
                            {errors.password && <span style={styles.fieldError}>{errors.password}</span>}
                        </div>

                        {/* Confirm Password */}
                        <div style={styles.field}>
                            <label style={styles.label}>Confirm Password</label>
                            <input
                                type="password"
                                name="confirm_password"
                                value={form.confirm_password}
                                onChange={handleChange}
                                placeholder="Repeat your password"
                                style={styles.input}
                            />
                            {errors.confirm_password && <span style={styles.fieldError}>{errors.confirm_password}</span>}
                        </div>

                        {/* Role */}
                        <div style={styles.field}>
                            <label style={styles.label}>Register As</label>
                            <select
                                name="role"
                                value={form.role}
                                onChange={handleChange}
                                style={styles.input}
                            >
                                <option value="citizen">Citizen</option>
                                <option value="authority">Authority Officer</option>
                            </select>
                        </div>

                        {/* Department (only for authority) */}
                        {form.role === 'authority' && (
                            <div style={styles.field}>
                                <label style={styles.label}>Department</label>
                                <select
                                    name="department_id"
                                    value={form.department_id}
                                    onChange={handleChange}
                                    style={styles.input}
                                >
                                    <option value="">Select Department</option>
                                    {departments.map(d => (
                                        <option key={d.id} value={d.id}>{d.name}</option>
                                    ))}
                                </select>
                                {errors.department_id && <span style={styles.fieldError}>{errors.department_id}</span>}
                            </div>
                        )}

                        {/* General Error */}
                        {errors.general && <p style={styles.error}>⚠️ {errors.general}</p>}

                        {/* Submit */}
                        <button
                            type="submit"
                            style={loading ? {...styles.btn, opacity: 0.7} : styles.btn}
                            disabled={loading}
                        >
                            {loading ? 'Registering...' : 'Create Account'}
                        </button>
                    </form>

                    {/* Footer */}
                    <p style={styles.footer}>
                        Already have an account?{' '}
                        <Link to="/login" style={styles.footerLink}>Login here</Link>
                    </p>
                </div>
            </div>
        </>
    )
}

const styles = {
    container: {
        minHeight:       '100vh',
        display:         'flex',
        alignItems:      'center',
        justifyContent:  'center',
        backgroundColor: '#f5f7fa',
        padding:         '20px',
    },
    card: {
        backgroundColor: '#fff',
        borderRadius:    '16px',
        padding:         '40px',
        width:           '100%',
        maxWidth:        '440px',
        boxShadow:       '0 10px 40px rgba(0,0,0,0.1)',
    },
    header: {
        textAlign:    'center',
        marginBottom: '25px',
    },
    title: {
        fontSize:     '26px',
        color:        '#1a1a2e',
        marginBottom: '6px',
    },
    subtitle: {
        fontSize:     '20px',
        color:        '#333',
        marginBottom: '4px',
    },
    desc: {
        color:    '#888',
        fontSize: '13px',
    },
    form: {
        display:       'flex',
        flexDirection: 'column',
        gap:           '14px',
    },
    field: {
        display:       'flex',
        flexDirection: 'column',
        gap:           '4px',
    },
    label: {
        fontSize:   '13px',
        fontWeight: 'bold',
        color:      '#444',
    },
    input: {
        padding:      '11px 14px',
        borderRadius: '8px',
        border:       '1px solid #ddd',
        fontSize:     '14px',
        outline:      'none',
    },
    fieldError: {
        color:    '#e94560',
        fontSize: '12px',
    },
    error: {
        color:     '#e94560',
        fontSize:  '13px',
        textAlign: 'center',
    },
    success: {
        color:        '#4ecca3',
        fontSize:     '14px',
        textAlign:    'center',
        marginBottom: '15px',
        fontWeight:   'bold',
    },
    btn: {
        backgroundColor: '#e94560',
        color:           '#fff',
        padding:         '13px',
        borderRadius:    '8px',
        border:          'none',
        fontSize:        '15px',
        fontWeight:      'bold',
        cursor:          'pointer',
        marginTop:       '6px',
    },
    footer: {
        textAlign: 'center',
        marginTop: '18px',
        color:     '#888',
        fontSize:  '13px',
    },
    footerLink: {
        color:      '#e94560',
        fontWeight: 'bold',
    }
}

export default Register