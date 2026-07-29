import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const Navbar = () => {
    const { user, logout } = useAuth()
    const navigate = useNavigate()

    const handleLogout = () => {
        logout()
        navigate('/')
    }

    return (
        <nav style={styles.nav}>
            {/* Logo */}
            <Link to="/" style={styles.logo}>
                🏙️ CivicFix
            </Link>

            {/* Links */}
            <div style={styles.links}>
                <Link to="/"        style={styles.link}>Home</Link>
                <Link to="/map"     style={styles.link}>Live Map</Link>

                {!user ? (
                    <>
                        <Link to="/login"    style={styles.link}>Login</Link>
                        <Link to="/register" style={{...styles.link, ...styles.registerBtn}}>
                            Register
                        </Link>
                    </>
                ) : (
                    <>
                        <Link to="/report" style={styles.link}>Report Issue</Link>
                        <Link
                            to={user.role === 'authority' ? '/admin' : '/dashboard'}
                            style={styles.link}
                        >
                            Dashboard
                        </Link>
                        <span style={styles.userName}>👤 {user.full_name}</span>
                        <button onClick={handleLogout} style={styles.logoutBtn}>
                            Logout
                        </button>
                    </>
                )}
            </div>
        </nav>
    )
}

const styles = {
    nav: {
        display:         'flex',
        justifyContent:  'space-between',
        alignItems:      'center',
        padding:         '0 40px',
        height:          '65px',
        backgroundColor: '#1a1a2e',
        boxShadow:       '0 2px 10px rgba(0,0,0,0.3)',
        position:        'sticky',
        top:             0,
        zIndex:          1000,
    },
    logo: {
        fontSize:   '22px',
        fontWeight: 'bold',
        color:      '#e94560',
    },
    links: {
        display:    'flex',
        alignItems: 'center',
        gap:        '20px',
    },
    link: {
        color:      '#ccc',
        fontSize:   '15px',
        transition: 'color 0.2s',
    },
    registerBtn: {
        backgroundColor: '#e94560',
        color:           '#fff',
        padding:         '8px 18px',
        borderRadius:    '20px',
        fontWeight:      'bold',
    },
    userName: {
        color:      '#4ecca3',
        fontSize:   '14px',
        fontWeight: 'bold',
    },
    logoutBtn: {
        backgroundColor: 'transparent',
        border:          '1px solid #e94560',
        color:           '#e94560',
        padding:         '6px 16px',
        borderRadius:    '20px',
        cursor:          'pointer',
        fontSize:        '14px',
    }
}

export default Navbar