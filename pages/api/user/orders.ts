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
    console.log(`📦 Fetching orders for user: ${session.user.id}`)
    
    const orders = await prisma.order.findMany({
        where: { userId: session.user.id },
        include: {
          orderItems: {
            include: {
              product: {
                select: {
                  id: true,
                  name: true,
                  image: true,
                  price: true
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
      console.error('Error fetching user orders:', error)
      res.status(500).json({ message: 'حدث خطأ في الخادم' })
    }
  } else {
    res.setHeader('Allow', ['GET'])
    res.status(405).json({ message: 'Method not allowed' })
  }
}

