import { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '../../../lib/prisma'

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
      const { name, description, price, image, category, stock } = req.body

      const product = await prisma.product.create({
        data: {
          name,
          description,
          price: parseFloat(price),
          image,
          category,
          stock: parseInt(stock)
        }
      })

      res.status(201).json(product)
    } catch (error) {
      console.error('Error creating product:', error)
      res.status(500).json({ message: 'حدث خطأ في الخادم' })
    }
  } else {
    res.setHeader('Allow', ['GET', 'POST'])
    res.status(405).json({ message: 'Method not allowed' })
  }
}

