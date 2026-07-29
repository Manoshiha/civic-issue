import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { classifyIssue, createIssue } from '../services/api'
import { useAuth } from '../context/AuthContext'
import Navbar from '../components/Navbar'

const ReportIssue = () => {
    const { user }      = useAuth()
    const navigate      = useNavigate()
    const [step, setStep]         = useState(1)
    const [loading, setLoading]   = useState(false)
    const [aiLoading, setAiLoading] = useState(false)
    const [error, setError]       = useState('')
    const [success, setSuccess]   = useState('')

    const [form, setForm] = useState({
        title:            '',
        description:      '',
        category:         '',
        urgency:          '',
        location_address: '',
        lat:              '',
        lng:              '',
        ai_summary:       '',
        photo:            null,
        photoPreview:     null,
    })

    // Redirect if not logged in
    if (!user) {
        return (
            <>
                <Navbar />
                <div style={styles.centerBox}>
                    <h2>🔒 Please login to report an issue</h2>
                    <button onClick={() => navigate('/login')} style={styles.primaryBtn}>
                        Go to Login
                    </button>
                </div>
            </>
        )
    }

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value })
        setError('')
    }

    const handlePhoto = (e) => {
        const file = e.target.files[0]
        if (file) {
            setForm({
                ...form,
                photo:        file,
                photoPreview: URL.createObjectURL(file)
            })
        }
    }

    //  AI Auto Detect
    const handleAiDetect = async () => {
        if (!form.description) {
            setError('Please enter a description first')
            return
        }
        setAiLoading(true)
        try {
            const res = await classifyIssue({ description: form.description })
            setForm({
                ...form,
                category:   res.data.category,
                urgency:    res.data.urgency,
                ai_summary: res.data.summary,
            })
        } catch {
            setError('AI classification failed. Please select manually.')
        } finally {
            setAiLoading(false)
        }
    }

    // Step Validation
    const validateStep = () => {
        if (step === 1 && !form.location_address) {
            setError('Please enter a location')
            return false
        }
        if (step === 2) {
            if (!form.title)       { setError('Title is required');    return false }
            if (!form.description) { setError('Description is required'); return false }
            if (!form.category)    { setError('Category is required'); return false }
            if (!form.urgency)     { setError('Urgency is required');  return false }
        }
        return true
    }

    const nextStep = () => {
        if (validateStep()) {
            setError('')
            setStep(step + 1)
        }
    }

    const prevStep = () => {
        setError('')
        setStep(step - 1)
    }

    // Submit
    const handleSubmit = async () => {
        setLoading(true)
        try {
            const formData = new FormData()
            formData.append('title',            form.title)
            formData.append('description',      form.description)
            formData.append('category',         form.category)
            formData.append('urgency',          form.urgency)
            formData.append('location_address', form.location_address)
            formData.append('lat',              form.lat || '')
            formData.append('lng',              form.lng || '')
            formData.append('ai_summary',       form.ai_summary || '')
            if (form.photo) formData.append('photo', form.photo)

            const res = await createIssue(formData)
            setSuccess(`✅ Issue reported! Ticket: ${res.data.ticket_number}`)
            setTimeout(() => navigate('/dashboard'), 2500)
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to submit issue')
        } finally {
            setLoading(false)
        }
    }

    const urgencyColor = (u) => {
        if (u === 'Critical') return '#e94560'
        if (u === 'High')     return '#f5a623'
        if (u === 'Medium')   return '#3498db'
        return '#4ecca3'
    }

    return (
        <>
            <Navbar />
            <div style={styles.container}>
                <div style={styles.card}>

                    {/* Header */}
                    <div style={styles.header}>
                        <h2 style={styles.title}>🚨 Report a Civic Issue</h2>
                        <p style={styles.subtitle}>Step {step} of 3</p>
                    </div>

                    {/* Progress Bar */}
                    <div style={styles.progressBar}>
                        <div style={{
                            ...styles.progressFill,
                            width: `${(step / 3) * 100}%`
                        }} />
                    </div>

                    {/* Step Labels */}
                    <div style={styles.stepLabels}>
                        {['📍 Location', '📝 Details', '✅ Review'].map((label, i) => (
                            <span key={i} style={{
                                ...styles.stepLabel,
                                color: step === i + 1 ? '#e94560' : '#aaa',
                                fontWeight: step === i + 1 ? 'bold' : 'normal'
                            }}>
                                {label}
                            </span>
                        ))}
                    </div>

                    
                   {/* STEP 1 — LOCATION */}
                    {step === 1 && (
                        <div style={styles.stepContent}>
                            <h3 style={styles.stepTitle}>📍 Where is the issue?</h3>

                            <div style={styles.field}>
                                <label style={styles.label}>Location Address</label>
                                <input
                                    name="location_address"
                                    value={form.location_address}
                                    onChange={handleChange}
                                    placeholder="e.g. Main Street, near Bus Stop 12, Colombo"
                                    style={styles.input}
                                />
                            </div>

                            <div style={styles.coordRow}>
                                <div style={styles.field}>
                                    <label style={styles.label}>Latitude (optional)</label>
                                    <input
                                        name="lat"
                                        value={form.lat}
                                        onChange={handleChange}
                                        placeholder="e.g. 6.9271"
                                        style={styles.input}
                                    />
                                </div>
                                <div style={styles.field}>
                                    <label style={styles.label}>Longitude (optional)</label>
                                    <input
                                        name="lng"
                                        value={form.lng}
                                        onChange={handleChange}
                                        placeholder="e.g. 79.8612"
                                        style={styles.input}
                                    />
                                </div>
                            </div>

                            <div style={styles.mapPlaceholder}>
                                🗺️ Map integration — pin your location above using coordinates
                            </div>
                        </div>
                    )}

                   
                      {/* STEP 2 — ISSUE DETAILS */}
                    {step === 2 && (
                        <div style={styles.stepContent}>
                            <h3 style={styles.stepTitle}>📝 Describe the Issue</h3>

                            {/* Title */}
                            <div style={styles.field}>
                                <label style={styles.label}>Issue Title</label>
                                <input
                                    name="title"
                                    value={form.title}
                                    onChange={handleChange}
                                    placeholder="e.g. Large pothole on Main Street"
                                    style={styles.input}
                                />
                            </div>

                            {/* Description */}
                            <div style={styles.field}>
                                <label style={styles.label}>Description</label>
                                <textarea
                                    name="description"
                                    value={form.description}
                                    onChange={handleChange}
                                    placeholder="Describe the issue in detail..."
                                    style={styles.textarea}
                                    rows={4}
                                />
                            </div>

                            {/* AI Detect Button */}
                            <button
                                onClick={handleAiDetect}
                                disabled={aiLoading}
                                style={styles.aiBtn}
                            >
                                {aiLoading ? '🤖 Detecting...' : '🤖 Auto Detect Category & Urgency'}
                            </button>

                            {/* AI Result */}
                            {form.ai_summary && (
                                <div style={styles.aiResult}>
                                    <p style={styles.aiResultTitle}>✅ AI Classification Result:</p>
                                    <p style={styles.aiResultText}>{form.ai_summary}</p>
                                </div>
                            )}

                            {/* Category */}
                            <div style={styles.field}>
                                <label style={styles.label}>Category</label>
                                <select
                                    name="category"
                                    value={form.category}
                                    onChange={handleChange}
                                    style={styles.input}
                                >
                                    <option value="">Select Category</option>
                                    <option>Pothole</option>
                                    <option>Garbage</option>
                                    <option>Street Lighting</option>
                                    <option>Water & Drainage</option>
                                    <option>Vandalism</option>
                                    <option>Other</option>
                                </select>
                            </div>

                            {/* Urgency */}
                            <div style={styles.field}>
                                <label style={styles.label}>Urgency Level</label>
                                <div style={styles.urgencyRow}>
                                    {['Low', 'Medium', 'High', 'Critical'].map(u => (
                                        <button
                                            key={u}
                                            onClick={() => setForm({ ...form, urgency: u })}
                                            style={{
                                                ...styles.urgencyBtn,
                                                backgroundColor: form.urgency === u ? urgencyColor(u) : '#f0f0f0',
                                                color:           form.urgency === u ? '#fff' : '#444',
                                            }}
                                        >
                                            {u}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Photo Upload */}
                            <div style={styles.field}>
                                <label style={styles.label}>Photo (optional)</label>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handlePhoto}
                                    style={styles.fileInput}
                                />
                                {form.photoPreview && (
                                    <img
                                        src={form.photoPreview}
                                        alt="Preview"
                                        style={styles.photoPreview}
                                    />
                                )}
                            </div>
                        </div>
                    )}


                    {/* STEP 3 — REVIEW & SUBMIT */}
                    {step === 3 && (
                        <div style={styles.stepContent}>
                            <h3 style={styles.stepTitle}>✅ Review Your Report</h3>

                            {success ? (
                                <div style={styles.successBox}>
                                    <p style={styles.successText}>{success}</p>
                                    <p style={styles.successSub}>Redirecting to dashboard...</p>
                                </div>
                            ) : (
                                <div style={styles.reviewBox}>
                                    <div style={styles.reviewRow}>
                                        <span style={styles.reviewLabel}>📍 Location</span>
                                        <span style={styles.reviewValue}>{form.location_address}</span>
                                    </div>
                                    <div style={styles.reviewRow}>
                                        <span style={styles.reviewLabel}>📝 Title</span>
                                        <span style={styles.reviewValue}>{form.title}</span>
                                    </div>
                                    <div style={styles.reviewRow}>
                                        <span style={styles.reviewLabel}>📁 Category</span>
                                        <span style={styles.reviewValue}>{form.category}</span>
                                    </div>
                                    <div style={styles.reviewRow}>
                                        <span style={styles.reviewLabel}>⚠️ Urgency</span>
                                        <span style={{
                                            ...styles.reviewValue,
                                            color:      urgencyColor(form.urgency),
                                            fontWeight: 'bold'
                                        }}>
                                            {form.urgency}
                                        </span>
                                    </div>
                                    {form.ai_summary && (
                                        <div style={styles.reviewRow}>
                                            <span style={styles.reviewLabel}>🤖 AI Summary</span>
                                            <span style={styles.reviewValue}>{form.ai_summary}</span>
                                        </div>
                                    )}
                                    {form.photoPreview && (
                                        <div style={styles.reviewRow}>
                                            <span style={styles.reviewLabel}>📷 Photo</span>
                                            <img
                                                src={form.photoPreview}
                                                alt="Issue"
                                                style={styles.reviewPhoto}
                                            />
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    )}

                    {/*  Error */}
                    {error && <p style={styles.error}>⚠️ {error}</p>}

                    {/*  Navigation Buttons*/}
                    {!success && (
                        <div style={styles.btnRow}>
                            {step > 1 && (
                                <button onClick={prevStep} style={styles.backBtn}>
                                    ← Back
                                </button>
                            )}
                            {step < 3 && (
                                <button onClick={nextStep} style={styles.nextBtn}>
                                    Next →
                                </button>
                            )}
                            {step === 3 && (
                                <button
                                    onClick={handleSubmit}
                                    disabled={loading}
                                    style={loading ? {...styles.submitBtn, opacity: 0.7} : styles.submitBtn}
                                >
                                    {loading ? 'Submitting...' : '🚨 Submit Report'}
                                </button>
                            )}
                        </div>
                    )}

                </div>
            </div>
        </>
    )
}

const styles = {
    container: {
        minHeight:       '100vh',
        backgroundColor: '#f5f7fa',
        padding:         '40px 20px',
        display:         'flex',
        justifyContent:  'center',
    },
    card: {
        backgroundColor: '#fff',
        borderRadius:    '16px',
        padding:         '40px',
        width:           '100%',
        maxWidth:        '600px',
        boxShadow:       '0 10px 40px rgba(0,0,0,0.1)',
        height:          'fit-content',
    },
    header:   { textAlign: 'center', marginBottom: '20px' },
    title:    { fontSize: '24px', fontWeight: 'bold', color: '#1a1a2e', marginBottom: '4px' },
    subtitle: { color: '#888', fontSize: '14px' },

    // Progress
    progressBar: {
        height:          '6px',
        backgroundColor: '#eee',
        borderRadius:    '3px',
        marginBottom:    '10px',
        overflow:        'hidden',
    },
    progressFill: {
        height:          '100%',
        backgroundColor: '#e94560',
        borderRadius:    '3px',
        transition:      'width 0.3s ease',
    },
    stepLabels: {
        display:         'flex',
        justifyContent:  'space-between',
        marginBottom:    '30px',
    },
    stepLabel: { fontSize: '13px' },

    // Step Content
    stepContent: { marginBottom: '20px' },
    stepTitle:   { fontSize: '18px', fontWeight: 'bold', color: '#1a1a2e', marginBottom: '20px' },

    // Fields
    field:    { display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '16px' },
    label:    { fontSize: '13px', fontWeight: 'bold', color: '#444' },
    input: {
        padding:      '11px 14px',
        borderRadius: '8px',
        border:       '1px solid #ddd',
        fontSize:     '14px',
        outline:      'none',
    },
    textarea: {
        padding:      '11px 14px',
        borderRadius: '8px',
        border:       '1px solid #ddd',
        fontSize:     '14px',
        outline:      'none',
        resize:       'vertical',
        fontFamily:   'inherit',
    },
    coordRow:    { display: 'flex', gap: '12px' },
    mapPlaceholder: {
        backgroundColor: '#f5f7fa',
        borderRadius:    '8px',
        padding:         '30px',
        textAlign:       'center',
        color:           '#888',
        fontSize:        '14px',
        border:          '2px dashed #ddd',
        marginBottom:    '16px',
    },

    // AI Button
    aiBtn: {
        width:           '100%',
        padding:         '12px',
        backgroundColor: '#0f3460',
        color:           '#fff',
        border:          'none',
        borderRadius:    '8px',
        fontSize:        '14px',
        fontWeight:      'bold',
        cursor:          'pointer',
        marginBottom:    '12px',
    },
    aiResult: {
        backgroundColor: '#f0fff8',
        border:          '1px solid #4ecca3',
        borderRadius:    '8px',
        padding:         '12px',
        marginBottom:    '16px',
    },
    aiResultTitle: { fontWeight: 'bold', color: '#4ecca3', marginBottom: '4px', fontSize: '13px' },
    aiResultText:  { color: '#333', fontSize: '13px' },

    // Urgency
    urgencyRow: { display: 'flex', gap: '8px', flexWrap: 'wrap' },
    urgencyBtn: {
        padding:      '8px 16px',
        borderRadius: '20px',
        border:       'none',
        cursor:       'pointer',
        fontSize:     '13px',
        fontWeight:   'bold',
        transition:   'all 0.2s',
    },

    // Photo
    fileInput:    { fontSize: '13px' },
    photoPreview: { width: '100%', borderRadius: '8px', marginTop: '8px', maxHeight: '200px', objectFit: 'cover' },

    // Review
    reviewBox:   { backgroundColor: '#f9f9f9', borderRadius: '12px', padding: '20px', marginBottom: '20px' },
    reviewRow:   { display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #eee' },
    reviewLabel: { color: '#888', fontSize: '13px', fontWeight: 'bold' },
    reviewValue: { color: '#333', fontSize: '13px', maxWidth: '60%', textAlign: 'right' },
    reviewPhoto: { width: '80px', height: '60px', objectFit: 'cover', borderRadius: '6px' },

    // Success
    successBox:  { textAlign: 'center', padding: '30px' },
    successText: { fontSize: '20px', fontWeight: 'bold', color: '#4ecca3', marginBottom: '8px' },
    successSub:  { color: '#888', fontSize: '14px' },

    // Error
    error: { color: '#e94560', fontSize: '13px', textAlign: 'center', marginBottom: '12px' },

    // Buttons
    btnRow:    { display: 'flex', justifyContent: 'space-between', gap: '12px' },
    backBtn: {
        padding:         '12px 24px',
        borderRadius:    '8px',
        border:          '1px solid #ddd',
        backgroundColor: '#fff',
        color:           '#444',
        cursor:          'pointer',
        fontSize:        '14px',
    },
    nextBtn: {
        padding:         '12px 24px',
        borderRadius:    '8px',
        border:          'none',
        backgroundColor: '#e94560',
        color:           '#fff',
        cursor:          'pointer',
        fontSize:        '14px',
        fontWeight:      'bold',
        marginLeft:      'auto',
    },
    submitBtn: {
        padding:         '12px 30px',
        borderRadius:    '8px',
        border:          'none',
        backgroundColor: '#4ecca3',
        color:           '#fff',
        cursor:          'pointer',
        fontSize:        '15px',
        fontWeight:      'bold',
        marginLeft:      'auto',
    },
    primaryBtn: {
        backgroundColor: '#e94560',
        color:           '#fff',
        padding:         '12px 24px',
        borderRadius:    '8px',
        border:          'none',
        cursor:          'pointer',
        fontSize:        '15px',
        marginTop:       '16px',
    },
    centerBox: {
        display:        'flex',
        flexDirection:  'column',
        alignItems:     'center',
        justifyContent: 'center',
        minHeight:      '60vh',
        gap:            '16px',
    }
}

export default ReportIssue