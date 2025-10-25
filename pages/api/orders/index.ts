import { NextApiRequest, NextApiResponse } from 'next'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../../lib/auth'
import { prisma } from '../../../lib/prisma'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions)

  if (req.method === 'GET') {
    // للـ GET، يمكن للمديرين فقط رؤية جميع الطلبات
    if (!session || session.user.role !== 'ADMIN') {
      return res.status(401).json({ message: 'غير مصرح' })
    }
    
    try {
      const orders = await prisma.order.findMany({
        include: {
          user: {
            select: {
              name: true,
              email: true
            }
          },
          orderItems: {
            include: {
              product: {
                select: {
                  name: true
                }
              }
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      })

      res.status(200).json(orders)
    } catch (error) {
      console.error('Error fetching orders:', error)
      res.status(500).json({ message: 'حدث خطأ في الخادم' })
    }
  } else if (req.method === 'POST') {
    // للـ POST، يجب أن يكون المستخدم مسجل دخول
    if (!session) {
      return res.status(401).json({ message: 'غير مصرح' })
    }
    
    try {
      const { items } = req.body
      const userId = session.user.id

      // Calculate total
      let total = 0
      for (const item of items) {
        const product = await prisma.product.findUnique({
          where: { id: item.productId }
        })
        if (product) {
          total += product.price * item.quantity
        }
      }

      // Create order
      const order = await prisma.order.create({
        data: {
          userId,
          total,
          orderItems: {
            create: items.map((item: any) => ({
              productId: item.productId,
              quantity: item.quantity,
              price: item.price
            }))
          }
        },
        include: {
          user: true,
          orderItems: {
            include: {
              product: true
            }
          }
        }
      })

      // Update product stock
      for (const item of items) {
        await prisma.product.update({
          where: { id: item.productId },
          data: {
            stock: {
              decrement: item.quantity
            }
          }
        })
      }

      res.status(201).json(order)
    } catch (error) {
      console.error('Error creating order:', error)
      res.status(500).json({ message: 'حدث خطأ في الخادم' })
    }
  } else {
    res.setHeader('Allow', ['GET', 'POST'])
    res.status(405).json({ message: 'Method not allowed' })
  }
}

