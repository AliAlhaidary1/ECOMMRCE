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
  Star
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
  const [orders, setOrders] = useState<any[]>([])

  // إذا كان admin مسجل دخول، أرسله للوحة التحكم
  useEffect(() => {
    if (status === 'loading') return
    
    if (session?.user?.role === 'ADMIN') {
      router.push('/admin')
      return
    }
  }, [session, status, router])

  useEffect(() => {
    fetchProducts()
    // تحميل السلة من localStorage
    const savedCart = localStorage.getItem('cart')
    if (savedCart) {
      setCart(JSON.parse(savedCart))
    }
    // تحميل الطلبات
    if (session) {
      fetchOrders()
    }
  }, [session])

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

  const fetchOrders = async () => {
    try {
      const response = await fetch('/api/user/orders')
      if (response.ok) {
        const data = await response.json()
        setOrders(data)
      }
    } catch (error) {
      console.error('Error fetching orders:', error)
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

            {/* Search Bar */}
            <div className="hidden md:flex flex-1 max-w-2xl mx-8">
              <div className="relative w-full">
                <Search className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="ابحث عن المنتجات المفضلة لديك..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="input-field pr-12 text-lg"
                />
              </div>
            </div>

            {/* Navigation */}
            <div className="hidden md:flex items-center space-x-6 rtl:space-x-reverse">
              {session ? (
                <>
                  <Link href="/profile" className="nav-link">
                    <div className="w-8 h-8 bg-gradient-primary rounded-full flex items-center justify-center">
                      <User className="w-4 h-4 text-white" />
                    </div>
                    <span>{session.user?.name}</span>
                  </Link>
                  <Link href="/orders" className="nav-link">
                    <div className="relative">
                      <Package className="w-6 h-6" />
                      <div className="absolute -top-2 -right-2 w-4 h-4 bg-success-500 text-white text-xs rounded-full flex items-center justify-center">
                        {orders.length}
                      </div>
                    </div>
                    <span>طلباتي</span>
                  </Link>
                  <Link href="/cart" className="nav-link">
                    <div className="relative">
                      <ShoppingCart className="w-6 h-6" />
                      {cart.length > 0 && (
                        <div className="absolute -top-2 -right-2 w-5 h-5 bg-accent-500 text-white text-xs rounded-full flex items-center justify-center animate-bounce-gentle">
                          {cart.length}
                        </div>
                      )}
                    </div>
                    <span>السلة</span>
                  </Link>
                  {cart.length > 0 && (
                    <button
                      onClick={handleCreateOrder}
                      className="btn-primary flex items-center space-x-2 rtl:space-x-reverse"
                    >
                      <ShoppingCart className="w-4 h-4" />
                      <span>إنشاء طلب</span>
                    </button>
                  )}
                  {session.user?.role === 'ADMIN' && (
                    <Link href="/admin" className="nav-link">
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
                </>
              ) : (
                <div className="flex items-center space-x-4 rtl:space-x-reverse">
                  <Link href="/auth/signin" className="nav-link">
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
              className="md:hidden p-3 rounded-xl text-gray-700 hover:text-primary-600 hover:bg-primary-50 transition-all duration-300"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white/95 backdrop-blur-md border-t border-gray-100 animate-slide-up">
            <div className="container-modern py-6 space-y-6">
              <div className="relative">
                <Search className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="ابحث عن المنتجات..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="input-field pr-12"
                />
              </div>
              {session ? (
                <div className="space-y-4">
                  <Link href="/profile" className="nav-link">
                    <div className="w-8 h-8 bg-gradient-primary rounded-full flex items-center justify-center">
                      <User className="w-4 h-4 text-white" />
                    </div>
                    <span>{session.user?.name}</span>
                  </Link>
                  <Link href="/orders" className="nav-link">
                    <Package className="w-6 h-6" />
                    <span>طلباتي</span>
                  </Link>
                  <Link href="/cart" className="nav-link">
                    <div className="relative">
                      <ShoppingCart className="w-6 h-6" />
                      {cart.length > 0 && (
                        <div className="absolute -top-2 -right-2 w-5 h-5 bg-accent-500 text-white text-xs rounded-full flex items-center justify-center">
                          {cart.length}
                        </div>
                      )}
                    </div>
                    <span>السلة</span>
                  </Link>
                  {cart.length > 0 && (
                    <button
                      onClick={handleCreateOrder}
                      className="btn-primary w-full flex items-center justify-center space-x-2 rtl:space-x-reverse"
                    >
                      <ShoppingCart className="w-4 h-4" />
                      <span>إنشاء طلب</span>
                    </button>
                  )}
                  {session.user?.role === 'ADMIN' && (
                    <Link href="/admin" className="nav-link">
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
              ) : (
                <div className="space-y-4">
                  <Link href="/auth/signin" className="nav-link">
                    تسجيل الدخول
                  </Link>
                  <Link href="/auth/signup" className="btn-primary w-full text-center">
                    إنشاء حساب
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="container-modern section-padding">
        {/* Hero Section */}
        <div className="text-center mb-16 animate-fade-in">
          <h1 className="text-5xl lg:text-6xl font-bold text-gradient mb-6">
            مرحباً بك في متجرنا
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            اكتشف مجموعة واسعة من المنتجات عالية الجودة بأفضل الأسعار. تسوق الآن واستمتع بتجربة تسوق فريدة
          </p>
        </div>



        {/* Products Grid */}
        <div className="grid-products">
          {filteredProducts.map((product, index) => (
            <div 
              key={product.id} 
              className="product-card group animate-fade-in"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="relative overflow-hidden">
                <img
                  src={product.image || '/placeholder-product.jpg'}
                  alt={product.name}
                  className="product-image"
                />
                <div className="product-overlay">
                  <div className="absolute bottom-4 left-4 right-4">
                    <button 
                      onClick={() => handleViewDetails(product.id)}
                      className="w-full bg-white/90 backdrop-blur-sm text-gray-900 font-semibold py-2 px-4 rounded-xl hover:bg-white transition-all duration-300"
                    >
                      عرض التفاصيل
                    </button>
                  </div>
                </div>
                {product.stock === 0 && (
                  <div className="absolute top-4 right-4 bg-danger-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
                    غير متوفر
                  </div>
                )}
              </div>
              <div className="p-6">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm text-primary-600 font-semibold bg-primary-50 px-3 py-1 rounded-full">
                    {product.category}
                  </span>
                  <div className="flex items-center space-x-1 rtl:space-x-reverse">
                    <Star className="w-4 h-4 text-warning-400 fill-current" />
                    <span className="text-sm text-gray-600">4.5</span>
                  </div>
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2">{product.name}</h3>
                <p className="text-gray-600 text-sm mb-4 line-clamp-2">{product.description}</p>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-2xl font-bold text-gradient-primary">{product.price} ر.س</span>
                  <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                    متوفر: {product.stock}
                  </span>
                </div>
                <div className="flex space-x-2 rtl:space-x-reverse">
                  <button 
                    onClick={() => handleAddToCart(product)}
                    className="flex-1 btn-primary text-sm flex items-center justify-center space-x-2 rtl:space-x-reverse"
                    disabled={product.stock === 0}
                  >
                    <ShoppingCart className="w-4 h-4" />
                    <span>إضافة للسلة</span>
                  </button>
                  {session && (
                    <button className="btn-secondary p-3 hover:bg-accent-50 hover:text-accent-600">
                      <Heart className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredProducts.length === 0 && (
          <div className="text-center py-20">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Package className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">لا توجد منتجات</h3>
            <p className="text-gray-600 text-lg mb-8">لم نجد أي منتجات تطابق البحث المطلوب</p>
            <button
              onClick={() => {
                setSearchTerm('')
                setSelectedCategory('')
              }}
              className="btn-primary"
            >
              عرض جميع المنتجات
            </button>
          </div>
        )}
      </main>
    </div>
  )
}

