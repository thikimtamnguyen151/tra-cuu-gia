'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../../lib/supabase'

const removeAccents = (str) => {
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .toLowerCase()
}

export default function TraCuuPage() {
  const [user, setUser] = useState(null)
  const [products, setProducts] = useState([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const userData = localStorage.getItem('user')
    if (!userData) {
      router.push('/')
      return
    }
    setUser(JSON.parse(userData))
    fetchProducts()
  }, [])

  const fetchProducts = async () => {
    const { data } = await supabase
      .from('products')
      .select('*')
      .order('name')
    setProducts(data || [])
    setLoading(false)
  }

  const handleLogout = () => {
    localStorage.removeItem('user')
    router.push('/')
  }

  const formatPrice = (price, supplier) => {
    if (!price) return (
      <span className="text-gray-400 italic">
        Liên hệ {supplier ? supplier : ''}
      </span>
    )
    return new Intl.NumberFormat('vi-VN').format(price) + 'đ'
  }

  const words = removeAccents(search).split(' ').filter(w => w !== '')
  const filtered = products.filter(p => {
    if (words.length === 0) return false
    const target = removeAccents((p.name || '') + ' ' + (p.supplier || ''))
    return words.every(word => target.includes(word))
  })

return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-white shadow-sm px-4 py-3 flex items-center justify-between">
        <h1 className="text-lg font-bold text-gray-800">Tra Cứu Giá</h1>
        <div className="flex items-center gap-3">
          {user?.role === 'admin' && (
            <button
              onClick={() => router.push('/quan-ly')}
              className="text-sm text-blue-500 hover:text-blue-700 font-medium"
            >
              Quản lý giá
            </button>
          )}
          <span className="text-sm text-gray-600">{user?.full_name}</span>
          <button
            onClick={handleLogout}
            className="text-sm text-red-500 hover:text-red-700"
          >
            Đăng xuất
          </button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Search */}
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="🔍 Tìm tên hàng hoặc nhà cung cấp..."
          className="w-full border border-gray-300 rounded-xl px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white shadow-sm mb-4"
        />

        {/* Kết quả */}
        {loading ? (
          <p className="text-center text-gray-500 py-10">Đang tải...</p>
        ) : search.trim() === '' ? (
          <p className="text-center text-gray-400 py-10">Nhập tên hàng để tìm kiếm</p>
        ) : filtered.length === 0 ? (
          <p className="text-center text-gray-500 py-10">Không tìm thấy sản phẩm nào</p>
        ) : (
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-600">
                <tr>
                  <th className="text-left px-4 py-3">Tên hàng</th>
                  <th className="text-left px-4 py-3">ĐVT</th>
                  <th className="text-right px-4 py-3">Giá vốn</th>
                  <th className="text-right px-4 py-3">Giá bán</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((p, i) => (
                  <tr key={p.id} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className="px-4 py-3 font-medium text-gray-800">{p.name}</td>
                    <td className="px-4 py-3 text-gray-600">{p.unit || '-'}</td>
                    <td className="px-4 py-3 text-right text-gray-700">{formatPrice(p.cost_price, p.supplier)}</td>
                    <td className="px-4 py-3 text-right font-semibold text-blue-600">{formatPrice(p.sell_price, p.supplier)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {search.trim() !== '' && (
          <p className="text-center text-gray-400 text-xs mt-4">
            {filtered.length} sản phẩm
          </p>
        )}
      </div>
    </div>
  )
}