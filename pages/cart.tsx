import { useState, useEffect } from 'react'
import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/router'
import ProtectedRoute from '../components/ProtectedRoute'
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
  Plus,
  Minus,
  Trash2,
  CreditCard
} from 'lucide-react'
import toast from 'react-hot-toast'

interface CartItem {
  productId: string
  quantity: number
  price: number
  product?: {
    id: string
    name: string
    image?: string
    stock: number
  }
}

function CartContent() {
  const { data: session } = useSession()
  const [cart, setCart] = useState<CartItem[]>([])
  const [loading, setLoading] = useState(true)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  useEffect(() => {
    loadCart()
  }, [])

  const loadCart = async () => {
    try {
      const savedCart = localStorage.getItem('cart')
      if (savedCart) {
        const cartItems = JSON.parse(savedCart)
        
        // جلب تفاصيل المنتجات
        const productsWithDetails = await Promise.all(
          cartItems.map(async (item: CartItem) => {
            try {
              const response = await fetch(`/api/products/${item.productId}`)
              if (response.ok) {
                const product = await response.json()
                return { ...item, product }
              }
              return item
            } catch (error) {
              console.error('Error fetching product:', error)
              return item
            }
          })
        )
        
        setCart(productsWithDetails)
      }
    } catch (error) {
      console.error('Error loading cart:', error)
    } finally {
      setLoading(false)
    }
  }

  const updateQuantity = (productId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeFromCart(productId)
      return
    }

    const updatedCart = cart.map(item => 
      item.productId === productId 
        ? { ...item, quantity: newQuantity }
        : item
    )
    setCart(updatedCart)
    localStorage.setItem('cart', JSON.stringify(updatedCart))
  }

  const removeFromCart = (productId: string) => {
    const updatedCart = cart.filter(item => item.productId !== productId)
    setCart(updatedCart)
    localStorage.setItem('cart', JSON.stringify(updatedCart))
    toast.success('تم حذف المنتج من السلة')
  }

  const clearCart = () => {
    setCart([])
    localStorage.removeItem('cart')
    toast.success('تم إفراغ السلة')
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
          items: cart.map(item => ({
            productId: item.productId,
            quantity: item.quantity,
            price: item.price
          }))
        })
      })

      if (response.ok) {
        toast.success('تم إنشاء الطلب بنجاح!')
        clearCart()
        router.push('/orders')
      } else {
        toast.error('حدث خطأ في إنشاء الطلب')
      }
    } catch (error) {
      console.error('Error creating order:', error)
      toast.error('حدث خطأ في إنشاء الطلب')
    }
  }

  const handleSignOut = () => {
    signOut({ callbackUrl: '/' })
  }

  const totalAmount = cart.reduce((total, item) => total + (item.price * item.quantity), 0)

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
              <Link href="/orders" className="nav-link">
                <Package className="w-6 h-6" />
                <span>طلباتي</span>
              </Link>
              <Link href="/cart" className="nav-link-active">
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
              <Link href="/orders" className="nav-link">
                <Package className="w-6 h-6" />
                <span>طلباتي</span>
              </Link>
              <Link href="/cart" className="nav-link-active">
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
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="container-modern section-padding">
        {/* Breadcrumb */}
        <nav className="flex items-center space-x-2 rtl:space-x-reverse text-sm text-gray-600 mb-8">
          <Link href="/" className="hover:text-primary-600 transition-colors duration-300">الرئيسية</Link>
          <ArrowRight className="w-4 h-4" />
          <span className="text-gray-900 font-semibold">السلة</span>
        </nav>

        {/* Page Header */}
        <div className="text-center mb-12 animate-fade-in">
          <div className="w-20 h-20 bg-gradient-primary rounded-full flex items-center justify-center mx-auto mb-6">
            <ShoppingCart className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gradient-primary mb-4">سلة التسوق</h1>
          <p className="text-xl text-gray-600">مراجعة وتعديل منتجاتك قبل الطلب</p>
        </div>

        {cart.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-32 h-32 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-8">
              <ShoppingCart className="w-16 h-16 text-gray-400" />
            </div>
            <h3 className="text-3xl font-bold text-gray-900 mb-4">السلة فارغة</h3>
            <p className="text-gray-600 text-lg mb-8">لم تقم بإضافة أي منتجات إلى السلة بعد</p>
            <Link href="/" className="btn-primary text-lg px-8 py-4">
              تسوق الآن
            </Link>
          </div>
        ) : (
          <div className="grid-responsive">
            {/* Cart Items */}
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">منتجاتك ({cart.length})</h2>
              {cart.map((item, index) => (
                <div 
                  key={item.productId} 
                  className="card-elevated animate-fade-in"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="flex items-center space-x-6 rtl:space-x-reverse">
                    <div className="relative">
                      <img
                        src={item.product?.image || '/placeholder-product.jpg'}
                        alt={item.product?.name || 'منتج'}
                        className="w-24 h-24 object-cover rounded-2xl"
                      />
                      {item.product && item.quantity > item.product.stock && (
                        <div className="absolute -top-2 -right-2 w-6 h-6 bg-danger-500 text-white text-xs rounded-full flex items-center justify-center">
                          !
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-gray-900 mb-2">
                        {item.product?.name || 'منتج غير معروف'}
                      </h3>
                      <p className="text-gray-600 mb-3">
                        السعر: <span className="font-semibold text-primary-600">{item.price} ر.س</span> للقطعة الواحدة
                      </p>
                      {item.product && item.quantity > item.product.stock && (
                        <div className="bg-danger-50 border border-danger-200 rounded-xl p-3 mb-3">
                          <p className="text-danger-700 text-sm font-semibold">
                            ⚠️ الكمية المطلوبة ({item.quantity}) أكبر من المتوفر ({item.product.stock})
                          </p>
                        </div>
                      )}
                    </div>
                    <div className="flex items-center space-x-4 rtl:space-x-reverse">
                      {/* Quantity Controls */}
                      <div className="flex items-center border border-gray-200 rounded-xl bg-white">
                        <button
                          onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                          className="p-3 hover:bg-gray-50 transition-colors duration-300"
                        >
                          <Minus className="w-5 h-5" />
                        </button>
                        <span className="px-6 py-3 min-w-[80px] text-center font-semibold text-lg">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                          className="p-3 hover:bg-gray-50 transition-colors duration-300"
                          disabled={item.product && item.quantity >= item.product.stock}
                        >
                          <Plus className="w-5 h-5" />
                        </button>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-gradient-primary">
                          {(item.price * item.quantity).toFixed(2)} ر.س
                        </p>
                      </div>
                      <button
                        onClick={() => removeFromCart(item.productId)}
                        className="p-3 text-danger-600 hover:bg-danger-50 rounded-xl transition-all duration-300 hover:scale-110"
                        title="حذف من السلة"
                      >
                        <Trash2 className="w-6 h-6" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
              
              {/* Clear Cart Button */}
              <div className="text-center pt-6">
                <button
                  onClick={clearCart}
                  className="text-danger-600 hover:text-danger-700 font-semibold text-lg hover:underline transition-all duration-300"
                >
                  إفراغ السلة بالكامل
                </button>
              </div>
            </div>

            {/* Order Summary */}
            <div className="space-y-6">
              <div className="card-elevated">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">ملخص الطلب</h2>
                <div className="space-y-4">
                  {cart.map((item) => (
                    <div key={item.productId} className="flex justify-between items-center py-3 border-b border-gray-100 last:border-b-0">
                      <div>
                        <span className="text-gray-900 font-semibold">
                          {item.product?.name || 'منتج غير معروف'}
                        </span>
                        <p className="text-sm text-gray-600">× {item.quantity}</p>
                      </div>
                      <span className="text-gray-900 font-bold">{(item.price * item.quantity).toFixed(2)} ر.س</span>
                    </div>
                  ))}
                  <div className="border-t-2 border-primary-200 pt-4">
                    <div className="flex justify-between items-center text-2xl font-bold">
                      <span className="text-gray-900">المجموع الكلي</span>
                      <span className="text-gradient-primary">{totalAmount.toFixed(2)} ر.س</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Payment Info */}
              <div className="card">
                <h2 className="text-xl font-bold text-gray-900 mb-4">معلومات الدفع</h2>
                <div className="flex items-center space-x-3 rtl:space-x-reverse p-4 bg-success-50 rounded-xl border border-success-200">
                  <CreditCard className="w-6 h-6 text-success-600" />
                  <span className="text-success-800 font-semibold">الدفع عند الاستلام</span>
                </div>
                <p className="text-sm text-gray-600 mt-3">
                  يمكنك الدفع نقداً عند استلام الطلب
                </p>
              </div>

              {/* Checkout Button */}
              <button
                onClick={handleCreateOrder}
                className="w-full btn-primary text-lg py-4 flex items-center justify-center space-x-3 rtl:space-x-reverse shadow-glow"
              >
                <ShoppingCart className="w-6 h-6" />
                <span>إنشاء الطلب</span>
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}

export default function Cart() {
  return (
    <ProtectedRoute allowedRoles={['USER']}>
      <CartContent />
    </ProtectedRoute>
  )
}
