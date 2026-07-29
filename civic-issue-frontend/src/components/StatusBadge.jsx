const StatusBadge = ({ status }) => {
    const getColor = () => {
        if (status === 'Open')        return '#e94560'
        if (status === 'In Progress') return '#f5a623'
        if (status === 'Resolved')    return '#4ecca3'
        if (status === 'Rejected')    return '#888'
        return '#888'
    }

    const getIcon = () => {
        if (status === 'Open')        return '🔴'
        if (status === 'In Progress') return '🟡'
        if (status === 'Resolved')    return '🟢'
        if (status === 'Rejected')    return '⛔'
        return '⚪'
    }

    return (
        <span style={{
            backgroundColor: getColor(),
            color:           '#fff',
            padding:         '4px 12px',
            borderRadius:    '20px',
            fontSize:        '12px',
            fontWeight:      'bold',
            display:         'inline-block',
        }}>
            {getIcon()} {status}
        </span>
    )
}

export default StatusBadge