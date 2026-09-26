import { useEffect, useState } from 'react'
import api from '../api'
import './TableQrModal.css'

export default function TableQrModal({ tableId, tableLabel, onClose }) {
  const [imgUrl, setImgUrl] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    let objectUrl
    const fetchQr = async () => {
      try {
        const res = await api.get(`/admin/tables/${tableId}/qr-code`, {
          params: { size: 600 },
          responseType: 'blob',
        })
        objectUrl = URL.createObjectURL(res.data)
        setImgUrl(objectUrl)
      } catch (err) {
        setError('Αποτυχία φόρτωσης QR code')
      }
    }
    fetchQr()
    return () => { if (objectUrl) URL.revokeObjectURL(objectUrl) }
  }, [tableId])

  return (
    <div className="qr-modal-overlay">
      <div className="qr-modal-content">
        {error && <p>{error}</p>}
        {imgUrl && (
          <div id="qr-print-area">
            <h3>{tableLabel}</h3>
            <img src={imgUrl} alt={`QR code για ${tableLabel}`} />
          </div>
        )}
        <div className="qr-modal-actions no-print">
          <button onClick={() => window.print()}>Εκτύπωση</button>
          <button onClick={onClose}>Κλείσιμο</button>
        </div>
      </div>
    </div>
  )
}