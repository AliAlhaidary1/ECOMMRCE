import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 بدء إضافة البيانات التجريبية...')
  console.log('='.repeat(60))

  try {
    // اختبار الاتصال أولاً
    console.log('\n🔌 اختبار الاتصال بقاعدة البيانات...')
    await prisma.$connect()
    console.log('✅ الاتصال ناجح!\n')
  } catch (error: any) {
    console.error('❌ فشل الاتصال بقاعدة البيانات!')
    console.error('   الرسالة:', error.message)
    console.error('\n💡 تأكد من:')
    console.error('   1. ملف .env موجود ويحتوي على DATABASE_URL')
    console.error('   2. DATABASE_URL صحيح (للـ MongoDB Atlas تأكد من اسم المستخدم وكلمة المرور)')
    console.error('   3. قاعدة البيانات متاحة والاتصال بالإنترنت يعمل')
    throw error
  }

  // إنشاء المستخدمين
  console.log('👤 إنشاء المستخدمين...')
  
  const hashedPassword = await bcrypt.hash('123456', 12)
  
  const admin = await prisma.user.upsert({
    where: { email: 'admin@store.com' },
    update: {},
    create: {
      email: 'admin@store.com',
      password: hashedPassword,
      name: 'مدير المتجر',
      role: 'ADMIN',
      phone: '+966501234567',
      address: 'الرياض، المملكة العربية السعودية'
    }
  })

  const user1 = await prisma.user.upsert({
    where: { email: 'ahmed@example.com' },
    update: {},
    create: {
      email: 'ahmed@example.com',
      password: hashedPassword,
      name: 'أحمد محمد',
      role: 'USER',
      phone: '+966501234568',
      address: 'جدة، المملكة العربية السعودية'
    }
  })

  const user2 = await prisma.user.upsert({
    where: { email: 'fatima@example.com' },
    update: {},
    create: {
      email: 'fatima@example.com',
      password: hashedPassword,
      name: 'فاطمة علي',
      role: 'USER',
      phone: '+966501234569',
      address: 'الدمام، المملكة العربية السعودية'
    }
  })

  console.log('✅ تم إنشاء المستخدمين بنجاح')

  // إنشاء المنتجات
  console.log('📦 إنشاء المنتجات...')
  
  const products = [
    {
      name: 'آيفون 15 برو',
      description: 'أحدث إصدار من آيفون مع كاميرا محسنة ومعالج A17 Pro',
      price: 4999,
      category: 'إلكترونيات',
      stock: 50,
      image: '/placeholder-product.jpg'
    },
    {
      name: 'سامسونج جالاكسي S24',
      description: 'هاتف ذكي متطور مع شاشة ديناميكية وذكاء اصطناعي',
      price: 3999,
      category: 'إلكترونيات',
      stock: 30,
      image: '/placeholder-product.jpg'
    },
    {
      name: 'ماك بوك برو M3',
      description: 'لابتوب احترافي مع معالج M3 وأداء استثنائي',
      price: 8999,
      category: 'إلكترونيات',
      stock: 15,
      image: '/placeholder-product.jpg'
    },
    {
      name: 'قميص قطني كلاسيكي',
      description: 'قميص قطني ناعم ومريح للاستخدام اليومي',
      price: 89,
      category: 'ملابس',
      stock: 100,
      image: '/placeholder-product.jpg'
    },
    {
      name: 'جينز أزرق داكن',
      description: 'بنطلون جينز عالي الجودة بتصميم عصري',
      price: 199,
      category: 'ملابس',
      stock: 75,
      image: '/placeholder-product.jpg'
    },
    {
      name: 'حذاء رياضي أبيض',
      description: 'حذاء رياضي مريح للجري والمشي اليومي',
      price: 299,
      category: 'أحذية',
      stock: 60,
      image: '/placeholder-product.jpg'
    },
    {
      name: 'حقيبة سفر كبيرة',
      description: 'حقيبة سفر متينة بسعة كبيرة للسفر الطويل',
      price: 399,
      category: 'إكسسوارات',
      stock: 25,
      image: '/placeholder-product.jpg'
    },
    {
      name: 'ساعة ذكية',
      description: 'ساعة ذكية مع تتبع اللياقة البدنية وإشعارات الهاتف',
      price: 599,
      category: 'إلكترونيات',
      stock: 40,
      image: '/placeholder-product.jpg'
    },
    {
      name: 'كتاب تطوير الويب',
      description: 'كتاب شامل لتعلم تطوير المواقع والتطبيقات',
      price: 149,
      category: 'كتب',
      stock: 80,
      image: '/placeholder-product.jpg'
    },
    {
      name: 'مقعد مكتب مريح',
      description: 'مقعد مكتب ergonomic مع دعم للظهر والرقبة',
      price: 799,
      category: 'أثاث',
      stock: 20,
      image: '/placeholder-product.jpg'
    },
    {
      name: 'طاولة طعام خشبية',
      description: 'طاولة طعام أنيقة من الخشب الطبيعي',
      price: 1299,
      category: 'أثاث',
      stock: 10,
      image: '/placeholder-product.jpg'
    },
    {
      name: 'مجموعة أدوات المطبخ',
      description: 'مجموعة شاملة من أدوات المطبخ عالية الجودة',
      price: 199,
      category: 'مطبخ',
      stock: 35,
      image: '/placeholder-product.jpg'
    },
    {
      name: 'مشروب طاقة',
      description: 'مشروب طاقة طبيعي بدون سكر مضاف',
      price: 12,
      category: 'مشروبات',
      stock: 200,
      image: '/placeholder-product.jpg'
    },
    {
      name: 'شوكولاتة داكنة',
      description: 'شوكولاتة داكنة عضوية بنسبة 85% كاكاو',
      price: 25,
      category: 'حلويات',
      stock: 150,
      image: '/placeholder-product.jpg'
    },
    {
      name: 'عطر رجالي فاخر',
      description: 'عطر رجالي أنيق برائحة خشبية دافئة',
      price: 299,
      category: 'عطور',
      stock: 45,
      image: '/placeholder-product.jpg'
    }
  ]

  // حذف المنتجات الموجودة أولاً لتجنب التكرار
  await prisma.product.deleteMany({})
  
  for (const productData of products) {
    await prisma.product.create({
      data: productData
    })
  }

  console.log('✅ تم إنشاء المنتجات بنجاح')

  // إنشاء الطلبات
  console.log('🛒 إنشاء الطلبات...')
  
  const createdProducts = await prisma.product.findMany()
  
  // طلب للمستخدم الأول
  const order1 = await prisma.order.create({
    data: {
      userId: user1.id,
      status: 'CONFIRMED',
      total: 5298, // آيفون + قميص + حذاء
      orderItems: {
        create: [
          {
            productId: createdProducts[0].id, // آيفون
            quantity: 1,
            price: 4999
          },
          {
            productId: createdProducts[3].id, // قميص
            quantity: 1,
            price: 89
          },
          {
            productId: createdProducts[5].id, // حذاء
            quantity: 1,
            price: 299
          }
        ]
      }
    }
  })

  // طلب للمستخدم الثاني
  const order2 = await prisma.order.create({
    data: {
      userId: user2.id,
      status: 'SHIPPED',
      total: 1198, // جينز + حقيبة + كتاب
      orderItems: {
        create: [
          {
            productId: createdProducts[4].id, // جينز
            quantity: 1,
            price: 199
          },
          {
            productId: createdProducts[6].id, // حقيبة
            quantity: 1,
            price: 399
          },
          {
            productId: createdProducts[8].id, // كتاب
            quantity: 1,
            price: 149
          },
          {
            productId: createdProducts[13].id, // شوكولاتة
            quantity: 2,
            price: 25
          }
        ]
      }
    }
  })

  // طلب معلق للمستخدم الأول
  const order3 = await prisma.order.create({
    data: {
      userId: user1.id,
      status: 'PENDING',
      total: 1598, // ساعة + مقعد
      orderItems: {
        create: [
          {
            productId: createdProducts[7].id, // ساعة ذكية
            quantity: 1,
            price: 599
          },
          {
            productId: createdProducts[9].id, // مقعد مكتب
            quantity: 1,
            price: 799
          }
        ]
      }
    }
  })

  console.log('✅ تم إنشاء الطلبات بنجاح')

  console.log('\n' + '='.repeat(60))
  console.log('🎉 تم الانتهاء من إضافة جميع البيانات التجريبية!')
  console.log('\n📊 ملخص البيانات المُضافة:')
  console.log(`👥 المستخدمون: ${await prisma.user.count()}`)
  console.log(`📦 المنتجات: ${await prisma.product.count()}`)
  console.log(`🛒 الطلبات: ${await prisma.order.count()}`)
  console.log(`📋 عناصر الطلبات: ${await prisma.orderItem.count()}`)
  
  console.log('\n🔑 بيانات تسجيل الدخول:')
  console.log('   👨‍💼 مدير: admin@store.com / 123456')
  console.log('   👤 مستخدم: ahmed@example.com / 123456')
  console.log('   👤 مستخدم: fatima@example.com / 123456')
  console.log('\n' + '='.repeat(60))
  }

main()
  .catch((e) => {
    console.error('\n' + '='.repeat(60))
    console.error('❌ خطأ في إضافة البيانات:')
    if (e.message?.includes('AuthenticationFailed') || e.message?.includes('bad auth')) {
      console.error('\n🔐 مشكلة في المصادقة مع MongoDB:')
      console.error('   - تحقق من اسم المستخدم وكلمة المرور في DATABASE_URL')
      console.error('   - تأكد من أن المستخدم لديه صلاحيات القراءة والكتابة')
      console.error('   - للـ MongoDB Atlas: تأكد من أن IP مسموح به في Network Access')
    } else if (e.message?.includes('DATABASE_URL')) {
      console.error('\n🔗 مشكلة في رابط الاتصال:')
      console.error('   - تأكد من وجود DATABASE_URL في ملف .env')
      console.error('   - تأكد من صحة تنسيق رابط MongoDB')
    } else {
      console.error('   الرسالة:', e.message)
      console.error('   الكود:', e.code)
    }
    console.error('\n' + '='.repeat(60))
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
    console.log('\n🔌 تم إغلاق الاتصال بقاعدة البيانات')
  })
