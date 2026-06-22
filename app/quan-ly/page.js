'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../../lib/supabase'
import { useDarkMode } from '../../lib/useDarkMode'

export default function QuanLyPage() {
  const [user, setUser] = useState(null)
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [showRecent, setShowRecent] = useState(false)
  const [editing, setEditing] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ name: '', unit: '', cost_price: '', sell_price: '', supplier: '' })
  const router = useRouter()
  const { dark, toggle } = useDarkMode()

  useEffect(() => {
    const userData = localStorage.getItem('user')
    if (!userData) { router.push('/'); return }
    const parsed = JSON.parse(userData)
    if (parsed.role !== 'admin') { router.push('/tra-cuu'); return }
    setUser(parsed)
    fetchProducts()
  }, [])

  const fetchProducts = async () => {
    const { data } = await supabase
      .from('products')
      .select('*')
      .order('name')
      .range(0, 9999)
    setProducts(data || [])
    setLoading(false)
  }

  const handleSave = async () => {
    if (!form.name.trim()) return alert('Vui lòng nhập tên hàng!')
    const payload = {
      name: form.name.trim(),
      unit: form.unit.trim() || null,
      cost_price: form.cost_price ? Number(form.cost_price) : null,
      sell_price: form.sell_price ? Number(form.sell_price) : null,
      supplier: form.supplier.trim() || null,
    }
    if (editing) {
      await supabase.from('products').update(payload).eq('id', editing)
    } else {
      await supabase.from('products').insert(payload)
    }
    setForm({ name: '', unit: '', cost_price: '', sell_price: '', supplier: '' })
    setEditing(null)
    setShowForm(false)
    fetchProducts()
  }

  const handleEdit = (p) => {
    setForm({
      name: p.name || '',
      unit: p.unit || '',
      cost_price: p.cost_price || '',
      sell_price: p.sell_price || '',
      supplier: p.supplier || '',
    })
    setEditing(p.id)
    setShowForm(true)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleDelete = async (id, name) => {
    if (!confirm(`Xóa "${name}"?`)) return
    await supabase.from('products').delete().eq('id', id)
    fetchProducts()
  }

  const handleLogout = () => {
    localStorage.removeItem('user')
    router.push('/')
  }

  const removeAccents = (str) => str.normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/đ/g, 'd').replace(/Đ/g, 'D').toLowerCase()

  const words = removeAccents(search).split(' ').filter(w => w !== '')
  const isRecent = (p) => {
    if (!p.updated_at) return false
    const diffDays = (new Date() - new Date(p.updated_at)) / (1000 * 60 * 60 * 24)
    return diffDays <= 7
  }

  const filtered = products.filter(p => {
    if (showRecent && !isRecent(p)) return false
    if (words.length === 0) return true
    const target = removeAccents((p.name || '') + ' ' + (p.supplier || ''))
    return words.every(word => target.includes(word))
  })

  const formatPrice = (price) => {
    if (!price) return <span className="text-gray-400 dark:text-gray-500 italic">-</span>
    return new Intl.NumberFormat('vi-VN').format(price) + 'đ'
  }

  const inputClass = "w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm px-4 py-3 flex items-center justify-between">
        <h1 className="text-lg font-bold text-gray-800 dark:text-gray-100">Quản Lý Giá</h1>
        <div className="flex items-center gap-3">
          <button onClick={() => router.push('/tra-cuu')} className="text-sm text-blue-500 hover:text-blue-400">Tra cứu</button>
          <span className="text-sm text-gray-600 dark:text-gray-300">{user?.full_name}</span>
          <button
            onClick={toggle}
            className="w-8 h-8 flex items-center justify-center rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
            title="Bật/tắt dark mode"
          >
            {dark ? '☀️' : '🌙'}
          </button>
          <button onClick={handleLogout} className="text-sm text-red-500 hover:text-red-400">Đăng xuất</button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6">

        {/* Form thêm/sửa */}
        {showForm && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-5 mb-6">
            <h2 className="font-semibold text-gray-800 dark:text-gray-100 mb-4">{editing ? 'Sửa sản phẩm' : 'Thêm sản phẩm mới'}</h2>
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2">
                <label className="text-sm text-gray-600 dark:text-gray-400 mb-1 block">Tên hàng *</label>
                <input value={form.name} onChange={e => setForm({...form, name: e.target.value})}
                  className={inputClass} placeholder="Nhập tên hàng" />
              </div>
              <div>
                <label className="text-sm text-gray-600 dark:text-gray-400 mb-1 block">Đơn vị tính</label>
                <input value={form.unit} onChange={e => setForm({...form, unit: e.target.value})}
                  className={inputClass} placeholder="Cái, bộ, m..." />
              </div>
              <div>
                <label className="text-sm text-gray-600 dark:text-gray-400 mb-1 block">Nhà cung cấp</label>
                <input value={form.supplier} onChange={e => setForm({...form, supplier: e.target.value})}
                  className={inputClass} placeholder="Tên NCC" />
              </div>
              <div>
                <label className="text-sm text-gray-600 dark:text-gray-400 mb-1 block">Giá vốn</label>
                <input value={form.cost_price} onChange={e => setForm({...form, cost_price: e.target.value})}
                  className={inputClass} placeholder="Để trống nếu chưa có" type="number" />
              </div>
              <div>
                <label className="text-sm text-gray-600 dark:text-gray-400 mb-1 block">Giá bán</label>
                <input value={form.sell_price} onChange={e => setForm({...form, sell_price: e.target.value})}
                  className={inputClass} placeholder="Để trống nếu chưa có" type="number" />
              </div>
            </div>
            <div className="flex gap-2 mt-4">
              <button onClick={handleSave} className="bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700 font-medium">
                {editing ? 'Lưu thay đổi' : 'Thêm mới'}
              </button>
              <button onClick={() => { setShowForm(false); setEditing(null); setForm({ name: '', unit: '', cost_price: '', sell_price: '', supplier: '' }) }}
                className="bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-5 py-2 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600">
                Hủy
              </button>
            </div>
          </div>
        )}

        {/* Thanh tìm kiếm + nút thêm */}
        <div className="flex gap-2 mb-4">
          <input type="text" value={search} onChange={e => setSearch(e.target.value)}
            placeholder="🔍 Tìm tên hàng hoặc nhà cung cấp..."
            className="flex-1 border border-gray-300 dark:border-gray-600 rounded-xl px-4 py-3 text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-800 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm" />
          <button onClick={() => setShowRecent(!showRecent)}
            className={`px-4 py-2 rounded-xl font-medium whitespace-nowrap border ${showRecent ? 'bg-orange-500 text-white border-orange-500' : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600'}`}>
            🕐 Vừa sửa
          </button>
          {!showForm && (
            <button onClick={() => { setShowForm(true); setEditing(null); setForm({ name: '', unit: '', cost_price: '', sell_price: '', supplier: '' }) }}
              className="bg-blue-600 text-white px-4 py-2 rounded-xl hover:bg-blue-700 font-medium whitespace-nowrap">
              + Thêm
            </button>
          )}
        </div>

        {/* Bảng sản phẩm */}
        {loading ? (
          <p className="text-center text-gray-500 dark:text-gray-400 py-10">Đang tải...</p>
        ) : (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-x-auto" style={{ WebkitOverflowScrolling: 'touch' }}>
            <table className="w-full text-sm">
              <thead className="bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-300">
                <tr>
                  <th className="text-left px-4 py-3">Tên hàng</th>
                  <th className="text-left px-4 py-3">ĐVT</th>
                  <th className="text-right px-4 py-3">Giá vốn</th>
                  <th className="text-right px-4 py-3">Giá bán</th>
                  <th className="text-left px-4 py-3">Nguồn</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((p, i) => (
                  <tr key={p.id} className={i % 2 === 0 ? 'bg-white dark:bg-gray-800' : 'bg-gray-50 dark:bg-gray-700'}>
                    <td className="px-4 py-3 font-medium text-gray-800 dark:text-gray-100">{p.name}</td>
                    <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{p.unit || '-'}</td>
                    <td className="px-4 py-3 text-right text-gray-700 dark:text-gray-300">{formatPrice(p.cost_price)}</td>
                    <td className="px-4 py-3 text-right font-semibold text-blue-600 dark:text-blue-400">{formatPrice(p.sell_price)}</td>
                    <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{p.supplier || '-'}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2 justify-end">
                        <button onClick={() => handleEdit(p)} className="text-blue-500 hover:text-blue-400 text-xs font-medium">Sửa</button>
                        <button onClick={() => handleDelete(p.id, p.name)} className="text-red-500 hover:text-red-400 text-xs font-medium">Xóa</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="text-center text-gray-400 dark:text-gray-500 text-xs py-3">{filtered.length} sản phẩm</p>
          </div>
        )}
      </div>
    </div>
  )
}
