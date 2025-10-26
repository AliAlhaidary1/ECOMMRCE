# 🚀 النشر على Vercel في 5 دقائق!

## ⚡ الأوامر السريعة

```powershell
# 1. تأكد من تحديث schema.prisma لـ PostgreSQL
# انسخ محتوى prisma/schema.postgresql.prisma إلى prisma/schema.prisma

# 2. اربط بـ GitHub
git add .
git commit -m "Ready for Vercel"
git push

# 3. انشر على Vercel
npm i -g vercel
vercel login
vercel --prod
```

---

## 📋 الخطوات بالتفصيل

### 1. تحديث Schema

افتح `prisma/schema.prisma` وغير إلى:

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

### 2. إنشاء Vercel Postgres

1. https://vercel.com/dashboard
2. Storage > Create > Postgres
3. Hobby Plan (مجاني)
4. انسخ Connection String

### 3. إضافة Environment Variables

في Vercel Dashboard:

```
DATABASE_URL = your_postgres_connection_string
NEXTAUTH_URL = https://your-app.vercel.app (سيتم ملؤه تلقائياً)
NEXTAUTH_SECRET = generate-with-openssl-rand-base64-32
```

### 4. Deploy!

```powershell
vercel --prod
```

---

## ✅ بعد النشر

**معلومات تسجيل الدخول:**
- Admin: `admin@store.com` / `123456`
- User: `ahmed@example.com` / `123456`

---

## 🐛 مشكلة Seed؟

بعد النشر، اذهب إلى Vercel Terminal:

```powershell
pnpm prisma db push
pnpm db:seed
```

---

## 📚 التفاصيل الكاملة

راجع `VERCEL_DEPLOY.md` للحصول على دليل مفصل!

