# 🚀 دليل النشر على Vercel (مجاني)

## 📋 المتطلبات

1. حساب على **Vercel**: https://vercel.com/signup
2. GitHub أو GitLab أو Bitbucket لتخزين الكود
3. Vercel CLI (اختياري)

---

## ⚡ الطريقة السريعة (من المتصفح)

### 1️⃣ اربط مشروعك بـ GitHub

```powershell
# تأكد من أن كل شيء موجود في Git
git add .
git commit -m "Ready for Vercel deployment"
git push origin main
```

### 2️⃣ اربط Vercel مع GitHub

1. اذهب إلى https://vercel.com/dashboard
2. اضغط **"Add New Project"**
3. اربط حساب **GitHub** الخاص بك
4. اختر مستودع **ECOMMRCE**
5. اضغط **"Import"**

### 3️⃣ إعداد قاعدة البيانات (Vercel Postgres - مجاني)

في لوحة Vercel:

1. اذهب إلى **Storage**
2. اضغط **"Create"** ثم اختر **"Postgres"**
3. اختر **"Hobby"** (المستوى المجاني)
4. سيتم إنشاء قاعدة البيانات تلقائياً

### 4️⃣ إضافة متغيرات البيئة

في إعدادات المشروع على Vercel:

اضغط على **Environment Variables** وأضف:

```env
DATABASE_URL=your_postgres_connection_string_from_vercel
NEXTAUTH_URL=https://your-app.vercel.app
NEXTAUTH_SECRET=generate-random-secret-here
```

**لتوليد SECRET:**
```powershell
openssl rand -base64 32
```

### 5️⃣ تحديث schema.prisma

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

### 6️⃣ Deploy!

1. اضغط **"Deploy"**
2. انتظر حتى يكتمل البناء
3. سيتم إنشاء URL مثل: `https://your-app.vercel.app`

---

## 💻 الطريقة الثانية (من CLI)

### 1️⃣ تثبيت Vercel CLI

```powershell
npm i -g vercel
```

### 2️⃣ تسجيل الدخول

```powershell
vercel login
```

### 3️⃣ النشر

```powershell
# انتقل للمشروع
cd D:\myproject\ECOMMRCE

# النشر الأول
vercel

# للمستقبل
vercel --prod
```

---

## 📝 الأوامر الكاملة

### الخطوة 1: إعداد Git

```powershell
cd D:\myproject\ECOMMRCE

# إذا لم تكن في Git
git init
git add .
git commit -m "Initial commit"

# اربط بـ GitHub
git remote add origin YOUR_GITHUB_REPO_URL
git push -u origin main
```

### الخطوة 2: تحديث schema.prisma

الملف موجود: `prisma/schema.postgresql.prisma`

انسخ محتواه إلى `prisma/schema.prisma`

أو ببساطة:

```powershell
# في prisma/schema.prisma، غيّر:
# من: provider = "sqlite"
# إلى: provider = "postgresql"
```

### الخطوة 3: تحديث next.config.js

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.vercel.app',
      },
    ],
  },
}

module.exports = nextConfig
```

### الخطوة 4: إنشاء قاعدة البيانات على Vercel

1. Dashboard > Storage > Create > Postgres
2. انسخ **Connection String**

### الخطوة 5: إضافة Environment Variables

في Vercel Dashboard:
- `DATABASE_URL` = connection string من Vercel
- `NEXTAUTH_URL` = سيتم ملؤه تلقائياً
- `NEXTAUTH_SECRET` = `openssl rand -base64 32`

### الخطوة 6: Deploy!

```powershell
# من PowerShell
vercel --prod

# أو من لوحة Vercel اضغط Deploy
```

---

## 🎯 بسرعة! (الأوامر كاملة)

```powershell
# 1. انتقل للمشروع
cd D:\myproject\ECOMMRCE

# 2. تأكد من أن كل شيء محفوظ
git add .
git commit -m "Ready for Vercel"
git push

# 3. انشر على Vercel
vercel --prod
```

---

## ✅ بعد النشر

**URL المشروع:**
```
https://your-project.vercel.app
```

**معلومات تسجيل الدخول الافتراضية:**
- **Admin**: `admin@store.com` / `123456`
- **User**: `ahmed@example.com` / `123456`

---

## 🐛 حل المشاكل

### الخطأ: "Cannot connect to database"

**الحل:**
```powershell
# تأكد من إضافة DATABASE_URL في Environment Variables
# في Vercel Dashboard: Settings > Environment Variables
```

### الخطأ: "Module not found @prisma/client"

**الحل:**
```powershell
# في package.json أضف:
"postinstall": "prisma generate"

# ثم: pnpm install
```

### الخطأ: الصور لا تعمل

**الحل:**
```powershell
# يجب رفع الصور إلى Vercel Blob Storage أو Cloudinary
# Vercel Blob مجاني في الخطة Hobby
```

### الخطأ: Seed لا يعمل

**الحل:**
```powershell
# Vercel لا ينفذ seed تلقائياً
# اذهب إلى Vercel Dashboard > Terminal
# أو انشر مع custom script
```

---

## 🔄 Seed البيانات بعد النشر

```powershell
# بعد النشر، في Vercel Dashboard
# اذهب إلى Deployment > Functions > Terminal

# ثم:
pnpm prisma db push
pnpm db:seed
```

---

## 📝 إعدادات إضافية

### إعداد Custom Domain

1. Vercel Dashboard > Your Project > Settings > Domains
2. أضف الدومين الخاص بك

### إعداد Environment للمنتج

تأكد من إضافة متغيرات البيئة للـ Production:
- Settings > Environment Variables
- حدد Environment: Production, Preview, Development

---

## 🎉 جاهز!

مشروعك الآن يعمل على Vercel مجاناً!

**URL:** `https://your-app.vercel.app`

---

## 📞 ملاحظات مهمة

1. **Plan Hobby مجاني 100%** - للاستخدام الشخصي
2. **Postgres مجاني** - حتى 256 MB في الخطة المجانية
3. **Bandwidth محدود** - 100 GB/شهر مجاناً
4. **Functions** - 100 GB-hours/شهر مجاناً

---

## 🚀 الميزات المجانية في Vercel

✅ **Hosting** - غير محدود
✅ **SSL** - مجاني تلقائياً
✅ **CDN** - سريع جداً عالمياً
✅ **Deployments** - غير محدود
✅ **Custom Domains** - مجاني
✅ **Postgres Database** - 256 MB مجاناً
✅ **Edge Functions** - للتحسينات

---

## 📚 المصادر

- Vercel Docs: https://vercel.com/docs
- Next.js Deploy: https://nextjs.org/docs/deployment
- Prisma + Vercel: https://www.prisma.io/docs/guides/deployment/deployment-guides/deploying-to-vercel

---

## 🎯 الخطوات المختصرة

1. ✅ اربط GitHub مع Vercel
2. ✅ أنشئ Vercel Postgres
3. ✅ أضف Environment Variables
4. ✅ غيّر schema.prisma إلى postgresql
5. ✅ Deploy!

**انتهى! 🎉**

