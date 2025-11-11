import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function testConnection() {
  console.log('🔍 اختبار الاتصال بقاعدة البيانات...')
  console.log('='.repeat(60))

  try {
    // اختبار الاتصال
    console.log('\n1️⃣ اختبار الاتصال...')
    await prisma.$connect()
    console.log('✅ الاتصال ناجح!')

    // اختبار جلب المنتجات
    console.log('\n2️⃣ اختبار جلب المنتجات...')
    const products = await prisma.product.findMany({
      take: 5
    })
    console.log(`✅ تم جلب ${products.length} منتج`)
    
    if (products.length > 0) {
      console.log('\n📦 أمثلة على المنتجات:')
      products.forEach((product, index) => {
        console.log(`   ${index + 1}. ${product.name} - ${product.price} ريال`)
      })
    }

    // اختبار جلب المستخدمين
    console.log('\n3️⃣ اختبار جلب المستخدمين...')
    const users = await prisma.user.findMany({
      take: 3,
      select: {
        id: true,
        name: true,
        email: true,
        role: true
      }
    })
    console.log(`✅ تم جلب ${users.length} مستخدم`)
    
    if (users.length > 0) {
      console.log('\n👥 أمثلة على المستخدمين:')
      users.forEach((user, index) => {
        console.log(`   ${index + 1}. ${user.name} (${user.email}) - ${user.role}`)
      })
    }

    console.log('\n' + '='.repeat(60))
    console.log('✅ جميع الاختبارات نجحت!')
    console.log('💡 قاعدة البيانات تعمل بشكل صحيح')

  } catch (error: any) {
    console.error('\n❌ خطأ في الاتصال:')
    console.error('   الرسالة:', error.message)
    
    if (error.message?.includes('AuthenticationFailed') || error.message?.includes('bad auth')) {
      console.error('\n🔐 مشكلة في المصادقة:')
      console.error('   - تحقق من اسم المستخدم وكلمة المرور في MongoDB Atlas')
      console.error('   - تأكد من أن كلمة المرور صحيحة (قد تحتوي على أحرف خاصة)')
      console.error('   - تأكد من أن المستخدم لديه صلاحيات القراءة والكتابة')
      console.error('   - في MongoDB Atlas: Database Access > Edit User > Update Password')
    } else if (error.message?.includes('Network')) {
      console.error('\n🌐 مشكلة في الشبكة:')
      console.error('   - تحقق من الاتصال بالإنترنت')
      console.error('   - في MongoDB Atlas: Network Access > Add IP Address')
    } else {
      console.error('\n💡 تفاصيل الخطأ:')
      console.error('   ', error)
    }
  } finally {
    await prisma.$disconnect()
    console.log('\n🔌 تم إغلاق الاتصال')
  }
}

testConnection()
  .catch((error) => {
    console.error('❌ خطأ غير متوقع:', error)
    process.exit(1)
  })

