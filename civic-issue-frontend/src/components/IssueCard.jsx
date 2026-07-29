import { Link } from 'react-router-dom'

const IssueCard = ({ issue }) => {
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

    return (
        <div style={styles.card}>
            {/* Top Row */}
            <div style={styles.top}>
                <span style={styles.ticket}>🎫 {issue.ticket_number}</span>
                <span style={{
                    ...styles.statusBadge,
                    backgroundColor: statusColor(issue.status)
                }}>
                    {issue.status}
                </span>
            </div>

            {/* Title */}
            <h3 style={styles.title}>{issue.title}</h3>

            {/* Meta */}
            <div style={styles.meta}>
                <span style={{
                    ...styles.urgencyBadge,
                    backgroundColor: urgencyColor(issue.urgency)
                }}>
                    ⚠️ {issue.urgency}
                </span>
                <span style={styles.category}>📁 {issue.category}</span>
            </div>

            {/* Location */}
            <p style={styles.location}>
                📍 {issue.location_address || 'No location specified'}
            </p>

            {/* Date */}
            <p style={styles.date}>
                📅 {new Date(issue.created_at).toLocaleDateString()}
            </p>

            {/* View Button */}
            <Link to={`/issue/${issue.id}`} style={styles.viewBtn}>
                View Details →
            </Link>
        </div>
    )
}

const styles = {
    card: {
        backgroundColor: '#fff',
        borderRadius:    '12px',
        padding:         '20px',
        boxShadow:       '0 4px 15px rgba(0,0,0,0.06)',
        border:          '1px solid #eee',
    },
    top: {
        display:        'flex',
        justifyContent: 'space-between',
        alignItems:     'center',
        marginBottom:   '10px',
    },
    ticket:      { fontSize: '12px', color: '#888', fontWeight: 'bold' },
    statusBadge: { color: '#fff', padding: '3px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: 'bold' },
    title:       { fontSize: '15px', fontWeight: 'bold', color: '#1a1a2e', marginBottom: '10px' },
    meta:        { display: 'flex', gap: '8px', marginBottom: '8px', flexWrap: 'wrap' },
    urgencyBadge:{ color: '#fff', padding: '3px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: 'bold' },
    category:    { color: '#666', fontSize: '12px', padding: '3px 8px', backgroundColor: '#f5f5f5', borderRadius: '20px' },
    location:    { color: '#888', fontSize: '12px', marginBottom: '4px' },
    date:        { color: '#aaa', fontSize: '12px', marginBottom: '14px' },
    viewBtn:     { color: '#e94560', fontWeight: 'bold', fontSize: '13px' },
}

export default IssueCard