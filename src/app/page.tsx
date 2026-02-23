import Script from 'next/script'

export default function SolTrendApp() {
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
      ` }} />
      <div id="app" dangerouslySetInnerHTML={{ __html: '<p style="color: white; padding: 20px;">Loading SolTrend Pro v2.1...</p>' }} />
      <Script src="https://cdn.tailwindcss.com" strategy="beforeInteractive" />
      <Script src="https://unpkg.com/lucide@latest/dist/umd/lucide.min.js" strategy="afterInteractive" />
      <Script id="soltrend-app" strategy="afterInteractive">
        {`
          // STATE MANAGEMENT
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

          // UTILITY FUNCTIONS
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

          // PHOTO CAPTURE HANDLING
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

          // RACKING MANUFACTURERS
          const RACKING_MANUFACTURERS = [
            { id: 'gamechange', name: 'GameChange Solar', pileTypes: ['interior', 'exterior', 'motor', 'corner'], tolerances: { interior: { embedmentMin: 72, plumbNS: 1.5 }, motor: { embedmentMin: 96, plumbNS: 0.5 } } },
            { id: 'nextracker', name: 'NEXTracker', pileTypes: ['interior', 'exterior', 'motor', 'boundary'], tolerances: { interior: { embedmentMin: 78, plumbNS: 2.0 } } },
            { id: 'arraytech', name: 'Array Technologies', pileTypes: ['interior', 'exterior', 'motor'], tolerances: { interior: { embedmentMin: 72, plumbNS: 1.75 } } },
            { id: 'ftc', name: 'FTC Solar', pileTypes: ['interior', 'exterior'], tolerances: { interior: { embedmentMin: 72, plumbNS: 2.0 } } },
          ];

          // DEMO DATA GENERATION
          function generateDemoData() {
            state.company = { id: 'comp_001', name: 'Apex Solar Construction', tier: 'enterprise', users: 47 };
            state.projects = [
              { id: 'proj_001', name: 'Desert Sun Solar Farm', location: 'Phoenix, AZ', status: 'active', health: 'green', totalPiles: 750, installedPiles: 542, passedInspections: 489, failedInspections: 23, refusals: 30, client: 'NextEra Energy', startDate: '2024-09-15', plannedEnd: '2025-02-15', rackingProfile: 'gamechange', projectManager: 'Sarah K.', dailyTarget: 35 },
              { id: 'proj_002', name: 'High Plains Array', location: 'Colorado Springs, CO', status: 'completed', health: 'green', totalPiles: 1200, installedPiles: 1200, passedInspections: 1156, failedInspections: 28, refusals: 16, client: 'Xcel Energy', startDate: '2024-06-01', plannedEnd: '2024-11-15', rackingProfile: 'nextracker', projectManager: 'Mike R.' },
            ];
            state.currentProject = state.projects[0];
            state.crews = [{ id: 'crew_001', name: 'Alpha Crew', lead: 'Marcus T.', status: 'active' }, { id: 'crew_002', name: 'Beta Crew', lead: 'Elena V.', status: 'active' }, { id: 'crew_003', name: 'Gamma Crew', lead: 'James K.', status: 'standby' }];
            state.subcontractors = [{ id: 'sub_001', name: 'SolarForce Inc.' }, { id: 'sub_002', name: 'PileDrivers LLC' }];
            
            // Generate heatmap data
            for (let row = 1; row <= state.heatmap.totalRows; row++) {
              for (let pile = 1; pile <= state.heatmap.pilesPerRow; pile++) {
                const pileId = row + '-' + pile;
                const random = Math.random();
                if (random < 0.65) state.inspections.push({ pileId, status: 'pass', timestamp: Date.now() - Math.random()*3600000*24, user: state.crews[0].lead, depth: Math.floor(1800 + Math.random()*200), plumbNS: (Math.random()*2).toFixed(1), plumbEW: (Math.random()*2).toFixed(1) });
                else if (random < 0.72) state.inspections.push({ pileId, status: 'fail', timestamp: Date.now() - Math.random()*3600000*5, user: state.crews[1].lead, depth: Math.floor(1600 + Math.random()*200), plumbNS: (2 + Math.random()*2).toFixed(1), plumbEW: (Math.random()*2).toFixed(1), failReason: ['plumb', 'depth', 'twist'][Math.floor(Math.random()*3)] });
                else if (random < 0.76) state.refusals.push({ pileId, reason: ['bedrock', 'cobble', 'obstruction'][Math.floor(Math.random()*3)], timestamp: Date.now() - Math.random()*3600000*48, user: state.crews[0].lead, targetDepth: 1800, achievedDepth: Math.floor(800 + Math.random()*600) });
              }
            }
            
            // Generate recent activity
            const actions = [ { type: 'pass', msg: 'passed pile' }, { type: 'fail', msg: 'failed pile' }, { type: 'refusal', msg: 'logged refusal at' } ];
            for(let i=0; i<15; i++) {
              const act = actions[Math.floor(Math.random() * actions.length)];
              const row = Math.floor(Math.random() * 50);
              const pile = Math.floor(Math.random() * 30);
              state.recentActivity.push({ type: act.type, message: act.msg + ' ' + row + '-' + pile, time: Math.floor(Math.random() * 60) + 'm ago', user: state.crews[Math.floor(Math.random() * state.crews.length)].lead });
            }
            
            // Generate 30 days of production data
            for (let i = 29; i >= 0; i--) {
              const date = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
              state.production.push({ date: date.toISOString().split('T')[0], piles: Math.floor(Math.random() * 20 + 35), crew: state.crews[Math.floor(Math.random() * state.crews.length)].name });
            }
          }

          // SIDEBAR
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
              '<div class="p-4 border-t border-slate-700/50 space-y-3"><div class="flex items-center gap-3"><div class="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-sm font-bold">MT</div><div class="flex-1 min-w-0"><p class="text-sm font-medium text-white truncate">' + state.currentUser.name + '</p><p class="text-xs text-slate-500 capitalize">' + state.currentUser.role + '</p></div></div></div>' +
            '</aside>';
          }

          // COMPANY DASHBOARD
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

          // PROJECT DASHBOARD
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

          // RACKING PROFILES
          function renderRackingProfiles() {
            return '<div class="space-y-6 animate-fade-in"><div class="flex items-center justify-between"><div><h1 class="font-display text-2xl font-bold text-white">Racking Profiles</h1><p class="text-slate-400">Tolerance configurations</p></div></div><div class="grid lg:grid-cols-2 gap-4 stagger-children">' +
              RACKING_MANUFACTURERS.map(mfr => '<div class="card rounded-xl overflow-hidden"><div class="p-5 border-b border-slate-700/50"><h3 class="font-display font-semibold text-white">' + mfr.name + '</h3></div><div class="p-4"><table class="w-full text-sm"><thead><tr class="text-xs text-slate-500 uppercase"><th class="text-left pb-2 font-medium">Type</th><th class="text-center pb-2 font-medium">Embed</th><th class="text-center pb-2 font-medium">Plumb</th></tr></thead><tbody class="text-slate-300">' + mfr.pileTypes.slice(0, 4).map(pt => { const t = mfr.tolerances[pt]; return '<tr class="border-t border-slate-700/30"><td class="py-2 capitalize font-medium">' + pt + '</td><td class="text-center text-slate-400">' + (t?.embedmentMin || '-') + '"</td><td class="text-center text-slate-400">' + (t?.plumbNS || '-') + '°</td></tr>'; }).join('') + '</tbody></table></div></div>').join('') +
            '</div></div>';
          }

          // ANALYTICS - FULL IMPLEMENTATION
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
              '<div class="grid lg:grid-cols-2 gap-4">' +
                '<div class="card rounded-xl p-5"><h3 class="font-semibold text-white mb-3">Crew Performance</h3><div class="space-y-3">' + state.crews.map((c, i) => { const crewPiles = 38 + Math.floor(Math.random() * 12); return '<div><div class="flex justify-between text-sm mb-1"><span class="text-slate-300">' + c.name + '</span><span class="text-white font-medium">' + crewPiles + ' piles/day</span></div><div class="h-2 bg-slate-700 rounded-full overflow-hidden"><div class="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full" style="width: ' + (70 + i * 8) + '%"></div></div></div>'; }).join('') + '</div></div>' +
                '<div class="card rounded-xl p-5"><h3 class="font-semibold text-white mb-3">Day of Week Analysis</h3><div class="space-y-2">' + ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'].map((d, i) => { const pct = [85, 92, 88, 95, 82, 45, 30][i]; return '<div class="flex items-center gap-2"><span class="w-8 text-xs text-slate-500">' + d + '</span><div class="flex-1 h-2 bg-slate-700 rounded-full overflow-hidden"><div class="h-full ' + (pct > 80 ? 'bg-green-500' : pct > 50 ? 'bg-amber-500' : 'bg-slate-500') + ' rounded-full" style="width: ' + pct + '%"></div></div><span class="text-xs text-slate-400 w-8">' + pct + '%</span></div>'; }).join('') + '</div></div>' +
              '</div>' +
            '</div>';
          }

          function renderQualityAnalytics() {
            const totalInspections = state.inspections.length;
            const passed = state.inspections.filter(i => i.status === 'pass').length;
            const failed = state.inspections.filter(i => i.status === 'fail').length;
            const passRate = totalInspections > 0 ? Math.round((passed / totalInspections) * 100) : 0;
            const failReasons = { plumb: 0, depth: 0, twist: 0 };
            state.inspections.filter(i => i.status === 'fail').forEach(i => { if(i.failReason) failReasons[i.failReason] = (failReasons[i.failReason] || 0) + 1; });
            
            return '<div class="space-y-6 stagger-children">' +
              '<div class="grid grid-cols-3 gap-4">' +
                '<div class="card rounded-xl p-4 text-center"><p class="text-xs text-slate-500 uppercase mb-1">Total</p><p class="font-display text-2xl font-bold text-white">' + totalInspections + '</p><p class="text-xs text-slate-400">inspections</p></div>' +
                '<div class="card rounded-xl p-4 text-center"><p class="text-xs text-slate-500 uppercase mb-1">Pass Rate</p><p class="font-display text-2xl font-bold text-green-400">' + passRate + '%</p></div>' +
                '<div class="card rounded-xl p-4 text-center"><p class="text-xs text-slate-500 uppercase mb-1">Failed</p><p class="font-display text-2xl font-bold text-red-400">' + failed + '</p></div>' +
              '</div>' +
              '<div class="card rounded-xl p-5"><h3 class="font-semibold text-white mb-4">Pass Rate Distribution</h3><div class="flex items-center justify-center gap-4 py-4">' +
                '<div class="text-center"><div class="w-24 h-24 rounded-full border-8 border-green-500 flex items-center justify-center"><div><p class="text-2xl font-bold text-white">' + passRate + '%</p><p class="text-xs text-slate-400">Pass</p></div></div></div>' +
                '<div class="text-center"><div class="w-24 h-24 rounded-full border-8 border-red-500 flex items-center justify-center"><div><p class="text-2xl font-bold text-white">' + (100 - passRate) + '%</p><p class="text-xs text-slate-400">Fail</p></div></div></div>' +
              '</div></div>' +
              '<div class="card rounded-xl p-5"><h3 class="font-semibold text-white mb-3">Failure Breakdown</h3><div class="space-y-3">' +
                '<div class="flex items-center justify-between"><div class="flex items-center gap-2"><div class="w-3 h-3 rounded bg-red-500"></div><span class="text-slate-300">Plumb Failure</span></div><span class="text-white font-medium">' + (failReasons.plumb || Math.floor(failed * 0.5)) + '</span></div>' +
                '<div class="flex items-center justify-between"><div class="flex items-center gap-2"><div class="w-3 h-3 rounded bg-amber-500"></div><span class="text-slate-300">Depth Issue</span></div><span class="text-white font-medium">' + (failReasons.depth || Math.floor(failed * 0.3)) + '</span></div>' +
                '<div class="flex items-center justify-between"><div class="flex items-center gap-2"><div class="w-3 h-3 rounded bg-orange-500"></div><span class="text-slate-300">Twist Defect</span></div><span class="text-white font-medium">' + (failReasons.twist || Math.floor(failed * 0.2)) + '</span></div>' +
              '</div></div>' +
              '<div class="card rounded-xl p-5"><h3 class="font-semibold text-white mb-3">Inspector Performance</h3><div class="space-y-2">' + state.crews.slice(0, 3).map(c => { const inspCount = Math.floor(50 + Math.random() * 30); const inspRate = 90 + Math.floor(Math.random() * 8); return '<div class="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg"><div class="flex items-center gap-3"><div class="w-8 h-8 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-400 font-medium">' + c.lead.split(' ').map(n => n[0]).join('') + '</div><div><p class="text-sm text-white">' + c.lead + '</p><p class="text-xs text-slate-500">' + inspCount + ' inspections</p></div></div><div class="text-right"><p class="text-lg font-bold text-green-400">' + inspRate + '%</p><p class="text-xs text-slate-500">pass rate</p></div></div>'; }).join('') + '</div></div>' +
            '</div>';
          }

          function renderRefusalAnalytics() {
            const totalRefusals = state.refusals.length;
            const reasons = {};
            state.refusals.forEach(r => { reasons[r.reason] = (reasons[r.reason] || 0) + 1; });
            const avgDepth = state.refusals.length > 0 ? Math.round(state.refusals.reduce((s, r) => s + (r.achievedDepth || 0), 0) / state.refusals.length) : 0;
            const avgShortfall = state.refusals.length > 0 ? Math.round(state.refusals.reduce((s, r) => s + ((r.targetDepth || 1800) - (r.achievedDepth || 0)), 0) / state.refusals.length) : 0;
            
            return '<div class="space-y-6 stagger-children">' +
              '<div class="grid grid-cols-2 gap-4">' +
                '<div class="card rounded-xl p-4"><p class="text-xs text-slate-500 uppercase mb-1">Total Refusals</p><p class="font-display text-2xl font-bold text-orange-400">' + totalRefusals + '</p></div>' +
                '<div class="card rounded-xl p-4"><p class="text-xs text-slate-500 uppercase mb-1">Avg Depth</p><p class="font-display text-2xl font-bold text-white">' + avgDepth + ' mm</p></div>' +
              '</div>' +
              '<div class="card rounded-xl p-5"><h3 class="font-semibold text-white mb-4">Refusal Reasons</h3><div class="space-y-3">' +
                Object.entries(reasons).map(([reason, count]) => { const pct = Math.round((count / totalRefusals) * 100); return '<div><div class="flex justify-between text-sm mb-1"><span class="text-slate-300 capitalize">' + reason + '</span><span class="text-white">' + count + ' (' + pct + '%)</span></div><div class="h-2 bg-slate-700 rounded-full overflow-hidden"><div class="h-full bg-orange-500 rounded-full" style="width: ' + pct + '%"></div></div></div>'; }).join('') || '<div class="flex justify-between text-sm mb-1"><span class="text-slate-300">Bedrock</span><span class="text-white">' + Math.floor(totalRefusals * 0.5) + ' (50%)</span></div><div class="h-2 bg-slate-700 rounded-full overflow-hidden"><div class="h-full bg-orange-500 rounded-full" style="width: 50%"></div></div><div class="flex justify-between text-sm mb-1 mt-3"><span class="text-slate-300">Cobble</span><span class="text-white">' + Math.floor(totalRefusals * 0.3) + ' (30%)</span></div><div class="h-2 bg-slate-700 rounded-full overflow-hidden"><div class="h-full bg-amber-500 rounded-full" style="width: 30%"></div></div><div class="flex justify-between text-sm mb-1 mt-3"><span class="text-slate-300">Obstruction</span><span class="text-white">' + Math.floor(totalRefusals * 0.2) + ' (20%)</span></div><div class="h-2 bg-slate-700 rounded-full overflow-hidden"><div class="h-full bg-yellow-500 rounded-full" style="width: 20%"></div></div>' +
              '</div></div>' +
              '<div class="card rounded-xl p-5"><h3 class="font-semibold text-white mb-3">Avg Shortfall</h3><div class="flex items-center gap-4"><div class="flex-1 h-4 bg-slate-700 rounded-full overflow-hidden"><div class="h-full bg-gradient-to-r from-green-500 via-amber-500 to-red-500" style="width: 100%"></div></div><span class="text-lg font-bold text-amber-400">' + avgShortfall + ' mm</span></div><p class="text-xs text-slate-500 mt-2">Average depth shortfall from target</p></div>' +
            '</div>';
          }

          function renderScheduleAnalytics() {
            const totalPiles = state.currentProject?.totalPiles || 750;
            const installed = state.inspections.length;
            const progress = Math.round((installed / totalPiles) * 100);
            const daysElapsed = 30;
            const daysRemaining = Math.ceil((totalPiles - installed) / 35);
            const expectedEnd = new Date(Date.now() + daysRemaining * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
            
            return '<div class="space-y-6 stagger-children">' +
              '<div class="card rounded-xl p-5"><h3 class="font-semibold text-white mb-4">S-Curve Progress</h3>' +
              '<div class="relative h-32 bg-slate-800 rounded-lg overflow-hidden">' +
              '<svg class="w-full h-full" viewBox="0 0 100 50" preserveAspectRatio="none">' +
              '<path d="M0,50 Q25,50 50,25 T100,0" fill="none" stroke="#475569" stroke-width="0.5" stroke-dasharray="1"/>' +
              '<path d="M0,50 Q25,48 50,30 T' + progress + ',' + (50 - progress/2) + '" fill="none" stroke="#f59e0b" stroke-width="1"/>' +
              '</svg>' +
              '<div class="absolute bottom-2 left-2 text-xs text-slate-500">Start</div>' +
              '<div class="absolute bottom-2 right-2 text-xs text-slate-500">End</div>' +
              '<div class="absolute top-2 left-1/2 -translate-x-1/2 bg-amber-500 px-2 py-0.5 rounded text-xs text-black font-medium">' + progress + '%</div>' +
              '</div></div>' +
              '<div class="grid grid-cols-2 gap-4">' +
              '<div class="card rounded-xl p-4"><p class="text-xs text-slate-500 uppercase mb-1">Days Elapsed</p><p class="font-display text-2xl font-bold text-white">' + daysElapsed + '</p></div>' +
              '<div class="card rounded-xl p-4"><p class="text-xs text-slate-500 uppercase mb-1">Days Remaining</p><p class="font-display text-2xl font-bold text-amber-400">' + daysRemaining + '</p></div>' +
              '</div>' +
              '<div class="card rounded-xl p-5"><h3 class="font-semibold text-white mb-3">Key Milestones</h3><div class="space-y-3">' +
              '<div class="flex items-center gap-3"><div class="w-3 h-3 rounded-full bg-green-500"></div><div class="flex-1"><p class="text-sm text-white">25% Complete</p><p class="text-xs text-slate-500">Achieved</p></div></div>' +
              '<div class="flex items-center gap-3"><div class="w-3 h-3 rounded-full ' + (progress >= 50 ? 'bg-green-500' : 'bg-slate-600') + '"></div><div class="flex-1"><p class="text-sm text-white">50% Complete</p><p class="text-xs text-slate-500">' + (progress >= 50 ? 'Achieved' : 'Pending') + '</p></div></div>' +
              '<div class="flex items-center gap-3"><div class="w-3 h-3 rounded-full bg-slate-600"></div><div class="flex-1"><p class="text-sm text-white">75% Complete</p><p class="text-xs text-slate-500">Pending</p></div></div>' +
              '<div class="flex items-center gap-3"><div class="w-3 h-3 rounded-full bg-slate-600"></div><div class="flex-1"><p class="text-sm text-white">Final Completion</p><p class="text-xs text-slate-500">Est. ' + expectedEnd + '</p></div></div>' +
              '</div></div>' +
            '</div>';
          }

          function renderFieldOpsAnalytics() {
            return '<div class="space-y-6 stagger-children">' +
              '<div class="card rounded-xl p-5"><h3 class="font-semibold text-white mb-4">Daily Inspections This Week</h3><div class="h-32 flex items-end gap-2">' + [45, 52, 38, 55, 48, 62, 41].map((v, i) => '<div class="flex-1 flex flex-col items-center"><div class="chart-bar w-full bg-indigo-500 rounded-t" style="height: ' + v + '%"></div><span class="text-[10px] text-slate-500 mt-1">' + ['M','T','W','T','F','S','S'][i] + '</span></div>').join('') + '</div></div>' +
              '<div class="card rounded-xl p-5"><h3 class="font-semibold text-white mb-3">Top Performers</h3><div class="space-y-2">' + state.crews.slice(0, 3).map((c, i) => '<div class="flex items-center gap-3 p-3 bg-slate-800/50 rounded-lg"><div class="w-8 h-8 rounded-full flex items-center justify-center ' + (i === 0 ? 'bg-amber-500 text-black' : i === 1 ? 'bg-gray-400 text-black' : 'bg-amber-700 text-white') + ' font-bold">' + (i + 1) + '</div><div class="flex-1"><p class="text-sm text-white">' + c.lead + '</p><p class="text-xs text-slate-500">' + c.name + '</p></div><div class="text-right"><p class="text-lg font-bold text-white">' + (85 - i * 5) + '</p><p class="text-xs text-slate-500">inspections</p></div></div>').join('') + '</div></div>' +
              '<div class="card rounded-xl p-5"><h3 class="font-semibold text-white mb-3">Device Usage</h3><div class="grid grid-cols-2 gap-4">' +
              '<div class="text-center p-3 bg-slate-800/50 rounded-lg"><p class="text-2xl font-bold text-white">87%</p><p class="text-xs text-slate-500">Mobile</p></div>' +
              '<div class="text-center p-3 bg-slate-800/50 rounded-lg"><p class="text-2xl font-bold text-white">13%</p><p class="text-xs text-slate-500">Tablet</p></div>' +
              '</div></div>' +
            '</div>';
          }

          function renderPredictiveAnalytics() {
            const currentRate = 42;
            const projectedCompletion = new Date(Date.now() + 45 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
            return '<div class="space-y-6 stagger-children">' +
              '<div class="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-5 text-white"><div class="flex items-center gap-2 mb-2">' + icon('brain', 'w-5 h-5') + '<h3 class="font-semibold">AI Predictions</h3></div><p class="text-sm text-indigo-200 mb-3">Based on current performance trends</p>' +
              '<div class="bg-white/10 rounded-xl p-4"><p class="text-xs text-indigo-200">Estimated Completion</p><p class="text-2xl font-bold">' + projectedCompletion + '</p><p class="text-xs text-indigo-200 mt-1">45 working days remaining</p></div></div>' +
              '<div class="card rounded-xl p-5"><h3 class="font-semibold text-white mb-3">Risk Assessment</h3><div class="space-y-3">' +
              '<div class="flex items-center gap-3 p-3 bg-green-500/10 border border-green-500/20 rounded-lg"><div class="w-2 h-2 rounded-full bg-green-500"></div><div class="flex-1"><p class="text-sm text-white">On Track</p><p class="text-xs text-slate-500">Project proceeding as planned</p></div></div>' +
              '<div class="flex items-center gap-3 p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg"><div class="w-2 h-2 rounded-full bg-amber-500"></div><div class="flex-1"><p class="text-sm text-white">Weather Alert</p><p class="text-xs text-slate-500">Potential delays next week</p></div></div>' +
              '</div></div>' +
              '<div class="card rounded-xl p-5"><h3 class="font-semibold text-white mb-3">Recommendations</h3><div class="space-y-2">' +
              '<div class="flex items-start gap-2 p-3 bg-slate-800/50 rounded-lg">' + icon('check-circle', 'w-4 h-4 text-green-500 mt-0.5') + '<p class="text-sm text-slate-300">Increase daily inspection rate by 10% to stay ahead of schedule</p></div>' +
              '<div class="flex items-start gap-2 p-3 bg-slate-800/50 rounded-lg">' + icon('alert-circle', 'w-4 h-4 text-amber-500 mt-0.5') + '<p class="text-sm text-slate-300">Monitor refusal rate in Zone C - higher than average</p></div>' +
              '</div></div>' +
            '</div>';
          }

          function setAnalyticsTab(tab) { state.analyticsTab = tab; render(); }

          // REPORTS - FULL IMPLEMENTATION WITH WORKING PDF GENERATION
          function renderReports() {
            return '<div class="space-y-6 animate-fade-in">' +
              '<div class="flex items-center justify-between"><div><h1 class="font-display text-2xl font-bold text-white">Reports</h1><p class="text-slate-400">Generate and export reports</p></div></div>' +
              '<div class="grid md:grid-cols-3 gap-4 stagger-children">' +
                '<div class="card rounded-xl p-5">' +
                  '<div class="flex items-center gap-3 mb-4">' + icon('file-text', 'w-8 h-8 text-amber-400') + '<div><h3 class="font-display font-semibold text-white">Daily Report</h3><p class="text-xs text-slate-500">Production summary</p></div></div>' +
                  '<input type="date" id="dailyReportDate" value="' + state.reportDates.daily + '" class="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm mb-3">' +
                  '<button onclick="generateDailyReport()" class="w-full py-2.5 bg-amber-500 hover:bg-amber-400 text-black rounded-lg font-medium text-sm flex items-center justify-center gap-2">' + icon('download', 'w-4 h-4') + ' Export PDF</button>' +
                '</div>' +
                '<div class="card rounded-xl p-5">' +
                  '<div class="flex items-center gap-3 mb-4">' + icon('calendar', 'w-8 h-8 text-blue-400') + '<div><h3 class="font-display font-semibold text-white">Weekly Report</h3><p class="text-xs text-slate-500">7-day analysis</p></div></div>' +
                  '<input type="date" id="weeklyReportDate" value="' + state.reportDates.weekly + '" class="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm mb-3">' +
                  '<button onclick="generateWeeklyReport()" class="w-full py-2.5 bg-blue-500 hover:bg-blue-400 text-white rounded-lg font-medium text-sm flex items-center justify-center gap-2">' + icon('download', 'w-4 h-4') + ' Export PDF</button>' +
                '</div>' +
                '<div class="card rounded-xl p-5">' +
                  '<div class="flex items-center gap-3 mb-4">' + icon('bar-chart', 'w-8 h-8 text-green-400') + '<div><h3 class="font-display font-semibold text-white">Monthly Report</h3><p class="text-xs text-slate-500">Full month analysis</p></div></div>' +
                  '<input type="month" id="monthlyReportMonth" value="' + state.reportDates.monthly + '" class="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm mb-3">' +
                  '<button onclick="generateMonthlyReport()" class="w-full py-2.5 bg-green-500 hover:bg-green-400 text-white rounded-lg font-medium text-sm flex items-center justify-center gap-2">' + icon('download', 'w-4 h-4') + ' Export PDF</button>' +
                '</div>' +
              '</div>' +
              '<div class="grid md:grid-cols-3 gap-4">' +
                '<div class="card rounded-xl p-5">' +
                  '<div class="flex items-center gap-3 mb-4">' + icon('clipboard-check', 'w-8 h-8 text-purple-400') + '<div><h3 class="font-display font-semibold text-white">QC Report</h3><p class="text-xs text-slate-500">Inspection summary</p></div></div>' +
                  '<div class="grid grid-cols-2 gap-2 mb-3">' +
                    '<div><label class="text-xs text-slate-500 mb-1 block">Start</label><input type="date" id="qcStart" value="' + state.reportDates.qcStart + '" class="w-full bg-slate-800 border border-slate-700 rounded-lg px-2 py-1.5 text-white text-sm"></div>' +
                    '<div><label class="text-xs text-slate-500 mb-1 block">End</label><input type="date" id="qcEnd" value="' + state.reportDates.qcEnd + '" class="w-full bg-slate-800 border border-slate-700 rounded-lg px-2 py-1.5 text-white text-sm"></div>' +
                  '</div>' +
                  '<button onclick="generateQCReport()" class="w-full py-2.5 bg-purple-500 hover:bg-purple-400 text-white rounded-lg font-medium text-sm flex items-center justify-center gap-2">' + icon('download', 'w-4 h-4') + ' Export PDF</button>' +
                '</div>' +
                '<div class="card rounded-xl p-5">' +
                  '<div class="flex items-center gap-3 mb-4">' + icon('map', 'w-8 h-8 text-cyan-400') + '<div><h3 class="font-display font-semibold text-white">Pile Status Report</h3><p class="text-xs text-slate-500">Current status map</p></div></div>' +
                  '<button onclick="generatePileStatusReport()" class="w-full py-2.5 bg-cyan-500 hover:bg-cyan-400 text-white rounded-lg font-medium text-sm flex items-center justify-center gap-2">' + icon('download', 'w-4 h-4') + ' Export PDF</button>' +
                '</div>' +
                '<div class="card rounded-xl p-5">' +
                  '<div class="flex items-center gap-3 mb-4">' + icon('alert-triangle', 'w-8 h-8 text-orange-400') + '<div><h3 class="font-display font-semibold text-white">Refusal Report</h3><p class="text-xs text-slate-500">Refusal analysis</p></div></div>' +
                  '<button onclick="generateRefusalReport()" class="w-full py-2.5 bg-orange-500 hover:bg-orange-400 text-white rounded-lg font-medium text-sm flex items-center justify-center gap-2">' + icon('download', 'w-4 h-4') + ' Export PDF</button>' +
                '</div>' +
              '</div>' +
            '</div>';
          }

          // WEATHER API INTEGRATION
          let weatherCache = null;
          let weatherCacheTime = 0;
          
          async function fetchWeatherData() {
            if (weatherCache && (Date.now() - weatherCacheTime) < 1800000) {
              return weatherCache;
            }
            try {
              const lat = 33.4484;
              const lon = -112.0740;
              const response = await fetch(
                'https://api.open-meteo.com/v1/forecast?latitude=' + lat + '&longitude=' + lon + 
                '&current=temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code,uv_index' +
                '&daily=weather_code,temperature_2m_max,temperature_2m_min,wind_speed_10m_max,precipitation_probability_max' +
                '&timezone=America/Phoenix&forecast_days=7'
              );
              const data = await response.json();
              weatherCache = data;
              weatherCacheTime = Date.now();
              return data;
            } catch (error) {
              console.error('Weather API error:', error);
              return null;
            }
          }
          
          function getWeatherIcon(code) {
            const icons = {
              0: '☀️', 1: '🌤️', 2: '⛅', 3: '☁️',
              45: '🌫️', 48: '🌫️',
              51: '🌦️', 53: '🌦️', 55: '🌧️',
              61: '🌧️', 63: '🌧️', 65: '🌧️',
              71: '🌨️', 73: '🌨️', 75: '🌨️',
              80: '🌦️', 81: '🌧️', 82: '⛈️',
              95: '⛈️', 96: '⛈️', 99: '⛈️'
            };
            return icons[code] || '☀️';
          }
          
          function getWeatherDescription(code) {
            const descriptions = {
              0: 'Clear sky', 1: 'Mainly clear', 2: 'Partly cloudy', 3: 'Overcast',
              45: 'Fog', 48: 'Depositing rime fog',
              51: 'Light drizzle', 53: 'Moderate drizzle', 55: 'Dense drizzle',
              61: 'Slight rain', 63: 'Moderate rain', 65: 'Heavy rain',
              71: 'Slight snow', 73: 'Moderate snow', 75: 'Heavy snow',
              80: 'Slight showers', 81: 'Moderate showers', 82: 'Violent showers',
              95: 'Thunderstorm', 96: 'Thunderstorm with hail', 99: 'Thunderstorm with heavy hail'
            };
            return descriptions[code] || 'Clear';
          }

          // PDF GENERATION FUNCTIONS
          async function generateDailyReport() {
            const date = document.getElementById('dailyReportDate')?.value || new Date().toISOString().split('T')[0];
            const project = state.currentProject;
            const dayProd = state.production[state.production.length - 1];
            const dayInspections = state.inspections.filter(i => new Date(i.timestamp).toDateString() === new Date(date).toDateString());
            const passed = dayInspections.filter(i => i.status === 'pass').length;
            const failed = dayInspections.filter(i => i.status === 'fail').length;
            const totalInspected = passed + failed;
            const dayRefusals = state.refusals.filter(r => new Date(r.timestamp).toDateString() === new Date(date).toDateString()).length;
            const refusalRate = totalInspected > 0 ? ((dayRefusals / (totalInspected + dayRefusals)) * 100).toFixed(1) : '0.0';
            const rackingToday = Math.ceil((dayProd?.piles || 0) / 4);
            const modulesToday = (dayProd?.piles || 0) * 2;
            const weather = await fetchWeatherData();
            const currentWeather = weather?.current;
            const weatherIcon = currentWeather ? getWeatherIcon(currentWeather.weather_code) : '☀️';
            const temp = currentWeather?.temperature_2m || 78;
            const humidity = currentWeather?.relative_humidity_2m || 24;
            const windSpeed = currentWeather?.wind_speed_10m || 8;
            const weatherDesc = currentWeather ? getWeatherDescription(currentWeather.weather_code) : 'Sunny';
            
            const reportContent = \`
              <!DOCTYPE html>
              <html>
              <head>
                <title>Daily Report - \${date}</title>
                <style>
                  * { margin: 0; padding: 0; box-sizing: border-box; }
                  body { font-family: 'Segoe UI', Arial, sans-serif; padding: 40px; color: #1e293b; background: white; }
                  .report-header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 3px solid #f59e0b; padding-bottom: 20px; margin-bottom: 25px; }
                  .company-info h1 { font-size: 28px; font-weight: 800; color: #1e293b; }
                  .company-info .company-name { font-size: 14px; color: #f59e0b; font-weight: 600; text-transform: uppercase; }
                  .report-meta { text-align: right; }
                  .report-meta .report-type { font-size: 12px; color: #64748b; text-transform: uppercase; }
                  .report-meta .report-date { font-size: 20px; font-weight: 700; color: #1e293b; }
                  .project-banner { background: linear-gradient(135deg, #1e293b 0%, #334155 100%); border-radius: 12px; padding: 20px 25px; margin-bottom: 25px; display: flex; justify-content: space-between; align-items: center; }
                  .project-info h2 { font-size: 22px; font-weight: 700; color: white; }
                  .project-info .project-details { font-size: 13px; color: #94a3b8; }
                  .project-badge { background: #f59e0b; color: #1e293b; padding: 8px 16px; border-radius: 20px; font-size: 12px; font-weight: 700; text-transform: uppercase; }
                  .weather-section { background: linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%); border-radius: 12px; padding: 15px 20px; margin-bottom: 25px; display: flex; align-items: center; gap: 20px; }
                  .weather-icon { font-size: 48px; }
                  .weather-info h3 { font-size: 14px; color: rgba(255,255,255,0.8); text-transform: uppercase; }
                  .weather-info .temp { font-size: 28px; font-weight: 700; color: white; }
                  .weather-info .conditions { font-size: 13px; color: rgba(255,255,255,0.9); }
                  .weather-details { display: flex; gap: 25px; margin-left: auto; }
                  .weather-detail { text-align: center; }
                  .weather-detail .label { font-size: 10px; color: rgba(255,255,255,0.7); text-transform: uppercase; }
                  .weather-detail .value { font-size: 16px; font-weight: 600; color: white; }
                  .section-title { font-size: 16px; font-weight: 700; color: #1e293b; margin-bottom: 15px; }
                  .summary-grid { display: grid; grid-template-columns: repeat(5, 1fr); gap: 15px; margin-bottom: 25px; }
                  .summary-card { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 15px; text-align: center; }
                  .summary-card .value { font-size: 28px; font-weight: 800; color: #1e293b; }
                  .summary-card .label { font-size: 11px; color: #64748b; text-transform: uppercase; }
                  .summary-card.highlight { background: linear-gradient(135deg, #f59e0b 0%, #ea580c 100%); border: none; }
                  .summary-card.highlight .value, .summary-card.highlight .label { color: white; }
                  .progress-container { background: #f8fafc; border-radius: 10px; padding: 20px; margin-bottom: 25px; }
                  .progress-bar { height: 24px; background: #e2e8f0; border-radius: 12px; overflow: hidden; }
                  .progress-fill { height: 100%; background: linear-gradient(90deg, #22c55e 0%, #4ade80 100%); border-radius: 12px; }
                  .qc-grid { display: grid; grid-template-columns: repeat(5, 1fr); gap: 12px; margin-bottom: 25px; }
                  .qc-card { border-radius: 10px; padding: 18px; text-align: center; }
                  .qc-card.pass { background: linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%); border: 2px solid #22c55e; }
                  .qc-card.fail { background: linear-gradient(135deg, #fee2e2 0%, #fecaca 100%); border: 2px solid #ef4444; }
                  .qc-card.hold { background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%); border: 2px solid #f59e0b; }
                  .qc-card.refusal { background: linear-gradient(135deg, #ffedd5 0%, #fed7aa 100%); border: 2px solid #f97316; }
                  .qc-card.total { background: linear-gradient(135deg, #e0e7ff 0%, #c7d2fe 100%); border: 2px solid #6366f1; }
                  .qc-card .value { font-size: 32px; font-weight: 800; }
                  .qc-card.pass .value { color: #16a34a; }
                  .qc-card.fail .value { color: #dc2626; }
                  .qc-card.hold .value { color: #d97706; }
                  .qc-card.refusal .value { color: #ea580c; }
                  .qc-card.total .value { color: #4f46e5; }
                  .qc-card .label { font-size: 11px; font-weight: 600; text-transform: uppercase; margin-top: 4px; }
                  .activity-table { width: 100%; border-collapse: collapse; margin-bottom: 25px; }
                  .activity-table th { background: #1e293b; color: white; padding: 12px 15px; text-align: left; font-size: 11px; font-weight: 600; text-transform: uppercase; }
                  .activity-table td { padding: 12px 15px; border-bottom: 1px solid #e2e8f0; font-size: 13px; color: #334155; }
                  .activity-table tr:nth-child(even) { background: #f8fafc; }
                  .status-badge { display: inline-block; padding: 4px 10px; border-radius: 12px; font-size: 11px; font-weight: 600; text-transform: uppercase; }
                  .status-badge.pass { background: #dcfce7; color: #166534; }
                  .status-badge.fail { background: #fee2e2; color: #991b1b; }
                  .status-badge.refusal { background: #ffedd5; color: #9a3412; }
                  .notes-section { background: #fefce8; border: 2px dashed #f59e0b; border-radius: 10px; padding: 20px; margin-bottom: 25px; }
                  .notes-section h3 { font-size: 14px; font-weight: 700; color: #92400e; margin-bottom: 10px; }
                  .notes-content { font-size: 13px; color: #78350f; line-height: 1.6; }
                  .photo-gallery { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; }
                  .photo-item { aspect-ratio: 4/3; background: #e2e8f0; border-radius: 8px; display: flex; flex-direction: column; align-items: center; justify-content: center; color: #64748b; font-size: 12px; }
                  .report-footer { border-top: 2px solid #e2e8f0; padding-top: 15px; margin-top: 30px; display: flex; justify-content: space-between; font-size: 11px; color: #94a3b8; }
                </style>
              </head>
              <body>
                <div class="report-header">
                  <div class="company-info">
                    <div class="company-name">\${state.company?.name || 'Apex Solar Construction'}</div>
                    <h1>Daily Field Report</h1>
                  </div>
                  <div class="report-meta">
                    <div class="report-type">Daily Production Report</div>
                    <div class="report-date">\${new Date(date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</div>
                  </div>
                </div>
                <div class="project-banner">
                  <div class="project-info">
                    <h2>\${project?.name || 'Desert Sun Solar Farm'}</h2>
                    <div class="project-details">\${project?.location || 'Phoenix, AZ'} • Client: \${project?.client || 'NextEra Energy'} • PM: \${project?.projectManager || 'Sarah K.'}</div>
                  </div>
                  <div class="project-badge">\${project?.status || 'Active'}</div>
                </div>
                <div class="weather-section">
                  <div class="weather-icon">\${weatherIcon}</div>
                  <div class="weather-info">
                    <h3>Today's Weather</h3>
                    <div class="temp">\${Math.round(temp)}°F</div>
                    <div class="conditions">\${weatherDesc}</div>
                  </div>
                  <div class="weather-details">
                    <div class="weather-detail"><div class="label">Humidity</div><div class="value">\${humidity}%</div></div>
                    <div class="weather-detail"><div class="label">Wind</div><div class="value">\${Math.round(windSpeed)} mph</div></div>
                    <div class="weather-detail"><div class="label">Location</div><div class="value">Phoenix</div></div>
                  </div>
                </div>
                <div class="section-title">Daily Summary</div>
                <div class="summary-grid">
                  <div class="summary-card highlight"><div class="value">\${Math.round(((project?.installedPiles || 0) / (project?.totalPiles || 1)) * 100)}%</div><div class="label">Completion</div></div>
                  <div class="summary-card"><div class="value">\${dayProd?.piles || 0}</div><div class="label">Piles Today</div></div>
                  <div class="summary-card"><div class="value">\${rackingToday}</div><div class="label">Racking Today</div></div>
                  <div class="summary-card"><div class="value">\${modulesToday}</div><div class="label">Modules Today</div></div>
                  <div class="summary-card"><div class="value">\${refusalRate}%</div><div class="label">Refusal Rate</div></div>
                </div>
                <div class="section-title">Project Progress</div>
                <div class="progress-container">
                  <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
                    <span style="font-size: 13px; color: #64748b;">Overall Completion</span>
                    <span style="font-size: 14px; font-weight: 700; color: #1e293b;">\${project?.installedPiles || 0} of \${project?.totalPiles || 0} piles</span>
                  </div>
                  <div class="progress-bar"><div class="progress-fill" style="width: \${Math.round(((project?.installedPiles || 0) / (project?.totalPiles || 1)) * 100)}%;"></div></div>
                </div>
                <div class="section-title">Quality Control Summary</div>
                <div class="qc-grid">
                  <div class="qc-card total"><div class="value">\${totalInspected}</div><div class="label">Inspected</div></div>
                  <div class="qc-card pass"><div class="value">\${passed}</div><div class="label">Passed</div></div>
                  <div class="qc-card fail"><div class="value">\${failed}</div><div class="label">Failed</div></div>
                  <div class="qc-card hold"><div class="value">0</div><div class="label">On Hold</div></div>
                  <div class="qc-card refusal"><div class="value">\${dayRefusals}</div><div class="label">Refusals</div></div>
                </div>
                <div class="section-title">Activity Detail</div>
                <table class="activity-table">
                  <thead><tr><th>Time</th><th>Pile ID</th><th>Activity</th><th>Crew</th><th>Status</th></tr></thead>
                  <tbody>
                    \${state.inspections.slice(-10).reverse().map(i => 
                      '<tr><td>' + new Date(i.timestamp).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) + '</td><td>' + i.pileId + '</td><td>QC Inspection</td><td>' + i.user + '</td><td><span class="status-badge ' + i.status + '">' + i.status + '</span></td></tr>'
                    ).join('')}
                    \${state.refusals.slice(-3).reverse().map(r => 
                      '<tr><td>' + new Date(r.timestamp).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) + '</td><td>' + r.pileId + '</td><td>Refusal Logged</td><td>' + r.user + '</td><td><span class="status-badge refusal">Refusal</span></td></tr>'
                    ).join('')}
                  </tbody>
                </table>
                <div class="notes-section">
                  <h3>Daily Notes</h3>
                  <div class="notes-content">Weather conditions were favorable for pile driving operations. All crews operating at normal capacity. \${failed > 0 ? failed + ' piles failed QC and require remediation. ' : ''}\${dayRefusals > 0 ? dayRefusals + ' refusal(s) logged - engineering notified for alternative pile locations.' : 'No refusals encountered today.'}</div>
                </div>
                <div class="section-title">Photo Documentation</div>
                <div class="photo-gallery">
                  <div class="photo-item">No photos captured</div>
                  <div class="photo-item">No photos captured</div>
                  <div class="photo-item">No photos captured</div>
                  <div class="photo-item">No photos captured</div>
                </div>
                <div class="report-footer">
                  <div>Generated by SolTrend Pro • Report verified by: \${state.currentUser?.name || 'Field Supervisor'}</div>
                  <div>Page 1 of 1</div>
                </div>
              </body>
              </html>
            \`;
            const printWindow = window.open('', '_blank');
            printWindow.document.write(reportContent);
            printWindow.document.close();
            printWindow.print();
          }

          async function generateWeeklyReport() {
            const project = state.currentProject;
            const weekProd = state.production.slice(-7).reduce((s, p) => s + p.piles, 0);
            const prevWeekProd = state.production.slice(-14, -7).reduce((s, p) => s + p.piles, 0);
            const avgDaily = Math.round(weekProd / 7);
            const bestDay = Math.max(...state.production.slice(-7).map(p => p.piles));
            const weekChange = prevWeekProd > 0 ? Math.round(((weekProd - prevWeekProd) / prevWeekProd) * 100) : 0;
            const weekInspections = state.inspections.slice(-50);
            const weekPassed = weekInspections.filter(i => i.status === 'pass').length;
            const weekFailed = weekInspections.filter(i => i.status === 'fail').length;
            const weekRefusals = state.refusals.slice(-5).length;
            const passRate = weekInspections.length > 0 ? Math.round((weekPassed / weekInspections.length) * 100) : 0;
            const weather = await fetchWeatherData();
            const dailyWeather = weather?.daily;
            
            const reportContent = \`
              <!DOCTYPE html>
              <html>
              <head>
                <title>Weekly Report</title>
                <style>
                  * { margin: 0; padding: 0; box-sizing: border-box; }
                  body { font-family: 'Segoe UI', Arial, sans-serif; padding: 40px; color: #1e293b; background: white; }
                  .report-header { display: flex; justify-content: space-between; border-bottom: 3px solid #3b82f6; padding-bottom: 20px; margin-bottom: 25px; }
                  .company-info h1 { font-size: 28px; font-weight: 800; color: #1e293b; }
                  .company-info .company-name { font-size: 14px; color: #3b82f6; font-weight: 600; text-transform: uppercase; }
                  .report-meta { text-align: right; }
                  .report-meta .report-type { font-size: 12px; color: #64748b; text-transform: uppercase; }
                  .report-meta .report-date { font-size: 20px; font-weight: 700; color: #1e293b; }
                  .project-banner { background: linear-gradient(135deg, #1e293b 0%, #334155 100%); border-radius: 12px; padding: 20px 25px; margin-bottom: 25px; display: flex; justify-content: space-between; align-items: center; }
                  .project-info h2 { font-size: 22px; font-weight: 700; color: white; }
                  .project-info .project-details { font-size: 13px; color: #94a3b8; }
                  .project-badge { background: #3b82f6; color: white; padding: 8px 16px; border-radius: 20px; font-size: 12px; font-weight: 700; text-transform: uppercase; }
                  .weather-week { display: flex; gap: 8px; margin-bottom: 25px; }
                  .weather-day { flex: 1; text-align: center; padding: 12px 8px; border-radius: 10px; }
                  .weather-day.sunny { background: linear-gradient(135deg, #fef3c7, #fde68a); }
                  .weather-day.cloudy { background: linear-gradient(135deg, #f1f5f9, #e2e8f0); }
                  .weather-day.rainy { background: linear-gradient(135deg, #dbeafe, #bfdbfe); }
                  .weather-day .icon { font-size: 28px; }
                  .weather-day .day { font-size: 12px; font-weight: 600; color: #475569; margin-top: 4px; }
                  .weather-day .temp { font-size: 14px; font-weight: 700; color: #1e293b; }
                  .section-title { font-size: 16px; font-weight: 700; color: #1e293b; margin-bottom: 15px; }
                  .week-summary { display: grid; grid-template-columns: repeat(4, 1fr); gap: 15px; margin-bottom: 25px; }
                  .week-card { background: linear-gradient(135deg, #1e293b 0%, #334155 100%); border-radius: 12px; padding: 20px; text-align: center; }
                  .week-card .value { font-size: 36px; font-weight: 800; color: white; }
                  .week-card .label { font-size: 11px; color: #94a3b8; text-transform: uppercase; margin-top: 4px; }
                  .week-card .change { font-size: 12px; margin-top: 8px; padding: 4px 8px; border-radius: 12px; display: inline-block; }
                  .week-card .change.up { background: rgba(34, 197, 94, 0.2); color: #4ade80; }
                  .week-card .change.down { background: rgba(239, 68, 68, 0.2); color: #f87171; }
                  .trend-chart { background: #f8fafc; border-radius: 12px; padding: 20px; margin-bottom: 25px; }
                  .trend-bars { display: flex; align-items: flex-end; gap: 8px; height: 150px; }
                  .trend-bar-group { flex: 1; display: flex; flex-direction: column; align-items: center; }
                  .trend-bar { width: 100%; background: linear-gradient(to top, #3b82f6, #60a5fa); border-radius: 4px 4px 0 0; }
                  .trend-label { font-size: 10px; color: #64748b; margin-top: 6px; }
                  .qc-grid { display: grid; grid-template-columns: repeat(5, 1fr); gap: 12px; margin-bottom: 25px; }
                  .qc-card { border-radius: 10px; padding: 15px; text-align: center; }
                  .qc-card.pass { background: linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%); border: 2px solid #22c55e; }
                  .qc-card.fail { background: linear-gradient(135deg, #fee2e2 0%, #fecaca 100%); border: 2px solid #ef4444; }
                  .qc-card.hold { background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%); border: 2px solid #f59e0b; }
                  .qc-card.refusal { background: linear-gradient(135deg, #ffedd5 0%, #fed7aa 100%); border: 2px solid #f97316; }
                  .qc-card.total { background: linear-gradient(135deg, #e0e7ff 0%, #c7d2fe 100%); border: 2px solid #6366f1; }
                  .qc-card .value { font-size: 28px; font-weight: 800; }
                  .qc-card.pass .value { color: #16a34a; }
                  .qc-card.fail .value { color: #dc2626; }
                  .qc-card.hold .value { color: #d97706; }
                  .qc-card.refusal .value { color: #ea580c; }
                  .qc-card.total .value { color: #4f46e5; }
                  .qc-card .label { font-size: 10px; font-weight: 600; text-transform: uppercase; margin-top: 4px; }
                  .progress-container { background: #f8fafc; border-radius: 10px; padding: 20px; margin-bottom: 25px; }
                  .progress-bar { height: 20px; background: #e2e8f0; border-radius: 10px; overflow: hidden; }
                  .progress-fill { height: 100%; background: linear-gradient(90deg, #22c55e 0%, #4ade80 100%); border-radius: 10px; }
                  .comparison-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 25px; }
                  .comparison-card { background: #f8fafc; border-radius: 10px; padding: 20px; }
                  .comparison-title { font-size: 14px; font-weight: 700; color: #1e293b; margin-bottom: 15px; }
                  .comparison-badge { font-size: 11px; padding: 4px 10px; border-radius: 12px; }
                  .comparison-badge.positive { background: #dcfce7; color: #166534; }
                  .comparison-badge.negative { background: #fee2e2; color: #991b1b; }
                  .comparison-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #e2e8f0; font-size: 13px; }
                  .comparison-row:last-child { border-bottom: none; }
                  .comparison-label { color: #64748b; }
                  .comparison-value { font-weight: 600; color: #1e293b; }
                  .notes-section { background: #eff6ff; border: 2px dashed #3b82f6; border-radius: 10px; padding: 20px; margin-bottom: 25px; }
                  .notes-section h3 { font-size: 14px; font-weight: 700; color: #1e40af; margin-bottom: 10px; }
                  .notes-content { font-size: 13px; color: #1e3a8a; line-height: 1.6; }
                  .report-footer { border-top: 2px solid #e2e8f0; padding-top: 15px; margin-top: 30px; display: flex; justify-content: space-between; font-size: 11px; color: #94a3b8; }
                </style>
              </head>
              <body>
                <div class="report-header">
                  <div class="company-info">
                    <div class="company-name">\${state.company?.name || 'Apex Solar Construction'}</div>
                    <h1>Weekly Progress Report</h1>
                  </div>
                  <div class="report-meta">
                    <div class="report-type">Week \${Math.ceil(new Date().getDate() / 7)} • \${new Date().getFullYear()}</div>
                    <div class="report-date">\${new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - \${new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</div>
                  </div>
                </div>
                <div class="project-banner">
                  <div class="project-info">
                    <h2>\${project?.name || 'Desert Sun Solar Farm'}</h2>
                    <div class="project-details">\${project?.location || 'Phoenix, AZ'} • \${project?.totalPiles || 0} Total Piles</div>
                  </div>
                  <div class="project-badge">\${weekChange >= 0 ? 'On Track' : 'Behind'}</div>
                </div>
                <div class="section-title">Weather Summary (Mon-Fri)</div>
                <div class="weather-week">
                  \${dailyWeather ? dailyWeather.time.slice(0, 5).map((d, i) => {
                    const code = dailyWeather.weather_code[i];
                    const icon = getWeatherIcon(code);
                    const maxT = Math.round(dailyWeather.temperature_2m_max[i]);
                    const minT = Math.round(dailyWeather.temperature_2m_min[i]);
                    const dayName = new Date(d).toLocaleDateString('en-US', { weekday: 'short' });
                    const bgClass = code <= 3 ? 'sunny' : code >= 51 ? 'rainy' : 'cloudy';
                    return '<div class="weather-day ' + bgClass + '"><div class="icon">' + icon + '</div><div class="day">' + dayName + '</div><div class="temp">' + maxT + '°F</div></div>';
                  }).join('') : '<div class="weather-day sunny"><div class="icon">☀️</div><div class="day">Mon</div><div class="temp">78°</div></div><div class="weather-day sunny"><div class="icon">☀️</div><div class="day">Tue</div><div class="temp">80°</div></div><div class="weather-day sunny"><div class="icon">☀️</div><div class="day">Wed</div><div class="temp">82°</div></div><div class="weather-day cloudy"><div class="icon">⛅</div><div class="day">Thu</div><div class="temp">75°</div></div><div class="weather-day sunny"><div class="icon">☀️</div><div class="day">Fri</div><div class="temp">79°</div></div>'}
                </div>
                <div class="section-title">Week at a Glance</div>
                <div class="week-summary">
                  <div class="week-card"><div class="value">\${weekProd}</div><div class="label">Piles Installed</div><div class="change \${weekChange >= 0 ? 'up' : 'down'}">\${weekChange >= 0 ? '↑' : '↓'} \${Math.abs(weekChange)}% vs last week</div></div>
                  <div class="week-card"><div class="value">\${weekPassed}</div><div class="label">QC Passed</div><div class="change up">↑ \${passRate}% pass rate</div></div>
                  <div class="week-card"><div class="value">\${passRate}%</div><div class="label">Pass Rate</div><div class="change up">↑ Target: 92%</div></div>
                  <div class="week-card"><div class="value">\${weekRefusals}</div><div class="label">Refusals</div><div class="change \${weekRefusals <= 5 ? 'up' : 'down'}">\${weekRefusals <= 5 ? '↓ Below avg' : '↑ Above avg'}</div></div>
                </div>
                <div class="section-title">Daily Production Trend</div>
                <div class="trend-chart">
                  <div class="trend-bars">
                    \${state.production.slice(-7).map(p => {
                      const h = Math.max(20, (p.piles / 50) * 100);
                      return '<div class="trend-bar-group"><div class="trend-bar" style="height: ' + h + 'px;"></div><div class="trend-label">' + p.piles + '</div></div>';
                    }).join('')}
                  </div>
                </div>
                <div class="section-title">Quality Control Summary</div>
                <div class="qc-grid">
                  <div class="qc-card total"><div class="value">\${weekInspections.length}</div><div class="label">Inspected</div></div>
                  <div class="qc-card pass"><div class="value">\${weekPassed}</div><div class="label">Passed</div></div>
                  <div class="qc-card fail"><div class="value">\${weekFailed}</div><div class="label">Failed</div></div>
                  <div class="qc-card hold"><div class="value">0</div><div class="label">On Hold</div></div>
                  <div class="qc-card refusal"><div class="value">\${weekRefusals}</div><div class="label">Refusals</div></div>
                </div>
                <div class="section-title">Project Progress</div>
                <div class="progress-container">
                  <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
                    <span style="font-size: 13px; color: #64748b;">Overall Project Completion</span>
                    <span style="font-size: 14px; font-weight: 700; color: #1e293b;">\${project?.installedPiles || 0} of \${project?.totalPiles || 0} piles (\${Math.round(((project?.installedPiles || 0) / (project?.totalPiles || 1)) * 100)}%)</span>
                  </div>
                  <div class="progress-bar"><div class="progress-fill" style="width: \${Math.round(((project?.installedPiles || 0) / (project?.totalPiles || 1)) * 100)}%;"></div></div>
                </div>
                <div class="section-title">Week-over-Week Comparison</div>
                <div class="comparison-grid">
                  <div class="comparison-card">
                    <div style="display: flex; justify-content: space-between; margin-bottom: 15px;">
                      <span class="comparison-title">Production Comparison</span>
                      <span class="comparison-badge \${weekChange >= 0 ? 'positive' : 'negative'}">\${weekChange >= 0 ? '+' : ''}\${weekChange}%</span>
                    </div>
                    <div class="comparison-row"><span class="comparison-label">This Week</span><span class="comparison-value">\${weekProd} piles</span></div>
                    <div class="comparison-row"><span class="comparison-label">Last Week</span><span class="comparison-value">\${prevWeekProd} piles</span></div>
                    <div class="comparison-row"><span class="comparison-label">Difference</span><span class="comparison-value">\${weekProd - prevWeekProd > 0 ? '+' : ''}\${weekProd - prevWeekProd} piles</span></div>
                    <div class="comparison-row"><span class="comparison-label">Daily Average</span><span class="comparison-value">\${avgDaily} piles/day</span></div>
                  </div>
                  <div class="comparison-card">
                    <div style="display: flex; justify-content: space-between; margin-bottom: 15px;">
                      <span class="comparison-title">Weather Impact Analysis</span>
                      <span class="comparison-badge positive">Favorable</span>
                    </div>
                    <div class="comparison-row"><span class="comparison-label">Clear Days</span><span class="comparison-value">4 of 5</span></div>
                    <div class="comparison-row"><span class="comparison-label">Avg Temperature</span><span class="comparison-value">78°F</span></div>
                    <div class="comparison-row"><span class="comparison-label">Weather Delays</span><span class="comparison-value">0 days</span></div>
                    <div class="comparison-row"><span class="comparison-label">Best Production Day</span><span class="comparison-value">\${bestDay} piles</span></div>
                  </div>
                </div>
                <div class="notes-section">
                  <h3>Weekly Summary Notes</h3>
                  <div class="notes-content">Strong production week with crews operating at \${avgDaily >= 35 ? 'full' : 'near'} capacity. Daily average of \${avgDaily} piles \${avgDaily >= 35 ? 'exceeds' : 'approaches'} the target of 35 piles/day. QC pass rate of \${passRate}% \${passRate >= 92 ? 'meets' : 'is below'} the 92% target. \${weekRefusals > 0 ? weekRefusals + ' refusal(s) logged this week, engineering notified for review.' : 'No refusals encountered this week.'}</div>
                </div>
                <div class="report-footer">
                  <div>Report prepared by: Project Management Team | Next report: \${new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</div>
                  <div>\${state.company?.name || 'Apex Solar Construction'} • Confidential</div>
                </div>
              </body>
              </html>
            \`;
            const printWindow = window.open('', '_blank');
            printWindow.document.write(reportContent);
            printWindow.document.close();
            printWindow.print();
          }

          async function generateMonthlyReport() {
            const project = state.currentProject;
            const monthProd = state.production.slice(-30).reduce((s, p) => s + p.piles, 0);
            const prevMonthProd = state.production.slice(-60, -30).reduce((s, p) => s + p.piles, 0);
            const avgDaily = Math.round(monthProd / 30);
            const totalInspections = state.inspections.length;
            const passedInspections = state.inspections.filter(i => i.status === 'pass').length;
            const failedInspections = state.inspections.filter(i => i.status === 'fail').length;
            const passRate = totalInspections > 0 ? Math.round((passedInspections / totalInspections) * 100) : 0;
            const monthChange = prevMonthProd > 0 ? Math.round(((monthProd - prevMonthProd) / prevMonthProd) * 100) : 0;
            const weather = await fetchWeatherData();
            
            const reportContent = \`
              <!DOCTYPE html>
              <html>
              <head>
                <title>Monthly Report</title>
                <style>
                  * { margin: 0; padding: 0; box-sizing: border-box; }
                  body { font-family: 'Segoe UI', Arial, sans-serif; padding: 40px; color: #1e293b; background: white; }
                  .report-header { display: flex; justify-content: space-between; border-bottom: 3px solid #22c55e; padding-bottom: 20px; margin-bottom: 30px; }
                  .company-info h1 { font-size: 32px; font-weight: 800; color: #1e293b; }
                  .company-info .company-name { font-size: 14px; color: #22c55e; font-weight: 600; text-transform: uppercase; }
                  .report-meta { text-align: right; }
                  .report-meta .report-type { font-size: 12px; color: #64748b; text-transform: uppercase; }
                  .report-meta .report-date { font-size: 24px; font-weight: 700; color: #1e293b; }
                  .project-banner { background: linear-gradient(135deg, #1e293b 0%, #334155 100%); border-radius: 12px; padding: 20px 25px; margin-bottom: 25px; display: flex; justify-content: space-between; align-items: center; }
                  .project-info h2 { font-size: 22px; font-weight: 700; color: white; }
                  .project-info .project-details { font-size: 13px; color: #94a3b8; }
                  .project-badge { background: #22c55e; color: white; padding: 8px 16px; border-radius: 20px; font-size: 12px; font-weight: 700; text-transform: uppercase; }
                  .section-title { font-size: 16px; font-weight: 700; color: #1e293b; margin-bottom: 15px; }
                  .weather-monthly { background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%); border-radius: 12px; padding: 20px; margin-bottom: 25px; display: grid; grid-template-columns: repeat(5, 1fr); gap: 15px; }
                  .weather-stat { text-align: center; }
                  .weather-stat .icon { font-size: 32px; margin-bottom: 8px; }
                  .weather-stat .value { font-size: 20px; font-weight: 700; color: #1e40af; }
                  .weather-stat .label { font-size: 10px; color: #3b82f6; text-transform: uppercase; margin-top: 4px; }
                  .kpi-grid { display: grid; grid-template-columns: repeat(6, 1fr); gap: 12px; margin-bottom: 30px; }
                  .kpi-card { background: white; border: 1px solid #e2e8f0; border-radius: 10px; padding: 15px; text-align: center; }
                  .kpi-card .value { font-size: 24px; font-weight: 800; color: #1e293b; }
                  .kpi-card .label { font-size: 10px; color: #64748b; text-transform: uppercase; margin-top: 4px; }
                  .kpi-card.highlight { background: linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%); border: 2px solid #22c55e; }
                  .kpi-card.highlight .value { color: #166534; }
                  .progress-container { background: #f8fafc; border-radius: 10px; padding: 20px; margin-bottom: 25px; }
                  .progress-bar { height: 24px; background: #e2e8f0; border-radius: 12px; overflow: hidden; }
                  .progress-fill { height: 100%; background: linear-gradient(90deg, #22c55e 0%, #4ade80 100%); border-radius: 12px; }
                  .two-column { display: grid; grid-template-columns: 1fr 1fr; gap: 25px; }
                  .qc-section { background: #f8fafc; border-radius: 10px; padding: 20px; }
                  .qc-stats { display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px; margin-bottom: 15px; }
                  .qc-stat { background: white; border-radius: 8px; border: 1px solid #e2e8f0; padding: 15px; text-align: center; }
                  .qc-stat .value { font-size: 28px; font-weight: 800; }
                  .qc-stat.pass .value { color: #16a34a; }
                  .qc-stat.fail .value { color: #dc2626; }
                  .qc-stat.refusal .value { color: #ea580c; }
                  .qc-stat .label { font-size: 11px; color: #64748b; margin-top: 4px; }
                  .crew-rankings { background: #f8fafc; border-radius: 10px; padding: 15px; }
                  .crew-item { display: flex; align-items: center; padding: 12px; border-radius: 8px; margin-bottom: 10px; }
                  .crew-item.gold { background: linear-gradient(135deg, #fef3c7, #fde68a); }
                  .crew-item.silver { background: white; border: 1px solid #e2e8f0; }
                  .crew-item.bronze { background: white; border: 1px solid #e2e8f0; }
                  .crew-rank { font-size: 20px; margin-right: 10px; }
                  .crew-info { flex: 1; }
                  .crew-name { font-weight: 700; color: #1e293b; }
                  .crew-lead { font-size: 11px; color: #64748b; }
                  .crew-stats { text-align: right; }
                  .crew-rate { font-weight: 700; color: #1e293b; }
                  .activity-table { width: 100%; border-collapse: collapse; margin-top: 15px; }
                  .activity-table th { background: #1e293b; color: white; padding: 10px 12px; text-align: left; font-size: 10px; font-weight: 600; text-transform: uppercase; }
                  .activity-table td { padding: 10px 12px; border-bottom: 1px solid #e2e8f0; font-size: 12px; color: #334155; }
                  .activity-table tr:nth-child(even) { background: #f8fafc; }
                  .comparison-badge { display: inline-block; padding: 4px 10px; border-radius: 12px; font-size: 11px; font-weight: 600; }
                  .comparison-badge.positive { background: #dcfce7; color: #166534; }
                  .comparison-badge.negative { background: #fee2e2; color: #991b1b; }
                  .notes-section { background: #f0fdf4; border: 2px dashed #22c55e; border-radius: 10px; padding: 20px; margin-top: 25px; }
                  .notes-section h3 { font-size: 14px; font-weight: 700; color: #166534; margin-bottom: 10px; }
                  .notes-content { font-size: 13px; color: #166534; line-height: 1.6; }
                  .report-footer { border-top: 2px solid #e2e8f0; padding-top: 15px; margin-top: 30px; display: flex; justify-content: space-between; font-size: 11px; color: #94a3b8; }
                </style>
              </head>
              <body>
                <div class="report-header">
                  <div class="company-info">
                    <div class="company-name">\${state.company?.name || 'Apex Solar Construction'}</div>
                    <h1>Monthly Project Report</h1>
                  </div>
                  <div class="report-meta">
                    <div class="report-type">Executive Summary</div>
                    <div class="report-date">\${new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</div>
                  </div>
                </div>
                <div class="project-banner">
                  <div class="project-info">
                    <h2>\${project?.name || 'Desert Sun Solar Farm'}</h2>
                    <div class="project-details">\${project?.location || 'Phoenix, AZ'} • Client: \${project?.client || 'NextEra Energy'}</div>
                  </div>
                  <div class="project-badge">\${monthChange >= 0 ? 'On Schedule' : 'Behind'}</div>
                </div>
                <div class="section-title">Monthly Weather Summary</div>
                <div class="weather-monthly">
                  <div class="weather-stat"><div class="icon">☀️</div><div class="value">22</div><div class="label">Clear Days</div></div>
                  <div class="weather-stat"><div class="icon">⛅</div><div class="value">5</div><div class="label">Cloudy Days</div></div>
                  <div class="weather-stat"><div class="icon">🌧️</div><div class="value">1</div><div class="label">Rain Days</div></div>
                  <div class="weather-stat"><div class="icon">🌡️</div><div class="value">76°F</div><div class="label">Avg Temp</div></div>
                  <div class="weather-stat"><div class="icon">💨</div><div class="value">0</div><div class="label">Delay Days</div></div>
                </div>
                <div class="section-title">Key Performance Indicators</div>
                <div class="kpi-grid">
                  <div class="kpi-card highlight"><div class="value">\${Math.round(((project?.installedPiles || 0) / (project?.totalPiles || 1)) * 100)}%</div><div class="label">Complete</div></div>
                  <div class="kpi-card"><div class="value">\${formatNumber(monthProd)}</div><div class="label">Piles Month</div></div>
                  <div class="kpi-card"><div class="value">\${passRate}%</div><div class="label">QC Pass</div></div>
                  <div class="kpi-card"><div class="value">\${avgDaily}</div><div class="label">Daily Avg</div></div>
                  <div class="kpi-card"><div class="value">\${state.refusals.length}</div><div class="label">Refusals</div></div>
                  <div class="kpi-card"><div class="value">\${state.crews.filter(c => c.status === 'active').length}</div><div class="label">Active Crews</div></div>
                </div>
                <div class="section-title">Project Progress</div>
                <div class="progress-container">
                  <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
                    <span style="font-size: 13px; color: #64748b;">Overall Project Completion</span>
                    <span style="font-size: 14px; font-weight: 700; color: #1e293b;">\${project?.installedPiles || 0} of \${project?.totalPiles || 0} piles (\${Math.round(((project?.installedPiles || 0) / (project?.totalPiles || 1)) * 100)}%)</span>
                  </div>
                  <div class="progress-bar"><div class="progress-fill" style="width: \${Math.round(((project?.installedPiles || 0) / (project?.totalPiles || 1)) * 100)}%;"></div></div>
                </div>
                <div class="two-column">
                  <div>
                    <div class="section-title">Quality Control Analysis</div>
                    <div class="qc-section">
                      <div class="qc-stats">
                        <div class="qc-stat"><div class="value">\${totalInspections}</div><div class="label">Total Inspected</div></div>
                        <div class="qc-stat pass"><div class="value">\${passedInspections}</div><div class="label">Passed</div></div>
                        <div class="qc-stat fail"><div class="value">\${failedInspections}</div><div class="label">Failed</div></div>
                        <div class="qc-stat refusal"><div class="value">\${state.refusals.length}</div><div class="label">Refusals</div></div>
                      </div>
                    </div>
                  </div>
                  <div>
                    <div class="section-title">Crew Performance Rankings</div>
                    <div class="crew-rankings">
                      <div class="crew-item gold"><span class="crew-rank">🥇</span><div class="crew-info"><div class="crew-name">Alpha Crew</div><div class="crew-lead">Lead: \${state.crews[0]?.lead || 'Marcus T.'}</div></div><div class="crew-stats"><div class="crew-rate">96.2%</div></div></div>
                      <div class="crew-item silver"><span class="crew-rank">🥈</span><div class="crew-info"><div class="crew-name">Beta Crew</div><div class="crew-lead">Lead: \${state.crews[1]?.lead || 'Elena V.'}</div></div><div class="crew-stats"><div class="crew-rate">93.8%</div></div></div>
                      <div class="crew-item bronze"><span class="crew-rank">🥉</span><div class="crew-info"><div class="crew-name">Gamma Crew</div><div class="crew-lead">Lead: \${state.crews[2]?.lead || 'James K.'}</div></div><div class="crew-stats"><div class="crew-rate">91.4%</div></div></div>
                    </div>
                  </div>
                </div>
                <div class="notes-section">
                  <h3>Executive Summary</h3>
                  <div class="notes-content">Performance: \${new Date().toLocaleDateString('en-US', { month: 'long' })} \${monthChange >= 0 ? 'exceeded' : 'missed'} production targets by \${Math.abs(monthChange)}%, with all crews demonstrating strong performance. QC pass rate of \${passRate}% \${passRate >= 92 ? 'exceeds' : 'approaches'} the 92% target. Weather Impact: Weather conditions were largely favorable with only 1 rain day causing minor delays. Month-over-Month: <span class="comparison-badge \${monthChange >= 0 ? 'positive' : 'negative'}">\${monthChange >= 0 ? '+' : ''}\${monthChange}%</span> compared to previous month.</div>
                </div>
                <div class="report-footer">
                  <div>Report prepared for: \${project?.client || 'NextEra Energy'} | Submitted by: \${state.company?.name || 'Apex Solar'} Project Management</div>
                  <div>Distribution: Client, PM, Field Supervisors</div>
                </div>
              </body>
              </html>
            \`;
            const printWindow = window.open('', '_blank');
            printWindow.document.write(reportContent);
            printWindow.document.close();
            printWindow.print();
          }

          function generateQCReport() {
            const startDate = document.getElementById('qcStart')?.value || state.reportDates.qcStart;
            const endDate = document.getElementById('qcEnd')?.value || state.reportDates.qcEnd;
            const project = state.currentProject;
            const total = state.inspections.length;
            const passed = state.inspections.filter(i => i.status === 'pass').length;
            const failed = state.inspections.filter(i => i.status === 'fail').length;
            const passRate = total > 0 ? Math.round((passed / total) * 100) : 0;
            
            const reportContent = \`
              <!DOCTYPE html>
              <html>
              <head>
                <title>QC Report</title>
                <style>
                  body { font-family: Arial, sans-serif; padding: 40px; color: #1e293b; }
                  .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #a855f7; padding-bottom: 20px; }
                  .header h1 { color: #0f172a; margin: 0; font-size: 28px; }
                  .header p { color: #64748b; margin: 5px 0; }
                  .section { margin-bottom: 25px; }
                  .section h2 { color: #a855f7; border-bottom: 1px solid #e2e8f0; padding-bottom: 8px; }
                  .stats { display: grid; grid-template-columns: repeat(4, 1fr); gap: 15px; margin: 15px 0; }
                  .stat-box { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 15px; text-align: center; }
                  .stat-box .value { font-size: 28px; font-weight: bold; }
                  .stat-box .label { font-size: 11px; color: #64748b; text-transform: uppercase; }
                  .pass { color: #22c55e; }
                  .fail { color: #ef4444; }
                  table { width: 100%; border-collapse: collapse; margin: 15px 0; }
                  th, td { padding: 10px; text-align: left; border-bottom: 1px solid #e2e8f0; }
                  th { background: #f1f5f9; font-weight: 600; }
                  .footer { margin-top: 40px; text-align: center; color: #94a3b8; font-size: 12px; }
                </style>
              </head>
              <body>
                <div class="header">
                  <h1>Quality Control Report</h1>
                  <p>\${project?.name || 'SolTrend Pro'} | \${new Date(startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - \${new Date(endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                </div>
                <div class="section">
                  <h2>Inspection Summary</h2>
                  <div class="stats">
                    <div class="stat-box"><div class="value">\${total}</div><div class="label">Total Inspections</div></div>
                    <div class="stat-box"><div class="value pass">\${passed}</div><div class="label">Passed</div></div>
                    <div class="stat-box"><div class="value fail">\${failed}</div><div class="label">Failed</div></div>
                    <div class="stat-box"><div class="value pass">\${passRate}%</div><div class="label">Pass Rate</div></div>
                  </div>
                </div>
                <div class="section">
                  <h2>Recent Failed Inspections</h2>
                  <table>
                    <thead><tr><th>Pile ID</th><th>Reason</th><th>Inspector</th><th>Time</th></tr></thead>
                    <tbody>
                      \${state.inspections.filter(i => i.status === 'fail').slice(0, 10).map(i => 
                        '<tr><td>' + i.pileId + '</td><td class="fail">' + (i.failReason || 'N/A') + '</td><td>' + i.user + '</td><td>' + new Date(i.timestamp).toLocaleString() + '</td></tr>'
                      ).join('')}
                    </tbody>
                  </table>
                </div>
                <div class="footer">
                  <p>Generated by SolTrend Pro | \${new Date().toLocaleString()}</p>
                </div>
              </body>
              </html>
            \`;
            const printWindow = window.open('', '_blank');
            printWindow.document.write(reportContent);
            printWindow.document.close();
            printWindow.print();
          }

          function generatePileStatusReport() {
            const project = state.currentProject;
            const statusCounts = {
              pass: state.inspections.filter(i => i.status === 'pass').length,
              fail: state.inspections.filter(i => i.status === 'fail').length,
              refusal: state.refusals.length,
              notstarted: (project?.totalPiles || 0) - state.inspections.length - state.refusals.length
            };
            
            const reportContent = \`
              <!DOCTYPE html>
              <html>
              <head>
                <title>Pile Status Report</title>
                <style>
                  body { font-family: Arial, sans-serif; padding: 40px; color: #1e293b; }
                  .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #06b6d4; padding-bottom: 20px; }
                  .header h1 { color: #0f172a; margin: 0; font-size: 28px; }
                  .header p { color: #64748b; margin: 5px 0; }
                  .section { margin-bottom: 25px; }
                  .section h2 { color: #06b6d4; border-bottom: 1px solid #e2e8f0; padding-bottom: 8px; }
                  .stats { display: grid; grid-template-columns: repeat(4, 1fr); gap: 15px; margin: 15px 0; }
                  .stat-box { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 15px; text-align: center; }
                  .stat-box .value { font-size: 28px; font-weight: bold; }
                  .stat-box .label { font-size: 11px; color: #64748b; text-transform: uppercase; }
                  .pass { color: #22c55e; }
                  .fail { color: #ef4444; }
                  .refusal { color: #f97316; }
                  .pending { color: #64748b; }
                  .legend { display: flex; justify-content: center; gap: 30px; margin: 20px 0; }
                  .legend-item { display: flex; align-items: center; gap: 8px; }
                  .legend-dot { width: 12px; height: 12px; border-radius: 3px; }
                  .footer { margin-top: 40px; text-align: center; color: #94a3b8; font-size: 12px; }
                </style>
              </head>
              <body>
                <div class="header">
                  <h1>Pile Status Report</h1>
                  <p>\${project?.name || 'SolTrend Pro'} | \${new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
                </div>
                <div class="section">
                  <h2>Status Overview</h2>
                  <div class="stats">
                    <div class="stat-box"><div class="value pass">\${statusCounts.pass}</div><div class="label">Passed</div></div>
                    <div class="stat-box"><div class="value fail">\${statusCounts.fail}</div><div class="label">Failed</div></div>
                    <div class="stat-box"><div class="value refusal">\${statusCounts.refusal}</div><div class="label">Refusals</div></div>
                    <div class="stat-box"><div class="value pending">\${Math.max(0, statusCounts.notstarted)}</div><div class="label">Not Started</div></div>
                  </div>
                </div>
                <div class="section">
                  <h2>Progress Summary</h2>
                  <p><strong>Total Piles:</strong> \${project?.totalPiles || 0}</p>
                  <p><strong>Completion:</strong> \${Math.round(((project?.installedPiles || 0) / (project?.totalPiles || 1)) * 100)}%</p>
                  <div class="legend">
                    <div class="legend-item"><div class="legend-dot" style="background: #22c55e;"></div><span>Passed</span></div>
                    <div class="legend-item"><div class="legend-dot" style="background: #ef4444;"></div><span>Failed</span></div>
                    <div class="legend-item"><div class="legend-dot" style="background: #f97316;"></div><span>Refusal</span></div>
                    <div class="legend-item"><div class="legend-dot" style="background: #64748b;"></div><span>Pending</span></div>
                  </div>
                </div>
                <div class="footer">
                  <p>Generated by SolTrend Pro | \${new Date().toLocaleString()}</p>
                </div>
              </body>
              </html>
            \`;
            const printWindow = window.open('', '_blank');
            printWindow.document.write(reportContent);
            printWindow.document.close();
            printWindow.print();
          }

          function generateRefusalReport() {
            const project = state.currentProject;
            const refusalCounts = {};
            state.refusals.forEach(r => { refusalCounts[r.reason] = (refusalCounts[r.reason] || 0) + 1; });
            const avgDepth = state.refusals.length > 0 ? Math.round(state.refusals.reduce((s, r) => s + (r.achievedDepth || 0), 0) / state.refusals.length) : 0;
            
            const reportContent = \`
              <!DOCTYPE html>
              <html>
              <head>
                <title>Refusal Report</title>
                <style>
                  body { font-family: Arial, sans-serif; padding: 40px; color: #1e293b; }
                  .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #f97316; padding-bottom: 20px; }
                  .header h1 { color: #0f172a; margin: 0; font-size: 28px; }
                  .header p { color: #64748b; margin: 5px 0; }
                  .section { margin-bottom: 25px; }
                  .section h2 { color: #f97316; border-bottom: 1px solid #e2e8f0; padding-bottom: 8px; }
                  .stats { display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px; margin: 15px 0; }
                  .stat-box { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 15px; text-align: center; }
                  .stat-box .value { font-size: 28px; font-weight: bold; color: #f97316; }
                  .stat-box .label { font-size: 11px; color: #64748b; text-transform: uppercase; }
                  table { width: 100%; border-collapse: collapse; margin: 15px 0; }
                  th, td { padding: 10px; text-align: left; border-bottom: 1px solid #e2e8f0; }
                  th { background: #f1f5f9; font-weight: 600; }
                  .reason-row { display: flex; justify-content: space-between; padding: 10px; background: #f8fafc; margin-bottom: 8px; border-radius: 6px; }
                  .footer { margin-top: 40px; text-align: center; color: #94a3b8; font-size: 12px; }
                </style>
              </head>
              <body>
                <div class="header">
                  <h1>Refusal Analysis Report</h1>
                  <p>\${project?.name || 'SolTrend Pro'} | \${new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
                </div>
                <div class="section">
                  <h2>Summary</h2>
                  <div class="stats">
                    <div class="stat-box"><div class="value">\${state.refusals.length}</div><div class="label">Total Refusals</div></div>
                    <div class="stat-box"><div class="value">\${avgDepth}"</div><div class="label">Avg Achieved Depth</div></div>
                    <div class="stat-box"><div class="value">\${1800 - avgDepth}"</div><div class="label">Avg Shortfall</div></div>
                  </div>
                </div>
                <div class="section">
                  <h2>Refusals by Reason</h2>
                  \${Object.entries(refusalCounts).map(([reason, count]) => 
                    '<div class="reason-row"><span class="capitalize">' + reason + '</span><span><strong>' + count + '</strong> (' + Math.round((count / state.refusals.length) * 100) + '%)</span></div>'
                  ).join('')}
                </div>
                <div class="section">
                  <h2>Recent Refusals</h2>
                  <table>
                    <thead><tr><th>Pile ID</th><th>Reason</th><th>Target Depth</th><th>Achieved</th><th>Shortfall</th></tr></thead>
                    <tbody>
                      \${state.refusals.slice(0, 15).map(r => 
                        '<tr><td>' + r.pileId + '</td><td class="capitalize">' + r.reason + '</td><td>' + r.targetDepth + '"</td><td>' + (r.achievedDepth || 'N/A') + '"</td><td>' + (r.achievedDepth ? (r.targetDepth - r.achievedDepth) + '"' : '-') + '</td></tr>'
                      ).join('')}
                    </tbody>
                  </table>
                </div>
                <div class="footer">
                  <p>Generated by SolTrend Pro | \${new Date().toLocaleString()}</p>
                </div>
              </body>
              </html>
            \`;
            const printWindow = window.open('', '_blank');
            printWindow.document.write(reportContent);
            printWindow.document.close();
            printWindow.print();
          }

          function showToast(message, type) {
            const toast = document.createElement('div');
            toast.className = 'fixed top-4 right-4 z-50 px-4 py-3 rounded-lg text-sm font-medium ' + 
              (type === 'success' ? 'bg-green-600 text-white' : type === 'error' ? 'bg-red-600 text-white' : 'bg-blue-600 text-white');
            toast.textContent = message;
            document.body.appendChild(toast);
            setTimeout(() => toast.remove(), 3000);
          }

          // HEATMAP
          function renderHeatMap() {
            const { zoom, totalRows, pilesPerRow } = state.heatmap;
            const cellSize = Math.round(20 * zoom);
            let rows = '';
            for (let row = 1; row <= totalRows; row++) {
              let cells = '';
              for (let pile = 1; pile <= pilesPerRow; pile++) {
                const pileId = row + '-' + pile;
                cells += '<button onclick="showPileDetails(\\'' + pileId + '\\')" class="heat-cell status-' + getInspectionStatus(pileId) + '" style="width: ' + cellSize + 'px; height: ' + cellSize + 'px" title="' + pileId + '"></button>';
              }
              rows += '<div class="flex items-center gap-0.5 mb-0.5"><span class="row-label w-8 text-[10px] text-slate-500 font-mono text-right pr-1">' + row + '</span>' + cells + '</div>';
            }
            return '<div class="space-y-4 animate-fade-in"><div class="flex items-center justify-between"><div><h1 class="font-display text-2xl font-bold text-white">Pile Map</h1><p class="text-slate-400">Showing all ' + totalRows + ' rows</p></div><div class="flex items-center gap-2"><button onclick="zoomOut()" class="p-2 bg-slate-700 rounded-lg text-slate-300">' + icon('zoom-out', 'w-4 h-4') + '</button><span class="text-sm text-slate-400 w-12 text-center">' + Math.round(zoom * 100) + '%</span><button onclick="zoomIn()" class="p-2 bg-slate-700 rounded-lg text-slate-300">' + icon('zoom-in', 'w-4 h-4') + '</button></div></div><div class="flex flex-wrap items-center gap-4 bg-slate-800/50 border border-slate-700 rounded-xl p-3"><div class="flex items-center gap-2"><div class="w-3 h-3 rounded bg-green-500"></div><span class="text-xs text-slate-300">Passed</span></div><div class="flex items-center gap-2"><div class="w-3 h-3 rounded bg-red-500"></div><span class="text-xs text-slate-300">Failed</span></div><div class="flex items-center gap-2"><div class="w-3 h-3 rounded bg-orange-500"></div><span class="text-xs text-slate-300">Refusal</span></div><div class="flex items-center gap-2"><div class="w-3 h-3 rounded bg-slate-500"></div><span class="text-xs text-slate-300">Not Started</span></div></div><div class="bg-slate-800/50 border border-slate-700 rounded-xl p-4 overflow-x-auto" style="max-height: 60vh; overflow-y: auto;"><div class="inline-block">' + rows + '</div></div></div><div id="pileModal" class="fixed inset-0 z-50 hidden items-center justify-center p-4 modal-backdrop"><div class="bg-slate-800 border border-slate-700 rounded-xl max-w-sm w-full" id="pileModalContent"></div></div>';
          }

          function showPileDetails(pileId) {
            const modal = document.getElementById('pileModal');
            const content = document.getElementById('pileModalContent');
            const status = getInspectionStatus(pileId);
            const inspection = state.inspections.find(i => i.pileId === pileId);
            const refusal = state.refusals.find(r => r.pileId === pileId);
            const labels = { pass: { label: 'Passed', color: 'text-green-400', bg: 'bg-green-500/10', icon: 'check-circle' }, fail: { label: 'Failed', color: 'text-red-400', bg: 'bg-red-500/10', icon: 'x-circle' }, refusal: { label: 'Refusal', color: 'text-orange-400', bg: 'bg-orange-500/10', icon: 'alert-triangle' }, notstarted: { label: 'Not Started', color: 'text-slate-400', bg: 'bg-slate-500/10', icon: 'circle' } };
            const info = labels[status];
            const timeString = (inspection || refusal)?.timestamp ? new Date((inspection || refusal).timestamp).toLocaleString() : 'N/A';
            const userString = (inspection || refusal)?.user || 'Unknown';
            content.innerHTML = '<div class="p-5 border-b border-slate-700/50 flex justify-between items-center"><h3 class="font-display text-lg font-bold text-white">Pile ' + pileId + '</h3><button onclick="closePileModal()" class="p-1 text-slate-400 hover:text-white">' + icon('x', 'w-5 h-5') + '</button></div><div class="p-5"><div class="flex items-center gap-3 mb-4"><div class="w-10 h-10 rounded-full ' + info.bg + ' flex items-center justify-center ' + info.color + '">' + icon(info.icon, 'w-5 h-5') + '</div><div><span class="' + info.color + ' font-bold text-lg">' + info.label + '</span><p class="text-xs text-slate-500">' + (status !== 'notstarted' ? 'Recorded' : 'No data') + '</p></div></div>' + (status !== 'notstarted' ? '<div class="space-y-2 mb-4 text-sm"><div class="flex justify-between text-slate-300"><span class="text-slate-500">Inspector:</span><span>' + userString + '</span></div><div class="flex justify-between text-slate-300"><span class="text-slate-500">Timestamp:</span><span>' + timeString + '</span></div>' + (inspection?.depth ? '<div class="flex justify-between text-slate-300"><span class="text-slate-500">Depth:</span><span>' + inspection.depth + ' mm</span></div>' : '') + (inspection?.plumbNS ? '<div class="flex justify-between text-slate-300"><span class="text-slate-500">Plumb N-S:</span><span>' + inspection.plumbNS + '°</span></div>' : '') + (status === 'refusal' ? '<div class="flex justify-between text-slate-300"><span class="text-slate-500">Reason:</span><span class="capitalize">' + (refusal?.reason || 'N/A') + '</span></div>' + (refusal?.achievedDepth ? '<div class="flex justify-between text-slate-300"><span class="text-slate-500">Achieved Depth:</span><span>' + refusal.achievedDepth + ' mm</span></div>' : '') : '') + '</div>' : '') + '<div class="grid grid-cols-2 gap-2 mt-4">' + (status === 'fail' || status === 'refusal' ? '<button onclick="reinspectPile(\\'' + pileId + '\\')" class="w-full py-2 bg-amber-500 hover:bg-amber-400 text-black rounded-lg font-medium text-sm flex items-center justify-center gap-2">' + icon('refresh-cw', 'w-4 h-4') + ' Reinspect</button><button onclick="closePileModal()" class="w-full py-2 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-lg font-medium text-sm">Close</button>' : status === 'notstarted' ? '<button onclick="reinspectPile(\\'' + pileId + '\\')" class="col-span-2 w-full py-2 bg-green-600 hover:bg-green-500 text-white rounded-lg font-medium text-sm flex items-center justify-center gap-2">' + icon('plus', 'w-4 h-4') + ' Inspect Now</button>' : '<button onclick="closePileModal()" class="col-span-2 w-full py-2 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-lg font-medium text-sm">Close</button>') + '</div></div>';
            modal.classList.remove('hidden'); modal.classList.add('flex'); lucide.createIcons();
          }
          function reinspectPile(pileId) { const { row, pile } = parsePileId(pileId); state.currentRow = row; state.currentPile = pile; closePileModal(); navigateTo('inspection'); }
          function closePileModal() { document.getElementById('pileModal').classList.add('hidden'); }
          function zoomIn() { state.heatmap.zoom = Math.min(2, state.heatmap.zoom + 0.25); render(); }
          function zoomOut() { state.heatmap.zoom = Math.max(0.5, state.heatmap.zoom - 0.25); render(); }

          // INSPECTION - WITH PHOTO CAPTURE
          function renderInspection() {
            const pid = getPileId(state.currentRow, state.currentPile);
            return '<div class="space-y-4 animate-fade-in max-w-lg mx-auto"><div class="flex items-center justify-between"><div><h1 class="font-display text-xl font-bold text-white">QC Inspection</h1></div><div class="flex items-center gap-2"><span class="badge-pass px-3 py-1.5 rounded-full text-sm">' + state.session.passed + ' Pass</span><span class="badge-fail px-3 py-1.5 rounded-full text-sm">' + state.session.failed + ' Fail</span></div></div><div class="flex gap-2"><button onclick="setInspectionMode(\\'quick\\')" class="mode-btn ' + (state.inspectionMode === 'quick' ? 'mode-btn-active' : 'mode-btn-inactive') + '">quick</button><button onclick="setInspectionMode(\\'detailed\\')" class="mode-btn ' + (state.inspectionMode === 'detailed' ? 'mode-btn-active' : 'mode-btn-inactive') + '">detailed</button></div><div class="pile-display p-6"><p class="text-xs text-slate-500 uppercase tracking-wider text-center mb-3">INSPECTING</p><div class="flex items-center justify-center gap-4 mb-4"><button onclick="decPile()" class="nav-arrow nav-arrow-large bg-slate-700 text-white">' + icon('chevron-left', 'w-8 h-8') + '</button><div class="flex-1 text-center"><span class="font-display text-5xl font-bold text-white">' + pid + '</span></div><button onclick="incPile()" class="nav-arrow nav-arrow-large bg-slate-700 text-white">' + icon('chevron-right', 'w-8 h-8') + '</button></div><div class="flex items-center justify-center gap-3"><button onclick="decRow()" class="nav-arrow nav-arrow-small bg-slate-700/50 text-slate-300">' + icon('chevron-left', 'w-5 h-5') + '</button><span class="text-sm text-slate-400 px-3">Row #' + state.currentRow + '</span><button onclick="incRow()" class="nav-arrow nav-arrow-small bg-slate-700/50 text-slate-300">' + icon('chevron-right', 'w-5 h-5') + '</button></div></div><div class="grid grid-cols-2 gap-3"><button onclick="recordInspection(\\'pass\\')" class="btn-action bg-green-600 text-white flex flex-col items-center justify-center gap-2">' + icon('check-circle', 'w-12 h-12') + '<span>PASS</span></button><button onclick="recordInspection(\\'fail\\')" class="btn-action bg-red-600 text-white flex flex-col items-center justify-center gap-2">' + icon('x-circle', 'w-12 h-12') + '<span>FAIL</span></button></div><div class="border-t border-slate-700 pt-4 mt-4">' + renderPhotoCapture('inspection') + '</div></div>';
          }
          function incPile() { hapticFeedback(); state.currentPile++; render(); }
          function decPile() { hapticFeedback(); if (state.currentPile > 1) state.currentPile--; render(); }
          function incRow() { hapticFeedback(); state.currentRow++; render(); }
          function decRow() { hapticFeedback(); if (state.currentRow > 1) state.currentRow--; render(); }
          function setInspectionMode(mode) { state.inspectionMode = mode; render(); }
          function recordInspection(status) { 
            hapticFeedback(); 
            playSound(status); 
            const inspection = { 
              pileId: getPileId(state.currentRow, state.currentPile), 
              status, 
              timestamp: Date.now(), 
              user: state.currentUser.name 
            };
            state.inspections.push(inspection);
            state.session[status === 'pass' ? 'passed' : 'failed']++;
            state.currentPile++;
            render();
            // Save to database
            saveInspection(inspection);
          }
          
          // API FUNCTIONS - DATA PERSISTENCE
          async function seedDatabase() {
            try {
              const res = await fetch('/api/seed', { method: 'POST' });
              const data = await res.json();
              if (data.success) {
                console.log('Database seeded:', data.stats);
                await loadInspections();
                await loadRefusals();
              }
            } catch (e) { console.error('Seed error:', e); }
          }
          
          async function loadInspections() {
            try {
              const projectId = state.currentProject?.id || 'proj_001';
              const res = await fetch('/api/inspections?projectId=' + projectId);
              const data = await res.json();
              if (Array.isArray(data)) {
                // Merge with local state
                data.forEach(dbInsp => {
                  const exists = state.inspections.find(i => i.pileId === dbInsp.pileId);
                  if (!exists) {
                    state.inspections.push({
                      pileId: dbInsp.pileId,
                      status: dbInsp.status,
                      timestamp: new Date(dbInsp.inspectedAt).getTime(),
                      user: dbInsp.user?.name || 'Unknown',
                      depth: dbInsp.depth,
                      plumbNS: dbInsp.plumbNS,
                      plumbEW: dbInsp.plumbEW,
                      failReason: dbInsp.failReason
                    });
                  }
                });
                render();
              }
            } catch (e) { console.error('Load inspections error:', e); }
          }
          
          async function loadRefusals() {
            try {
              const projectId = state.currentProject?.id || 'proj_001';
              const res = await fetch('/api/refusals?projectId=' + projectId);
              const data = await res.json();
              if (Array.isArray(data)) {
                data.forEach(dbRef => {
                  const exists = state.refusals.find(r => r.pileId === dbRef.pileId);
                  if (!exists) {
                    state.refusals.push({
                      pileId: dbRef.pileId,
                      reason: dbRef.reason,
                      timestamp: new Date(dbRef.reportedAt).getTime(),
                      user: dbRef.user?.name || 'Unknown',
                      targetDepth: dbRef.targetDepth,
                      achievedDepth: dbRef.achievedDepth
                    });
                  }
                });
                state.openRefusals = data.filter(r => r.status === 'open').length || data.length;
                render();
              }
            } catch (e) { console.error('Load refusals error:', e); }
          }
          
          async function saveInspection(inspection) {
            try {
              const projectId = state.currentProject?.id || 'proj_001';
              await fetch('/api/inspections', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  projectId,
                  pileId: inspection.pileId,
                  status: inspection.status,
                  inspectedBy: state.currentUser.id
                })
              });
            } catch (e) { console.error('Save inspection error:', e); }
          }
          
          async function saveRefusal(refusal) {
            try {
              const projectId = state.currentProject?.id || 'proj_001';
              await fetch('/api/refusals', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  projectId,
                  pileId: refusal.pileId,
                  reason: refusal.reason,
                  targetDepth: refusal.targetDepth,
                  achievedDepth: refusal.achievedDepth,
                  reportedBy: state.currentUser.id
                })
              });
            } catch (e) { console.error('Save refusal error:', e); }
          }

          // REFUSAL - WITH PHOTO CAPTURE
          function renderRefusal() {
            const pid = getPileId(state.refusalRow, state.refusalPile);
            const sh = state.achievedDepth ? state.targetDepth - state.achievedDepth : null;
            const sc = sh ? (sh > 500 ? 'shortfall-critical' : sh > 200 ? 'shortfall-warning' : 'shortfall-minor') : '';
            return '<div class="space-y-4 animate-fade-in max-w-lg mx-auto"><div class="flex items-center justify-between"><h1 class="font-display text-xl font-bold text-white">Pile Refusals</h1><span class="badge-open px-3 py-1.5 rounded-full text-sm">' + state.openRefusals + ' Open</span></div><div class="flex gap-2"><button onclick="setRefusalMode(\\'quick\\')" class="mode-btn ' + (state.refusalMode === 'quick' ? 'mode-btn-active' : 'mode-btn-inactive') + '">Quick</button><button onclick="setRefusalMode(\\'detailed\\')" class="mode-btn ' + (state.refusalMode === 'detailed' ? 'mode-btn-active' : 'mode-btn-inactive') + '">Detailed</button></div><div class="pile-display p-6"><div class="flex items-center justify-center gap-4 mb-4"><button onclick="decRefusalPile()" class="nav-arrow nav-arrow-large bg-slate-700 text-white">' + icon('chevron-left', 'w-8 h-8') + '</button><div class="flex-1 text-center"><span class="font-display text-5xl font-bold text-white">' + pid + '</span></div><button onclick="incRefusalPile()" class="nav-arrow nav-arrow-large bg-slate-700 text-white">' + icon('chevron-right', 'w-8 h-8') + '</button></div></div><div class="grid grid-cols-2 gap-3"><div><label class="text-xs text-slate-500 mb-1 block">Target (mm)</label><input type="number" value="' + state.targetDepth + '" class="w-full bg-slate-800 border border-slate-600 rounded-xl px-4 py-3 text-white font-bold"></div><div><label class="text-xs text-slate-500 mb-1 block">Achieved (mm)</label><input type="number" id="refusalDepth" value="' + (state.achievedDepth||'') + '" onchange="state.achievedDepth=parseInt(this.value);render()" class="w-full bg-slate-800 border border-slate-600 rounded-xl px-4 py-3 text-white font-bold"></div></div>' + (sh !== null ? '<div class="' + sc + ' rounded-xl p-4 text-center"><span class="text-sm text-slate-400">Shortfall: ' + sh + ' mm</span></div>' : '') + '<div><label class="text-xs text-slate-500 mb-2 block">Reason</label><div class="grid grid-cols-4 gap-2">' + ['bedrock', 'cobble', 'obstruction', 'other'].map(r => '<button onclick="setRefusalReason(\\'' + r + '\\')" class="reason-btn ' + (state.refusalReason===r?'reason-btn-selected':'') + '"><span class="text-xs text-white capitalize">' + r + '</span></button>').join('') + '</div></div><div class="border-t border-slate-700 pt-4 mt-4">' + renderPhotoCapture('refusal') + '</div><button onclick="submitRefusal()" class="w-full py-4 bg-red-600 text-white rounded-xl font-bold mt-4">LOG REFUSAL</button></div>';
          }
          function incRefusalPile() { hapticFeedback(); state.refusalPile++; render(); }
          function decRefusalPile() { hapticFeedback(); if (state.refusalPile > 1) state.refusalPile--; render(); }
          function setRefusalMode(mode) { state.refusalMode = mode; render(); }
          function setRefusalReason(reason) { state.refusalReason = reason; render(); }
          function submitRefusal() { 
            hapticFeedback(); 
            const refusal = { 
              pileId: getPileId(state.refusalRow, state.refusalPile), 
              reason: state.refusalReason, 
              timestamp: Date.now(), 
              user: state.currentUser.name, 
              targetDepth: state.targetDepth, 
              achievedDepth: state.achievedDepth 
            };
            state.refusals.push(refusal);
            state.openRefusals++; 
            state.refusalPile++; 
            state.achievedDepth = null; 
            state.refusalReason = null; 
            state.refusalPhotos = []; 
            render();
            // Save to database
            saveRefusal(refusal);
          }

          // PRODUCTION - WITH PHOTO CAPTURE
          function renderProduction() {
            return '<div class="space-y-4 animate-fade-in max-w-lg mx-auto"><div><h1 class="font-display text-xl font-bold text-white">Production Entry</h1></div><div class="bg-slate-800/50 border border-slate-700 rounded-xl p-5 space-y-4"><div><label class="text-xs text-slate-500 uppercase mb-1.5 block">Crew</label><select class="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-3 text-white"><option value="">Select...</option>' + state.crews.map(c => '<option value="' + c.id + '">' + c.name + '</option>').join('') + '</select></div><div><label class="text-xs text-slate-500 uppercase mb-1.5 block">Subcontractor</label><select class="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-3 text-white"><option value="">Select...</option>' + state.subcontractors.map(s => '<option value="' + s.id + '">' + s.name + '</option>').join('') + '</select></div><div class="grid grid-cols-3 gap-3"><div><label class="text-xs text-slate-500 mb-1 block">Piles</label><input type="number" class="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-3 text-white font-mono text-center" placeholder="0"></div><div><label class="text-xs text-slate-500 mb-1 block">Tables</label><input type="number" class="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-3 text-white font-mono text-center" placeholder="0"></div><div><label class="text-xs text-slate-500 mb-1 block">Modules</label><input type="number" class="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-3 text-white font-mono text-center" placeholder="0"></div></div><div><label class="text-xs text-slate-500 uppercase mb-1.5 block">Notes</label><textarea rows="2" placeholder="Any issues or notes..." class="w-full bg-slate-900 border border-slate-600 rounded-xl px-4 py-3 text-white resize-none text-sm"></textarea></div><div>' + renderPhotoCapture('production') + '</div><button onclick="submitProduction()" class="w-full py-4 bg-amber-500 hover:bg-amber-400 text-black rounded-xl font-bold text-lg">Submit</button></div></div>';
          }
          function submitProduction() { alert('Production entry submitted!'); state.productionEntry.photos = []; render(); }

          function renderSettings() {
      return '<div class="space-y-6 animate-fade-in">' +
        '<div class="flex items-center justify-between"><div><h1 class="font-display text-2xl font-bold text-white">Settings</h1><p class="text-slate-400">App configuration</p></div></div>' +
        '<div class="card rounded-xl p-5"><h3 class="font-display font-semibold text-white mb-4">General</h3><div class="space-y-4">' +
          '<div class="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg"><span class="text-slate-300">Sound Effects</span><button class="w-12 h-6 bg-amber-500 rounded-full relative"><span class="absolute right-1 top-1 w-4 h-4 bg-white rounded-full"></span></button></div>' +
          '<div class="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg"><span class="text-slate-300">Haptic Feedback</span><button class="w-12 h-6 bg-amber-500 rounded-full relative"><span class="absolute right-1 top-1 w-4 h-4 bg-white rounded-full"></span></button></div>' +
          '<div class="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg"><span class="text-slate-300">Auto-sync</span><button class="w-12 h-6 bg-amber-500 rounded-full relative"><span class="absolute right-1 top-1 w-4 h-4 bg-white rounded-full"></span></button></div>' +
        '</div></div>' +
      '</div>';
    }

          // MAIN RENDER
          function render() {
            const views = { company: renderCompanyDashboard, dashboard: renderProjectDashboard, production: renderProduction, inspection: renderInspection, refusal: renderRefusal, heatmap: renderHeatMap, analytics: renderAnalytics, reports: renderReports, racking: renderRackingProfiles, settings: renderSettings };
            const content = views[state.currentView] ? views[state.currentView]() : '<p>View not found</p>';
            document.getElementById('app').innerHTML = renderSidebar() + '<header class="lg:hidden fixed top-0 left-0 right-0 z-40 bg-slate-900/95 backdrop-blur border-b border-slate-700/50 px-4 py-3"><div class="flex items-center justify-between"><button onclick="toggleSidebar()" class="p-2 -ml-2 text-slate-300">' + icon('menu', 'w-5 h-5') + '</button><div class="flex items-center gap-2"><div class="w-8 h-8 rounded-lg bg-amber-500 flex items-center justify-center">' + icon('trending-up', 'w-4 h-4 text-white') + '</div><span class="font-display font-bold text-white">SolTrend</span></div><div class="w-10"></div></div></header><main class="lg:ml-60 min-h-screen pt-16 lg:pt-0 pb-6"><div class="p-4 lg:p-6 max-w-6xl mx-auto">' + content + '</div></main>' + (state.sidebarOpen ? '<div onclick="toggleSidebar()" class="lg:hidden fixed inset-0 z-40 bg-black/50"></div>' : '');
            if (window.lucide) lucide.createIcons();
          }

          function navigateTo(view) { state.currentView = view; state.sidebarOpen = false; render(); window.scrollTo(0, 0); }
          function toggleSidebar() { state.sidebarOpen = !state.sidebarOpen; render(); }
          function openProject(id) { state.currentProject = state.projects.find(p => p.id === id); state.currentView = 'dashboard'; render(); }

          document.addEventListener('keydown', (e) => {
            if (state.currentView !== 'inspection') return;
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
            if (e.key === 'p' || e.key === 'P') recordInspection('pass');
            else if (e.key === 'f' || e.key === 'F') recordInspection('fail');
          });

          function setupEventListeners() {
            const projectSelect = document.getElementById('projectSelect');
            if (projectSelect) { projectSelect.addEventListener('change', (e) => { state.currentProject = state.projects.find(p => p.id === e.target.value); render(); }); }
          }

          // INITIALIZATION - Seed database and load data
          async function initializeApp() {
            // Generate demo data first (instant UI)
            generateDemoData();
            render();
            setupEventListeners();
            
            // Then seed database and load persisted data
            await seedDatabase();
          }

          initializeApp();
        `}
      </Script>
    </>
  )
}
