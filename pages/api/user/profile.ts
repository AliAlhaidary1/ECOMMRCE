import { NextApiRequest, NextApiResponse } from 'next'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../../lib/auth'
import { prisma } from '../../../lib/prisma'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions)

  if (!session) {
    return res.status(401).json({ message: 'غير مصرح' })
  }

  if (req.method === 'GET') {
  try {
    console.log(`👤 Fetching profile for user: ${session.user.id}`)
    
    const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          address: true,
          role: true
        }
      })

      if (!user) {
        return res.status(404).json({ message: 'المستخدم غير موجود' })
      }

      res.status(200).json(user)
    } catch (error) {
      console.error('Error fetching user profile:', error)
      res.status(500).json({ message: 'حدث خطأ في الخادم' })
    }
  } else if (req.method === 'PUT') {
    try {
      const { name, email, phone, address } = req.body

      const user = await prisma.user.update({
        where: { id: session.user.id },
        data: {
          name,
          email,
          phone,
          address
        },
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          address: true,
          role: true
        }
      })

      res.status(200).json(user)
    } catch (error) {
      console.error('Error updating user profile:', error)
      res.status(500).json({ message: 'حدث خطأ في الخادم' })
    }
  } else {
    res.setHeader('Allow', ['GET', 'PUT'])
    res.status(405).json({ message: 'Method not allowed' })
  }
}

