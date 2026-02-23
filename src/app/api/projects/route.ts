// Projects API - CRUD Operations
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'

// GET - List projects or get specific project
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const projectId = searchParams.get('id')
    const status = searchParams.get('status')

    if (projectId) {
      const project = await prisma.project.findFirst({
        where: {
          id: projectId,
          companyId: session.user.companyId
        },
        include: {
          rackingProfile: true,
          piles: {
            select: { id: true, pileId: true, status: true }
          },
          _count: {
            select: { inspections: true, refusals: true, piles: true }
          }
        }
      })
      return NextResponse.json(project)
    }

    const where: any = { companyId: session.user.companyId }
    if (status) where.status = status

    const projects = await prisma.project.findMany({
      where,
      include: {
        rackingProfile: true,
        _count: {
          select: { inspections: true, refusals: true, piles: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json(projects)
  } catch (error) {
    console.error('Error fetching projects:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST - Create new project
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const {
      name, location, client, totalPiles, startDate, plannedEndDate,
      dailyTarget, rackingProfileId, weatherLat, weatherLng
    } = body

    if (!name || !location || !client) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const project = await prisma.project.create({
      data: {
        name,
        location,
        client,
        totalPiles: totalPiles || 0,
        startDate: startDate ? new Date(startDate) : new Date(),
        plannedEndDate: plannedEndDate ? new Date(plannedEndDate) : new Date(),
        dailyTarget: dailyTarget || 35,
        rackingProfileId,
        weatherLat,
        weatherLng,
        companyId: session.user.companyId,
        projectManagerId: session.user.id,
      }
    })

    return NextResponse.json(project, { status: 201 })
  } catch (error) {
    console.error('Error creating project:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PUT - Update project
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { id, ...data } = body

    // Verify ownership
    const existing = await prisma.project.findFirst({
      where: { id, companyId: session.user.companyId }
    })
    if (!existing) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 })
    }

    const project = await prisma.project.update({
      where: { id },
      data: {
        ...data,
        startDate: data.startDate ? new Date(data.startDate) : undefined,
        plannedEndDate: data.plannedEndDate ? new Date(data.plannedEndDate) : undefined,
        actualEndDate: data.actualEndDate ? new Date(data.actualEndDate) : undefined,
      }
    })

    return NextResponse.json(project)
  } catch (error) {
    console.error('Error updating project:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE - Delete project (soft delete by archiving)
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'Project ID required' }, { status: 400 })
    }

    // Verify ownership
    const existing = await prisma.project.findFirst({
      where: { id, companyId: session.user.companyId }
    })
    if (!existing) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 })
    }

    const project = await prisma.project.update({
      where: { id },
      data: { status: 'ARCHIVED' }
    })

    return NextResponse.json(project)
  } catch (error) {
    console.error('Error deleting project:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
