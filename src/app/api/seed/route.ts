import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

// POST /api/seed
// Idempotent: ensures a default company, the 5 demo-credential users,
// default crews/subcontractors/racking profiles, and a default project
// exist. Safe to call repeatedly - only creates what's missing.
export async function POST() {
  try {
    let company = await prisma.company.findFirst()

    if (!company) {
      company = await prisma.company.create({
        data: { name: 'Apex Solar Construction', tier: 'enterprise' },
      })
    }

    const demoUsers = [
      { email: 'admin@apexsolar.com', name: 'Marcus Thompson', role: 'admin' },
      { email: 'pm@apexsolar.com', name: 'Sarah Kim', role: 'manager' },
      { email: 'supervisor@apexsolar.com', name: 'Elena Vargas', role: 'supervisor' },
      { email: 'crew@apexsolar.com', name: 'James King', role: 'crew' },
      { email: 'inspector@apexsolar.com', name: 'Dana Ruiz', role: 'inspector' },
    ]

    for (const u of demoUsers) {
      await prisma.user.upsert({
        where: { email: u.email },
        update: {},
        create: {
          email: u.email,
          name: u.name,
          role: u.role,
          password: 'demo123',
          companyId: company.id,
        },
      })
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
