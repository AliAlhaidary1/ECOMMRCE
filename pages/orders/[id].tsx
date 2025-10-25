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
  ArrowRight,
  CheckCircle,
  Clock,
  Truck,
  XCircle,
  Calendar,
  MapPin,
  Phone,
  CreditCard,
  Mail
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
    description: string
    image?: string
    category: string
  }
}

interface Order {
  id: string
  status: string
  total: number
  createdAt: string
  updatedAt: string
  orderItems: OrderItem[]
  user: {
    name: string
    email: string
    phone?: string
    address?: string
  }
}

const statusConfig = {
  PENDING: { 
    label: 'معلق', 
    color: 'text-yellow-600 bg-yellow-100', 
    icon: Clock,
    description: 'في انتظار التأكيد'
  },
  CONFIRMED: { 
    label: 'مؤكد', 
    color: 'text-blue-600 bg-blue-100', 
    icon: CheckCircle,
    description: 'تم تأكيد الطلب'
  },
  SHIPPED: { 
    label: 'تم الشحن', 
    color: 'text-purple-600 bg-purple-100', 
    icon: Truck,
    description: 'تم شحن الطلب'
  },
  DELIVERED: { 
    label: 'تم التسليم', 
    color: 'text-green-600 bg-green-100', 
    icon: CheckCircle,
    description: 'تم تسليم الطلب'
  },
  CANCELLED: { 
    label: 'ملغي', 
    color: 'text-red-600 bg-red-100', 
    icon: XCircle,
    description: 'تم إلغاء الطلب'
  }
}

export default function OrderDetails() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const { id } = router.query
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  useEffect(() => {
    if (status === 'loading') return
    if (!session) {
      router.push('/auth/signin')
      return
    }
    if (id) {
      fetchOrder()
    }
  }, [session, status, id])

  const fetchOrder = async () => {
    try {
      const response = await fetch(`/api/orders/${id}`)
      if (response.ok) {
        const data = await response.json()
        setOrder(data)
      } else {
        toast.error('الطلب غير موجود')
        router.push('/orders')
      }
    } catch (error) {
      console.error('Error fetching order:', error)
      toast.error('حدث خطأ في تحميل الطلب')
    } finally {
      setLoading(false)
    }
  }

  const handleConfirmOrder = async () => {
    try {
      const response = await fetch(`/api/orders/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: 'CONFIRMED' })
      })

      if (response.ok) {
        toast.success('تم تأكيد الطلب بنجاح')
        fetchOrder() // إعادة تحميل الطلب
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

  if (!order) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">الطلب غير موجود</h3>
          <Link href="/orders" className="btn-primary">
            العودة للطلبات
          </Link>
        </div>
      </div>
    )
  }

  const statusInfo = statusConfig[order.status as keyof typeof statusConfig]
  const StatusIcon = statusInfo.icon

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
          <Link href="/orders" className="hover:text-primary-600">طلباتي</Link>
          <ArrowRight className="w-4 h-4" />
          <span className="text-gray-900">تفاصيل الطلب</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Order Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Order Header */}
            <div className="card">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-4">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 mb-2">طلب #{order.id.slice(-8)}</h1>
                  <div className="flex items-center space-x-4 rtl:space-x-reverse">
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
                </div>
                <div className="text-right">
                  <p className="text-3xl font-bold text-primary-600">{order.total} ر.س</p>
                  <p className="text-sm text-gray-600">{statusInfo.description}</p>
                </div>
              </div>

              {/* Action Button */}
              {order.status === 'PENDING' && (
                <div className="pt-4 border-t">
                  <button
                    onClick={handleConfirmOrder}
                    className="btn-primary"
                  >
                    تأكيد الطلب
                  </button>
                </div>
              )}
            </div>

            {/* Order Items */}
            <div className="card">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">المنتجات</h2>
              <div className="space-y-4">
                {order.orderItems.map((item) => (
                  <div key={item.id} className="flex items-center space-x-4 rtl:space-x-reverse p-4 bg-gray-50 rounded-lg">
                    <img
                      src={item.product.image || '/placeholder-product.jpg'}
                      alt={item.product.name}
                      className="w-16 h-16 object-cover rounded"
                    />
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">{item.product.name}</h3>
                      <p className="text-sm text-gray-600 mb-1">{item.product.description}</p>
                      <p className="text-sm text-gray-500">الفئة: {item.product.category}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-gray-900">{item.price} ر.س</p>
                      <p className="text-sm text-gray-600">الكمية: {item.quantity}</p>
                      <p className="text-sm font-medium text-primary-600">
                        المجموع: {(item.price * item.quantity).toFixed(2)} ر.س
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="space-y-6">
            {/* Customer Info */}
            <div className="card">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">معلومات العميل</h2>
              <div className="space-y-3">
                <div className="flex items-center space-x-3 rtl:space-x-reverse">
                  <User className="w-5 h-5 text-gray-400" />
                  <span className="text-gray-900">{order.user.name}</span>
                </div>
                <div className="flex items-center space-x-3 rtl:space-x-reverse">
                  <Mail className="w-5 h-5 text-gray-400" />
                  <span className="text-gray-900">{order.user.email}</span>
                </div>
                {order.user.phone && (
                  <div className="flex items-center space-x-3 rtl:space-x-reverse">
                    <Phone className="w-5 h-5 text-gray-400" />
                    <span className="text-gray-900">{order.user.phone}</span>
                  </div>
                )}
                {order.user.address && (
                  <div className="flex items-center space-x-3 rtl:space-x-reverse">
                    <MapPin className="w-5 h-5 text-gray-400" />
                    <span className="text-gray-900">{order.user.address}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Order Summary */}
            <div className="card">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">ملخص الطلب</h2>
              <div className="space-y-3">
                {order.orderItems.map((item) => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <span className="text-gray-600">{item.product.name} × {item.quantity}</span>
                    <span className="text-gray-900">{(item.price * item.quantity).toFixed(2)} ر.س</span>
                  </div>
                ))}
                <div className="border-t pt-3">
                  <div className="flex justify-between text-lg font-semibold">
                    <span className="text-gray-900">المجموع الكلي</span>
                    <span className="text-primary-600">{order.total} ر.س</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Payment Info */}
            <div className="card">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">معلومات الدفع</h2>
              <div className="flex items-center space-x-3 rtl:space-x-reverse">
                <CreditCard className="w-5 h-5 text-gray-400" />
                <span className="text-gray-900">الدفع عند الاستلام</span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
