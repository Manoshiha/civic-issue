import { useState, useEffect } from 'react'
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import { getAllIssues } from '../services/api'
import Navbar from '../components/Navbar'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'

delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl:       'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl:     'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
})

const createIcon = (color) => new L.Icon({
    iconUrl:     `https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-${color}.png`,
    shadowUrl:   'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    iconSize:    [25, 41],
    iconAnchor:  [12, 41],
    popupAnchor: [1, -34],
    shadowSize:  [41, 41],
})

const icons = {
    'Open':        createIcon('red'),
    'In Progress': createIcon('orange'),
    'Resolved':    createIcon('green'),
}

const statusColor  = (s) => s === 'Open' ? '#e94560' : s === 'In Progress' ? '#f5a623' : '#4ecca3'
const urgencyColor = (u) => u === 'Critical' ? '#e94560' : u === 'High' ? '#f5a623' : u === 'Medium' ? '#3498db' : '#4ecca3'

const LiveMap = () => {
    const [issues, setIssues]     = useState([])
    const [filtered, setFiltered] = useState([])
    const [loading, setLoading]   = useState(true)
    const [filters, setFilters]   = useState({
        status:   { Open: true, 'In Progress': true, Resolved: true },
        urgency:  { Low: true, Medium: true, High: true, Critical: true },
        category: { Pothole: true, Garbage: true, 'Street Lighting': true, 'Water & Drainage': true, Vandalism: true, Other: true }
    })

    useEffect(() => {
        getAllIssues()
            .then(res => { setIssues(res.data.issues); setFiltered(res.data.issues) })
            .catch(() => {})
            .finally(() => setLoading(false))
    }, [])

    useEffect(() => {
        const result = issues.filter(i =>
            filters.status[i.status] &&
            filters.urgency[i.urgency] &&
            filters.category[i.category]
        )
        setFiltered(result)
    }, [filters, issues])

    const toggleFilter = (type, key) => {
        setFilters(prev => ({
            ...prev,
            [type]: { ...prev[type], [key]: !prev[type][key] }
        }))
    }

    const resetFilters = () => setFilters({
        status:   { Open: true, 'In Progress': true, Resolved: true },
        urgency:  { Low: true, Medium: true, High: true, Critical: true },
        category: { Pothole: true, Garbage: true, 'Street Lighting': true, 'Water & Drainage': true, Vandalism: true, Other: true }
    })

    const mappedIssues = filtered.filter(i => i.lat && i.lng)
    const stats = {
        total:      filtered.length,
        open:       filtered.filter(i => i.status === 'Open').length,
        inProgress: filtered.filter(i => i.status === 'In Progress').length,
        resolved:   filtered.filter(i => i.status === 'Resolved').length,
    }

    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
            <Navbar />
            <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>

                {/* Sidebar */}
                <div style={styles.sidebar}>
                    <h2 style={styles.sidebarTitle}>🗺️ Live Issue Map</h2>

                    {/* Stats */}
                    <div style={styles.statsBox}>
                        <p style={{ color: '#fff', fontSize: '13px' }}>Total: <b>{stats.total}</b></p>
                        <p style={{ color: '#e94560', fontSize: '13px' }}>Open: <b>{stats.open}</b></p>
                        <p style={{ color: '#f5a623', fontSize: '13px' }}>In Progress: <b>{stats.inProgress}</b></p>
                        <p style={{ color: '#4ecca3', fontSize: '13px' }}>Resolved: <b>{stats.resolved}</b></p>
                    </div>

                    {/* Legend */}
                    <div style={styles.section}>
                        <p style={styles.sectionLabel}>📍 Pin Colors</p>
                        {[['#e94560','Open'],['#f5a623','In Progress'],['#4ecca3','Resolved']].map(([color, label]) => (
                            <div key={label} style={styles.legendItem}>
                                <span style={{ ...styles.dot, backgroundColor: color }} />
                                <span style={styles.lightText}>{label}</span>
                            </div>
                        ))}
                    </div>

                    {/* Filter Status */}
                    <div style={styles.section}>
                        <p style={styles.sectionLabel}>Filter by Status</p>
                        {Object.keys(filters.status).map(s => (
                            <label key={s} style={styles.checkRow}>
                                <input type="checkbox" checked={filters.status[s]} onChange={() => toggleFilter('status', s)} />
                                <span style={{ color: statusColor(s), fontSize: '13px' }}>{s}</span>
                            </label>
                        ))}
                    </div>

                    {/* Filter Urgency */}
                    <div style={styles.section}>
                        <p style={styles.sectionLabel}>Filter by Urgency</p>
                        {Object.keys(filters.urgency).map(u => (
                            <label key={u} style={styles.checkRow}>
                                <input type="checkbox" checked={filters.urgency[u]} onChange={() => toggleFilter('urgency', u)} />
                                <span style={{ color: urgencyColor(u), fontSize: '13px' }}>{u}</span>
                            </label>
                        ))}
                    </div>

                    {/* Filter Category */}
                    <div style={styles.section}>
                        <p style={styles.sectionLabel}>Filter by Category</p>
                        {Object.keys(filters.category).map(c => (
                            <label key={c} style={styles.checkRow}>
                                <input type="checkbox" checked={filters.category[c]} onChange={() => toggleFilter('category', c)} />
                                <span style={styles.lightText}>{c}</span>
                            </label>
                        ))}
                    </div>

                    <button onClick={resetFilters} style={styles.resetBtn}>
                        🔄 Reset Filters
                    </button>

                    {filtered.length > 0 && mappedIssues.length === 0 && (
                        <div style={styles.warning}>
                            ⚠️ Issues exist but have no coordinates!
                        </div>
                    )}
                </div>

                {/* Map */}
                <div style={{ flex: 1 }}>
                    {loading ? (
                        <div style={styles.loadingBox}>Loading map...</div>
                    ) : (
                        <MapContainer
                            center={[7.8731, 80.7718]}
                            zoom={8}
                            style={{ height: '100%', width: '100%' }}
                        >
                            <TileLayer
                                attribution='&copy; OpenStreetMap contributors'
                                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                            />
                            {mappedIssues.map(issue => (
                                <Marker
                                    key={issue.id}
                                    position={[parseFloat(issue.lat), parseFloat(issue.lng)]}
                                    icon={icons[issue.status] || icons['Open']}
                                >
                                    <Popup>
                                        <div style={{ minWidth: '160px' }}>
                                            <p style={{ fontSize: '11px', color: '#888' }}>🎫 {issue.ticket_number}</p>
                                            <h3 style={{ fontSize: '14px', fontWeight: 'bold', margin: '4px 0' }}>{issue.title}</h3>
                                            <p style={{ fontSize: '12px', color: '#666' }}>📁 {issue.category}</p>
                                            <p style={{ fontSize: '12px', color: urgencyColor(issue.urgency), fontWeight: 'bold' }}>
                                                ⚠️ {issue.urgency}
                                            </p>
                                            <p style={{ fontSize: '11px', color: '#888' }}>📍 {issue.location_address || 'No address'}</p>
                                            <a href={`/issue/${issue.id}`} style={{ color: '#e94560', fontSize: '12px', fontWeight: 'bold' }}>
                                                View Details →
                                            </a>
                                        </div>
                                    </Popup>
                                </Marker>
                            ))}
                        </MapContainer>
                    )}
                </div>

            </div>
        </div>
    )
}

const styles = {
    sidebar: {
        width:           '260px',
        minWidth:        '260px',
        backgroundColor: '#1a1a2e',
        padding:         '20px',
        overflowY:       'auto',
        color:           '#fff',
    },
    sidebarTitle: { fontSize: '16px', fontWeight: 'bold', marginBottom: '14px' },
    statsBox:     { backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: '8px', padding: '12px', marginBottom: '14px' },
    section:      { marginBottom: '14px' },
    sectionLabel: { fontSize: '12px', fontWeight: 'bold', color: '#aaa', marginBottom: '8px' },
    legendItem:   { display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' },
    dot:          { width: '10px', height: '10px', borderRadius: '50%', display: 'inline-block' },
    lightText:    { fontSize: '13px', color: '#ccc' },
    checkRow:     { display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px', cursor: 'pointer' },
    resetBtn: {
        width:           '100%',
        padding:         '10px',
        backgroundColor: '#e94560',
        color:           '#fff',
        border:          'none',
        borderRadius:    '8px',
        cursor:          'pointer',
        fontWeight:      'bold',
        fontSize:        '13px',
    },
    warning:    { backgroundColor: 'rgba(245,166,35,0.2)', border: '1px solid #f5a623', borderRadius: '8px', padding: '10px', fontSize: '12px', color: '#f5a623', marginTop: '12px' },
    loadingBox: { display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', fontSize: '16px', color: '#888' },
}

export default LiveMap