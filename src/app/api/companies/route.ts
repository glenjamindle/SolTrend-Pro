// Companies API - CRUD Operations
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'

// GET - Get current user's company
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const company = await prisma.company.findUnique({
      where: { id: session.user.companyId },
      include: {
        users: {
          select: { id: true, name: true, email: true, role: true }
        },
        projects: {
          where: { status: 'ACTIVE' },
          select: { id: true, name: true, status: true, health: true }
        },
        crews: true,
      }
    })

    if (!company) {
      return NextResponse.json({ error: 'Company not found' }, { status: 404 })
    }

    return NextResponse.json(company)
  } catch (error) {
    console.error('Error fetching company:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST - Create new company (registration)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, tier, adminName, adminEmail, adminPassword } = body

    if (!name || !adminName || !adminEmail || !adminPassword) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Create company with admin user
    const company = await prisma.company.create({
      data: {
        name,
        tier: tier || 'STANDARD',
        users: {
          create: {
            email: adminEmail,
            name: adminName,
            passwordHash: await require('bcryptjs').hash(adminPassword, 12),
            role: 'ADMIN',
          }
        }
      },
      include: {
        users: true
      }
    })

    return NextResponse.json(company, { status: 201 })
  } catch (error) {
    console.error('Error creating company:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PUT - Update company
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { name, logo } = body

    const company = await prisma.company.update({
      where: { id: session.user.companyId },
      data: { name, logo }
    })

    return NextResponse.json(company)
  } catch (error) {
    console.error('Error updating company:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
