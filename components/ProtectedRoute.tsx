import { useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/router'

interface ProtectedRouteProps {
  children: React.ReactNode
  allowedRoles?: string[]
  redirectTo?: string
}

export default function ProtectedRoute({ 
  children, 
  allowedRoles = [], 
  redirectTo = '/' 
}: ProtectedRouteProps) {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === 'loading') return

    // إذا لم يكن مسجل دخول
    if (!session) {
      router.push('/auth/signin')
      return
    }

    // إذا كان هناك أدوار مسموحة
    if (allowedRoles.length > 0) {
      const userRole = session.user?.role
      
      // إذا لم يكن الدور مسموحاً
      if (!userRole || !allowedRoles.includes(userRole)) {
        // إذا كان admin يحاول الوصول لصفحة غير مسموحة، أرسله للوحة التحكم
        if (userRole === 'ADMIN') {
          router.push('/admin')
        } else {
          // إذا كان مستخدم عادي، أرسله للصفحة الرئيسية
          router.push(redirectTo)
        }
        return
      }
    }
  }, [session, status, router, allowedRoles, redirectTo])

  // عرض loading أثناء التحقق
  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="loading-spinner"></div>
      </div>
    )
  }

  // إذا لم يكن مسجل دخول أو الدور غير مسموح، لا تعرض المحتوى
  if (!session) {
    return null
  }

  if (allowedRoles.length > 0) {
    const userRole = session.user?.role
    if (!userRole || !allowedRoles.includes(userRole)) {
      return null
    }
  }

  return <>{children}</>
}

