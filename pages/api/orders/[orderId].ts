import { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '../../../lib/prisma'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { orderId } = req.query

  if (req.method === 'PATCH' || req.method === 'PUT') {
    try {
      const { status } = req.body

      const order = await prisma.order.update({
        where: { id: orderId as string },
        data: { status }
      })

      res.status(200).json(order)
    } catch (error) {
      console.error('Error updating order:', error)
      res.status(500).json({ message: 'حدث خطأ في الخادم' })
    }
  } else if (req.method === 'GET') {
    try {
      const order = await prisma.order.findUnique({
        where: { id: orderId as string },
        include: {
          user: true,
          orderItems: {
            include: {
              product: true
            }
          }
        }
      })

      if (!order) {
        return res.status(404).json({ message: 'الطلب غير موجود' })
      }

      res.status(200).json(order)
    } catch (error) {
      console.error('Error fetching order:', error)
      res.status(500).json({ message: 'حدث خطأ في الخادم' })
    }
  } else {
    res.setHeader('Allow', ['GET', 'PATCH', 'PUT'])
    res.status(405).json({ message: 'Method not allowed' })
  }
}

