import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/router'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import Link from 'next/link'
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  ArrowLeft,
  Edit,
  Save,
  X,
  ShoppingBag,
  Package
} from 'lucide-react'

interface UserProfile {
  id: string
  name: string
  email: string
  phone?: string
  address?: string
  role: string
}

interface Order {
  id: string
  status: string
  total: number
  createdAt: string
  orderItems: {
    quantity: number
    product: {
      name: string
      price: number
    }
  }[]
}

export default function Profile() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [userOrders, setUserOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const { register, handleSubmit, formState: { errors }, reset } = useForm<UserProfile>()

  useEffect(() => {
    if (status === 'loading') return
    
    if (!session) {
      router.push('/auth/signin')
      return
    }
    
    fetchUserData()
  }, [session, status, router])

  const fetchUserData = async () => {
    try {
      const [profileRes, ordersRes] = await Promise.all([
        fetch('/api/user/profile'),
        fetch('/api/user/orders')
      ])
      
      if (profileRes.ok) {
        const profileData = await profileRes.json()
        setUserProfile(profileData)
        reset(profileData)
      }
      
      if (ordersRes.ok) {
        const ordersData = await ordersRes.json()
        setUserOrders(ordersData)
      }
    } catch (error) {
      console.error('Error fetching user data:', error)
    } finally {
      setLoading(false)
    }
  }

  const onSubmit = async (data: UserProfile) => {
    try {
      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      })

      if (response.ok) {
        const updatedProfile = await response.json()
        setUserProfile(updatedProfile)
        setIsEditing(false)
        toast.success('تم تحديث الملف الشخصي بنجاح')
      } else {
        toast.error('حدث خطأ أثناء تحديث الملف الشخصي')
      }
    } catch (error) {
      toast.error('حدث خطأ أثناء تحديث الملف الشخصي')
    }
  }

  const getStatusText = (status: string) => {
    const statusMap: { [key: string]: string } = {
      'PENDING': 'في الانتظار',
      'CONFIRMED': 'مؤكد',
      'SHIPPED': 'تم الشحن',
      'DELIVERED': 'تم التسليم',
      'CANCELLED': 'ملغي'
    }
    return statusMap[status] || status
  }

  const getStatusColor = (status: string) => {
    const colorMap: { [key: string]: string } = {
      'PENDING': 'bg-yellow-100 text-yellow-800',
      'CONFIRMED': 'bg-blue-100 text-blue-800',
      'SHIPPED': 'bg-purple-100 text-purple-800',
      'DELIVERED': 'bg-green-100 text-green-800',
      'CANCELLED': 'bg-red-100 text-red-800'
    }
    return colorMap[status] || 'bg-gray-100 text-gray-800'
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
          <div className="flex items-center h-16">
            <Link href="/" className="flex items-center space-x-2 rtl:space-x-reverse text-gray-600 hover:text-gray-900">
              <ArrowLeft className="w-5 h-5" />
              <span>العودة للمتجر</span>
            </Link>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Information */}
          <div className="lg:col-span-1">
            <div className="card">
              <div className="text-center mb-6">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-primary-100 rounded-full mb-4">
                  <User className="w-10 h-10 text-primary-600" />
                </div>
                <h2 className="text-xl font-bold text-gray-900">{userProfile?.name}</h2>
                <p className="text-gray-600">{userProfile?.email}</p>
                <span className="inline-block mt-2 px-3 py-1 bg-primary-100 text-primary-800 text-sm rounded-full">
                  {userProfile?.role === 'ADMIN' ? 'مدير' : 'عميل'}
                </span>
              </div>

              {!isEditing ? (
                <div className="space-y-4">
                  <div className="flex items-center space-x-3 rtl:space-x-reverse">
                    <Phone className="w-5 h-5 text-gray-400" />
                    <span className="text-gray-700">{userProfile?.phone || 'غير محدد'}</span>
                  </div>
                  <div className="flex items-center space-x-3 rtl:space-x-reverse">
                    <MapPin className="w-5 h-5 text-gray-400" />
                    <span className="text-gray-700">{userProfile?.address || 'غير محدد'}</span>
                  </div>
                  <button
                    onClick={() => setIsEditing(true)}
                    className="w-full btn-primary flex items-center justify-center space-x-2 rtl:space-x-reverse"
                  >
                    <Edit className="w-4 h-4" />
                    <span>تعديل الملف الشخصي</span>
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">الاسم الكامل</label>
                    <input
                      {...register('name', { required: 'الاسم مطلوب' })}
                      type="text"
                      className="input-field"
                    />
                    {errors.name && (
                      <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">البريد الإلكتروني</label>
                    <input
                      {...register('email', { 
                        required: 'البريد الإلكتروني مطلوب',
                        pattern: {
                          value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                          message: 'البريد الإلكتروني غير صحيح'
                        }
                      })}
                      type="email"
                      className="input-field"
                    />
                    {errors.email && (
                      <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">رقم الهاتف</label>
                    <input
                      {...register('phone')}
                      type="tel"
                      className="input-field"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">العنوان</label>
                    <textarea
                      {...register('address')}
                      className="input-field"
                      rows={3}
                    />
                  </div>

                  <div className="flex space-x-2 rtl:space-x-reverse">
                    <button
                      type="button"
                      onClick={() => {
                        setIsEditing(false)
                        if (userProfile) {
                          reset(userProfile)
                        }
                      }}
                      className="flex-1 btn-secondary flex items-center justify-center space-x-2 rtl:space-x-reverse"
                    >
                      <X className="w-4 h-4" />
                      <span>إلغاء</span>
                    </button>
                    <button
                      type="submit"
                      className="flex-1 btn-primary flex items-center justify-center space-x-2 rtl:space-x-reverse"
                    >
                      <Save className="w-4 h-4" />
                      <span>حفظ</span>
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>

          {/* Orders History */}
          <div className="lg:col-span-2">
            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center space-x-2 rtl:space-x-reverse">
                <ShoppingBag className="w-5 h-5" />
                <span>تاريخ الطلبات</span>
              </h3>

              {userOrders.length === 0 ? (
                <div className="text-center py-8">
                  <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h4 className="text-lg font-medium text-gray-900 mb-2">لا توجد طلبات</h4>
                  <p className="text-gray-600 mb-4">لم تقم بأي طلبات بعد</p>
                  <Link href="/" className="btn-primary">
                    ابدأ التسوق
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {userOrders.map((order) => (
                    <div key={order.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h4 className="font-medium text-gray-900">طلب #{order.id.slice(-8)}</h4>
                          <p className="text-sm text-gray-600">
                            {new Date(order.createdAt).toLocaleDateString('ar-SA')}
                          </p>
                        </div>
                        <div className="text-left">
                          <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                            {getStatusText(order.status)}
                          </span>
                          <p className="text-lg font-bold text-primary-600 mt-1">
                            {order.total} ر.س
                          </p>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        {order.orderItems.map((item, index) => (
                          <div key={index} className="flex justify-between items-center text-sm">
                            <span className="text-gray-700">{item.product.name}</span>
                            <span className="text-gray-600">
                              {item.quantity} × {item.product.price} ر.س
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

