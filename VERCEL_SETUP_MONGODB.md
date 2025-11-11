# 🚀 إعداد MongoDB على Vercel

## ✅ الخطوات الكاملة

### 1️⃣ إنشاء ملف .env

أنشئ ملف `.env` في جذر المشروع:

```env
# Environment Variables
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key-here

# Database - MongoDB Connection String
DATABASE_URL="mongodb://localhost:27017/ecommerce"
```

> **ملاحظة**: للمحلي، يمكنك استخدام MongoDB محلي أو MongoDB Atlas (مجاني)

---

### 2️⃣ إعداد MongoDB

#### أ. MongoDB Atlas (مجاني - موصى به)

1. اذهب إلى: https://www.mongodb.com/cloud/atlas
2. سجل حساب مجاني
3. أنشئ Cluster جديد (اختر **FREE** M0)
4. أنشئ Database User:
   - Username: `admin`
   - Password: (اختر كلمة مرور قوية)
5. Network Access:
   - Add IP Address: `0.0.0.0/0` (للسماح من أي مكان)
6. انسخ **Connection String**:
   ```
   mongodb+srv://admin:<password>@cluster0.xxxxx.mongodb.net/ecommerce?retryWrites=true&w=majority
   ```
7. استبدل `<password>` بكلمة المرور

#### ب. MongoDB محلي (اختياري)

```powershell
# تثبيت MongoDB (Windows)
# قم بتحميل MongoDB من: https://www.mongodb.com/try/download/community

# أو استخدم Docker
docker run -d -p 27017:27017 --name mongodb mongo:latest
```

---

### 3️⃣ إعداد Prisma

بعد إنشاء ملف `.env` مع DATABASE_URL الصحيح:

```powershell
# توليد Prisma Client
pnpm db:generate

# Push Schema إلى MongoDB (MongoDB لا يستخدم migrations)
pnpm db:push

# Seed البيانات التجريبية
pnpm db:seed
```

> **ملاحظة**: MongoDB لا يستخدم `migrate`، بل `db push` فقط!

---

### 4️⃣ نشر على Vercel

#### أ. إعداد Vercel MongoDB (أو MongoDB Atlas)

**الخيار 1: MongoDB Atlas (موصى به)**
- استخدم MongoDB Atlas المجاني
- انسخ Connection String

**الخيار 2: Vercel Storage**
1. اذهب إلى: https://vercel.com/dashboard
2. Storage > Create > MongoDB
3. اختر **Hobby** (مجاني)
4. انسخ **Connection String**

#### ب. إضافة Environment Variables

في Vercel Dashboard > Project Settings > Environment Variables:

```env
DATABASE_URL=your_mongodb_connection_string
NEXTAUTH_URL=https://your-app.vercel.app
NEXTAUTH_SECRET=generate-random-secret-here
```

**لتوليد SECRET:**
```powershell
openssl rand -base64 32
```

#### ج. نشر المشروع

```powershell
# الطريقة 1: من CLI
npm i -g vercel
vercel login
vercel --prod

# الطريقة 2: من GitHub
git add .
git commit -m "Ready for Vercel with MongoDB"
git push
# ثم Deploy من Vercel Dashboard
```

---

## 📋 الأوامر الكاملة

```powershell
# 1. إنشاء ملف .env (إذا لم يكن موجوداً)
# قم بإنشاء .env يدوياً مع DATABASE_URL

# 2. Generate & Push
pnpm db:generate
pnpm db:push

# 3. Seed (اختياري)
pnpm db:seed

# 4. Build للتأكد
pnpm build

# 5. Deploy على Vercel
vercel --prod
```

---

## 🎯 الفرق بين MongoDB و PostgreSQL

| الميزة | PostgreSQL | MongoDB |
|--------|-----------|---------|
| Migrations | ✅ `migrate` | ❌ لا يوجد |
| Schema Push | `db push` | ✅ `db push` |
| IDs | `cuid()` | ✅ `ObjectId` |
| Text Fields | `@db.Text` | ✅ لا حاجة |

**MongoDB يستخدم:**
- `db push` فقط (لا migrations)
- `@db.ObjectId` للـ IDs
- لا حاجة لـ `@db.Text`

---

## 🐛 حل المشاكل

### الخطأ: "Error validating datasource"

**السبب**: DATABASE_URL غير صحيح

**الحل**:
- تأكد من أن `.env` موجود
- تأكد من صحة format: `mongodb+srv://user:pass@cluster.mongodb.net/dbname`
- تأكد من استبدال `<password>` في Connection String

### الخطأ: "Authentication failed"

**الحل**:
- تأكد من صحة username/password
- تأكد من إضافة IP Address في Network Access (Atlas)

### الخطأ: "Cannot connect to MongoDB"

**الحل**:
- تأكد من أن MongoDB يعمل (محلي)
- تأكد من Network Access في Atlas
- تأكد من صحة Connection String

### الخطأ: في Vercel "Schema push failed"

**الحل**:
- تأكد من أن DATABASE_URL صحيح في Vercel Environment Variables
- تأكد من أن MongoDB Atlas يسمح بالاتصال من Vercel IPs

---

## ✅ بعد النشر

1. اذهب إلى Vercel Dashboard
2. Deployments > Terminal
3. نفذ:
```powershell
pnpm prisma db push
pnpm db:seed
```

---

## 🎉 جاهز!

مشروعك الآن يعمل مع MongoDB على Vercel!

### 🔑 بيانات تسجيل الدخول (بعد Seed)

- **مدير**: `admin@store.com` / `123456`
- **مستخدم**: `ahmed@example.com` / `123456`
- **مستخدم**: `fatima@example.com` / `123456`

---

## 📚 موارد إضافية

- [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
- [Prisma MongoDB](https://www.prisma.io/docs/concepts/database-connectors/mongodb)
- [Vercel MongoDB](https://vercel.com/docs/storage/vercel-postgres)

