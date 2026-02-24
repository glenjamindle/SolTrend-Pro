'use client'

import { useSession } from 'next-auth/react'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Script from 'next/script'

export default function AppContent() {
  const { status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    }
  }, [status, router])

  if (status === 'loading' || status === 'unauthenticated') {
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
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
              <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline>
              <polyline points="17 6 23 6 23 12"></polyline>
            </svg>
          </div>
          <p style={{ color: '#94a3b8', fontSize: '14px' }}>
            {status === 'loading' ? 'Loading SolTrend Pro...' : 'Redirecting to login...'}
          </p>
        </div>
      </div>
    )
  }

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: `
        :root {
          --bg: #0c1222;
          --bg-elevated: #111827;
          --bg-card: #1a2332;
          --fg: #f1f5f9;
          --fg-muted: #94a3b8;
          --accent: #f59e0b;
          --accent-hover: #fbbf24;
          --success: #22c55e;
          --danger: #ef4444;
          --warning: #eab308;
          --border: #1e293b;
        }
        * { -webkit-tap-highlight-color: transparent; }
        body { font-family: 'DM Sans', sans-serif; background: var(--bg); color: var(--fg); margin: 0; }
        .font-display { font-family: 'Space Grotesk', sans-serif; }
        ::-webkit-scrollbar { width: 6px; height: 6px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: var(--border); border-radius: 3px; }
        .touch-target { min-height: 44px; min-width: 44px; }
        .btn-action { min-height: 100px; font-size: 1.75rem; font-weight: 700; border-radius: 16px; transition: all 0.1s ease; border: none; cursor: pointer; }
        .btn-action:active { transform: scale(0.95); }
        .pile-display { background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%); border: 2px solid #334155; border-radius: 16px; box-shadow: inset 0 2px 4px rgba(0,0,0,0.3); }
        .nav-arrow { width: 56px; height: 56px; border-radius: 12px; display: flex; align-items: center; justify-content: center; transition: all 0.15s ease; cursor: pointer; user-select: none; border: none; }
        .nav-arrow:active { transform: scale(0.9); }
        .nav-arrow-large { width: 64px; height: 64px; }
        .nav-arrow-small { width: 44px; height: 44px; }
        .mode-btn { flex: 1; padding: 10px 12px; border-radius: 10px; font-weight: 600; font-size: 0.8rem; transition: all 0.15s ease; cursor: pointer; border: none; }
        .mode-btn-active { background: linear-gradient(135deg, #f59e0b 0%, #ea580c 100%); color: white; box-shadow: 0 4px 12px rgba(245, 158, 11, 0.3); }
        .mode-btn-inactive { background: #1e293b; color: #94a3b8; }
        .badge-pass { background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%); color: white; }
        .badge-fail { background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); color: white; }
        .badge-open { background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); color: white; }
        .reason-btn { padding: 14px 10px; border-radius: 12px; background: #1e293b; border: 2px solid transparent; transition: all 0.15s ease; text-align: center; cursor: pointer; }
        .reason-btn-selected { background: rgba(245, 158, 11, 0.15); border-color: #f59e0b; box-shadow: 0 0 20px rgba(245, 158, 11, 0.2); }
        .shortfall-critical { background: rgba(239, 68, 68, 0.2); border: 2px solid #ef4444; border-radius: 12px; }
        .shortfall-warning { background: rgba(234, 179, 8, 0.2); border: 2px solid #eab308; border-radius: 12px; }
        .shortfall-minor { background: rgba(249, 115, 22, 0.2); border: 2px solid #f97316; border-radius: 12px; }
        .photo-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; margin-top: 12px; }
        .photo-thumb { aspect-ratio: 1; border-radius: 8px; overflow: hidden; position: relative; background: #000; border: 1px solid #334155; }
        .photo-thumb img { width: 100%; height: 100%; object-fit: cover; }
        .photo-delete { position: absolute; top: 4px; right: 4px; width: 24px; height: 24px; background: rgba(0,0,0,0.7); border-radius: 50%; display: flex; align-items: center; justify-content: center; cursor: pointer; color: white; border: 1px solid rgba(255,255,255,0.2); }
        .capture-btn { border: 2px dashed #334155; background: rgba(30, 41, 59, 0.5); transition: all 0.15s ease; cursor: pointer; border-radius: 12px; }
        .capture-btn:hover { border-color: #f59e0b; background: rgba(245, 158, 11, 0.05); }
        .heat-cell { width: 100%; aspect-ratio: 1; border-radius: 3px; transition: transform 0.15s ease; cursor: pointer; border: 1px solid rgba(0,0,0,0.2); }
        .heat-cell:hover { transform: scale(1.5); z-index: 10; box-shadow: 0 0 8px rgba(255,255,255,0.3); border-color: white; }
        .row-label { position: sticky; left: 0; background: linear-gradient(90deg, #111827 80%, transparent 100%); z-index: 5; padding-right: 4px; }
        .status-pass { background: #22c55e; }
        .status-fail { background: #ef4444; }
        .status-refusal { background: #f97316; }
        .status-notstarted { background: #1e293b; border-color: #334155; }
        @keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fade-in { animation: slideUp 0.3s ease forwards; }
        .stagger-children > * { opacity: 0; animation: slideUp 0.4s ease forwards; }
        .stagger-children > *:nth-child(1) { animation-delay: 0.03s; }
        .stagger-children > *:nth-child(2) { animation-delay: 0.06s; }
        .stagger-children > *:nth-child(3) { animation-delay: 0.09s; }
        .stagger-children > *:nth-child(4) { animation-delay: 0.12s; }
        .stagger-children > *:nth-child(5) { animation-delay: 0.15s; }
        .stagger-children > *:nth-child(6) { animation-delay: 0.18s; }
        button:focus-visible, input:focus-visible, select:focus-visible { outline: 2px solid var(--accent); outline-offset: 2px; }
        .modal-backdrop { background: rgba(0, 0, 0, 0.85); backdrop-filter: blur(8px); }
        .nav-item { transition: all 0.15s ease; border: none; background: none; cursor: pointer; text-align: left; }
        .nav-item:hover { background: rgba(255,255,255,0.05); }
        .nav-item.active { background: rgba(245, 158, 11, 0.1); color: #f59e0b; border-left: 3px solid #f59e0b; }
        .card { background: linear-gradient(135deg, #1a2332 0%, #111827 100%); border: 1px solid #1e293b; }
        .card:hover { border-color: #334155; }
        .activity-item { border-left: 2px solid #334155; position: relative; }
        .activity-item::before { content: ''; position: absolute; left: -5px; top: 0; bottom: 0; width: 8px; height: 8px; background: #334155; border-radius: 50%; top: 50%; transform: translateY(-50%); }
        .activity-item.pass::before { background: #22c55e; }
        .activity-item.fail::before { background: #ef4444; }
        .activity-item.refusal::before { background: #f97316; }
        .sparkline { display: flex; align-items: flex-end; gap: 2px; height: 40px; }
        .sparkline-bar { flex: 1; background: linear-gradient(to top, #f59e0b, #fbbf24); border-radius: 2px; }
        .chart-bar { transition: all 0.2s ease; }
        .chart-bar:hover { filter: brightness(1.2); }
        .donut-chart { position: relative; width: 120px; height: 120px; }
        .donut-ring { fill: none; stroke-width: 12; }
        .donut-segment { fill: none; stroke-width: 12; stroke-linecap: round; }
        .donut-center { position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); text-align: center; }
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
      ` }} />
      <div id="app" dangerouslySetInnerHTML={{ __html: '<p style="color: white; padding: 20px;">Loading SolTrend Pro v2.1...</p>' }} />
      <Script src="https://cdn.tailwindcss.com" strategy="beforeInteractive" />
      <Script src="https://unpkg.com/lucide@latest/dist/umd/lucide.min.js" strategy="afterInteractive" />
      <Script id="soltrend-app" strategy="afterInteractive">
        {`
          const state = {
            currentView: 'company',
            currentUser: { id: 'user_001', name: 'Marcus Thompson', role: 'admin' },
            currentProject: null,
            inspectionMode: 'quick',
            refusalMode: 'quick',
            sidebarOpen: false,
            isOnline: navigator.onLine,
            analyticsTab: 'production',
            reportDates: {
              daily: new Date().toISOString().split('T')[0],
              weekly: new Date().toISOString().split('T')[0],
              monthly: new Date().getFullYear() + '-' + String(new Date().getMonth() + 1).padStart(2, '0'),
              qcStart: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
              qcEnd: new Date().toISOString().split('T')[0]
            },
            company: null,
            projects: [],
            inspections: [],
            refusals: [],
            production: [],
            crews: [],
            subcontractors: [],
            recentActivity: [],
            currentRow: 35, currentPile: 22,
            inspectionPhotos: [], lastInspection: null,
            session: { passed: 0, failed: 0 },
            refusalRow: 35, refusalPile: 22,
            targetDepth: 1800, achievedDepth: null, refusalReason: null, refusalPhotos: [],
            openRefusals: 8,
            productionEntry: { crew: null, subcontractor: null, notes: '', photos: [] },
            isListening: false,
            heatmap: { zoom: 1, totalRows: 50, pilesPerRow: 30 }
          };

          // Utility functions
          function formatDate(dateStr) { const date = new Date(dateStr); return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }); }
          function formatNumber(num) { return num?.toLocaleString() || '0'; }
          function getPileId(row, pile) { return row + '-' + pile; }
          function parsePileId(id) { const parts = String(id).split('-'); return { row: parseInt(parts[0]) || 1, pile: parseInt(parts[1]) || 1 }; }
          function getInspectionStatus(pileId) {
            const inspection = state.inspections.find(i => i.pileId === pileId);
            if (inspection) return inspection.status.toLowerCase();
            const refusal = state.refusals.find(r => r.pileId === pileId);
            if (refusal) return 'refusal';
            return 'notstarted';
          }
          function hapticFeedback() { if ('vibrate' in navigator) navigator.vibrate(10); }
          function playSound(type) {
            try {
              const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
              const oscillator = audioCtx.createOscillator();
              const gainNode = audioCtx.createGain();
              oscillator.connect(gainNode);
              gainNode.connect(audioCtx.destination);
              oscillator.frequency.value = type === 'pass' ? 880 : 220;
              gainNode.gain.value = 0.1;
              oscillator.start();
              oscillator.stop(audioCtx.currentTime + 0.1);
            } catch(e) {}
          }
          function icon(name, className = '') { return '<i data-lucide="' + name + '" class="' + className + '"></i>'; }

          // API Helper
          async function apiCall(endpoint, options = {}) {
            try {
              const res = await fetch(endpoint, { ...options, credentials: 'include' });
              if (res.status === 401) { window.location.href = '/login'; return null; }
              if (!res.ok) { console.error('API error:', res.status); return null; }
              return await res.json();
            } catch (err) {
              console.error('API call failed:', err);
              return null;
            }
          }

          // Load data from API
          async function loadDataFromAPI() {
            const projects = await apiCall('/api/projects');
            if (projects && projects.length > 0) {
              state.projects = projects;
              state.currentProject = projects.find(p => p.status === 'ACTIVE') || projects[0];
              state.company = { id: 'live', name: projects[0]?.company?.name || 'Solar Construction', tier: 'ENTERPRISE', users: 47 };
              
              if (state.currentProject) {
                const [inspData, refData, prodData] = await Promise.all([
                  apiCall('/api/inspections?projectId=' + state.currentProject.id),
                  apiCall('/api/refusals?projectId=' + state.currentProject.id),
                  apiCall('/api/production?projectId=' + state.currentProject.id)
                ]);
                if (inspData) state.inspections = inspData.inspections || [];
                if (refData) state.refusals = refData.refusals || [];
                if (prodData) state.production = prodData.production || [];
              }
              return true;
            }
            return false;
          }

          // Fallback demo data
          function generateDemoData() {
            state.company = { id: 'comp_001', name: 'Demo Mode', tier: 'STANDARD', users: 1 };
            state.projects = [{ id: 'demo_001', name: 'Demo Project', location: 'Phoenix, AZ', status: 'ACTIVE', health: 'GREEN', totalPiles: 1500, installedPiles: 542, passedInspections: 489, failedInspections: 23, refusalCount: 30, client: 'Demo Client', startDate: '2024-09-15', plannedEndDate: '2025-02-15', dailyTarget: 35 }];
            state.currentProject = state.projects[0];
            state.crews = [{ id: 'crew_001', name: 'Alpha Crew', lead: 'Demo', status: 'ACTIVE' }];
            for (let row = 1; row <= 50; row++) {
              for (let pile = 1; pile <= 30; pile++) {
                const pileId = row + '-' + pile;
                const random = Math.random();
                if (random < 0.65) state.inspections.push({ pileId, status: 'PASS', timestamp: Date.now() - Math.random()*3600000*24, depth: Math.floor(1800 + Math.random()*200) });
                else if (random < 0.72) state.inspections.push({ pileId, status: 'FAIL', timestamp: Date.now() - Math.random()*3600000*5 });
              }
            }
          }

          // Initialize
          async function initializeApp() {
            document.getElementById('app').innerHTML = '<div style="min-height:100vh;display:flex;align-items:center;justify-content:center;background:#0c1222;color:white;"><div style="text-align:center;"><div style="width:48px;height:48px;border-radius:12px;background:linear-gradient(135deg,#f59e0b,#ea580c);display:flex;align-items:center;justify-content:center;margin:0 auto 16px;animation:pulse 1.5s infinite;"><svg width="24" height="24" fill="none" stroke="white" stroke-width="2"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline></svg></div><p style="color:#94a3b8;font-size:14px;">Loading SolTrend Pro...</p></div></div>';
            
            const apiLoaded = await loadDataFromAPI();
            if (!apiLoaded) generateDemoData();
            
            render();
          }

          // Render functions (simplified)
          function renderSidebar() {
            const navSections = [
              { title: 'Overview', items: [{ id: 'company', label: 'Dashboard', icon: 'building-2' }] },
              { title: 'Project', items: [
                { id: 'dashboard', label: 'Project', icon: 'layout-dashboard' },
                { id: 'inspection', label: 'QC Inspection', icon: 'clipboard-check' },
                { id: 'refusal', label: 'Refusals', icon: 'alert-triangle' },
                { id: 'heatmap', label: 'Pile Map', icon: 'map' },
                { id: 'reports', label: 'Reports', icon: 'file-text' },
              ]},
            ];
            return '<aside class="fixed inset-y-0 left-0 z-50 w-60 bg-slate-900/95 border-r border-slate-700/50 transform transition-transform duration-300 ' + (state.sidebarOpen ? 'translate-x-0' : '-translate-x-full') + ' lg:translate-x-0 flex flex-col">' +
              '<div class="p-5 border-b border-slate-700/50"><div class="flex items-center gap-3"><div class="w-9 h-9 rounded-lg bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center">' + icon('trending-up', 'w-5 h-5 text-white') + '</div><div><h1 class="font-display font-bold text-lg text-white">SolTrend</h1><p class="text-[10px] text-slate-500 uppercase">Pro v2.1</p></div></div></div>' +
              '<nav class="flex-1 py-3">' + navSections.map(s => '<div class="mb-4"><h3 class="px-5 mb-1 text-[10px] text-slate-500 uppercase">' + s.title + '</h3>' + s.items.map(item => '<button onclick="navigateTo(\\'' + item.id + '\\')" class="nav-item w-full flex items-center gap-3 px-5 py-2.5 text-sm ' + (state.currentView === item.id ? 'active' : 'text-slate-400') + '">' + icon(item.icon, 'w-4 h-4') + item.label + '</button>').join('') + '</div>').join('') + '</nav>' +
              '<div class="p-4 border-t border-slate-700/50"><p class="text-sm text-white truncate">' + state.currentUser.name + '</p><p class="text-xs text-slate-500 capitalize">' + state.currentUser.role + '</p></div>' +
            '</aside>';
          }

          function renderDashboard() {
            const project = state.currentProject;
            if (!project) return '<p class="text-white">No project selected</p>';
            const completionPct = Math.round((project.installedPiles / project.totalPiles) * 100);
            const passRate = project.passedInspections > 0 ? Math.round((project.passedInspections / (project.passedInspections + project.failedInspections)) * 100) : 0;
            
            return '<div class="space-y-6 stagger-children">' +
              '<div class="card rounded-xl p-5"><h1 class="font-display text-2xl font-bold text-white">' + project.name + '</h1><p class="text-slate-400 text-sm">' + project.client + ' · ' + project.location + '</p>' +
              '<div class="h-2 bg-slate-700 rounded-full mt-4"><div class="h-full bg-gradient-to-r from-green-500 to-green-400 rounded-full" style="width: ' + completionPct + '%"></div></div>' +
              '<p class="text-green-400 text-xs mt-1">' + completionPct + '% Complete</p></div>' +
              '<div class="grid grid-cols-3 gap-4">' +
                '<div class="card rounded-xl p-4"><p class="text-xs text-slate-500">Pass Rate</p><p class="font-display text-2xl font-bold text-white">' + passRate + '%</p></div>' +
                '<div class="card rounded-xl p-4"><p class="text-xs text-slate-500">Installed</p><p class="font-display text-2xl font-bold text-white">' + project.installedPiles + '</p></div>' +
                '<div class="card rounded-xl p-4"><p class="text-xs text-slate-500">Refusals</p><p class="font-display text-2xl font-bold text-orange-400">' + state.refusals.length + '</p></div>' +
              '</div>' +
              '<div class="card rounded-xl p-5 flex flex-col gap-3">' +
                '<button onclick="navigateTo(\\'inspection\\')" class="w-full py-3 bg-green-600 hover:bg-green-500 text-white rounded-lg font-medium">Start QC Inspection</button>' +
                '<button onclick="navigateTo(\\'refusal\\')" class="w-full py-3 bg-orange-600 hover:bg-orange-500 text-white rounded-lg font-medium">Log Refusal</button>' +
              '</div>' +
            '</div>';
          }

          function renderHeatMap() {
            let html = '<div class="space-y-4"><h1 class="font-display text-xl font-bold text-white">Pile Map</h1><div class="overflow-auto" style="max-height: 70vh;"><table style="border-collapse: collapse;">';
            for (let row = 1; row <= 50; row++) {
              html += '<tr><td class="row-label text-xs text-slate-500 pr-2">' + row + '</td>';
              for (let pile = 1; pile <= 30; pile++) {
                const pileId = row + '-' + pile;
                const status = getInspectionStatus(pileId);
                html += '<td><div class="heat-cell status-' + status + '" title="' + pileId + ': ' + status + '"></div></td>';
              }
              html += '</tr>';
            }
            html += '</table></div></div>';
            return html;
          }

          function renderInspection() {
            const pid = state.currentRow + '-' + state.currentPile;
            return '<div class="space-y-4 animate-fade-in max-w-lg mx-auto">' +
              '<h1 class="font-display text-xl font-bold text-white">QC Inspection</h1>' +
              '<div class="pile-display p-6"><div class="flex items-center justify-center gap-4">' +
                '<button onclick="decRow()" class="nav-arrow bg-slate-700 text-white">' + icon('chevron-left', 'w-6 h-6') + '</button>' +
                '<span class="font-display text-5xl font-bold text-white">' + pid + '</span>' +
                '<button onclick="incRow()" class="nav-arrow bg-slate-700 text-white">' + icon('chevron-right', 'w-6 h-6') + '</button>' +
              '</div></div>' +
              '<div class="grid grid-cols-2 gap-4">' +
                '<button onclick="recordInspection(\\'pass\\')" class="btn-action bg-green-600 hover:bg-green-500 text-white">PASS</button>' +
                '<button onclick="recordInspection(\\'fail\\')" class="btn-action bg-red-600 hover:bg-red-500 text-white">FAIL</button>' +
              '</div>' +
              '<p class="text-center text-slate-500 text-sm">Session: ' + state.session.passed + ' passed, ' + state.session.failed + ' failed</p>' +
            '</div>';
          }

          function renderRefusal() {
            const pid = state.refusalRow + '-' + state.refusalPile;
            return '<div class="space-y-4 animate-fade-in max-w-lg mx-auto">' +
              '<h1 class="font-display text-xl font-bold text-white">Log Refusal</h1>' +
              '<div class="pile-display p-6"><div class="flex items-center justify-center gap-4">' +
                '<button onclick="decRefusalPile()" class="nav-arrow bg-slate-700 text-white">' + icon('chevron-left', 'w-6 h-6') + '</button>' +
                '<span class="font-display text-5xl font-bold text-white">' + pid + '</span>' +
                '<button onclick="incRefusalPile()" class="nav-arrow bg-slate-700 text-white">' + icon('chevron-right', 'w-6 h-6') + '</button>' +
              '</div></div>' +
              '<div class="grid grid-cols-2 gap-3">' +
                '<input type="number" placeholder="Target (mm)" value="' + state.targetDepth + '" class="w-full bg-slate-800 border border-slate-600 rounded-xl px-4 py-3 text-white">' +
                '<input type="number" id="refusalDepth" placeholder="Achieved (mm)" class="w-full bg-slate-800 border border-slate-600 rounded-xl px-4 py-3 text-white">' +
              '</div>' +
              '<div class="grid grid-cols-4 gap-2">' +
                ['BEDROCK', 'COBBLE', 'OBSTRUCTION', 'OTHER'].map(r => '<button onclick="setRefusalReason(\\'' + r + '\\')" class="reason-btn ' + (state.refusalReason===r?'reason-btn-selected':'') + '"><span class="text-xs text-white capitalize">' + r.toLowerCase() + '</span></button>').join('') +
              '</div>' +
              '<button onclick="submitRefusal()" class="w-full py-4 bg-red-600 text-white rounded-xl font-bold">LOG REFUSAL</button>' +
            '</div>';
          }

          function renderReports() {
            return '<div class="space-y-6 animate-fade-in">' +
              '<h1 class="font-display text-2xl font-bold text-white">Reports</h1>' +
              '<div class="grid md:grid-cols-3 gap-4">' +
                '<div class="card rounded-xl p-5">' +
                  '<div class="flex items-center gap-3 mb-4">' + icon('file-text', 'w-8 h-8 text-amber-400') + '<div><h3 class="font-semibold text-white">Daily Report</h3></div></div>' +
                  '<button onclick="generateDailyReport()" class="w-full py-2.5 bg-amber-500 text-black rounded-lg font-medium">Export PDF</button>' +
                '</div>' +
                '<div class="card rounded-xl p-5">' +
                  '<div class="flex items-center gap-3 mb-4">' + icon('calendar', 'w-8 h-8 text-blue-400') + '<div><h3 class="font-semibold text-white">Weekly Report</h3></div></div>' +
                  '<button onclick="generateWeeklyReport()" class="w-full py-2.5 bg-blue-500 text-white rounded-lg font-medium">Export PDF</button>' +
                '</div>' +
                '<div class="card rounded-xl p-5">' +
                  '<div class="flex items-center gap-3 mb-4">' + icon('bar-chart', 'w-8 h-8 text-green-400') + '<div><h3 class="font-semibold text-white">Monthly Report</h3></div></div>' +
                  '<button onclick="generateMonthlyReport()" class="w-full py-2.5 bg-green-500 text-white rounded-lg font-medium">Export PDF</button>' +
                '</div>' +
              '</div>' +
            '</div>';
          }

          // Navigation and actions
          function navigateTo(view) { state.currentView = view; state.sidebarOpen = false; render(); }
          function toggleSidebar() { state.sidebarOpen = !state.sidebarOpen; render(); }
          function incRow() { hapticFeedback(); state.currentRow++; render(); }
          function decRow() { hapticFeedback(); if (state.currentRow > 1) state.currentRow--; render(); }
          function incPile() { hapticFeedback(); state.currentPile++; render(); }
          function decPile() { hapticFeedback(); if (state.currentPile > 1) state.currentPile--; render(); }
          function incRefusalPile() { hapticFeedback(); state.refusalPile++; render(); }
          function decRefusalPile() { hapticFeedback(); if (state.refusalPile > 1) state.refusalPile--; render(); }
          function setRefusalReason(reason) { state.refusalReason = reason; render(); }

          async function recordInspection(status) {
            hapticFeedback(); playSound(status);
            const pileId = state.currentRow + '-' + state.currentPile;
            
            // Try to save to API
            if (state.currentProject?.id) {
              await apiCall('/api/inspections', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  projectId: state.currentProject.id,
                  pileId: pileId,
                  status: status.toUpperCase()
                })
              });
            }
            
            // Update local state
            state.inspections.push({ pileId, status: status.toUpperCase(), timestamp: Date.now() });
            state.session[status === 'pass' ? 'passed' : 'failed']++;
            state.currentPile++;
            render();
          }

          async function submitRefusal() {
            const pileId = state.refusalRow + '-' + state.refusalPile;
            const achievedDepth = parseInt(document.getElementById('refusalDepth')?.value) || 0;
            
            if (state.currentProject?.id && state.refusalReason) {
              await apiCall('/api/refusals', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  projectId: state.currentProject.id,
                  pileId: pileId,
                  reason: state.refusalReason,
                  targetDepth: state.targetDepth,
                  achievedDepth: achievedDepth
                })
              });
            }
            
            state.refusals.push({ pileId, reason: state.refusalReason, targetDepth: state.targetDepth, achievedDepth });
            state.refusalPile++;
            state.refusalReason = null;
            render();
          }

          // Report generation (placeholder)
          function generateDailyReport() { alert('Daily report generation coming soon!'); }
          function generateWeeklyReport() { alert('Weekly report generation coming soon!'); }
          function generateMonthlyReport() { alert('Monthly report generation coming soon!'); }

          // Main render
          function render() {
            const views = { 
              company: renderDashboard, 
              dashboard: renderDashboard, 
              inspection: renderInspection, 
              refusal: renderRefusal, 
              heatmap: renderHeatMap,
              reports: renderReports 
            };
            const content = views[state.currentView] ? views[state.currentView]() : '<p>View not found</p>';
            document.getElementById('app').innerHTML = renderSidebar() + 
              '<header class="lg:hidden fixed top-0 left-0 right-0 z-40 bg-slate-900/95 border-b border-slate-700/50 px-4 py-3">' +
                '<div class="flex items-center justify-between">' +
                  '<button onclick="toggleSidebar()" class="p-2 text-slate-300">' + icon('menu', 'w-5 h-5') + '</button>' +
                  '<span class="font-display font-bold text-white">SolTrend</span>' +
                  '<div class="w-10"></div>' +
                '</div>' +
              '</header>' +
              '<main class="lg:ml-60 min-h-screen pt-16 lg:pt-0 pb-6">' +
                '<div class="p-4 lg:p-6 max-w-6xl mx-auto">' + content + '</div>' +
              '</main>' +
              (state.sidebarOpen ? '<div onclick="toggleSidebar()" class="lg:hidden fixed inset-0 z-40 bg-black/50"></div>' : '');
            if (window.lucide) lucide.createIcons();
          }

          // Keyboard shortcuts
          document.addEventListener('keydown', (e) => {
            if (state.currentView !== 'inspection') return;
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
            if (e.key === 'p' || e.key === 'P') recordInspection('pass');
            else if (e.key === 'f' || e.key === 'F') recordInspection('fail');
          });

          // Start app
          initializeApp();
        `}
      </Script>
    </>
  )
}
