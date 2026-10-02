import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions, hashPassword } from '@/lib/auth'
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
            password: hashPassword('admin123'),
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
    const [company, rawProjects, crews, subcontractors, rackingProfiles, users] = await Promise.all([
      prisma.company.findUnique({ where: { id: companyId } }),
      // Explicit order, not whatever order Postgres happens to return rows
      // in. That used to be left implicit, which worked by accident until
      // Glen noticed the project list rearranging itself after editing a
      // project's details - an UPDATE can relocate a row's physical storage
      // position, so an unordered findMany has no guarantee of staying
      // stable across edits. sortOrder is the field reorderProjects (below)
      // and drag-reordering in Settings write to; createdAt is just a
      // tiebreaker for rows that happen to share a sortOrder.
      // milestones included here (not just via /api/milestones, which is
      // scoped to whichever single project is currently open) so the
      // Company Dashboard can show every site's current phase and schedule
      // status without opening each project individually. Same reasoning
      // for rfis/submittals/punchItems, added alongside it: the Active
      // Projects table on the Company Dashboard needs every site's OPEN
      // items to show counts and let a row expand to the real list, not
      // just whichever project happens to be open client-side. Filtered to
      // "still open" at the query level (closed RFIs / approved-or-
      // rejected submittals / resolved punch items are never needed here)
      // to keep this payload from growing with a project's full history -
      // the single-project tabs that need the full history fetch it
      // separately via /api/rfis, /api/submittals, /api/punchlist.
      prisma.project.findMany({
        where: { companyId },
        include: {
          rackingProfile: true,
          milestones: { orderBy: { sortOrder: 'asc' } },
          rfis: { where: { status: { not: 'closed' } }, orderBy: { createdAt: 'asc' } },
          submittals: { where: { status: { notIn: ['approved', 'approved_as_noted', 'rejected'] } }, orderBy: { createdAt: 'asc' } },
          punchItems: { where: { status: { not: 'resolved' } }, orderBy: { createdAt: 'asc' } },
        },
        orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
      }),
      prisma.crew.findMany({ where: { companyId }, include: { members: true } }),
      prisma.subcontractor.findMany({ where: { companyId } }),
      prisma.rackingProfile.findMany({ where: { companyId } }),
      prisma.user.findMany({ where: { companyId }, select: { id: true, email: true, name: true, role: true, crewId: true } }),
    ])

    // One-time self-heal: every project created before sortOrder existed
    // defaults to 0, so right after this ships they'd all tie and silently
    // fall back to the createdAt order above. Detect a tie (more than one
    // project sharing a sortOrder) and assign each a unique value matching
    // its current position - no separate migration script needed, and this
    // check is cheap enough to just leave in permanently rather than ship
    // then remove it.
    let projects = rawProjects
    const hasDuplicateSortOrder = projects.length > 1 && new Set(projects.map(p => p.sortOrder)).size < projects.length
    if (hasDuplicateSortOrder) {
      await prisma.$transaction(projects.map((p, i) => prisma.project.update({ where: { id: p.id }, data: { sortOrder: i } })))
      projects = projects.map((p, i) => ({ ...p, sortOrder: i }))
    }

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
    if (['project', 'crew', 'subcontractor', 'rackingProfile', 'reorderProjects'].includes(type) && !hasRole(role, 'manager')) {
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
          // New projects go at the end of the manual order, not the front -
          // sortOrder defaults to 0 like everything else, which would jump
          // a brand-new project to the top of the dropdown/dashboard ahead
          // of projects someone deliberately arranged.
          const maxOrder = await prisma.project.aggregate({ where: { companyId }, _max: { sortOrder: true } })
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
              sortOrder: (maxOrder._max.sortOrder ?? -1) + 1,
              companyId,
            }
          })
          return NextResponse.json(project)
        }
      }

      // Drag-reordering in Settings sends the full new project id order for
      // this company; sortOrder just becomes each id's index in that list.
      // A transaction keeps a page refresh mid-drag from ever seeing a half
      // -applied order. Prisma's update `where` needs a unique field alone
      // (no compound id+companyId constraint exists), so ownership is
      // checked up front instead: only ids this company's own findMany
      // actually returned get written.
      case 'reorderProjects': {
        const orderedIds: string[] = data.orderedIds || []
        const owned = await prisma.project.findMany({ where: { id: { in: orderedIds }, companyId }, select: { id: true } })
        const ownedIds = new Set(owned.map(p => p.id))
        await prisma.$transaction(
          orderedIds
            .filter(id => ownedIds.has(id))
            .map((id, i) => prisma.project.update({ where: { id }, data: { sortOrder: i } }))
        )
        return NextResponse.json({ ok: true })
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
              password: hashPassword(data.password || 'password123'),
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
