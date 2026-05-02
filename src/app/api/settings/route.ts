import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

// GET - Fetch all settings data
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const companyId = searchParams.get('companyId')
    
    if (!companyId) {
      // Return default company if none specified
      let company = await prisma.company.findFirst()
      
      if (!company) {
        // Create default company
        company = await prisma.company.create({
          data: {
            name: 'Apex Solar Construction',
            tier: 'enterprise',
          }
        })
        
        // Create default crews
        await prisma.crew.createMany({
          data: [
            { name: 'Alpha Crew', lead: 'Marcus T.', status: 'active', workerCount: 8, companyId: company.id },
            { name: 'Beta Crew', lead: 'Elena V.', status: 'active', workerCount: 8, companyId: company.id },
            { name: 'Gamma Crew', lead: 'James K.', status: 'standby', workerCount: 8, companyId: company.id },
          ]
        })
        
        // Create default subcontractors
        await prisma.subcontractor.createMany({
          data: [
            { name: 'SolarForce Inc.', companyId: company.id },
            { name: 'PileDrivers LLC', companyId: company.id },
          ]
        })
        
        // Create default racking profiles
        await prisma.rackingProfile.createMany({
          data: [
            { 
              name: 'GameChange Solar', 
              manufacturer: 'GameChange Solar',
              pileTypes: JSON.stringify(['interior', 'exterior', 'motor', 'corner']),
              tolerances: JSON.stringify({ interior: { embedmentMin: 72, plumbNS: 1.5 }, motor: { embedmentMin: 96, plumbNS: 0.5 } }),
              companyId: company.id 
            },
            { 
              name: 'NEXTracker', 
              manufacturer: 'NEXTracker',
              pileTypes: JSON.stringify(['interior', 'exterior', 'motor', 'boundary']),
              tolerances: JSON.stringify({ interior: { embedmentMin: 78, plumbNS: 2.0 } }),
              companyId: company.id 
            },
            { 
              name: 'Array Technologies', 
              manufacturer: 'Array Technologies',
              pileTypes: JSON.stringify(['interior', 'exterior', 'motor']),
              tolerances: JSON.stringify({ interior: { embedmentMin: 72, plumbNS: 1.75 } }),
              companyId: company.id 
            },
            { 
              name: 'FTC Solar', 
              manufacturer: 'FTC Solar',
              pileTypes: JSON.stringify(['interior', 'exterior']),
              tolerances: JSON.stringify({ interior: { embedmentMin: 72, plumbNS: 2.0 } }),
              companyId: company.id 
            },
          ]
        })
        
        // Create default admin user
        await prisma.user.create({
          data: {
            email: 'admin@example.com',
            name: 'Marcus Thompson',
            password: 'admin123', // In production, use hashed password
            role: 'admin',
            companyId: company.id,
          }
        })
        
        // Create default project
        await prisma.project.create({
          data: {
            name: 'Desert Sun Solar Farm',
            location: 'Phoenix, AZ',
            status: 'active',
            health: 'green',
            totalPiles: 750,
            installedPiles: 0,
            passedInspections: 0,
            failedInspections: 0,
            refusalCount: 0,
            client: 'NextEra Energy',
            projectManager: 'Sarah K.',
            dailyTarget: 35,
            totalRows: 50,
            pilesPerRow: 30,
            companyId: company.id,
          }
        })
      }
      
      return NextResponse.json({ companyId: company.id })
    }
    
    // Fetch all data for the company
    const [company, projects, crews, subcontractors, rackingProfiles, users] = await Promise.all([
      prisma.company.findUnique({ where: { id: companyId } }),
      prisma.project.findMany({ where: { companyId }, include: { rackingProfile: true } }),
      prisma.crew.findMany({ where: { companyId }, include: { members: true } }),
      prisma.subcontractor.findMany({ where: { companyId } }),
      prisma.rackingProfile.findMany({ where: { companyId } }),
      prisma.user.findMany({ where: { companyId }, select: { id: true, email: true, name: true, role: true, crewId: true } }),
    ])
    
    return NextResponse.json({
      company,
      projects,
      crews,
      subcontractors,
      rackingProfiles: rackingProfiles.map(rp => ({
        ...rp,
        pileTypes: JSON.parse(rp.pileTypes),
        tolerances: JSON.parse(rp.tolerances),
      })),
      users,
    })
  } catch (error) {
    console.error('Error fetching settings:', error)
    return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 })
  }
}

// POST - Update settings
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { type, data, companyId } = body
    
    switch (type) {
      case 'company': {
        const company = await prisma.company.update({
          where: { id: companyId },
          data: { name: data.name, tier: data.tier }
        })
        return NextResponse.json(company)
      }
      
      case 'project': {
        if (data.id) {
          const project = await prisma.project.update({
            where: { id: data.id },
            data: {
              name: data.name,
              location: data.location,
              client: data.client,
              projectManager: data.projectManager,
              dailyTarget: data.dailyTarget,
              totalRows: data.totalRows,
              pilesPerRow: data.pilesPerRow,
              totalPiles: data.totalRows * data.pilesPerRow,
              rackingProfileId: data.rackingProfileId,
              status: data.status,
            }
          })
          return NextResponse.json(project)
        } else {
          const project = await prisma.project.create({
            data: {
              name: data.name,
              location: data.location,
              client: data.client,
              projectManager: data.projectManager,
              dailyTarget: data.dailyTarget || 35,
              totalRows: data.totalRows || 50,
              pilesPerRow: data.pilesPerRow || 30,
              totalPiles: (data.totalRows || 50) * (data.pilesPerRow || 30),
              rackingProfileId: data.rackingProfileId,
              status: data.status || 'active',
              companyId,
            }
          })
          return NextResponse.json(project)
        }
      }
      
      case 'crew': {
        if (data.id) {
          const crew = await prisma.crew.update({
            where: { id: data.id },
            data: {
              name: data.name,
              lead: data.lead,
              status: data.status,
              workerCount: data.workerCount,
            }
          })
          return NextResponse.json(crew)
        } else {
          const crew = await prisma.crew.create({
            data: {
              name: data.name,
              lead: data.lead,
              status: data.status || 'active',
              workerCount: data.workerCount || 8,
              companyId,
            }
          })
          return NextResponse.json(crew)
        }
      }
      
      case 'subcontractor': {
        if (data.id) {
          const sub = await prisma.subcontractor.update({
            where: { id: data.id },
            data: {
              name: data.name,
              contactPerson: data.contactPerson,
              phone: data.phone,
              email: data.email,
            }
          })
          return NextResponse.json(sub)
        } else {
          const sub = await prisma.subcontractor.create({
            data: {
              name: data.name,
              contactPerson: data.contactPerson,
              phone: data.phone,
              email: data.email,
              companyId,
            }
          })
          return NextResponse.json(sub)
        }
      }
      
      case 'rackingProfile': {
        const profileData = {
          name: data.name,
          manufacturer: data.manufacturer,
          pileTypes: JSON.stringify(data.pileTypes),
          tolerances: JSON.stringify(data.tolerances),
          isActive: data.isActive ?? true,
          companyId,
        }
        
        if (data.id) {
          const profile = await prisma.rackingProfile.update({
            where: { id: data.id },
            data: profileData
          })
          return NextResponse.json({ ...profile, pileTypes: data.pileTypes, tolerances: data.tolerances })
        } else {
          const profile = await prisma.rackingProfile.create({
            data: profileData
          })
          return NextResponse.json({ ...profile, pileTypes: data.pileTypes, tolerances: data.tolerances })
        }
      }
      
      case 'user': {
        if (data.id) {
          const user = await prisma.user.update({
            where: { id: data.id },
            data: {
              name: data.name,
              email: data.email,
              role: data.role,
              crewId: data.crewId,
            }
          })
          return NextResponse.json(user)
        } else {
          const user = await prisma.user.create({
            data: {
              name: data.name,
              email: data.email,
              password: data.password || 'password123',
              role: data.role || 'inspector',
              crewId: data.crewId,
              companyId,
            }
          })
          return NextResponse.json({ id: user.id, name: user.name, email: user.email, role: user.role, crewId: user.crewId })
        }
      }
      
      default:
        return NextResponse.json({ error: 'Invalid type' }, { status: 400 })
    }
  } catch (error) {
    console.error('Error updating settings:', error)
    return NextResponse.json({ error: 'Failed to update settings' }, { status: 500 })
  }
}

// DELETE - Delete entities
export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json()
    const { type, id } = body
    
    switch (type) {
      case 'project':
        await prisma.project.delete({ where: { id } })
        break
      case 'crew':
        await prisma.crew.delete({ where: { id } })
        break
      case 'subcontractor':
        await prisma.subcontractor.delete({ where: { id } })
        break
      case 'rackingProfile':
        await prisma.rackingProfile.delete({ where: { id } })
        break
      case 'user':
        await prisma.user.delete({ where: { id } })
        break
      default:
        return NextResponse.json({ error: 'Invalid type' }, { status: 400 })
    }
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting:', error)
    return NextResponse.json({ error: 'Failed to delete' }, { status: 500 })
  }
}
