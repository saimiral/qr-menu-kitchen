import { useEffect, useState } from 'react'
import api from '../../api'
import styles from './AdminMenuPage.module.css'

export default function AdminMenuPage() {
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [newCategoryName, setNewCategoryName] = useState('')
  const [newItemForms, setNewItemForms] = useState({})

  const fetchCategories = async () => {
    try {
      const res = await api.get('/admin/categories')
      setCategories(res.data)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchCategories() }, [])

  const handleAddCategory = async (e) => {
    e.preventDefault()
    if (!newCategoryName.trim()) return
    try {
      await api.post('/admin/categories', { name: newCategoryName, sortOrder: categories.length + 1 })
      setNewCategoryName('')
      fetchCategories()
    } catch (e) {
      alert('Αποτυχία δημιουργίας κατηγορίας')
    }
  }

  const handleDeleteCategory = async (id) => {
    if (!confirm('Σίγουρα θες να διαγράψεις αυτή την κατηγορία;')) return
    try {
      await api.delete(`/admin/categories/${id}`)
      fetchCategories()
    } catch (e) {
      alert(e.response?.data?.error || 'Αποτυχία διαγραφής')
    }
  }

  const handleItemFormChange = (categoryId, field, value) => {
    setNewItemForms(prev => ({ ...prev, [categoryId]: { ...prev[categoryId], [field]: value } }))
  }

  const handleAddItem = async (categoryId) => {
    const form = newItemForms[categoryId]
    if (!form?.name || !form?.price) return
    try {
      await api.post('/admin/menu-items', {
        name: form.name,
        description: form.description || '',
        price: parseFloat(form.price),
        imageUrl: form.imageUrl || null,
        available: true,
        categoryId,
      })
      setNewItemForms(prev => ({ ...prev, [categoryId]: {} }))
      fetchCategories()
    } catch (e) {
      alert('Αποτυχία προσθήκης προϊόντος')
    }
  }

  const handleDeleteItem = async (itemId) => {
    if (!confirm('Σίγουρα θες να διαγράψεις αυτό το προϊόν;')) return
    try {
      await api.delete(`/admin/menu-items/${itemId}`)
      fetchCategories()
    } catch (e) {
      alert('Αποτυχία διαγραφής')
    }
  }

  const handleToggleAvailability = async (itemId) => {
    try {
      await api.patch(`/admin/menu-items/${itemId}/availability`)
      fetchCategories()
    } catch (e) {
      alert('Αποτυχία ενημέρωσης διαθεσιμότητας')
    }
  }

  if (loading) return <div className={styles.page}>Φόρτωση μενού...</div>

  return (
    <div className={styles.page}>
      <h1 className={styles.title}>Διαχείριση Μενού</h1>

      <form className={styles.newCategoryForm} onSubmit={handleAddCategory}>
        <input type="text" placeholder="Νέα κατηγορία..." value={newCategoryName}
               onChange={(e) => setNewCategoryName(e.target.value)} className={styles.input} />
        <button type="submit" className={styles.addButton}>+ Κατηγορία</button>
      </form>

      {categories.map(category => (
        <div key={category.id} className={styles.category}>
          <div className={styles.categoryHeader}>
            <h2>{category.name}</h2>
            <button className={styles.deleteButton} onClick={() => handleDeleteCategory(category.id)}>
              Διαγραφή κατηγορίας
            </button>
          </div>

          <div className={styles.items}>
            {category.items.map(item => (
              <div key={item.id} className={styles.item}>
                <div className={styles.itemInfo}>
                  <span className={styles.itemName}>{item.name}</span>
                  <span className={styles.itemPrice}>€{item.price.toFixed(2)}</span>
                  {!item.available && <span className={styles.unavailable}>Μη διαθέσιμο</span>}
                </div>
                <div className={styles.itemActions}>
                  <button onClick={() => handleToggleAvailability(item.id)}>
                    {item.available ? 'Απόκρυψη' : 'Ενεργοποίηση'}
                  </button>
                  <button onClick={() => handleDeleteItem(item.id)} className={styles.deleteButton}>
                    Διαγραφή
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className={styles.newItemForm}>
            <input type="text" placeholder="Όνομα προϊόντος"
                   value={newItemForms[category.id]?.name || ''}
                   onChange={(e) => handleItemFormChange(category.id, 'name', e.target.value)} className={styles.input} />
            <input type="text" placeholder="Περιγραφή"
                   value={newItemForms[category.id]?.description || ''}
                   onChange={(e) => handleItemFormChange(category.id, 'description', e.target.value)} className={styles.input} />
            <input type="number" step="0.01" placeholder="Τιμή"
                   value={newItemForms[category.id]?.price || ''}
                   onChange={(e) => handleItemFormChange(category.id, 'price', e.target.value)} className={styles.inputSmall} />
            <button onClick={() => handleAddItem(category.id)} className={styles.addButton}>+ Προϊόν</button>
          </div>
        </div>
      ))}
    </div>
  )
}