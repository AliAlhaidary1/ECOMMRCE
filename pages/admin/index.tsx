import { useState, useEffect } from 'react'
import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/router'
import ProtectedRoute from '../../components/ProtectedRoute'
import Link from 'next/link'
import { 
  Package, 
  ShoppingCart, 
  Users, 
  TrendingUp,
  DollarSign,
  ShoppingBag,
  User,
  LogOut,
  Menu,
  X,
  ArrowRight,
  BarChart3,
  Settings
} from 'lucide-react'
import toast from 'react-hot-toast'

interface Product {
  id: string
  name: string
  description: string
  price: number
  image?: string
  category: string
  stock: number
  isActive: boolean
}

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

function AdminDashboardContent() {
  const { data: session } = useSession()
  const [products, setProducts] = useState<Product[]>([])
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [productsRes, ordersRes] = await Promise.all([
        fetch('/api/products'),
        fetch('/api/orders')
      ])
      
      if (productsRes.ok) {
        const productsData = await productsRes.json()
        setProducts(productsData)
      }
      
      if (ordersRes.ok) {
        const ordersData = await ordersRes.json()
        setOrders(ordersData)
      }
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSignOut = () => {
    signOut({ callbackUrl: '/' })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="loading-spinner"></div>
      </div>
    )
  }

  const stats = {
    totalProducts: products.length,
    totalOrders: orders.length,
    totalRevenue: orders.reduce((sum, order) => sum + order.total, 0),
    pendingOrders: orders.filter(order => order.status === 'PENDING').length
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
                <h1 className="text-xl font-bold text-gray-900">لوحة تحكم الإدمن</h1>
                <p className="text-xs text-gray-500 -mt-1">إدارة المتجر</p>
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
              <Link href="/admin/products" className="nav-link">
                <Package className="w-6 h-6" />
                <span>المنتجات</span>
              </Link>
              <Link href="/admin/orders" className="nav-link">
                <ShoppingCart className="w-6 h-6" />
                <span>الطلبات</span>
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
              <Link href="/admin/products" className="nav-link">
                <Package className="w-6 h-6" />
                <span>المنتجات</span>
              </Link>
              <Link href="/admin/orders" className="nav-link">
                <ShoppingCart className="w-6 h-6" />
                <span>الطلبات</span>
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
          {/* Page Header */}
          <div className="mb-10">
            <h2 className="text-3xl font-bold text-gray-900 mb-3">لوحة التحكم الرئيسية</h2>
            <p className="text-lg text-gray-600">نظرة عامة على إحصائيات المتجر</p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
            <div className="card p-6">
              <div className="flex items-center">
                <div className="p-4 bg-primary-100 rounded-xl">
                  <Package className="w-7 h-7 text-primary-600" />
                </div>
                <div className="mr-6">
                  <p className="text-sm font-medium text-gray-600 mb-1">إجمالي المنتجات</p>
                  <p className="text-3xl font-bold text-gray-900">{stats.totalProducts}</p>
                </div>
              </div>
            </div>

            <div className="card p-6">
              <div className="flex items-center">
                <div className="p-4 bg-success-100 rounded-xl">
                  <ShoppingCart className="w-7 h-7 text-success-600" />
                </div>
                <div className="mr-6">
                  <p className="text-sm font-medium text-gray-600 mb-1">إجمالي الطلبات</p>
                  <p className="text-3xl font-bold text-gray-900">{stats.totalOrders}</p>
                </div>
              </div>
            </div>

            <div className="card p-6">
              <div className="flex items-center">
                <div className="p-4 bg-warning-100 rounded-xl">
                  <DollarSign className="w-7 h-7 text-warning-600" />
                </div>
                <div className="mr-6">
                  <p className="text-sm font-medium text-gray-600 mb-1">إجمالي الإيرادات</p>
                  <p className="text-3xl font-bold text-gray-900">{stats.totalRevenue.toFixed(2)} ر.س</p>
                </div>
              </div>
            </div>

            <div className="card p-6">
              <div className="flex items-center">
                <div className="p-4 bg-danger-100 rounded-xl">
                  <TrendingUp className="w-7 h-7 text-danger-600" />
                </div>
                <div className="mr-6">
                  <p className="text-sm font-medium text-gray-600 mb-1">طلبات في الانتظار</p>
                  <p className="text-3xl font-bold text-gray-900">{stats.pendingOrders}</p>
                </div>
              </div>
            </div>
        </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Link href="/admin/products" className="card hover:shadow-lg transition-all duration-300 group p-8">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="p-4 bg-primary-100 rounded-xl group-hover:bg-primary-200 transition-colors duration-300">
                    <Package className="w-7 h-7 text-primary-600" />
                  </div>
                  <div className="mr-6">
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">إدارة المنتجات</h3>
                    <p className="text-gray-600">إضافة وتعديل وحذف المنتجات</p>
                  </div>
                </div>
                <ArrowRight className="w-6 h-6 text-gray-400 group-hover:text-primary-600 transition-colors duration-300" />
              </div>
            </Link>

            <Link href="/admin/orders" className="card hover:shadow-lg transition-all duration-300 group p-8">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="p-4 bg-success-100 rounded-xl group-hover:bg-success-200 transition-colors duration-300">
                    <ShoppingCart className="w-7 h-7 text-success-600" />
                  </div>
                  <div className="mr-6">
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">إدارة الطلبات</h3>
                    <p className="text-gray-600">عرض وإدارة طلبات العملاء</p>
                  </div>
                </div>
                <ArrowRight className="w-6 h-6 text-gray-400 group-hover:text-success-600 transition-colors duration-300" />
              </div>
            </Link>
          </div>
        </div>
      </main>
    </div>
  )
}

export default function AdminDashboard() {
  return (
    <ProtectedRoute allowedRoles={['ADMIN']}>
      <AdminDashboardContent />
    </ProtectedRoute>
  )
}

