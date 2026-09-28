import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

// This route always needs a fresh read of the database - reading
// searchParams already makes Next.js treat GET as dynamic, but that's an
// inference, not a guarantee, and there's nothing more disorienting than a
// company/project rename that saved correctly but keeps showing the old
// name because some caching layer served a stale copy. Being explicit here
// costs nothing and rules that class of bug out entirely.
export const dynamic = 'force-dynamic'
export const fetchCache = 'force-no-store'

// Role hierarchy for gating writes below. The middleware already requires
// *some* logged-in session to reach any API route, but until now nothing
// checked *which* role - any signed-in user (inspector included) could
// delete a project, edit company settings, or change another user's role.
const ROLE_RANK: Record<string, number> = { inspector: 1, manager: 2, admin: 3 }
function hasRole(role: string | undefined, min: keyof typeof ROLE_RANK): boolean {
  return (ROLE_RANK[role || ''] || 0) >= ROLE_RANK[min]
}

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
        pileTypeSpecs: rp.pileTypeSpecs ? JSON.parse(rp.pileTypeSpecs) : [],
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
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }
    const role = session.user.role

    const body = await request.json()
    const { type, data, companyId } = body

    // company/user changes are admin-only; project/crew/subcontractor/
    // rackingProfile creates and edits need at least manager. Inspectors can
    // still log production/inspections/refusals through their own routes -
    // this route only covers the settings/admin entities.
    if (type === 'company' && !hasRole(role, 'admin')) {
      return NextResponse.json({ error: 'Only admins can edit company settings' }, { status: 403 })
    }
    if (type === 'user' && !hasRole(role, 'admin')) {
      return NextResponse.json({ error: 'Only admins can manage users' }, { status: 403 })
    }
    if (['project', 'crew', 'subcontractor', 'rackingProfile'].includes(type) && !hasRole(role, 'manager')) {
      return NextResponse.json({ error: 'Only managers and admins can make this change' }, { status: 403 })
    }

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
          // totalPiles used to be recomputed from totalRows*pilesPerRow on
          // EVERY save of this form, even when those two fields hadn't
          // changed - so saving just the project name, status, or planned
          // Tables/Modules could silently overwrite a totalPiles value that
          // had been corrected by hand to not match rows*pilesPerRow (the
          // grid shape and the real pile count aren't always the same
          // thing - a project can be re-scoped without its row layout
          // changing). Only recompute it when the grid shape itself is
          // actually part of this save.
          const existing = await prisma.project.findUnique({ where: { id: data.id }, select: { totalRows: true, pilesPerRow: true } })
          const gridShapeChanged = !existing || existing.totalRows !== data.totalRows || existing.pilesPerRow !== data.pilesPerRow
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
              ...(gridShapeChanged ? { totalPiles: data.totalRows * data.pilesPerRow } : {}),
              totalTables: data.totalTables || 0,
              totalModules: data.totalModules || 0,
              rackingProfileId: data.rackingProfileId,
              status: data.status,
              latitude: data.latitude ?? null,
              longitude: data.longitude ?? null,
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
              totalTables: data.totalTables || 0,
              totalModules: data.totalModules || 0,
              rackingProfileId: data.rackingProfileId,
              status: data.status || 'active',
              latitude: data.latitude ?? null,
              longitude: data.longitude ?? null,
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
        // pileTypeSpecs (an array of { id, label, profile, lengthFt,
        // embedmentTargetFt, color, tolerances: {...} }) is the real data
        // now. pileTypes/tolerances are legacy columns that are still
        // required (non-nullable) by the schema, so they're derived here
        // rather than typed by hand - nothing writes to them directly
        // anymore, but nothing that might still read them breaks either.
        const pileTypeSpecs = Array.isArray(data.pileTypeSpecs) ? data.pileTypeSpecs : []
        const profileData = {
          name: data.name,
          manufacturer: data.manufacturer,
          pileTypes: JSON.stringify(pileTypeSpecs.map((t: any) => t.label || t.profile || t.id)),
          tolerances: JSON.stringify({}),
          pileTypeSpecs: JSON.stringify(pileTypeSpecs),
          isActive: data.isActive ?? true,
          companyId,
        }

        if (data.id) {
          const profile = await prisma.rackingProfile.update({
            where: { id: data.id },
            data: profileData
          })
          return NextResponse.json({ ...profile, pileTypeSpecs })
        } else {
          const profile = await prisma.rackingProfile.create({
            data: profileData
          })
          return NextResponse.json({ ...profile, pileTypeSpecs })
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
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }
    // Deleting a project, crew, subcontractor, racking profile, or user is
    // destructive and hard to undo, so it's admin-only regardless of type.
    if (!hasRole(session.user.role, 'admin')) {
      return NextResponse.json({ error: 'Only admins can delete records' }, { status: 403 })
    }

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
