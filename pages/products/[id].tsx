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
  Plus,
  Minus,
  Star,
  Mail
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

export default function ProductDetails() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const { id } = router.query
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [quantity, setQuantity] = useState(1)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [cart, setCart] = useState<{productId: string, quantity: number, price: number}[]>([])

  // تحميل السلة من localStorage عند تحميل الصفحة
  useEffect(() => {
    const savedCart = localStorage.getItem('cart')
    if (savedCart) {
      setCart(JSON.parse(savedCart))
    }
  }, [])

  // حفظ السلة في localStorage عند تغييرها
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart))
  }, [cart])

  useEffect(() => {
    if (id) {
      fetchProduct()
    }
  }, [id])

  const fetchProduct = async () => {
    try {
      const response = await fetch(`/api/products/${id}`)
      if (response.ok) {
        const data = await response.json()
        setProduct(data)
      } else {
        toast.error('المنتج غير موجود')
        router.push('/')
      }
    } catch (error) {
      console.error('Error fetching product:', error)
      toast.error('حدث خطأ في تحميل المنتج')
    } finally {
      setLoading(false)
    }
  }

  const handleAddToCart = () => {
    if (!product) return
    
    if (status === 'loading') {
      toast.error('جاري تحميل بيانات المستخدم...')
      return
    }

    if (!session) {
      toast.error('يجب تسجيل الدخول أولاً')
      router.push('/auth/signin')
      return
    }

    if (quantity > product.stock) {
      toast.error('الكمية المطلوبة غير متوفرة في المخزون')
      return
    }

    // إضافة المنتج للسلة
    const existingItem = cart.find(item => item.productId === product.id)
    if (existingItem) {
      setCart(cart.map(item => 
        item.productId === product.id 
          ? { ...item, quantity: item.quantity + quantity }
          : item
      ))
    } else {
      setCart([...cart, { productId: product.id, quantity: quantity, price: product.price }])
    }
    
    toast.success(`تم إضافة ${quantity} من ${product.name} إلى السلة`)
  }

  const handleSignOut = () => {
    signOut({ callbackUrl: '/' })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">المنتج غير موجود</h3>
          <Link href="/" className="btn-primary">
            العودة للصفحة الرئيسية
          </Link>
        </div>
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
            <div className="container-modern py-6 space-y-4">
              {session ? (
                <div className="space-y-4">
                  <Link href="/profile" className="nav-link">
                    <div className="w-8 h-8 bg-gradient-primary rounded-full flex items-center justify-center">
                      <User className="w-4 h-4 text-white" />
                    </div>
                    <span>{session.user?.name}</span>
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
        {/* Breadcrumb */}
        <nav className="flex items-center space-x-2 rtl:space-x-reverse text-sm text-gray-600 mb-8">
          <Link href="/" className="hover:text-primary-600 transition-colors duration-300">الرئيسية</Link>
          <ArrowRight className="w-4 h-4" />
          <span className="text-primary-600 hover:text-primary-700 transition-colors duration-300">{product.category}</span>
          <ArrowRight className="w-4 h-4" />
          <span className="text-gray-900 font-semibold">{product.name}</span>
        </nav>

        <div className="grid-responsive">
          {/* Product Image */}
          <div className="space-y-6">
            <div className="relative group">
              <div className="aspect-w-16 aspect-h-12 overflow-hidden rounded-3xl">
                <img
                  src={product.image || '/placeholder-product.jpg'}
                  alt={product.name}
                  className="w-full h-96 object-cover transition-transform duration-700 group-hover:scale-110"
                />
              </div>
              <div className="absolute top-6 right-6">
                <div className="bg-white/90 backdrop-blur-sm rounded-full p-3 shadow-lg">
                  <Heart className="w-6 h-6 text-gray-600 hover:text-accent-600 transition-colors duration-300" />
                </div>
              </div>
              {product.stock === 0 && (
                <div className="absolute top-6 left-6 bg-danger-500 text-white px-4 py-2 rounded-full text-sm font-semibold shadow-lg">
                  غير متوفر
                </div>
              )}
            </div>
          </div>

          {/* Product Info */}
          <div className="space-y-8">
            <div className="animate-fade-in">
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm text-primary-600 font-semibold bg-primary-50 px-4 py-2 rounded-full">
                  {product.category}
                </span>
                <div className="flex items-center space-x-2 rtl:space-x-reverse">
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 text-warning-400 fill-current" />
                    ))}
                  </div>
                  <span className="text-sm text-gray-600 font-semibold">(4.5) - 128 تقييم</span>
                </div>
              </div>
              
              <h1 className="text-4xl font-bold text-gray-900 mb-4">{product.name}</h1>
              
              <div className="text-4xl font-bold text-gradient-primary mb-6">
                {product.price} ر.س
              </div>
            </div>

            <div className="card">
              <h2 className="text-xl font-bold text-gray-900 mb-4">الوصف</h2>
              <p className="text-gray-700 leading-relaxed text-lg">
                {product.description}
              </p>
            </div>

            <div className="card">
              <h2 className="text-xl font-bold text-gray-900 mb-6">الكمية</h2>
              <div className="flex items-center space-x-6 rtl:space-x-reverse mb-6">
                <div className="flex items-center border border-gray-200 rounded-2xl bg-white shadow-soft">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="p-4 hover:bg-gray-50 transition-colors duration-300"
                  >
                    <Minus className="w-6 h-6" />
                  </button>
                  <span className="px-8 py-4 min-w-[100px] text-center text-2xl font-bold">{quantity}</span>
                  <button
                    onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                    className="p-4 hover:bg-gray-50 transition-colors duration-300"
                    disabled={quantity >= product.stock}
                  >
                    <Plus className="w-6 h-6" />
                  </button>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-600 mb-1">المخزون المتوفر</p>
                  <p className="text-lg font-semibold text-gray-900">{product.stock} قطعة</p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <button
                onClick={handleAddToCart}
                className="w-full btn-primary text-lg py-4 flex items-center justify-center space-x-3 rtl:space-x-reverse shadow-glow"
                disabled={product.stock === 0}
              >
                <ShoppingCart className="w-6 h-6" />
                <span>إضافة إلى السلة</span>
              </button>
              
              {session && (
                <button className="w-full btn-secondary text-lg py-4 flex items-center justify-center space-x-3 rtl:space-x-reverse">
                  <Heart className="w-6 h-6" />
                  <span>إضافة للمفضلة</span>
                </button>
              )}
            </div>

            {/* Cart Summary */}
            {cart.length > 0 && (
              <div className="card">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-gray-900">السلة ({cart.length} منتج)</h3>
                  <Link href="/cart" className="text-primary-600 hover:text-primary-700 text-sm font-semibold">
                    عرض السلة
                  </Link>
                </div>
                <div className="space-y-3">
                  {cart.map((item) => {
                    const cartProduct = item.productId === product.id ? product : null
                    return cartProduct ? (
                      <div key={item.productId} className="flex items-center justify-between text-sm py-2 border-b border-gray-100 last:border-b-0">
                        <span className="text-gray-600">{cartProduct.name} × {item.quantity}</span>
                        <span className="text-gray-900 font-semibold">{(item.price * item.quantity).toFixed(2)} ر.س</span>
                      </div>
                    ) : null
                  })}
                  <div className="border-t-2 border-primary-200 pt-3">
                    <div className="flex justify-between font-bold text-lg">
                      <span className="text-gray-900">المجموع الكلي</span>
                      <span className="text-gradient-primary">
                        {cart.reduce((total, item) => total + (item.price * item.quantity), 0).toFixed(2)} ر.س
                      </span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => router.push('/cart')}
                  className="w-full mt-6 btn-accent"
                >
                  إنشاء طلب
                </button>
              </div>
            )}

            <div className="card">
              <h3 className="text-xl font-bold text-gray-900 mb-6">معلومات إضافية</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 bg-gray-50 rounded-xl">
                  <p className="text-sm text-gray-600 mb-1">الفئة</p>
                  <p className="font-semibold text-gray-900">{product.category}</p>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-xl">
                  <p className="text-sm text-gray-600 mb-1">المخزون</p>
                  <p className="font-semibold text-gray-900">{product.stock} قطعة</p>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-xl">
                  <p className="text-sm text-gray-600 mb-1">الحالة</p>
                  <p className="font-semibold text-success-600">متوفر</p>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-xl">
                  <p className="text-sm text-gray-600 mb-1">التقييم</p>
                  <p className="font-semibold text-gray-900">4.5 ⭐</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
