import { readFileSync, writeFileSync, existsSync } from 'fs'
import { join } from 'path'

const envPath = join(process.cwd(), '.env')

console.log('🔧 إصلاح ترميز كلمة المرور في DATABASE_URL...')
console.log('='.repeat(60))

if (!existsSync(envPath)) {
  console.error('❌ ملف .env غير موجود!')
  process.exit(1)
}

const password = 'sn74gudj5vKUG5nI'
const encodedPassword = encodeURIComponent(password)

console.log('\n📋 كلمة المرور:')
console.log(`   الأصلية: ${password}`)
console.log(`   المشفرة: ${encodedPassword}`)

let envContent = readFileSync(envPath, 'utf-8')
const lines = envContent.split('\n')

let updated = false

for (let i = 0; i < lines.length; i++) {
  const line = lines[i]
  if (line.trim().startsWith('DATABASE_URL=') || line.trim().startsWith('DATABASE_URL =')) {
    // استخراج DATABASE_URL الحالي
    const match = line.match(/DATABASE_URL\s*=\s*["']?([^"'\n]+)["']?/)
    if (match) {
      const currentUrl = match[1]
      
      // التحقق إذا كانت كلمة المرور مشفرة
      if (currentUrl.includes(password) && !currentUrl.includes(encodedPassword)) {
        // استبدال كلمة المرور غير المشفرة بالمشفرة
        const newUrl = currentUrl.replace(`:${password}@`, `:${encodedPassword}@`)
        lines[i] = line.replace(currentUrl, newUrl)
        updated = true
        console.log('\n✅ تم تحديث DATABASE_URL')
        console.log(`   قبل: ${currentUrl.substring(0, 50)}...`)
        console.log(`   بعد: ${newUrl.substring(0, 50)}...`)
      } else if (currentUrl.includes(encodedPassword)) {
        console.log('\n✅ كلمة المرور مشفرة بالفعل')
      } else {
        // إعادة بناء DATABASE_URL بالكامل
        const dbName = 'ecommerce_abd'
        const username = 'alhaidaryali775_db_user'
        const cluster = 'cluster0.8is7bri.mongodb.net'
        const newUrl = `mongodb+srv://${username}:${encodedPassword}@${cluster}/${dbName}?retryWrites=true&w=majority`
        lines[i] = `DATABASE_URL="${newUrl}"`
        updated = true
        console.log('\n✅ تم إعادة بناء DATABASE_URL')
      }
    }
  }
}

if (updated) {
  writeFileSync(envPath, lines.join('\n'), 'utf-8')
  console.log('\n✅ تم حفظ التغييرات في ملف .env')
  console.log('\n⚠️ مهم: يجب إعادة تشغيل السيرفر (npm run dev)')
} else {
  console.log('\n⚠️ لم يتم العثور على DATABASE_URL أو كان مشفراً بالفعل')
}

console.log('\n' + '='.repeat(60))

