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
    if (session.user?.role === 'ADMIN') {
      router.push('/admin')
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
      {/* Modern Header */}
      <header className="header-modern">
        <div className="container-modern">
          <div className="flex justify-between items-center h-20">
            {/* Logo */}
            <Link href="/" className="flex items-center space-x-3 rtl:space-x-reverse group">
              <div className="relative">
                <ShoppingBag className="w-10 h-10 text-primary-600 group-hover:scale-110 transition-transform duration-300" />
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-accent-500 rounded-full animate-pulse"></div>
              </div>
              <div>
                <span className="text-2xl font-bold text-gradient-primary">متجرنا</span>
                <p className="text-xs text-gray-500 -mt-1">متجرك المفضل</p>
              </div>
            </Link>

            {/* Navigation */}
            <div className="hidden md:flex items-center space-x-6 rtl:space-x-reverse">
              <Link href="/profile" className="nav-link">
                <div className="w-8 h-8 bg-gradient-primary rounded-full flex items-center justify-center">
                  <User className="w-4 h-4 text-white" />
                </div>
                <span>{session.user?.name}</span>
              </Link>
              {session.user?.role !== 'ADMIN' && (
                <>
                  <Link href="/cart" className="nav-link">
                    <ShoppingCart className="w-6 h-6" />
                    <span>السلة</span>
                  </Link>
                  <Link href="/orders" className="nav-link-active">
                    <Package className="w-6 h-6" />
                    <span>طلباتي</span>
                  </Link>
                </>
              )}
              {session.user?.role === 'ADMIN' && (
                <Link href="/admin" className="nav-link-active">
                  <Settings className="w-6 h-6" />
                  <span>لوحة التحكم</span>
                </Link>
              )}
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
              <Link href="/profile" className="nav-link">
                <div className="w-8 h-8 bg-gradient-primary rounded-full flex items-center justify-center">
                  <User className="w-4 h-4 text-white" />
                </div>
                <span>{session.user?.name}</span>
              </Link>
              {session.user?.role !== 'ADMIN' && (
                <>
                  <Link href="/cart" className="nav-link">
                    <ShoppingCart className="w-6 h-6" />
                    <span>السلة</span>
                  </Link>
                  <Link href="/orders" className="nav-link-active">
                    <Package className="w-6 h-6" />
                    <span>طلباتي</span>
                  </Link>
                </>
              )}
              {session.user?.role === 'ADMIN' && (
                <Link href="/admin" className="nav-link-active">
                  <Settings className="w-6 h-6" />
                  <span>لوحة التحكم</span>
                </Link>
              )}
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
      <main className="container-modern section-padding">
        {/* Breadcrumb */}
        <nav className="flex items-center space-x-2 rtl:space-x-reverse text-sm text-gray-600 mb-8">
          <Link href="/" className="hover:text-primary-600 transition-colors duration-300">الرئيسية</Link>
          <ArrowRight className="w-4 h-4" />
          <span className="text-gray-900 font-semibold">طلباتي</span>
        </nav>

        {/* Page Header */}
        <div className="text-center mb-12 animate-fade-in">
          <div className="w-20 h-20 bg-gradient-primary rounded-full flex items-center justify-center mx-auto mb-6">
            <Package className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gradient-primary mb-4">طلباتي</h1>
          <p className="text-xl text-gray-600">إدارة ومتابعة جميع طلباتك</p>
        </div>

        {/* Status Filter */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">تصفية الطلبات</h2>
          <div className="flex flex-wrap justify-center gap-3">
            <button
              onClick={() => setSelectedStatus('')}
              className={`px-6 py-3 rounded-full text-sm font-semibold transition-all duration-300 transform hover:scale-105 ${
                selectedStatus === '' 
                  ? 'bg-gradient-primary text-white shadow-lg' 
                  : 'bg-white text-gray-700 hover:bg-primary-50 hover:text-primary-600 shadow-soft'
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
                  className={`px-6 py-3 rounded-full text-sm font-semibold transition-all duration-300 transform hover:scale-105 flex items-center space-x-2 rtl:space-x-reverse ${
                    selectedStatus === status 
                      ? 'bg-gradient-primary text-white shadow-lg' 
                      : 'bg-white text-gray-700 hover:bg-primary-50 hover:text-primary-600 shadow-soft'
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
          <div className="text-center py-20">
            <div className="w-32 h-32 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-8">
              <Package className="w-16 h-16 text-gray-400" />
            </div>
            <h3 className="text-3xl font-bold text-gray-900 mb-4">لا توجد طلبات</h3>
            <p className="text-gray-600 text-lg mb-8">
              {selectedStatus ? 'لا توجد طلبات بهذه الحالة' : 'لم تقم بإنشاء أي طلبات بعد'}
            </p>
            <Link href="/" className="btn-primary text-lg px-8 py-4">
              تسوق الآن
            </Link>
          </div>
        ) : (
          <div className="space-y-8">
            {filteredOrders.map((order, index) => {
              const statusInfo = statusConfig[order.status as keyof typeof statusConfig]
              const StatusIcon = statusInfo.icon
              
              return (
                <div 
                  key={order.id} 
                  className="card-elevated animate-fade-in"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6">
                    <div className="flex items-center space-x-6 rtl:space-x-reverse mb-4 lg:mb-0">
                      <div className="flex items-center space-x-3 rtl:space-x-reverse">
                        <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
                          <Calendar className="w-6 h-6 text-primary-600" />
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">تاريخ الطلب</p>
                          <p className="font-semibold text-gray-900">
                            {formatDate(order.createdAt)}
                          </p>
                        </div>
                      </div>
                      <div className={`status-badge ${statusInfo.color}`}>
                        <StatusIcon className="w-5 h-5" />
                        <span>{statusInfo.label}</span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-6 rtl:space-x-reverse">
                      <div className="text-right">
                        <p className="text-sm text-gray-600">المجموع الكلي</p>
                        <p className="text-3xl font-bold text-gradient-primary">
                          {order.total} ر.س
                        </p>
                      </div>
                      <Link 
                        href={`/orders/${order.id}`}
                        className="btn-secondary flex items-center space-x-2 rtl:space-x-reverse"
                      >
                        <Eye className="w-5 h-5" />
                        <span>عرض التفاصيل</span>
                      </Link>
                    </div>
                  </div>

                  {/* Order Items */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900">المنتجات</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {order.orderItems.map((item) => (
                        <div key={item.id} className="flex items-center space-x-4 rtl:space-x-reverse p-4 bg-gray-50 rounded-2xl">
                          <img
                            src={item.product.image || '/placeholder-product.jpg'}
                            alt={item.product.name}
                            className="w-16 h-16 object-cover rounded-xl"
                          />
                          <div className="flex-1">
                            <h4 className="font-semibold text-gray-900 mb-1">{item.product.name}</h4>
                            <p className="text-sm text-gray-600 mb-1">الكمية: {item.quantity}</p>
                            <p className="text-sm font-semibold text-primary-600">{item.price} ر.س</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                </div>
              )
            })}
          </div>
        )}
      </main>
    </div>
  )
}
