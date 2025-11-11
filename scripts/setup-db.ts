import { readFileSync, writeFileSync, existsSync } from 'fs'
import { join } from 'path'

const envPath = join(process.cwd(), '.env')

console.log('⚙️ إعداد DATABASE_URL...')
console.log('='.repeat(60))

// القيم المطلوبة
const dbName = 'ecommerce_abd'
const username = 'alhaidaryali775_db_user'
const password = 'sn74gudj5vKUG5nI'
const cluster = 'cluster0.8is7bri.mongodb.net'

// ترميز كلمة المرور لتجنب مشاكل الأحرف الخاصة
const encodedPassword = encodeURIComponent(password)
const dbUrl = `mongodb+srv://${username}:${encodedPassword}@${cluster}/${dbName}?retryWrites=true&w=majority`

console.log('\n📋 القيم المحددة:')
console.log(`   اسم قاعدة البيانات: ${dbName}`)
console.log(`   اسم المستخدم: ${username}`)
console.log(`   الكلاستر: ${cluster}`)

if (!existsSync(envPath)) {
  console.log('\n📝 إنشاء ملف .env جديد...')
  const newEnvContent = `# Environment Variables
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key-here

# Database - MongoDB Connection String
DATABASE_URL="${dbUrl}"
`
  writeFileSync(envPath, newEnvContent, 'utf-8')
  console.log('✅ تم إنشاء ملف .env')
} else {
  console.log('\n📝 تحديث ملف .env...')
  let envContent = readFileSync(envPath, 'utf-8')
  const lines = envContent.split('\n')
  
  let foundDbUrl = false
  
  // البحث عن DATABASE_URL وتحديثه
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].trim().startsWith('DATABASE_URL=') || lines[i].trim().startsWith('DATABASE_URL =')) {
      lines[i] = `DATABASE_URL="${dbUrl}"`
      foundDbUrl = true
      break
    }
  }
  
  // إذا لم يتم العثور على DATABASE_URL، أضفه في النهاية
  if (!foundDbUrl) {
    lines.push('')
    lines.push(`DATABASE_URL="${dbUrl}"`)
  }
  
  writeFileSync(envPath, lines.join('\n'), 'utf-8')
  console.log('✅ تم تحديث ملف .env')
}

console.log('\n📋 DATABASE_URL الجديد:')
console.log(`   ${dbUrl.replace(password, '****')}`)

console.log('\n' + '='.repeat(60))
console.log('\n✅ تم إعداد DATABASE_URL بنجاح!')
console.log('\n💡 يمكنك الآن تشغيل:')
console.log('   npm run db:push')

