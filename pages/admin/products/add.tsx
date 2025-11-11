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
  ArrowRight,
  Save,
  ArrowLeft
} from 'lucide-react'
import toast from 'react-hot-toast'

export default function AddProduct() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    stock: '',
    image: ''
  })
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)

  useEffect(() => {
    if (status === 'loading') return
    
    if (!session || session.user?.role !== 'ADMIN') {
      router.push('/')
      return
    }
  }, [session, status, router])

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setImageFile(file)
      const reader = new FileReader()
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const formDataToSend = new FormData()
      formDataToSend.append('name', formData.name)
      formDataToSend.append('description', formData.description)
      formDataToSend.append('price', formData.price)
      formDataToSend.append('stock', formData.stock)
      
      if (imageFile) {
        formDataToSend.append('image', imageFile)
      }

      const response = await fetch('/api/products', {
        method: 'POST',
        body: formDataToSend
      })

      if (response.ok) {
        toast.success('تم إضافة المنتج بنجاح')
        router.push('/admin/products')
      } else {
        toast.error('حدث خطأ أثناء إضافة المنتج')
      }
    } catch (error) {
      toast.error('حدث خطأ أثناء إضافة المنتج')
    } finally {
      setLoading(false)
    }
  }

  const handleSignOut = () => {
    signOut({ callbackUrl: '/' })
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
                <h1 className="text-xl font-bold text-gray-900">إضافة منتج جديد</h1>
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
              <Link href="/admin/products" className="nav-link">
                <Package className="w-6 h-6" />
                <span>المنتجات</span>
              </Link>
              <Link href="/admin/orders" className="nav-link">
                <Package className="w-6 h-6" />
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
              <Link href="/admin" className="nav-link">
                <Package className="w-6 h-6" />
                <span>لوحة التحكم</span>
              </Link>
              <Link href="/admin/products" className="nav-link">
                <Package className="w-6 h-6" />
                <span>المنتجات</span>
              </Link>
              <Link href="/admin/orders" className="nav-link">
                <Package className="w-6 h-6" />
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
          {/* Breadcrumb */}
          <nav className="flex items-center space-x-2 rtl:space-x-reverse text-sm text-gray-600 mb-8">
            <Link href="/admin" className="hover:text-primary-600 transition-colors duration-200">
              لوحة التحكم
            </Link>
            <ArrowRight className="w-4 h-4" />
            <Link href="/admin/products" className="hover:text-primary-600 transition-colors duration-200">
              المنتجات
            </Link>
            <ArrowRight className="w-4 h-4" />
            <span className="text-gray-900 font-medium">إضافة منتج جديد</span>
          </nav>

          {/* Page Header */}
          <div className="flex items-center justify-between mb-10">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-3">إضافة منتج جديد</h2>
              <p className="text-lg text-gray-600">أضف منتجاً جديداً إلى المتجر</p>
            </div>
            <Link
              href="/admin/products"
              className="btn-secondary flex items-center space-x-2 rtl:space-x-reverse px-6 py-3"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>العودة للمنتجات</span>
            </Link>
          </div>

          {/* Form */}
          <div className="max-w-2xl">
            <div className="card p-8">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">اسم المنتج</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="input-field"
                    placeholder="أدخل اسم المنتج"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">الوصف</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="input-field"
                    rows={4}
                    placeholder="أدخل وصف المنتج"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">السعر (ر.س)</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      className="input-field"
                      placeholder="0.00"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">المخزون</label>
                    <input
                      type="number"
                      min="0"
                      value={formData.stock}
                      onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                      className="input-field"
                      placeholder="0"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">صورة المنتج</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="input-field"
                  />
                  {imagePreview && (
                    <div className="mt-4">
                      <p className="text-sm text-gray-600 mb-2">معاينة الصورة:</p>
                      <img
                        src={imagePreview}
                        alt="معاينة الصورة"
                        className="w-48 h-48 object-cover rounded-lg border shadow-sm"
                      />
                    </div>
                  )}
                </div>

                <div className="flex space-x-4 rtl:space-x-reverse pt-6">
                  <Link
                    href="/admin/products"
                    className="flex-1 btn-secondary text-center"
                  >
                    إلغاء
                  </Link>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 btn-primary disabled:opacity-50 flex items-center justify-center space-x-2 rtl:space-x-reverse"
                  >
                    {loading ? (
                      <>
                        <div className="loading-spinner w-4 h-4"></div>
                        <span>جاري الحفظ...</span>
                      </>
                    ) : (
                      <>
                        <Save className="w-5 h-5" />
                        <span>حفظ المنتج</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
