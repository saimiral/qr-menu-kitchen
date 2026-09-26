import { useEffect, useState } from 'react'
import api from '../api'
import './AllTablesQrModal.css'

export default function AllTablesQrModal({ tables, onClose }) {
  const [qrItems, setQrItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let objectUrls = []
    let cancelled = false

    const fetchAll = async () => {
      try {
        const results = await Promise.all(
          tables.map(table =>
            api.get(`/admin/tables/${table.id}/qr-code`, {
              params: { size: 400 },
              responseType: 'blob',
            }).then(res => {
              const url = URL.createObjectURL(res.data)
              objectUrls.push(url)
              return { id: table.id, tableNumber: table.tableNumber, imgUrl: url }
            })
          )
        )
        if (!cancelled) setQrItems(results)
      } catch (err) {
        if (!cancelled) setError('Αποτυχία φόρτωσης QR codes')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    fetchAll()

    return () => {
      cancelled = true
      objectUrls.forEach(url => URL.revokeObjectURL(url))
    }
  }, [tables])

  return (
    <div className="qr-all-overlay">
      <div className="qr-all-content">
        <div className="qr-all-actions no-print">
          <button onClick={() => window.print()}>Εκτύπωση Όλων</button>
          <button onClick={onClose}>Κλείσιμο</button>
        </div>

        {loading && <p className="no-print">Φόρτωση QR codes...</p>}
        {error && <p className="no-print">{error}</p>}

        <div id="qr-all-print-area" className="qr-all-grid">
          {qrItems.map(item => (
            <div key={item.id} className="qr-all-card">
              <h3>Τραπέζι {item.tableNumber}</h3>
              <img src={item.imgUrl} alt={`QR code Τραπέζι ${item.tableNumber}`} />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}