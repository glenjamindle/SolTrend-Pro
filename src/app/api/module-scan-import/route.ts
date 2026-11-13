import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

const ROLE_RANK: Record<string, number> = { inspector: 1, manager: 2, admin: 3 }
function hasRole(role: string | undefined, min: keyof typeof ROLE_RANK): boolean {
  return (ROLE_RANK[role || ''] || 0) >= ROLE_RANK[min]
}

type RowInput = { rowId: string; barcodes: string[] }

// POST /api/module-scan-import
// body: { projectId, rows: RowInput[], spares?: string[], broken?: string[] }
//
// Bulk-loads a crew's existing Excel scan log (same shape their Bluetooth
// scanner + spreadsheet workflow already produces - ROWTAG- markers plus
// module barcodes in scan order, and separate flat Broken/Spares lists)
// for a crew that doesn't use the app's own Scan Mode. Settings -> Module
// Rows is where this is triggered from (parseModuleScanCsvText in
// page.tsx does the CSV parsing; this route just applies the result).
//
// Every barcode is checked against every barcode already recorded
// anywhere in the project - another slot, Spares, or Broken - exactly
// like a live scan's conflict check (see findBarcodeConflict in
// src/lib/moduleBarcode.ts), except done once as an in-memory set rather
// than a DB round trip per barcode, since an import can be thousands of
// rows. A duplicate is skipped and reported, never silently overwritten
// or merged - same rule as the live Scan Mode flow.
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }
    if (!hasRole(session.user.role, 'manager')) {
      return NextResponse.json({ error: 'Only managers and admins can import module scan data' }, { status: 403 })
    }

    const body = await request.json()
    const { projectId, rows, spares, broken } = body as {
      projectId: string
      rows?: RowInput[]
      spares?: string[]
      broken?: string[]
    }
    if (!projectId) {
      return NextResponse.json({ error: 'projectId is required' }, { status: 400 })
    }
    const project = await prisma.project.findUnique({ where: { id: projectId } })
    if (!project) {
      return NextResponse.json({ error: 'Unknown project' }, { status: 404 })
    }

    const importedBy = session.user.name || session.user.email || 'CSV import'

    const existingRows = await prisma.moduleRow.findMany({ where: { projectId }, include: { slots: true } })
    const existingSpares = await prisma.spareModule.findMany({ where: { projectId } })
    const existingBroken = await prisma.brokenModule.findMany({ where: { projectId } })
    const seenBarcodes = new Set<string>()
    existingRows.forEach((r) => r.slots.forEach((s) => { if (s.barcode) seenBarcodes.add(s.barcode) }))
    existingSpares.forEach((s) => seenBarcodes.add(s.barcode))
    existingBroken.forEach((b) => seenBarcodes.add(b.barcode))
    const rowByRowId: Record<string, { id: string; slotCount: number }> = {}
    existingRows.forEach((r) => { rowByRowId[r.rowId] = { id: r.id, slotCount: r.slots.length } })

    let rowsCreated = 0
    let rowsFound = 0
    let slotsCreated = 0
    const slotsSkipped: { barcode: string; rowId: string }[] = []
    const slotCreateData: { moduleRowId: string; position: number; barcode: string; scannedBy: string; scannedAt: Date }[] = []

    // Row creation stays sequential (a project typically has tens to a
    // few hundred rows, never thousands) so each new row's real id is
    // known before its slots are queued; every slot across every row
    // then lands in one createMany call below instead of one round trip
    // per module, which is what actually matters at import scale.
    for (const rowInput of rows || []) {
      const rowId = (rowInput.rowId || '').trim()
      if (!rowId) continue
      let row = rowByRowId[rowId]
      if (!row) {
        const created = await prisma.moduleRow.create({ data: { projectId, rowId } })
        row = { id: created.id, slotCount: 0 }
        rowByRowId[rowId] = row
        rowsCreated++
      } else {
        rowsFound++
      }
      let position = row.slotCount
      for (const barcodeRaw of rowInput.barcodes || []) {
        const barcode = (barcodeRaw || '').trim()
        if (!barcode) continue
        if (seenBarcodes.has(barcode)) { slotsSkipped.push({ barcode, rowId }); continue }
        position++
        slotCreateData.push({ moduleRowId: row.id, position, barcode, scannedBy: importedBy, scannedAt: new Date() })
        seenBarcodes.add(barcode)
        slotsCreated++
      }
      row.slotCount = position
    }
    if (slotCreateData.length > 0) {
      await prisma.moduleSlot.createMany({ data: slotCreateData })
    }

    let sparesCreated = 0
    const sparesSkipped: string[] = []
    const spareCreateData: { projectId: string; barcode: string; loggedBy: string }[] = []
    for (const barcodeRaw of spares || []) {
      const barcode = (barcodeRaw || '').trim()
      if (!barcode) continue
      if (seenBarcodes.has(barcode)) { sparesSkipped.push(barcode); continue }
      spareCreateData.push({ projectId, barcode, loggedBy: importedBy })
      seenBarcodes.add(barcode)
      sparesCreated++
    }
    if (spareCreateData.length > 0) {
      await prisma.spareModule.createMany({ data: spareCreateData })
    }

    let brokenCreated = 0
    const brokenSkipped: string[] = []
    const brokenCreateData: { projectId: string; barcode: string; reason: string; loggedBy: string }[] = []
    for (const barcodeRaw of broken || []) {
      const barcode = (barcodeRaw || '').trim()
      if (!barcode) continue
      if (seenBarcodes.has(barcode)) { brokenSkipped.push(barcode); continue }
      // The CSV has no reason column (see parseModuleScanCsvText) - every
      // imported broken module lands under this one default category,
      // same as the two other fixed reasons used when scanning live.
      brokenCreateData.push({ projectId, barcode, reason: 'Damaged in Field', loggedBy: importedBy })
      seenBarcodes.add(barcode)
      brokenCreated++
    }
    if (brokenCreateData.length > 0) {
      await prisma.brokenModule.createMany({ data: brokenCreateData })
    }

    return NextResponse.json({
      rowsCreated, rowsFound, slotsCreated,
      slotsSkipped: slotsSkipped.slice(0, 50), slotsSkippedTotal: slotsSkipped.length,
      sparesCreated, sparesSkipped: sparesSkipped.slice(0, 50), sparesSkippedTotal: sparesSkipped.length,
      brokenCreated, brokenSkipped: brokenSkipped.slice(0, 50), brokenSkippedTotal: brokenSkipped.length,
    })
  } catch (error) {
    console.error('Error importing module scan CSV:', error)
    return NextResponse.json({ error: 'Failed to import module scan data' }, { status: 500 })
  }
}
