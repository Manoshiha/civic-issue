import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { getProfile, getMyIssues } from '../services/api'
import { useAuth } from '../context/AuthContext'
import Navbar from '../components/Navbar'

const Dashboard = () => {
    const { user, logout }        = useAuth()
    const [profile, setProfile]   = useState(null)
    const [issues, setIssues]     = useState([])
    const [loading, setLoading]   = useState(true)

    useEffect(() => {
        if (!user) return
        const fetchData = async () => {
            try {
                const [profileRes, issuesRes] = await Promise.all([
                    getProfile(),
                    getMyIssues()
                ])
                setProfile(profileRes.data.user)
                setIssues(issuesRes.data.issues)
            } catch {
                logout()
            } finally {
                setLoading(false)
            }
        }
        fetchData()
    }, [user])

    const statusColor = (status) => {
        if (status === 'Open')        return '#e94560'
        if (status === 'In Progress') return '#f5a623'
        if (status === 'Resolved')    return '#4ecca3'
        return '#888'
    }

    const urgencyColor = (urgency) => {
        if (urgency === 'Critical') return '#e94560'
        if (urgency === 'High')     return '#f5a623'
        if (urgency === 'Medium')   return '#3498db'
        return '#4ecca3'
    }

    const stats = {
        total:      issues.length,
        open:       issues.filter(i => i.status === 'Open').length,
        inProgress: issues.filter(i => i.status === 'In Progress').length,
        resolved:   issues.filter(i => i.status === 'Resolved').length,
    }

    if (loading) return (
        <>
            <Navbar />
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
                <p style={{ color: '#888', fontSize: '16px' }}>Loading your dashboard...</p>
            </div>
        </>
    )

    return (
        <>
            <Navbar />
            <div style={styles.container}>

                {/* Welcome Header */}
                <div style={styles.welcomeBar}>
                    <div>
                        <h1 style={styles.welcomeTitle}>
                            👋 Welcome back, {profile?.full_name}!
                        </h1>
                        <p style={styles.welcomeSub}>
                            Member since {new Date(profile?.created_at).toLocaleDateString()}
                        </p>
                    </div>
                    <Link to="/report" style={styles.reportBtn}>
                        🚨 Report New Issue
                    </Link>
                </div>

                {/* Stats Row */}
                <div style={styles.statsRow}>
                    {[
                        { label: 'Total Reported', value: stats.total,      color: '#3498db' },
                        { label: 'Open',           value: stats.open,       color: '#e94560' },
                        { label: 'In Progress',    value: stats.inProgress, color: '#f5a623' },
                        { label: 'Resolved',       value: stats.resolved,   color: '#4ecca3' },
                    ].map((s, i) => (
                        <div key={i} style={styles.statCard}>
                            <div style={{...styles.statNumber, color: s.color}}>{s.value}</div>
                            <div style={styles.statLabel}>{s.label}</div>
                        </div>
                    ))}
                </div>

                {/* Profile Card */}
                <div style={styles.section}>
                    <h2 style={styles.sectionTitle}>👤 My Profile</h2>
                    <div style={styles.profileCard}>
                        <div style={styles.profileAvatar}>
                            {profile?.full_name?.charAt(0).toUpperCase()}
                        </div>
                        <div>
                            <p style={styles.profileName}>{profile?.full_name}</p>
                            <p style={styles.profileEmail}>{profile?.email}</p>
                            <span style={styles.roleBadge}>
                                {profile?.role === 'citizen' ? '🏘️ Citizen' : '🏛️ Authority'}
                            </span>
                        </div>
                    </div>
                </div>

                {/* My Issues */}
                <div style={styles.section}>
                    <h2 style={styles.sectionTitle}>📋 My Reported Issues</h2>
                    {issues.length === 0 ? (
                        <div style={styles.emptyBox}>
                            <p style={styles.emptyText}>You haven't reported any issues yet.</p>
                            <Link to="/report" style={styles.reportBtn}>
                                🚨 Report Your First Issue
                            </Link>
                        </div>
                    ) : (
                        <div style={styles.issuesGrid}>
                            {issues.map(issue => (
                                <div key={issue.id} style={styles.issueCard}>
                                    <div style={styles.issueTop}>
                                        <span style={styles.ticketNum}>🎫 {issue.ticket_number}</span>
                                        <span style={{...styles.statusBadge, backgroundColor: statusColor(issue.status)}}>
                                            {issue.status}
                                        </span>
                                    </div>
                                    <h3 style={styles.issueTitle}>{issue.title}</h3>
                                    <div style={styles.issueMeta}>
                                        <span style={{...styles.urgencyBadge, backgroundColor: urgencyColor(issue.urgency)}}>
                                            ⚠️ {issue.urgency}
                                        </span>
                                        <span style={styles.categoryBadge}>📁 {issue.category}</span>
                                    </div>
                                    <p style={styles.department}>🏛️ {issue.department_name || 'General'}</p>
                                    <p style={styles.date}>📅 {new Date(issue.created_at).toLocaleDateString()}</p>
                                    <a href={`/issue/${issue.id}`} style={styles.viewBtn}>View Details →</a>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

            </div>
        </>
    )
}

const styles = {
    container:    { maxWidth: '1100px', margin: '0 auto', padding: '30px 20px' },
    welcomeBar:   { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', flexWrap: 'wrap', gap: '16px' },
    welcomeTitle: { fontSize: '26px', fontWeight: 'bold', color: '#1a1a2e', marginBottom: '4px' },
    welcomeSub:   { color: '#888', fontSize: '14px' },
    reportBtn:    { backgroundColor: '#e94560', color: '#fff', padding: '12px 24px', borderRadius: '30px', fontWeight: 'bold', fontSize: '14px' },
    statsRow:     { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '16px', marginBottom: '30px' },
    statCard:     { backgroundColor: '#fff', borderRadius: '12px', padding: '20px', textAlign: 'center', boxShadow: '0 4px 15px rgba(0,0,0,0.06)' },
    statNumber:   { fontSize: '36px', fontWeight: 'bold', marginBottom: '6px' },
    statLabel:    { color: '#888', fontSize: '13px' },
    section:      { marginBottom: '30px' },
    sectionTitle: { fontSize: '20px', fontWeight: 'bold', color: '#1a1a2e', marginBottom: '16px' },
    profileCard:  { backgroundColor: '#fff', borderRadius: '12px', padding: '20px', display: 'flex', alignItems: 'center', gap: '20px', boxShadow: '0 4px 15px rgba(0,0,0,0.06)' },
    profileAvatar:{ width: '60px', height: '60px', borderRadius: '50%', backgroundColor: '#e94560', color: '#fff', fontSize: '24px', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center' },
    profileName:  { fontSize: '18px', fontWeight: 'bold', color: '#1a1a2e', marginBottom: '4px' },
    profileEmail: { color: '#888', fontSize: '14px', marginBottom: '8px' },
    roleBadge:    { backgroundColor: '#0f3460', color: '#fff', padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: 'bold' },
    issuesGrid:   { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' },
    issueCard:    { backgroundColor: '#fff', borderRadius: '12px', padding: '20px', boxShadow: '0 4px 15px rgba(0,0,0,0.06)', border: '1px solid #eee' },
    issueTop:     { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' },
    ticketNum:    { fontSize: '12px', color: '#888', fontWeight: 'bold' },
    statusBadge:  { color: '#fff', padding: '3px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: 'bold' },
    issueTitle:   { fontSize: '15px', fontWeight: 'bold', color: '#1a1a2e', marginBottom: '10px' },
    issueMeta:    { display: 'flex', gap: '8px', marginBottom: '8px', flexWrap: 'wrap' },
    urgencyBadge: { color: '#fff', padding: '3px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: 'bold' },
    categoryBadge:{ color: '#666', fontSize: '12px', padding: '3px 8px', backgroundColor: '#f5f5f5', borderRadius: '20px' },
    department:   { color: '#666', fontSize: '12px', marginBottom: '4px' },
    date:         { color: '#aaa', fontSize: '12px', marginBottom: '14px' },
    viewBtn:      { color: '#e94560', fontWeight: 'bold', fontSize: '13px' },
    emptyBox:     { textAlign: 'center', padding: '40px', backgroundColor: '#fff', borderRadius: '12px', boxShadow: '0 4px 15px rgba(0,0,0,0.06)' },
    emptyText:    { color: '#888', fontSize: '16px', marginBottom: '20px' },
}

export default Dashboard