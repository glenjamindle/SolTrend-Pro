// Shared resolver for a refusal's target embedment depth. Used by both the
// bulk QA/QC import route (new refusals) and the recompute-target-depth
// route (correcting refusals already on file). Keeping this in one place
// means the two can never drift apart on what "the right answer" is.
//
// There's no per-project design value tracked anywhere else (see Project
// model) - the real numbers live on the project's active RackingProfile,
// per pile type, as `tolerances.embedmentMinIn` (already surfaced
// read-only during Inspection entry). So: if this specific pile has a
// pileType assigned (Pile.pileType, set by a Pile Layout CSV import or by
// hand in Settings -> Pile Layout) and that type has a real embedment
// minimum on file, use it. Pile-type assignment is inconsistent across
// Glen's projects (confirmed 2026-11-02) - plenty of piles have no
// pileType - so as a second-best guess, if the project's racking profile
// has exactly one pile type defined, assume every pile on the project is
// that type (common case: one vendor, one pile spec per project). Only
// when neither of those resolves anything does this fall back to the old
// flat 72in default, which is always strictly worse than a real answer
// but never worse than what shipped before this existed.
export const DEFAULT_TARGET_DEPTH_IN = 72

type ToleranceSpec = { embedmentMinIn?: number | null } | null | undefined
type PileTypeSpec = { id?: string; tolerances?: ToleranceSpec } | null | undefined

export function resolveTargetDepthIn(
  pileType: string | null | undefined,
  pileTypeSpecs: unknown
): number {
  const specs: PileTypeSpec[] = Array.isArray(pileTypeSpecs) ? (pileTypeSpecs as PileTypeSpec[]) : []

  if (pileType) {
    const match = specs.find((t) => t && t.id === pileType)
    const minIn = match?.tolerances?.embedmentMinIn
    if (typeof minIn === 'number' && minIn > 0) return minIn
  }

  if (specs.length === 1) {
    const minIn = specs[0]?.tolerances?.embedmentMinIn
    if (typeof minIn === 'number' && minIn > 0) return minIn
  }

  return DEFAULT_TARGET_DEPTH_IN
}

// Parses RackingProfile.pileTypeSpecs, which is stored as a JSON string
// (or null). Returns [] on anything unparseable rather than throwing -
// every call site already treats "no specs" as "fall back to the flat
// default", so a malformed string should behave the same way, not 500.
export function parsePileTypeSpecs(raw: string | null | undefined): unknown[] {
  if (!raw) return []
  try {
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}
