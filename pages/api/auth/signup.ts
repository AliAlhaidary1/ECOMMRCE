import { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '../../../lib/prisma'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  try {
    const { name, email, password, phone, address } = req.body

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      return res.status(400).json({ message: 'المستخدم موجود بالفعل' })
    }

    // Create new user
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password,
        phone,
        address,
        role: 'USER'
      }
    })

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user

    res.status(201).json({
      message: 'تم إنشاء الحساب بنجاح',
      user: userWithoutPassword
    })
  } catch (error) {
    console.error('Signup error:', error)
    res.status(500).json({ message: 'حدث خطأ في الخادم' })
  }
}

