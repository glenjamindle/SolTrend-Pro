import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { hashPassword } from '@/lib/auth'

// POST /api/seed
// Idempotent: ensures a default company, default crews/subcontractors/
// racking profiles, a default project, and - ONLY on a truly fresh
// company with no users at all yet - the 5 demo-credential users exist.
// Safe to call repeatedly (and it is - initializeApp() calls this on
// every page load); only creates what's missing.
export async function POST() {
  try {
    let company = await prisma.company.findFirst()

    if (!company) {
      company = await prisma.company.create({
        data: { name: 'Apex Solar Construction', tier: 'enterprise' },
      })
    }

    const demoUsers = [
      { email: 'admin@kruger.com', name: 'Marcus Thompson', role: 'admin' },
      { email: 'pm@kruger.com', name: 'Sarah Kim', role: 'manager' },
      { email: 'supervisor@kruger.com', name: 'Elena Vargas', role: 'supervisor' },
      { email: 'crew@kruger.com', name: 'James King', role: 'crew' },
      { email: 'inspector@kruger.com', name: 'Dana Ruiz', role: 'inspector' },
    ]

    // Every other seeded entity below (crews/subcontractors/racking
    // profiles) only creates its defaults when that table is completely
    // empty for this company - this loop used to be the one exception,
    // upserting all 5 demo accounts by email on EVERY call regardless of
    // how many real users already existed. That meant renaming one of
    // these demo accounts' email (e.g. to a real company domain) just
    // recreated a fresh duplicate under the old email on the very next
    // page load, since the upsert's `where: { email }` no longer matched
    // the renamed row. Gating this on "no users yet for this company"
    // fixes that for good, and matches how everything else here already
    // behaves.
    const existingUserCount = await prisma.user.count({ where: { companyId: company.id } })
    if (existingUserCount === 0) {
      // Hashed once and reused - all five demo accounts share the same
      // demo password, and bcrypt is deliberately slow, so there's no
      // reason to pay that cost five times for an identical result.
      const demoPasswordHash = hashPassword('demo123')

      for (const u of demoUsers) {
        await prisma.user.upsert({
          where: { email: u.email },
          update: {},
          create: {
            email: u.email,
            name: u.name,
            role: u.role,
            password: demoPasswordHash,
            companyId: company.id,
          },
        })
      }
    }

    const crewCount = await prisma.crew.count({ where: { companyId: company.id } })
    if (crewCount === 0) {
      await prisma.crew.createMany({
        data: [
          { name: 'Alpha Crew', lead: 'Marcus T.', status: 'active', workerCount: 8, companyId: company.id },
          { name: 'Beta Crew', lead: 'Elena V.', status: 'active', workerCount: 8, companyId: company.id },
          { name: 'Gamma Crew', lead: 'James K.', status: 'standby', workerCount: 8, companyId: company.id },
        ],
      })
    }

    const subCount = await prisma.subcontractor.count({ where: { companyId: company.id } })
    if (subCount === 0) {
      await prisma.subcontractor.createMany({
        data: [
          { name: 'SolarForce Inc.', companyId: company.id },
          { name: 'PileDrivers LLC', companyId: company.id },
        ],
      })
    }

    const rackingCount = await prisma.rackingProfile.count({ where: { companyId: company.id } })
    if (rackingCount === 0) {
      await prisma.rackingProfile.createMany({
        data: [
          {
            name: 'GameChange Solar',
            manufacturer: 'GameChange Solar',
            pileTypes: JSON.stringify(['interior', 'exterior', 'motor', 'corner']),
            tolerances: JSON.stringify({ interior: { embedmentMin: 72, plumbNS: 1.5 }, motor: { embedmentMin: 96, plumbNS: 0.5 } }),
            companyId: company.id,
          },
          {
            name: 'NEXTracker',
            manufacturer: 'NEXTracker',
            pileTypes: JSON.stringify(['interior', 'exterior', 'motor', 'boundary']),
            tolerances: JSON.stringify({ interior: { embedmentMin: 78, plumbNS: 2.0 } }),
            companyId: company.id,
          },
        ],
      })
    }

    let project = await prisma.project.findFirst({ where: { companyId: company.id } })
    if (!project) {
      project = await prisma.project.create({
        data: {
          name: 'Desert Sun Solar Farm',
          location: 'Phoenix, AZ',
          status: 'active',
          health: 'green',
          totalPiles: 750,
          client: 'NextEra Energy',
          projectManager: 'Sarah K.',
          dailyTarget: 35,
          totalRows: 50,
          pilesPerRow: 30,
          companyId: company.id,
        },
      })
    }

    const [userCount, crewTotal, subTotal, rackingTotal] = await Promise.all([
      prisma.user.count({ where: { companyId: company.id } }),
      prisma.crew.count({ where: { companyId: company.id } }),
      prisma.subcontractor.count({ where: { companyId: company.id } }),
      prisma.rackingProfile.count({ where: { companyId: company.id } }),
    ])

    return NextResponse.json({
      success: true,
      stats: {
        companyId: company.id,
        projectId: project.id,
        users: userCount,
        crews: crewTotal,
        subcontractors: subTotal,
        rackingProfiles: rackingTotal,
      },
    })
  } catch (error) {
    console.error('Error seeding database:', error)
    return NextResponse.json({ success: false, error: 'Failed to seed database' }, { status: 500 })
  }
}
