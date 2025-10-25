# متجر إلكتروني بسيط - E-Commerce Store

متجر إلكتروني بسيط وجميل مبني باستخدام Next.js مع نظام إدارة شامل للمستخدمين والمنتجات.

## المميزات

### للمستخدمين العاديين:
- ✅ عرض المنتجات مع إمكانية البحث والتصفية
- ✅ تسجيل الدخول وإنشاء حساب جديد
- ✅ إدارة الملف الشخصي وتحديث البيانات
- ✅ عرض تاريخ الطلبات وحالة كل طلب
- ✅ واجهة مستخدم جميلة ومتجاوبة

### للإدمن:
- ✅ لوحة تحكم شاملة لإدارة المنتجات
- ✅ إضافة وتعديل وحذف المنتجات
- ✅ إدارة الطلبات وتغيير حالة الطلبات
- ✅ إحصائيات مفصلة عن المبيعات والطلبات
- ✅ عرض تفاصيل العملاء والطلبات

## التقنيات المستخدمة

- **Frontend & Backend**: Next.js 14
- **Database**: SQLite مع Prisma ORM
- **Authentication**: NextAuth.js
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Forms**: React Hook Form
- **Notifications**: React Hot Toast
- **Language**: TypeScript

## التثبيت والتشغيل

### 1. تثبيت التبعيات
```bash
npm install
```

### 2. إعداد قاعدة البيانات
```bash
# إنشاء ملف البيئة
cp env.example .env.local

# تحديث ملف البيئة بالقيم الصحيحة
# NEXTAUTH_URL=http://localhost:3000
# NEXTAUTH_SECRET=your-secret-key-here
# DATABASE_URL="file:./dev.db"

# إنشاء قاعدة البيانات
npx prisma db push

# إنشاء عميل Prisma
npx prisma generate
```

### 3. إنشاء مستخدم إدمن
```bash
# تشغيل Prisma Studio لإضافة مستخدم إدمن
npx prisma studio
```

أو يمكنك إضافة مستخدم إدمن مباشرة من قاعدة البيانات:
```sql
INSERT INTO User (id, email, password, name, role, createdAt, updatedAt) 
VALUES ('admin-id', 'admin@example.com', 'hashed-password', 'Admin User', 'ADMIN', datetime('now'), datetime('now'));
```

### 4. تشغيل المشروع
```bash
npm run dev
```

المشروع سيعمل على: http://localhost:3000

## هيكل المشروع

```
├── components/          # مكونات React
├── lib/                # مكتبات مساعدة
│   ├── auth.ts         # إعداد NextAuth
│   └── prisma.ts       # إعداد Prisma
├── pages/              # صفحات Next.js
│   ├── api/            # API Routes
│   ├── auth/           # صفحات المصادقة
│   ├── admin/          # لوحة تحكم الإدمن
│   └── profile.tsx     # صفحة الملف الشخصي
├── prisma/             # مخطط قاعدة البيانات
├── styles/             # ملفات CSS
├── types/              # تعريفات TypeScript
└── public/             # ملفات ثابتة
```

## الصفحات المتاحة

### للمستخدمين:
- `/` - الصفحة الرئيسية (عرض المنتجات)
- `/auth/signin` - تسجيل الدخول
- `/auth/signup` - إنشاء حساب جديد
- `/profile` - إدارة الملف الشخصي

### للإدمن:
- `/admin` - لوحة تحكم الإدمن

## API Endpoints

### المنتجات:
- `GET /api/products` - جلب جميع المنتجات
- `POST /api/products` - إضافة منتج جديد
- `PUT /api/products/[id]` - تحديث منتج
- `DELETE /api/products/[id]` - حذف منتج

### الطلبات:
- `GET /api/orders` - جلب جميع الطلبات (للإدمن)
- `POST /api/orders` - إنشاء طلب جديد
- `PATCH /api/orders/[id]` - تحديث حالة الطلب

### المستخدمين:
- `GET /api/user/profile` - جلب بيانات المستخدم
- `PUT /api/user/profile` - تحديث بيانات المستخدم
- `GET /api/user/orders` - جلب طلبات المستخدم

## التخصيص

### تغيير الألوان:
يمكنك تعديل الألوان من ملف `tailwind.config.js`:

```javascript
colors: {
  primary: {
    // ألوانك المخصصة
  }
}
```

### إضافة فئات منتجات جديدة:
يمكنك إضافة فئات جديدة مباشرة عند إضافة المنتجات من لوحة تحكم الإدمن.

## الدعم

إذا واجهت أي مشاكل أو لديك اقتراحات، يرجى فتح issue في المستودع.

## الترخيص

هذا المشروع مفتوح المصدر ومتاح للاستخدام الشخصي والتجاري.