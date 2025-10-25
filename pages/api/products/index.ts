import { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '../../../lib/prisma'
import formidable from 'formidable'
import fs from 'fs'
import path from 'path'

export const config = {
  api: {
    bodyParser: false,
  },
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      const products = await prisma.product.findMany({
        where: {
          isActive: true
        },
        orderBy: {
          createdAt: 'desc'
        }
      })

      res.status(200).json(products)
    } catch (error) {
      console.error('Error fetching products:', error)
      res.status(500).json({ message: 'حدث خطأ في الخادم' })
    }
  } else if (req.method === 'POST') {
    try {
      const form = formidable({
        uploadDir: './public/uploads',
        keepExtensions: true,
        maxFileSize: 5 * 1024 * 1024, // 5MB
      })

      const [fields, files] = await form.parse(req)
      
      const name = fields.name?.[0]
      const description = fields.description?.[0]
      const price = fields.price?.[0]
      const stock = fields.stock?.[0]
      const imageFile = files.image?.[0]

      console.log('Received data:', { name, description, price, stock, imageFile })

      if (!name || !description || !price || !stock) {
        console.log('Missing required fields')
        return res.status(400).json({ message: 'جميع الحقول مطلوبة' })
      }

      let imagePath = '/placeholder-product.jpg'
      
      if (imageFile) {
        try {
          // إنشاء مجلد uploads إذا لم يكن موجوداً
          const uploadDir = './public/uploads'
          if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true })
          }

          // إنشاء اسم فريد للملف مع التاريخ والوقت
          const now = new Date()
          const timestamp = now.getFullYear() + 
            String(now.getMonth() + 1).padStart(2, '0') + 
            String(now.getDate()).padStart(2, '0') + '_' +
            String(now.getHours()).padStart(2, '0') + 
            String(now.getMinutes()).padStart(2, '0') + 
            String(now.getSeconds()).padStart(2, '0')
          
          const fileExtension = path.extname(imageFile.originalFilename || '')
          const fileName = `${timestamp}${fileExtension}`
          const newPath = path.join(uploadDir, fileName)
          
          console.log('Moving file from:', imageFile.filepath, 'to:', newPath)
          
          // نقل الملف إلى المجلد المطلوب
          fs.renameSync(imageFile.filepath, newPath)
          imagePath = `/uploads/${fileName}`
          
          console.log('Image saved to:', imagePath)
        } catch (fileError) {
          console.error('Error saving image:', fileError)
          // استمر بدون صورة إذا فشل حفظ الصورة
        }
      }

      console.log('Creating product with:', { name, description, price: parseFloat(price), image: imagePath, category: 'عام', stock: parseInt(stock) })

      const product = await prisma.product.create({
        data: {
          name,
          description,
          price: parseFloat(price),
          image: imagePath,
          category: 'عام', // إضافة فئة افتراضية
          stock: parseInt(stock)
        }
      })

      console.log('Product created successfully:', product)
      res.status(201).json(product)
    } catch (error) {
      console.error('Error creating product:', error)
      res.status(500).json({ message: 'حدث خطأ في الخادم', error: error instanceof Error ? error.message : 'Unknown error' })
    }
  } else {
    res.setHeader('Allow', ['GET', 'POST'])
    res.status(405).json({ message: 'Method not allowed' })
  }
}

