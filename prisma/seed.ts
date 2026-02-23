// Seed Script for SolTrend Pro
// Run with: npx prisma db seed

import { PrismaClient, UserRole, ProjectStatus, ProjectHealth, PileStatus, InspectionStatus, RefusalReason, RefusalStatus, CrewStatus, CompanyTier } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // Clean existing data
  await prisma.activity.deleteMany()
  await prisma.photo.deleteMany()
  await prisma.report.deleteMany()
  await prisma.productionLog.deleteMany()
  await prisma.refusal.deleteMany()
  await prisma.inspection.deleteMany()
  await prisma.pile.deleteMany()
  await prisma.crew.deleteMany()
  await prisma.subcontractor.deleteMany()
  await prisma.rackingProfile.deleteMany()
  await prisma.project.deleteMany()
  await prisma.user.deleteMany()
  await prisma.company.deleteMany()
  console.log('✅ Cleaned existing data')

  // Create racking profiles (global templates)
  const gamechangeProfile = await prisma.rackingProfile.create({
    data: {
      name: 'GameChange Standard',
      manufacturer: 'GameChange Solar',
      tolerances: {
        interior: { embedmentMin: 72, plumbNS: 1.5 },
        exterior: { embedmentMin: 72, plumbNS: 1.5 },
        motor: { embedmentMin: 96, plumbNS: 0.5 },
        corner: { embedmentMin: 72, plumbNS: 1.5 }
      }
    }
  })

  const nextrackerProfile = await prisma.rackingProfile.create({
    data: {
      name: 'NEXTracker Standard',
      manufacturer: 'NEXTracker',
      tolerances: {
        interior: { embedmentMin: 78, plumbNS: 2.0 },
        exterior: { embedmentMin: 78, plumbNS: 2.0 },
        motor: { embedmentMin: 96, plumbNS: 1.0 },
        boundary: { embedmentMin: 78, plumbNS: 2.0 }
      }
    }
  })
  console.log('✅ Created racking profiles')

  // Create company
  const company = await prisma.company.create({
    data: {
      name: 'Apex Solar Construction',
      tier: CompanyTier.ENTERPRISE,
    }
  })

  // Create users
  const passwordHash = await bcrypt.hash('demo123', 12)
  
  const admin = await prisma.user.create({
    data: {
      email: 'admin@apexsolar.com',
      passwordHash,
      name: 'Marcus Thompson',
      role: UserRole.ADMIN,
      phone: '555-0101',
      companyId: company.id,
    }
  })

  const projectManager = await prisma.user.create({
    data: {
      email: 'pm@apexsolar.com',
      passwordHash,
      name: 'Sarah Kim',
      role: UserRole.PROJECT_MANAGER,
      phone: '555-0102',
      companyId: company.id,
    }
  })

  const supervisor = await prisma.user.create({
    data: {
      email: 'supervisor@apexsolar.com',
      passwordHash,
      name: 'James Rodriguez',
      role: UserRole.FIELD_SUPERVISOR,
      phone: '555-0103',
      companyId: company.id,
    }
  })

  const crewLead = await prisma.user.create({
    data: {
      email: 'crew@apexsolar.com',
      passwordHash,
      name: 'Elena Vasquez',
      role: UserRole.CREW_LEAD,
      phone: '555-0104',
      companyId: company.id,
    }
  })

  const inspector = await prisma.user.create({
    data: {
      email: 'inspector@apexsolar.com',
      passwordHash,
      name: 'Mike Chen',
      role: UserRole.INSPECTOR,
      phone: '555-0105',
      companyId: company.id,
    }
  })
  console.log('✅ Created users')

  // Create crews
  const alphaCrew = await prisma.crew.create({
    data: {
      name: 'Alpha Crew',
      lead: 'Marcus T.',
      status: CrewStatus.ACTIVE,
      companyId: company.id,
    }
  })

  const betaCrew = await prisma.crew.create({
    data: {
      name: 'Beta Crew',
      lead: 'Elena V.',
      status: CrewStatus.ACTIVE,
      companyId: company.id,
    }
  })

  const gammaCrew = await prisma.crew.create({
    data: {
      name: 'Gamma Crew',
      lead: 'James K.',
      status: CrewStatus.STANDBY,
      companyId: company.id,
    }
  })

  // Create subcontractors
  const sub1 = await prisma.subcontractor.create({
    data: {
      name: 'SolarForce Inc.',
      contactPerson: 'Tom Wilson',
      phone: '555-0201',
      email: 'contact@solarforce.com',
      companyId: company.id,
    }
  })

  const sub2 = await prisma.subcontractor.create({
    data: {
      name: 'PileDrivers LLC',
      contactPerson: 'Dave Brown',
      phone: '555-0202',
      email: 'info@piledrivers.com',
      companyId: company.id,
    }
  })
  console.log('✅ Created crews and subcontractors')

  // Create projects
  const project1 = await prisma.project.create({
    data: {
      name: 'Desert Sun Solar Farm',
      location: 'Phoenix, AZ',
      client: 'NextEra Energy',
      status: ProjectStatus.ACTIVE,
      health: ProjectHealth.GREEN,
      totalPiles: 1500,
      installedPiles: 542,
      passedInspections: 489,
      failedInspections: 23,
      refusalCount: 30,
      startDate: new Date('2024-09-15'),
      plannedEndDate: new Date('2025-02-15'),
      dailyTarget: 35,
      rackingProfileId: gamechangeProfile.id,
      weatherLat: 33.4484,
      weatherLng: -112.0740,
      companyId: company.id,
      projectManagerId: projectManager.id,
    }
  })

  const project2 = await prisma.project.create({
    data: {
      name: 'High Plains Array',
      location: 'Colorado Springs, CO',
      client: 'Xcel Energy',
      status: ProjectStatus.COMPLETED,
      health: ProjectHealth.GREEN,
      totalPiles: 1200,
      installedPiles: 1200,
      passedInspections: 1156,
      failedInspections: 28,
      refusalCount: 16,
      startDate: new Date('2024-06-01'),
      plannedEndDate: new Date('2024-11-15'),
      actualEndDate: new Date('2024-11-10'),
      dailyTarget: 30,
      rackingProfileId: nextrackerProfile.id,
      weatherLat: 38.8339,
      weatherLng: -104.8214,
      companyId: company.id,
      projectManagerId: projectManager.id,
    }
  })
  console.log('✅ Created projects')

  // Create piles for project 1 (50 rows x 30 piles = 1500 total)
  console.log('Creating piles...')
  const pileData = []
  for (let row = 1; row <= 50; row++) {
    for (let pile = 1; pile <= 30; pile++) {
      pileData.push({
        pileId: `${row}-${pile}`,
        rowNumber: row,
        pileNumber: pile,
        status: PileStatus.NOT_STARTED,
        projectId: project1.id,
      })
    }
  }
  
  // Bulk create in chunks
  const chunkSize = 500
  for (let i = 0; i < pileData.length; i += chunkSize) {
    await prisma.pile.createMany({
      data: pileData.slice(i, i + chunkSize),
      skipDuplicates: true
    })
  }
  console.log(`✅ Created ${pileData.length} piles`)

  // Create sample inspections
  console.log('Creating sample inspections...')
  const inspectionData = []
  const pileIds = pileData.slice(0, 600).map(p => p.pileId) // First 600 piles
  
  for (const pileId of pileIds) {
    const random = Math.random()
    const row = parseInt(pileId.split('-')[0])
    const pile = parseInt(pileId.split('-')[1])
    
    if (random < 0.65) { // 65% pass
      inspectionData.push({
        pileId,
        rowNumber: row,
        pileNumber: pile,
        status: InspectionStatus.PASS,
        depth: 1800 + Math.floor(Math.random() * 200),
        plumbNS: parseFloat((Math.random() * 2).toFixed(1)),
        plumbEW: parseFloat((Math.random() * 2).toFixed(1)),
        embedment: 72 + Math.floor(Math.random() * 20),
        projectId: project1.id,
        inspectorId: inspector.id,
        inspectedAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000),
      })
    } else if (random < 0.72) { // 7% fail
      inspectionData.push({
        pileId,
        rowNumber: row,
        pileNumber: pile,
        status: InspectionStatus.FAIL,
        depth: 1600 + Math.floor(Math.random() * 200),
        plumbNS: parseFloat((2 + Math.random() * 2).toFixed(1)),
        plumbEW: parseFloat((Math.random() * 2).toFixed(1)),
        embedment: 60 + Math.floor(Math.random() * 15),
        failReason: ['plumb', 'depth', 'twist'][Math.floor(Math.random() * 3)],
        failNotes: 'Failed during QC inspection',
        projectId: project1.id,
        inspectorId: inspector.id,
        inspectedAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000),
      })
    }
  }

  for (let i = 0; i < inspectionData.length; i += chunkSize) {
    await prisma.inspection.createMany({
      data: inspectionData.slice(i, i + chunkSize),
      skipDuplicates: true
    })
  }
  console.log(`✅ Created ${inspectionData.length} inspections`)

  // Create sample refusals
  console.log('Creating sample refusals...')
  const refusalReasons = [RefusalReason.BEDROCK, RefusalReason.COBBLE, RefusalReason.OBSTRUCTION]
  
  for (let i = 0; i < 30; i++) {
    const pileId = pileData[600 + i].pileId
    const row = parseInt(pileId.split('-')[0])
    const pile = parseInt(pileId.split('-')[1])
    
    await prisma.refusal.create({
      data: {
        pileId,
        rowNumber: row,
        pileNumber: pile,
        reason: refusalReasons[Math.floor(Math.random() * refusalReasons.length)],
        targetDepth: 1800,
        achievedDepth: 800 + Math.floor(Math.random() * 600),
        status: i < 8 ? RefusalStatus.OPEN : RefusalStatus.RESOLVED,
        notes: 'Encountered resistance during driving',
        projectId: project1.id,
        reportedById: supervisor.id,
        reportedAt: new Date(Date.now() - Math.random() * 14 * 24 * 60 * 60 * 1000),
      }
    })
  }
  console.log('✅ Created 30 refusals')

  // Create production logs (last 30 days)
  console.log('Creating production logs...')
  for (let i = 29; i >= 0; i--) {
    const date = new Date(Date.now() - i * 24 * 60 * 60 * 1000)
    const pilesInstalled = Math.floor(Math.random() * 20 + 35)
    
    await prisma.productionLog.create({
      data: {
        date,
        pilesInstalled,
        inspectionsPassed: Math.floor(pilesInstalled * 0.9),
        inspectionsFailed: Math.floor(pilesInstalled * 0.05),
        refusalsLogged: Math.floor(Math.random() * 3),
        projectId: project1.id,
        crewId: i % 2 === 0 ? alphaCrew.id : betaCrew.id,
        recordedById: supervisor.id,
        weatherConditions: i % 3 === 0 ? 'Sunny' : 'Partly Cloudy',
        temperature: 75 + Math.floor(Math.random() * 20),
      }
    })
  }
  console.log('✅ Created 30 production logs')

  // Create activities
  console.log('Creating activities...')
  const activityTypes = [
    { type: 'INSPECTION_PASS' as const, msg: 'Passed pile' },
    { type: 'INSPECTION_FAIL' as const, msg: 'Failed pile' },
    { type: 'REFUSAL_LOGGED' as const, msg: 'Logged refusal at' },
  ]

  for (let i = 0; i < 20; i++) {
    const act = activityTypes[Math.floor(Math.random() * activityTypes.length)]
    const row = Math.floor(Math.random() * 50)
    const pile = Math.floor(Math.random() * 30)
    
    await prisma.activity.create({
      data: {
        type: act.type,
        message: `${act.msg} ${row}-${pile}`,
        entityType: act.type.includes('INSPECTION') ? 'inspection' : 'refusal',
        entityId: `demo-${i}`,
        projectId: project1.id,
        userId: inspector.id,
        createdAt: new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000),
      }
    })
  }
  console.log('✅ Created activities')

  console.log('\n🎉 Seeding complete!')
  console.log('\nDemo accounts:')
  console.log('  admin@apexsolar.com / demo123 (Admin)')
  console.log('  pm@apexsolar.com / demo123 (Project Manager)')
  console.log('  supervisor@apexsolar.com / demo123 (Field Supervisor)')
  console.log('  crew@apexsolar.com / demo123 (Crew Lead)')
  console.log('  inspector@apexsolar.com / demo123 (Inspector)')
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
