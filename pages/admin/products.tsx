import { useState, useEffect } from 'react'
import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import { 
  Package, 
  Plus, 
  Edit, 
  Trash2, 
  ShoppingBag,
  User,
  LogOut,
  Menu,
  X,
  ArrowRight
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

export default function AdminProducts() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  useEffect(() => {
    if (status === 'loading') return
    
    if (!session || session.user?.role !== 'ADMIN') {
      router.push('/')
      return
    }
    
    fetchProducts()
  }, [session, status, router])

  const fetchProducts = async () => {
    try {
      const response = await fetch('/api/products')
      if (response.ok) {
        const productsData = await response.json()
        setProducts(productsData)
      }
    } catch (error) {
      console.error('Error fetching products:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteProduct = async (productId: string) => {
    if (!confirm('هل أنت متأكد من حذف هذا المنتج؟')) return
    
    try {
      const response = await fetch(`/api/products/${productId}`, {
        method: 'DELETE'
      })
      
      if (response.ok) {
        toast.success('تم حذف المنتج بنجاح')
        fetchProducts()
      } else {
        toast.error('حدث خطأ أثناء حذف المنتج')
      }
    } catch (error) {
      toast.error('حدث خطأ أثناء حذف المنتج')
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
                <h1 className="text-xl font-bold text-gray-900">إدارة المنتجات</h1>
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
              <Link href="/admin/orders" className="nav-link">
                <Package className="w-6 h-6" />
                <span>الطلبات</span>
              </Link>
              <Link href="/" className="nav-link">
                <ShoppingBag className="w-6 h-6" />
                <span>العودة للمتجر</span>
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
              <Link href="/admin/orders" className="nav-link">
                <Package className="w-6 h-6" />
                <span>الطلبات</span>
              </Link>
              <Link href="/" className="nav-link">
                <ShoppingBag className="w-6 h-6" />
                <span>العودة للمتجر</span>
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
            <span className="text-gray-900 font-medium">إدارة المنتجات</span>
          </nav>

          {/* Page Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-10">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-3">إدارة المنتجات</h2>
              <p className="text-lg text-gray-600">إضافة وتعديل وحذف المنتجات في المتجر</p>
            </div>
            <button
              onClick={() => router.push('/admin/products/add')}
              className="btn-primary flex items-center space-x-3 rtl:space-x-reverse mt-6 sm:mt-0 px-6 py-3"
            >
              <Plus className="w-5 h-5" />
              <span>إضافة منتج جديد</span>
            </button>
          </div>

          {/* Products Table */}
          <div className="card p-6">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-8 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      المنتج
                    </th>
                    <th className="px-8 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      السعر
                    </th>
                    <th className="px-8 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      المخزون
                    </th>
                    <th className="px-8 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      الحالة
                    </th>
                    <th className="px-8 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      الإجراءات
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {products.map((product) => (
                    <tr key={product.id} className="hover:bg-gray-50 transition-colors duration-200">
                      <td className="px-8 py-6 whitespace-nowrap">
                        <div className="flex items-center">
                          <img
                            src={product.image || '/placeholder-product.jpg'}
                            alt={product.name}
                            className="w-16 h-16 rounded-lg object-cover ml-6"
                          />
                          <div>
                            <div className="text-base font-medium text-gray-900">{product.name}</div>
                            <div className="text-sm text-gray-500 line-clamp-2 max-w-xs">{product.description}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6 whitespace-nowrap text-base text-gray-900 font-medium">
                        {product.price} ر.س
                      </td>
                      <td className="px-8 py-6 whitespace-nowrap">
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                          product.stock > 10 
                            ? 'bg-success-100 text-success-800' 
                            : product.stock > 0 
                            ? 'bg-warning-100 text-warning-800'
                            : 'bg-danger-100 text-danger-800'
                        }`}>
                          {product.stock}
                        </span>
                      </td>
                      <td className="px-8 py-6 whitespace-nowrap">
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                          product.isActive 
                            ? 'bg-success-100 text-success-800' 
                            : 'bg-danger-100 text-danger-800'
                        }`}>
                          {product.isActive ? 'نشط' : 'غير نشط'}
                        </span>
                      </td>
                      <td className="px-8 py-6 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-3 rtl:space-x-reverse">
                          <button className="text-primary-600 hover:text-primary-900 transition-colors duration-200 p-2 hover:bg-primary-50 rounded-lg">
                            <Edit className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => handleDeleteProduct(product.id)}
                            className="text-danger-600 hover:text-danger-900 transition-colors duration-200 p-2 hover:bg-danger-50 rounded-lg"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
