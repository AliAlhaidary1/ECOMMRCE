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
  Heart
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
}

export default function Home() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [cart, setCart] = useState<{productId: string, quantity: number, price: number}[]>([])

  useEffect(() => {
    fetchProducts()
    // تحميل السلة من localStorage
    const savedCart = localStorage.getItem('cart')
    if (savedCart) {
      setCart(JSON.parse(savedCart))
    }
  }, [])

  // حفظ السلة في localStorage عند تغييرها
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart))
  }, [cart])

  const fetchProducts = async () => {
    try {
      const response = await fetch('/api/products')
      if (response.ok) {
        const data = await response.json()
        setProducts(data)
      }
    } catch (error) {
      console.error('Error fetching products:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = !selectedCategory || product.category === selectedCategory
    return matchesSearch && matchesCategory && product.stock > 0
  })

  const categories = Array.from(new Set(products.map(product => product.category)))

  const handleSignOut = () => {
    signOut({ callbackUrl: '/' })
  }

  const handleViewDetails = (productId: string) => {
    router.push(`/products/${productId}`)
  }

  const handleAddToCart = (product: Product) => {
    console.log('Session status:', status)
    console.log('Session data:', session)
    
    if (status === 'loading') {
      toast.error('جاري تحميل بيانات المستخدم...')
      return
    }

    if (!session) {
      toast.error('يجب تسجيل الدخول أولاً')
      router.push('/auth/signin')
      return
    }

    if (product.stock === 0) {
      toast.error('المنتج غير متوفر في المخزون')
      return
    }

    // إضافة المنتج للسلة
    const existingItem = cart.find(item => item.productId === product.id)
    if (existingItem) {
      setCart(cart.map(item => 
        item.productId === product.id 
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ))
    } else {
      setCart([...cart, { productId: product.id, quantity: 1, price: product.price }])
    }
    
    toast.success(`تم إضافة ${product.name} إلى السلة`)
  }

  const handleCreateOrder = async () => {
    if (!session) {
      toast.error('يجب تسجيل الدخول أولاً')
      return
    }

    if (cart.length === 0) {
      toast.error('السلة فارغة')
      return
    }

    try {
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          items: cart
        })
      })

      if (response.ok) {
        toast.success('تم إنشاء الطلب بنجاح!')
        setCart([]) // إفراغ السلة
        router.push('/orders') // الانتقال لصفحة الطلبات
      } else {
        toast.error('حدث خطأ في إنشاء الطلب')
      }
    } catch (error) {
      console.error('Error creating order:', error)
      toast.error('حدث خطأ في إنشاء الطلب')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    )
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

            {/* Search Bar */}
            <div className="hidden md:flex flex-1 max-w-lg mx-8">
              <div className="relative w-full">
                <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="ابحث عن المنتجات..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pr-10 pl-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
            </div>

            {/* Navigation */}
            <div className="hidden md:flex items-center space-x-4 rtl:space-x-reverse">
              {session ? (
                <>
                  <Link href="/profile" className="flex items-center space-x-1 text-gray-700 hover:text-primary-600">
                    <User className="w-5 h-5" />
                    <span>{session.user?.name}</span>
                  </Link>
                  <Link href="/orders" className="flex items-center space-x-1 text-gray-700 hover:text-primary-600">
                    <Package className="w-5 h-5" />
                    <span>طلباتي</span>
                  </Link>
                  <Link href="/cart" className="flex items-center space-x-1 text-gray-700 hover:text-primary-600">
                    <ShoppingCart className="w-5 h-5" />
                    <span>السلة ({cart.length})</span>
                  </Link>
                  {cart.length > 0 && (
                    <button
                      onClick={handleCreateOrder}
                      className="flex items-center space-x-1 bg-primary-600 text-white px-3 py-1 rounded-lg hover:bg-primary-700"
                    >
                      <ShoppingCart className="w-4 h-4" />
                      <span>إنشاء طلب</span>
                    </button>
                  )}
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
                </>
              ) : (
                <div className="flex items-center space-x-4 rtl:space-x-reverse">
                  <Link href="/auth/signin" className="text-gray-700 hover:text-primary-600">
                    تسجيل الدخول
                  </Link>
                  <Link href="/auth/signup" className="btn-primary">
                    إنشاء حساب
                  </Link>
                </div>
              )}
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
              <div className="relative">
                <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="ابحث عن المنتجات..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pr-10 pl-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              {session ? (
                <div className="space-y-2">
                  <Link href="/profile" className="flex items-center space-x-2 text-gray-700 hover:text-primary-600">
                    <User className="w-5 h-5" />
                    <span>{session.user?.name}</span>
                  </Link>
                  <Link href="/orders" className="flex items-center space-x-2 text-gray-700 hover:text-primary-600">
                    <Package className="w-5 h-5" />
                    <span>طلباتي</span>
                  </Link>
                  <Link href="/cart" className="flex items-center space-x-2 text-gray-700 hover:text-primary-600">
                    <ShoppingCart className="w-5 h-5" />
                    <span>السلة ({cart.length})</span>
                  </Link>
                  {cart.length > 0 && (
                    <button
                      onClick={handleCreateOrder}
                      className="flex items-center space-x-2 bg-primary-600 text-white px-3 py-2 rounded-lg hover:bg-primary-700 w-full justify-center"
                    >
                      <ShoppingCart className="w-4 h-4" />
                      <span>إنشاء طلب</span>
                    </button>
                  )}
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
              ) : (
                <div className="space-y-2">
                  <Link href="/auth/signin" className="block text-gray-700 hover:text-primary-600">
                    تسجيل الدخول
                  </Link>
                  <Link href="/auth/signup" className="block btn-primary text-center">
                    إنشاء حساب
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Categories Filter */}
        <div className="mb-8">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedCategory('')}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                selectedCategory === '' 
                  ? 'bg-primary-600 text-white' 
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              جميع المنتجات
            </button>
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  selectedCategory === category 
                    ? 'bg-primary-600 text-white' 
                    : 'bg-white text-gray-700 hover:bg-gray-100'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts.map((product) => (
            <div key={product.id} className="card hover:shadow-lg transition-shadow duration-200">
              <div className="aspect-w-16 aspect-h-12 mb-4">
                <img
                  src={product.image || '/placeholder-product.jpg'}
                  alt={product.name}
                  className="w-full h-48 object-cover rounded-lg"
                />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{product.name}</h3>
              <p className="text-gray-600 text-sm mb-3 line-clamp-2">{product.description}</p>
              <div className="flex items-center justify-between mb-4">
                <span className="text-xl font-bold text-primary-600">{product.price} ر.س</span>
                <span className="text-sm text-gray-500">المخزون: {product.stock}</span>
              </div>
              <div className="flex space-x-2 rtl:space-x-reverse">
                <button 
                  onClick={() => handleViewDetails(product.id)}
                  className="flex-1 btn-primary text-sm"
                >
                  عرض التفاصيل
                </button>
                <button 
                  onClick={() => handleAddToCart(product)}
                  className="btn-secondary text-sm flex items-center justify-center"
                  title="إضافة إلى السلة"
                >
                  <ShoppingCart className="w-4 h-4" />
                </button>
                {session && (
                  <button className="btn-secondary text-sm">
                    <Heart className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        {filteredProducts.length === 0 && (
          <div className="text-center py-12">
            <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">لا توجد منتجات</h3>
            <p className="text-gray-600">لم نجد أي منتجات تطابق البحث</p>
          </div>
        )}
      </main>
    </div>
  )
}

