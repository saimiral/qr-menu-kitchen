import { useEffect, useState } from 'react';
import './TableQrModal.css';

const API_BASE = 'http://localhost:8080';

export default function TableQrModal({ tableId, tableLabel, onClose }) {
  const [imgUrl, setImgUrl] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    let objectUrl;
    const fetchQr = async () => {
      try {
        const token = localStorage.getItem('qrder_token');
        const res = await fetch(
          `${API_BASE}/api/admin/tables/${tableId}/qr-code?size=600`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (!res.ok) throw new Error('Αποτυχία φόρτωσης QR code');
        const blob = await res.blob();
        objectUrl = URL.createObjectURL(blob);
        setImgUrl(objectUrl);
      } catch (err) {
        setError(err.message);
      }
    };
    fetchQr();
    return () => { if (objectUrl) URL.revokeObjectURL(objectUrl); };
  }, [tableId]);

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
  );
}