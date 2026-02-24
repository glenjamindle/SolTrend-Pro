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

  if (status === 'unauthenticated') {
    return null
  }

  if (status === 'loading') {
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
          <p style={{ color: '#94a3b8', fontSize: '14px' }}>Loading SolTrend Pro...</p>
        </div>
      </div>
    )
  }

  return <SolTrendApp />
}

function SolTrendApp() {
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
      <script dangerouslySetInnerHTML={{ __html: `
        window.handleSignOut = async () => {
          try {
            await fetch('/api/auth/signout', { method: 'POST' });
            window.location.href = '/login';
          } catch (e) {
            window.location.href = '/login';
          }
        };
      ` }} />
      <div id="app" dangerouslySetInnerHTML={{ __html: '<div style="min-height:100vh;display:flex;align-items:center;justify-content:center;background:#0c1222;color:white;font-family:\'DM Sans\',sans-serif;"><div style="text-align:center;"><div style="width:48px;height:48px;border-radius:12px;background:linear-gradient(135deg,#f59e0b,#ea580c);display:flex;align-items:center;justify-content:center;margin:0 auto 16px;animation:pulse 1.5s infinite;"><svg width="24" height="24" fill="none" stroke="white" stroke-width="2"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline></svg></div><p style="color:#94a3b8;font-size:14px;">Loading SolTrend Pro...</p></div></div>' }} />
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

          function formatDate(dateStr) { const date = new Date(dateStr); return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }); }
          function formatNumber(num) { return num?.toLocaleString() || '0'; }
          function getPileId(row, pile) { return row + '-' + pile; }
          function parsePileId(id) { const parts = String(id).split('-'); return { row: parseInt(parts[0]) || 1, pile: parseInt(parts[1]) || 1 }; }
          function getInspectionStatus(pileId) {
            const inspection = state.inspections.find(i => i.pileId === pileId);
            if (inspection) return inspection.status;
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

          function triggerPhotoInput(context) { document.getElementById('photoInput-' + context).click(); }
          async function handlePhotoCapture(event, context) {
            const file = event.target.files[0]; if (!file) return; hapticFeedback();
            const maxW = 1280, maxH = 720; const img = new Image(); const reader = new FileReader();
            reader.onload = async (e) => {
              img.src = e.target.result;
              img.onload = async () => {
                const canvas = document.createElement('canvas'); let w = img.width, h = img.height;
                if (w > maxW || h > maxH) { const ratio = Math.min(maxW / w, maxH / h); w = Math.round(w * ratio); h = Math.round(h * ratio); }
                canvas.width = w; canvas.height = h; const ctx = canvas.getContext('2d'); ctx.drawImage(img, 0, 0, w, h);
                const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
                let gps = null;
                if (navigator.geolocation) { try { gps = await new Promise((res, rej) => navigator.geolocation.getCurrentPosition(res, rej, { timeout: 2000 })); gps = { lat: gps.coords.latitude, lng: gps.coords.longitude }; } catch(e) {} }
                const photoObj = { id: 'photo_' + Date.now(), url: dataUrl, timestamp: new Date().toISOString(), gps: gps };
                if (context === 'production') state.productionEntry.photos.push(photoObj);
                else if (context === 'inspection') state.inspectionPhotos.push(photoObj);
                else if (context === 'refusal') state.refusalPhotos.push(photoObj);
                render();
              };
            };
            reader.readAsDataURL(file); event.target.value = '';
          }
          function removePhoto(context, id) {
            hapticFeedback();
            if (context === 'production') state.productionEntry.photos = state.productionEntry.photos.filter(p => p.id !== id);
            else if (context === 'inspection') state.inspectionPhotos = state.inspectionPhotos.filter(p => p.id !== id);
            else if (context === 'refusal') state.refusalPhotos = state.refusalPhotos.filter(p => p.id !== id);
            render();
          }
          function renderPhotoCapture(context) {
            let photos = [];
            if (context === 'production') photos = state.productionEntry.photos;
            else if (context === 'inspection') photos = state.inspectionPhotos;
            else if (context === 'refusal') photos = state.refusalPhotos;
            return '<div class="space-y-2"><input type="file" id="photoInput-' + context + '" accept="image/*" capture="environment" class="hidden" onchange="handlePhotoCapture(event, \\'' + context + '\\')"><div class="flex items-center gap-3"><button onclick="triggerPhotoInput(\\'' + context + '\\')" class="capture-btn flex-1 py-3 rounded-xl flex items-center justify-center gap-2 text-slate-400 hover:text-white">' + icon('camera', 'w-5 h-5') + ' <span class="font-medium text-sm">Add Photo</span></button><button onclick="triggerPhotoInput(\\'' + context + '\\')" class="capture-btn w-12 h-12 rounded-xl flex items-center justify-center text-slate-400 hover:text-white">' + icon('image', 'w-5 h-5') + '</button></div>' + (photos.length > 0 ? '<div class="photo-grid">' + photos.map(p => '<div class="photo-thumb"><img src="' + p.url + '" alt="Photo"><button onclick="removePhoto(\\'' + context + '\\', \\'' + p.id + '\\')" class="photo-delete">' + icon('x', 'w-3 h-3') + '</button></div>').join('') + '</div>' : '') + '</div>';
          }

          const RACKING_MANUFACTURERS = [
            { id: 'gamechange', name: 'GameChange Solar', pileTypes: ['interior', 'exterior', 'motor', 'corner'], tolerances: { interior: { embedmentMin: 72, plumbNS: 1.5 }, motor: { embedmentMin: 96, plumbNS: 0.5 } } },
            { id: 'nextracker', name: 'NEXTracker', pileTypes: ['interior', 'exterior', 'motor', 'boundary'], tolerances: { interior: { embedmentMin: 78, plumbNS: 2.0 } } },
            { id: 'arraytech', name: 'Array Technologies', pileTypes: ['interior', 'exterior', 'motor'], tolerances: { interior: { embedmentMin: 72, plumbNS: 1.75 } } },
            { id: 'ftc', name: 'FTC Solar', pileTypes: ['interior', 'exterior'], tolerances: { interior: { embedmentMin: 72, plumbNS: 2.0 } } },
          ];

          function generateDemoData() {
            state.company = { id: 'comp_001', name: 'Apex Solar Construction', tier: 'enterprise', users: 47 };
            state.projects = [
              { id: 'proj_001', name: 'Desert Sun Solar Farm', location: 'Phoenix, AZ', status: 'active', health: 'green', totalPiles: 750, installedPiles: 542, passedInspections: 489, failedInspections: 23, refusals: 30, client: 'NextEra Energy', startDate: '2024-09-15', plannedEnd: '2025-02-15', rackingProfile: 'gamechange', projectManager: 'Sarah K.', dailyTarget: 35 },
              { id: 'proj_002', name: 'High Plains Array', location: 'Colorado Springs, CO', status: 'completed', health: 'green', totalPiles: 1200, installedPiles: 1200, passedInspections: 1156, failedInspections: 28, refusals: 16, client: 'Xcel Energy', startDate: '2024-06-01', plannedEnd: '2024-11-15', rackingProfile: 'nextracker', projectManager: 'Mike R.' },
            ];
            state.currentProject = state.projects[0];
            state.crews = [{ id: 'crew_001', name: 'Alpha Crew', lead: 'Marcus T.', status: 'active' }, { id: 'crew_002', name: 'Beta Crew', lead: 'Elena V.', status: 'active' }, { id: 'crew_003', name: 'Gamma Crew', lead: 'James K.', status: 'standby' }];
            state.subcontractors = [{ id: 'sub_001', name: 'SolarForce Inc.' }, { id: 'sub_002', name: 'PileDrivers LLC' }];
            
            for (let row = 1; row <= state.heatmap.totalRows; row++) {
              for (let pile = 1; pile <= state.heatmap.pilesPerRow; pile++) {
                const pileId = row + '-' + pile;
                const random = Math.random();
                if (random < 0.65) state.inspections.push({ pileId, status: 'pass', timestamp: Date.now() - Math.random()*3600000*24, user: state.crews[0].lead, depth: Math.floor(1800 + Math.random()*200), plumbNS: (Math.random()*2).toFixed(1), plumbEW: (Math.random()*2).toFixed(1) });
                else if (random < 0.72) state.inspections.push({ pileId, status: 'fail', timestamp: Date.now() - Math.random()*3600000*5, user: state.crews[1].lead, depth: Math.floor(1600 + Math.random()*200), plumbNS: (2 + Math.random()*2).toFixed(1), plumbEW: (Math.random()*2).toFixed(1), failReason: ['plumb', 'depth', 'twist'][Math.floor(Math.random()*3)] });
                else if (random < 0.76) state.refusals.push({ pileId, reason: ['bedrock', 'cobble', 'obstruction'][Math.floor(Math.random()*3)], timestamp: Date.now() - Math.random()*3600000*48, user: state.crews[0].lead, targetDepth: 1800, achievedDepth: Math.floor(800 + Math.random()*600) });
              }
            }
            
            const actions = [ { type: 'pass', msg: 'passed pile' }, { type: 'fail', msg: 'failed pile' }, { type: 'refusal', msg: 'logged refusal at' } ];
            for(let i=0; i<15; i++) {
              const act = actions[Math.floor(Math.random() * actions.length)];
              const row = Math.floor(Math.random() * 50);
              const pile = Math.floor(Math.random() * 30);
              state.recentActivity.push({ type: act.type, message: act.msg + ' ' + row + '-' + pile, time: Math.floor(Math.random() * 60) + 'm ago', user: state.crews[Math.floor(Math.random() * state.crews.length)].lead });
            }
            
            for (let i = 29; i >= 0; i--) {
              const date = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
              state.production.push({ date: date.toISOString().split('T')[0], piles: Math.floor(Math.random() * 20 + 35), crew: state.crews[Math.floor(Math.random() * state.crews.length)].name });
            }
          }

          function renderSidebar() {
            const navSections = [
              { title: 'Overview', items: [{ id: 'company', label: 'Company Dashboard', icon: 'building-2' }] },
              { title: 'Project', items: [
                { id: 'dashboard', label: 'Project Dashboard', icon: 'layout-dashboard' },
                { id: 'production', label: 'Production', icon: 'truck' },
                { id: 'inspection', label: 'QC Inspection', icon: 'clipboard-check' },
                { id: 'refusal', label: 'Refusals', icon: 'alert-triangle' },
                { id: 'heatmap', label: 'Pile Map', icon: 'map' },
              ]},
              { title: 'Analysis', items: [
                { id: 'analytics', label: 'Analytics', icon: 'bar-chart-3' },
                { id: 'reports', label: 'Reports', icon: 'file-text' },
              ]},
              { title: 'Config', items: [
                { id: 'racking', label: 'Racking Profiles', icon: 'sliders-horizontal' },
                { id: 'settings', label: 'Settings', icon: 'settings' },
              ]}
            ];
            return '<aside class="fixed inset-y-0 left-0 z-50 w-60 bg-slate-900/95 border-r border-slate-700/50 transform transition-transform duration-300 ' + (state.sidebarOpen ? 'translate-x-0' : '-translate-x-full') + ' lg:translate-x-0 flex flex-col">' +
              '<div class="p-5 border-b border-slate-700/50"><div class="flex items-center gap-3"><div class="w-9 h-9 rounded-lg bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-lg shadow-amber-500/20">' + icon('trending-up', 'w-5 h-5 text-white') + '</div><div><h1 class="font-display font-bold text-lg text-white">SolTrend</h1><p class="text-[10px] text-slate-500 uppercase tracking-wider">Pro v2.1</p></div></div></div>' +
              (state.projects.length > 0 ? '<div class="p-3 border-b border-slate-700/50"><label class="text-[10px] font-medium text-slate-500 uppercase tracking-wider mb-1.5 block">Active Project</label><select id="projectSelect" class="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white">' + state.projects.filter(p => p.status === 'active').map(p => '<option value="' + p.id + '"' + (state.currentProject?.id === p.id ? ' selected' : '') + '>' + p.name + '</option>').join('') + '</select></div>' : '') +
              '<nav class="flex-1 py-3 overflow-y-auto">' + navSections.map(section => '<div class="mb-4"><h3 class="px-5 mb-1 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">' + section.title + '</h3>' + section.items.map(item => '<button onclick="navigateTo(\\'' + item.id + '\\')" class="nav-item w-full flex items-center gap-3 px-5 py-2.5 text-left text-sm ' + (state.currentView === item.id ? 'active' : 'text-slate-400 hover:text-slate-200') + '">' + icon(item.icon, 'w-4 h-4') + '<span>' + item.label + '</span></button>').join('') + '</div>').join('') + '</nav>' +
              '<div class="p-4 border-t border-slate-700/50 space-y-3"><div class="flex items-center gap-3"><div class="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-sm font-bold">MT</div><div class="flex-1 min-w-0"><p class="text-sm font-medium text-white truncate">' + state.currentUser.name + '</p><p class="text-xs text-slate-500 capitalize">' + state.currentUser.role + '</p></div></div><button onclick="window.handleSignOut()" class="w-full py-2 mt-2 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 rounded-lg text-sm font-medium flex items-center justify-center gap-2 transition-colors"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>Sign Out</button></div>' +
            '</aside>';
          }

          function renderCompanyDashboard() {
            const activeProjects = state.projects.filter(p => p.status === 'active');
            const totalPiles = state.projects.reduce((sum, p) => sum + p.totalPiles, 0);
            const installedPiles = state.projects.reduce((sum, p) => sum + p.installedPiles, 0);
            const todayProd = state.production[state.production.length - 1];
            const weekProd = state.production.slice(-7).reduce((s, p) => s + p.piles, 0);
            return '<div class="space-y-6 stagger-children">' +
              '<div class="flex items-center justify-between"><div><h1 class="font-display text-2xl font-bold text-white">' + state.company.name + '</h1><p class="text-slate-400 text-sm">' + activeProjects.length + ' active projects · ' + state.company.users + ' team members</p></div></div>' +
              '<div class="grid grid-cols-2 lg:grid-cols-4 gap-4">' +
                '<div class="card rounded-xl p-5"><div class="flex items-center justify-between mb-3"><span class="text-slate-400 text-sm">Total Piles</span>' + icon('database', 'w-4 h-4 text-slate-500') + '</div><p class="font-display text-3xl font-bold text-white">' + formatNumber(installedPiles) + '</p><p class="text-xs text-slate-500 mt-1">of ' + formatNumber(totalPiles) + ' planned</p></div>' +
                '<div class="card rounded-xl p-5"><div class="flex items-center justify-between mb-3"><span class="text-slate-400 text-sm">Pass Rate</span>' + icon('check-circle', 'w-4 h-4 text-slate-500') + '</div><p class="font-display text-3xl font-bold text-blue-400">94.2%</p><p class="text-xs text-slate-500 mt-1">+2.1% from last month</p></div>' +
                '<div class="card rounded-xl p-5"><div class="flex items-center justify-between mb-3"><span class="text-slate-400 text-sm">Refusals</span>' + icon('alert-triangle', 'w-4 h-4 text-slate-500') + '</div><p class="font-display text-3xl font-bold text-orange-400">' + state.refusals.length + '</p><p class="text-xs text-slate-500 mt-1">total logged</p></div>' +
                '<div class="card rounded-xl p-5"><div class="flex items-center justify-between mb-3"><span class="text-slate-400 text-sm">Active Crews</span>' + icon('users', 'w-4 h-4 text-slate-500') + '</div><p class="font-display text-3xl font-bold text-green-400">' + state.crews.length + '</p><p class="text-xs text-slate-500 mt-1">' + (state.crews.length * 8) + ' workers</p></div>' +
              '</div>' +
              '<div class="grid grid-cols-3 gap-4">' +
                '<div class="card rounded-xl p-4"><p class="text-xs text-slate-500 uppercase tracking-wider mb-1">Today</p><p class="font-display text-2xl font-bold text-white">' + (todayProd?.piles || 0) + '</p><p class="text-xs text-slate-400">piles installed</p></div>' +
                '<div class="card rounded-xl p-4"><p class="text-xs text-slate-500 uppercase tracking-wider mb-1">This Week</p><p class="font-display text-2xl font-bold text-white">' + weekProd + '</p><p class="text-xs text-slate-400">piles installed</p></div>' +
                '<div class="card rounded-xl p-4"><p class="text-xs text-slate-500 uppercase tracking-wider mb-1">This Month</p><p class="font-display text-2xl font-bold text-white">' + state.production.slice(-30).reduce((s, p) => s + p.piles, 0) + '</p><p class="text-xs text-slate-400">piles installed</p></div>' +
              '</div>' +
              '<div><h2 class="font-display font-semibold text-white mb-4">Active Projects</h2><div class="grid md:grid-cols-2 gap-4">' + state.projects.filter(p => p.status !== 'archived').map(project => {
                const completionPct = Math.round((project.installedPiles / project.totalPiles) * 100);
                const healthColors = { green: 'text-green-400', yellow: 'text-yellow-400', red: 'text-red-400' };
                return '<div class="card rounded-xl p-5 relative group">' +
                  '<div class="flex items-start gap-3 mb-4"><div class="flex items-center gap-2"><span class="' + healthColors[project.health] + ' text-lg">●</span></div><div class="flex-1 min-w-0"><h3 class="font-display font-semibold text-white truncate">' + project.name + '</h3><p class="text-sm text-slate-400">' + project.location + '</p></div></div>' +
                  '<div class="mb-4"><div class="flex items-center justify-between text-sm mb-2"><span class="text-slate-400">' + formatNumber(project.installedPiles) + ' / ' + formatNumber(project.totalPiles) + ' piles</span><span class="font-medium text-white">' + completionPct + '%</span></div><div class="h-2 bg-slate-700 rounded-full overflow-hidden"><div class="h-full bg-gradient-to-r from-amber-500 to-amber-400 rounded-full transition-all" style="width: ' + completionPct + '%"></div></div></div>' +
                  '<button onclick="openProject(\\'' + project.id + '\\')" class="w-full py-2.5 bg-slate-700/50 hover:bg-slate-600 text-slate-300 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2">Open Project ' + icon('arrow-right', 'w-4 h-4') + '</button>' +
                '</div>';
              }).join('') + '</div></div>' +
            '</div>';
          }

          function renderProjectDashboard() {
            const project = state.currentProject; if(!project) return '';
            const completionPct = Math.round((project.installedPiles / project.totalPiles) * 100);
            const passRate = project.passedInspections > 0 ? Math.round((project.passedInspections / (project.passedInspections + project.failedInspections)) * 100) : 0;
            const todayActual = 28;
            const todayTarget = project.dailyTarget || 35;
            const openIssues = project.failedInspections + project.refusals;
            return '<div class="space-y-6 stagger-children">' +
              '<div class="card rounded-xl p-5">' +
                '<div class="flex items-start justify-between mb-4"><div><div class="flex items-center gap-2"><h1 class="font-display text-2xl font-bold text-white">' + project.name + '</h1><span class="px-2 py-0.5 text-xs font-medium rounded bg-green-500/10 text-green-400">' + project.status + '</span></div><p class="text-slate-400 text-sm">' + project.client + ' · ' + project.location + '</p></div><div class="text-right"><p class="text-xs text-slate-500">Project Manager</p><p class="text-sm text-white font-medium">' + project.projectManager + '</p></div></div>' +
                '<div class="h-2 bg-slate-700 rounded-full overflow-hidden mt-4"><div class="h-full bg-gradient-to-r from-green-500 to-green-400 rounded-full transition-all" style="width: ' + completionPct + '%"></div></div>' +
                '<div class="flex justify-between mt-1 text-xs"><span class="text-green-400">' + completionPct + '% Complete</span><span class="text-slate-500">45 days remaining</span></div>' +
              '</div>' +
              '<div class="grid lg:grid-cols-3 gap-4">' +
                '<div class="lg:col-span-2 card rounded-xl p-5">' +
                  '<div class="flex items-center justify-between mb-4"><h3 class="font-display font-semibold text-white">Today\\'s Progress</h3></div>' +
                  '<div class="grid grid-cols-2 gap-4">' +
                    '<div class="bg-slate-800/50 rounded-lg p-4 text-center"><p class="text-xs text-slate-500 uppercase mb-1">Target</p><p class="font-display text-3xl font-bold text-white">' + todayTarget + '</p></div>' +
                    '<div class="bg-slate-800/50 rounded-lg p-4 text-center"><p class="text-xs text-slate-500 uppercase mb-1">Actual</p><p class="font-display text-3xl font-bold text-amber-400">' + todayActual + '</p></div>' +
                  '</div>' +
                  '<div class="mt-4"><p class="text-xs text-slate-500 mb-2">Last 7 Days</p><div class="sparkline">' + state.production.slice(-7).map(p => { const h = Math.max(20, (p.piles / 50) * 100); return '<div class="sparkline-bar" style="height: ' + h + '%"></div>'; }).join('') + '</div></div>' +
                '</div>' +
                '<div class="card rounded-xl p-5 flex flex-col justify-center gap-3">' +
                  '<button onclick="navigateTo(\\'inspection\\')" class="w-full py-3 bg-green-600 hover:bg-green-500 text-white rounded-lg font-medium text-sm flex items-center justify-center gap-2 transition-colors">' + icon('clipboard-check', 'w-5 h-5') + ' Start QC</button>' +
                  '<button onclick="navigateTo(\\'refusal\\')" class="w-full py-3 bg-orange-600 hover:bg-orange-500 text-white rounded-lg font-medium text-sm flex items-center justify-center gap-2 transition-colors">' + icon('alert-triangle', 'w-5 h-5') + ' Log Refusal</button>' +
                  '<button onclick="navigateTo(\\'production\\')" class="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-medium text-sm flex items-center justify-center gap-2 transition-colors">' + icon('truck', 'w-5 h-5') + ' Log Production</button>' +
                  '<button onclick="navigateTo(\\'heatmap\\')" class="w-full py-3 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-lg font-medium text-sm flex items-center justify-center gap-2 transition-colors">' + icon('map', 'w-5 h-5') + ' View Map</button>' +
                '</div>' +
              '</div>' +
              '<div class="grid lg:grid-cols-3 gap-4">' +
                '<div class="space-y-3">' +
                  '<div class="card rounded-xl p-4 flex items-center justify-between"><div><p class="text-xs text-slate-500">Pass Rate</p><p class="font-display text-xl font-bold text-white">' + passRate + '%</p></div><div class="w-12 h-12 rounded-full border-4 border-green-500 flex items-center justify-center text-green-400 font-bold">' + passRate + '</div></div>' +
                  '<div class="card rounded-xl p-4 flex items-center justify-between"><div><p class="text-xs text-slate-500">Open Issues</p><p class="font-display text-xl font-bold text-white">' + openIssues + '</p></div><div class="w-12 h-12 rounded-full border-4 border-red-500 flex items-center justify-center text-red-400 font-bold">' + openIssues + '</div></div>' +
                  '<div class="card rounded-xl p-4"><p class="text-xs text-slate-500 mb-2">Active Profile</p><p class="text-sm font-medium text-white">' + (RACKING_MANUFACTURERS.find(m => m.id === project.rackingProfile)?.name || 'N/A') + '</p></div>' +
                '</div>' +
                '<div class="card rounded-xl p-5"><h3 class="font-display font-semibold text-white mb-3 flex items-center justify-between">Needs Attention <span class="text-xs px-2 py-0.5 rounded bg-red-500/20 text-red-400">' + openIssues + '</span></h3><div class="space-y-2 max-h-48 overflow-y-auto">' + state.inspections.filter(i => i.status === 'fail').slice(0, 3).map(i => '<div class="flex items-center justify-between p-2 bg-slate-800/50 rounded-lg text-xs"><span class="text-slate-300">' + i.pileId + '</span><span class="text-red-400">Failed</span></div>').join('') + state.refusals.slice(0, 2).map(r => '<div class="flex items-center justify-between p-2 bg-slate-800/50 rounded-lg text-xs"><span class="text-slate-300">' + r.pileId + '</span><span class="text-orange-400">Refusal</span></div>').join('') + '</div></div>' +
                '<div class="card rounded-xl p-5"><h3 class="font-display font-semibold text-white mb-3">Recent Activity</h3><div class="space-y-3 max-h-48 overflow-y-auto">' + state.recentActivity.slice(0, 5).map(a => '<div class="activity-item ' + a.type + ' pl-4 py-1"><p class="text-sm text-slate-300">' + a.message + '</p><p class="text-xs text-slate-500">' + a.user + ' · ' + a.time + '</p></div>').join('') + '</div></div>' +
              '</div>' +
            '</div>';
          }

          function renderRackingProfiles() {
            return '<div class="space-y-6 animate-fade-in"><div class="flex items-center justify-between"><div><h1 class="font-display text-2xl font-bold text-white">Racking Profiles</h1><p class="text-slate-400">Tolerance configurations</p></div></div><div class="grid lg:grid-cols-2 gap-4 stagger-children">' +
              RACKING_MANUFACTURERS.map(mfr => '<div class="card rounded-xl overflow-hidden"><div class="p-5 border-b border-slate-700/50"><h3 class="font-display font-semibold text-white">' + mfr.name + '</h3></div><div class="p-4"><table class="w-full text-sm"><thead><tr class="text-xs text-slate-500 uppercase"><th class="text-left pb-2 font-medium">Type</th><th class="text-center pb-2 font-medium">Embed</th><th class="text-center pb-2 font-medium">Plumb</th></tr></thead><tbody class="text-slate-300">' + mfr.pileTypes.slice(0, 4).map(pt => { const t = mfr.tolerances[pt]; return '<tr class="border-t border-slate-700/30"><td class="py-2 capitalize font-medium">' + pt + '</td><td class="text-center text-slate-400">' + (t?.embedmentMin || '-') + '"</td><td class="text-center text-slate-400">' + (t?.plumbNS || '-') + '°</td></tr>'; }).join('') + '</tbody></table></div></div>').join('') +
            '</div></div>';
          }

          function renderAnalytics() {
            const tabs = [ { id: 'production', label: 'Production', icon: 'trending-up' }, { id: 'quality', label: 'Quality', icon: 'check-circle' }, { id: 'refusals', label: 'Refusals', icon: 'alert-triangle' }, { id: 'schedule', label: 'Schedule', icon: 'calendar' }, { id: 'field', label: 'Field Ops', icon: 'smartphone' }, { id: 'predictive', label: 'Insights', icon: 'brain' } ];
            return '<div class="space-y-6 animate-fade-in"><div class="flex items-center justify-between"><div><h1 class="font-display text-2xl font-bold text-white">Analytics</h1><p class="text-slate-400">Performance insights</p></div></div><div class="flex gap-1 p-1 bg-slate-800/50 rounded-xl overflow-x-auto">' + tabs.map(t => '<button onclick="setAnalyticsTab(\\'' + t.id + '\\')" class="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium whitespace-nowrap transition-all ' + (state.analyticsTab === t.id ? 'bg-amber-500 text-black' : 'text-slate-400 hover:text-white hover:bg-slate-700/50') + '">' + icon(t.icon, 'w-4 h-4') + t.label + '</button>').join('') + '</div><div id="analyticsContent">' + renderAnalyticsContent() + '</div></div>';
          }

          function renderAnalyticsContent() {
            switch(state.analyticsTab) {
              case 'production': return renderProductionAnalytics();
              case 'quality': return renderQualityAnalytics();
              case 'refusals': return renderRefusalAnalytics();
              case 'schedule': return renderScheduleAnalytics();
              case 'field': return renderFieldOpsAnalytics();
              case 'predictive': return renderPredictiveAnalytics();
              default: return renderProductionAnalytics();
            }
          }

          function renderProductionAnalytics() {
            const avgDaily = Math.round(state.production.slice(-14).reduce((s, p) => s + p.piles, 0) / 14);
            const actualWeek = state.production.slice(-7).reduce((s, p) => s + p.piles, 0);
            const prevWeek = state.production.slice(-14, -7).reduce((s, p) => s + p.piles, 0);
            const bestDay = Math.max(...state.production.slice(-14).map(p => p.piles));
            const worstDay = Math.min(...state.production.slice(-14).map(p => p.piles));
            const trendPercent = prevWeek > 0 ? Math.round(((actualWeek - prevWeek) / prevWeek) * 100) : 0;
            return '<div class="space-y-6 stagger-children">' +
              '<div class="grid grid-cols-2 lg:grid-cols-4 gap-4">' +
                '<div class="card rounded-xl p-4"><p class="text-xs text-slate-500 uppercase mb-1">Avg Daily</p><p class="font-display text-2xl font-bold text-white">' + avgDaily + '</p><p class="text-xs ' + (trendPercent >= 0 ? 'text-green-400' : 'text-red-400') + '">' + (trendPercent >= 0 ? '+' : '') + trendPercent + '% vs last week</p></div>' +
                '<div class="card rounded-xl p-4"><p class="text-xs text-slate-500 uppercase mb-1">Weekly Total</p><p class="font-display text-2xl font-bold text-white">' + actualWeek + '</p><p class="text-xs text-slate-400">this week</p></div>' +
                '<div class="card rounded-xl p-4"><p class="text-xs text-slate-500 uppercase mb-1">Best Day</p><p class="font-display text-2xl font-bold text-green-400">' + bestDay + '</p><p class="text-xs text-slate-400">piles</p></div>' +
                '<div class="card rounded-xl p-4"><p class="text-xs text-slate-500 uppercase mb-1">Low Day</p><p class="font-display text-2xl font-bold text-red-400">' + worstDay + '</p><p class="text-xs text-slate-400">piles</p></div>' +
              '</div>' +
              '<div class="card rounded-xl p-5"><h3 class="font-display font-semibold text-white mb-4">14-Day Production Trend</h3><div class="h-48 flex items-end gap-1">' + state.production.slice(-14).map(p => { const h = Math.max(10, (p.piles / 60) * 100); return '<div class="flex-1 relative group"><div class="absolute -top-6 left-1/2 -translate-x-1/2 bg-slate-700 px-1.5 py-0.5 rounded text-xs text-white opacity-0 group-hover:opacity-100 transition-opacity z-10 whitespace-nowrap">' + p.piles + '</div><div class="chart-bar w-full bg-amber-500 rounded-t" style="height: ' + h + '%"></div></div>'; }).join('') + '</div><div class="flex justify-between mt-2 text-xs text-slate-500"><span>14 days ago</span><span>Today</span></div></div>' +
            '</div>';
          }

          function renderQualityAnalytics() {
            const totalInspections = state.inspections.length;
            const passed = state.inspections.filter(i => i.status === 'pass').length;
            const failed = state.inspections.filter(i => i.status === 'fail').length;
            const passRate = totalInspections > 0 ? Math.round((passed / totalInspections) * 100) : 0;
            return '<div class="space-y-6 stagger-children">' +
              '<div class="grid grid-cols-3 gap-4">' +
                '<div class="card rounded-xl p-4"><p class="text-xs text-slate-500 uppercase mb-1">Pass Rate</p><p class="font-display text-3xl font-bold text-green-400">' + passRate + '%</p></div>' +
                '<div class="card rounded-xl p-4"><p class="text-xs text-slate-500 uppercase mb-1">Passed</p><p class="font-display text-3xl font-bold text-white">' + passed + '</p></div>' +
                '<div class="card rounded-xl p-4"><p class="text-xs text-slate-500 uppercase mb-1">Failed</p><p class="font-display text-3xl font-bold text-red-400">' + failed + '</p></div>' +
              '</div>' +
              '<div class="card rounded-xl p-5"><h3 class="font-display font-semibold text-white mb-4">Quality Metrics</h3><p class="text-slate-400 text-sm">Total inspections: ' + totalInspections + '</p></div>' +
            '</div>';
          }

          function renderRefusalAnalytics() {
            const total = state.refusals.length;
            const bedrock = state.refusals.filter(r => r.reason === 'bedrock').length;
            const cobble = state.refusals.filter(r => r.reason === 'cobble').length;
            const obstruction = state.refusals.filter(r => r.reason === 'obstruction').length;
            const other = state.refusals.filter(r => r.reason === 'other').length;
            return '<div class="space-y-6 stagger-children">' +
              '<div class="card rounded-xl p-5"><p class="text-xs text-slate-500 uppercase mb-1">Total Refusals</p><p class="font-display text-4xl font-bold text-orange-400">' + total + '</p></div>' +
              '<div class="grid grid-cols-4 gap-4">' +
                '<div class="card rounded-xl p-4 text-center"><p class="text-2xl font-bold text-white">' + bedrock + '</p><p class="text-xs text-slate-500">Bedrock</p></div>' +
                '<div class="card rounded-xl p-4 text-center"><p class="text-2xl font-bold text-white">' + cobble + '</p><p class="text-xs text-slate-500">Cobble</p></div>' +
                '<div class="card rounded-xl p-4 text-center"><p class="text-2xl font-bold text-white">' + obstruction + '</p><p class="text-xs text-slate-500">Obstruction</p></div>' +
                '<div class="card rounded-xl p-4 text-center"><p class="text-2xl font-bold text-white">' + other + '</p><p class="text-xs text-slate-500">Other</p></div>' +
              '</div>' +
            '</div>';
          }

          function renderScheduleAnalytics() { return '<div class="space-y-6"><div class="card rounded-xl p-5"><h3 class="font-display font-semibold text-white mb-4">Schedule Analytics</h3><p class="text-slate-400">Coming soon</p></div></div>'; }
          function renderFieldOpsAnalytics() { return '<div class="space-y-6"><div class="card rounded-xl p-5"><h3 class="font-display font-semibold text-white mb-4">Field Operations</h3><p class="text-slate-400">Coming soon</p></div></div>'; }
          function renderPredictiveAnalytics() { return '<div class="space-y-6"><div class="card rounded-xl p-5"><h3 class="font-display font-semibold text-white mb-4">Predictive Insights</h3><p class="text-slate-400">Coming soon</p></div></div>'; }

          function renderSettings() {
            return '<div class="space-y-6 animate-fade-in">' +
              '<h1 class="font-display text-2xl font-bold text-white">Settings</h1>' +
              '<div class="card rounded-xl p-5"><p class="text-slate-400">Settings panel coming soon.</p></div>' +
            '</div>';
          }

          function renderHeatMap() {
            let html = '<div class="space-y-4"><h1 class="font-display text-xl font-bold text-white">Pile Map</h1><div class="overflow-auto" style="max-height: 70vh;"><table style="border-collapse: collapse;">';
            for (let row = 1; row <= state.heatmap.totalRows; row++) {
              html += '<tr><td class="row-label text-xs text-slate-500 pr-2">' + row + '</td>';
              for (let pile = 1; pile <= state.heatmap.pilesPerRow; pile++) {
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

          function renderProduction() {
            return '<div class="space-y-6 animate-fade-in max-w-2xl mx-auto">' +
              '<h1 class="font-display text-2xl font-bold text-white">Log Production</h1>' +
              '<div class="card rounded-xl p-5">' +
                '<div class="mb-4"><label class="text-sm text-slate-400 mb-2 block">Crew</label><select class="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white">' + state.crews.map(c => '<option value="' + c.id + '">' + c.name + '</option>').join('') + '</select></div>' +
                '<div class="mb-4"><label class="text-sm text-slate-400 mb-2 block">Piles Installed Today</label><input type="number" placeholder="Enter count" class="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white" /></div>' +
                '<div class="mb-4"><label class="text-sm text-slate-400 mb-2 block">Notes</label><textarea placeholder="Optional notes..." class="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white h-24"></textarea></div>' +
                renderPhotoCapture('production') +
                '<button class="w-full mt-4 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-medium">Save Production Log</button>' +
              '</div>' +
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

          function navigateTo(view) { state.currentView = view; state.sidebarOpen = false; render(); }
          function toggleSidebar() { state.sidebarOpen = !state.sidebarOpen; render(); }
          function openProject(id) { state.currentProject = state.projects.find(p => p.id === id); state.currentView = 'dashboard'; render(); }
          function incRow() { hapticFeedback(); state.currentRow++; render(); }
          function decRow() { hapticFeedback(); if (state.currentRow > 1) state.currentRow--; render(); }
          function incPile() { hapticFeedback(); state.currentPile++; render(); }
          function decPile() { hapticFeedback(); if (state.currentPile > 1) state.currentPile--; render(); }
          function incRefusalPile() { hapticFeedback(); state.refusalPile++; render(); }
          function decRefusalPile() { hapticFeedback(); if (state.refusalPile > 1) state.refusalPile--; render(); }
          function setRefusalReason(reason) { state.refusalReason = reason; render(); }
          function setAnalyticsTab(tab) { state.analyticsTab = tab; render(); }

          async function recordInspection(status) {
            hapticFeedback(); playSound(status);
            const pileId = state.currentRow + '-' + state.currentPile;
            state.inspections.push({ pileId, status: status.toUpperCase(), timestamp: Date.now() });
            state.session[status === 'pass' ? 'passed' : 'failed']++;
            state.currentPile++;
            render();
          }

          function submitRefusal() {
            const pileId = state.refusalRow + '-' + state.refusalPile;
            const achievedDepth = parseInt(document.getElementById('refusalDepth')?.value) || 0;
            state.refusals.push({ pileId, reason: state.refusalReason, targetDepth: state.targetDepth, achievedDepth });
            state.refusalPile++;
            state.refusalReason = null;
            render();
          }

          function generateDailyReport() { alert('Daily report generation coming soon!'); }
          function generateWeeklyReport() { alert('Weekly report generation coming soon!'); }
          function generateMonthlyReport() { alert('Monthly report generation coming soon!'); }

          function render() {
            const views = { 
              company: renderCompanyDashboard, 
              dashboard: renderProjectDashboard, 
              inspection: renderInspection, 
              refusal: renderRefusal, 
              heatmap: renderHeatMap,
              reports: renderReports,
              production: renderProduction,
              analytics: renderAnalytics,
              racking: renderRackingProfiles,
              settings: renderSettings
            };
            const content = views[state.currentView] ? views[state.currentView]() : '<p>View not found</p>';
            document.getElementById('app').innerHTML = renderSidebar() + 
              '<header class="lg:hidden fixed top-0 left-0 right-0 z-40 bg-slate-900/95 backdrop-blur border-b border-slate-700/50 px-4 py-3">' +
                '<div class="flex items-center justify-between">' +
                  '<button onclick="toggleSidebar()" class="p-2 -ml-2 text-slate-300">' + icon('menu', 'w-5 h-5') + '</button>' +
                  '<div class="flex items-center gap-2"><div class="w-8 h-8 rounded-lg bg-amber-500 flex items-center justify-center">' + icon('trending-up', 'w-4 h-4 text-white') + '</div><span class="font-display font-bold text-white">SolTrend</span></div>' +
                  '<div class="w-10"></div>' +
                '</div>' +
              '</header>' +
              '<main class="lg:ml-60 min-h-screen pt-16 lg:pt-0 pb-6">' +
                '<div class="p-4 lg:p-6 max-w-6xl mx-auto">' + content + '</div>' +
              '</main>' +
              (state.sidebarOpen ? '<div onclick="toggleSidebar()" class="lg:hidden fixed inset-0 z-40 bg-black/50"></div>' : '');
            if (window.lucide) lucide.createIcons();
          }

          // Initialize
          generateDemoData();
          render();
        `}
      </Script>
    </>
  )
}
