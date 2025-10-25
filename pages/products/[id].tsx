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
              {session ? (
                <>
                  <Link href="/profile" className="flex items-center space-x-1 text-gray-700 hover:text-primary-600">
                    <User className="w-5 h-5" />
                    <span>{session.user?.name}</span>
                  </Link>
                  <Link href="/cart" className="flex items-center space-x-1 text-gray-700 hover:text-primary-600">
                    <ShoppingCart className="w-5 h-5" />
                    <span>السلة ({cart.length})</span>
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
              {session ? (
                <div className="space-y-2">
                  <Link href="/profile" className="flex items-center space-x-2 text-gray-700 hover:text-primary-600">
                    <User className="w-5 h-5" />
                    <span>{session.user?.name}</span>
                  </Link>
                  <Link href="/cart" className="flex items-center space-x-2 text-gray-700 hover:text-primary-600">
                    <ShoppingCart className="w-5 h-5" />
                    <span>السلة ({cart.length})</span>
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
        {/* Breadcrumb */}
        <nav className="flex items-center space-x-2 rtl:space-x-reverse text-sm text-gray-600 mb-8">
          <Link href="/" className="hover:text-primary-600">الرئيسية</Link>
          <ArrowRight className="w-4 h-4" />
          <span className="text-gray-900">{product.category}</span>
          <ArrowRight className="w-4 h-4" />
          <span className="text-gray-900">{product.name}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Product Image */}
          <div className="space-y-4">
            <div className="aspect-w-16 aspect-h-12">
              <img
                src={product.image || '/placeholder-product.jpg'}
                alt={product.name}
                className="w-full h-96 object-cover rounded-lg"
              />
            </div>
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{product.name}</h1>
              <p className="text-lg text-gray-600">{product.category}</p>
            </div>

            <div className="flex items-center space-x-2 rtl:space-x-reverse">
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                ))}
              </div>
              <span className="text-sm text-gray-600">(4.5) - 128 تقييم</span>
            </div>

            <div className="text-3xl font-bold text-primary-600">
              {product.price} ر.س
            </div>

            <div className="text-gray-700 leading-relaxed">
              {product.description}
            </div>

            <div className="flex items-center space-x-4 rtl:space-x-reverse">
              <span className="text-sm text-gray-600">الكمية:</span>
              <div className="flex items-center border border-gray-300 rounded-lg">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="p-2 hover:bg-gray-100"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="px-4 py-2 min-w-[60px] text-center">{quantity}</span>
                <button
                  onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                  className="p-2 hover:bg-gray-100"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              <span className="text-sm text-gray-500">
                متوفر: {product.stock} قطعة
              </span>
            </div>

            <div className="flex space-x-4 rtl:space-x-reverse">
              <button
                onClick={handleAddToCart}
                className="flex-1 btn-primary flex items-center justify-center space-x-2 rtl:space-x-reverse"
              >
                <ShoppingCart className="w-5 h-5" />
                <span>إضافة إلى السلة</span>
              </button>
              {session && (
                <button className="btn-secondary p-3">
                  <Heart className="w-5 h-5" />
                </button>
              )}
            </div>

            {/* Cart Summary */}
            {cart.length > 0 && (
              <div className="border-t pt-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">السلة ({cart.length} منتج)</h3>
                  <Link href="/cart" className="text-primary-600 hover:text-primary-700 text-sm">
                    عرض السلة
                  </Link>
                </div>
                <div className="space-y-2">
                  {cart.map((item) => {
                    const cartProduct = item.productId === product.id ? product : null
                    return cartProduct ? (
                      <div key={item.productId} className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">{cartProduct.name} × {item.quantity}</span>
                        <span className="text-gray-900">{(item.price * item.quantity).toFixed(2)} ر.س</span>
                      </div>
                    ) : null
                  })}
                  <div className="border-t pt-2">
                    <div className="flex justify-between font-semibold">
                      <span className="text-gray-900">المجموع الكلي</span>
                      <span className="text-primary-600">
                        {cart.reduce((total, item) => total + (item.price * item.quantity), 0).toFixed(2)} ر.س
                      </span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => router.push('/cart')}
                  className="w-full mt-4 btn-primary"
                >
                  إنشاء طلب
                </button>
              </div>
            )}

            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">معلومات إضافية</h3>
              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex justify-between">
                  <span>الفئة:</span>
                  <span className="text-gray-900">{product.category}</span>
                </div>
                <div className="flex justify-between">
                  <span>المخزون:</span>
                  <span className="text-gray-900">{product.stock} قطعة</span>
                </div>
                <div className="flex justify-between">
                  <span>الحالة:</span>
                  <span className="text-green-600 font-medium">متوفر</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
