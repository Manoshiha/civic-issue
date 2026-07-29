import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { getIssueById, upvoteIssue } from '../services/api'
import { useAuth } from '../context/AuthContext'
import Navbar from '../components/Navbar'

const IssueDetail = () => {
    const { id } = useParams()
    const { user } = useAuth()
    const [issue, setIssue] = useState(null)
    const [history, setHistory] = useState([])
    const [loading, setLoading] = useState(true)
    const [upvoted, setUpvoted] = useState(false)
    const [upvoteCount, setUpvoteCount] = useState(0)
    const [error, setError] = useState('')

    useEffect(() => {
        getIssueById(id)
            .then(res => {
                setIssue(res.data.issue)
                setHistory(res.data.history)
                setUpvoteCount(res.data.issue.upvote_count)
            })
            .catch(() => setError('Issue not found'))
            .finally(() => setLoading(false))
    }, [id])

    const handleUpvote = async () => {
        if (!user) { alert('Please login to upvote'); return }
        if (upvoted) { alert('Already upvoted!'); return }
        try {
            await upvoteIssue(id)
            // setUpvoteCount(upvoteCount + 1)
            setUpvoteCount(prev => prev + 1)
            setUpvoted(true)
        } catch {
            alert('Could not upvote. Try again!')
        }
    }

    const statusColor = (s) => {
        if (s === 'Open') return '#e94560'
        if (s === 'In Progress') return '#f5a623'
        if (s === 'Resolved') return '#4ecca3'
        return '#888'
    }

    const urgencyColor = (u) => {
        if (u === 'Critical') return '#e94560'
        if (u === 'High') return '#f5a623'
        if (u === 'Medium') return '#3498db'
        return '#4ecca3'
    }

    const allSteps = ['Open', 'In Progress', 'Resolved']

    const getWhatsappLink = () => {
        if (!issue) return '#'
        return 'https://wa.me/?text=Check this civic issue: ' + issue.title
    }

    const getTwitterLink = () => {
        if (!issue) return '#'
        return 'https://twitter.com/intent/tweet?text=Civic Issue: ' + issue.title
    }

    if (loading) return (
        <>
            <Navbar />
            <div style={styles.centerBox}>
                <p style={{ color: '#888' }}>Loading issue details...</p>
            </div>
        </>
    )

    if (error) return (
        <>
            <Navbar />
            <div style={styles.centerBox}>
                <p style={{ color: '#e94560', fontSize: '18px' }}>❌ {error}</p>
                <a href="/" style={styles.backBtn}>← Go Home</a>
            </div>
        </>
    )

    return (
        <>
            <Navbar />
            <div style={styles.container}>

                {/* Back Button */}
                <a href="/dashboard" style={styles.backLink}>← Back to Dashboard</a>

                {/* Header */}
                <div style={styles.header}>
                    <div style={styles.headerLeft}>
                        <span style={styles.ticketNum}>🎫 {issue.ticket_number}</span>
                        <h1 style={styles.title}>{issue.title}</h1>
                        <div style={styles.badges}>
                            <span style={{
                                ...styles.statusBadge,
                                backgroundColor: statusColor(issue.status)
                            }}>
                                {issue.status}
                            </span>
                            <span style={{
                                ...styles.urgencyBadge,
                                backgroundColor: urgencyColor(issue.urgency)
                            }}>
                                ⚠️ {issue.urgency}
                            </span>
                            <span style={styles.categoryBadge}>
                                📁 {issue.category}
                            </span>
                        </div>
                    </div>

                    <button
                        onClick={handleUpvote}
                        style={{
                            ...styles.upvoteBtn,
                            backgroundColor: upvoted ? '#4ecca3' : '#fff'
                        }}
                    >
                        👍 {upvoteCount}
                    </button>
                </div>

                <div style={styles.grid}>

                    {/* Left Column */}
                    <div style={styles.leftCol}>

                        {/* Photo */}
                        {issue.photo_url && (
                            <div style={styles.card}>
                                <h2 style={styles.cardTitle}>📷 Photo</h2>
                                <img
                                    src={'http://localhost:5000' + issue.photo_url}
                                    alt="Issue"
                                    style={styles.photo}
                                />
                            </div>
                        )}

                        {/* Description */}
                        <div style={styles.card}>
                            <h2 style={styles.cardTitle}>📝 Description</h2>
                            <p style={styles.description}>{issue.description}</p>
                        </div>

                        {/* AI Summary */}
                        {issue.ai_summary && (
                            <div style={{ ...styles.card, border: '1px solid #4ecca3' }}>
                                <h2 style={styles.cardTitle}>🤖 AI Summary</h2>
                                <p style={styles.aiText}>{issue.ai_summary}</p>
                            </div>
                        )}

                        {/* Status Timeline */}
                        <div style={styles.card}>
                            <h2 style={styles.cardTitle}>📊 Status Timeline</h2>
                            <div style={styles.timeline}>
                                {allSteps.map((step, i) => {
                                    const reached = allSteps.indexOf(issue.status) >= i
                                    return (
                                        <div key={i} style={styles.timelineStep}>
                                            <div style={{
                                                ...styles.timelineDot,
                                                backgroundColor: reached ? statusColor(step) : '#ddd'
                                            }}>
                                                {reached ? '✓' : ''}
                                            </div>
                                            {i < allSteps.length - 1 && (
                                                <div style={{
                                                    ...styles.timelineLine,
                                                    backgroundColor: allSteps.indexOf(issue.status) > i ? '#4ecca3' : '#ddd'
                                                }} />
                                            )}
                                            <span style={{
                                                ...styles.timelineLabel,
                                                color: reached ? '#333' : '#aaa',
                                                fontWeight: issue.status === step ? 'bold' : 'normal'
                                            }}>
                                                {step}
                                            </span>
                                        </div>
                                    )
                                })}
                            </div>
                        </div>

                        {/* Status History */}
                        {history.length > 0 && (
                            <div style={styles.card}>
                                <h2 style={styles.cardTitle}>🕐 Status History</h2>
                                {history.map((h, i) => (
                                    <div key={i} style={styles.historyItem}>
                                        <div style={styles.historyTop}>
                                            <span style={styles.historyStatus}>
                                                {h.old_status} → {h.new_status}
                                            </span>
                                            <span style={styles.historyDate}>
                                                {new Date(h.changed_at).toLocaleDateString()}
                                            </span>
                                        </div>
                                        {h.official_response && (
                                            <p style={styles.historyResponse}>
                                                💬 {h.official_response}
                                            </p>
                                        )}
                                        <p style={styles.historyBy}>By: {h.changed_by}</p>
                                    </div>
                                ))}
                            </div>
                        )}

                    </div>

                    {/* Right Column */}
                    <div style={styles.rightCol}>

                        {/* Issue Info */}
                        <div style={styles.card}>
                            <h2 style={styles.cardTitle}>ℹ️ Issue Info</h2>
                            <div style={styles.infoRow}>
                                <span style={styles.infoLabel}>Reported By</span>
                                <span style={styles.infoValue}>👤 {issue.reported_by}</span>
                            </div>
                            <div style={styles.infoRow}>
                                <span style={styles.infoLabel}>Date</span>
                                <span style={styles.infoValue}>
                                    📅 {new Date(issue.created_at).toLocaleDateString()}
                                </span>
                            </div>
                            <div style={styles.infoRow}>
                                <span style={styles.infoLabel}>Department</span>
                                <span style={styles.infoValue}>
                                    🏛️ {issue.department_name || 'General'}
                                </span>
                            </div>
                            <div style={styles.infoRow}>
                                <span style={styles.infoLabel}>Location</span>
                                <span style={styles.infoValue}>
                                    📍 {issue.location_address || 'Not specified'}
                                </span>
                            </div>
                            {issue.lat && issue.lng && (
                                <div style={styles.infoRow}>
                                    <span style={styles.infoLabel}>Coordinates</span>
                                    <span style={styles.infoValue}>
                                        {issue.lat}, {issue.lng}
                                    </span>
                                </div>
                            )}
                        </div>

                        {/* Share */}
                        <div style={styles.card}>
                            <h2 style={styles.cardTitle}>📤 Share This Issue</h2>
                            <div style={styles.shareRow}>
                                <a
                                    href={getWhatsappLink()}
                                    target="_blank"
                                    rel="noreferrer"
                                    style={styles.whatsappBtn}
                                >
                                    📱 WhatsApp
                                </a>
                                <a
                                    href={getTwitterLink()}
                                    target="_blank"
                                    rel="noreferrer"
                                    style={styles.twitterBtn}
>
                            🐦 Twitter
                            </a>
                        </div>
                    </div>

                    {/* Report New */}
                    <div style={styles.card}>
                        <a href="/report" style={styles.reportBtn}>
                            🚨 Report a New Issue
                        </a>
                    </div>

                </div>
            </div >
        </div >
        </>
    )
}

const styles = {
    container: { maxWidth: '1100px', margin: '0 auto', padding: '30px 20px' },
    centerBox: { display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', minHeight: '60vh', gap: '16px' },
    backLink: { color: '#888', fontSize: '14px', marginBottom: '20px', display: 'inline-block' },
    header: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' },
    headerLeft: { flex: 1 },
    ticketNum: { fontSize: '13px', color: '#888', fontWeight: 'bold' },
    title: { fontSize: '28px', fontWeight: 'bold', color: '#1a1a2e', margin: '8px 0' },
    badges: { display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '8px' },
    statusBadge: { color: '#fff', padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: 'bold' },
    urgencyBadge: { color: '#fff', padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: 'bold' },
    categoryBadge: { color: '#666', padding: '4px 12px', borderRadius: '20px', fontSize: '12px', backgroundColor: '#f0f0f0' },
    upvoteBtn: { padding: '12px 20px', borderRadius: '12px', border: '2px solid #4ecca3', fontSize: '16px', cursor: 'pointer', fontWeight: 'bold', color: '#333' },
    grid: { display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px' },
    leftCol: { display: 'flex', flexDirection: 'column', gap: '20px' },
    rightCol: { display: 'flex', flexDirection: 'column', gap: '20px' },
    card: { backgroundColor: '#fff', borderRadius: '12px', padding: '20px', boxShadow: '0 4px 15px rgba(0,0,0,0.06)' },
    cardTitle: { fontSize: '16px', fontWeight: 'bold', color: '#1a1a2e', marginBottom: '16px' },
    photo: { width: '100%', borderRadius: '8px', objectFit: 'cover', maxHeight: '300px' },
    description: { color: '#555', fontSize: '15px', lineHeight: 1.7 },
    aiText: { color: '#333', fontSize: '14px', lineHeight: 1.6 },
    timeline: { display: 'flex', alignItems: 'center' },
    timelineStep: { display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1 },
    timelineDot: { width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 'bold', fontSize: '14px', marginBottom: '8px' },
    timelineLine: { height: '3px', flex: 1, marginBottom: '8px' },
    timelineLabel: { fontSize: '12px', color: '#666', textAlign: 'center' },
    historyItem: { padding: '12px 0', borderBottom: '1px solid #eee' },
    historyTop: { display: 'flex', justifyContent: 'space-between', marginBottom: '4px' },
    historyStatus: { fontSize: '13px', fontWeight: 'bold', color: '#333' },
    historyDate: { fontSize: '12px', color: '#aaa' },
    historyResponse: { fontSize: '13px', color: '#555', marginTop: '4px' },
    historyBy: { fontSize: '12px', color: '#888', marginTop: '2px' },
    infoRow: { display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #f0f0f0' },
    infoLabel: { fontSize: '13px', color: '#888' },
    infoValue: { fontSize: '13px', color: '#333', fontWeight: 'bold', textAlign: 'right', maxWidth: '60%' },
    shareRow: { display: 'flex', gap: '10px' },
    whatsappBtn: { flex: 1, padding: '10px', backgroundColor: '#25D366', color: '#fff', borderRadius: '8px', textAlign: 'center', fontSize: '13px', fontWeight: 'bold' },
    twitterBtn: { flex: 1, padding: '10px', backgroundColor: '#1DA1F2', color: '#fff', borderRadius: '8px', textAlign: 'center', fontSize: '13px', fontWeight: 'bold' },
    reportBtn: { display: 'block', backgroundColor: '#e94560', color: '#fff', padding: '12px', borderRadius: '8px', textAlign: 'center', fontWeight: 'bold', fontSize: '14px' },
    backBtn: { backgroundColor: '#1a1a2e', color: '#fff', padding: '10px 20px', borderRadius: '8px', fontSize: '14px' },
}

export default IssueDetail