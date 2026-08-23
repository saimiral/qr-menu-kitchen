import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import styles from './LoginPage.module.css'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSubmitting(true)
    try {
      const user = await login(email, password)
      navigate(user.role === 'ADMIN' ? '/admin/menu' : '/kitchen')
    } catch (err) {
      setError('Λάθος email ή κωδικός')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className={styles.page}>
      <form className={styles.form} onSubmit={handleSubmit}>
        <h1 className={styles.title}>QRder Login</h1>
        <label className={styles.label}>
          Email
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className={styles.input} required />
        </label>
        <label className={styles.label}>
          Κωδικός
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className={styles.input} required />
        </label>
        {error && <div className={styles.error}>{error}</div>}
        <button type="submit" className={styles.button} disabled={submitting}>
          {submitting ? 'Σύνδεση...' : 'Σύνδεση'}
        </button>
      </form>
    </div>
  )
}