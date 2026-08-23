import { useEffect, useState } from 'react'
import api from '../../api'
import styles from './AdminTablesPage.module.css'

export default function AdminTablesPage() {
  const [tables, setTables] = useState([])
  const [loading, setLoading] = useState(true)
  const [newTableNumber, setNewTableNumber] = useState('')

  const fetchTables = async () => {
    try {
      const res = await api.get('/admin/tables')
      setTables(res.data)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchTables() }, [])

  const handleAddTable = async (e) => {
    e.preventDefault()
    if (!newTableNumber) return
    try {
      await api.post('/admin/tables', { tableNumber: parseInt(newTableNumber, 10) })
      setNewTableNumber('')
      fetchTables()
    } catch (e) {
      alert('Αποτυχία δημιουργίας τραπεζιού')
    }
  }

  const handleDeleteTable = async (id) => {
    if (!confirm('Σίγουρα θες να διαγράψεις αυτό το τραπέζι;')) return
    try {
      await api.delete(`/admin/tables/${id}`)
      fetchTables()
    } catch (e) {
      alert('Αποτυχία διαγραφής')
    }
  }

  const handleToggleActive = async (id) => {
    try {
      await api.patch(`/admin/tables/${id}/toggle-active`)
      fetchTables()
    } catch (e) {
      alert('Αποτυχία ενημέρωσης')
    }
  }

  const [qrModalTable, setQrModalTable] = useState(null);

// μέσα στη λίστα/table row:
<button onClick={() => setQrModalTable(table)}>QR Code</button>

// στο τέλος του JSX:
{qrModalTable && (
  <TableQrModal
    tableId={qrModalTable.id}
    tableLabel={`Τραπέζι ${qrModalTable.number}`}  // προσάρμοσε στο field που έχεις
    onClose={() => setQrModalTable(null)}
  />
)}

  if (loading) return <div className={styles.page}>Φόρτωση τραπεζιών...</div>

  return (
    <div className={styles.page}>
      <h1 className={styles.title}>Διαχείριση Τραπεζιών</h1>

      <form className={styles.newForm} onSubmit={handleAddTable}>
        <input type="number" placeholder="Αριθμός τραπεζιού" value={newTableNumber}
               onChange={(e) => setNewTableNumber(e.target.value)} className={styles.input} />
        <button type="submit" className={styles.addButton}>+ Τραπέζι</button>
      </form>

      <div className={styles.list}>
        {tables.map(table => (
          <div key={table.id} className={styles.table}>
            <span className={styles.tableNum}>Τραπέζι {table.tableNumber}</span>
            <span className={styles.token}>{table.qrToken}</span>
            <span className={table.active ? styles.active : styles.inactive}>
              {table.active ? 'Ενεργό' : 'Ανενεργό'}
            </span>
            <div className={styles.actions}>
              <button onClick={() => handleToggleActive(table.id)}>
                {table.active ? 'Απενεργοποίηση' : 'Ενεργοποίηση'}
              </button>
              <button onClick={() => handleDeleteTable(table.id)} className={styles.deleteButton}>
                Διαγραφή
              </button>
            </div>
          </div>
        ))}
      </div>

      <p className={styles.note}>📌 Το QR code generation (εικόνα/εκτύπωση) είναι το επόμενο βήμα.</p>
    </div>
  )
}