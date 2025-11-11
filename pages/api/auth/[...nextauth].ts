import { NextApiRequest, NextApiResponse } from "next"
import NextAuth from "next-auth"
import { authOptions } from "../../../lib/auth"

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    return await NextAuth(req, res, authOptions)
  } catch (error) {
    console.error('❌ NextAuth error:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    console.error('Error details:', errorMessage)
    return res.status(500).json({ 
      message: 'حدث خطأ في المصادقة',
      error: process.env.NODE_ENV === 'development' ? errorMessage : undefined
    })
  }
}

