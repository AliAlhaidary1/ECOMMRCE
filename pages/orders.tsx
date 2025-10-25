import { useState, useEffect } from 'react'
import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import { 
  ShoppingBag, 
  User, 
  LogOut, 
  ShoppingCart, 
  Package, 
  Settings,
  Menu,
  X,
  Search,
  Heart,
  ArrowRight,
  CheckCircle,
  Clock,
  Truck,
  XCircle,
  Eye,
  Calendar
} from 'lucide-react'
import toast from 'react-hot-toast'

interface OrderItem {
  id: string
  productId: string
  quantity: number
  price: number
  product: {
    id: string
    name: string
    image?: string
  }
}

interface Order {
  id: string
  status: string
  total: number
  createdAt: string
  updatedAt: string
  orderItems: OrderItem[]
}

const statusConfig = {
  PENDING: { 
    label: 'معلق', 
    color: 'text-yellow-600 bg-yellow-100', 
    icon: Clock 
  },
  CONFIRMED: { 
    label: 'مؤكد', 
    color: 'text-blue-600 bg-blue-100', 
    icon: CheckCircle 
  },
  SHIPPED: { 
    label: 'تم الشحن', 
    color: 'text-purple-600 bg-purple-100', 
    icon: Truck 
  },
  DELIVERED: { 
    label: 'تم التسليم', 
    color: 'text-green-600 bg-green-100', 
    icon: CheckCircle 
  },
  CANCELLED: { 
    label: 'ملغي', 
    color: 'text-red-600 bg-red-100', 
    icon: XCircle 
  }
}

export default function Orders() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [selectedStatus, setSelectedStatus] = useState('')

  useEffect(() => {
    if (status === 'loading') return
    if (!session) {
      router.push('/auth/signin')
      return
    }
    fetchOrders()
  }, [session, status])

  const fetchOrders = async () => {
    try {
      const response = await fetch('/api/user/orders')
      if (response.ok) {
        const data = await response.json()
        setOrders(data)
      }
    } catch (error) {
      console.error('Error fetching orders:', error)
      toast.error('حدث خطأ في تحميل الطلبات')
    } finally {
      setLoading(false)
    }
  }

  const handleConfirmOrder = async (orderId: string) => {
    try {
      const response = await fetch(`/api/orders/${orderId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: 'CONFIRMED' })
      })

      if (response.ok) {
        toast.success('تم تأكيد الطلب بنجاح')
        fetchOrders() // إعادة تحميل الطلبات
      } else {
        toast.error('حدث خطأ في تأكيد الطلب')
      }
    } catch (error) {
      console.error('Error confirming order:', error)
      toast.error('حدث خطأ في تأكيد الطلب')
    }
  }

  const handleSignOut = () => {
    signOut({ callbackUrl: '/' })
  }

  const filteredOrders = selectedStatus 
    ? orders.filter(order => order.status === selectedStatus)
    : orders

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ar-SA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  if (!session) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center space-x-2 rtl:space-x-reverse">
              <ShoppingBag className="w-8 h-8 text-primary-600" />
              <span className="text-xl font-bold text-gray-900">متجرنا</span>
            </Link>

            {/* Navigation */}
            <div className="hidden md:flex items-center space-x-4 rtl:space-x-reverse">
              <Link href="/profile" className="flex items-center space-x-1 text-gray-700 hover:text-primary-600">
                <User className="w-5 h-5" />
                <span>{session.user?.name}</span>
              </Link>
              <Link href="/cart" className="flex items-center space-x-1 text-gray-700 hover:text-primary-600">
                <ShoppingCart className="w-5 h-5" />
                <span>السلة</span>
              </Link>
              {session.user?.role === 'ADMIN' && (
                <Link href="/admin" className="flex items-center space-x-1 text-gray-700 hover:text-primary-600">
                  <Settings className="w-5 h-5" />
                  <span>لوحة التحكم</span>
                </Link>
              )}
              <button
                onClick={handleSignOut}
                className="flex items-center space-x-1 text-gray-700 hover:text-primary-600"
              >
                <LogOut className="w-5 h-5" />
                <span>تسجيل الخروج</span>
              </button>
            </div>

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-md text-gray-700 hover:text-primary-600"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-t">
            <div className="px-4 py-4 space-y-4">
              <Link href="/profile" className="flex items-center space-x-2 text-gray-700 hover:text-primary-600">
                <User className="w-5 h-5" />
                <span>{session.user?.name}</span>
              </Link>
              <Link href="/cart" className="flex items-center space-x-2 text-gray-700 hover:text-primary-600">
                <ShoppingCart className="w-5 h-5" />
                <span>السلة</span>
              </Link>
              {session.user?.role === 'ADMIN' && (
                <Link href="/admin" className="flex items-center space-x-2 text-gray-700 hover:text-primary-600">
                  <Settings className="w-5 h-5" />
                  <span>لوحة التحكم</span>
                </Link>
              )}
              <button
                onClick={handleSignOut}
                className="flex items-center space-x-2 text-gray-700 hover:text-primary-600"
              >
                <LogOut className="w-5 h-5" />
                <span>تسجيل الخروج</span>
              </button>
            </div>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center space-x-2 rtl:space-x-reverse text-sm text-gray-600 mb-8">
          <Link href="/" className="hover:text-primary-600">الرئيسية</Link>
          <ArrowRight className="w-4 h-4" />
          <span className="text-gray-900">طلباتي</span>
        </nav>

        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">طلباتي</h1>
          <p className="text-gray-600">إدارة ومتابعة جميع طلباتك</p>
        </div>

        {/* Status Filter */}
        <div className="mb-8">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedStatus('')}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                selectedStatus === '' 
                  ? 'bg-primary-600 text-white' 
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              جميع الطلبات
            </button>
            {Object.entries(statusConfig).map(([status, config]) => {
              const Icon = config.icon
              return (
                <button
                  key={status}
                  onClick={() => setSelectedStatus(status)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors flex items-center space-x-2 rtl:space-x-reverse ${
                    selectedStatus === status 
                      ? 'bg-primary-600 text-white' 
                      : 'bg-white text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{config.label}</span>
                </button>
              )
            })}
          </div>
        </div>

        {/* Orders List */}
        {filteredOrders.length === 0 ? (
          <div className="text-center py-12">
            <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">لا توجد طلبات</h3>
            <p className="text-gray-600 mb-4">
              {selectedStatus ? 'لا توجد طلبات بهذه الحالة' : 'لم تقم بإنشاء أي طلبات بعد'}
            </p>
            <Link href="/" className="btn-primary">
              تسوق الآن
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {filteredOrders.map((order) => {
              const statusInfo = statusConfig[order.status as keyof typeof statusConfig]
              const StatusIcon = statusInfo.icon
              
              return (
                <div key={order.id} className="card">
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-4">
                    <div className="flex items-center space-x-4 rtl:space-x-reverse mb-4 lg:mb-0">
                      <div className="flex items-center space-x-2 rtl:space-x-reverse">
                        <Calendar className="w-5 h-5 text-gray-400" />
                        <span className="text-sm text-gray-600">
                          {formatDate(order.createdAt)}
                        </span>
                      </div>
                      <div className={`px-3 py-1 rounded-full text-sm font-medium flex items-center space-x-2 rtl:space-x-reverse ${statusInfo.color}`}>
                        <StatusIcon className="w-4 h-4" />
                        <span>{statusInfo.label}</span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4 rtl:space-x-reverse">
                      <span className="text-xl font-bold text-primary-600">
                        {order.total} ر.س
                      </span>
                      <Link 
                        href={`/orders/${order.id}`}
                        className="btn-secondary text-sm flex items-center space-x-2 rtl:space-x-reverse"
                      >
                        <Eye className="w-4 h-4" />
                        <span>عرض التفاصيل</span>
                      </Link>
                    </div>
                  </div>

                  {/* Order Items */}
                  <div className="space-y-3">
                    {order.orderItems.map((item) => (
                      <div key={item.id} className="flex items-center space-x-4 rtl:space-x-reverse p-3 bg-gray-50 rounded-lg">
                        <img
                          src={item.product.image || '/placeholder-product.jpg'}
                          alt={item.product.name}
                          className="w-12 h-12 object-cover rounded"
                        />
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900">{item.product.name}</h4>
                          <p className="text-sm text-gray-600">الكمية: {item.quantity}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium text-gray-900">{item.price} ر.س</p>
                          <p className="text-sm text-gray-600">للقطعة الواحدة</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Action Buttons */}
                  {order.status === 'PENDING' && (
                    <div className="mt-4 pt-4 border-t">
                      <button
                        onClick={() => handleConfirmOrder(order.id)}
                        className="btn-primary text-sm"
                      >
                        تأكيد الطلب
                      </button>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </main>
    </div>
  )
}
