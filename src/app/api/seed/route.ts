// Seed API - One-time database seeding
import { NextResponse } from 'next/server'
import { PrismaClient, UserRole, ProjectStatus, ProjectHealth, PileStatus, InspectionStatus, RefusalReason, RefusalStatus, CrewStatus, CompanyTier } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

export async function GET() {
  try {
    // Check if already seeded
    const existingUsers = await prisma.user.count()
    if (existingUsers > 0) {
      return NextResponse.json({ message: 'Database already seeded', userCount: existingUsers })
    }

    console.log('🌱 Seeding database...')

    // Create racking profiles
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

    // Create subcontractors
    await prisma.subcontractor.create({
      data: {
        name: 'SolarForce Inc.',
        contactPerson: 'Tom Wilson',
        phone: '555-0201',
        email: 'contact@solarforce.com',
        companyId: company.id,
      }
    })

    // Create project
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

    // Create sample piles (first 100 for demo)
    const pileData = []
    for (let row = 1; row <= 10; row++) {
      for (let pile = 1; pile <= 10; pile++) {
        pileData.push({
          pileId: `${row}-${pile}`,
          rowNumber: row,
          pileNumber: pile,
          status: PileStatus.NOT_STARTED,
          projectId: project1.id,
        })
      }
    }
    await prisma.pile.createMany({ data: pileData, skipDuplicates: true })

    // Create sample inspections
    for (let i = 0; i < 50; i++) {
      const row = Math.floor(Math.random() * 10) + 1
      const pile = Math.floor(Math.random() * 10) + 1
      const status = Math.random() > 0.15 ? InspectionStatus.PASS : InspectionStatus.FAIL

      await prisma.inspection.create({
        data: {
          pileId: `${row}-${pile}`,
          rowNumber: row,
          pileNumber: pile,
          status,
          depth: 1800 + Math.floor(Math.random() * 200),
          plumbNS: parseFloat((Math.random() * 2).toFixed(1)),
          plumbEW: parseFloat((Math.random() * 2).toFixed(1)),
          embedment: 72 + Math.floor(Math.random() * 20),
          projectId: project1.id,
          inspectorId: inspector.id,
          inspectedAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000),
        }
      })
    }

    // Create sample refusals
    for (let i = 0; i < 5; i++) {
      const row = Math.floor(Math.random() * 10) + 1
      const pile = Math.floor(Math.random() * 10) + 1

      await prisma.refusal.create({
        data: {
          pileId: `${row}-${pile}`,
          rowNumber: row,
          pileNumber: pile,
          reason: [RefusalReason.BEDROCK, RefusalReason.COBBLE, RefusalReason.OBSTRUCTION][Math.floor(Math.random() * 3)],
          targetDepth: 1800,
          achievedDepth: 800 + Math.floor(Math.random() * 600),
          status: RefusalStatus.OPEN,
          notes: 'Encountered resistance during driving',
          projectId: project1.id,
          reportedById: supervisor.id,
          reportedAt: new Date(Date.now() - Math.random() * 14 * 24 * 60 * 60 * 1000),
        }
      })
    }

    // Create production logs (last 7 days)
    for (let i = 6; i >= 0; i--) {
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
          weatherConditions: 'Sunny',
          temperature: 75 + Math.floor(Math.random() * 20),
        }
      })
    }

    return NextResponse.json({
      success: true,
      message: 'Database seeded successfully!',
      users: 5,
      project: project1.name,
      demoAccounts: [
        { email: 'admin@apexsolar.com', password: 'demo123', role: 'Admin' },
        { email: 'pm@apexsolar.com', password: 'demo123', role: 'Project Manager' },
        { email: 'supervisor@apexsolar.com', password: 'demo123', role: 'Field Supervisor' },
        { email: 'crew@apexsolar.com', password: 'demo123', role: 'Crew Lead' },
        { email: 'inspector@apexsolar.com', password: 'demo123', role: 'Inspector' },
      ]
    })
  } catch (error) {
    console.error('Seed error:', error)
    return NextResponse.json({ error: String(error) }, { status: 500 })
  }
}
