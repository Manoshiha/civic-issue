import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { getStats, getRecentIssues } from '../services/api'
import Navbar from '../components/Navbar'

const Landing = () => {
    const [stats, setStats] = useState({ total: 0, resolved: 0, in_progress: 0, open: 0 })
    const [issues, setIssues] = useState([])

    useEffect(() => {
        getStats().then(res => setStats(res.data)).catch(() => { })
        getRecentIssues().then(res => setIssues(res.data.issues)).catch(() => { })
    }, [])

    const categories = [
        { icon: '🕳️', name: 'Pothole' },
        { icon: '🗑️', name: 'Garbage' },
        { icon: '💡', name: 'Street Lighting' },
        { icon: '💧', name: 'Water & Drainage' },
        { icon: '🏚️', name: 'Vandalism' },
        { icon: '📋', name: 'Other' },
    ]

    const statusColor = (status) => {
        if (status === 'Open') return '#e94560'
        if (status === 'In Progress') return '#f5a623'
        if (status === 'Resolved') return '#4ecca3'
        return '#888'
    }

    const urgencyColor = (urgency) => {
        if (urgency === 'Critical') return '#e94560'
        if (urgency === 'High') return '#f5a623'
        if (urgency === 'Medium') return '#3498db'
        return '#4ecca3'
    }

    return (
        <div style={styles.page}>
            <Navbar />

            {/* Hero Section  */}
            <section style={styles.hero}>
                <div style={styles.heroContent}>
                    <h1 style={styles.heroTitle}>
                        Report Civic Issues.<br />
                        <span style={styles.heroAccent}>Make Your City Better.</span>
                    </h1>
                    <p style={styles.heroDesc}>
                        CivicFix connects citizens with local authorities to resolve
                        infrastructure problems faster using AI-powered classification.
                    </p>
                    <div style={styles.heroButtons}>
                        <Link to="/report" style={styles.primaryBtn}>🚨 Report an Issue</Link>
                        <Link to="/map" style={styles.secondaryBtn}>🗺️ View Live Map</Link>
                    </div>
                </div>
            </section>

             {/* Live Stats */}
            <section style={styles.statsSection}>
                {[
                    { label: 'Total Reported', value: stats.total, color: '#3498db' },
                    { label: 'Open Issues', value: stats.open, color: '#e94560' },
                    { label: 'In Progress', value: stats.in_progress, color: '#f5a623' },
                    { label: 'Resolved', value: stats.resolved, color: '#4ecca3' },
                ].map((s, i) => (
                    <div key={i} style={styles.statCard}>
                        <div style={{ ...styles.statNumber, color: s.color }}>{s.value}</div>
                        <div style={styles.statLabel}>{s.label}</div>
                    </div>
                ))}
            </section>

           {/* How It Works */}
            <section style={styles.section}>
                <h2 style={styles.sectionTitle}>How It Works</h2>
                <div style={styles.stepsRow}>
                    {[
                        { step: '1', icon: '📝', title: 'Report', desc: 'Submit an issue with photo and location. Our AI auto-classifies it instantly.' },
                        { step: '2', icon: '🔍', title: 'Review', desc: 'Assigned authority reviews and starts working on the reported issue.' },
                        { step: '3', icon: '✅', title: 'Resolve', desc: 'Issue gets resolved and you get notified with the official response.' },
                    ].map((s, i) => (
                        <div key={i} style={styles.stepCard}>
                            <div style={styles.stepNumber}>{s.step}</div>
                            <div style={styles.stepIcon}>{s.icon}</div>
                            <h3 style={styles.stepTitle}>{s.title}</h3>
                            <p style={styles.stepDesc}>{s.desc}</p>
                        </div>
                    ))}
                </div>
            </section>

           {/* Categories */}
            <section style={{ ...styles.section, backgroundColor: '#f5f7fa' }}>
                <h2 style={styles.sectionTitle}>Issue Categories</h2>
                <div style={styles.categoriesRow}>
                    {categories.map((c, i) => (
                        <div key={i} style={styles.categoryCard}>
                            <div style={styles.categoryIcon}>{c.icon}</div>
                            <div style={styles.categoryName}>{c.name}</div>
                        </div>
                    ))}
                </div>
            </section>

          {/* Recent Issues */}
            <section style={styles.section}>
                <h2 style={styles.sectionTitle}>Recent Issues</h2>
                {issues.length === 0 ? (
                    <p style={styles.noIssues}>No issues reported yet. Be the first!</p>
                ) : (
                    <div style={styles.issuesGrid}>
                        {issues.map((issue) => (
                            <div key={issue.id} style={styles.issueCard}>
                                <div style={styles.issueTop}>
                                    <span style={styles.ticketNum}>{issue.ticket_number}</span>
                                    <span style={{
                                        ...styles.statusBadge,
                                        backgroundColor: statusColor(issue.status)
                                    }}>
                                        {issue.status}
                                    </span>
                                </div>
                                <h3 style={styles.issueTitle}>{issue.title}</h3>
                                <div style={styles.issueMeta}>
                                    <span style={{
                                        ...styles.urgencyBadge,
                                        backgroundColor: urgencyColor(issue.urgency)
                                    }}>
                                        {issue.urgency}
                                    </span>
                                    <span style={styles.issueCategory}>📁 {issue.category}</span>
                                </div>
                                <p style={styles.issueLocation}>
                                    📍 {issue.location_address || 'Location not specified'}
                                </p>
                                <Link to={`/issue/${issue.id}`} style={styles.viewBtn}>
                                    View Details →
                                </Link>
                            </div>
                        ))}
                    </div>
                )}
            </section>

            {/* Call To Action */}
            <section style={styles.ctaSection}>
                <h2 style={styles.ctaTitle}>See a Problem in Your City?</h2>
                <p style={styles.ctaDesc}>Report it now and help make your community better.</p>
                <Link to="/report" style={styles.ctaBtn}>🚨 Report an Issue Now</Link>
            </section>

            {/* Footer */}
            <footer style={styles.footer}>
                <p>  © 2026 Team of FITT5 . All rights reserved. </p>
            </footer>
        </div>
    )
}

const styles = {
    page: { backgroundColor: '#fff', minHeight: '100vh' },

    // Hero
    hero: {
        background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
        padding: '80px 40px',
        textAlign: 'center',
    },
    heroContent: { maxWidth: '700px', margin: '0 auto' },
    heroTitle: {
        fontSize: '48px',
        fontWeight: 'bold',
        color: '#fff',
        lineHeight: 1.2,
        marginBottom: '20px',
    },
    heroAccent: { color: '#e94560' },
    heroDesc: {
        fontSize: '18px',
        color: '#ccc',
        marginBottom: '35px',
        lineHeight: 1.6,
    },
    heroButtons: { display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' },
    primaryBtn: {
        backgroundColor: '#e94560',
        color: '#fff',
        padding: '14px 30px',
        borderRadius: '30px',
        fontWeight: 'bold',
        fontSize: '16px',
    },
    secondaryBtn: {
        backgroundColor: 'transparent',
        color: '#fff',
        padding: '14px 30px',
        borderRadius: '30px',
        fontWeight: 'bold',
        fontSize: '16px',
        border: '2px solid #fff',
    },

    // Stats
    statsSection: {
        display: 'flex',
        justifyContent: 'center',
        gap: '20px',
        padding: '40px',
        flexWrap: 'wrap',
        backgroundColor: '#1a1a2e',
    },
    statCard: {
        textAlign: 'center',
        padding: '20px 40px',
        borderRadius: '12px',
        backgroundColor: 'rgba(255,255,255,0.05)',
        minWidth: '140px',
    },
    statNumber: { fontSize: '42px', fontWeight: 'bold' },
    statLabel: { color: '#aaa', fontSize: '14px', marginTop: '6px' },

    // Sections
    section: { padding: '60px 40px', maxWidth: '1100px', margin: '0 auto' },
    sectionTitle: {
        fontSize: '28px',
        fontWeight: 'bold',
        color: '#1a1a2e',
        textAlign: 'center',
        marginBottom: '40px',
    },

    // Steps
    stepsRow: { display: 'flex', gap: '24px', justifyContent: 'center', flexWrap: 'wrap' },
    stepCard: {
        textAlign: 'center',
        padding: '30px',
        borderRadius: '16px',
        backgroundColor: '#f5f7fa',
        flex: '1',
        minWidth: '220px',
        maxWidth: '300px',
    },
    stepNumber: {
        width: '36px',
        height: '36px',
        borderRadius: '50%',
        backgroundColor: '#e94560',
        color: '#fff',
        fontWeight: 'bold',
        fontSize: '16px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        margin: '0 auto 12px',
    },
    stepIcon: { fontSize: '36px', marginBottom: '12px' },
    stepTitle: { fontSize: '18px', fontWeight: 'bold', color: '#1a1a2e', marginBottom: '8px' },
    stepDesc: { fontSize: '14px', color: '#666', lineHeight: 1.6 },

    // Categories
    categoriesRow: { display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' },
    categoryCard: {
        textAlign: 'center',
        padding: '20px 24px',
        borderRadius: '12px',
        backgroundColor: '#fff',
        boxShadow: '0 4px 15px rgba(0,0,0,0.08)',
        cursor: 'pointer',
        minWidth: '100px',
    },
    categoryIcon: { fontSize: '32px', marginBottom: '8px' },
    categoryName: { fontSize: '13px', fontWeight: 'bold', color: '#444' },

    // Issues
    issuesGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' },
    issueCard: {
        backgroundColor: '#fff',
        borderRadius: '12px',
        padding: '20px',
        boxShadow: '0 4px 15px rgba(0,0,0,0.08)',
        border: '1px solid #eee',
    },
    issueTop: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' },
    ticketNum: { fontSize: '12px', color: '#888', fontWeight: 'bold' },
    statusBadge: { color: '#fff', padding: '3px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: 'bold' },
    issueTitle: { fontSize: '15px', fontWeight: 'bold', color: '#1a1a2e', marginBottom: '10px' },
    issueMeta: { display: 'flex', gap: '8px', marginBottom: '8px' },
    urgencyBadge: { color: '#fff', padding: '2px 8px', borderRadius: '10px', fontSize: '11px', fontWeight: 'bold' },
    issueCategory: { fontSize: '12px', color: '#666' },
    issueLocation: { fontSize: '12px', color: '#888', marginBottom: '14px' },
    viewBtn: {
        color: '#e94560',
        fontWeight: 'bold',
        fontSize: '13px',
    },
    noIssues: { textAlign: 'center', color: '#888', fontSize: '16px' },

    // CTA
    ctaSection: {
        background: 'linear-gradient(135deg, #e94560, #0f3460)',
        padding: '60px 40px',
        textAlign: 'center',
    },
    ctaTitle: { fontSize: '32px', fontWeight: 'bold', color: '#fff', marginBottom: '12px' },
    ctaDesc: { fontSize: '16px', color: 'rgba(255,255,255,0.8)', marginBottom: '28px' },
    ctaBtn: {
        backgroundColor: '#fff',
        color: '#e94560',
        padding: '14px 36px',
        borderRadius: '30px',
        fontWeight: 'bold',
        fontSize: '16px',
    },

    // Footer
    footer: {
        backgroundColor: '#1a1a2e',
        color: '#888',
        textAlign: 'center',
        padding: '20px',
        fontSize: '14px',
    }
}

export default Landing