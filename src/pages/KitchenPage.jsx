import { useEffect, useState, useRef, useCallback } from 'react'
import api from '../api'
import styles from './KitchenPage.module.css'

const STATUS_LABELS = {
  PENDING: 'Νέα',
  PREPARING: 'Σε εκτέλεση',
  READY: 'Έτοιμη',
}

const STATUS_NEXT = {
  PENDING: 'PREPARING',
  PREPARING: 'READY',
  READY: null,
}

const STATUS_NEXT_LABEL = {
  PENDING: 'Ξεκίνα',
  PREPARING: 'Έτοιμο',
  READY: null,
}

const COLUMNS = ['PENDING', 'PREPARING', 'READY']

export default function KitchenPage({ storeSlug }) {
  const [orders, setOrders] = useState([])
  const [connected, setConnected] = useState(false)
  const [lastUpdate, setLastUpdate] = useState(null)
  const audioRef = useRef(null)
  const eventSourceRef = useRef(null)

  // Φέρνει αρχικές παραγγελίες
  const fetchOrders = useCallback(async () => {
    try {
      const res = await api.get(`/orders/kitchen/${storeSlug}`)
      setOrders(res.data)
    } catch (e) {
      console.error('Failed to fetch orders', e)
    }
  }, [storeSlug])

 // SSE σύνδεση
useEffect(() => {
  fetchOrders()

  let es = null
  let retryTimer = null
  let cancelled = false

  const connect = async () => {
    try {
      // 1) Ζητάμε βραχύβιο ticket μιας χρήσης (το κανονικό JWT πάει στο header, όχι στο URL)
      const { data } = await api.post('/auth/sse-token')
      if (cancelled) return

      // 2) Ανοίγουμε το stream με το ticket
      es = new EventSource(
        `${api.defaults.baseURL}/orders/kitchen/${storeSlug}/stream?token=${encodeURIComponent(data.token)}`
      )
      eventSourceRef.current = es

      es.addEventListener('new-order', (e) => {
        const newOrder = JSON.parse(e.data)
        setOrders(prev => {
          const exists = prev.find(o => o.id === newOrder.id)
          if (exists) return prev
          return [newOrder, ...prev]
        })
        setLastUpdate(new Date())
        audioRef.current?.play().catch(() => {})
      })

      es.onopen = () => setConnected(true)
      es.onerror = () => {
        setConnected(false)
        es.close() // το ticket είναι μιας χρήσης, δεν αφήνουμε τον browser να κάνει auto-reconnect
        if (!cancelled) {
          retryTimer = setTimeout(() => { fetchOrders(); connect() }, 3000)
        }
      }
    } catch (e) {
      setConnected(false)
      if (!cancelled) retryTimer = setTimeout(connect, 3000)
    }
  }

  connect()

  return () => {
    cancelled = true
    clearTimeout(retryTimer)
    es?.close()
  }
}, [storeSlug, fetchOrders])

  const updateStatus = async (orderId, newStatus) => {
    try {
      const res = await api.put(`/orders/${orderId}/status`, { status: newStatus })
      setOrders(prev => prev.map(o => o.id === orderId ? res.data : o))
    } catch (e) {
      console.error('Failed to update status', e)
    }
  }

  const getOrdersByStatus = (status) =>
    orders.filter(o => o.status === status)
      .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))

  const formatTime = (createdAt) => {
    const diff = Math.floor((Date.now() - new Date(createdAt)) / 1000 / 60)
    if (diff < 1) return 'Μόλις τώρα'
    if (diff === 1) return '1 λεπτό'
    return `${diff} λεπτά`
  }

  return (
    <div className={styles.page}>
      {/* Hidden audio για ειδοποίηση */}
      <audio ref={audioRef} src="/notification.mp3" preload="auto" />

      {/* Header */}
      <header className={styles.header}>
        <div className={styles.headerLeft}>
          <h1 className={styles.title}>Kitchen</h1>
          <span className={styles.slug}>{storeSlug}</span>
        </div>
        <div className={styles.headerRight}>
          {lastUpdate && (
            <span className={styles.lastUpdate}>
              Τελευταία: {lastUpdate.toLocaleTimeString('el-GR', { hour: '2-digit', minute: '2-digit' })}
            </span>
          )}
          <div className={`${styles.statusDot} ${connected ? styles.connected : styles.disconnected}`} />
        </div>
      </header>

      {/* Columns */}
      <div className={styles.board}>
        {COLUMNS.map(status => (
          <div key={status} className={styles.column}>
            <div className={styles.columnHeader}>
              <span className={`${styles.columnLabel} ${styles[`label_${status}`]}`}>
                {STATUS_LABELS[status]}
              </span>
              <span className={styles.columnCount}>
                {getOrdersByStatus(status).length}
              </span>
            </div>

            <div className={styles.cards}>
              {getOrdersByStatus(status).length === 0 ? (
                <div className={styles.emptyCol}>Καμία παραγγελία</div>
              ) : (
                getOrdersByStatus(status).map(order => (
                  <div key={order.id} className={`${styles.card} ${styles[`card_${status}`]}`}>
                    <div className={styles.cardHeader}>
                      <span className={styles.tableNum}>Τραπέζι {order.tableNumber}</span>
                      <span className={styles.timeAgo}>{formatTime(order.createdAt)}</span>
                    </div>

                    <div className={styles.itemsList}>
                      {order.items.map(item => (
                        <div key={item.id} className={styles.item}>
                          <span className={styles.itemQty}>{item.quantity}×</span>
                          <div className={styles.itemInfo}>
                            <span className={styles.itemName}>{item.menuItemName}</span>
                            {item.notes && (
                              <span className={styles.itemNotes}>📝 {item.notes}</span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>

                    {STATUS_NEXT[status] && (
                      <button
                        className={`${styles.actionBtn} ${styles[`actionBtn_${status}`]}`}
                        onClick={() => updateStatus(order.id, STATUS_NEXT[status])}
                      >
                        {STATUS_NEXT_LABEL[status]}
                      </button>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
