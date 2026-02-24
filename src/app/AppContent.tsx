'use client'

import { useSession } from 'next-auth/react'
import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'

// Types
interface Project {
  id: string
  name: string
  location: string
  status: string
  health: string
  totalPiles: number
  installedPiles: number
  passedInspections: number
  failedInspections: number
  refusalCount: number
  client: string
  startDate: string
  plannedEndDate: string
  dailyTarget: number
  company?: { name: string }
}

interface Inspection {
  id?: string
  pileId: string
  status: string
  timestamp: number
  depth?: number
}

interface Refusal {
  id?: string
  pileId: string
  reason: string
  targetDepth: number
  achievedDepth: number
  timestamp?: number
}

type ViewType = 'company' | 'dashboard' | 'inspection' | 'refusal' | 'heatmap' | 'reports'

// Icons as SVG components
const Icons = {
  menu: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="3" y1="12" x2="21" y2="12"></line>
      <line x1="3" y1="6" x2="21" y2="6"></line>
      <line x1="3" y1="18" x2="21" y2="18"></line>
    </svg>
  ),
  trendingUp: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline>
      <polyline points="17 6 23 6 23 12"></polyline>
    </svg>
  ),
  building2: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z"></path>
      <path d="M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2"></path>
      <path d="M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2"></path>
      <path d="M10 6h4"></path>
      <path d="M10 10h4"></path>
      <path d="M10 14h4"></path>
      <path d="M10 18h4"></path>
    </svg>
  ),
  layoutDashboard: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect width="7" height="9" x="3" y="3" rx="1"></rect>
      <rect width="7" height="5" x="14" y="3" rx="1"></rect>
      <rect width="7" height="9" x="14" y="12" rx="1"></rect>
      <rect width="7" height="5" x="3" y="16" rx="1"></rect>
    </svg>
  ),
  clipboardCheck: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect width="8" height="4" x="8" y="2" rx="1" ry="1"></rect>
      <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path>
      <path d="m9 14 2 2 4-4"></path>
    </svg>
  ),
  alertTriangle: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"></path>
      <path d="M12 9v4"></path>
      <path d="M12 17h.01"></path>
    </svg>
  ),
  map: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21"></polygon>
      <line x1="9" x2="9" y1="3" y2="18"></line>
      <line x1="15" x2="15" y1="6" y2="21"></line>
    </svg>
  ),
  fileText: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"></path>
      <polyline points="14 2 14 8 20 8"></polyline>
      <line x1="16" x2="8" y1="13" y2="13"></line>
      <line x1="16" x2="8" y1="17" y2="17"></line>
      <line x1="10" x2="8" y1="9" y2="9"></line>
    </svg>
  ),
  chevronLeft: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="15 18 9 12 15 6"></polyline>
    </svg>
  ),
  chevronRight: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="9 18 15 12 9 6"></polyline>
    </svg>
  ),
  calendar: () => (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect width="18" height="18" x="3" y="4" rx="2" ry="2"></rect>
      <line x1="16" x2="16" y1="2" y2="6"></line>
      <line x1="8" x2="8" y1="2" y2="6"></line>
      <line x1="3" x2="21" y1="10" y2="10"></line>
    </svg>
  ),
  barChart: () => (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" x2="12" y1="20" y2="10"></line>
      <line x1="18" x2="18" y1="20" y2="4"></line>
      <line x1="6" x2="6" y1="20" y2="16"></line>
    </svg>
  ),
  logOut: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
      <polyline points="16 17 21 12 16 7"></polyline>
      <line x1="21" x2="9" y1="12" y2="12"></line>
    </svg>
  ),
}

// Styles
const styles = {
  container: {
    minHeight: '100vh',
    background: '#0c1222',
    color: '#f1f5f9',
    fontFamily: "'DM Sans', sans-serif",
  },
  sidebar: {
    position: 'fixed' as const,
    top: 0,
    bottom: 0,
    left: 0,
    width: '240px',
    background: 'rgba(15, 23, 42, 0.95)',
    borderRight: '1px solid rgba(51, 65, 85, 0.5)',
    display: 'flex',
    flexDirection: 'column' as const,
    transform: 'translateX(0)',
    transition: 'transform 0.3s ease',
    zIndex: 50,
  },
  sidebarHidden: {
    transform: 'translateX(-100%)',
  },
  main: {
    marginLeft: '240px',
    minHeight: '100vh',
    padding: '24px',
  },
  mainMobile: {
    marginLeft: 0,
    paddingTop: '80px',
  },
  mobileHeader: {
    position: 'fixed' as const,
    top: 0,
    left: 0,
    right: 0,
    height: '60px',
    background: 'rgba(15, 23, 42, 0.95)',
    borderBottom: '1px solid rgba(51, 65, 85, 0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0 16px',
    zIndex: 40,
  },
  card: {
    background: 'linear-gradient(135deg, #1a2332 0%, #111827 100%)',
    border: '1px solid #1e293b',
    borderRadius: '12px',
    padding: '20px',
  },
  button: {
    padding: '12px 24px',
    borderRadius: '8px',
    fontWeight: 600,
    fontSize: '14px',
    border: 'none',
    cursor: 'pointer',
    transition: 'all 0.15s ease',
  },
  input: {
    width: '100%',
    padding: '12px 16px',
    background: '#0f172a',
    border: '1px solid #1e293b',
    borderRadius: '12px',
    color: 'white',
    fontSize: '16px',
    outline: 'none',
  },
  pileDisplay: {
    background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
    border: '2px solid #334155',
    borderRadius: '16px',
    padding: '24px',
    boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.3)',
    textAlign: 'center' as const,
  },
  navButton: {
    width: '56px',
    height: '56px',
    borderRadius: '12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: '#334155',
    border: 'none',
    cursor: 'pointer',
    color: 'white',
    transition: 'all 0.15s ease',
  },
  actionButton: {
    minHeight: '100px',
    fontSize: '1.75rem',
    fontWeight: 700,
    borderRadius: '16px',
    border: 'none',
    cursor: 'pointer',
    transition: 'all 0.1s ease',
    flex: 1,
  },
}

export default function AppContent() {
  const { data: session, status } = useSession()
  const router = useRouter()
  
  // State
  const [currentView, setCurrentView] = useState<ViewType>('company')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  
  // Data state
  const [projects, setProjects] = useState<Project[]>([])
  const [currentProject, setCurrentProject] = useState<Project | null>(null)
  const [inspections, setInspections] = useState<Inspection[]>([])
  const [refusals, setRefusals] = useState<Refusal[]>([])
  
  // Inspection state
  const [currentRow, setCurrentRow] = useState(35)
  const [currentPile, setCurrentPile] = useState(22)
  const [sessionPassed, setSessionPassed] = useState(0)
  const [sessionFailed, setSessionFailed] = useState(0)
  
  // Refusal state
  const [refusalRow, setRefusalRow] = useState(35)
  const [refusalPile, setRefusalPile] = useState(22)
  const [targetDepth, setTargetDepth] = useState(1800)
  const [refusalDepth, setRefusalDepth] = useState('')
  const [refusalReason, setRefusalReason] = useState<string | null>(null)
  
  // Responsive
  const [isMobile, setIsMobile] = useState(false)
  
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 1024)
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])
  
  // Auth check
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    }
  }, [status, router])
  
  // Load data from API
  useEffect(() => {
    async function loadData() {
      try {
        const res = await fetch('/api/projects', { credentials: 'include' })
        if (res.status === 401) {
          router.push('/login')
          return
        }
        const data = await res.json()
        if (data && data.length > 0) {
          setProjects(data)
          const active = data.find((p: Project) => p.status === 'ACTIVE') || data[0]
          setCurrentProject(active)
          
          if (active) {
            const [inspRes, refRes] = await Promise.all([
              fetch(`/api/inspections?projectId=${active.id}`, { credentials: 'include' }),
              fetch(`/api/refusals?projectId=${active.id}`, { credentials: 'include' })
            ])
            
            if (inspRes.ok) {
              const inspData = await inspRes.json()
              setInspections(inspData.inspections || [])
            }
            if (refRes.ok) {
              const refData = await refRes.json()
              setRefusals(refData.refusals || [])
            }
          }
        }
      } catch (err) {
        console.error('Failed to load data:', err)
      } finally {
        setLoading(false)
      }
    }
    
    if (status === 'authenticated') {
      loadData()
    }
  }, [status, router])
  
  // API helper
  const apiCall = useCallback(async (endpoint: string, options: RequestInit = {}) => {
    try {
      const res = await fetch(endpoint, { ...options, credentials: 'include' })
      if (res.status === 401) {
        router.push('/login')
        return null
      }
      if (!res.ok) {
        console.error('API error:', res.status)
        return null
      }
      return await res.json()
    } catch (err) {
      console.error('API call failed:', err)
      return null
    }
  }, [router])
  
  // Actions
  const recordInspection = useCallback(async (status: 'PASS' | 'FAIL') => {
    const pileId = `${currentRow}-${currentPile}`
    
    // Save to API
    if (currentProject?.id) {
      await apiCall('/api/inspections', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId: currentProject.id,
          pileId,
          status
        })
      })
    }
    
    // Update local state
    setInspections(prev => [...prev, { pileId, status, timestamp: Date.now() }])
    if (status === 'PASS') {
      setSessionPassed(prev => prev + 1)
    } else {
      setSessionFailed(prev => prev + 1)
    }
    setCurrentPile(prev => prev + 1)
  }, [currentRow, currentPile, currentProject, apiCall])
  
  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (currentView !== 'inspection') return
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return
      
      if (e.key === 'p' || e.key === 'P') {
        recordInspection('PASS')
      } else if (e.key === 'f' || e.key === 'F') {
        recordInspection('FAIL')
      }
    }
    
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [currentView, recordInspection])
  
  const submitRefusal = async () => {
    const pileId = `${refusalRow}-${refusalPile}`
    const achieved = parseInt(refusalDepth) || 0
    
    if (currentProject?.id && refusalReason) {
      await apiCall('/api/refusals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId: currentProject.id,
          pileId,
          reason: refusalReason,
          targetDepth,
          achievedDepth: achieved
        })
      })
    }
    
    setRefusals(prev => [...prev, { pileId, reason: refusalReason || '', targetDepth, achievedDepth: achieved, timestamp: Date.now() }])
    setRefusalPile(prev => prev + 1)
    setRefusalReason(null)
    setRefusalDepth('')
  }
  
  const handleLogout = async () => {
    // Sign out using next-auth
    await fetch('/api/auth/signout', { method: 'POST' })
    router.push('/login')
  }
  
  // Helpers
  const getInspectionStatus = (pileId: string): string => {
    const inspection = inspections.find(i => i.pileId === pileId)
    if (inspection) return inspection.status.toLowerCase()
    const refusal = refusals.find(r => r.pileId === pileId)
    if (refusal) return 'refusal'
    return 'notstarted'
  }
  
  // Loading state
  if (status === 'loading' || loading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#0c1222',
        color: 'white',
        fontFamily: "'DM Sans', sans-serif"
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, #f59e0b 0%, #ea580c 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 16px',
            animation: 'pulse 1.5s ease-in-out infinite'
          }}>
            <Icons.trendingUp />
          </div>
          <p style={{ color: '#94a3b8', fontSize: '14px' }}>Loading SolTrend Pro...</p>
        </div>
      </div>
    )
  }
  
  if (status === 'unauthenticated') {
    return null
  }
  
  // Navigation items
  const navSections = [
    { title: 'Overview', items: [{ id: 'company' as ViewType, label: 'Dashboard', icon: 'building2' }] },
    { title: 'Project', items: [
      { id: 'dashboard' as ViewType, label: 'Project', icon: 'layoutDashboard' },
      { id: 'inspection' as ViewType, label: 'QC Inspection', icon: 'clipboardCheck' },
      { id: 'refusal' as ViewType, label: 'Refusals', icon: 'alertTriangle' },
      { id: 'heatmap' as ViewType, label: 'Pile Map', icon: 'map' },
      { id: 'reports' as ViewType, label: 'Reports', icon: 'fileText' },
    ]},
  ]
  
  const iconMap: Record<string, () => JSX.Element> = {
    building2: Icons.building2,
    layoutDashboard: Icons.layoutDashboard,
    clipboardCheck: Icons.clipboardCheck,
    alertTriangle: Icons.alertTriangle,
    map: Icons.map,
    fileText: Icons.fileText,
  }
  
  // Render views
  const renderDashboard = () => {
    if (!currentProject) return <p style={{ color: 'white' }}>No project selected</p>
    
    const completionPct = Math.round((currentProject.installedPiles / currentProject.totalPiles) * 100)
    const passRate = currentProject.passedInspections > 0 
      ? Math.round((currentProject.passedInspections / (currentProject.passedInspections + currentProject.failedInspections)) * 100) 
      : 0
    
    return (
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ ...styles.card, marginBottom: '24px' }}>
          <h1 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '24px', fontWeight: 700, color: 'white', margin: '0 0 8px' }}>
            {currentProject.name}
          </h1>
          <p style={{ color: '#94a3b8', fontSize: '14px', margin: 0 }}>
            {currentProject.client} · {currentProject.location}
          </p>
          <div style={{ height: '8px', background: '#334155', borderRadius: '4px', marginTop: '16px' }}>
            <div style={{ 
              height: '100%', 
              background: 'linear-gradient(90deg, #22c55e, #4ade80)', 
              borderRadius: '4px',
              width: `${completionPct}%`
            }} />
          </div>
          <p style={{ color: '#22c55e', fontSize: '12px', marginTop: '8px' }}>{completionPct}% Complete</p>
        </div>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '24px' }}>
          <div style={styles.card}>
            <p style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '4px' }}>Pass Rate</p>
            <p style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '28px', fontWeight: 700, color: 'white', margin: 0 }}>{passRate}%</p>
          </div>
          <div style={styles.card}>
            <p style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '4px' }}>Installed</p>
            <p style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '28px', fontWeight: 700, color: 'white', margin: 0 }}>{currentProject.installedPiles.toLocaleString()}</p>
          </div>
          <div style={styles.card}>
            <p style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '4px' }}>Refusals</p>
            <p style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '28px', fontWeight: 700, color: '#f97316', margin: 0 }}>{refusals.length}</p>
          </div>
        </div>
        
        <div style={styles.card}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <button 
              onClick={() => setCurrentView('inspection')}
              style={{ ...styles.button, background: '#22c55e', color: 'white', padding: '16px' }}
            >
              Start QC Inspection
            </button>
            <button 
              onClick={() => setCurrentView('refusal')}
              style={{ ...styles.button, background: '#ea580c', color: 'white', padding: '16px' }}
            >
              Log Refusal
            </button>
          </div>
        </div>
      </div>
    )
  }
  
  const renderInspection = () => {
    const pileId = `${currentRow}-${currentPile}`
    
    return (
      <div style={{ maxWidth: '500px', margin: '0 auto' }}>
        <h1 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '20px', fontWeight: 700, color: 'white', marginBottom: '16px' }}>
          QC Inspection
        </h1>
        
        <div style={styles.pileDisplay}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '16px' }}>
            <button 
              onClick={() => setCurrentRow(prev => Math.max(1, prev - 1))}
              style={styles.navButton}
            >
              <Icons.chevronLeft />
            </button>
            <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '48px', fontWeight: 700, color: 'white' }}>
              {pileId}
            </span>
            <button 
              onClick={() => setCurrentRow(prev => prev + 1)}
              style={styles.navButton}
            >
              <Icons.chevronRight />
            </button>
          </div>
        </div>
        
        <div style={{ display: 'flex', gap: '16px', marginTop: '24px' }}>
          <button 
            onClick={() => recordInspection('PASS')}
            style={{ ...styles.actionButton, background: '#22c55e', color: 'white' }}
          >
            PASS
          </button>
          <button 
            onClick={() => recordInspection('FAIL')}
            style={{ ...styles.actionButton, background: '#ef4444', color: 'white' }}
          >
            FAIL
          </button>
        </div>
        
        <p style={{ textAlign: 'center', color: '#94a3b8', fontSize: '14px', marginTop: '16px' }}>
          Session: {sessionPassed} passed, {sessionFailed} failed
        </p>
      </div>
    )
  }
  
  const renderRefusal = () => {
    const pileId = `${refusalRow}-${refusalPile}`
    const reasons = ['BEDROCK', 'COBBLE', 'OBSTRUCTION', 'OTHER']
    
    return (
      <div style={{ maxWidth: '500px', margin: '0 auto' }}>
        <h1 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '20px', fontWeight: 700, color: 'white', marginBottom: '16px' }}>
          Log Refusal
        </h1>
        
        <div style={styles.pileDisplay}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '16px' }}>
            <button 
              onClick={() => setRefusalPile(prev => Math.max(1, prev - 1))}
              style={styles.navButton}
            >
              <Icons.chevronLeft />
            </button>
            <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '48px', fontWeight: 700, color: 'white' }}>
              {pileId}
            </span>
            <button 
              onClick={() => setRefusalPile(prev => prev + 1)}
              style={styles.navButton}
            >
              <Icons.chevronRight />
            </button>
          </div>
        </div>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginTop: '24px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '12px', color: '#94a3b8', marginBottom: '8px' }}>Target (mm)</label>
            <input 
              type="number"
              value={targetDepth}
              onChange={(e) => setTargetDepth(parseInt(e.target.value) || 0)}
              style={styles.input}
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '12px', color: '#94a3b8', marginBottom: '8px' }}>Achieved (mm)</label>
            <input 
              type="number"
              value={refusalDepth}
              onChange={(e) => setRefusalDepth(e.target.value)}
              placeholder="Enter depth"
              style={styles.input}
            />
          </div>
        </div>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px', marginTop: '16px' }}>
          {reasons.map(r => (
            <button
              key={r}
              onClick={() => setRefusalReason(r)}
              style={{
                padding: '14px 10px',
                borderRadius: '12px',
                background: refusalReason === r ? 'rgba(245, 158, 11, 0.15)' : '#1e293b',
                border: `2px solid ${refusalReason === r ? '#f59e0b' : 'transparent'}`,
                color: 'white',
                fontSize: '12px',
                textTransform: 'capitalize',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              {r.toLowerCase()}
            </button>
          ))}
        </div>
        
        <button 
          onClick={submitRefusal}
          disabled={!refusalReason}
          style={{ 
            ...styles.button, 
            width: '100%', 
            marginTop: '24px',
            padding: '16px',
            background: refusalReason ? '#ef4444' : '#334155',
            color: refusalReason ? 'white' : '#64748b',
            cursor: refusalReason ? 'pointer' : 'not-allowed',
          }}
        >
          LOG REFUSAL
        </button>
      </div>
    )
  }
  
  const renderHeatmap = () => {
    const rows = 50
    const pilesPerRow = 30
    
    return (
      <div>
        <h1 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '20px', fontWeight: 700, color: 'white', marginBottom: '16px' }}>
          Pile Map
        </h1>
        <div style={{ overflow: 'auto', maxHeight: '70vh' }}>
          <table style={{ borderCollapse: 'collapse' }}>
            <tbody>
              {Array.from({ length: rows }, (_, rowIdx) => {
                const row = rowIdx + 1
                return (
                  <tr key={row}>
                    <td style={{ 
                      position: 'sticky', 
                      left: 0, 
                      background: 'linear-gradient(90deg, #111827 80%, transparent 100%)', 
                      paddingRight: '8px',
                      fontSize: '12px',
                      color: '#64748b'
                    }}>
                      {row}
                    </td>
                    {Array.from({ length: pilesPerRow }, (_, pileIdx) => {
                      const pile = pileIdx + 1
                      const pileId = `${row}-${pile}`
                      const status = getInspectionStatus(pileId)
                      const colorMap: Record<string, string> = {
                        pass: '#22c55e',
                        fail: '#ef4444',
                        refusal: '#f97316',
                        notstarted: '#1e293b'
                      }
                      return (
                        <td key={pile} style={{ padding: '1px' }}>
                          <div 
                            title={`${pileId}: ${status}`}
                            style={{
                              width: '12px',
                              height: '12px',
                              borderRadius: '2px',
                              background: colorMap[status],
                              border: status === 'notstarted' ? '1px solid #334155' : '1px solid rgba(0,0,0,0.2)',
                              cursor: 'pointer',
                              transition: 'transform 0.15s ease',
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.transform = 'scale(1.5)'
                              e.currentTarget.style.zIndex = '10'
                              e.currentTarget.style.boxShadow = '0 0 8px rgba(255,255,255,0.3)'
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.transform = 'scale(1)'
                              e.currentTarget.style.zIndex = '1'
                              e.currentTarget.style.boxShadow = 'none'
                            }}
                          />
                        </td>
                      )
                    })}
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    )
  }
  
  const renderReports = () => {
    return (
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <h1 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '24px', fontWeight: 700, color: 'white', marginBottom: '24px' }}>
          Reports
        </h1>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
          <div style={styles.card}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
              <div style={{ color: '#f59e0b' }}><Icons.fileText /></div>
              <div>
                <h3 style={{ fontWeight: 600, color: 'white', margin: 0 }}>Daily Report</h3>
              </div>
            </div>
            <button style={{ ...styles.button, width: '100%', background: '#f59e0b', color: 'black' }}>
              Export PDF
            </button>
          </div>
          <div style={styles.card}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
              <div style={{ color: '#3b82f6' }}><Icons.calendar /></div>
              <div>
                <h3 style={{ fontWeight: 600, color: 'white', margin: 0 }}>Weekly Report</h3>
              </div>
            </div>
            <button style={{ ...styles.button, width: '100%', background: '#3b82f6', color: 'white' }}>
              Export PDF
            </button>
          </div>
          <div style={styles.card}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
              <div style={{ color: '#22c55e' }}><Icons.barChart /></div>
              <div>
                <h3 style={{ fontWeight: 600, color: 'white', margin: 0 }}>Monthly Report</h3>
              </div>
            </div>
            <button style={{ ...styles.button, width: '100%', background: '#22c55e', color: 'white' }}>
              Export PDF
            </button>
          </div>
        </div>
      </div>
    )
  }
  
  const renderContent = () => {
    switch (currentView) {
      case 'company':
      case 'dashboard':
        return renderDashboard()
      case 'inspection':
        return renderInspection()
      case 'refusal':
        return renderRefusal()
      case 'heatmap':
        return renderHeatmap()
      case 'reports':
        return renderReports()
      default:
        return renderDashboard()
    }
  }
  
  const userName = session?.user?.name || session?.user?.email?.split('@')[0] || 'User'
  const userRole = session?.user?.role || 'user'
  
  return (
    <div style={styles.container}>
      {/* Mobile Header */}
      {isMobile && (
        <div style={styles.mobileHeader}>
          <button 
            onClick={() => setSidebarOpen(!sidebarOpen)}
            style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '8px' }}
          >
            <Icons.menu />
          </button>
          <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, color: 'white' }}>
            SolTrend
          </span>
          <div style={{ width: '36px' }} />
        </div>
      )}
      
      {/* Sidebar Overlay */}
      {isMobile && sidebarOpen && (
        <div 
          onClick={() => setSidebarOpen(false)}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 40 }}
        />
      )}
      
      {/* Sidebar */}
      <aside style={{
        ...styles.sidebar,
        ...(isMobile && !sidebarOpen ? styles.sidebarHidden : {})
      }}>
        {/* Logo */}
        <div style={{ padding: '20px', borderBottom: '1px solid rgba(51, 65, 85, 0.5)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, #f59e0b 0%, #ea580c 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <Icons.trendingUp />
            </div>
            <div>
              <h1 style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: '18px', color: 'white', margin: 0 }}>
                SolTrend
              </h1>
              <p style={{ fontSize: '10px', color: '#64748b', textTransform: 'uppercase', margin: 0 }}>Pro v2.1</p>
            </div>
          </div>
        </div>
        
        {/* Navigation */}
        <nav style={{ flex: 1, padding: '12px 0' }}>
          {navSections.map(section => (
            <div key={section.title} style={{ marginBottom: '16px' }}>
              <h3 style={{ 
                padding: '0 20px', 
                marginBottom: '4px', 
                fontSize: '10px', 
                color: '#64748b', 
                textTransform: 'uppercase' as const 
              }}>
                {section.title}
              </h3>
              {section.items.map(item => {
                const IconComponent = iconMap[item.icon]
                const isActive = currentView === item.id
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setCurrentView(item.id)
                      setSidebarOpen(false)
                    }}
                    style={{
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      padding: '10px 20px',
                      border: 'none',
                      background: isActive ? 'rgba(245, 158, 11, 0.1)' : 'none',
                      color: isActive ? '#f59e0b' : '#94a3b8',
                      textAlign: 'left' as const,
                      cursor: 'pointer',
                      borderLeft: isActive ? '3px solid #f59e0b' : '3px solid transparent',
                      transition: 'all 0.15s ease',
                      fontSize: '14px',
                    }}
                  >
                    {IconComponent && <IconComponent />}
                    {item.label}
                  </button>
                )
              })}
            </div>
          ))}
        </nav>
        
        {/* User info & Logout */}
        <div style={{ padding: '16px', borderTop: '1px solid rgba(51, 65, 85, 0.5)' }}>
          <p style={{ fontSize: '14px', color: 'white', margin: '0 0 4px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {userName}
          </p>
          <p style={{ fontSize: '12px', color: '#64748b', margin: '0 0 12px', textTransform: 'capitalize' }}>
            {userRole}
          </p>
          <button
            onClick={handleLogout}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              padding: '10px',
              background: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              borderRadius: '8px',
              color: '#f87171',
              fontSize: '14px',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
          >
            <Icons.logOut />
            Sign Out
          </button>
        </div>
      </aside>
      
      {/* Main Content */}
      <main style={{
        ...styles.main,
        ...(isMobile ? styles.mainMobile : {})
      }}>
        {renderContent()}
      </main>
    </div>
  )
}
