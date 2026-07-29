import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getDeptIssues, updateStatus } from '../services/api'
import { useAuth } from '../context/AuthContext'
import Navbar from '../components/Navbar'
import { Bar } from 'react-chartjs-2'
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend
} from 'chart.js'

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend)

const AdminDashboard = () => {
    const { user, logout } = useAuth()
    const navigate = useNavigate()
    const [issues, setIssues] = useState([])
    const [loading, setLoading] = useState(true)
    const [filter, setFilter] = useState('All')
    const [sortBy, setSortBy] = useState('date')
    const [response, setResponse] = useState('')
    const [updating, setUpdating] = useState(null)

    useEffect(() => {
        if (!user || user.role !== 'authority') {
            navigate('/login')
            return
        }
        fetchIssues()
    }, [])

    const fetchIssues = async () => {
        try {
            const res = await getDeptIssues()
            setIssues(res.data.issues)
        } catch {
            logout()
            navigate('/login')
        } finally {
            setLoading(false)
        }
    }

    const handleUpdateStatus = async (issueId, newStatus) => {
        setUpdating(issueId)
        try {
            await updateStatus({
                issue_id: issueId,
                new_status: newStatus,
                official_response: response
            })
            setResponse('')
            await fetchIssues()
        } catch (err) {
            alert('Failed to update status')
        } finally {
            setUpdating(null)
        }
    }

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

    // Filter + Sort 
    const filtered = issues
        .filter(i => filter === 'All' || i.status === filter)
        .sort((a, b) => {
            if (sortBy === 'urgency') {
                const order = { Critical: 0, High: 1, Medium: 2, Low: 3 }
                return order[a.urgency] - order[b.urgency]
            }
            if (sortBy === 'upvotes') return b.upvote_count - a.upvote_count
            return new Date(b.created_at) - new Date(a.created_at)
        })

    // Stats
    const stats = {
        total: issues.length,
        open: issues.filter(i => i.status === 'Open').length,
        inProgress: issues.filter(i => i.status === 'In Progress').length,
        resolved: issues.filter(i => i.status === 'Resolved').length,
    }

    //  Chart Data
    const categories = ['Pothole', 'Garbage', 'Street Lighting', 'Water & Drainage', 'Vandalism', 'Other']
    const chartData = {
        labels: categories,
        datasets: [{
            label: 'Issues by Category',
            data: categories.map(c => issues.filter(i => i.category === c).length),
            backgroundColor: ['#e94560', '#f5a623', '#3498db', '#4ecca3', '#9b59b6', '#888'],
            borderRadius: 6,
        }]
    }
    const chartOptions = {
        responsive: true,
        plugins: { legend: { display: false } },
        scales: { y: { beginAtZero: true, ticks: { stepSize: 1 } } }
    }

    if (loading) return (
        <>
            <Navbar />
            <div style={styles.centerBox}>
                <p>Loading dashboard...</p>
            </div>
        </>
    )

    return (
        <>
            <Navbar />
            <div style={styles.container}>

                {/* Header  */}
                <div style={styles.header}>
                    <div>
                        <h1 style={styles.title}>🏛️ Authority Dashboard</h1>
                        <p style={styles.subtitle}>
                            Welcome, {user?.full_name} — Managing assigned issues
                        </p>
                    </div>
                </div>

                {/* Stats Row */}
                <div style={styles.statsRow}>
                    {[
                        { label: 'Total Assigned', value: stats.total, color: '#3498db' },
                        { label: 'Open', value: stats.open, color: '#e94560' },
                        { label: 'In Progress', value: stats.inProgress, color: '#f5a623' },
                        { label: 'Resolved', value: stats.resolved, color: '#4ecca3' },
                    ].map((s, i) => (
                        <div key={i} style={styles.statCard}>
                            <div style={{ ...styles.statNumber, color: s.color }}>{s.value}</div>
                            <div style={styles.statLabel}>{s.label}</div>
                        </div>
                    ))}
                </div>

                {/* Chart */}
                {/* <div style={styles.chartCard}>
                    <h2 style={styles.sectionTitle}>📊 Issues by Category</h2>
                    <div style={{ maxWidth: '600px' }}>
                        <Bar data={chartData} options={chartOptions} />
                    </div>
                </div> */}

                {/* Chart */}
                <div style={styles.chartCard}>
                    <h2 style={styles.sectionTitle}>📊 Issues by Category</h2>
                    {issues.length > 0 ? (
                        <div style={{ maxWidth: '600px' }}>
                            <Bar data={chartData} options={chartOptions} />
                        </div>
                    ) : (
                        <p style={{ color: '#888', fontSize: '14px', textAlign: 'center', padding: '20px' }}>
                            No issues yet to display chart.
                        </p>
                    )}
                </div>

                {/* ── Filter + Sort ────────────────── */}
                <div style={styles.controls}>
                    {/* Filter Tabs */}
                    <div style={styles.filterTabs}>
                        {['All', 'Open', 'In Progress', 'Resolved'].map(f => (
                            <button
                                key={f}
                                onClick={() => setFilter(f)}
                                style={{
                                    ...styles.filterTab,
                                    backgroundColor: filter === f ? '#1a1a2e' : '#f0f0f0',
                                    color: filter === f ? '#fff' : '#444',
                                }}
                            >
                                {f}
                            </button>
                        ))}
                    </div>

                    {/* Sort */}
                    <select
                        value={sortBy}
                        onChange={e => setSortBy(e.target.value)}
                        style={styles.sortSelect}
                    >
                        <option value="date">Sort by Date</option>
                        <option value="urgency">Sort by Urgency</option>
                        <option value="upvotes">Sort by Upvotes</option>
                    </select>
                </div>

                {/*Issues Table */}
                <div style={styles.tableCard}>
                    <h2 style={styles.sectionTitle}>📋 Issue Queue</h2>

                    {filtered.length === 0 ? (
                        <p style={styles.emptyText}>No issues found for this filter.</p>
                    ) : (
                        filtered.map(issue => (
                            <div key={issue.id} style={styles.issueRow}>

                                {/* Left Info */}
                                <div style={styles.issueInfo}>
                                    <div style={styles.issueTop}>
                                        <span style={styles.ticketNum}>🎫 {issue.ticket_number}</span>
                                        <span style={{
                                            ...styles.urgencyBadge,
                                            backgroundColor: urgencyColor(issue.urgency)
                                        }}>
                                            {issue.urgency}
                                        </span>
                                        <span style={{
                                            ...styles.statusBadge,
                                            backgroundColor: statusColor(issue.status)
                                        }}>
                                            {issue.status}
                                        </span>
                                    </div>
                                    <h3 style={styles.issueTitle}>{issue.title}</h3>
                                    <p style={styles.issueMeta}>
                                        👤 {issue.reported_by} &nbsp;|&nbsp;
                                        📁 {issue.category} &nbsp;|&nbsp;
                                        👍 {issue.upvote_count} upvotes &nbsp;|&nbsp;
                                        📅 {new Date(issue.created_at).toLocaleDateString()}
                                    </p>
                                </div>

                                {/* Right Actions */}
                                <div style={styles.issueActions}>
                                    {issue.status !== 'Resolved' && (
                                        <>
                                            <input
                                                placeholder="Official response (optional)"
                                                value={updating === issue.id ? response : ''}
                                                onChange={e => setResponse(e.target.value)}
                                                onFocus={() => setUpdating(issue.id)}
                                                style={styles.responseInput}
                                            />
                                            <div style={styles.actionBtns}>
                                                {issue.status === 'Open' && (
                                                    <button
                                                        onClick={() => handleUpdateStatus(issue.id, 'In Progress')}
                                                        style={styles.inProgressBtn}
                                                        disabled={updating === issue.id}
                                                    >
                                                        ▶ Start Working
                                                    </button>
                                                )}
                                                <button
                                                    onClick={() => handleUpdateStatus(issue.id, 'Resolved')}
                                                    style={styles.resolveBtn}
                                                    disabled={updating === issue.id}
                                                >
                                                    ✅ Resolve
                                                </button>
                                            </div>
                                        </>
                                    )}
                                    {issue.status === 'Resolved' && (
                                        <span style={styles.resolvedTag}>✅ Completed</span>
                                    )}
                                </div>

                            </div>
                        ))
                    )}
                </div>

            </div>
        </>
    )
}

const styles = {
    container: { maxWidth: '1100px', margin: '0 auto', padding: '30px 20px' },
    centerBox: { display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' },

    // Header
    header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' },
    title: { fontSize: '26px', fontWeight: 'bold', color: '#1a1a2e', marginBottom: '4px' },
    subtitle: { color: '#888', fontSize: '14px' },

    // Stats
    statsRow: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
        gap: '16px',
        marginBottom: '24px',
    },
    statCard: { backgroundColor: '#fff', borderRadius: '12px', padding: '20px', textAlign: 'center', boxShadow: '0 4px 15px rgba(0,0,0,0.06)' },
    statNumber: { fontSize: '36px', fontWeight: 'bold', marginBottom: '6px' },
    statLabel: { color: '#888', fontSize: '13px' },

    // Chart
    chartCard: {
        backgroundColor: '#fff',
        borderRadius: '12px',
        padding: '24px',
        marginBottom: '24px',
        boxShadow: '0 4px 15px rgba(0,0,0,0.06)',
    },
    sectionTitle: { fontSize: '18px', fontWeight: 'bold', color: '#1a1a2e', marginBottom: '16px' },

    // Controls
    controls: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '16px',
        flexWrap: 'wrap',
        gap: '12px',
    },
    filterTabs: { display: 'flex', gap: '8px', flexWrap: 'wrap' },
    filterTab: {
        padding: '8px 16px',
        borderRadius: '20px',
        border: 'none',
        cursor: 'pointer',
        fontSize: '13px',
        fontWeight: 'bold',
    },
    sortSelect: {
        padding: '8px 14px',
        borderRadius: '8px',
        border: '1px solid #ddd',
        fontSize: '13px',
        outline: 'none',
    },

    // Table
    tableCard: {
        backgroundColor: '#fff',
        borderRadius: '12px',
        padding: '24px',
        boxShadow: '0 4px 15px rgba(0,0,0,0.06)',
    },
    issueRow: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        padding: '16px 0',
        borderBottom: '1px solid #eee',
        gap: '16px',
        flexWrap: 'wrap',
    },
    issueInfo: { flex: 1 },
    issueTop: { display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '6px', flexWrap: 'wrap' },
    ticketNum: { fontSize: '12px', color: '#888', fontWeight: 'bold' },
    urgencyBadge: { color: '#fff', padding: '2px 8px', borderRadius: '10px', fontSize: '11px', fontWeight: 'bold' },
    statusBadge: { color: '#fff', padding: '2px 8px', borderRadius: '10px', fontSize: '11px', fontWeight: 'bold' },
    issueTitle: { fontSize: '15px', fontWeight: 'bold', color: '#1a1a2e', marginBottom: '4px' },
    issueMeta: { fontSize: '12px', color: '#888' },

    // Actions
    issueActions: { display: 'flex', flexDirection: 'column', gap: '8px', minWidth: '200px' },
    responseInput: {
        padding: '8px 12px',
        borderRadius: '8px',
        border: '1px solid #ddd',
        fontSize: '12px',
        outline: 'none',
        width: '100%',
    },
    actionBtns: { display: 'flex', gap: '8px' },
    inProgressBtn: {
        padding: '8px 14px',
        borderRadius: '8px',
        border: 'none',
        backgroundColor: '#f5a623',
        color: '#fff',
        fontSize: '12px',
        fontWeight: 'bold',
        cursor: 'pointer',
    },
    resolveBtn: {
        padding: '8px 14px',
        borderRadius: '8px',
        border: 'none',
        backgroundColor: '#4ecca3',
        color: '#fff',
        fontSize: '12px',
        fontWeight: 'bold',
        cursor: 'pointer',
    },
    resolvedTag: { color: '#4ecca3', fontWeight: 'bold', fontSize: '14px' },
    emptyText: { color: '#888', textAlign: 'center', padding: '30px' },
}

export default AdminDashboard