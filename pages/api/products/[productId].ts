import { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '../../../lib/prisma'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { productId } = req.query

  if (req.method === 'GET') {
    try {
      const product = await prisma.product.findUnique({
        where: { id: productId as string }
      })

      if (!product) {
        res.status(404).json({ message: 'المنتج غير موجود' })
        return
      }

      res.status(200).json(product)
    } catch (error) {
      console.error('Error fetching product:', error)
      res.status(500).json({ message: 'حدث خطأ في الخادم' })
    }
  } else if (req.method === 'DELETE') {
    try {
      await prisma.product.delete({
        where: { id: productId as string }
      })

      res.status(200).json({ message: 'تم حذف المنتج بنجاح' })
    } catch (error) {
      console.error('Error deleting product:', error)
      res.status(500).json({ message: 'حدث خطأ في الخادم' })
    }
  } else if (req.method === 'PUT') {
    try {
      const { name, description, price, image, category, stock, isActive } = req.body

      const product = await prisma.product.update({
        where: { id: productId as string },
        data: {
          name,
          description,
          price: parseFloat(price),
          image,
          category,
          stock: parseInt(stock),
          isActive: isActive === 'true'
        }
      })

      res.status(200).json(product)
    } catch (error) {
      console.error('Error updating product:', error)
      res.status(500).json({ message: 'حدث خطأ في الخادم' })
    }
  } else {
    res.setHeader('Allow', ['GET', 'DELETE', 'PUT'])
    res.status(405).json({ message: 'Method not allowed' })
  }
}

