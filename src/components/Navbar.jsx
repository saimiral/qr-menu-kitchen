import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import styles from './Navbar.module.css'

export default function Navbar() {
  const { user, logout } = useAuth()
  const location = useLocation()

  if (!user || location.pathname === '/login') return null

  return (
    <nav className={styles.nav}>
      <div className={styles.left}>
        <Link to="/kitchen" className={styles.link}>Κουζίνα</Link>
        {user.role === 'ADMIN' && (
          <>
            <Link to="/admin/menu" className={styles.link}>Μενού</Link>
            <Link to="/admin/tables" className={styles.link}>Τραπέζια</Link>
          </>
        )}
      </div>
      <div className={styles.right}>
        <span className={styles.email}>{user.email}</span>
        <button onClick={logout} className={styles.logoutBtn}>Αποσύνδεση</button>
      </div>
    </nav>
  )
}