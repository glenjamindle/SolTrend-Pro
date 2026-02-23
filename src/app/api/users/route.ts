// Users API - CRUD Operations
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'
import bcrypt from 'bcryptjs'

// GET - List all users (admin only) or current user
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const currentOnly = searchParams.get('current') === 'true'

    if (currentOnly) {
      const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        include: { company: true }
      })
      return NextResponse.json(user)
    }

    // Admin only - list all users in company
    if (session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const users = await prisma.user.findMany({
      where: { companyId: session.user.companyId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        phone: true,
        createdAt: true,
        lastLoginAt: true,
      }
    })

    return NextResponse.json(users)
  } catch (error) {
    console.error('Error fetching users:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST - Create new user (admin only)
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { email, password, name, role, phone } = body

    if (!email || !password || !name) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Check if user exists
    const existing = await prisma.user.findUnique({ where: { email } })
    if (existing) {
      return NextResponse.json({ error: 'Email already in use' }, { status: 400 })
    }

    const passwordHash = await bcrypt.hash(password, 12)

    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        name,
        role: role || 'INSPECTOR',
        phone,
        companyId: session.user.companyId,
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        phone: true,
        createdAt: true,
      }
    })

    return NextResponse.json(user, { status: 201 })
  } catch (error) {
    console.error('Error creating user:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
