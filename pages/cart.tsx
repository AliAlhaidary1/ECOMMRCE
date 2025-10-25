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

export default function Cart() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [cart, setCart] = useState<CartItem[]>([])
  const [loading, setLoading] = useState(true)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  useEffect(() => {
    if (status === 'loading') return
    if (!session) {
      router.push('/auth/signin')
      return
    }
    loadCart()
  }, [session, status])

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
              <Link href="/orders" className="flex items-center space-x-1 text-gray-700 hover:text-primary-600">
                <Package className="w-5 h-5" />
                <span>طلباتي</span>
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
              <Link href="/orders" className="flex items-center space-x-2 text-gray-700 hover:text-primary-600">
                <Package className="w-5 h-5" />
                <span>طلباتي</span>
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
          <span className="text-gray-900">السلة</span>
        </nav>

        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">سلة التسوق</h1>
          <p className="text-gray-600">مراجعة وتعديل منتجاتك قبل الطلب</p>
        </div>

        {cart.length === 0 ? (
          <div className="text-center py-12">
            <ShoppingCart className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">السلة فارغة</h3>
            <p className="text-gray-600 mb-4">لم تقم بإضافة أي منتجات إلى السلة بعد</p>
            <Link href="/" className="btn-primary">
              تسوق الآن
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              {cart.map((item) => (
                <div key={item.productId} className="card">
                  <div className="flex items-center space-x-4 rtl:space-x-reverse">
                    <img
                      src={item.product?.image || '/placeholder-product.jpg'}
                      alt={item.product?.name || 'منتج'}
                      className="w-20 h-20 object-cover rounded-lg"
                    />
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">
                        {item.product?.name || 'منتج غير معروف'}
                      </h3>
                      <p className="text-sm text-gray-600 mb-2">
                        السعر: {item.price} ر.س للقطعة الواحدة
                      </p>
                      {item.product && item.quantity > item.product.stock && (
                        <p className="text-sm text-red-600 mb-2">
                          الكمية المطلوبة ({item.quantity}) أكبر من المتوفر ({item.product.stock})
                        </p>
                      )}
                    </div>
                    <div className="flex items-center space-x-4 rtl:space-x-reverse">
                      {/* Quantity Controls */}
                      <div className="flex items-center border border-gray-300 rounded-lg">
                        <button
                          onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                          className="p-2 hover:bg-gray-100"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="px-4 py-2 min-w-[60px] text-center">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                          className="p-2 hover:bg-gray-100"
                          disabled={item.product && item.quantity >= item.product.stock}
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-semibold text-gray-900">
                          {(item.price * item.quantity).toFixed(2)} ر.س
                        </p>
                      </div>
                      <button
                        onClick={() => removeFromCart(item.productId)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                        title="حذف من السلة"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
              
              {/* Clear Cart Button */}
              <div className="text-center">
                <button
                  onClick={clearCart}
                  className="text-red-600 hover:text-red-700 text-sm"
                >
                  إفراغ السلة
                </button>
              </div>
            </div>

            {/* Order Summary */}
            <div className="space-y-6">
              <div className="card">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">ملخص الطلب</h2>
                <div className="space-y-3">
                  {cart.map((item) => (
                    <div key={item.productId} className="flex justify-between text-sm">
                      <span className="text-gray-600">
                        {item.product?.name || 'منتج غير معروف'} × {item.quantity}
                      </span>
                      <span className="text-gray-900">{(item.price * item.quantity).toFixed(2)} ر.س</span>
                    </div>
                  ))}
                  <div className="border-t pt-3">
                    <div className="flex justify-between text-lg font-semibold">
                      <span className="text-gray-900">المجموع الكلي</span>
                      <span className="text-primary-600">{totalAmount.toFixed(2)} ر.س</span>
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

              {/* Checkout Button */}
              <button
                onClick={handleCreateOrder}
                className="w-full btn-primary flex items-center justify-center space-x-2 rtl:space-x-reverse"
              >
                <ShoppingCart className="w-5 h-5" />
                <span>إنشاء الطلب</span>
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
