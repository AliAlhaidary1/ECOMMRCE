import { useState, useEffect } from 'react'
import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/router'
import ProtectedRoute from '../../components/ProtectedRoute'
import Link from 'next/link'
import { 
  Package, 
  ShoppingCart, 
  Eye,
  ShoppingBag,
  User,
  LogOut,
  Menu,
  X,
  ArrowRight
} from 'lucide-react'
import toast from 'react-hot-toast'

interface Order {
  id: string
  status: string
  total: number
  createdAt: string
  user: {
    name: string
    email: string
  }
  orderItems: {
    quantity: number
    product: {
      name: string
    }
  }[]
}

function AdminOrdersContent() {
  const { data: session } = useSession()
  const router = useRouter()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  useEffect(() => {
    fetchOrders()
  }, [])

  const fetchOrders = async () => {
    try {
      const response = await fetch('/api/orders')
      if (response.ok) {
        const ordersData = await response.json()
        setOrders(ordersData)
      }
    } catch (error) {
      console.error('Error fetching orders:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/orders/${orderId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: newStatus })
      })
      
      if (response.ok) {
        toast.success('تم تحديث حالة الطلب بنجاح')
        fetchOrders()
      } else {
        toast.error('حدث خطأ أثناء تحديث حالة الطلب')
      }
    } catch (error) {
      toast.error('حدث خطأ أثناء تحديث حالة الطلب')
    }
  }

  const handleSignOut = () => {
    signOut({ callbackUrl: '/' })
  }

  const getStatusInfo = (status: string) => {
    const statusMap = {
      PENDING: { label: 'في الانتظار', color: 'bg-warning-100 text-warning-800' },
      CONFIRMED: { label: 'مؤكد', color: 'bg-primary-100 text-primary-800' },
      SHIPPED: { label: 'تم الشحن', color: 'bg-info-100 text-info-800' },
      DELIVERED: { label: 'تم التسليم', color: 'bg-success-100 text-success-800' },
      CANCELLED: { label: 'ملغي', color: 'bg-danger-100 text-danger-800' }
    }
    return statusMap[status as keyof typeof statusMap] || { label: status, color: 'bg-gray-100 text-gray-800' }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="loading-spinner"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <header className="header-modern">
        <div className="container-modern">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center space-x-3 rtl:space-x-reverse">
              <div className="w-10 h-10 bg-gradient-primary rounded-xl flex items-center justify-center">
                <ShoppingBag className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">إدارة الطلبات</h1>
                <p className="text-xs text-gray-500 -mt-1">لوحة تحكم الإدمن</p>
              </div>
            </div>

            {/* Navigation */}
            <div className="hidden md:flex items-center space-x-6 rtl:space-x-reverse">
              <div className="nav-link">
                <div className="w-8 h-8 bg-gradient-primary rounded-full flex items-center justify-center">
                  <User className="w-4 h-4 text-white" />
                </div>
                <span>{session?.user?.name || 'مستخدم'}</span>
              </div>
              <Link href="/admin" className="nav-link">
                <Package className="w-6 h-6" />
                <span>لوحة التحكم</span>
              </Link>
              <Link href="/admin/products" className="nav-link">
                <Package className="w-6 h-6" />
                <span>المنتجات</span>
              </Link>
     
              <button
                onClick={handleSignOut}
                className="nav-link text-danger-600 hover:text-danger-700"
              >
                <LogOut className="w-6 h-6" />
                <span>تسجيل الخروج</span>
              </button>
            </div>

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-3 rounded-xl text-gray-700 hover:text-primary-600 hover:bg-primary-50 transition-all duration-300"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white/95 backdrop-blur-md border-t border-gray-100 animate-slide-up">
            <div className="container-modern py-6 space-y-4">
              <div className="nav-link">
                <div className="w-8 h-8 bg-gradient-primary rounded-full flex items-center justify-center">
                  <User className="w-4 h-4 text-white" />
                </div>
                <span>{session?.user?.name || 'مستخدم'}</span>
              </div>
              <Link href="/admin" className="nav-link">
                <Package className="w-6 h-6" />
                <span>لوحة التحكم</span>
              </Link>
              <Link href="/admin/products" className="nav-link">
                <Package className="w-6 h-6" />
                <span>المنتجات</span>
              </Link>
        
              <button
                onClick={handleSignOut}
                className="nav-link text-danger-600 hover:text-danger-700"
              >
                <LogOut className="w-6 h-6" />
                <span>تسجيل الخروج</span>
              </button>
            </div>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="min-h-screen">
        <div className="container-modern py-8">
          {/* Breadcrumb */}
          <nav className="flex items-center space-x-2 rtl:space-x-reverse text-sm text-gray-600 mb-8">
            <Link href="/admin" className="hover:text-primary-600 transition-colors duration-200">
              لوحة التحكم
            </Link>
            <ArrowRight className="w-4 h-4" />
            <span className="text-gray-900 font-medium">إدارة الطلبات</span>
          </nav>

          {/* Page Header */}
          <div className="mb-10">
            <h2 className="text-3xl font-bold text-gray-900 mb-3">إدارة الطلبات</h2>
            <p className="text-lg text-gray-600">عرض وإدارة جميع طلبات العملاء</p>
          </div>

          {/* Orders Table */}
          <div className="card p-6">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-8 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      رقم الطلب
                    </th>
                    <th className="px-8 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      العميل
                    </th>
                    <th className="px-8 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      المنتجات
                    </th>
                    <th className="px-8 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      المبلغ
                    </th>
                    <th className="px-8 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      الحالة
                    </th>
                    <th className="px-8 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      التاريخ
                    </th>
                    <th className="px-8 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      الإجراءات
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {orders.map((order) => {
                    const statusInfo = getStatusInfo(order.status)
                    return (
                      <tr key={order.id} className="hover:bg-gray-50 transition-colors duration-200">
                        <td className="px-8 py-6 whitespace-nowrap text-base font-medium text-gray-900">
                          #{order.id.slice(-8)}
                        </td>
                        <td className="px-8 py-6 whitespace-nowrap">
                          <div>
                            <div className="text-base font-medium text-gray-900">{order.user.name}</div>
                            <div className="text-sm text-gray-500">{order.user.email}</div>
                          </div>
                        </td>
                        <td className="px-8 py-6 whitespace-nowrap text-base text-gray-900">
                          <div className="space-y-1">
                            {order.orderItems.map((item, index) => (
                              <div key={index} className="text-sm">
                                {item.product.name} × {item.quantity}
                              </div>
                            ))}
                          </div>
                        </td>
                        <td className="px-8 py-6 whitespace-nowrap text-base text-gray-900">
                          <span className="font-bold text-lg">{order.total} ر.س</span>
                        </td>
                        <td className="px-8 py-6 whitespace-nowrap">
                          <select
                            value={order.status}
                            onChange={(e) => handleUpdateOrderStatus(order.id, e.target.value)}
                            className={`text-sm border border-gray-300 rounded-lg px-4 py-2 ${statusInfo.color} focus:ring-2 focus:ring-primary-500 focus:border-transparent`}
                          >
                            <option value="PENDING">في الانتظار</option>
                            <option value="CONFIRMED">مؤكد</option>
                            <option value="SHIPPED">تم الشحن</option>
                            <option value="DELIVERED">تم التسليم</option>
                            <option value="CANCELLED">ملغي</option>
                          </select>
                        </td>
                        <td className="px-8 py-6 whitespace-nowrap text-sm text-gray-900">
                          {new Date(order.createdAt).toLocaleDateString('ar-SA', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </td>
                        <td className="px-8 py-6 whitespace-nowrap text-sm font-medium">
                          <button 
                            onClick={() => router.push(`/orders/${order.id}`)}
                            className="text-primary-600 hover:text-primary-900 transition-colors duration-200 p-2 hover:bg-primary-50 rounded-lg"
                            title="عرض تفاصيل الطلب"
                          >
                            <Eye className="w-5 h-5" />
                          </button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Empty State */}
          {orders.length === 0 && (
            <div className="text-center py-16">
              <ShoppingCart className="w-20 h-20 text-gray-400 mx-auto mb-6" />
              <h3 className="text-xl font-medium text-gray-900 mb-3">لا توجد طلبات</h3>
              <p className="text-gray-600">لم يتم إنشاء أي طلبات بعد</p>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

export default function AdminOrders() {
  return (
    <ProtectedRoute allowedRoles={['ADMIN']}>
      <AdminOrdersContent />
    </ProtectedRoute>
  )
}
