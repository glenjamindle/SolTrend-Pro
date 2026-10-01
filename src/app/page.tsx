import Script from 'next/script'
import { getServerSession } from 'next-auth/next'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'

export default async function SolTrendApp() {
  const session = await getServerSession(authOptions)
  // Middleware only checks that a signature-valid JWT is present - it
  // doesn't (can't, cheaply, from the Edge runtime) verify the user behind
  // that token still exists. auth.ts's session callback now does that
  // real check, so a session for a deleted user comes back with no `user`
  // here even though middleware let the request through. Previously this
  // fell through to a hardcoded demo fallback ({ name: 'Marcus Thompson',
  // role: 'admin' }) further down, which is how a since-deleted demo
  // account could still show up as the logged-in user in the corner of
  // the app - not a real session, just a silent stand-in nobody could
  // tell apart from a real one. Redirecting to login is the honest
  // behavior for "there is no valid user here" in every case, deleted-user
  // included.
  if (!session?.user) {
    redirect('/login')
  }
  const sessionUser = {
    id: session.user.id,
    name: session.user.name || 'User',
    role: session.user.role || 'inspector',
  }

  return (
    <>
      <script
        dangerouslySetInnerHTML={{ __html: `window.__SESSION_USER__ = ${JSON.stringify(sessionUser)};` }}
      />
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
        .shortfall-neutral { background: #1e293b; border: 2px solid transparent; border-radius: 12px; }
        .photo-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; margin-top: 12px; }
        .photo-thumb { aspect-ratio: 1; border-radius: 8px; overflow: hidden; position: relative; background: #000; border: 1px solid #334155; }
        .photo-thumb img { width: 100%; height: 100%; object-fit: cover; }
        .photo-delete { position: absolute; top: 4px; right: 4px; width: 24px; height: 24px; background: rgba(0,0,0,0.7); border-radius: 50%; display: flex; align-items: center; justify-content: center; cursor: pointer; color: white; border: 1px solid rgba(255,255,255,0.2); }
        .capture-btn { border: 2px dashed #334155; background: rgba(30, 41, 59, 0.5); transition: all 0.15s ease; cursor: pointer; border-radius: 12px; }
        .capture-btn:hover { border-color: #f59e0b; background: rgba(245, 158, 11, 0.05); }
        .heat-cell { width: 100%; aspect-ratio: 1; border-radius: 3px; transition: transform 0.15s ease; cursor: pointer; border: 1px solid rgba(0,0,0,0.2); }
        .heat-cell:hover { transform: scale(1.5); z-index: 10; box-shadow: 0 0 8px rgba(255,255,255,0.3); border-color: white; }
        .heat-cell.dimmed { opacity: 0.15; }
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
        .activity-item.production::before { background: #3b82f6; }
        .sparkline { display: flex; align-items: flex-end; gap: 2px; height: 40px; }
        .sparkline-bar { flex: 1; background: linear-gradient(to top, #f59e0b, #fbbf24); border-radius: 2px; }
        .chart-bar { transition: all 0.2s ease; }
        .chart-bar:hover { filter: brightness(1.2); }
        .donut-chart { position: relative; width: 120px; height: 120px; }
        .donut-ring { fill: none; stroke-width: 12; }
        .donut-segment { fill: none; stroke-width: 12; stroke-linecap: round; }
        .donut-center { position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); text-align: center; }
        #app { visibility: hidden; }
        .app-loading-screen { position: fixed; inset: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 14px; background: var(--bg); z-index: 9999; }
        .app-loading-screen img { width: 56px; height: 56px; border-radius: 14px; box-shadow: 0 8px 24px rgba(245, 158, 11, 0.25); animation: appLoadingPulse 1.6s ease-in-out infinite; }
        @keyframes appLoadingPulse { 0%, 100% { opacity: 1; transform: scale(1); } 50% { opacity: 0.6; transform: scale(0.94); } }
        .app-loading-text { font-family: 'Space Grotesk', sans-serif; font-weight: 700; font-size: 14px; color: var(--fg-muted); letter-spacing: 0.5px; }
        .project-order-row { touch-action: none; }
        .project-order-row.dragging { position: relative; z-index: 10; box-shadow: 0 12px 24px rgba(0,0,0,0.4); cursor: grabbing; }
        .project-drag-handle { cursor: grab; color: #64748b; padding: 4px; touch-action: none; flex-shrink: 0; }
        .project-drag-handle:hover { color: #94a3b8; }
        /* iOS Safari renders a native type="date" input's value as a
           rounded "pill" inside the field, sized by WebKit's own shadow DOM
           rather than the input's CSS box - width:100% on the input itself
           doesn't reliably constrain it, so on a narrow phone screen (and
           worst on the big touch-friendly date fields in Production/Delays)
           that pill can render wider than the card around it. appearance:
           none drops into WebKit's plain text-field rendering instead,
           which does respect the box; tapping the field still opens the
           native date picker either way. */
        input[type="date"] { -webkit-appearance: none; appearance: none; width: 100%; min-width: 0; box-sizing: border-box; }
      ` }} />
      <div id="app-loading" className="app-loading-screen">
        <img src="/logo-mark.png" alt="SolTrend Pro" />
        <div className="app-loading-text">Loading SolTrend Pro...</div>
      </div>
      <div id="app" />
      <Script src="https://cdn.tailwindcss.com" strategy="beforeInteractive" />
      <Script src="https://unpkg.com/lucide@latest/dist/umd/lucide.min.js" strategy="afterInteractive" />
      <Script id="soltrend-app" strategy="afterInteractive">
        {`
          // STATE MANAGEMENT
          const state = {
            currentView: 'company',
            // The server above now redirects to /login whenever there's no
            // real, currently-valid session, so window.__SESSION_USER__
            // should always be a real user object by the time this script
            // runs. This is just a defensive fallback for that assumption
            // ever being wrong in the future - deliberately NOT a fake
            // identity (the old default silently pretended to be a demo
            // "Marcus Thompson / admin", which is exactly the kind of bug
            // that made a deleted user's stale session look legitimate).
            currentUser: window.__SESSION_USER__ || { id: '', name: 'Unknown User', role: 'inspector' },
            currentProject: null,
            inspectionMode: 'quick',
            sidebarOpen: false,
            isOnline: navigator.onLine,
            analyticsTab: 'production',
            settingsTab: 'company',
            editingItem: null, // For modal editing
            reportDates: {
              daily: new Date().toISOString().split('T')[0],
              weekly: new Date().toISOString().split('T')[0],
              monthly: new Date().getFullYear() + '-' + String(new Date().getMonth() + 1).padStart(2, '0'),
              qcStart: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
              qcEnd: new Date().toISOString().split('T')[0],
              refusalStart: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
              refusalEnd: new Date().toISOString().split('T')[0]
            },
            companyId: null,
            company: null,
            projects: [],
            inspections: [],
            refusals: [],
            production: [],
            crews: [],
            subcontractors: [],
            rackingProfiles: [],
            editingRackingTypes: [],
            piles: [],
            pileCsvPreview: null,
            editingPile: null,
            users: [],
            recentActivity: [],
            currentRow: 35, currentPile: 22,
            inspectionPhotos: [], lastInspection: null,
            inspectionFailReason: null,
            inspectionDepth: '', inspectionPlumbNS: '', inspectionPlumbEW: '',
            inspectionPileType: '', inspectionHeight: '', inspectionTwist: '', inspectionSpacing: '', inspectionAlignment: '',
            predictiveWeather: null,
            session: { passed: 0, failed: 0 },
            refusalRow: 35, refusalPile: 22,
            targetDepth: 72, achievedDepth: null, refusalReason: null, refusalNotes: '', refusalPhotos: [],
            openRefusals: 8,
            productionEntry: { crew: null, subcontractor: null, notes: '', photos: [] },
            isListening: false,
            heatmap: { zoom: 1, totalRows: 50, pilesPerRow: 30, search: '' },
            notifications: [], unreadCount: 0, notifPanelOpen: false,
            delays: [],
            delayDate: new Date().toISOString().split('T')[0], delayReason: null, delayHours: '', delayDescription: '',
            punchItems: [], punchFilter: 'open', punchFormOpen: false,
            punchDescription: '', punchLocation: '', punchPriority: 'medium', punchAssignedTo: '', punchDueDate: '', punchNotes: '', punchPhotos: [],
            pendingSyncCount: 0,
            // SAFETY
            toolboxTalks: [], safetyObservations: [], safetyIncidents: [],
            safetyTab: 'talks',
            talkTopic: '', talkConductedBy: '', talkCrewName: '', talkAttendeeCount: '', talkNotes: '',
            obsType: 'positive', obsCategory: null, obsLocation: '', obsDescription: '', obsPhotos: [],
            incidentSeverity: null, incidentDescription: '', incidentCorrectiveAction: '', incidentPhotos: [],
            // SCHEDULE
            milestones: [], milestoneFormOpen: false, editingMilestoneId: null,
            milestonePhase: '', milestonePlannedStart: '', milestonePlannedEnd: '', milestoneActualStart: '', milestoneActualEnd: '', milestoneStatus: 'not_started', milestonePercent: '',
            // DOCUMENTS & COI
            documents: [], cois: [], documentsTab: 'library',
            docFormOpen: false, docTitle: '', docCategory: 'site_plans', docPendingFile: null,
            coiFormOpen: false, coiSubcontractorId: '', coiCoverageType: 'general_liability', coiExpiresAt: '', coiPendingFile: null,
            // MATERIALS
            materials: [], deliveries: [],
            materialFormOpen: false, materialName: '', materialOrderedQty: '', materialUnit: 'units', materialExpectedDate: '', materialSupplier: '',
            deliveryFormOpen: false, deliveryMaterialId: '', deliveryQty: '', deliverySupplier: '', deliveryReceivedBy: '', deliveryNotes: '',
            // RFIS & SUBMITTALS
            rfis: [], submittals: [], rfiSubmittalsTab: 'rfis',
            rfiSubject: '', rfiCategory: 'other', rfiSubmittedTo: '', rfiQuestion: '', rfiBlocking: false, rfiPhotos: [],
            rfiAnswerDraft: {}, rfiFilter: 'all', subFilter: 'all',
            subSpecSection: '', subType: 'product_data', subMaterialId: '', subDueDate: '', subPendingFile: null
          };

          // OFFLINE SUPPORT
          // Everything below makes the current project usable with no
          // signal: cached reads, a local write queue for creates/updates,
          // and a service worker so the app itself (not just its data) can
          // boot from cache. It's all built on top of window.fetch, which
          // every API call in this file already goes through - so nothing
          // elsewhere needs to change to benefit from it.
          //
          // Scope, deliberately: only the currently-open project's data is
          // cached (switching projects needs a live connection), and only
          // creates/updates (POST/PUT) are queued - deletes still require a
          // connection, since replaying a queued delete against data that
          // may have changed on the server in the meantime is a much easier
          // way to lose someone else's work than a queued create/update is.
          const originalFetch = window.fetch.bind(window);
          let offlineDbPromise = null;
          function openOfflineDB() {
            if (offlineDbPromise) return offlineDbPromise;
            offlineDbPromise = new Promise(function(resolve, reject) {
              if (!('indexedDB' in window)) { reject(new Error('IndexedDB unavailable')); return; }
              const req = indexedDB.open('soltrend-offline', 1);
              req.onupgradeneeded = function() {
                const db = req.result;
                if (!db.objectStoreNames.contains('pendingWrites')) db.createObjectStore('pendingWrites', { keyPath: 'id', autoIncrement: true });
                if (!db.objectStoreNames.contains('getCache')) db.createObjectStore('getCache', { keyPath: 'url' });
              };
              req.onsuccess = function() { resolve(req.result); };
              req.onerror = function() { reject(req.error); };
            });
            return offlineDbPromise;
          }
          function idbRequest(storeName, mode, fn) {
            return openOfflineDB().then(function(db) {
              return new Promise(function(resolve, reject) {
                const tx = db.transaction(storeName, mode);
                const store = tx.objectStore(storeName);
                const result = fn(store);
                tx.oncomplete = function() { resolve(result && result.result !== undefined ? result.result : result); };
                tx.onerror = function() { reject(tx.error); };
              });
            });
          }
          function idbPut(storeName, value) { return idbRequest(storeName, 'readwrite', function(store) { return store.put(value); }).catch(function() {}); }
          function idbGet(storeName, key) { return idbRequest(storeName, 'readonly', function(store) { return store.get(key); }).catch(function() { return undefined; }); }
          function idbGetAll(storeName) { return idbRequest(storeName, 'readonly', function(store) { return store.getAll(); }).catch(function() { return []; }); }
          function idbDelete(storeName, key) { return idbRequest(storeName, 'readwrite', function(store) { return store.delete(key); }).catch(function() {}); }

          async function updatePendingSyncBadge() {
            const items = await idbGetAll('pendingWrites');
            const count = (items || []).length;
            if (count !== state.pendingSyncCount) { state.pendingSyncCount = count; render(); }
          }

          function buildPendingUploadResponse(options) {
            let payload = {};
            try { payload = JSON.parse(options.body); } catch (e) {}
            // No real upload happened - the photo's own data URL stands in
            // as its "url" for now (which is also a valid <img src>, so
            // thumbnails still render normally), tagged so the queued
            // record that references it knows to redo this for real once
            // back online.
            return new Response(JSON.stringify({
              url: payload.dataUrl, key: null, pendingUpload: true,
              uploadContext: payload.context, uploadPileId: payload.pileId
            }), { status: 200, headers: { 'Content-Type': 'application/json' } });
          }

          function buildPendingDocUploadResponse(options) {
            let payload = {};
            try { payload = JSON.parse(options.body); } catch (e) {}
            // Same idea as buildPendingUploadResponse, for a single attached
            // file (Documents, COI certificates, Submittals) instead of a
            // photo array - the data URL stands in as the file's url until
            // flushPendingWrites redoes the upload for real.
            return new Response(JSON.stringify({
              url: payload.dataUrl, key: null, pendingUpload: true, uploadContext: payload.context
            }), { status: 200, headers: { 'Content-Type': 'application/json' } });
          }

          async function queueWrite(url, options) {
            await idbPut('pendingWrites', { url: url, method: options.method || 'POST', headers: options.headers || { 'Content-Type': 'application/json' }, body: options.body || null, timestamp: Date.now() });
            updatePendingSyncBadge();
          }

          // Every fetch() call in this file goes through here. GET requests
          // to /api/ are cached on success and served from that cache if the
          // network fails; POST/PUT are queued on failure (photo uploads get
          // a local placeholder instead - see buildPendingUploadResponse).
          window.fetch = async function(url, options) {
            options = options || {};
            const method = (options.method || 'GET').toUpperCase();
            const isApi = typeof url === 'string' && url.indexOf('/api/') === 0;
            if (!isApi) return originalFetch(url, options);

            if (method === 'GET') {
              try {
                const res = await originalFetch(url, options);
                if (res && res.ok) {
                  res.clone().text().then(function(text) { idbPut('getCache', { url: url, body: text, timestamp: Date.now() }); }).catch(function() {});
                }
                return res;
              } catch (err) {
                const cached = await idbGet('getCache', url);
                if (cached) return new Response(cached.body, { status: 200, headers: { 'Content-Type': 'application/json' } });
                throw err;
              }
            }

            if (method === 'POST' || method === 'PUT') {
              try {
                return await originalFetch(url, options);
              } catch (err) {
                if (url === '/api/upload') return buildPendingUploadResponse(options);
                if (url === '/api/upload-document') return buildPendingDocUploadResponse(options);
                await queueWrite(url, options);
                return new Response(JSON.stringify({ queued: true }), { status: 202, headers: { 'Content-Type': 'application/json' } });
              }
            }

            // DELETE and anything else: unchanged behavior, no offline queueing.
            return originalFetch(url, options);
          };

          async function flushPendingWrites() {
            const items = (await idbGetAll('pendingWrites')).sort(function(a, b) { return a.timestamp - b.timestamp; });
            let syncedCount = 0;
            for (const item of items) {
              try {
                let body = item.body;
                if (typeof body === 'string' && (body.indexOf('"pendingUpload":true') !== -1 || body.indexOf('"filePendingUpload":true') !== -1)) {
                  const parsed = JSON.parse(body);
                  if (Array.isArray(parsed.photos)) {
                    for (const photo of parsed.photos) {
                      if (!photo.pendingUpload) continue;
                      const upRes = await originalFetch('/api/upload', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ dataUrl: photo.url, context: photo.uploadContext, pileId: photo.uploadPileId }) });
                      const upData = await upRes.json();
                      if (upData.url) { photo.url = upData.url; photo.key = upData.key; }
                      delete photo.pendingUpload; delete photo.uploadContext; delete photo.uploadPileId;
                    }
                  }
                  if (parsed.filePendingUpload && parsed.fileUrl) {
                    const upRes = await originalFetch('/api/upload-document', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ dataUrl: parsed.fileUrl, context: parsed.fileUploadContext || 'document' }) });
                    const upData = await upRes.json();
                    if (upData.url) { parsed.fileUrl = upData.url; parsed.fileKey = upData.key; }
                    delete parsed.filePendingUpload; delete parsed.fileUploadContext;
                  }
                  body = JSON.stringify(parsed);
                }
                const res = await originalFetch(item.url, { method: item.method, headers: item.headers, body: body });
                if (!res.ok) throw new Error('Sync failed with status ' + res.status);
                await idbDelete('pendingWrites', item.id);
                syncedCount++;
              } catch (err) {
                console.error('Offline sync error, will retry later:', err);
                break; // Stop here so the remaining queue stays in order for the next attempt.
              }
            }
            await updatePendingSyncBadge();
            if (syncedCount > 0 && state.currentProject) loadProjectData();
            return syncedCount;
          }

          function renderOfflineBanner() {
            if (state.isOnline && state.pendingSyncCount === 0) return '';
            if (!state.isOnline) {
              return '<div class="mb-4 px-4 py-3 rounded-xl flex items-center gap-2 text-sm font-medium" style="background: rgba(234, 179, 8, 0.12); border: 1px solid rgba(234, 179, 8, 0.35); color: #eab308;">' + icon('wifi-off', 'w-4 h-4 flex-shrink-0') + '<span>You\\'re offline. Changes save on this device and sync automatically once you\\'re back online' + (state.pendingSyncCount > 0 ? ' (' + state.pendingSyncCount + ' pending)' : '') + '.</span></div>';
            }
            return '<div class="mb-4 px-4 py-3 rounded-xl flex items-center gap-2 text-sm font-medium" style="background: rgba(245, 158, 11, 0.12); border: 1px solid rgba(245, 158, 11, 0.35); color: #f59e0b;">' + icon('refresh-cw', 'w-4 h-4 flex-shrink-0') + '<span>Syncing ' + state.pendingSyncCount + ' offline change' + (state.pendingSyncCount === 1 ? '' : 's') + '...</span></div>';
          }

          if ('serviceWorker' in navigator) {
            window.addEventListener('load', function() {
              navigator.serviceWorker.register('/sw.js').catch(function(e) { console.error('Service worker registration failed:', e); });
            });
          }
          window.addEventListener('online', function() { state.isOnline = true; render(); flushPendingWrites(); });
          window.addEventListener('offline', function() { state.isOnline = false; render(); });

          // UTILITY FUNCTIONS
          function formatDate(dateStr) { const date = new Date(dateStr); return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }); }
          function formatNumber(num) { return num?.toLocaleString() || '0'; }
          function getPileId(row, pile) { return row + '-' + pile; }
          function parsePileId(id) { const parts = String(id).split('-'); return { row: parseInt(parts[0]) || 1, pile: parseInt(parts[1]) || 1 }; }

          // DATE HELPERS FOR REPORTS
          // localDateStr() renders an epoch-ms timestamp as a YYYY-MM-DD string
          // in the browser's local timezone - the report date pickers (<input
          // type="date">) also hand back plain YYYY-MM-DD strings, so comparing
          // these directly as strings sidesteps the timezone bug you'd otherwise
          // get from doing new Date('2026-09-22') (parsed as UTC midnight) vs
          // new Date(timestamp).toDateString() (rendered in local time) - those
          // two disagree by a day for any timezone west of UTC, e.g. Phoenix.
          function pad2(n) { return String(n).padStart(2, '0'); }
          function localDateStr(ms) { const d = new Date(ms); return d.getFullYear() + '-' + pad2(d.getMonth() + 1) + '-' + pad2(d.getDate()); }
          // Inspector/Manager/Admin existed only as a label on the user form -
          // nothing in the app actually checked it, so any signed-in user
          // could delete a project or edit company settings. The server
          // (see /api/settings) is what actually enforces this now; these
          // just keep the UI from offering actions that would get a 403.
          function currentRole() { return state.currentUser?.role || 'inspector'; }
          function hasRole(min) {
            const rank = { inspector: 1, manager: 2, admin: 3 };
            return (rank[currentRole()] || 0) >= rank[min];
          }
          function timeAgo(ms) {
            const diffMin = Math.max(0, Math.round((Date.now() - ms) / 60000));
            if (diffMin < 1) return 'just now';
            if (diffMin < 60) return diffMin + 'm ago';
            const diffHr = Math.round(diffMin / 60);
            if (diffHr < 24) return diffHr + 'h ago';
            const diffDay = Math.round(diffHr / 24);
            return diffDay + 'd ago';
          }

          // Recent Activity used to be a separate array only ever populated
          // by the demo-data seeder, so on a real project (no demo fallback)
          // it just stayed empty forever - nothing that actually happened
          // (a real inspection, refusal, or production entry) ever appeared
          // here. This derives the feed straight from the same real data
          // already loaded for the dashboard/analytics widgets instead.
          function computeRecentActivity() {
            const items = [];
            state.inspections.forEach(function(i) {
              items.push({
                type: i.status === 'pass' ? 'pass' : 'fail',
                message: (i.status === 'pass' ? 'Passed pile ' : 'Failed pile ') + i.pileId,
                user: i.user,
                timestamp: i.timestamp
              });
            });
            state.refusals.forEach(function(r) {
              items.push({
                type: 'refusal',
                message: 'Logged refusal at ' + r.pileId,
                user: r.user,
                timestamp: r.timestamp
              });
            });
            state.production.forEach(function(p) {
              items.push({
                type: 'production',
                message: p.piles + ' pile' + (p.piles === 1 ? '' : 's') + ' installed' + (p.crew ? ' — ' + p.crew : ''),
                user: p.user || p.crew || 'Field crew',
                timestamp: new Date(p.date).getTime()
              });
            });
            items.sort(function(a, b) { return b.timestamp - a.timestamp; });
            return items.slice(0, 5).map(function(a) {
              return { type: a.type, message: a.message, user: a.user, time: timeAgo(a.timestamp) };
            });
          }
          function daysInMonth(y, m) { return new Date(y, m, 0).getDate(); }
          function addDaysStr(dateStr, days) { const parts = dateStr.split('-').map(Number); const dt = new Date(parts[0], parts[1] - 1, parts[2]); dt.setDate(dt.getDate() + days); return dt.getFullYear() + '-' + pad2(dt.getMonth() + 1) + '-' + pad2(dt.getDate()); }
          // Real schedule estimate, not a fixed guess - avgRate is piles/day
          // since the project's actual startDate, extrapolated forward from
          // the real installedPiles count. Returns null when there's not yet
          // enough data (no installs logged, or no startDate) to say anything
          // meaningful, so callers can show an honest "not available" instead
          // of a fake number.
          // Shared with the AI Predictions tab, which needs the raw rate
          // (not just a day count) to show "X piles/day" and compare it
          // against the project's target.
          function avgInstallRate(project) {
            if (!project || !project.installedPiles || !project.startDate) return null;
            const daysElapsed = Math.max(1, Math.ceil((Date.now() - new Date(project.startDate).getTime()) / 86400000));
            const rate = project.installedPiles / daysElapsed;
            return (isFinite(rate) && rate > 0) ? rate : null;
          }
          function estimateDaysRemaining(project) {
            if (!project || !project.totalPiles) return null;
            const remaining = project.totalPiles - (project.installedPiles || 0);
            if (remaining <= 0) return 0;
            const avgRate = avgInstallRate(project);
            if (!avgRate) return null;
            return Math.ceil(remaining / avgRate);
          }
          function daysElapsedSince(dateStr) {
            if (!dateStr) return null;
            return Math.max(0, Math.floor((Date.now() - new Date(dateStr).getTime()) / 86400000));
          }
          // Day of Week Analysis (Analytics > Production) - was two fully
          // hardcoded arrays (85/92/88/95/82/45/30% and similar) regardless
          // of any real data. Both now computed from real records; a
          // weekday with nothing logged yet shows null rather than a fake
          // value. getDay(): 0=Sun..6=Sat.
          const DOW_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
          const DOW_DISPLAY_ORDER = [1, 2, 3, 4, 5, 6, 0]; // Mon..Sun
          function dayOfWeekPassRates() {
            const buckets = [0, 1, 2, 3, 4, 5, 6].map(function() { return { pass: 0, fail: 0 }; });
            state.inspections.forEach(function(i) {
              if (i.status !== 'pass' && i.status !== 'fail') return;
              const dow = new Date(i.timestamp).getDay();
              buckets[dow][i.status]++;
            });
            return buckets.map(function(b) { const total = b.pass + b.fail; return total > 0 ? Math.round((b.pass / total) * 100) : null; });
          }
          function dayOfWeekAvgProduction() {
            const buckets = [0, 1, 2, 3, 4, 5, 6].map(function() { return { sum: 0, count: 0 }; });
            state.production.forEach(function(p) {
              const parts = p.date.split('-').map(Number);
              const dow = new Date(parts[0], parts[1] - 1, parts[2]).getDay();
              buckets[dow].sum += p.piles;
              buckets[dow].count++;
            });
            return buckets.map(function(b) { return b.count > 0 ? Math.round(b.sum / b.count) : null; });
          }
          // Field Ops "Daily Inspections This Week" - was a hardcoded
          // [45,52,38,55,48,62,41]. Real counts for the current calendar
          // week (Mon-Sun), so days later in the week that haven't happened
          // yet just show 0 rather than a fake number.
          function inspectionsThisWeek() {
            const now = new Date();
            const dow = now.getDay();
            const mondayOffset = dow === 0 ? -6 : 1 - dow;
            const monday = new Date(now.getFullYear(), now.getMonth(), now.getDate() + mondayOffset);
            const counts = [0, 0, 0, 0, 0, 0, 0]; // Mon..Sun
            state.inspections.forEach(function(i) {
              const d = new Date(i.timestamp);
              const dayStart = new Date(d.getFullYear(), d.getMonth(), d.getDate());
              const diffDays = Math.round((dayStart.getTime() - monday.getTime()) / 86400000);
              if (diffDays >= 0 && diffDays < 7) counts[diffDays]++;
            });
            return counts;
          }
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
          // Small pill badge for any status that isn't a plain pass/fail/open
          // (those already have real CSS classes above) - takes a hex color
          // and derives a translucent background/border from it so Safety,
          // Schedule, Documents, and Materials don't need their own CSS.
          function statusBadge(label, hex) {
            return '<span class="text-[10px] font-bold uppercase tracking-wide px-2 py-1 rounded-full whitespace-nowrap" style="background:' + hex + '22;color:' + hex + ';border:1px solid ' + hex + '55;">' + label + '</span>';
          }

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
                else if (context === 'punchlist') state.punchPhotos.push(photoObj);
                else if (context === 'safety-obs') state.obsPhotos.push(photoObj);
                else if (context === 'safety-incident') state.incidentPhotos.push(photoObj);
                else if (context === 'rfi') state.rfiPhotos.push(photoObj);
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
            else if (context === 'punchlist') state.punchPhotos = state.punchPhotos.filter(p => p.id !== id);
            else if (context === 'safety-obs') state.obsPhotos = state.obsPhotos.filter(p => p.id !== id);
            else if (context === 'safety-incident') state.incidentPhotos = state.incidentPhotos.filter(p => p.id !== id);
            else if (context === 'rfi') state.rfiPhotos = state.rfiPhotos.filter(p => p.id !== id);
            render();
          }
          function renderPhotoCapture(context) {
            let photos = [];
            if (context === 'production') photos = state.productionEntry.photos;
            else if (context === 'inspection') photos = state.inspectionPhotos;
            else if (context === 'refusal') photos = state.refusalPhotos;
            else if (context === 'punchlist') photos = state.punchPhotos;
            else if (context === 'safety-obs') photos = state.obsPhotos;
            else if (context === 'safety-incident') photos = state.incidentPhotos;
            else if (context === 'rfi') photos = state.rfiPhotos;
            return '<div class="space-y-2"><input type="file" id="photoInput-' + context + '" accept="image/*" capture="environment" class="hidden" onchange="handlePhotoCapture(event, \\'' + context + '\\')"><div class="flex items-center gap-3"><button onclick="triggerPhotoInput(\\'' + context + '\\')" class="capture-btn flex-1 py-3 rounded-xl flex items-center justify-center gap-2 text-slate-400 hover:text-white">' + icon('camera', 'w-5 h-5') + ' <span class="font-medium text-sm">Add Photo</span></button><button onclick="triggerPhotoInput(\\'' + context + '\\')" class="capture-btn w-12 h-12 rounded-xl flex items-center justify-center text-slate-400 hover:text-white">' + icon('image', 'w-5 h-5') + '</button></div>' + (photos.length > 0 ? '<div class="photo-grid">' + photos.map(p => '<div class="photo-thumb"><img src="' + p.url + '" alt="Photo"><button onclick="removePhoto(\\'' + context + '\\', \\'' + p.id + '\\')" class="photo-delete">' + icon('x', 'w-3 h-3') + '</button></div>').join('') + '</div>' : '') + '</div>';
          }

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
                if (random < 0.65) state.inspections.push({ pileId, status: 'pass', timestamp: Date.now() - Math.random()*3600000*24, user: state.crews[0].lead, depth: Math.floor(72 + Math.random()*8), plumbNS: (Math.random()*2).toFixed(1), plumbEW: (Math.random()*2).toFixed(1) });
                else if (random < 0.72) state.inspections.push({ pileId, status: 'fail', timestamp: Date.now() - Math.random()*3600000*5, user: state.crews[1].lead, depth: Math.floor(64 + Math.random()*8), plumbNS: (2 + Math.random()*2).toFixed(1), plumbEW: (Math.random()*2).toFixed(1), failReason: ['plumb', 'twist', 'height', 'alignment', 'spacing'][Math.floor(Math.random()*5)] });
                else if (random < 0.76) state.refusals.push({ pileId, reason: ['bedrock', 'cobble', 'obstruction'][Math.floor(Math.random()*3)], timestamp: Date.now() - Math.random()*3600000*48, user: state.crews[0].lead, targetDepth: 72, achievedDepth: Math.floor(30 + Math.random()*24) });
              }
            }
            // Recent Activity is now derived live from state.inspections/
            // refusals/production (see computeRecentActivity) instead of a
            // separately-seeded array, so the demo fallback above already
            // covers it - no separate fake feed needed here.
            
            // Generate 30 days of production data
            for (let i = 29; i >= 0; i--) {
              const date = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
              state.production.push({ date: date.toISOString().split('T')[0], piles: Math.floor(Math.random() * 20 + 35), crew: state.crews[Math.floor(Math.random() * state.crews.length)].name });
            }
          }

          // SIDEBAR
          function renderSidebar() {
            const navSections = [
              { title: 'Overview', items: [
                { id: 'company', label: 'Company Dashboard', icon: 'building-2' },
              ]},
              { title: 'Project', items: [
                { id: 'dashboard', label: 'Project Dashboard', icon: 'layout-dashboard' },
                { id: 'schedule', label: 'Schedule', icon: 'calendar-range' },
                { id: 'production', label: 'Production', icon: 'truck' },
                { id: 'inspection', label: 'QC Inspection', icon: 'clipboard-check' },
                { id: 'refusal', label: 'Refusals', icon: 'alert-triangle' },
                { id: 'delays', label: 'Delays', icon: 'cloud-rain' },
                { id: 'materials', label: 'Materials', icon: 'package' },
                { id: 'heatmap', label: 'Pile Map', icon: 'map' },
              ]},
              { title: 'Safety', items: [
                { id: 'safety', label: 'Safety', icon: 'hard-hat' },
              ]},
              { title: 'Documents', items: [
                { id: 'documents', label: 'Documents & COI', icon: 'folder' },
                { id: 'rfiSubmittals', label: 'RFIs & Submittals', icon: 'file-question' },
              ]},
              { title: 'Closeout', items: [
                { id: 'punchlist', label: 'Punch List', icon: 'list-checks' },
              ]},
              { title: 'Analysis', items: [
                { id: 'analytics', label: 'Analytics', icon: 'bar-chart-3' },
                { id: 'reports', label: 'Reports', icon: 'file-text' },
              ]},
              { title: 'Config', items: [
                { id: 'settings', label: 'Settings', icon: 'settings' },
              ]}
            ];
            return '<aside class="fixed inset-y-0 left-0 z-50 w-60 bg-slate-900/95 border-r border-slate-700/50 transform transition-transform duration-300 ' + (state.sidebarOpen ? 'translate-x-0' : '-translate-x-full') + ' lg:translate-x-0 flex flex-col">' +
              '<div class="p-5 border-b border-slate-700/50"><div class="flex items-center justify-between"><div class="flex items-center gap-3"><img src="/logo-mark.png" alt="SolTrend Pro" class="w-9 h-9 rounded-lg shadow-lg shadow-amber-500/20"><div><h1 class="font-display font-bold text-lg text-white">SolTrend</h1><p class="text-[10px] text-slate-500 uppercase tracking-wider">Pro v2.1</p></div></div><span class="notif-bell-slot">' + renderNotifBell() + '</span></div></div>' +
              (state.projects.length > 0 ? '<div class="p-3 border-b border-slate-700/50"><label class="text-[10px] font-medium text-slate-500 uppercase tracking-wider mb-1.5 block">Active Project</label><select id="projectSelect" onchange="var v=this.value; switchToProject(state.projects.find(function(p) { return p.id === v; }));" class="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white">' + state.projects.filter(p => p.status === 'active').map(p => '<option value="' + p.id + '"' + (state.currentProject?.id === p.id ? ' selected' : '') + '>' + p.name + '</option>').join('') + '</select></div>' : '') +
              '<nav class="flex-1 py-3 overflow-y-auto">' + navSections.map(section => '<div class="mb-4"><h3 class="px-5 mb-1 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">' + section.title + '</h3>' + section.items.map(item => '<button onclick="navigateTo(\\'' + item.id + '\\')" class="nav-item w-full flex items-center gap-3 px-5 py-2.5 text-left text-sm ' + (state.currentView === item.id ? 'active' : 'text-slate-400 hover:text-slate-200') + '">' + icon(item.icon, 'w-4 h-4') + '<span>' + item.label + '</span></button>').join('') + '</div>').join('') + '</nav>' +
              '<div class="p-4 border-t border-slate-700/50 space-y-3"><div class="flex items-center gap-3"><div class="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-sm font-bold">' + (state.currentUser.name || '?').split(' ').map(function(n){return n[0]||'';}).join('').slice(0,2).toUpperCase() + '</div><div class="flex-1 min-w-0"><p class="text-sm font-medium text-white truncate">' + state.currentUser.name + '</p><p class="text-xs text-slate-500 capitalize">' + state.currentUser.role + '</p></div><a href="/api/auth/signout" title="Sign out" class="text-slate-500 hover:text-red-400 transition-colors p-1">' + icon('log-out', 'w-4 h-4') + '</a></div></div>' +
            '</aside>';
          }

          // COMPANY DASHBOARD
          function renderCompanyDashboard() {
            if (!state.company) {
              return '<div class="flex items-center justify-center min-h-[50vh]"><div class="text-center"><div class="animate-pulse text-amber-400 mb-2">' + icon('loader', 'w-6 h-6 mx-auto') + '</div><p class="text-slate-400 text-sm">Loading SolTrend Pro...</p></div></div>';
            }
            const activeProjects = state.projects.filter(p => p.status === 'active');
            const totalPiles = state.projects.reduce((sum, p) => sum + p.totalPiles, 0);
            const installedPiles = state.projects.reduce((sum, p) => sum + p.installedPiles, 0);
            // Tables/Modules mirror the Piles rollup - cached totals on each
            // project, kept in sync by /api/production's delta update.
            const totalTables = state.projects.reduce((sum, p) => sum + (p.totalTables || 0), 0);
            const tablesInstalled = state.projects.reduce((sum, p) => sum + (p.tablesInstalled || 0), 0);
            const totalModules = state.projects.reduce((sum, p) => sum + (p.totalModules || 0), 0);
            const modulesInstalled = state.projects.reduce((sum, p) => sum + (p.modulesInstalled || 0), 0);
            const tablesPct = totalTables > 0 ? Math.round((tablesInstalled / totalTables) * 100) : 0;
            const modulesPct = totalModules > 0 ? Math.round((modulesInstalled / totalModules) * 100) : 0;
            const pilesPct = totalPiles > 0 ? Math.round((installedPiles / totalPiles) * 100) : 0;
            const todayStr = new Date().toISOString().split('T')[0];
            const todayProd = state.production.find(p => p.date === todayStr);
            const weekProdEntries = state.production.slice(-7);
            const monthProdEntries = state.production.slice(-30);
            const weekProd = weekProdEntries.reduce((s, p) => s + p.piles, 0);
            const monthProd = monthProdEntries.reduce((s, p) => s + p.piles, 0);
            // Was a hardcoded "94.2%" / "+2.1% from last month" literal -
            // now computed from the real pass/fail counts across projects.
            const totalPassed = state.projects.reduce((sum, p) => sum + (p.passedInspections || 0), 0);
            const totalFailed = state.projects.reduce((sum, p) => sum + (p.failedInspections || 0), 0);
            const companyPassRate = (totalPassed + totalFailed) > 0 ? Math.round((totalPassed / (totalPassed + totalFailed)) * 100) : 0;
            return '<div class="space-y-6 stagger-children">' +
              '<div class="flex items-center justify-between"><div><h1 class="font-display text-2xl font-bold text-white">' + state.company.name + '</h1><p class="text-slate-400 text-sm">' + activeProjects.length + ' active projects · ' + state.users.length + ' team members</p></div></div>' +
              '<div class="grid grid-cols-2 lg:grid-cols-4 gap-4">' +
                '<div class="card rounded-xl p-5"><div class="flex items-center justify-between mb-3"><span class="text-slate-400 text-sm">Total Piles</span>' + icon('database', 'w-4 h-4 text-slate-500') + '</div><p class="font-display text-3xl font-bold text-white">' + formatNumber(installedPiles) + '</p><p class="text-xs text-slate-500 mt-1">of ' + formatNumber(totalPiles) + ' planned</p></div>' +
                '<div class="card rounded-xl p-5"><div class="flex items-center justify-between mb-3"><span class="text-slate-400 text-sm">Pass Rate</span>' + icon('check-circle', 'w-4 h-4 text-slate-500') + '</div><p class="font-display text-3xl font-bold text-blue-400">' + companyPassRate + '%</p><p class="text-xs text-slate-500 mt-1"><span class="text-green-400 font-medium">' + formatNumber(totalPassed) + ' passed</span> · <span class="text-red-400 font-medium">' + formatNumber(totalFailed) + ' failed</span></p></div>' +
                '<div class="card rounded-xl p-5"><div class="flex items-center justify-between mb-3"><span class="text-slate-400 text-sm">Refusals</span>' + icon('alert-triangle', 'w-4 h-4 text-slate-500') + '</div><p class="font-display text-3xl font-bold text-orange-400">' + state.refusals.length + '</p><p class="text-xs text-slate-500 mt-1">total logged</p></div>' +
                '<div class="card rounded-xl p-5"><div class="flex items-center justify-between mb-3"><span class="text-slate-400 text-sm">Active Crews</span>' + icon('users', 'w-4 h-4 text-slate-500') + '</div><p class="font-display text-3xl font-bold text-green-400">' + state.crews.length + '</p><p class="text-xs text-slate-500 mt-1">' + (state.crews.length * 8) + ' workers</p></div>' +
              '</div>' +
              '<div class="card rounded-xl p-5">' +
                '<h3 class="font-display font-semibold text-white mb-4">Installation Progress</h3>' +
                '<div class="space-y-4">' +
                  '<div><div class="flex justify-between text-sm mb-1.5"><span class="text-slate-300 flex items-center gap-1.5"><span class="text-amber-400">●</span> Piles</span><span class="text-white font-medium">' + formatNumber(installedPiles) + ' / ' + formatNumber(totalPiles) + ' <span class="text-slate-500 font-normal">· ' + pilesPct + '%</span></span></div><div class="h-2 bg-slate-700 rounded-full overflow-hidden"><div class="h-full bg-gradient-to-r from-amber-500 to-amber-400 rounded-full" style="width: ' + pilesPct + '%"></div></div></div>' +
                  '<div><div class="flex justify-between text-sm mb-1.5"><span class="text-slate-300 flex items-center gap-1.5"><span class="text-sky-400">●</span> Tables</span><span class="text-white font-medium">' + formatNumber(tablesInstalled) + ' / ' + formatNumber(totalTables) + ' <span class="text-slate-500 font-normal">· ' + tablesPct + '%</span></span></div><div class="h-2 bg-slate-700 rounded-full overflow-hidden"><div class="h-full bg-gradient-to-r from-sky-500 to-sky-400 rounded-full" style="width: ' + tablesPct + '%"></div></div></div>' +
                  '<div><div class="flex justify-between text-sm mb-1.5"><span class="text-slate-300 flex items-center gap-1.5"><span class="text-purple-400">●</span> Modules</span><span class="text-white font-medium">' + formatNumber(modulesInstalled) + ' / ' + formatNumber(totalModules) + ' <span class="text-slate-500 font-normal">· ' + modulesPct + '%</span></span></div><div class="h-2 bg-slate-700 rounded-full overflow-hidden"><div class="h-full bg-gradient-to-r from-purple-500 to-purple-400 rounded-full" style="width: ' + modulesPct + '%"></div></div></div>' +
                (totalTables === 0 && totalModules === 0 ? '<p class="text-xs text-slate-500 pt-1">Set planned Tables/Modules totals per project in Settings to see progress here.</p>' : '') +
                '</div>' +
              '</div>' +
              '<div class="grid grid-cols-3 gap-4">' +
                '<div class="card rounded-xl p-4"><p class="text-xs text-slate-500 uppercase tracking-wider mb-1">Today</p><p class="font-display text-2xl font-bold text-white">' + (todayProd?.piles || 0) + ' <span class="text-sm font-normal text-slate-500">piles</span></p><p class="text-xs text-slate-400 mt-1">' + (todayProd?.tables || 0) + ' tables · ' + (todayProd?.modules || 0) + ' modules</p></div>' +
                '<div class="card rounded-xl p-4"><p class="text-xs text-slate-500 uppercase tracking-wider mb-1">This Week</p><p class="font-display text-2xl font-bold text-white">' + weekProd + ' <span class="text-sm font-normal text-slate-500">piles</span></p><p class="text-xs text-slate-400 mt-1">' + weekProdEntries.reduce((s, p) => s + (p.tables || 0), 0) + ' tables · ' + weekProdEntries.reduce((s, p) => s + (p.modules || 0), 0) + ' modules</p></div>' +
                '<div class="card rounded-xl p-4"><p class="text-xs text-slate-500 uppercase tracking-wider mb-1">This Month</p><p class="font-display text-2xl font-bold text-white">' + monthProd + ' <span class="text-sm font-normal text-slate-500">piles</span></p><p class="text-xs text-slate-400 mt-1">' + monthProdEntries.reduce((s, p) => s + (p.tables || 0), 0) + ' tables · ' + monthProdEntries.reduce((s, p) => s + (p.modules || 0), 0) + ' modules</p></div>' +
              '</div>' +
              '<div><h2 class="font-display font-semibold text-white mb-4">Active Projects</h2><div class="grid md:grid-cols-2 gap-4">' + state.projects.filter(p => p.status !== 'archived').map(project => {
                const completionPct = Math.round((project.installedPiles / project.totalPiles) * 100);
                const cardTablesPct = project.totalTables > 0 ? Math.round(((project.tablesInstalled || 0) / project.totalTables) * 100) : 0;
                const cardModulesPct = project.totalModules > 0 ? Math.round(((project.modulesInstalled || 0) / project.totalModules) * 100) : 0;
                const healthColors = { green: 'text-green-400', yellow: 'text-yellow-400', red: 'text-red-400' };
                return '<div class="card rounded-xl p-5 relative group">' +
                  '<div class="flex items-start gap-3 mb-4"><div class="flex items-center gap-2"><span class="' + healthColors[project.health] + ' text-lg">●</span></div><div class="flex-1 min-w-0"><h3 class="font-display font-semibold text-white truncate">' + project.name + '</h3><p class="text-sm text-slate-400">' + project.location + '</p></div></div>' +
                  '<div class="space-y-3 mb-4">' +
                    '<div><div class="flex items-center justify-between text-sm mb-1"><span class="text-slate-400 flex items-center gap-1.5"><span class="text-amber-400">●</span> Piles</span><span class="font-medium text-white">' + formatNumber(project.installedPiles) + ' / ' + formatNumber(project.totalPiles) + ' <span class="text-slate-500 font-normal">· ' + completionPct + '%</span></span></div><div class="h-2 bg-slate-700 rounded-full overflow-hidden"><div class="h-full bg-gradient-to-r from-amber-500 to-amber-400 rounded-full transition-all" style="width: ' + completionPct + '%"></div></div></div>' +
                    (project.totalTables > 0 ? '<div><div class="flex items-center justify-between text-sm mb-1"><span class="text-slate-400 flex items-center gap-1.5"><span class="text-sky-400">●</span> Tables</span><span class="font-medium text-white">' + formatNumber(project.tablesInstalled || 0) + ' / ' + formatNumber(project.totalTables) + ' <span class="text-slate-500 font-normal">· ' + cardTablesPct + '%</span></span></div><div class="h-2 bg-slate-700 rounded-full overflow-hidden"><div class="h-full bg-gradient-to-r from-sky-500 to-sky-400 rounded-full transition-all" style="width: ' + cardTablesPct + '%"></div></div></div>' : '') +
                    (project.totalModules > 0 ? '<div><div class="flex items-center justify-between text-sm mb-1"><span class="text-slate-400 flex items-center gap-1.5"><span class="text-purple-400">●</span> Modules</span><span class="font-medium text-white">' + formatNumber(project.modulesInstalled || 0) + ' / ' + formatNumber(project.totalModules) + ' <span class="text-slate-500 font-normal">· ' + cardModulesPct + '%</span></span></div><div class="h-2 bg-slate-700 rounded-full overflow-hidden"><div class="h-full bg-gradient-to-r from-purple-500 to-purple-400 rounded-full transition-all" style="width: ' + cardModulesPct + '%"></div></div></div>' : '') +
                  '</div>' +
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
            // Was a hardcoded "45 days remaining" regardless of actual
            // progress - now derived from the real installedPiles count and
            // the project's actual startDate (avg piles/day so far,
            // extrapolated forward). Shows "—" rather than a fake number
            // when there's not yet enough data (no installs logged yet).
            const daysRemainingEst = estimateDaysRemaining(project);
            // Was a hardcoded "28" - now the real total logged for today
            // via Production Entry (0 if nothing's been logged yet today).
            const todayStr = new Date().toISOString().split('T')[0];
            const todayActual = state.production.find(p => p.date === todayStr)?.piles || 0;
            const todayTarget = project.dailyTarget || 35;
            // Was project.refusals - the real field the API returns is
            // refusalCount (state.refusals is a separate local array of
            // refusal records). The typo made this NaN on every real
            // project, which then propagated into the Needs Attention badge
            // below since it reuses this same value.
            const openIssues = project.failedInspections + (project.refusalCount || 0);
            // Tables/Modules progress for this one project - same shape as
            // the Company Dashboard rollup, just not summed across projects.
            const tablesPct = project.totalTables > 0 ? Math.round(((project.tablesInstalled || 0) / project.totalTables) * 100) : 0;
            const modulesPct = project.totalModules > 0 ? Math.round(((project.modulesInstalled || 0) / project.totalModules) * 100) : 0;
            return '<div class="space-y-6 stagger-children">' +
              '<div class="card rounded-xl p-5">' +
                '<div class="flex items-start justify-between mb-4"><div><div class="flex items-center gap-2"><h1 class="font-display text-2xl font-bold text-white">' + project.name + '</h1><span class="px-2 py-0.5 text-xs font-medium rounded bg-green-500/10 text-green-400">' + project.status + '</span></div><p class="text-slate-400 text-sm">' + project.client + ' · ' + project.location + '</p></div><div class="text-right"><p class="text-xs text-slate-500">Project Manager</p><p class="text-sm text-white font-medium">' + project.projectManager + '</p></div></div>' +
                '<div class="h-2 bg-slate-700 rounded-full overflow-hidden mt-4"><div class="h-full bg-gradient-to-r from-green-500 to-green-400 rounded-full transition-all" style="width: ' + completionPct + '%"></div></div>' +
                '<div class="flex justify-between mt-1 text-xs"><span class="text-green-400">' + completionPct + '% Complete</span><span class="text-slate-500">' + (daysRemainingEst === null ? 'Not enough data yet' : daysRemainingEst === 0 ? 'Complete' : daysRemainingEst + ' days remaining (est.)') + '</span></div>' +
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
              '<div class="card rounded-xl p-5">' +
                '<h3 class="font-display font-semibold text-white mb-3">Installation Progress</h3>' +
                '<div class="space-y-4">' +
                  '<div><div class="flex justify-between text-sm mb-1.5"><span class="text-slate-300 flex items-center gap-1.5"><span class="text-sky-400">●</span> Tables</span><span class="text-white font-medium">' + formatNumber(project.tablesInstalled || 0) + ' / ' + formatNumber(project.totalTables || 0) + ' <span class="text-slate-500 font-normal">· ' + tablesPct + '%</span></span></div><div class="h-2 bg-slate-700 rounded-full overflow-hidden"><div class="h-full bg-gradient-to-r from-sky-500 to-sky-400 rounded-full" style="width: ' + tablesPct + '%"></div></div></div>' +
                  '<div><div class="flex justify-between text-sm mb-1.5"><span class="text-slate-300 flex items-center gap-1.5"><span class="text-purple-400">●</span> Modules</span><span class="text-white font-medium">' + formatNumber(project.modulesInstalled || 0) + ' / ' + formatNumber(project.totalModules || 0) + ' <span class="text-slate-500 font-normal">· ' + modulesPct + '%</span></span></div><div class="h-2 bg-slate-700 rounded-full overflow-hidden"><div class="h-full bg-gradient-to-r from-purple-500 to-purple-400 rounded-full" style="width: ' + modulesPct + '%"></div></div></div>' +
                (!project.totalTables && !project.totalModules ? '<p class="text-xs text-slate-500 pt-1">Set planned Tables/Modules totals for this project in Settings to see progress here.</p>' : '') +
                '</div>' +
              '</div>' +
              '<div class="grid lg:grid-cols-3 gap-4">' +
                '<div class="space-y-3">' +
                  '<div class="card rounded-xl p-4 flex items-center justify-between"><div><p class="text-xs text-slate-500">Pass Rate</p><p class="font-display text-xl font-bold text-white">' + passRate + '%</p><p class="text-[11px] text-slate-500 mt-0.5"><span class="text-green-400">' + (project.passedInspections || 0) + ' pass</span> · <span class="text-red-400">' + (project.failedInspections || 0) + ' fail</span></p></div><div class="w-12 h-12 rounded-full border-4 border-green-500 flex items-center justify-center text-green-400 font-bold">' + passRate + '</div></div>' +
                  '<div class="card rounded-xl p-4 flex items-center justify-between"><div><p class="text-xs text-slate-500">Open Issues</p><p class="font-display text-xl font-bold text-white">' + openIssues + '</p></div><div class="w-12 h-12 rounded-full border-4 border-red-500 flex items-center justify-center text-red-400 font-bold">' + openIssues + '</div></div>' +
                  '<div class="card rounded-xl p-4"><p class="text-xs text-slate-500 mb-2">Active Profile</p><p class="text-sm font-medium text-white">' + (state.rackingProfiles.find(r => r.id === project.rackingProfileId)?.name || 'N/A') + '</p></div>' +
                '</div>' +
                '<div class="card rounded-xl p-5"><h3 class="font-display font-semibold text-white mb-3 flex items-center justify-between">Needs Attention <span class="text-xs px-2 py-0.5 rounded bg-red-500/20 text-red-400">' + openIssues + '</span></h3><div class="space-y-2 max-h-48 overflow-y-auto">' + state.inspections.filter(i => i.status === 'fail').slice(0, 3).map(i => '<div class="flex items-center justify-between p-2 bg-slate-800/50 rounded-lg text-xs"><span class="text-slate-300">' + i.pileId + '</span><span class="text-red-400">Failed</span></div>').join('') + state.refusals.slice(0, 2).map(r => '<div class="flex items-center justify-between p-2 bg-slate-800/50 rounded-lg text-xs"><span class="text-slate-300">' + r.pileId + '</span><span class="text-orange-400">Refusal</span></div>').join('') + '</div></div>' +
                '<div class="card rounded-xl p-5"><h3 class="font-display font-semibold text-white mb-3">Recent Activity</h3><div class="space-y-3 max-h-48 overflow-y-auto">' + (function() { const feed = computeRecentActivity(); return feed.length > 0 ? feed.map(a => '<div class="activity-item ' + a.type + ' pl-4 py-1"><p class="text-sm text-slate-300">' + a.message + '</p><p class="text-xs text-slate-500">' + a.user + ' · ' + a.time + '</p></div>').join('') : '<p class="text-sm text-slate-500">No activity logged yet.</p>'; })() + '</div></div>' +
              '</div>' +
            '</div>';
          }

          // ANALYTICS - FULL IMPLEMENTATION
          function renderAnalytics() {
            const tabs = [ { id: 'production', label: 'Production', icon: 'trending-up' }, { id: 'quality', label: 'Quality', icon: 'check-circle' }, { id: 'refusals', label: 'Refusals', icon: 'alert-triangle' }, { id: 'subcontractors', label: 'Subcontractors', icon: 'briefcase' }, { id: 'schedule', label: 'Schedule', icon: 'calendar' }, { id: 'field', label: 'Field Ops', icon: 'smartphone' }, { id: 'predictive', label: 'Insights', icon: 'brain' } ];
            return '<div class="space-y-6 animate-fade-in"><div class="flex items-center justify-between"><div><h1 class="font-display text-2xl font-bold text-white">Analytics</h1><p class="text-slate-400">Performance insights</p></div></div><div class="flex gap-1 p-1 bg-slate-800/50 rounded-xl overflow-x-auto">' + tabs.map(t => '<button onclick="setAnalyticsTab(\\'' + t.id + '\\')" class="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium whitespace-nowrap transition-all ' + (state.analyticsTab === t.id ? 'bg-amber-500 text-black' : 'text-slate-400 hover:text-white hover:bg-slate-700/50') + '">' + icon(t.icon, 'w-4 h-4') + t.label + '</button>').join('') + '</div><div id="analyticsContent">' + renderAnalyticsContent() + '</div></div>';
          }

          function renderAnalyticsContent() {
            switch(state.analyticsTab) {
              case 'production': return renderProductionAnalytics();
              case 'quality': return renderQualityAnalytics();
              case 'refusals': return renderRefusalAnalytics();
              case 'subcontractors': return renderSubcontractorAnalytics();
              case 'schedule': return renderScheduleAnalytics();
              case 'field': return renderFieldOpsAnalytics();
              case 'predictive': return renderPredictiveAnalytics();
              default: return renderProductionAnalytics();
            }
          }

          function renderProductionAnalytics() {
            const last14 = state.production.slice(-14);
            // Was dividing by a fixed 14 regardless of how many days
            // actually have entries - diluted the average for a project
            // that hasn't been logging long. Divide by the real count.
            const avgDaily = last14.length > 0 ? Math.round(last14.reduce((s, p) => s + p.piles, 0) / last14.length) : 0;
            const actualWeek = state.production.slice(-7).reduce((s, p) => s + p.piles, 0);
            const prevWeek = state.production.slice(-14, -7).reduce((s, p) => s + p.piles, 0);
            // Math.max(...[]) / Math.min(...[]) are -Infinity/Infinity with
            // no production logged yet - show "—" instead of a fake extreme.
            const bestDay = last14.length > 0 ? Math.max(...last14.map(p => p.piles)) : null;
            const worstDay = last14.length > 0 ? Math.min(...last14.map(p => p.piles)) : null;
            const trendPercent = prevWeek > 0 ? Math.round(((actualWeek - prevWeek) / prevWeek) * 100) : 0;
            
            return '<div class="space-y-6 stagger-children">' +
              '<div class="grid grid-cols-2 lg:grid-cols-4 gap-4">' +
                '<div class="card rounded-xl p-4"><p class="text-xs text-slate-500 uppercase mb-1">Avg Daily</p><p class="font-display text-2xl font-bold text-white">' + avgDaily + '</p><p class="text-xs ' + (trendPercent >= 0 ? 'text-green-400' : 'text-red-400') + '">' + (trendPercent >= 0 ? '+' : '') + trendPercent + '% vs last week</p></div>' +
                '<div class="card rounded-xl p-4"><p class="text-xs text-slate-500 uppercase mb-1">Weekly Total</p><p class="font-display text-2xl font-bold text-white">' + actualWeek + '</p><p class="text-xs text-slate-400">this week</p></div>' +
                '<div class="card rounded-xl p-4"><p class="text-xs text-slate-500 uppercase mb-1">Best Day</p><p class="font-display text-2xl font-bold text-green-400">' + (bestDay === null ? '—' : bestDay) + '</p><p class="text-xs text-slate-400">piles</p></div>' +
                '<div class="card rounded-xl p-4"><p class="text-xs text-slate-500 uppercase mb-1">Low Day</p><p class="font-display text-2xl font-bold text-red-400">' + (worstDay === null ? '—' : worstDay) + '</p><p class="text-xs text-slate-400">piles</p></div>' +
              '</div>' +
              '<div class="card rounded-xl p-5"><h3 class="font-display font-semibold text-white mb-4">14-Day Production Trend</h3><div class="h-48 flex items-end gap-1">' + state.production.slice(-14).map(p => { const h = Math.max(10, (p.piles / 60) * 100); return '<div class="flex-1 relative group"><div class="absolute -top-6 left-1/2 -translate-x-1/2 bg-slate-700 px-1.5 py-0.5 rounded text-xs text-white opacity-0 group-hover:opacity-100 transition-opacity z-10 whitespace-nowrap">' + p.piles + '</div><div class="chart-bar w-full bg-amber-500 rounded-t" style="height: ' + h + '%"></div></div>'; }).join('') + '</div><div class="flex justify-between mt-2 text-xs text-slate-500"><span>14 days ago</span><span>Today</span></div></div>' +
              '<div class="grid lg:grid-cols-2 gap-4">' +
                (function() {
                  // Was Math.random()-based fake piles/day per crew with a
                  // fixed bar-width formula. Production Entries already
                  // record crew (by name, via crewId) and pile counts, so
                  // this computes each crew's real average over the last 14
                  // logged days - crews with no logged production show '-'
                  // instead of a number the bar can't back up.
                  const crewAvgs = state.crews.map(function(c) {
                    const entries = last14.filter(function(p) { return p.crew === c.name; });
                    const total = entries.reduce(function(s, p) { return s + p.piles; }, 0);
                    return { crew: c, avg: entries.length > 0 ? total / entries.length : null };
                  });
                  const maxAvg = Math.max(1, ...crewAvgs.filter(function(x) { return x.avg !== null; }).map(function(x) { return x.avg; }));
                  return '<div class="card rounded-xl p-5"><h3 class="font-semibold text-white mb-3">Crew Performance</h3><div class="space-y-3">' + crewAvgs.map(function(x) {
                    const pctWidth = x.avg === null ? 0 : Math.round((x.avg / maxAvg) * 100);
                    return '<div><div class="flex justify-between text-sm mb-1"><span class="text-slate-300">' + x.crew.name + '</span><span class="text-white font-medium">' + (x.avg === null ? '—' : x.avg.toFixed(1) + ' piles/day') + '</span></div><div class="h-2 bg-slate-700 rounded-full overflow-hidden"><div class="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full" style="width: ' + pctWidth + '%"></div></div></div>';
                  }).join('') + '</div></div>';
                })() +
                (function() {
                  const passRates = dayOfWeekPassRates();
                  const avgProd = dayOfWeekAvgProduction();
                  const maxAvg = Math.max(1, ...avgProd.filter(function(v) { return v !== null; }));
                  return '<div class="card rounded-xl p-5"><h3 class="font-semibold text-white mb-3">Day of Week Analysis</h3>' +
                    '<p class="text-xs text-slate-500 mb-2">Pass Rate</p><div class="space-y-2 mb-4">' +
                    DOW_DISPLAY_ORDER.map(function(dow) {
                      const pct = passRates[dow];
                      const barColor = pct === null ? 'bg-slate-700' : pct > 80 ? 'bg-green-500' : pct > 50 ? 'bg-amber-500' : 'bg-slate-500';
                      return '<div class="flex items-center gap-2"><span class="w-8 text-xs text-slate-500">' + DOW_LABELS[dow] + '</span><div class="flex-1 h-2 bg-slate-700 rounded-full overflow-hidden"><div class="h-full ' + barColor + ' rounded-full" style="width: ' + (pct || 0) + '%"></div></div><span class="text-xs text-slate-400 w-8">' + (pct === null ? '—' : pct + '%') + '</span></div>';
                    }).join('') +
                    '</div>' +
                    '<p class="text-xs text-slate-500 mb-2">Avg Piles Installed</p><div class="space-y-2">' +
                    DOW_DISPLAY_ORDER.map(function(dow) {
                      const avg = avgProd[dow];
                      const pctWidth = avg === null ? 0 : Math.round((avg / maxAvg) * 100);
                      return '<div class="flex items-center gap-2"><span class="w-8 text-xs text-slate-500">' + DOW_LABELS[dow] + '</span><div class="flex-1 h-2 bg-slate-700 rounded-full overflow-hidden"><div class="h-full bg-indigo-500 rounded-full" style="width: ' + pctWidth + '%"></div></div><span class="text-xs text-slate-400 w-10">' + (avg === null ? '—' : avg) + '</span></div>';
                    }).join('') +
                    '</div></div>';
                })() +
              '</div>' +
            '</div>';
          }

          function renderQualityAnalytics() {
            const totalInspections = state.inspections.length;
            const passed = state.inspections.filter(i => i.status === 'pass').length;
            const failed = state.inspections.filter(i => i.status === 'fail').length;
            const passRate = totalInspections > 0 ? Math.round((passed / totalInspections) * 100) : 0;
            const failReasonMeta = [
              { key: 'plumb', label: 'Plumb Failure', color: 'bg-red-500' },
              { key: 'twist', label: 'Twist Defect', color: 'bg-orange-500' },
              { key: 'height', label: 'Height Issue', color: 'bg-amber-500' },
              { key: 'alignment', label: 'Alignment Issue', color: 'bg-indigo-500' },
              { key: 'spacing', label: 'Spacing Issue', color: 'bg-cyan-500' },
              { key: 'other', label: 'Other', color: 'bg-slate-500' },
            ];
            const failReasons = {};
            failReasonMeta.forEach(m => { failReasons[m.key] = 0; });
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
                failReasonMeta.map(m => '<div class="flex items-center justify-between"><div class="flex items-center gap-2"><div class="w-3 h-3 rounded ' + m.color + '"></div><span class="text-slate-300">' + m.label + '</span></div><span class="text-white font-medium">' + failReasons[m.key] + '</span></div>').join('') +
              '</div></div>' +
              (function() {
                // Was Math.random()-based fake inspection counts/pass rates
                // per crew lead. Inspections carry the inspecting user's
                // name, and crew.lead is that same name, so this matches on
                // it directly and computes real counts - a lead with zero
                // inspections just doesn't render a row rather than showing
                // fabricated activity.
                const leadStats = state.crews.map(function(c) {
                  const theirs = state.inspections.filter(function(i) { return i.user === c.lead; });
                  const passed = theirs.filter(function(i) { return i.status === 'pass'; }).length;
                  return { lead: c.lead, count: theirs.length, rate: theirs.length > 0 ? Math.round((passed / theirs.length) * 100) : null };
                }).filter(function(x) { return x.count > 0; }).sort(function(a, b) { return b.count - a.count; }).slice(0, 3);
                return '<div class="card rounded-xl p-5"><h3 class="font-semibold text-white mb-3">Inspector Performance</h3><div class="space-y-2">' + (leadStats.length > 0 ? leadStats.map(function(x) {
                  return '<div class="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg"><div class="flex items-center gap-3"><div class="w-8 h-8 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-400 font-medium">' + x.lead.split(' ').map(function(n) { return n[0]; }).join('') + '</div><div><p class="text-sm text-white">' + x.lead + '</p><p class="text-xs text-slate-500">' + x.count + ' inspections</p></div></div><div class="text-right"><p class="text-lg font-bold text-green-400">' + x.rate + '%</p><p class="text-xs text-slate-500">pass rate</p></div></div>';
                }).join('') : '<p class="text-slate-500 text-sm text-center py-4">No inspections logged yet</p>') + '</div></div>';
              })() +
            '</div>';
          }

          function renderRefusalAnalytics() {
            const totalRefusals = state.refusals.length;
            const reasons = {};
            state.refusals.forEach(r => { reasons[r.reason] = (reasons[r.reason] || 0) + 1; });
            const avgDepth = state.refusals.length > 0 ? Math.round(state.refusals.reduce((s, r) => s + (r.achievedDepth || 0), 0) / state.refusals.length) : 0;
            const avgShortfall = state.refusals.length > 0 ? Math.round(state.refusals.reduce((s, r) => s + ((r.targetDepth || 72) - (r.achievedDepth || 0)), 0) / state.refusals.length) : 0;

            return '<div class="space-y-6 stagger-children">' +
              '<div class="grid grid-cols-2 gap-4">' +
                '<div class="card rounded-xl p-4"><p class="text-xs text-slate-500 uppercase mb-1">Total Refusals</p><p class="font-display text-2xl font-bold text-orange-400">' + totalRefusals + '</p></div>' +
                '<div class="card rounded-xl p-4"><p class="text-xs text-slate-500 uppercase mb-1">Avg Depth</p><p class="font-display text-2xl font-bold text-white">' + avgDepth + '"</p></div>' +
              '</div>' +
              '<div class="card rounded-xl p-5"><h3 class="font-semibold text-white mb-4">Refusal Reasons</h3><div class="space-y-3">' +
                Object.entries(reasons).map(([reason, count]) => { const pct = Math.round((count / totalRefusals) * 100); return '<div><div class="flex justify-between text-sm mb-1"><span class="text-slate-300 capitalize">' + reason + '</span><span class="text-white">' + count + ' (' + pct + '%)</span></div><div class="h-2 bg-slate-700 rounded-full overflow-hidden"><div class="h-full bg-orange-500 rounded-full" style="width: ' + pct + '%"></div></div></div>'; }).join('') || '<div class="flex justify-between text-sm mb-1"><span class="text-slate-300">Bedrock</span><span class="text-white">' + Math.floor(totalRefusals * 0.5) + ' (50%)</span></div><div class="h-2 bg-slate-700 rounded-full overflow-hidden"><div class="h-full bg-orange-500 rounded-full" style="width: 50%"></div></div><div class="flex justify-between text-sm mb-1 mt-3"><span class="text-slate-300">Cobble</span><span class="text-white">' + Math.floor(totalRefusals * 0.3) + ' (30%)</span></div><div class="h-2 bg-slate-700 rounded-full overflow-hidden"><div class="h-full bg-amber-500 rounded-full" style="width: 30%"></div></div><div class="flex justify-between text-sm mb-1 mt-3"><span class="text-slate-300">Obstruction</span><span class="text-white">' + Math.floor(totalRefusals * 0.2) + ' (20%)</span></div><div class="h-2 bg-slate-700 rounded-full overflow-hidden"><div class="h-full bg-yellow-500 rounded-full" style="width: 20%"></div></div>' +
              '</div></div>' +
              '<div class="card rounded-xl p-5"><h3 class="font-semibold text-white mb-3">Avg Shortfall</h3><div class="flex items-center gap-4"><div class="flex-1 h-4 bg-slate-700 rounded-full overflow-hidden"><div class="h-full bg-gradient-to-r from-green-500 via-amber-500 to-red-500" style="width: 100%"></div></div><span class="text-lg font-bold text-amber-400">' + avgShortfall + '"</span></div><p class="text-xs text-slate-500 mt-2">Average depth shortfall from target</p></div>' +
            '</div>';
          }

          // SUBCONTRACTOR SCORECARDS - piles/tables/modules and pace derived
          // from ProductionEntry, the one place a subcontractor is actually
          // attributed today. Inspections/refusals are tied to the
          // inspecting USER, not a subcontractor, so QC pass rate and
          // refusal rate can't be broken out per-sub yet without adding a
          // subcontractor picker to those field-entry screens - noted below
          // rather than guessed at.
          function renderSubcontractorAnalytics() {
            const bySub = {};
            state.production.forEach(function(p) {
              const key = p.subcontractor || 'Unassigned';
              if (!bySub[key]) bySub[key] = { name: key, days: 0, piles: 0, tables: 0, modules: 0, lastDate: null, belowTarget: 0 };
              const s = bySub[key];
              s.days++;
              s.piles += p.piles || 0;
              s.tables += p.tables || 0;
              s.modules += p.modules || 0;
              if (!s.lastDate || p.date > s.lastDate) s.lastDate = p.date;
              if (state.currentProject && state.currentProject.dailyTarget > 0 && p.piles < state.currentProject.dailyTarget * 0.5) s.belowTarget++;
            });
            const rows = Object.values(bySub).sort(function(a, b) { return b.piles - a.piles; });
            const maxPiles = Math.max(1, ...rows.map(function(r) { return r.piles; }));
            return '<div class="space-y-6 stagger-children">' +
              (rows.length === 0 ? '<div class="card rounded-xl p-8 text-center text-slate-500 text-sm">No production logged with a subcontractor attached yet.</div>' :
              '<div class="card rounded-xl p-5"><h3 class="font-semibold text-white mb-4">Piles Installed by Subcontractor</h3><div class="space-y-4">' +
                rows.map(function(r) {
                  const pct = Math.round((r.piles / maxPiles) * 100);
                  const avg = r.days > 0 ? (r.piles / r.days).toFixed(1) : '0';
                  return '<div><div class="flex justify-between text-sm mb-1"><span class="text-slate-300">' + r.name + '</span><span class="text-white font-medium">' + r.piles + ' piles</span></div><div class="h-2 bg-slate-700 rounded-full overflow-hidden"><div class="h-full bg-gradient-to-r from-amber-500 to-orange-500 rounded-full" style="width: ' + pct + '%"></div></div><div class="flex flex-wrap gap-x-4 gap-y-1 mt-1 text-xs text-slate-500"><span>' + r.days + ' day' + (r.days === 1 ? '' : 's') + ' logged</span><span>' + avg + ' piles/day avg</span>' + (r.belowTarget > 0 ? '<span class="text-red-400">' + r.belowTarget + ' day' + (r.belowTarget === 1 ? '' : 's') + ' under 50% target</span>' : '') + '<span>Last: ' + formatDate(r.lastDate) + '</span></div></div>';
                }).join('') + '</div></div>') +
              '<div class="card rounded-xl p-4"><p class="text-xs text-slate-500">Pace and schedule adherence only — QC pass rate and refusal rate aren\\'t attributed to a specific subcontractor yet, since inspections and refusals aren\\'t tagged with one today.</p></div>' +
            '</div>';
          }

          function renderScheduleAnalytics() {
            const project = state.currentProject;
            const totalPiles = project?.totalPiles || 750;
            // Was state.inspections.length (QC inspections, not installs) -
            // the project's real installedPiles count, kept in sync with
            // Production Entry, is what "progress" actually means here.
            const installed = project?.installedPiles || 0;
            const progress = Math.round((installed / totalPiles) * 100);
            const daysElapsed = daysElapsedSince(project?.startDate);
            const daysRemaining = estimateDaysRemaining(project);
            const expectedEnd = (daysRemaining !== null && daysRemaining > 0)
              ? new Date(Date.now() + daysRemaining * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
              : null;

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
              '<div class="card rounded-xl p-4"><p class="text-xs text-slate-500 uppercase mb-1">Days Elapsed</p><p class="font-display text-2xl font-bold text-white">' + (daysElapsed === null ? '—' : daysElapsed) + '</p></div>' +
              '<div class="card rounded-xl p-4"><p class="text-xs text-slate-500 uppercase mb-1">Days Remaining</p><p class="font-display text-2xl font-bold text-amber-400">' + (daysRemaining === null ? '—' : daysRemaining) + '</p></div>' +
              '</div>' +
              '<div class="card rounded-xl p-5"><h3 class="font-semibold text-white mb-3">Key Milestones</h3><div class="space-y-3">' +
              [25, 50, 75, 100].map(function(pct) {
                const achieved = progress >= pct;
                const label = pct === 100 ? 'Final Completion' : pct + '% Complete';
                const status = achieved ? 'Achieved' : (pct === 100 && expectedEnd ? 'Est. ' + expectedEnd : 'Pending');
                return '<div class="flex items-center gap-3"><div class="w-3 h-3 rounded-full ' + (achieved ? 'bg-green-500' : 'bg-slate-600') + '"></div><div class="flex-1"><p class="text-sm text-white">' + label + '</p><p class="text-xs text-slate-500">' + status + '</p></div></div>';
              }).join('') +
              '</div></div>' +
            '</div>';
          }

          function renderFieldOpsAnalytics() {
            const weekCounts = inspectionsThisWeek();
            const maxCount = Math.max(1, ...weekCounts);
            return '<div class="space-y-6 stagger-children">' +
              '<div class="card rounded-xl p-5"><h3 class="font-semibold text-white mb-4">Daily Inspections This Week</h3><div class="h-32 flex items-end gap-2">' + weekCounts.map((v, i) => { const h = v > 0 ? Math.max(8, Math.round((v / maxCount) * 100)) : 2; return '<div class="flex-1 flex flex-col items-center"><div class="chart-bar w-full bg-indigo-500 rounded-t" style="height: ' + h + '%"></div><span class="text-[10px] text-slate-500 mt-1">' + ['M','T','W','T','F','S','S'][i] + '</span></div>'; }).join('') + '</div></div>' +
              (function() {
                // Was a fake (85 - i*5) count in whatever order state.crews
                // happened to be in. Ranks crews by their lead's real
                // inspection count instead, so "Top Performers" actually
                // means top performers.
                const ranked = state.crews.map(function(c) {
                  return { crew: c, count: state.inspections.filter(function(i) { return i.user === c.lead; }).length };
                }).sort(function(a, b) { return b.count - a.count; }).slice(0, 3);
                return '<div class="card rounded-xl p-5"><h3 class="font-semibold text-white mb-3">Top Performers</h3><div class="space-y-2">' + (ranked.length > 0 ? ranked.map(function(x, i) {
                  return '<div class="flex items-center gap-3 p-3 bg-slate-800/50 rounded-lg"><div class="w-8 h-8 rounded-full flex items-center justify-center ' + (i === 0 ? 'bg-amber-500 text-black' : i === 1 ? 'bg-gray-400 text-black' : 'bg-amber-700 text-white') + ' font-bold">' + (i + 1) + '</div><div class="flex-1"><p class="text-sm text-white">' + x.crew.lead + '</p><p class="text-xs text-slate-500">' + x.crew.name + '</p></div><div class="text-right"><p class="text-lg font-bold text-white">' + x.count + '</p><p class="text-xs text-slate-500">inspections</p></div></div>';
                }).join('') : '<p class="text-slate-500 text-sm text-center py-4">No inspections logged yet</p>') + '</div></div>';
              })() +
            '</div>';
          }

          function renderPredictiveAnalytics() {
            const project = state.currentProject;
            const rate = avgInstallRate(project);
            const daysRemaining = estimateDaysRemaining(project);
            const projectedCompletion = (daysRemaining !== null && daysRemaining > 0)
              ? new Date(Date.now() + daysRemaining * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
              : null;
            const targetRate = project?.dailyTarget || 35;

            // Rule-based checks against real data instead of hardcoded
            // "On Track"/"Weather Alert" cards and invented recommendations
            // (the old copy referenced a "Zone C" that doesn't exist
            // anywhere else in this app).
            const risks = [];
            if (rate === null) {
              risks.push({ level: 'slate', title: 'Not Enough Data', detail: 'Log a few days of production to get a real pace estimate.' });
            } else if (rate < targetRate * 0.85) {
              risks.push({ level: 'amber', title: 'Behind Target Pace', detail: 'Averaging ' + rate.toFixed(1) + ' piles/day vs a ' + targetRate + '/day target.' });
            } else {
              risks.push({ level: 'green', title: 'On Track', detail: 'Averaging ' + rate.toFixed(1) + ' piles/day against a ' + targetRate + '/day target.' });
            }
            const totalInsp = (project?.passedInspections || 0) + (project?.failedInspections || 0);
            const failRate = totalInsp > 0 ? Math.round(((project.failedInspections || 0) / totalInsp) * 100) : null;
            if (failRate !== null && failRate > 15) {
              risks.push({ level: 'amber', title: 'Elevated Fail Rate', detail: failRate + '% of inspections are failing on this project - worth a closer look.' });
            }
            if (state.predictiveWeather === null) {
              risks.push({ level: 'slate', title: 'Loading Forecast…', detail: '' });
            } else if (state.predictiveWeather && state.predictiveWeather.daily) {
              const probs = state.predictiveWeather.daily.precipitation_probability_max || [];
              const dates = state.predictiveWeather.daily.time || [];
              const badIdx = probs.findIndex(function(p) { return p >= 60; });
              if (badIdx >= 0 && dates[badIdx]) {
                const d = new Date(dates[badIdx] + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'long' });
                risks.push({ level: 'amber', title: 'Weather Risk', detail: probs[badIdx] + '% chance of rain ' + d + ' - potential install delay.' });
              }
            }
            const dotColor = { green: 'bg-green-500', amber: 'bg-amber-500', slate: 'bg-slate-500' };
            const cardBg = { green: 'bg-green-500/10 border-green-500/20', amber: 'bg-amber-500/10 border-amber-500/20', slate: 'bg-slate-500/10 border-slate-500/20' };

            return '<div class="space-y-6 stagger-children">' +
              '<div class="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-5 text-white"><div class="flex items-center gap-2 mb-2">' + icon('brain', 'w-5 h-5') + '<h3 class="font-semibold">Schedule Projection</h3></div><p class="text-sm text-indigo-200 mb-3">Based on actual production logged so far</p>' +
              '<div class="bg-white/10 rounded-xl p-4"><p class="text-xs text-indigo-200">Estimated Completion</p><p class="text-2xl font-bold">' + (projectedCompletion || 'Not enough data yet') + '</p><p class="text-xs text-indigo-200 mt-1">' + (daysRemaining === null ? 'Log production entries to get an estimate' : daysRemaining === 0 ? 'Complete' : daysRemaining + ' working days remaining (est.)') + '</p></div></div>' +
              '<div class="card rounded-xl p-5"><h3 class="font-semibold text-white mb-3">Risk Assessment</h3><div class="space-y-3">' +
              risks.map(function(r) {
                return '<div class="flex items-center gap-3 p-3 ' + (cardBg[r.level] || cardBg.slate) + ' border rounded-lg"><div class="w-2 h-2 rounded-full ' + (dotColor[r.level] || dotColor.slate) + '"></div><div class="flex-1"><p class="text-sm text-white">' + r.title + '</p><p class="text-xs text-slate-500">' + r.detail + '</p></div></div>';
              }).join('') +
              '</div></div>' +
            '</div>';
          }

          function setAnalyticsTab(tab) {
            state.analyticsTab = tab;
            render();
            // AI Predictions' weather risk needs a real forecast - fetch it
            // once when the tab is first opened (fetchWeatherData has its
            // own 30-minute cache) and re-render when it lands, rather than
            // blocking the tab switch on a network round trip.
            if (tab === 'predictive' && state.predictiveWeather === null) {
              fetchWeatherData().then(function(w) { state.predictiveWeather = w || false; render(); });
            }
          }

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
                  '<div class="grid grid-cols-2 gap-2 mb-3">' +
                    '<div><label class="text-xs text-slate-500 mb-1 block">Start</label><input type="date" id="refusalStart" value="' + state.reportDates.refusalStart + '" class="w-full bg-slate-800 border border-slate-700 rounded-lg px-2 py-1.5 text-white text-sm"></div>' +
                    '<div><label class="text-xs text-slate-500 mb-1 block">End</label><input type="date" id="refusalEnd" value="' + state.reportDates.refusalEnd + '" class="w-full bg-slate-800 border border-slate-700 rounded-lg px-2 py-1.5 text-white text-sm"></div>' +
                  '</div>' +
                  '<button onclick="generateRefusalReport()" class="w-full py-2.5 bg-orange-500 hover:bg-orange-400 text-white rounded-lg font-medium text-sm flex items-center justify-center gap-2">' + icon('download', 'w-4 h-4') + ' Export PDF</button>' +
                '</div>' +
              '</div>' +
              '<div class="card rounded-xl p-5">' +
                '<div class="flex items-center gap-3 mb-4">' + icon('table', 'w-8 h-8 text-slate-400') + '<div><h3 class="font-display font-semibold text-white">Data Export</h3><p class="text-xs text-slate-500">Raw data as CSV, for Excel or Sheets</p></div></div>' +
                '<div class="grid md:grid-cols-3 gap-3">' +
                  '<button onclick="exportProductionCSV()" class="w-full py-2.5 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-lg font-medium text-sm flex items-center justify-center gap-2">' + icon('download', 'w-4 h-4') + ' Production Log</button>' +
                  '<button onclick="exportInspectionsCSV()" class="w-full py-2.5 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-lg font-medium text-sm flex items-center justify-center gap-2">' + icon('download', 'w-4 h-4') + ' Inspections</button>' +
                  '<button onclick="exportRefusalsCSV()" class="w-full py-2.5 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-lg font-medium text-sm flex items-center justify-center gap-2">' + icon('download', 'w-4 h-4') + ' Refusals</button>' +
                '</div>' +
              '</div>' +
            '</div>';
          }

          // DATA EXPORT (CSV)
          // Separate from the five formatted PDF-style reports above - these
          // hand back the raw rows so they can be dropped into Excel/Sheets
          // for further analysis instead of a print-formatted document.
          function csvEscape(v) {
            if (v === null || v === undefined) return '';
            const s = String(v);
            return /[",\\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s;
          }
          function toCSV(rows, headers) {
            const lines = [headers.join(',')];
            rows.forEach(function(r) { lines.push(headers.map(function(h) { return csvEscape(r[h]); }).join(',')); });
            return lines.join('\\n');
          }
          function downloadCSV(filename, csvString) {
            const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
          }
          function exportFilePrefix() {
            return (state.currentProject?.name || 'project').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
          }
          function exportProductionCSV() {
            const rows = state.production.map(function(p) {
              return { date: p.date, piles: p.piles, tables: p.tables || 0, modules: p.modules || 0, crew: p.crew || '', user: p.user || '', notes: p.notes || '' };
            });
            downloadCSV(exportFilePrefix() + '-production-log.csv', toCSV(rows, ['date', 'piles', 'tables', 'modules', 'crew', 'user', 'notes']));
          }
          function exportInspectionsCSV() {
            const rows = state.inspections.map(function(i) {
              return { pileId: i.pileId, status: i.status, date: localDateStr(i.timestamp), user: i.user, depth: i.depth ?? '', plumbNS: i.plumbNS ?? '', plumbEW: i.plumbEW ?? '', failReason: i.failReason || '' };
            });
            downloadCSV(exportFilePrefix() + '-inspections.csv', toCSV(rows, ['pileId', 'status', 'date', 'user', 'depth', 'plumbNS', 'plumbEW', 'failReason']));
          }
          function exportRefusalsCSV() {
            const rows = state.refusals.map(function(r) {
              return { pileId: r.pileId, reason: r.reason, date: localDateStr(r.timestamp), user: r.user, targetDepth: r.targetDepth, achievedDepth: r.achievedDepth ?? '', notes: r.notes || '' };
            });
            downloadCSV(exportFilePrefix() + '-refusals.csv', toCSV(rows, ['pileId', 'reason', 'date', 'user', 'targetDepth', 'achievedDepth', 'notes']));
          }

          // WEATHER API INTEGRATION
          let weatherCache = null;
          let weatherCacheTime = 0;
          let weatherCacheKey = null;

          // Was hardcoded to Phoenix, AZ regardless of which project was
          // open. Projects can now carry their own latitude/longitude
          // (set in Settings); this uses those when present and falls back
          // to the same Phoenix default otherwise. The cache is keyed by
          // coordinates so switching to a project at a different location
          // doesn't keep serving a stale forecast for the previous one.
          async function fetchWeatherData() {
            const lat = state.currentProject?.latitude ?? 33.4484;
            const lon = state.currentProject?.longitude ?? -112.0740;
            const cacheKey = lat + ',' + lon;
            if (weatherCache && weatherCacheKey === cacheKey && (Date.now() - weatherCacheTime) < 1800000) {
              return weatherCache;
            }
            try {
              const response = await fetch(
                'https://api.open-meteo.com/v1/forecast?latitude=' + lat + '&longitude=' + lon +
                '&current=temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code,uv_index' +
                '&daily=weather_code,temperature_2m_max,temperature_2m_min,wind_speed_10m_max,precipitation_probability_max' +
                '&temperature_unit=fahrenheit&wind_speed_unit=mph' +
                '&timezone=auto&forecast_days=7'
              );
              const data = await response.json();
              weatherCache = data;
              weatherCacheTime = Date.now();
              weatherCacheKey = cacheKey;
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
          // Print-safe stand-in for getWeatherIcon(), used only inside the
          // generated PDF reports (Daily/Weekly). Emoji look fine on screen
          // but Chrome/Edge's Print-to-PDF path - Windows especially -
          // regularly fails to embed the color emoji font and substitutes a
          // symbol/dingbat font instead, which is why weather icons were
          // showing up as garbled "Wingdings" characters or blank boxes on
          // downloaded reports. Plain inline SVG has no font dependency, so
          // it prints identically everywhere. Six shapes cover every Open-
          // Meteo weather code the app uses; unknown codes fall back to sun.
          function weatherIconSvg(code, opts) {
            const size = (opts && opts.size) || 40;
            const color = (opts && opts.color) || '#f59e0b';
            const cloudColor = (opts && opts.cloudColor) || '#94a3b8';
            const wrap = function(inner) {
              return '<svg width="' + size + '" height="' + size + '" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">' + inner + '</svg>';
            };
            const sun = '<circle cx="12" cy="12" r="4.5" fill="' + color + '"/>' +
              [0, 45, 90, 135, 180, 225, 270, 315].map(function(deg) {
                const r1 = 8, r2 = 10.5;
                const rad = deg * Math.PI / 180;
                const x1 = 12 + r1 * Math.cos(rad), y1 = 12 + r1 * Math.sin(rad);
                const x2 = 12 + r2 * Math.cos(rad), y2 = 12 + r2 * Math.sin(rad);
                return '<line x1="' + x1.toFixed(1) + '" y1="' + y1.toFixed(1) + '" x2="' + x2.toFixed(1) + '" y2="' + y2.toFixed(1) + '" stroke="' + color + '" stroke-width="1.6" stroke-linecap="round"/>';
              }).join('');
            const cloud = '<path d="M6.5 18a3.5 3.5 0 0 1-.5-6.96A4.5 4.5 0 0 1 14.5 9.5a3.5 3.5 0 0 1 2 6.4A3 3 0 0 1 15.5 18h-9z" fill="' + cloudColor + '"/>';
            const smallSun = '<circle cx="8" cy="8" r="3" fill="' + color + '"/>';
            const fogLines = [15, 18, 21].map(function(y) { return '<line x1="5" y1="' + y + '" x2="19" y2="' + y + '" stroke="' + cloudColor + '" stroke-width="1.5" stroke-linecap="round"/>'; }).join('');
            const rainDrops = [8, 12, 16].map(function(x) { return '<line x1="' + x + '" y1="18" x2="' + (x - 1) + '" y2="21.5" stroke="' + color + '" stroke-width="1.6" stroke-linecap="round"/>'; }).join('');
            const snowDots = [8, 12, 16].map(function(x) { return '<circle cx="' + x + '" cy="19.5" r="1.1" fill="' + cloudColor + '"/>'; }).join('');
            const bolt = '<path d="M13 15.5h-3l1.5-4.5L9 12.5h3l-1.5 4.5L13 15.5z" fill="' + color + '"/>';
            const shapes = {
              0: wrap(sun), 1: wrap(smallSun + cloud),
              2: wrap(smallSun + cloud), 3: wrap(cloud),
              45: wrap(cloud + fogLines), 48: wrap(cloud + fogLines),
              51: wrap(cloud + rainDrops), 53: wrap(cloud + rainDrops), 55: wrap(cloud + rainDrops),
              61: wrap(cloud + rainDrops), 63: wrap(cloud + rainDrops), 65: wrap(cloud + rainDrops),
              71: wrap(cloud + snowDots), 73: wrap(cloud + snowDots), 75: wrap(cloud + snowDots),
              80: wrap(cloud + rainDrops), 81: wrap(cloud + rainDrops),
              82: wrap(cloud + bolt), 95: wrap(cloud + bolt), 96: wrap(cloud + bolt), 99: wrap(cloud + bolt),
            };
            return shapes[code] || wrap(sun);
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

          // REPORT CHART HELPERS - small inline-styled HTML bar charts shared
          // by the QC, Pile Status, and Refusal reports below. Plain
          // flex/div bars rather than SVG or canvas: they render exactly
          // the same in the on-screen print preview and in the PDF the
          // browser's print dialog produces, with no library dependency.
          // Status colors (pass/fail/refusal/pending) match the palette
          // already used everywhere else in the app (Pile Map, badges) -
          // reports should look like they belong to the same product.
          // REPORT_CATEGORICAL is a separate fixed-order set (used for
          // fail-reason / refusal-reason / pile-type / zone breakdowns) so
          // those never collide visually with the status colors.
          const REPORT_STATUS_COLORS = { pass: '#22c55e', fail: '#ef4444', refusal: '#f97316', pending: '#94a3b8' };
          const REPORT_CATEGORICAL = ['#2a78d6', '#1baf7a', '#eda100', '#e87ba4', '#4a3aa7', '#94a3b8'];
          function reportColorFor(index) { return REPORT_CATEGORICAL[index % REPORT_CATEGORICAL.length]; }
          // A single horizontal bar split into proportional colored
          // segments (e.g. Passed/Failed/Refusal/Pending out of all
          // piles), with a legend row underneath. segments: [{label,
          // value, color}]. A segment's own %-label only renders when
          // it's wide enough to hold it without crowding its neighbors.
          // Just the bar itself (no legend) - used inline where many small
          // bars appear in a list (e.g. one per zone) and repeating a full
          // legend under each would be noise. showLabels defaults on; pass
          // false for a compact bar too narrow for in-bar %s to matter.
          function reportMiniBar(segments, heightPx, showLabels) {
            const height = heightPx || 22;
            const total = segments.reduce(function(s, x) { return s + x.value; }, 0);
            const visible = segments.filter(function(s) { return s.value > 0; });
            if (total <= 0 || visible.length === 0) return '<div style="height:' + height + 'px;border-radius:' + Math.round(height / 4) + 'px;background:#e2e8f0;"></div>';
            return '<div style="display:flex;height:' + height + 'px;border-radius:' + Math.round(height / 4) + 'px;overflow:hidden;background:#e2e8f0;">' +
                visible.map(function(s, i) {
                  const pct = (s.value / total) * 100;
                  const showLabel = showLabels !== false && pct >= 12 && height >= 18;
                  const marginRight = i < visible.length - 1 ? '2px' : '0';
                  return '<div style="flex:0 0 ' + pct.toFixed(2) + '%;background:' + s.color + ';margin-right:' + marginRight + ';display:flex;align-items:center;justify-content:center;">' +
                    (showLabel ? '<span style="color:#fff;font-size:10px;font-weight:700;">' + Math.round(pct) + '%</span>' : '') +
                  '</div>';
                }).join('') +
              '</div>';
          }
          // The full version: the bar above plus a legend row underneath
          // (color dot, label, count, share) - the primary chart for a
          // report's headline status breakdown.
          function reportStackedBar(segments) {
            const total = segments.reduce(function(s, x) { return s + x.value; }, 0);
            const legend = '<div style="display:flex;flex-wrap:wrap;gap:14px;margin-top:10px;">' +
              segments.map(function(s) {
                const pct = total > 0 ? Math.round((s.value / total) * 100) : 0;
                return '<div style="display:flex;align-items:center;gap:6px;font-size:11px;color:#475569;"><span style="width:10px;height:10px;border-radius:2px;background:' + s.color + ';display:inline-block;"></span>' + s.label + ': <strong style="color:#1e293b;">' + s.value + '</strong> (' + pct + '%)</div>';
              }).join('') +
            '</div>';
            return reportMiniBar(segments) + legend;
          }
          // A ranked list of horizontal bars, all scaled against the same
          // max so lengths are directly comparable (not each normalized to
          // its own 100%). rows: [{label, value, color, sub?}]; sub is an
          // optional secondary note shown after the value (e.g. a percent).
          function reportBarList(rows, emptyText) {
            const real = rows.filter(function(r) { return r.value > 0; });
            if (real.length === 0) return '<p style="color:#94a3b8;font-size:12px;">' + (emptyText || 'No data yet.') + '</p>';
            const max = real.reduce(function(m, r) { return Math.max(m, r.value); }, 0) || 1;
            return '<div style="display:flex;flex-direction:column;gap:10px;">' +
              real.map(function(r) {
                const pct = (r.value / max) * 100;
                return '<div style="display:flex;align-items:center;gap:10px;">' +
                  '<div style="width:120px;font-size:12px;color:#475569;text-align:right;flex-shrink:0;text-transform:capitalize;">' + r.label + '</div>' +
                  '<div style="flex:1;background:#f1f5f9;border-radius:4px;height:18px;">' +
                    '<div style="width:' + pct.toFixed(1) + '%;height:100%;background:' + r.color + ';border-radius:4px;"></div>' +
                  '</div>' +
                  '<div style="width:80px;font-size:12px;color:#1e293b;font-weight:600;flex-shrink:0;">' + r.value + (r.sub ? ' <span style="color:#94a3b8;font-weight:400;">(' + r.sub + ')</span>' : '') + '</div>' +
                '</div>';
              }).join('') +
            '</div>';
          }
          // A small in-report control bar (Print + Close, plus a guaranteed
          // link back to the app) injected into every generated report by
          // openReportWindow below. "no-print" so it never shows up in the
          // actual printed/saved-PDF output.
          function reportToolbarHtml() {
            return '<div class="report-toolbar no-print" style="position:sticky;top:0;z-index:9999;display:flex;align-items:center;gap:10px;background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;padding:10px 14px;margin-bottom:24px;">' +
              '<a href="/" style="color:#64748b;font-size:13px;font-weight:600;text-decoration:none;margin-right:auto;">&larr; Back to SolTrend Pro</a>' +
              '<button type="button" onclick="window.print()" style="background:#f59e0b;color:#000;border:none;border-radius:6px;padding:8px 16px;font-size:13px;font-weight:700;cursor:pointer;">Print / Save PDF</button>' +
              '<button type="button" onclick="(function(){ try { window.close(); } catch(e) {} setTimeout(function(){ location.href = \\'/\\'; }, 200); })()" style="background:#e2e8f0;color:#1e293b;border:none;border-radius:6px;padding:8px 16px;font-size:13px;font-weight:700;cursor:pointer;">Close</button>' +
            '</div>';
          }
          // Every generate*Report() function used to repeat the same
          // open-a-tab-and-print three-liner. Centralizing it here so the
          // reports that call it can't drift - and so this is the one place
          // that needed fixing for two real bugs:
          //   1. It auto-called .print() on open. That's not our call to
          //      make - showing the report and letting the person decide
          //      whether to print it is.
          //   2. window.open('', '_blank') + document.write() is fragile on
          //      mobile Safari in particular: when it can't actually open a
          //      new tab (common in a home-screen/standalone PWA context,
          //      or just depending on iOS Safari's mood that day), it
          //      silently hands back the CURRENT window, and document.write
          //      then overwrites the live SolTrend Pro app in place - no
          //      new history entry, no back gesture, no way out short of
          //      force-quitting. Opening a real blob: URL instead of an
          //      empty '' URL gets treated as an actual navigation/new tab
          //      far more reliably, and the toolbar's "Back to SolTrend
          //      Pro" link is a guaranteed manual escape hatch even in
          //      whatever edge case still manages to reuse the same tab.
          function openReportWindow(html) {
            const printHideStyle = '<style>@media print { .no-print { display: none !important; } }</style>';
            // None of the report templates declare a charset, which never
            // mattered under the old document.write() approach - that
            // inherited the already-open window's encoding. A blob: URL is
            // a fresh document with no encoding hint anywhere, so the
            // browser has to guess, and mobile Safari and some Windows
            // browsers guess wrong: every non-ASCII character (degree
            // signs, the bullet in the project sub-header, etc.) comes out
            // as mojibake like "Â°" or "â€¢". Meta charset has to be the
            // first thing inside <head> to reliably take effect, and the
            // blob's own MIME type needs it too so there's no window where
            // the browser is sniffing before it reaches that tag.
            const withToolbar = html
              .replace('<head>', '<head><meta charset="utf-8">')
              .replace('</head>', printHideStyle + '</head>')
              .replace('<body>', '<body>' + reportToolbarHtml());
            const blob = new Blob([withToolbar], { type: 'text/html;charset=utf-8' });
            const url = URL.createObjectURL(blob);
            window.open(url, '_blank');
            // The new tab has its own loaded copy by then; release the
            // blob after a beat rather than holding it for the rest of the
            // session. Long enough for a slow mobile connection to finish.
            setTimeout(function() { URL.revokeObjectURL(url); }, 60000);
          }
          // Fixed category orders, hoisted so the QC/Refusal reports' bar
          // charts and pile maps always color the same reason the same way.
          const QC_REASON_ORDER = ['plumb', 'twist', 'height', 'alignment', 'spacing', 'other'];
          const REFUSAL_REASON_ORDER = ['bedrock', 'cobble', 'obstruction', 'other'];

          // The same row/position layout the live Pile Map renders from -
          // the procedural totalRows x pilesPerRow rectangle for a project
          // still in "grid" mode, or the real state.piles rows (gaps and
          // all) once a project has a custom layout. Reports build their
          // own pile-map graphics from this rather than duplicating the
          // grid-vs-custom branch three times.
          function reportLayoutRows() {
            const project = state.currentProject;
            const isCustom = project?.pileLayoutMode === 'custom' && state.piles.length > 0;
            if (isCustom) {
              const byRow = {};
              state.piles.forEach(function(p) { (byRow[p.row] = byRow[p.row] || []).push(p); });
              return Object.keys(byRow).map(Number).sort(function(a, b) { return a - b; }).map(function(rowNum) {
                return { row: rowNum, piles: byRow[rowNum].slice().sort(function(a, b) { return a.position - b.position; }) };
              });
            }
            const totalRows = project?.totalRows || 0;
            const pilesPerRow = project?.pilesPerRow || 0;
            const rows = [];
            for (let row = 1; row <= totalRows; row++) {
              const piles = [];
              for (let pos = 1; pos <= pilesPerRow; pos++) piles.push({ pileId: row + '-' + pos, row: row, position: pos, skip: false });
              rows.push({ row: row, piles: piles });
            }
            return rows;
          }
          // A static, print-safe pile map: one row of small colored cells
          // per row of piles, same visual language as the live Pile Map -
          // but never in a scroll box, since a printed report has no
          // scrollbar; it just flows onto however many pages it needs.
          // Cell size auto-shrinks to the widest row so a large layout
          // never runs off the printed page width. cellStatus(pile) ->
          // {color} or {skip:true} for a gap/obstacle placeholder.
          function reportPileGrid(rows, cellStatus, legend) {
            if (rows.length === 0) return '<p style="color:#94a3b8;font-size:12px;">No pile layout data yet.</p>';
            const maxInRow = rows.reduce(function(m, r) { return Math.max(m, r.piles.length); }, 0) || 1;
            const usableWidth = 650; // print body is ~40px padding each side on a ~816px page
            const cellSize = Math.max(3, Math.min(9, Math.floor(usableWidth / maxInRow) - 1));
            const gridHtml = rows.map(function(r) {
              const cells = r.piles.map(function(p) {
                const info = cellStatus(p);
                if (info.skip) return '<span style="display:inline-block;width:' + cellSize + 'px;height:' + cellSize + 'px;margin:1px;"></span>';
                return '<span style="display:inline-block;width:' + cellSize + 'px;height:' + cellSize + 'px;margin:1px;border-radius:1px;background:' + info.color + ';"></span>';
              }).join('');
              return '<div style="white-space:nowrap;line-height:0;">' +
                (cellSize >= 6 ? '<span style="display:inline-block;width:22px;font-size:7px;color:#94a3b8;vertical-align:top;">' + r.row + '</span>' : '') +
                cells +
              '</div>';
            }).join('');
            const legendHtml = '<div style="display:flex;flex-wrap:wrap;gap:14px;margin-top:10px;">' +
              legend.map(function(l) {
                return '<div style="display:flex;align-items:center;gap:6px;font-size:11px;color:#475569;"><span style="width:10px;height:10px;border-radius:2px;background:' + l.color + ';display:inline-block;"></span>' + l.label + '</div>';
              }).join('') +
            '</div>';
            return '<div>' + gridHtml + '</div>' + legendHtml;
          }

          // PDF GENERATION FUNCTIONS
          async function generateDailyReport() {
            const date = document.getElementById('dailyReportDate')?.value || localDateStr(Date.now());
            const project = state.currentProject;
            // Was always state.production[state.production.length - 1] (the
            // most recent entry) regardless of which date was picked - now
            // looks up the entry for the actual selected date.
            const dayProd = state.production.find(p => p.date === date);
            // Compare via localDateStr() on both sides instead of
            // new Date(date).toDateString() - the old comparison parsed the
            // picker's plain date string as UTC midnight while rendering the
            // record's timestamp in local time, which disagree by a day west
            // of UTC (e.g. Phoenix) and silently dropped/misattributed rows.
            const dayInspections = state.inspections.filter(i => localDateStr(i.timestamp) === date);
            const passed = dayInspections.filter(i => i.status === 'pass').length;
            const failed = dayInspections.filter(i => i.status === 'fail').length;
            const totalInspected = passed + failed;
            const dayRefusalsList = state.refusals.filter(r => localDateStr(r.timestamp) === date);
            const dayRefusals = dayRefusalsList.length;
            const refusalRate = totalInspected > 0 ? ((dayRefusals / (totalInspected + dayRefusals)) * 100).toFixed(1) : '0.0';
            const rackingToday = Math.ceil((dayProd?.piles || 0) / 4);
            const modulesToday = (dayProd?.piles || 0) * 2;
            // Live weather is only meaningful for today's report - fetching it
            // for a past date previously showed *today's* conditions mislabeled
            // as if they were that day's weather. For past dates we now show
            // an honest "not available" note instead of a wrong number.
            const isToday = date === localDateStr(Date.now());
            const weather = isToday ? await fetchWeatherData() : null;
            const currentWeather = weather?.current;
            const weatherIcon = currentWeather ? weatherIconSvg(currentWeather.weather_code, { size: 48 }) : '<div style="font-size:13px;color:#94a3b8;">No data</div>';
            const weatherHeading = isToday ? "Today's Weather" : 'Weather';
            const temp = currentWeather ? Math.round(currentWeather.temperature_2m) : null;
            const humidity = currentWeather ? currentWeather.relative_humidity_2m : null;
            const windSpeed = currentWeather ? Math.round(currentWeather.wind_speed_10m) : null;
            const weatherDesc = currentWeather ? getWeatherDescription(currentWeather.weather_code) : (isToday ? 'Unavailable' : 'Historical data not available');
            // Photos are genuinely captured and uploaded for inspections,
            // refusals, and production entries (see uploadPendingPhotos) -
            // this report previously never showed any of them, just four
            // hardcoded "No photos captured" tiles regardless of what was
            // actually on file for the date.
            const dayPhotos = []
              .concat(dayInspections.flatMap(function(i) { return (i.photos || []).map(function(p) { return { url: p.url, label: 'Inspection ' + i.pileId }; }); }))
              .concat(dayRefusalsList.flatMap(function(r) { return (r.photos || []).map(function(p) { return { url: p.url, label: 'Refusal ' + r.pileId }; }); }))
              .concat((dayProd?.photos || []).map(function(p) { return { url: p.url, label: 'Production log' }; }));

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
                    <h3>\${weatherHeading}</h3>
                    <div class="temp">\${temp !== null ? temp + '°F' : '—'}</div>
                    <div class="conditions">\${weatherDesc}</div>
                  </div>
                  <div class="weather-details">
                    <div class="weather-detail"><div class="label">Humidity</div><div class="value">\${humidity !== null ? humidity + '%' : '—'}</div></div>
                    <div class="weather-detail"><div class="label">Wind</div><div class="value">\${windSpeed !== null ? windSpeed + ' mph' : '—'}</div></div>
                    <div class="weather-detail"><div class="label">Location</div><div class="value">\${(project?.location || 'Phoenix, AZ').split(',')[0]}</div></div>
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
                    \${dayInspections.slice().reverse().map(i =>
                      '<tr><td>' + new Date(i.timestamp).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) + '</td><td>' + i.pileId + '</td><td>QC Inspection</td><td>' + i.user + '</td><td><span class="status-badge ' + i.status + '">' + i.status + '</span></td></tr>'
                    ).join('')}
                    \${dayRefusalsList.slice().reverse().map(r =>
                      '<tr><td>' + new Date(r.timestamp).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) + '</td><td>' + r.pileId + '</td><td>Refusal Logged</td><td>' + r.user + '</td><td><span class="status-badge refusal">Refusal</span></td></tr>'
                    ).join('')}
                    \${(dayInspections.length + dayRefusalsList.length) === 0 ? '<tr><td colspan="5" style="text-align:center;color:#94a3b8;">No activity recorded for this date</td></tr>' : ''}
                  </tbody>
                </table>
                <div class="notes-section">
                  <h3>Daily Notes</h3>
                  <div class="notes-content">Weather conditions were favorable for pile driving operations. All crews operating at normal capacity. \${failed > 0 ? failed + ' piles failed QC and require remediation. ' : ''}\${dayRefusals > 0 ? dayRefusals + ' refusal(s) logged - engineering notified for alternative pile locations.' : 'No refusals encountered today.'}</div>
                </div>
                <div class="section-title">Photo Documentation</div>
                <div class="photo-gallery">\${dayPhotos.length > 0 ? dayPhotos.slice(0, 8).map(function(p) { return '<div class="photo-item" style="background-image:url(' + p.url + ');background-size:cover;background-position:center;" title="' + p.label + '"></div>'; }).join('') : '<div class="photo-item">No photos captured</div>'}</div>
                \${dayPhotos.length > 8 ? '<p style="font-size:11px;color:#94a3b8;margin-top:8px;">+ ' + (dayPhotos.length - 8) + ' more photo' + (dayPhotos.length - 8 === 1 ? '' : 's') + ' not shown</p>' : ''}
                <div class="report-footer">
                  <div>Generated by SolTrend Pro • Report verified by: \${state.currentUser?.name || 'Field Supervisor'}</div>
                  <div>Page 1 of 1</div>
                </div>
              </body>
              </html>
            \`;
            openReportWindow(reportContent);
          }

          async function generateWeeklyReport() {
            const project = state.currentProject;
            // Was entirely disconnected from the "Week ending" date picker -
            // always used the most recent 7/14 production entries by array
            // position and the most recent 50 inspections / 5 refusals by
            // count, none of which line up with an actual calendar week or
            // respond to the picked date at all. Now derives a real 7-day
            // window ending on the selected date.
            const endStr = document.getElementById('weeklyReportDate')?.value || state.reportDates.weekly;
            const startStr = addDaysStr(endStr, -6);
            const prevEndStr = addDaysStr(startStr, -1);
            const prevStartStr = addDaysStr(prevEndStr, -6);
            const weekProdEntries = state.production.filter(p => p.date >= startStr && p.date <= endStr);
            const prevWeekProdEntries = state.production.filter(p => p.date >= prevStartStr && p.date <= prevEndStr);
            const weekProd = weekProdEntries.reduce((s, p) => s + p.piles, 0);
            const prevWeekProd = prevWeekProdEntries.reduce((s, p) => s + p.piles, 0);
            const avgDaily = Math.round(weekProd / 7);
            const bestDay = weekProdEntries.length > 0 ? Math.max(...weekProdEntries.map(p => p.piles)) : 0;
            const weekChange = prevWeekProd > 0 ? Math.round(((weekProd - prevWeekProd) / prevWeekProd) * 100) : 0;
            const weekInspections = state.inspections.filter(i => { const d = localDateStr(i.timestamp); return d >= startStr && d <= endStr; });
            const weekPassed = weekInspections.filter(i => i.status === 'pass').length;
            const weekFailed = weekInspections.filter(i => i.status === 'fail').length;
            const weekRefusalsList = state.refusals.filter(r => { const d = localDateStr(r.timestamp); return d >= startStr && d <= endStr; });
            const weekRefusals = weekRefusalsList.length;
            const passRate = weekInspections.length > 0 ? Math.round((weekPassed / weekInspections.length) * 100) : 0;
            const includesToday = localDateStr(Date.now()) >= startStr && localDateStr(Date.now()) <= endStr;
            const weather = includesToday ? await fetchWeatherData() : null;
            const dailyWeather = weather?.daily;
            // Weather Impact Analysis card - was hardcoded "4 of 5" clear
            // days, "78°F" avg, "0 days" delays regardless of what the
            // forecast actually said, even though dailyWeather (fetched
            // just above for the day-strip) already has real numbers for
            // these same 5 days.
            const weatherStats = dailyWeather ? (function() {
              const codes = dailyWeather.weather_code.slice(0, 5);
              const highs = dailyWeather.temperature_2m_max.slice(0, 5);
              const precipProbs = (dailyWeather.precipitation_probability_max || []).slice(0, 5);
              const clearDays = codes.filter(function(c) { return c <= 3; }).length;
              const avgTemp = Math.round(highs.reduce(function(s, t) { return s + t; }, 0) / highs.length);
              const delayDays = precipProbs.filter(function(p) { return p >= 60; }).length;
              return { clearDays: clearDays + ' of ' + codes.length, avgTemp: avgTemp + '°F', delayDays: delayDays + ' day' + (delayDays === 1 ? '' : 's') };
            })() : { clearDays: '—', avgTemp: '—', delayDays: '—' };

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
                    <div class="report-type">Weekly Progress Report</div>
                    <div class="report-date">\${new Date(startStr + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - \${new Date(endStr + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</div>
                  </div>
                </div>
                <div class="project-banner">
                  <div class="project-info">
                    <h2>\${project?.name || 'Desert Sun Solar Farm'}</h2>
                    <div class="project-details">\${project?.location || 'Phoenix, AZ'} • \${project?.totalPiles || 0} Total Piles</div>
                  </div>
                  <div class="project-badge">\${weekChange >= 0 ? 'On Track' : 'Behind'}</div>
                </div>
                <div class="section-title">Weather Summary</div>
                <div class="weather-week">
                  \${dailyWeather ? dailyWeather.time.slice(0, 5).map((d, i) => {
                    const code = dailyWeather.weather_code[i];
                    const icon = weatherIconSvg(code, { size: 28 });
                    const maxT = Math.round(dailyWeather.temperature_2m_max[i]);
                    const minT = Math.round(dailyWeather.temperature_2m_min[i]);
                    const dayName = new Date(d).toLocaleDateString('en-US', { weekday: 'short' });
                    const bgClass = code <= 3 ? 'sunny' : code >= 51 ? 'rainy' : 'cloudy';
                    return '<div class="weather-day ' + bgClass + '"><div class="icon">' + icon + '</div><div class="day">' + dayName + '</div><div class="temp">' + maxT + '°F</div></div>';
                  }).join('') : '<div class="weather-day" style="background:#e2e8f0;"><div class="day" style="color:#475569;">' + (includesToday ? 'Forecast unavailable' : 'Historical weather not available for past date ranges') + '</div></div>'}
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
                    \${weekProdEntries.length > 0 ? weekProdEntries.map(p => {
                      const h = Math.max(20, (p.piles / 50) * 100);
                      return '<div class="trend-bar-group"><div class="trend-bar" style="height: ' + h + 'px;"></div><div class="trend-label">' + p.piles + '</div></div>';
                    }).join('') : '<p style="color:#94a3b8;font-size:13px;">No production logged for this week</p>'}
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
                      <span class="comparison-badge \${dailyWeather ? 'positive' : ''}" style="\${dailyWeather ? '' : 'background:#f1f5f9;color:#64748b;'}">\${dailyWeather ? 'Favorable' : 'No data'}</span>
                    </div>
                    <div class="comparison-row"><span class="comparison-label">Clear Days</span><span class="comparison-value">\${weatherStats.clearDays}</span></div>
                    <div class="comparison-row"><span class="comparison-label">Avg Temperature</span><span class="comparison-value">\${weatherStats.avgTemp}</span></div>
                    <div class="comparison-row"><span class="comparison-label">Weather Delays</span><span class="comparison-value">\${weatherStats.delayDays}</span></div>
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
            openReportWindow(reportContent);
          }

          async function generateMonthlyReport() {
            const project = state.currentProject;
            // Was slice(-30)/slice(-60,-30) for production (arbitrary entry
            // counts, not a real calendar month) and, worse, the QC numbers
            // were state.inspections.length et al with NO filtering at all -
            // company-lifetime totals labeled as if they were that month's.
            // Now derives the actual selected calendar month's boundaries.
            const monthStr = document.getElementById('monthlyReportMonth')?.value || state.reportDates.monthly;
            const monthParts = monthStr.split('-').map(Number);
            const my = monthParts[0], mm = monthParts[1];
            const monthStartStr = my + '-' + pad2(mm) + '-01';
            const monthEndStr = my + '-' + pad2(mm) + '-' + pad2(daysInMonth(my, mm));
            let py = my, pm = mm - 1; if (pm < 1) { pm = 12; py -= 1; }
            const prevMonthStartStr = py + '-' + pad2(pm) + '-01';
            const prevMonthEndStr = py + '-' + pad2(pm) + '-' + pad2(daysInMonth(py, pm));
            const monthProdEntries = state.production.filter(p => p.date >= monthStartStr && p.date <= monthEndStr);
            const prevMonthProdEntries = state.production.filter(p => p.date >= prevMonthStartStr && p.date <= prevMonthEndStr);
            const monthProd = monthProdEntries.reduce((s, p) => s + p.piles, 0);
            const prevMonthProd = prevMonthProdEntries.reduce((s, p) => s + p.piles, 0);
            const avgDaily = Math.round(monthProd / daysInMonth(my, mm));
            const monthInspections = state.inspections.filter(i => { const d = localDateStr(i.timestamp); return d >= monthStartStr && d <= monthEndStr; });
            const totalInspections = monthInspections.length;
            const passedInspections = monthInspections.filter(i => i.status === 'pass').length;
            const failedInspections = monthInspections.filter(i => i.status === 'fail').length;
            const passRate = totalInspections > 0 ? Math.round((passedInspections / totalInspections) * 100) : 0;
            const monthRefusalsList = state.refusals.filter(r => { const d = localDateStr(r.timestamp); return d >= monthStartStr && d <= monthEndStr; });
            const monthChange = prevMonthProd > 0 ? Math.round(((monthProd - prevMonthProd) / prevMonthProd) * 100) : 0;
            const monthLabel = new Date(my, mm - 1, 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
            // Crew Performance Rankings - was hardcoded Alpha/Beta/Gamma
            // names with fixed 96.2/93.8/91.4% regardless of what crews
            // actually exist or how they performed. Ranks real crews by
            // their lead's pass rate on inspections logged this month;
            // crews with no inspections this month sort last and show
            // "No data" instead of a fabricated percentage.
            const crewRankings = state.crews.map(c => {
              const theirs = monthInspections.filter(i => i.user === c.lead);
              const passed = theirs.filter(i => i.status === 'pass').length;
              return { name: c.name, lead: c.lead, rate: theirs.length > 0 ? Math.round((passed / theirs.length) * 100) : null };
            }).sort((a, b) => {
              if (a.rate === null && b.rate === null) return 0;
              if (a.rate === null) return 1;
              if (b.rate === null) return -1;
              return b.rate - a.rate;
            }).slice(0, 3);

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
                    <div class="report-date">\${monthLabel}</div>
                  </div>
                </div>
                <div class="project-banner">
                  <div class="project-info">
                    <h2>\${project?.name || 'Desert Sun Solar Farm'}</h2>
                    <div class="project-details">\${project?.location || 'Phoenix, AZ'} • Client: \${project?.client || 'NextEra Energy'}</div>
                  </div>
                  <div class="project-badge">\${monthChange >= 0 ? 'On Schedule' : 'Behind'}</div>
                </div>
                <div class="section-title">Key Performance Indicators</div>
                <div class="kpi-grid">
                  <div class="kpi-card highlight"><div class="value">\${Math.round(((project?.installedPiles || 0) / (project?.totalPiles || 1)) * 100)}%</div><div class="label">Complete</div></div>
                  <div class="kpi-card"><div class="value">\${formatNumber(monthProd)}</div><div class="label">Piles Month</div></div>
                  <div class="kpi-card"><div class="value">\${passRate}%</div><div class="label">QC Pass</div></div>
                  <div class="kpi-card"><div class="value">\${avgDaily}</div><div class="label">Daily Avg</div></div>
                  <div class="kpi-card"><div class="value">\${monthRefusalsList.length}</div><div class="label">Refusals</div></div>
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
                        <div class="qc-stat refusal"><div class="value">\${monthRefusalsList.length}</div><div class="label">Refusals</div></div>
                      </div>
                    </div>
                  </div>
                  <div>
                    <div class="section-title">Crew Performance Rankings</div>
                    <div class="crew-rankings">
                      \${crewRankings.length > 0 ? crewRankings.map((c, i) => {
                        // Plain numbered badge instead of a medal emoji - the
                        // same Windows Print-to-PDF font-substitution bug
                        // that garbled weather icons hits medal emoji too.
                        const rankColor = i === 0 ? '#d97706' : i === 1 ? '#94a3b8' : '#b45309';
                        const cls = i === 0 ? 'gold' : i === 1 ? 'silver' : 'bronze';
                        const medal = '<span style="display:inline-flex;align-items:center;justify-content:center;width:26px;height:26px;border-radius:50%;background:' + rankColor + ';color:#fff;font-weight:700;font-size:13px;">' + (i + 1) + '</span>';
                        return '<div class="crew-item ' + cls + '"><span class="crew-rank">' + medal + '</span><div class="crew-info"><div class="crew-name">' + c.name + '</div><div class="crew-lead">Lead: ' + (c.lead || 'Not assigned') + '</div></div><div class="crew-stats"><div class="crew-rate">' + (c.rate === null ? 'No data' : c.rate + '%') + '</div></div></div>';
                      }).join('') : '<p style="color:#94a3b8;font-size:13px;">No crews on file.</p>'}
                    </div>
                  </div>
                </div>
                <div class="notes-section">
                  <h3>Executive Summary</h3>
                  <div class="notes-content">Performance: \${monthLabel.split(' ')[0]} \${monthChange >= 0 ? 'exceeded' : 'missed'} production targets by \${Math.abs(monthChange)}%, with all crews demonstrating strong performance. QC pass rate of \${passRate}% \${passRate >= 92 ? 'exceeds' : 'approaches'} the 92% target. Month-over-Month: <span class="comparison-badge \${monthChange >= 0 ? 'positive' : 'negative'}">\${monthChange >= 0 ? '+' : ''}\${monthChange}%</span> compared to previous month.</div>
                </div>
                <div class="report-footer">
                  <div>Report prepared for: \${project?.client || 'NextEra Energy'} | Submitted by: \${state.company?.name || 'Apex Solar'} Project Management</div>
                  <div>Distribution: Client, PM, Field Supervisors</div>
                </div>
              </body>
              </html>
            \`;
            openReportWindow(reportContent);
          }

          function generateQCReport() {
            const startDate = document.getElementById('qcStart')?.value || state.reportDates.qcStart;
            const endDate = document.getElementById('qcEnd')?.value || state.reportDates.qcEnd;
            const project = state.currentProject;
            // Was reading startDate/endDate only to print them in the header -
            // every number below (total/passed/failed and the failed-pile
            // table) was the company's all-time inspection history regardless
            // of what range was picked. Now actually scoped to it.
            const rangeInspections = state.inspections.filter(i => { const d = localDateStr(i.timestamp); return d >= startDate && d <= endDate; });
            const total = rangeInspections.length;
            const passed = rangeInspections.filter(i => i.status === 'pass').length;
            const failed = rangeInspections.filter(i => i.status === 'fail').length;
            const passRate = total > 0 ? Math.round((passed / total) * 100) : 0;

            // Failures by reason - fixed order (not by first appearance) so
            // "plumb" is always the same color report to report.
            const failedInRange = rangeInspections.filter(i => i.status === 'fail');
            const reasonRows = QC_REASON_ORDER.map(function(reason, idx) {
              const count = failedInRange.filter(function(i) { return (i.failReason || 'other') === reason; }).length;
              return { label: reason, value: count, color: reportColorFor(idx) };
            });

            // Pile map - current pass/fail/not-yet-inspected status for
            // every pile in the layout. Deliberately NOT scoped to the
            // start/end range above: the map answers "what does the site
            // look like right now", a different question than "how many
            // inspections happened in this window" - scoping it to the
            // date range would leave piles inspected outside the window
            // showing as blank, which misrepresents the real site.
            const qcLayoutRows = reportLayoutRows();
            const qcCellStatus = function(p) {
              if (p.skip) return { skip: true };
              const insp = state.inspections.find(function(i) { return i.pileId === p.pileId; });
              if (!insp) return { color: REPORT_STATUS_COLORS.pending };
              return { color: insp.status === 'pass' ? REPORT_STATUS_COLORS.pass : REPORT_STATUS_COLORS.fail };
            };
            const qcMapLegend = [
              { label: 'Passed', color: REPORT_STATUS_COLORS.pass },
              { label: 'Failed', color: REPORT_STATUS_COLORS.fail },
              { label: 'Not yet inspected', color: REPORT_STATUS_COLORS.pending },
            ];

            // By pile type - only meaningful once a project has real
            // per-type tolerances (Settings -> Racking) and inspections are
            // being recorded in detailed mode against them.
            const activeProfile = state.rackingProfiles.find(function(r) { return r.id === project?.rackingProfileId; });
            const typeSpecs = (activeProfile && activeProfile.pileTypeSpecs) || [];
            const byTypeRows = typeSpecs.map(function(t) {
              const typeInspections = rangeInspections.filter(function(i) { return i.pileType === t.id; });
              const typePassed = typeInspections.filter(function(i) { return i.status === 'pass'; }).length;
              const typeRate = typeInspections.length > 0 ? Math.round((typePassed / typeInspections.length) * 100) : null;
              return { label: t.label || t.profile || 'Type', total: typeInspections.length, passed: typePassed, failed: typeInspections.length - typePassed, rate: typeRate };
            }).filter(function(r) { return r.total > 0; });

            // By inspector - who's recording the most, and their pass rate.
            const byInspector = {};
            rangeInspections.forEach(function(i) {
              const key = i.user || 'Unknown';
              if (!byInspector[key]) byInspector[key] = { name: key, total: 0, passed: 0 };
              byInspector[key].total++;
              if (i.status === 'pass') byInspector[key].passed++;
            });
            const inspectorRows = Object.values(byInspector).sort(function(a, b) { return b.total - a.total; });

            const meterColor = function(rate) { return rate >= 90 ? '#22c55e' : rate >= 70 ? '#eda100' : '#ef4444'; };
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
                  .note { color: #94a3b8; font-size: 11px; margin-top: 8px; }
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
                  \${reportStackedBar([{ label: 'Passed', value: passed, color: REPORT_STATUS_COLORS.pass }, { label: 'Failed', value: failed, color: REPORT_STATUS_COLORS.fail }])}
                </div>
                <div class="section">
                  <h2>Pile Map</h2>
                  \${reportPileGrid(qcLayoutRows, qcCellStatus, qcMapLegend)}
                  <p class="note">Current status of every pile, not limited to the date range above.</p>
                </div>
                <div class="section">
                  <h2>Failures by Reason</h2>
                  \${reportBarList(reasonRows, 'No failed inspections in this range.')}
                </div>
                \${byTypeRows.length > 0 ? \`
                <div class="section">
                  <h2>By Pile Type</h2>
                  <div style="display:flex;flex-direction:column;gap:10px;">
                    \${byTypeRows.map(function(r) {
                      return '<div style="display:flex;align-items:center;gap:10px;">' +
                        '<div style="width:150px;font-size:12px;color:#475569;text-align:right;flex-shrink:0;">' + r.label + '</div>' +
                        '<div style="flex:1;background:#f1f5f9;border-radius:4px;height:18px;"><div style="width:' + (r.rate ?? 0) + '%;height:100%;background:' + meterColor(r.rate ?? 0) + ';border-radius:4px;"></div></div>' +
                        '<div style="width:150px;font-size:12px;color:#1e293b;font-weight:600;flex-shrink:0;">' + (r.rate ?? 0) + '% (' + r.passed + '/' + r.total + ')</div>' +
                      '</div>';
                    }).join('')}
                  </div>
                </div>
                \` : ''}
                \${inspectorRows.length > 0 ? \`
                <div class="section">
                  <h2>By Inspector</h2>
                  <table>
                    <thead><tr><th>Inspector</th><th>Inspections</th><th>Passed</th><th>Failed</th><th>Pass Rate</th></tr></thead>
                    <tbody>
                      \${inspectorRows.map(function(r) {
                        const rate = r.total > 0 ? Math.round((r.passed / r.total) * 100) : 0;
                        return '<tr><td>' + r.name + '</td><td>' + r.total + '</td><td class="pass">' + r.passed + '</td><td class="fail">' + (r.total - r.passed) + '</td><td>' + rate + '%</td></tr>';
                      }).join('')}
                    </tbody>
                  </table>
                </div>
                \` : ''}
                <div class="section">
                  <h2>Failed Inspections in Range</h2>
                  <table>
                    <thead><tr><th>Pile ID</th><th>Reason</th><th>Inspector</th><th>Time</th></tr></thead>
                    <tbody>
                      \${failedInRange.slice(0, 20).map(i =>
                        '<tr><td>' + i.pileId + '</td><td class="fail">' + (i.failReason || 'N/A') + '</td><td>' + i.user + '</td><td>' + new Date(i.timestamp).toLocaleString() + '</td></tr>'
                      ).join('')}
                      \${failedInRange.length === 0 ? '<tr><td colspan="4" style="text-align:center;color:#94a3b8;">No failed inspections in this range</td></tr>' : ''}
                    </tbody>
                  </table>
                  \${failedInRange.length > 20 ? '<p class="note">+ ' + (failedInRange.length - 20) + ' more not shown - see the Inspections CSV export for the full list.</p>' : ''}
                </div>
                <div class="footer">
                  <p>Generated by SolTrend Pro | \${new Date().toLocaleString()}</p>
                </div>
              </body>
              </html>
            \`;
            openReportWindow(reportContent);
          }

          function generatePileStatusReport() {
            const project = state.currentProject;
            const statusCounts = {
              pass: state.inspections.filter(i => i.status === 'pass').length,
              fail: state.inspections.filter(i => i.status === 'fail').length,
              refusal: state.refusals.length,
              notstarted: Math.max(0, (project?.totalPiles || 0) - state.inspections.length - state.refusals.length)
            };
            const overviewSegments = [
              { label: 'Passed', value: statusCounts.pass, color: REPORT_STATUS_COLORS.pass },
              { label: 'Failed', value: statusCounts.fail, color: REPORT_STATUS_COLORS.fail },
              { label: 'Refusal', value: statusCounts.refusal, color: REPORT_STATUS_COLORS.refusal },
              { label: 'Pending', value: statusCounts.notstarted, color: REPORT_STATUS_COLORS.pending },
            ];

            // Zone breakdown - only exists once a project has a real custom
            // layout with zones assigned (Settings -> Pile Layout). A
            // project still on the default procedural grid has no zones to
            // report on, so this section just doesn't render for it.
            const isCustom = project?.pileLayoutMode === 'custom' && state.piles.length > 0;
            const zoneRows = [];
            if (isCustom) {
              const byZone = {};
              state.piles.filter(function(p) { return !p.skip; }).forEach(function(p) {
                const zone = p.zone || 'Ungrouped';
                if (!byZone[zone]) byZone[zone] = { pass: 0, fail: 0, refusal: 0, notstarted: 0 };
                const status = getInspectionStatus(p.pileId);
                byZone[zone][status === 'pass' || status === 'fail' || status === 'refusal' ? status : 'notstarted']++;
              });
              Object.keys(byZone).sort().forEach(function(zone) {
                zoneRows.push({ zone: zone, counts: byZone[zone] });
              });
            }

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
                    <div class="stat-box"><div class="value pending">\${statusCounts.notstarted}</div><div class="label">Not Started</div></div>
                  </div>
                  \${reportStackedBar(overviewSegments)}
                </div>
                <div class="section">
                  <h2>Pile Map</h2>
                  \${reportPileGrid(reportLayoutRows(), function(p) {
                    if (p.skip) return { skip: true };
                    const status = getInspectionStatus(p.pileId);
                    return { color: status === 'pass' ? REPORT_STATUS_COLORS.pass : status === 'fail' ? REPORT_STATUS_COLORS.fail : status === 'refusal' ? REPORT_STATUS_COLORS.refusal : REPORT_STATUS_COLORS.pending };
                  }, [
                    { label: 'Passed', color: REPORT_STATUS_COLORS.pass },
                    { label: 'Failed', color: REPORT_STATUS_COLORS.fail },
                    { label: 'Refusal', color: REPORT_STATUS_COLORS.refusal },
                    { label: 'Not started', color: REPORT_STATUS_COLORS.pending },
                  ])}
                </div>
                <div class="section">
                  <h2>Progress Summary</h2>
                  <p><strong>Total Piles:</strong> \${project?.totalPiles || 0}\${isCustom ? ' (custom layout)' : ''}</p>
                  <p><strong>Completion:</strong> \${Math.round(((project?.installedPiles || 0) / (project?.totalPiles || 1)) * 100)}%</p>
                </div>
                \${zoneRows.length > 0 ? \`
                <div class="section">
                  <h2>Status by Zone</h2>
                  <div style="display:flex;flex-direction:column;gap:12px;">
                    \${zoneRows.map(function(z) {
                      const total = z.counts.pass + z.counts.fail + z.counts.refusal + z.counts.notstarted;
                      return '<div style="display:flex;align-items:center;gap:10px;">' +
                        '<div style="width:110px;font-size:12px;color:#475569;text-align:right;flex-shrink:0;">' + z.zone + ' <span style="color:#94a3b8;">(' + total + ')</span></div>' +
                        '<div style="flex:1;">' + reportMiniBar([
                          { value: z.counts.pass, color: REPORT_STATUS_COLORS.pass },
                          { value: z.counts.fail, color: REPORT_STATUS_COLORS.fail },
                          { value: z.counts.refusal, color: REPORT_STATUS_COLORS.refusal },
                          { value: z.counts.notstarted, color: REPORT_STATUS_COLORS.pending },
                        ], 16, false) + '</div>' +
                      '</div>';
                    }).join('')}
                  </div>
                  <p style="color:#94a3b8;font-size:11px;margin-top:10px;">Green = passed, red = failed, orange = refusal, gray = not started.</p>
                </div>
                \` : ''}
                <div class="footer">
                  <p>Generated by SolTrend Pro | \${new Date().toLocaleString()}</p>
                </div>
              </body>
              </html>
            \`;
            openReportWindow(reportContent);
          }

          function generateRefusalReport() {
            const startDate = document.getElementById('refusalStart')?.value || state.reportDates.refusalStart;
            const endDate = document.getElementById('refusalEnd')?.value || state.reportDates.refusalEnd;
            const project = state.currentProject;
            // Previously ignored any notion of a date range entirely - every
            // number here was the company's all-time refusal history. Now
            // scoped the same way the QC report already was.
            const rangeRefusals = state.refusals.filter(function(r) { const d = localDateStr(r.timestamp); return d >= startDate && d <= endDate; });
            const avgDepth = rangeRefusals.length > 0 ? Math.round(rangeRefusals.reduce((s, r) => s + (r.achievedDepth || 0), 0) / rangeRefusals.length) : 0;
            const avgShortfallReport = rangeRefusals.length > 0 ? Math.round(rangeRefusals.reduce((s, r) => s + ((r.targetDepth || 72) - (r.achievedDepth || 0)), 0) / rangeRefusals.length) : 0;

            const reasonRows = REFUSAL_REASON_ORDER.map(function(reason, idx) {
              const count = rangeRefusals.filter(function(r) { return (r.reason || 'other') === reason; }).length;
              return { label: reason, value: count, color: reportColorFor(idx) };
            });

            // Shortfall severity - how far short of target depth, bucketed.
            // A refusal with a small shortfall is barely worth flagging; a
            // huge one may point at a real change to the foundation design.
            const SHORTFALL_BUCKETS = [
              { label: '< 12"', min: 0, max: 12 },
              { label: '12-24"', min: 12, max: 24 },
              { label: '24-48"', min: 24, max: 48 },
              { label: '48"+', min: 48, max: Infinity },
            ];
            const shortfallRows = SHORTFALL_BUCKETS.map(function(b, idx) {
              const count = rangeRefusals.filter(function(r) {
                const shortfall = (r.targetDepth || 72) - (r.achievedDepth || 0);
                return shortfall >= b.min && shortfall < b.max;
              }).length;
              // A single hue, light -> dark: magnitude, not identity, so a
              // sequential ramp rather than the categorical set above.
              const seqBlues = ['#cde2fb', '#6da7ec', '#256abf', '#0d366b'];
              return { label: b.label, value: count, color: seqBlues[idx] };
            });

            // Zone breakdown - only meaningful once a project has a real
            // custom pile layout with zones (Settings -> Pile Layout).
            const isCustom = project?.pileLayoutMode === 'custom' && state.piles.length > 0;
            const zoneRows = [];
            if (isCustom) {
              const byZone = {};
              rangeRefusals.forEach(function(r) {
                const pile = state.piles.find(function(p) { return p.pileId === r.pileId; });
                const zone = (pile && pile.zone) || 'Ungrouped';
                byZone[zone] = (byZone[zone] || 0) + 1;
              });
              Object.keys(byZone).sort(function(a, b) { return byZone[b] - byZone[a]; }).forEach(function(zone, idx) {
                zoneRows.push({ label: zone, value: byZone[zone], color: reportColorFor(idx) });
              });
            }

            // Pile map - deliberately built from state.refusals directly
            // (every refusal ever logged for this pile), not scoped to the
            // date range and not using getInspectionStatus(), which would
            // hide a refusal behind a later successful re-drive. This map
            // is a foundation-design tool: it should still show a pile
            // that had to be redesigned around, even after it was fixed.
            const refusalLayoutRows = reportLayoutRows();
            const refusalCellStatus = function(p) {
              if (p.skip) return { skip: true };
              const ref = state.refusals.find(function(r) { return r.pileId === p.pileId; });
              if (!ref) return { color: '#e2e8f0' };
              const idx = REFUSAL_REASON_ORDER.indexOf(ref.reason || 'other');
              return { color: reportColorFor(idx >= 0 ? idx : REFUSAL_REASON_ORDER.length - 1) };
            };
            const refusalMapLegend = REFUSAL_REASON_ORDER.map(function(reason, idx) {
              return { label: reason, color: reportColorFor(idx) };
            }).concat([{ label: 'No refusal', color: '#e2e8f0' }]);

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
                  .note { color: #94a3b8; font-size: 11px; margin-top: 8px; }
                  .footer { margin-top: 40px; text-align: center; color: #94a3b8; font-size: 12px; }
                </style>
              </head>
              <body>
                <div class="header">
                  <h1>Refusal Analysis Report</h1>
                  <p>\${project?.name || 'SolTrend Pro'} | \${new Date(startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - \${new Date(endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                </div>
                <div class="section">
                  <h2>Summary</h2>
                  <div class="stats">
                    <div class="stat-box"><div class="value">\${rangeRefusals.length}</div><div class="label">Total Refusals</div></div>
                    <div class="stat-box"><div class="value">\${avgDepth}"</div><div class="label">Avg Achieved Depth</div></div>
                    <div class="stat-box"><div class="value">\${avgShortfallReport}"</div><div class="label">Avg Shortfall</div></div>
                  </div>
                </div>
                <div class="section">
                  <h2>Refusal Map</h2>
                  \${reportPileGrid(refusalLayoutRows, refusalCellStatus, refusalMapLegend)}
                  <p class="note">Shows every pile with a refusal on record, across the project's full history - not limited to the date range above.</p>
                </div>
                <div class="section">
                  <h2>Refusals by Reason</h2>
                  \${reportBarList(reasonRows, 'No refusals in this range.')}
                </div>
                <div class="section">
                  <h2>Shortfall Severity</h2>
                  \${reportBarList(shortfallRows, 'No refusals in this range.')}
                </div>
                \${zoneRows.length > 0 ? \`
                <div class="section">
                  <h2>Refusals by Zone</h2>
                  \${reportBarList(zoneRows, 'No refusals in this range.')}
                </div>
                \` : ''}
                <div class="section">
                  <h2>Refusals in Range</h2>
                  <table>
                    <thead><tr><th>Pile ID</th><th>Reason</th><th>Target Depth</th><th>Achieved</th><th>Shortfall</th></tr></thead>
                    <tbody>
                      \${rangeRefusals.slice(0, 25).map(r =>
                        '<tr><td>' + r.pileId + '</td><td class="capitalize">' + r.reason + '</td><td>' + r.targetDepth + '"</td><td>' + (r.achievedDepth || 'N/A') + '"</td><td>' + (r.achievedDepth ? (r.targetDepth - r.achievedDepth) + '"' : '-') + '</td></tr>'
                      ).join('')}
                      \${rangeRefusals.length === 0 ? '<tr><td colspan="5" style="text-align:center;color:#94a3b8;">No refusals in this range</td></tr>' : ''}
                    </tbody>
                  </table>
                  \${rangeRefusals.length > 25 ? '<p class="note">+ ' + (rangeRefusals.length - 25) + ' more not shown - see the Refusals CSV export for the full list.</p>' : ''}
                </div>
                <div class="footer">
                  <p>Generated by SolTrend Pro | \${new Date().toLocaleString()}</p>
                </div>
              </body>
              </html>
            \`;
            openReportWindow(reportContent);
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
            const { zoom, totalRows, pilesPerRow, search } = state.heatmap;
            const cellSize = Math.round(20 * zoom);
            const term = (search || '').trim().toLowerCase();
            const isCustom = state.currentProject?.pileLayoutMode === 'custom' && state.piles && state.piles.length > 0;
            let matchCount = 0;
            let rows = '';
            let headerNote = 'Showing all ' + totalRows + ' rows';
            if (isCustom) {
              // Real layout: group by row (as imported/entered, not a fixed
              // rectangle), sorted by position within each row, and grouped
              // under zone headers when the piles carry a zone. A "skip"
              // pile is a gap/obstacle placeholder - it still occupies a
              // cell so the row's real shape is visible, but it's not
              // clickable and doesn't count toward matches.
              const activeProfile = state.rackingProfiles.find(function(r) { return r.id === state.currentProject?.rackingProfileId; });
              const typeLabels = {};
              ((activeProfile && activeProfile.pileTypeSpecs) || []).forEach(function(t) { typeLabels[t.id] = t.label || t.profile || 'Type'; });
              const byRow = {};
              state.piles.forEach(function(p) { (byRow[p.row] = byRow[p.row] || []).push(p); });
              const rowNums = Object.keys(byRow).map(Number).sort(function(a, b) { return a - b; });
              let realPileCount = 0;
              let currentZone = undefined;
              rowNums.forEach(function(rowNum) {
                const rowPiles = byRow[rowNum].slice().sort(function(a, b) { return a.position - b.position; });
                const rowZone = rowPiles.find(function(p) { return p.zone; })?.zone || null;
                if (rowZone !== currentZone) {
                  currentZone = rowZone;
                  rows += '<div class="text-xs font-semibold text-amber-400/90 uppercase tracking-wider mt-3 mb-1 first:mt-0">' + (rowZone || 'Ungrouped') + '</div>';
                }
                let cells = '';
                rowPiles.forEach(function(p) {
                  if (p.skip) {
                    cells += '<span class="heat-cell-gap" style="width: ' + cellSize + 'px; height: ' + cellSize + 'px" title="Gap / obstacle"></span>';
                    return;
                  }
                  realPileCount++;
                  const isMatch = !term || p.pileId.indexOf(term) !== -1;
                  if (term && isMatch) matchCount++;
                  const typeLabel = p.pileType && typeLabels[p.pileType] ? typeLabels[p.pileType] : (p.color || '');
                  const borderColor = p.color ? p.color.toLowerCase().replace(/\s+/g, '') : '';
                  cells += '<button onclick="showPileDetails(\\'' + p.pileId + '\\')" class="heat-cell status-' + getInspectionStatus(p.pileId) + (term && !isMatch ? ' dimmed' : '') + '" style="width: ' + cellSize + 'px; height: ' + cellSize + 'px' + (borderColor && borderColor !== 'nocolor' ? '; border-bottom: 3px solid ' + borderColor : '') + '" title="' + p.pileId + (typeLabel ? ' · ' + typeLabel : '') + '"></button>';
                });
                rows += '<div class="flex items-center gap-0.5 mb-0.5"><span class="row-label w-8 text-[10px] text-slate-500 font-mono text-right pr-1">' + rowNum + '</span>' + cells + '</div>';
              });
              headerNote = 'Custom layout · ' + realPileCount + ' piles across ' + rowNums.length + ' rows';
            } else {
              for (let row = 1; row <= totalRows; row++) {
                let cells = '';
                for (let pile = 1; pile <= pilesPerRow; pile++) {
                  const pileId = row + '-' + pile;
                  const isMatch = !term || pileId.indexOf(term) !== -1;
                  if (term && isMatch) matchCount++;
                  cells += '<button onclick="showPileDetails(\\'' + pileId + '\\')" class="heat-cell status-' + getInspectionStatus(pileId) + (term && !isMatch ? ' dimmed' : '') + '" style="width: ' + cellSize + 'px; height: ' + cellSize + 'px" title="' + pileId + '"></button>';
                }
                rows += '<div class="flex items-center gap-0.5 mb-0.5"><span class="row-label w-8 text-[10px] text-slate-500 font-mono text-right pr-1">' + row + '</span>' + cells + '</div>';
              }
            }
            const editLayoutBtn = hasRole('manager') ? '<button onclick="state.settingsTab=\\'pileLayout\\'; navigateTo(\\'settings\\')" class="px-3 py-2 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-lg text-xs font-medium flex items-center gap-1.5">' + icon('layout-grid', 'w-3.5 h-3.5') + ' Edit Layout</button>' : '';
            return '<div class="space-y-4 animate-fade-in"><div class="flex items-center justify-between"><div><h1 class="font-display text-2xl font-bold text-white">Pile Map</h1><p class="text-slate-400">' + headerNote + '</p></div><div class="flex items-center gap-2">' + editLayoutBtn + '<button onclick="zoomOut()" class="p-2 bg-slate-700 rounded-lg text-slate-300">' + icon('zoom-out', 'w-4 h-4') + '</button><span class="text-sm text-slate-400 w-12 text-center">' + Math.round(zoom * 100) + '%</span><button onclick="zoomIn()" class="p-2 bg-slate-700 rounded-lg text-slate-300">' + icon('zoom-in', 'w-4 h-4') + '</button></div></div><div class="flex flex-wrap items-center gap-3 bg-slate-800/50 border border-slate-700 rounded-xl p-3"><div class="flex items-center gap-2"><div class="w-3 h-3 rounded bg-green-500"></div><span class="text-xs text-slate-300">Passed</span></div><div class="flex items-center gap-2"><div class="w-3 h-3 rounded bg-red-500"></div><span class="text-xs text-slate-300">Failed</span></div><div class="flex items-center gap-2"><div class="w-3 h-3 rounded bg-orange-500"></div><span class="text-xs text-slate-300">Refusal</span></div><div class="flex items-center gap-2"><div class="w-3 h-3 rounded bg-slate-500"></div><span class="text-xs text-slate-300">Not Started</span></div><div class="flex items-center gap-2 ml-auto"><input type="text" id="pileMapSearch" value="' + (search || '') + '" oninput="filterPileMap(this.value)" placeholder="Search pile, e.g. 12-7" class="bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-white text-xs w-40">' + (term ? '<span class="text-xs text-slate-500">' + matchCount + ' match' + (matchCount === 1 ? '' : 'es') + '</span>' : '') + '</div></div><div class="bg-slate-800/50 border border-slate-700 rounded-xl p-4 overflow-x-auto" style="max-height: 60vh; overflow-y: auto;"><div class="inline-block">' + rows + '</div></div></div><div id="pileModal" class="fixed inset-0 z-50 hidden items-center justify-center p-4 modal-backdrop"><div class="bg-slate-800 border border-slate-700 rounded-xl max-w-sm w-full" id="pileModalContent"></div></div>';
          }

          // Live-filters the pile map as the user types without a full
          // render() - re-rendering on every keystroke would rebuild this
          // same search input and drop focus/cursor position mid-word.
          function filterPileMap(value) {
            state.heatmap.search = value;
            const term = value.trim().toLowerCase();
            document.querySelectorAll('.heat-cell').forEach(function(cell) {
              const pid = cell.getAttribute('title') || '';
              const match = !term || pid.indexOf(term) !== -1;
              cell.classList.toggle('dimmed', !!term && !match);
            });
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
            content.innerHTML = '<div class="p-5 border-b border-slate-700/50 flex justify-between items-center"><h3 class="font-display text-lg font-bold text-white">Pile ' + pileId + '</h3><button onclick="closePileModal()" class="p-1 text-slate-400 hover:text-white">' + icon('x', 'w-5 h-5') + '</button></div><div class="p-5"><div class="flex items-center gap-3 mb-4"><div class="w-10 h-10 rounded-full ' + info.bg + ' flex items-center justify-center ' + info.color + '">' + icon(info.icon, 'w-5 h-5') + '</div><div><span class="' + info.color + ' font-bold text-lg">' + info.label + '</span><p class="text-xs text-slate-500">' + (status !== 'notstarted' ? 'Recorded' : 'No data') + '</p></div></div>' + (status !== 'notstarted' ? '<div class="space-y-2 mb-4 text-sm"><div class="flex justify-between text-slate-300"><span class="text-slate-500">Inspector:</span><span>' + userString + '</span></div><div class="flex justify-between text-slate-300"><span class="text-slate-500">Timestamp:</span><span>' + timeString + '</span></div>' + (inspection?.depth ? '<div class="flex justify-between text-slate-300"><span class="text-slate-500">Depth:</span><span>' + inspection.depth + '"</span></div>' : '') + (inspection?.plumbNS ? '<div class="flex justify-between text-slate-300"><span class="text-slate-500">Plumb N-S:</span><span>' + inspection.plumbNS + '°</span></div>' : '') + (status === 'refusal' ? '<div class="flex justify-between text-slate-300"><span class="text-slate-500">Reason:</span><span class="capitalize">' + (refusal?.reason || 'N/A') + '</span></div>' + (refusal?.achievedDepth ? '<div class="flex justify-between text-slate-300"><span class="text-slate-500">Achieved Depth:</span><span>' + refusal.achievedDepth + '"</span></div>' : '') + (refusal?.notes ? '<div class="flex justify-between text-slate-300"><span class="text-slate-500">Notes:</span><span class="text-right">' + refusal.notes + '</span></div>' : '') : '') + '</div>' : '') + '<div class="grid grid-cols-2 gap-2 mt-4">' + (status === 'fail' || status === 'refusal' ? '<button onclick="reinspectPile(\\'' + pileId + '\\')" class="w-full py-2 bg-amber-500 hover:bg-amber-400 text-black rounded-lg font-medium text-sm flex items-center justify-center gap-2">' + icon('refresh-cw', 'w-4 h-4') + ' Reinspect</button><button onclick="deletePileRecord(\\'' + pileId + '\\')" class="w-full py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg font-medium text-sm flex items-center justify-center gap-2">' + icon('trash-2', 'w-4 h-4') + ' Delete</button><button onclick="closePileModal()" class="col-span-2 w-full py-2 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-lg font-medium text-sm">Close</button>' : status === 'notstarted' ? '<button onclick="reinspectPile(\\'' + pileId + '\\')" class="col-span-2 w-full py-2 bg-green-600 hover:bg-green-500 text-white rounded-lg font-medium text-sm flex items-center justify-center gap-2">' + icon('plus', 'w-4 h-4') + ' Inspect Now</button>' : '<button onclick="deletePileRecord(\\'' + pileId + '\\')" class="w-full py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg font-medium text-sm flex items-center justify-center gap-2">' + icon('trash-2', 'w-4 h-4') + ' Delete</button><button onclick="closePileModal()" class="w-full py-2 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-lg font-medium text-sm">Close</button>') + '</div></div>';
            modal.classList.remove('hidden'); modal.classList.add('flex'); lucide.createIcons();
          }
          function reinspectPile(pileId) { const { row, pile } = parsePileId(pileId); state.currentRow = row; state.currentPile = pile; syncInspectionPileTypeFromLayout(); closePileModal(); navigateTo('inspection'); }
          function closePileModal() { document.getElementById('pileModal').classList.add('hidden'); }
          // Lets a misclicked QC inspection or refusal be removed straight
          // from the pile map, instead of it being stuck on the pile
          // permanently. Works out which record type this pile actually
          // has (inspection vs. refusal) from its current status, since
          // they're different tables/endpoints under the hood.
          async function deletePileRecord(pileId) {
            const status = getInspectionStatus(pileId);
            if (status === 'notstarted') return;
            const isRefusal = status === 'refusal';
            if (!confirm('Delete this ' + (isRefusal ? 'refusal' : 'inspection') + ' for pile ' + pileId + '? This cannot be undone.')) return;
            hapticFeedback();
            try {
              const projectId = state.currentProject?.id || 'proj_001';
              const endpoint = (isRefusal ? '/api/refusals' : '/api/inspections') + '?projectId=' + encodeURIComponent(projectId) + '&pileId=' + encodeURIComponent(pileId);
              const res = await fetch(endpoint, { method: 'DELETE' });
              if (!res.ok) {
                const err = await res.json().catch(function() { return {}; });
                alert(err.error || 'Failed to delete. Please try again.');
                return;
              }
              if (isRefusal) {
                state.refusals = state.refusals.filter(function(r) { return r.pileId !== pileId; });
                state.openRefusals = Math.max(0, (state.openRefusals || 0) - 1);
              } else {
                state.inspections = state.inspections.filter(function(i) { return i.pileId !== pileId; });
              }
              closePileModal();
              render();
            } catch (e) {
              console.error('Delete pile record error:', e);
              alert('Failed to delete. Please try again.');
            }
          }
          function zoomIn() { state.heatmap.zoom = Math.min(2, state.heatmap.zoom + 0.25); render(); }
          function zoomOut() { state.heatmap.zoom = Math.max(0.5, state.heatmap.zoom - 0.25); render(); }

          // PILE LAYOUT - real per-pile data backing a "custom" (irregular)
          // pile map, as an alternative to the default procedural
          // totalRows x pilesPerRow rectangle. A project stays in 'grid'
          // mode (the original behavior, unchanged) until a CSV import or a
          // manual pile add switches it to 'custom' - see Project.pileLayoutMode
          // and the Pile model in schema.prisma, and /api/piles.
          //
          // Known limitation (accepted for this round): Inspection's
          // sequential prev/next navigation still steps through the
          // totalRows/pilesPerRow rectangle, not the real row lengths - it
          // just looks up a matching Pile record at each stop to
          // auto-fill the pile type. The Pile Map's tap-to-inspect flow
          // (reinspectPile) is the precise entry point once a project has
          // a real irregular layout, since it always jumps to a real pile.
          function syncInspectionPileTypeFromLayout() {
            if (!state.piles || state.piles.length === 0) return;
            const pid = getPileId(state.currentRow, state.currentPile);
            const match = state.piles.find(function(p) { return p.pileId === pid; });
            if (match && match.pileType) state.inspectionPileType = match.pileType;
          }

          // Keeps the project's cached layout-mode/totals in sync locally
          // right after a pile write, so the Pile Map header, Company
          // Dashboard, etc. don't wait on a full loadSettings() round trip
          // to reflect a change that just happened. Mirrors exactly what
          // recomputeProjectPileStats() does server-side.
          function syncProjectPileMode(mode) {
            if (!state.currentProject) return;
            state.currentProject.pileLayoutMode = mode;
            if (mode === 'custom') {
              const real = state.piles.filter(function(p) { return !p.skip; });
              const maxRow = state.piles.reduce(function(m, p) { return Math.max(m, p.row); }, 0);
              state.currentProject.totalPiles = real.length;
              if (maxRow) state.currentProject.totalRows = maxRow;
            } else {
              state.currentProject.totalPiles = (state.currentProject.totalRows || 0) * (state.currentProject.pilesPerRow || 0);
            }
            const idx = state.projects.findIndex(function(p) { return p.id === state.currentProject.id; });
            if (idx !== -1) state.projects[idx] = Object.assign({}, state.projects[idx], { pileLayoutMode: state.currentProject.pileLayoutMode, totalPiles: state.currentProject.totalPiles, totalRows: state.currentProject.totalRows });
          }

          function parseCsvLine(line) {
            const out = []; let cur = ''; let inQuotes = false;
            for (let i = 0; i < line.length; i++) {
              const c = line[i];
              if (inQuotes) {
                if (c === '"') { if (line[i + 1] === '"') { cur += '"'; i++; } else { inQuotes = false; } }
                else cur += c;
              } else {
                if (c === '"') inQuotes = true;
                else if (c === ',') { out.push(cur); cur = ''; }
                else cur += c;
              }
            }
            out.push(cur);
            return out;
          }
          // Generic column format (see the pending-tasks writeup): row,
          // position, zone, pileType, color, skip, lat, lng, notes, pileId.
          // pileType is matched by label (or profile) against the project's
          // active racking profile - there's no real Hogan/OMCO stakeout
          // export to build against yet, so this stays a generic importer
          // rather than one tuned to a specific vendor format.
          function parsePileCsvText(text) {
            const lines = text.split(/\\r?\\n/).filter(function(l) { return l.trim().length > 0; });
            if (lines.length < 2) return { rows: [], warnings: ['The file needs a header row plus at least one data row.'] };
            const header = parseCsvLine(lines[0]).map(function(h) { return h.trim().toLowerCase(); });
            const idx = {};
            header.forEach(function(h, i) { idx[h] = i; });
            if (idx.row === undefined || idx.position === undefined) {
              return { rows: [], warnings: ['The CSV must include "row" and "position" columns.'] };
            }
            const activeProfile = state.rackingProfiles.find(function(r) { return r.id === state.currentProject?.rackingProfileId; });
            const typeSpecs = (activeProfile && activeProfile.pileTypeSpecs) || [];
            const rows = []; const warnings = [];
            for (let li = 1; li < lines.length; li++) {
              const cells = parseCsvLine(lines[li]);
              const get = function(key) { return idx[key] !== undefined ? (cells[idx[key]] || '').trim() : ''; };
              const rowNum = parseInt(get('row'), 10);
              const posNum = parseInt(get('position'), 10);
              if (!rowNum || !posNum) { warnings.push('Line ' + (li + 1) + ': missing or invalid row/position - skipped.'); continue; }
              const zone = get('zone') || null;
              const typeLabel = get('piletype');
              const colorRaw = get('color') || null;
              const skipRaw = get('skip').toLowerCase();
              const skip = skipRaw === 'true' || skipRaw === 'yes' || skipRaw === '1' || skipRaw === 'y';
              const latRaw = get('lat'); const lngRaw = get('lng');
              const notes = get('notes') || null;
              const pileIdOverride = get('pileid');
              let pileType = null;
              if (typeLabel) {
                const match = typeSpecs.find(function(t) { return (t.label || '').trim().toLowerCase() === typeLabel.toLowerCase() || (t.profile || '').trim().toLowerCase() === typeLabel.toLowerCase(); });
                if (match) pileType = match.id;
                else warnings.push('Line ' + (li + 1) + ': pile type "' + typeLabel + '" doesn\\'t match any type on the active racking profile - imported with no type set.');
              }
              rows.push({
                pileId: pileIdOverride || (rowNum + '-' + posNum),
                row: rowNum, position: posNum, zone: zone, pileType: pileType,
                color: colorRaw, skip: skip,
                lat: latRaw ? parseFloat(latRaw) : null, lng: lngRaw ? parseFloat(lngRaw) : null,
                notes: notes, typeLabelRaw: typeLabel || '',
              });
            }
            return { rows: rows, warnings: warnings };
          }
          function downloadPileCsvTemplate() {
            const rows = [
              { row: 1, position: 1, zone: 'Zone A', pileType: '', color: '', skip: 'false', lat: '', lng: '', notes: '', pileId: '' },
              { row: 1, position: 2, zone: 'Zone A', pileType: '', color: '', skip: 'false', lat: '', lng: '', notes: '', pileId: '' },
              { row: 1, position: 3, zone: 'Zone A', pileType: '', color: '', skip: 'true', lat: '', lng: '', notes: 'obstacle - existing culvert', pileId: '' },
              { row: 2, position: 1, zone: 'Zone B', pileType: '', color: '', skip: 'false', lat: '', lng: '', notes: '', pileId: '' },
            ];
            downloadCSV('pile-layout-template.csv', toCSV(rows, ['row', 'position', 'zone', 'pileType', 'color', 'skip', 'lat', 'lng', 'notes', 'pileId']));
          }
          function triggerPileCsvInput() { document.getElementById('pileCsvInput').click(); }
          function handlePileCsvSelect(event) {
            const file = event.target.files[0]; if (!file) return;
            const reader = new FileReader();
            reader.onload = function(e) {
              const parsed = parsePileCsvText(String(e.target.result || ''));
              state.pileCsvPreview = Object.assign({ fileName: file.name }, parsed);
              render();
            };
            reader.readAsText(file);
            event.target.value = '';
          }
          function cancelPileCsvImport() { state.pileCsvPreview = null; render(); }
          async function confirmPileCsvImport() {
            const preview = state.pileCsvPreview;
            if (!preview || !preview.rows || preview.rows.length === 0) return;
            try {
              const res = await fetch('/api/piles', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ projectId: state.currentProject.id, piles: preview.rows }),
              });
              if (res.ok) {
                state.pileCsvPreview = null;
                await loadPiles();
                syncProjectPileMode('custom');
                render();
              } else {
                const err = await res.json().catch(function() { return {}; });
                alert(err.error || 'Failed to import the pile layout.');
              }
            } catch (e) { console.error('Pile import error:', e); alert('Failed to import the pile layout.'); }
          }

          function openPileModal(pileId) {
            if (pileId) {
              const p = state.piles.find(function(x) { return x.pileId === pileId; });
              state.editingPile = p ? Object.assign({}, p) : null;
            } else {
              const maxRow = state.piles.reduce(function(m, x) { return Math.max(m, x.row); }, 0);
              state.editingPile = { pileId: null, row: maxRow || 1, position: 1, zone: '', pileType: '', color: '', skip: false, lat: '', lng: '', notes: '' };
            }
            render();
          }
          function closePileEditModal() { state.editingPile = null; render(); }
          async function savePileEditModal() {
            const p = state.editingPile; if (!p) return;
            const row = parseInt(p.row, 10); const position = parseInt(p.position, 10);
            if (!row || !position) { alert('Row and position are required.'); return; }
            const payload = {
              pileId: p.pileId || undefined, row: row, position: position,
              zone: p.zone || null, pileType: p.pileType || null, color: p.color || null,
              skip: !!p.skip,
              lat: (p.lat !== '' && p.lat != null) ? parseFloat(p.lat) : null,
              lng: (p.lng !== '' && p.lng != null) ? parseFloat(p.lng) : null,
              notes: p.notes || null,
            };
            try {
              const res = await fetch('/api/piles', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ projectId: state.currentProject.id, piles: [payload] }),
              });
              if (res.ok) {
                await loadPiles();
                syncProjectPileMode('custom');
                closePileEditModal();
              } else {
                const err = await res.json().catch(function() { return {}; });
                alert(err.error || 'Failed to save the pile.');
              }
            } catch (e) { console.error('Save pile error:', e); alert('Failed to save the pile.'); }
          }
          async function deletePileRow(pileId) {
            if (!confirm('Remove pile ' + pileId + ' from the layout?')) return;
            try {
              const res = await fetch('/api/piles?projectId=' + state.currentProject.id + '&pileId=' + encodeURIComponent(pileId), { method: 'DELETE' });
              if (res.ok) { await loadPiles(); syncProjectPileMode('custom'); render(); }
              else { const err = await res.json().catch(function() { return {}; }); alert(err.error || 'Failed to delete the pile.'); }
            } catch (e) { console.error('Delete pile error:', e); alert('Failed to delete the pile.'); }
          }
          async function clearCustomLayout() {
            if (!confirm('Clear the entire custom pile layout for this project and revert to the standard grid? This cannot be undone.')) return;
            try {
              const res = await fetch('/api/piles?projectId=' + state.currentProject.id + '&clearAll=true', { method: 'DELETE' });
              if (res.ok) { state.piles = []; syncProjectPileMode('grid'); render(); }
              else { const err = await res.json().catch(function() { return {}; }); alert(err.error || 'Failed to clear the layout.'); }
            } catch (e) { console.error('Clear layout error:', e); alert('Failed to clear the layout.'); }
          }

          function renderPileEditModal(typeOptions) {
            const p = state.editingPile;
            if (!p) return '';
            const title = p.pileId ? 'Edit Pile ' + p.pileId : 'Add Pile';
            return '<div class="fixed inset-0 z-50 overflow-y-auto modal-backdrop">' +
              '<div class="min-h-full flex items-center justify-center p-4" onclick="if(event.target === this) closePileEditModal()">' +
                '<div class="bg-slate-900 border border-slate-700 rounded-2xl p-6 w-full max-w-md my-8">' +
                  '<div class="flex items-center justify-between mb-6"><h3 class="font-display font-semibold text-white text-lg">' + title + '</h3><button onclick="closePileEditModal()" class="p-2 hover:bg-slate-800 rounded-lg text-slate-400">' + icon('x', 'w-5 h-5') + '</button></div>' +
                  '<div class="space-y-4">' +
                    '<div class="grid grid-cols-2 gap-3">' +
                      '<div><label class="text-xs text-slate-500 uppercase mb-2 block">Row</label><input type="number" value="' + (p.row ?? '') + '" oninput="state.editingPile.row=this.value" class="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white"></div>' +
                      '<div><label class="text-xs text-slate-500 uppercase mb-2 block">Position in Row</label><input type="number" value="' + (p.position ?? '') + '" oninput="state.editingPile.position=this.value" class="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white"></div>' +
                    '</div>' +
                    '<div><label class="text-xs text-slate-500 uppercase mb-2 block">Zone (optional)</label><input type="text" value="' + (p.zone || '') + '" oninput="state.editingPile.zone=this.value" placeholder="e.g. Zone A" class="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white"></div>' +
                    '<div><label class="text-xs text-slate-500 uppercase mb-2 block">Pile Type</label><select onchange="state.editingPile.pileType=this.value" class="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white">' +
                      '<option value="">Not set</option>' +
                      typeOptions.map(function(t) { return '<option value="' + t.id + '" ' + (p.pileType === t.id ? 'selected' : '') + '>' + (t.label || t.profile || 'Type') + '</option>'; }).join('') +
                    '</select></div>' +
                    '<div class="grid grid-cols-2 gap-3">' +
                      '<div><label class="text-xs text-slate-500 uppercase mb-2 block">Color (vendor plan)</label><input type="text" value="' + (p.color || '') + '" oninput="state.editingPile.color=this.value" class="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white"></div>' +
                      '<div class="flex items-end pb-3"><label class="flex items-center gap-2 text-sm text-slate-300"><input type="checkbox" ' + (p.skip ? 'checked' : '') + ' onchange="state.editingPile.skip=this.checked" class="w-4 h-4"> Gap / obstacle (no pile here)</label></div>' +
                    '</div>' +
                    '<div class="grid grid-cols-2 gap-3">' +
                      '<div><input type="number" step="any" value="' + (p.lat ?? '') + '" oninput="state.editingPile.lat=this.value" placeholder="Latitude" class="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white"></div>' +
                      '<div><input type="number" step="any" value="' + (p.lng ?? '') + '" oninput="state.editingPile.lng=this.value" placeholder="Longitude" class="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white"></div>' +
                    '</div>' +
                    '<div><label class="text-xs text-slate-500 uppercase mb-2 block">Notes</label><textarea oninput="state.editingPile.notes=this.value" rows="2" class="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white">' + (p.notes || '') + '</textarea></div>' +
                  '</div>' +
                  '<div class="flex gap-3 mt-6">' +
                    '<button onclick="closePileEditModal()" class="flex-1 py-3 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-lg font-medium">Cancel</button>' +
                    '<button onclick="savePileEditModal()" class="flex-1 py-3 bg-amber-500 hover:bg-amber-400 text-black rounded-lg font-semibold">Save</button>' +
                  '</div>' +
                '</div>' +
              '</div>' +
            '</div>';
          }

          function renderPileLayoutSettings() {
            const project = state.currentProject;
            const isCustom = project?.pileLayoutMode === 'custom';
            const canEdit = hasRole('manager');
            const canClear = hasRole('admin');
            const activeProfile = state.rackingProfiles.find(function(r) { return r.id === project?.rackingProfileId; });
            const typeOptions = (activeProfile && activeProfile.pileTypeSpecs) || [];
            const typeLabels = {};
            typeOptions.forEach(function(t) { typeLabels[t.id] = t.label || t.profile || 'Type'; });

            const statusBanner = '<div class="card rounded-xl p-4 flex items-center gap-3">' +
              '<div class="w-10 h-10 rounded-full ' + (isCustom ? 'bg-amber-500/10 text-amber-400' : 'bg-slate-700/50 text-slate-400') + ' flex items-center justify-center">' + icon(isCustom ? 'layout-grid' : 'grid-3x3', 'w-5 h-5') + '</div>' +
              '<div class="flex-1"><p class="text-sm font-semibold text-white">' + (isCustom ? 'Custom layout' : 'Standard grid') + '</p>' +
              '<p class="text-xs text-slate-500">' + (isCustom ? state.piles.filter(function(p) { return !p.skip; }).length + ' piles across ' + (project.totalRows || 0) + ' rows, imported or entered manually.' : 'Procedural ' + (project?.totalRows || 0) + ' x ' + (project?.pilesPerRow || 0) + ' rectangle - the default until a CSV is imported or a pile is added below.') + '</p></div>' +
              '</div>';

            const preview = state.pileCsvPreview;
            const importCard = !canEdit ? '' : '<div class="card rounded-xl p-4 space-y-3">' +
              '<div class="flex items-center justify-between"><h3 class="font-display font-semibold text-white text-sm">Import from CSV</h3>' +
              '<button onclick="downloadPileCsvTemplate()" class="text-xs text-amber-400 hover:text-amber-300 flex items-center gap-1">' + icon('download', 'w-3.5 h-3.5') + ' Download template</button></div>' +
              '<p class="text-xs text-slate-500">Columns: row, position, zone, pileType, color, skip, lat, lng, notes, pileId. Only row and position are required - pileType is matched by label against ' + (activeProfile ? '"' + activeProfile.name + '"' : 'the project\\'s racking profile') + '; mark a gap or obstacle with skip=true.</p>' +
              '<input type="file" id="pileCsvInput" accept=".csv,text/csv" class="hidden" onchange="handlePileCsvSelect(event)">' +
              '<button onclick="triggerPileCsvInput()" class="px-3 py-2 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-lg text-xs font-medium flex items-center gap-1.5">' + icon('upload', 'w-3.5 h-3.5') + ' Choose CSV file</button>' +
              (preview ? (
                '<div class="border-t border-slate-700/50 pt-3 space-y-2">' +
                '<p class="text-xs text-slate-400"><span class="text-white font-medium">' + preview.fileName + '</span> - ' + preview.rows.length + ' pile' + (preview.rows.length === 1 ? '' : 's') + ' ready to import' + (preview.warnings.length > 0 ? ', ' + preview.warnings.length + ' warning' + (preview.warnings.length === 1 ? '' : 's') : '') + '.</p>' +
                (preview.warnings.length > 0 ? '<div class="max-h-28 overflow-y-auto space-y-1">' + preview.warnings.slice(0, 15).map(function(w) { return '<p class="text-xs text-amber-400/90">' + w + '</p>'; }).join('') + (preview.warnings.length > 15 ? '<p class="text-xs text-slate-500">+ ' + (preview.warnings.length - 15) + ' more</p>' : '') + '</div>' : '') +
                (preview.rows.length > 0 ? '<div class="max-h-40 overflow-y-auto rounded-lg border border-slate-700/50"><table class="w-full text-xs"><thead class="bg-slate-800/70 text-slate-400"><tr><th class="text-left px-2 py-1.5">Pile</th><th class="text-left px-2 py-1.5">Zone</th><th class="text-left px-2 py-1.5">Type</th><th class="text-left px-2 py-1.5">Skip</th></tr></thead><tbody>' +
                  preview.rows.slice(0, 25).map(function(r) { return '<tr class="border-t border-slate-800"><td class="px-2 py-1 text-slate-300">' + r.pileId + '</td><td class="px-2 py-1 text-slate-400">' + (r.zone || '-') + '</td><td class="px-2 py-1 text-slate-400">' + (r.pileType ? (typeLabels[r.pileType] || r.pileType) : (r.typeLabelRaw || '-')) + '</td><td class="px-2 py-1 text-slate-400">' + (r.skip ? 'Yes' : '') + '</td></tr>'; }).join('') +
                '</tbody></table>' + (preview.rows.length > 25 ? '<p class="text-xs text-slate-500 px-2 py-1.5">+ ' + (preview.rows.length - 25) + ' more row' + (preview.rows.length - 25 === 1 ? '' : 's') + ' not shown</p>' : '') + '</div>' : '') +
                '<div class="flex gap-2 pt-1">' +
                  '<button onclick="cancelPileCsvImport()" class="flex-1 py-2 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-lg text-sm font-medium">Cancel</button>' +
                  (preview.rows.length > 0 ? '<button onclick="confirmPileCsvImport()" class="flex-1 py-2 bg-amber-500 hover:bg-amber-400 text-black rounded-lg text-sm font-semibold">Import ' + preview.rows.length + ' pile' + (preview.rows.length === 1 ? '' : 's') + '</button>' : '') +
                '</div>' +
                '</div>'
              ) : '') +
              '</div>';

            const byRow = {};
            state.piles.forEach(function(p) { (byRow[p.row] = byRow[p.row] || []).push(p); });
            const rowNums = Object.keys(byRow).map(Number).sort(function(a, b) { return a - b; });
            const manualCard = !canEdit ? '' : '<div class="card rounded-xl p-4 space-y-3">' +
              '<div class="flex items-center justify-between"><h3 class="font-display font-semibold text-white text-sm">Piles (' + state.piles.length + ')</h3>' +
              '<button onclick="openPileModal(null)" class="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-black rounded-lg font-medium text-xs flex items-center gap-1">' + icon('plus', 'w-3.5 h-3.5') + ' Add Pile</button></div>' +
              (state.piles.length === 0 ? '<p class="text-sm text-slate-500 text-center py-6">No custom piles yet. Import a CSV above or add piles one at a time.</p>' :
                '<div class="max-h-96 overflow-y-auto rounded-lg border border-slate-700/50"><table class="w-full text-xs"><thead class="bg-slate-800/70 text-slate-400 sticky top-0"><tr><th class="text-left px-2 py-1.5">Row</th><th class="text-left px-2 py-1.5">Pile</th><th class="text-left px-2 py-1.5">Zone</th><th class="text-left px-2 py-1.5">Type</th><th class="text-left px-2 py-1.5">Skip</th><th class="text-right px-2 py-1.5">Actions</th></tr></thead><tbody>' +
                rowNums.map(function(rowNum) {
                  return byRow[rowNum].sort(function(a, b) { return a.position - b.position; }).map(function(p) {
                    return '<tr class="border-t border-slate-800' + (p.skip ? ' opacity-50' : '') + '"><td class="px-2 py-1.5 text-slate-400">' + rowNum + '</td><td class="px-2 py-1.5 text-slate-200 font-mono">' + p.pileId + '</td><td class="px-2 py-1.5 text-slate-400">' + (p.zone || '-') + '</td><td class="px-2 py-1.5 text-slate-400">' + (p.pileType && typeLabels[p.pileType] ? typeLabels[p.pileType] : '-') + '</td><td class="px-2 py-1.5 text-slate-400">' + (p.skip ? 'Yes' : '') + '</td><td class="px-2 py-1.5 text-right"><button onclick="openPileModal(\\'' + p.pileId + '\\')" class="text-slate-400 hover:text-white p-1">' + icon('pencil', 'w-3.5 h-3.5') + '</button><button onclick="deletePileRow(\\'' + p.pileId + '\\')" class="text-red-400 hover:text-red-300 p-1">' + icon('trash-2', 'w-3.5 h-3.5') + '</button></td></tr>';
                  }).join('');
                }).join('')
              + '</tbody></table></div>') +
              '</div>';

            const dangerCard = (canClear && isCustom) ? '<div class="card rounded-xl p-4 border-red-500/30 space-y-2">' +
              '<h3 class="font-display font-semibold text-red-400 text-sm">Danger Zone</h3>' +
              '<p class="text-xs text-slate-500">Deletes every custom pile record for this project and reverts the Pile Map back to the standard procedural grid.</p>' +
              '<button onclick="clearCustomLayout()" class="px-3 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 rounded-lg text-xs font-medium flex items-center gap-1.5">' + icon('trash-2', 'w-3.5 h-3.5') + ' Clear custom layout</button>' +
              '</div>' : '';

            return '<div class="space-y-4 max-w-3xl">' +
              '<p class="text-sm text-slate-400">Import or edit the real pile-by-pile layout so the Pile Map and QC tolerances follow the actual site, gaps included.</p>' +
              statusBanner + importCard + manualCard + dangerCard +
              renderPileEditModal(typeOptions) +
            '</div>';
          }

          // INSPECTION - WITH PHOTO CAPTURE
          function renderInspection() {
            const pid = getPileId(state.currentRow, state.currentPile);
            // Reference-only: shows the project's active racking profile
            // tolerance next to the measurement inputs so the inspector can
            // see the target while entering readings. This does not
            // validate or change the Pass/Fail logic - that stays a manual
            // call either way.
            const activeProfile = state.rackingProfiles.find(function(r) { return r.id === state.currentProject?.rackingProfileId; });
            const activeTypes = (activeProfile && Array.isArray(activeProfile.pileTypeSpecs)) ? activeProfile.pileTypeSpecs : [];
            const selectedType = activeTypes.find(function(t) { return t.id === state.inspectionPileType; });
            const selTol = selectedType ? (selectedType.tolerances || {}) : null;
            const detailedPanel = state.inspectionMode === 'detailed' ? (
              '<div class="card rounded-xl p-4 mb-3"><h3 class="font-display font-semibold text-white text-sm mb-3">Detailed Measurements</h3>' +
              (!activeProfile ? '<p class="text-xs text-slate-500 mb-3">No racking profile set for this project (set one in Settings → Projects)</p>' :
                activeTypes.length === 0 ? '<p class="text-xs text-amber-400/80 mb-3">' + activeProfile.name + ' has no pile types configured yet (Settings → Racking).</p>' :
                '<label class="text-xs text-slate-500 mb-1 block">Pile Type (' + activeProfile.name + ')</label>' +
                '<select id="inspPileTypeInput" onchange="state.inspectionPileType=this.value; render();" class="w-full bg-slate-800 border border-slate-700 rounded-lg px-2 py-2 text-white text-sm mb-2">' +
                  '<option value="">Select pile type...</option>' +
                  activeTypes.map(function(t) { return '<option value="' + t.id + '" ' + (state.inspectionPileType === t.id ? 'selected' : '') + '>' + (t.label || t.profile || 'Type') + '</option>'; }).join('') +
                '</select>' +
                (selTol ? '<p class="text-xs text-slate-500 mb-3">Target: ' + [
                  selTol.embedmentMinIn ? 'min embed ' + selTol.embedmentMinIn + '"' : null,
                  selTol.plumbMaxDeg ? 'max plumb ' + selTol.plumbMaxDeg + '°' : null,
                  selTol.twistMaxDeg ? 'max twist ' + selTol.twistMaxDeg + '°' : null,
                ].filter(Boolean).join(', ') + '</p>' : '<p class="text-xs text-slate-500 mb-3">Pick a pile type to see its tolerances.</p>')
              ) +
              '<div class="grid grid-cols-3 gap-3 mb-3">' +
              '<div><label class="text-xs text-slate-500 mb-1 block">Embedment (in)</label><input type="number" id="inspDepthInput" value="' + (state.inspectionDepth||'') + '" oninput="state.inspectionDepth=this.value" class="w-full bg-slate-800 border border-slate-700 rounded-lg px-2 py-2 text-white text-sm"></div>' +
              '<div><label class="text-xs text-slate-500 mb-1 block">Plumb N-S (°)</label><input type="number" step="0.1" id="inspPlumbNSInput" value="' + (state.inspectionPlumbNS||'') + '" oninput="state.inspectionPlumbNS=this.value" class="w-full bg-slate-800 border border-slate-700 rounded-lg px-2 py-2 text-white text-sm"></div>' +
              '<div><label class="text-xs text-slate-500 mb-1 block">Plumb E-W (°)</label><input type="number" step="0.1" id="inspPlumbEWInput" value="' + (state.inspectionPlumbEW||'') + '" oninput="state.inspectionPlumbEW=this.value" class="w-full bg-slate-800 border border-slate-700 rounded-lg px-2 py-2 text-white text-sm"></div>' +
              '</div>' +
              '<div class="grid grid-cols-2 gap-3 mb-3">' +
              '<div><label class="text-xs text-slate-500 mb-1 block">Reveal Height (in)</label><input type="number" step="0.1" id="inspHeightInput" value="' + (state.inspectionHeight||'') + '" oninput="state.inspectionHeight=this.value" class="w-full bg-slate-800 border border-slate-700 rounded-lg px-2 py-2 text-white text-sm"></div>' +
              '<div><label class="text-xs text-slate-500 mb-1 block">Twist (°)</label><input type="number" step="0.1" id="inspTwistInput" value="' + (state.inspectionTwist||'') + '" oninput="state.inspectionTwist=this.value" class="w-full bg-slate-800 border border-slate-700 rounded-lg px-2 py-2 text-white text-sm"></div>' +
              '</div>' +
              '<div class="grid grid-cols-2 gap-3 mb-3">' +
              '<div><label class="text-xs text-slate-500 mb-1 block">Spacing (± in)</label><input type="number" step="0.1" id="inspSpacingInput" value="' + (state.inspectionSpacing||'') + '" oninput="state.inspectionSpacing=this.value" class="w-full bg-slate-800 border border-slate-700 rounded-lg px-2 py-2 text-white text-sm"></div>' +
              '<div><label class="text-xs text-slate-500 mb-1 block">Alignment (± in)</label><input type="number" step="0.1" id="inspAlignmentInput" value="' + (state.inspectionAlignment||'') + '" oninput="state.inspectionAlignment=this.value" class="w-full bg-slate-800 border border-slate-700 rounded-lg px-2 py-2 text-white text-sm"></div>' +
              '</div>' +
              '<label class="text-xs text-slate-500 mb-1.5 block">Fail Reason (if failing)</label>' +
              '<div class="grid grid-cols-3 gap-2">' +
              ['plumb', 'twist', 'height', 'alignment', 'spacing', 'other'].map(function(r) {
                return '<button onclick="selectInspectionFailReason(\\'' + r + '\\')" class="reason-btn text-xs py-2 ' + (state.inspectionFailReason === r ? 'reason-btn-selected text-white' : 'text-slate-300') + '">' + r.charAt(0).toUpperCase() + r.slice(1) + '</button>';
              }).join('') +
              '</div></div>'
            ) : '';
            return '<div class="space-y-4 animate-fade-in max-w-lg mx-auto"><div class="flex items-center justify-between"><div><h1 class="font-display text-xl font-bold text-white">QC Inspection</h1></div><div class="flex items-center gap-2"><span class="badge-pass px-3 py-1.5 rounded-full text-sm">' + state.session.passed + ' Pass</span><span class="badge-fail px-3 py-1.5 rounded-full text-sm">' + state.session.failed + ' Fail</span></div></div><div class="flex gap-2"><button onclick="setInspectionMode(\\'quick\\')" class="mode-btn ' + (state.inspectionMode === 'quick' ? 'mode-btn-active' : 'mode-btn-inactive') + '">quick</button><button onclick="setInspectionMode(\\'detailed\\')" class="mode-btn ' + (state.inspectionMode === 'detailed' ? 'mode-btn-active' : 'mode-btn-inactive') + '">detailed</button></div><div class="pile-display p-6"><p class="text-xs text-slate-500 uppercase tracking-wider text-center mb-3">INSPECTING</p><div class="flex items-center justify-center gap-4 mb-4"><button onclick="decPile()" class="nav-arrow nav-arrow-large bg-slate-700 text-white">' + icon('chevron-left', 'w-8 h-8') + '</button><div class="flex-1 text-center"><span class="font-display text-5xl font-bold text-white">' + pid + '</span></div><button onclick="incPile()" class="nav-arrow nav-arrow-large bg-slate-700 text-white">' + icon('chevron-right', 'w-8 h-8') + '</button></div><div class="flex items-center justify-center gap-3"><button onclick="decRow()" class="nav-arrow nav-arrow-small bg-slate-700/50 text-slate-300">' + icon('chevron-left', 'w-5 h-5') + '</button><span class="text-sm text-slate-400 px-3">Row #' + state.currentRow + '</span><button onclick="incRow()" class="nav-arrow nav-arrow-small bg-slate-700/50 text-slate-300">' + icon('chevron-right', 'w-5 h-5') + '</button></div></div>' + detailedPanel + '<div class="grid grid-cols-2 gap-3"><button onclick="recordInspection(\\'pass\\')" class="btn-action bg-green-600 text-white flex flex-col items-center justify-center gap-2">' + icon('check-circle', 'w-12 h-12') + '<span>PASS</span></button><button onclick="recordInspection(\\'fail\\')" class="btn-action bg-red-600 text-white flex flex-col items-center justify-center gap-2">' + icon('x-circle', 'w-12 h-12') + '<span>FAIL</span></button></div><div class="border-t border-slate-700 pt-4 mt-4">' + renderPhotoCapture('inspection') + '</div></div>';
          }
          function incPile() { hapticFeedback(); if (state.currentPile < state.heatmap.pilesPerRow) state.currentPile++; syncInspectionPileTypeFromLayout(); render(); }
          function decPile() { hapticFeedback(); if (state.currentPile > 1) state.currentPile--; syncInspectionPileTypeFromLayout(); render(); }
          function incRow() { hapticFeedback(); if (state.currentRow < state.heatmap.totalRows) state.currentRow++; syncInspectionPileTypeFromLayout(); render(); }
          function decRow() { hapticFeedback(); if (state.currentRow > 1) state.currentRow--; syncInspectionPileTypeFromLayout(); render(); }
          function setInspectionMode(mode) { state.inspectionMode = mode; render(); }
          function selectInspectionFailReason(reason) { hapticFeedback(); state.inspectionFailReason = state.inspectionFailReason === reason ? null : reason; render(); }
          function recordInspection(status) {
            hapticFeedback();
            playSound(status);
            const photos = state.inspectionPhotos;
            const pileId = getPileId(state.currentRow, state.currentPile);
            // In detailed mode, pick up the depth/plumb measurement inputs -
            // these existed on the API and database already, but the form
            // never rendered or collected them, so every inspection saved
            // depth/plumbNS/plumbEW/failReason as null regardless of mode.
            // Read from state (kept in sync via each input's oninput), not
            // the DOM directly - selecting a fail reason re-renders this
            // panel, which would otherwise wipe whatever was typed.
            const depthVal = state.inspectionMode === 'detailed' ? state.inspectionDepth : '';
            const plumbNSVal = state.inspectionMode === 'detailed' ? state.inspectionPlumbNS : '';
            const plumbEWVal = state.inspectionMode === 'detailed' ? state.inspectionPlumbEW : '';
            const heightVal = state.inspectionMode === 'detailed' ? state.inspectionHeight : '';
            const twistVal = state.inspectionMode === 'detailed' ? state.inspectionTwist : '';
            const spacingVal = state.inspectionMode === 'detailed' ? state.inspectionSpacing : '';
            const alignmentVal = state.inspectionMode === 'detailed' ? state.inspectionAlignment : '';
            const inspection = {
              pileId,
              status,
              timestamp: Date.now(),
              user: state.currentUser.name,
              depth: depthVal ? parseInt(depthVal, 10) : null,
              plumbNS: plumbNSVal ? parseFloat(plumbNSVal) : null,
              plumbEW: plumbEWVal ? parseFloat(plumbEWVal) : null,
              pileType: state.inspectionMode === 'detailed' ? (state.inspectionPileType || null) : null,
              heightIn: heightVal ? parseFloat(heightVal) : null,
              twistDeg: twistVal ? parseFloat(twistVal) : null,
              spacingIn: spacingVal ? parseFloat(spacingVal) : null,
              alignmentIn: alignmentVal ? parseFloat(alignmentVal) : null,
              failReason: status === 'fail' ? state.inspectionFailReason : null
            };
            // Replace, don't append: an earlier local record for this pile
            // (from initial load, or an earlier reinspect this session)
            // would otherwise leave two entries for the same pile, and
            // Array.find() always finds the OLDER one - the pile would
            // keep showing its previous status forever.
            const existingIdx = state.inspections.findIndex(i => i.pileId === pileId);
            const prevStatus = existingIdx >= 0 ? state.inspections[existingIdx].status : null;
            if (existingIdx >= 0) state.inspections[existingIdx] = inspection; else state.inspections.push(inspection);
            // Keep the project's cached pass/fail counts in sync with what
            // actually changed - mirrors the server-side logic in
            // /api/inspections, so a reinspect moves a pile between
            // buckets instead of counting it twice.
            if (state.currentProject) {
              if (prevStatus === 'pass') state.currentProject.passedInspections = Math.max(0, (state.currentProject.passedInspections || 0) - 1);
              else if (prevStatus === 'fail') state.currentProject.failedInspections = Math.max(0, (state.currentProject.failedInspections || 0) - 1);
              if (status === 'pass') state.currentProject.passedInspections = (state.currentProject.passedInspections || 0) + 1;
              else if (status === 'fail') state.currentProject.failedInspections = (state.currentProject.failedInspections || 0) + 1;
            }
            state.session[status === 'pass' ? 'passed' : 'failed']++;
            if (state.currentPile < state.heatmap.pilesPerRow) state.currentPile++;
            state.inspectionPhotos = [];
            state.inspectionFailReason = null;
            state.inspectionDepth = '';
            state.inspectionPlumbNS = '';
            state.inspectionPlumbEW = '';
            state.inspectionPileType = '';
            state.inspectionHeight = '';
            state.inspectionTwist = '';
            state.inspectionSpacing = '';
            state.inspectionAlignment = '';
            render();
            // Save to database
            saveInspection(inspection, photos);
          }
          
          // API FUNCTIONS - DATA PERSISTENCE
          async function seedDatabase() {
            try {
              const res = await fetch('/api/seed', { method: 'POST' });
              const data = await res.json();
              if (data.success) console.log('Database seeded:', data.stats);
            } catch (e) { console.error('Seed error:', e); }
            await loadProjectData();
          }

          // Loads inspections, refusals, and production entries for the
          // CURRENT project only, clearing whatever was loaded before.
          // Called on boot and whenever the active project changes -
          // without the clear+reload, switching projects left the
          // previous project's piles/refusals/production numbers showing
          // under the new one, since none of those arrays were ever
          // filtered by project on the client.
          async function loadProjectData() {
            state.inspections = [];
            state.refusals = [];
            state.production = [];
            state.delays = [];
            state.punchItems = [];
            state.toolboxTalks = [];
            state.safetyObservations = [];
            state.safetyIncidents = [];
            state.milestones = [];
            state.documents = [];
            state.cois = [];
            state.materials = [];
            state.deliveries = [];
            state.rfis = [];
            state.submittals = [];
            state.piles = [];
            await Promise.all([
              loadInspections(), loadRefusals(), loadProduction(), loadDelays(), loadPunchItems(),
              loadToolboxTalks(), loadSafetyObservations(), loadSafetyIncidents(),
              loadMilestones(), loadDocuments(), loadCois(), loadMaterials(), loadDeliveries(),
              loadRfis(), loadSubmittals(), loadPiles()
            ]);
            render();
          }
          async function loadPiles() {
            try {
              const projectId = state.currentProject?.id || 'proj_001';
              const res = await fetch('/api/piles?projectId=' + projectId);
              const data = await res.json();
              if (Array.isArray(data)) { state.piles = data; render(); }
            } catch (e) { console.error('Load piles error:', e); }
          }

          async function loadToolboxTalks() {
            try {
              const projectId = state.currentProject?.id || 'proj_001';
              const res = await fetch('/api/safety/toolbox-talks?projectId=' + projectId);
              const data = await res.json();
              if (Array.isArray(data)) { state.toolboxTalks = data; render(); }
            } catch (e) { console.error('Load toolbox talks error:', e); }
          }
          async function loadSafetyObservations() {
            try {
              const projectId = state.currentProject?.id || 'proj_001';
              const res = await fetch('/api/safety/observations?projectId=' + projectId);
              const data = await res.json();
              if (Array.isArray(data)) { state.safetyObservations = data; render(); }
            } catch (e) { console.error('Load safety observations error:', e); }
          }
          async function loadSafetyIncidents() {
            try {
              const projectId = state.currentProject?.id || 'proj_001';
              const res = await fetch('/api/safety/incidents?projectId=' + projectId);
              const data = await res.json();
              if (Array.isArray(data)) { state.safetyIncidents = data; render(); }
            } catch (e) { console.error('Load safety incidents error:', e); }
          }
          async function loadMilestones() {
            try {
              const projectId = state.currentProject?.id || 'proj_001';
              const res = await fetch('/api/milestones?projectId=' + projectId);
              const data = await res.json();
              if (Array.isArray(data)) { state.milestones = data; render(); }
            } catch (e) { console.error('Load milestones error:', e); }
          }
          async function loadDocuments() {
            try {
              const projectId = state.currentProject?.id || 'proj_001';
              const res = await fetch('/api/documents?projectId=' + projectId);
              const data = await res.json();
              if (Array.isArray(data)) { state.documents = data; render(); }
            } catch (e) { console.error('Load documents error:', e); }
          }
          async function loadCois() {
            try {
              const projectId = state.currentProject?.id || 'proj_001';
              const res = await fetch('/api/coi?projectId=' + projectId);
              const data = await res.json();
              if (Array.isArray(data)) { state.cois = data; render(); }
            } catch (e) { console.error('Load COIs error:', e); }
          }
          async function loadMaterials() {
            try {
              const projectId = state.currentProject?.id || 'proj_001';
              const res = await fetch('/api/materials?projectId=' + projectId);
              const data = await res.json();
              if (Array.isArray(data)) { state.materials = data; render(); }
            } catch (e) { console.error('Load materials error:', e); }
          }
          async function loadDeliveries() {
            try {
              const projectId = state.currentProject?.id || 'proj_001';
              const res = await fetch('/api/deliveries?projectId=' + projectId);
              const data = await res.json();
              if (Array.isArray(data)) { state.deliveries = data; render(); }
            } catch (e) { console.error('Load deliveries error:', e); }
          }
          async function loadRfis() {
            try {
              const projectId = state.currentProject?.id || 'proj_001';
              const res = await fetch('/api/rfis?projectId=' + projectId);
              const data = await res.json();
              if (Array.isArray(data)) { state.rfis = data; render(); }
            } catch (e) { console.error('Load RFIs error:', e); }
          }
          async function loadSubmittals() {
            try {
              const projectId = state.currentProject?.id || 'proj_001';
              const res = await fetch('/api/submittals?projectId=' + projectId);
              const data = await res.json();
              if (Array.isArray(data)) { state.submittals = data; render(); }
            } catch (e) { console.error('Load submittals error:', e); }
          }

          // SAFETY - toolbox talks, observations, and incidents. Three
          // sub-tabs on one screen, same shape as the Analytics tabs.
          function renderSafety() {
            const tabs = [
              { id: 'talks', label: 'Toolbox Talks' },
              { id: 'observations', label: 'Observations' },
              { id: 'incidents', label: 'Incidents' }
            ];
            const sortedIncidents = state.safetyIncidents.slice().sort(function(a, b) { return new Date(b.createdAt) - new Date(a.createdAt); });
            const daysSinceIncident = sortedIncidents.length > 0 ? Math.floor((Date.now() - new Date(sortedIncidents[0].createdAt).getTime()) / 86400000) : null;
            const now = new Date();
            const thisMonthTalks = state.toolboxTalks.filter(function(t) { const d = new Date(t.date); return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear(); }).length;
            const thisMonthObs = state.safetyObservations.filter(function(o) { const d = new Date(o.createdAt); return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear(); }).length;
            const openIncidents = state.safetyIncidents.filter(function(i) { return i.status !== 'closed'; }).length;

            const statRow = '<div class="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">' +
              '<div class="card rounded-xl p-4"><p class="text-xs text-slate-500 uppercase mb-1">Days Since Last Incident</p><p class="text-2xl font-display font-bold ' + (daysSinceIncident === null ? 'text-slate-500' : 'text-emerald-400') + '">' + (daysSinceIncident === null ? '—' : daysSinceIncident) + '</p></div>' +
              '<div class="card rounded-xl p-4"><p class="text-xs text-slate-500 uppercase mb-1">Talks This Month</p><p class="text-2xl font-display font-bold text-white">' + thisMonthTalks + '</p></div>' +
              '<div class="card rounded-xl p-4"><p class="text-xs text-slate-500 uppercase mb-1">Observations This Month</p><p class="text-2xl font-display font-bold text-white">' + thisMonthObs + '</p></div>' +
              '<div class="card rounded-xl p-4"><p class="text-xs text-slate-500 uppercase mb-1">Open Corrective Actions</p><p class="text-2xl font-display font-bold ' + (openIncidents > 0 ? 'text-amber-400' : 'text-white') + '">' + openIncidents + '</p></div>' +
            '</div>';

            const tabBar = '<div class="flex gap-2 mb-4 flex-wrap">' + tabs.map(function(t) { return '<button onclick="setSafetyTab(\\'' + t.id + '\\')" class="mode-btn ' + (state.safetyTab === t.id ? 'mode-btn-active' : 'mode-btn-inactive') + '">' + t.label + '</button>'; }).join('') + '</div>';

            const body = state.safetyTab === 'talks' ? renderToolboxTalksTab() : state.safetyTab === 'observations' ? renderObservationsTab() : renderIncidentsTab();

            return '<div class="space-y-4 animate-fade-in max-w-2xl mx-auto">' +
              '<div class="flex items-center justify-between"><h1 class="font-display text-xl font-bold text-white">Safety</h1></div>' +
              statRow + tabBar + body +
            '</div>';
          }
          function setSafetyTab(tab) { state.safetyTab = tab; render(); }

          function renderToolboxTalksTab() {
            const talks = state.toolboxTalks;
            return '<div class="card rounded-xl p-5 space-y-3 mb-4">' +
              '<h3 class="font-display font-semibold text-white text-sm">Log a Toolbox Talk</h3>' +
              '<div><label class="text-xs text-slate-500 mb-1 block">Topic</label><input type="text" value="' + (state.talkTopic || '') + '" oninput="state.talkTopic=this.value" placeholder="e.g. Ladder Safety" class="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm"></div>' +
              '<div class="grid grid-cols-2 gap-3">' +
                '<div><label class="text-xs text-slate-500 mb-1 block">Conducted By</label><input type="text" value="' + (state.talkConductedBy || '') + '" oninput="state.talkConductedBy=this.value" placeholder="' + (state.currentUser.name || '') + '" class="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm"></div>' +
                '<div><label class="text-xs text-slate-500 mb-1 block">Crew</label><select oninput="state.talkCrewName=this.value" class="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm"><option value="">—</option>' + state.crews.map(function(c) { return '<option value="' + c.name + '"' + (state.talkCrewName === c.name ? ' selected' : '') + '>' + c.name + '</option>'; }).join('') + '</select></div>' +
              '</div>' +
              '<div><label class="text-xs text-slate-500 mb-1 block">Attendees</label><input type="number" min="0" value="' + (state.talkAttendeeCount || '') + '" oninput="state.talkAttendeeCount=this.value" class="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm"></div>' +
              '<div><label class="text-xs text-slate-500 mb-1 block">Notes</label><textarea rows="2" oninput="state.talkNotes=this.value" class="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm resize-none">' + (state.talkNotes || '') + '</textarea></div>' +
              '<button onclick="submitToolboxTalk()" class="w-full py-3 bg-amber-500 hover:bg-amber-400 text-black rounded-xl font-bold">Log Talk</button>' +
            '</div>' +
            '<div class="space-y-2">' + (talks.length > 0 ? talks.map(function(t) {
              return '<div class="card rounded-xl p-4 flex items-center justify-between"><div><p class="text-sm font-medium text-white">' + t.topic + '</p><p class="text-xs text-slate-500">' + (t.conductedBy || '') + (t.crewName ? ' · ' + t.crewName : '') + ' · ' + t.attendeeCount + ' attendees</p></div><span class="text-xs text-slate-500">' + formatDate(t.date) + '</span></div>';
            }).join('') : '<p class="text-sm text-slate-500">No toolbox talks logged yet.</p>') + '</div>';
          }
          function submitToolboxTalk() {
            hapticFeedback();
            const conductedBy = state.talkConductedBy || state.currentUser.name;
            if (!state.talkTopic || !state.talkTopic.trim() || !conductedBy) { alert('Enter a topic and who conducted it.'); return; }
            const talk = { topic: state.talkTopic.trim(), conductedBy: conductedBy, crewName: state.talkCrewName || null, attendeeCount: state.talkAttendeeCount ? parseInt(state.talkAttendeeCount) : 0, notes: state.talkNotes || null, date: new Date().toISOString() };
            state.toolboxTalks.unshift(talk);
            state.talkTopic = ''; state.talkNotes = ''; state.talkAttendeeCount = ''; state.talkCrewName = '';
            render();
            saveToolboxTalk(talk);
          }
          async function saveToolboxTalk(talk) {
            try {
              const projectId = state.currentProject?.id || 'proj_001';
              await fetch('/api/safety/toolbox-talks', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ projectId, topic: talk.topic, conductedBy: talk.conductedBy, crewName: talk.crewName, attendeeCount: talk.attendeeCount, notes: talk.notes, loggedBy: state.currentUser.id }) });
            } catch (e) { console.error('Save toolbox talk error:', e); }
          }

          function renderObservationsTab() {
            const categories = [
              { id: 'ppe', label: 'PPE' },
              { id: 'housekeeping', label: 'Housekeeping' },
              { id: 'fall_protection', label: 'Fall Protection' },
              { id: 'equipment', label: 'Equipment' },
              { id: 'other', label: 'Other' }
            ];
            const obs = state.safetyObservations;
            return '<div class="card rounded-xl p-5 space-y-3 mb-4">' +
              '<h3 class="font-display font-semibold text-white text-sm">New Observation</h3>' +
              '<div class="grid grid-cols-2 gap-2">' +
                '<button onclick="setObsType(\\'positive\\')" class="mode-btn ' + (state.obsType === 'positive' ? 'mode-btn-active' : 'mode-btn-inactive') + '">Positive</button>' +
                '<button onclick="setObsType(\\'at_risk\\')" class="mode-btn ' + (state.obsType === 'at_risk' ? 'mode-btn-active' : 'mode-btn-inactive') + '">At-Risk</button>' +
              '</div>' +
              '<div class="grid grid-cols-3 gap-2">' + categories.map(function(c) { return '<button onclick="setObsCategory(\\'' + c.id + '\\')" class="reason-btn ' + (state.obsCategory === c.id ? 'reason-btn-selected' : '') + '"><span class="text-xs text-white">' + c.label + '</span></button>'; }).join('') + '</div>' +
              '<div><label class="text-xs text-slate-500 mb-1 block">Location</label><input type="text" value="' + (state.obsLocation || '') + '" oninput="state.obsLocation=this.value" placeholder="e.g. Row 12" class="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm"></div>' +
              '<div><label class="text-xs text-slate-500 mb-1 block">Description</label><textarea rows="2" oninput="state.obsDescription=this.value" class="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm resize-none">' + (state.obsDescription || '') + '</textarea></div>' +
              renderPhotoCapture('safety-obs') +
              '<button onclick="submitObservation()" class="w-full py-3 bg-amber-500 hover:bg-amber-400 text-black rounded-xl font-bold">Log Observation</button>' +
            '</div>' +
            '<div class="space-y-2">' + (obs.length > 0 ? obs.map(function(o) {
              return '<div class="card rounded-xl p-4"><div class="flex items-start justify-between gap-3"><div><p class="text-sm font-medium text-white">' + o.description + '</p><p class="text-xs text-slate-500 capitalize">' + o.category.replace(/_/g, ' ') + (o.location ? ' · ' + o.location : '') + ' · ' + o.reportedBy + ' · ' + formatDate(o.createdAt) + '</p></div><span class="badge-pill ' + (o.type === 'positive' ? 'badge-pass' : 'badge-fail') + ' text-[10px] px-2 py-1 rounded-full flex-shrink-0">' + (o.type === 'positive' ? 'Positive' : 'At-Risk') + '</span></div></div>';
            }).join('') : '<p class="text-sm text-slate-500">No observations logged yet.</p>') + '</div>';
          }
          function setObsType(type) { hapticFeedback(); state.obsType = type; render(); }
          function setObsCategory(cat) { hapticFeedback(); state.obsCategory = cat; render(); }
          function submitObservation() {
            hapticFeedback();
            if (!state.obsCategory || !state.obsDescription || !state.obsDescription.trim()) { alert('Pick a category and describe what you saw.'); return; }
            const localPhotos = state.obsPhotos.map(function(p) { return { url: p.url, timestamp: p.timestamp, gps: p.gps }; });
            const obs = { id: 'local_' + Date.now(), type: state.obsType, category: state.obsCategory, location: state.obsLocation || null, description: state.obsDescription.trim(), photos: localPhotos, reportedBy: state.currentUser.name, createdAt: new Date().toISOString() };
            state.safetyObservations.unshift(obs);
            const photosToUpload = state.obsPhotos;
            state.obsCategory = null; state.obsLocation = ''; state.obsDescription = ''; state.obsPhotos = [];
            render();
            saveObservation(obs, photosToUpload);
          }
          async function saveObservation(obs, photosToUpload) {
            try {
              const projectId = state.currentProject?.id || 'proj_001';
              const uploadedPhotos = await uploadPendingPhotos(photosToUpload, 'safety', null);
              const res = await fetch('/api/safety/observations', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ projectId, type: obs.type, category: obs.category, location: obs.location, description: obs.description, photos: uploadedPhotos, reportedBy: state.currentUser.id }) });
              const created = await res.json();
              if (created && created.id) { const idx = state.safetyObservations.findIndex(function(o) { return o.id === obs.id; }); if (idx >= 0) { state.safetyObservations[idx].id = created.id; render(); } }
            } catch (e) { console.error('Save observation error:', e); }
          }

          function renderIncidentsTab() {
            const severities = [
              { id: 'near_miss', label: 'Near-Miss', hex: '#3b82f6' },
              { id: 'minor', label: 'Minor', hex: '#eab308' },
              { id: 'recordable', label: 'Recordable', hex: '#ef4444' }
            ];
            const sevMap = {}; severities.forEach(function(s) { sevMap[s.id] = s; });
            const incidents = state.safetyIncidents;
            return '<div class="card rounded-xl p-5 space-y-3 mb-4">' +
              '<h3 class="font-display font-semibold text-white text-sm">Report an Incident</h3>' +
              '<div class="grid grid-cols-3 gap-2">' + severities.map(function(s) { return '<button onclick="setIncidentSeverity(\\'' + s.id + '\\')" class="reason-btn ' + (state.incidentSeverity === s.id ? 'reason-btn-selected' : '') + '"><span class="text-xs text-white">' + s.label + '</span></button>'; }).join('') + '</div>' +
              '<div><label class="text-xs text-slate-500 mb-1 block">What happened</label><textarea rows="2" oninput="state.incidentDescription=this.value" class="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm resize-none">' + (state.incidentDescription || '') + '</textarea></div>' +
              '<div><label class="text-xs text-slate-500 mb-1 block">Corrective Action (optional)</label><textarea rows="2" oninput="state.incidentCorrectiveAction=this.value" class="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm resize-none">' + (state.incidentCorrectiveAction || '') + '</textarea></div>' +
              renderPhotoCapture('safety-incident') +
              '<button onclick="submitIncident()" class="w-full py-3 bg-amber-500 hover:bg-amber-400 text-black rounded-xl font-bold">Report Incident</button>' +
            '</div>' +
            '<div class="space-y-2">' + (incidents.length > 0 ? incidents.map(function(i) {
              const sev = sevMap[i.severity] || { label: i.severity, hex: '#64748b' };
              return '<div class="card rounded-xl p-4"><div class="flex items-start justify-between gap-3"><div class="flex-1 min-w-0"><p class="text-sm font-medium text-white">' + i.description + '</p>' + (i.correctiveAction ? '<p class="text-xs text-slate-400 mt-1">Corrective action: ' + i.correctiveAction + '</p>' : '') + '<p class="text-xs text-slate-500 mt-1">' + i.reportedBy + ' · ' + formatDate(i.createdAt) + '</p></div><div class="flex flex-col items-end gap-2 flex-shrink-0">' + statusBadge(sev.label, sev.hex) + (i.status === 'closed' ? '<span class="text-xs text-emerald-400">Closed</span>' : '<button onclick="closeIncident(\\'' + i.id + '\\')" class="text-xs text-amber-400 hover:text-amber-300">Close out</button>') + '</div></div></div>';
            }).join('') : '<p class="text-sm text-slate-500">No incidents reported. Nice work.</p>') + '</div>';
          }
          function setIncidentSeverity(s) { hapticFeedback(); state.incidentSeverity = s; render(); }
          function submitIncident() {
            hapticFeedback();
            if (!state.incidentSeverity || !state.incidentDescription || !state.incidentDescription.trim()) { alert('Pick a severity and describe what happened.'); return; }
            const localPhotos = state.incidentPhotos.map(function(p) { return { url: p.url, timestamp: p.timestamp, gps: p.gps }; });
            const incident = { id: 'local_' + Date.now(), severity: state.incidentSeverity, description: state.incidentDescription.trim(), correctiveAction: state.incidentCorrectiveAction || null, status: 'open', photos: localPhotos, resolvedAt: null, reportedBy: state.currentUser.name, createdAt: new Date().toISOString() };
            state.safetyIncidents.unshift(incident);
            const photosToUpload = state.incidentPhotos;
            state.incidentSeverity = null; state.incidentDescription = ''; state.incidentCorrectiveAction = ''; state.incidentPhotos = [];
            render();
            saveIncident(incident, photosToUpload);
          }
          async function saveIncident(incident, photosToUpload) {
            try {
              const projectId = state.currentProject?.id || 'proj_001';
              const uploadedPhotos = await uploadPendingPhotos(photosToUpload, 'safety', null);
              const res = await fetch('/api/safety/incidents', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ projectId, severity: incident.severity, description: incident.description, correctiveAction: incident.correctiveAction, photos: uploadedPhotos, reportedBy: state.currentUser.id }) });
              const created = await res.json();
              if (created && created.id) { const idx = state.safetyIncidents.findIndex(function(i) { return i.id === incident.id; }); if (idx >= 0) { state.safetyIncidents[idx].id = created.id; render(); } }
            } catch (e) { console.error('Save incident error:', e); }
          }
          function closeIncident(id) {
            hapticFeedback();
            const idx = state.safetyIncidents.findIndex(function(i) { return i.id === id; });
            if (idx < 0) return;
            state.safetyIncidents[idx].status = 'closed';
            state.safetyIncidents[idx].resolvedAt = new Date().toISOString();
            render();
            const projectId = state.currentProject?.id || 'proj_001';
            fetch('/api/safety/incidents', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: id, projectId: projectId, status: 'closed' }) }).catch(function(e) { console.error('Close incident error:', e); });
          }

          // SCHEDULE - planned vs. actual milestones. Pile Driving's percent
          // is derived live from the project's real installed/total pile
          // counts (same source of truth as everywhere else) rather than
          // typed in by hand; every other phase tracks percentComplete
          // directly.
          function renderSchedule() {
            const milestones = state.milestones.slice().sort(function(a, b) { return (a.sortOrder || 0) - (b.sortOrder || 0); });
            const statusHex = { on_track: '#22c55e', at_risk: '#eab308', delayed: '#ef4444', complete: '#22c55e', not_started: '#64748b' };
            const statusLabel = { on_track: 'On Track', at_risk: 'At Risk', delayed: 'Delayed', complete: 'Complete', not_started: 'Not Started' };

            function effectivePercent(m) {
              if (m.phase && m.phase.trim().toLowerCase() === 'pile driving' && state.currentProject && state.currentProject.totalPiles) {
                return Math.round(100 * (state.currentProject.installedPiles || 0) / state.currentProject.totalPiles);
              }
              return m.percentComplete || 0;
            }

            const dates = [];
            milestones.forEach(function(m) { if (m.plannedStart) dates.push(new Date(m.plannedStart).getTime()); if (m.plannedEnd) dates.push(new Date(m.plannedEnd).getTime()); });
            const rangeStart = dates.length ? Math.min.apply(null, dates) : Date.now();
            const rangeEnd = dates.length ? Math.max.apply(null, dates) : Date.now() + 86400000 * 90;
            const rangeSpan = Math.max(1, rangeEnd - rangeStart);
            function pct(dateStr) { if (!dateStr) return null; return Math.max(0, Math.min(100, ((new Date(dateStr).getTime() - rangeStart) / rangeSpan) * 100)); }

            const gantt = milestones.length > 0 ? '<div class="card rounded-xl p-5 mb-4 space-y-3">' + milestones.map(function(m) {
              const plannedLeft = pct(m.plannedStart), plannedRight = pct(m.plannedEnd);
              const hasPlanned = plannedLeft !== null && plannedRight !== null;
              const percent = effectivePercent(m);
              const barColor = statusHex[m.status] || '#64748b';
              return '<div class="grid grid-cols-[110px_1fr] items-center gap-3">' +
                '<div class="min-w-0"><p class="text-xs font-semibold text-white truncate">' + m.phase + '</p><p class="text-[10px] text-slate-500">' + percent + '%</p></div>' +
                '<div class="relative h-4 bg-slate-900 rounded-md overflow-hidden">' +
                  (hasPlanned ? '<div class="absolute top-0 bottom-0 rounded-md" style="left:' + plannedLeft + '%;width:' + Math.max(2, plannedRight - plannedLeft) + '%;background:rgba(148,163,184,0.18);border:1px dashed rgba(148,163,184,0.4);"></div>' : '') +
                  (hasPlanned ? '<div class="absolute top-0 bottom-0 rounded-md" style="left:' + plannedLeft + '%;width:' + Math.max(2, (plannedRight - plannedLeft) * (percent / 100)) + '%;background:' + barColor + ';"></div>' : '') +
                '</div>' +
              '</div>';
            }).join('') + '</div>' : '';

            const table = '<div class="card rounded-xl overflow-x-auto"><table class="w-full text-sm"><thead><tr class="text-left text-[10px] text-slate-500 uppercase"><th class="p-3">Phase</th><th class="p-3">Planned</th><th class="p-3">Actual</th><th class="p-3">Status</th><th class="p-3"></th></tr></thead><tbody>' +
              (milestones.length > 0 ? milestones.map(function(m) {
                const canDelete = hasRole('admin');
                return '<tr class="border-t border-slate-700/50"><td class="p-3 text-white font-medium">' + m.phase + '</td>' +
                  '<td class="p-3 text-slate-400 text-xs">' + (m.plannedStart ? formatDate(m.plannedStart) : '—') + ' &ndash; ' + (m.plannedEnd ? formatDate(m.plannedEnd) : '—') + '</td>' +
                  '<td class="p-3 text-slate-400 text-xs">' + (m.actualStart ? formatDate(m.actualStart) : '—') + ' &ndash; ' + (m.actualEnd ? formatDate(m.actualEnd) : '—') + '</td>' +
                  '<td class="p-3">' + statusBadge(statusLabel[m.status] || m.status, statusHex[m.status] || '#64748b') + '</td>' +
                  '<td class="p-3 text-right"><button onclick="openMilestoneForm(\\'' + m.id + '\\')" class="text-xs text-amber-400 hover:text-amber-300 mr-3">Edit</button>' + (canDelete ? '<button onclick="deleteMilestone(\\'' + m.id + '\\')" class="text-xs text-red-400 hover:text-red-300">Delete</button>' : '') + '</td></tr>';
              }).join('') : '<tr><td class="p-4 text-slate-500 text-sm" colspan="5">No milestones yet — add your first phase below.</td></tr>') +
            '</tbody></table></div>';

            const form = state.milestoneFormOpen ? renderMilestoneForm() : '';

            return '<div class="space-y-4 animate-fade-in">' +
              '<div class="flex items-center justify-between"><h1 class="font-display text-xl font-bold text-white">Schedule</h1><button onclick="openMilestoneForm(null)" class="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-black rounded-lg font-medium text-sm flex items-center gap-2">' + icon('plus', 'w-4 h-4') + ' Add Phase</button></div>' +
              form + gantt + table +
            '</div>';
          }
          function openMilestoneForm(id) {
            if (id) {
              const m = state.milestones.find(function(x) { return x.id === id; });
              if (m) {
                state.editingMilestoneId = id;
                state.milestonePhase = m.phase || '';
                state.milestonePlannedStart = m.plannedStart ? String(m.plannedStart).split('T')[0] : '';
                state.milestonePlannedEnd = m.plannedEnd ? String(m.plannedEnd).split('T')[0] : '';
                state.milestoneActualStart = m.actualStart ? String(m.actualStart).split('T')[0] : '';
                state.milestoneActualEnd = m.actualEnd ? String(m.actualEnd).split('T')[0] : '';
                state.milestoneStatus = m.status || 'not_started';
                state.milestonePercent = m.percentComplete != null ? String(m.percentComplete) : '';
              }
            } else {
              state.editingMilestoneId = null;
              state.milestonePhase = ''; state.milestonePlannedStart = ''; state.milestonePlannedEnd = ''; state.milestoneActualStart = ''; state.milestoneActualEnd = ''; state.milestoneStatus = 'not_started'; state.milestonePercent = '';
            }
            state.milestoneFormOpen = true;
            render();
          }
          function closeMilestoneForm() { state.milestoneFormOpen = false; state.editingMilestoneId = null; render(); }
          function renderMilestoneForm() {
            const statuses = ['not_started', 'on_track', 'at_risk', 'delayed', 'complete'];
            return '<div class="card rounded-xl p-5 space-y-3">' +
              '<h3 class="font-display font-semibold text-white text-sm">' + (state.editingMilestoneId ? 'Edit Phase' : 'New Phase') + '</h3>' +
              '<div><label class="text-xs text-slate-500 mb-1 block">Phase Name</label><input type="text" value="' + state.milestonePhase + '" oninput="state.milestonePhase=this.value" placeholder="e.g. Racking Install" class="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm"></div>' +
              '<div class="grid grid-cols-2 gap-3">' +
                '<div><label class="text-xs text-slate-500 mb-1 block">Planned Start</label><input type="date" value="' + state.milestonePlannedStart + '" oninput="state.milestonePlannedStart=this.value" class="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm"></div>' +
                '<div><label class="text-xs text-slate-500 mb-1 block">Planned End</label><input type="date" value="' + state.milestonePlannedEnd + '" oninput="state.milestonePlannedEnd=this.value" class="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm"></div>' +
                '<div><label class="text-xs text-slate-500 mb-1 block">Actual Start</label><input type="date" value="' + state.milestoneActualStart + '" oninput="state.milestoneActualStart=this.value" class="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm"></div>' +
                '<div><label class="text-xs text-slate-500 mb-1 block">Actual End</label><input type="date" value="' + state.milestoneActualEnd + '" oninput="state.milestoneActualEnd=this.value" class="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm"></div>' +
              '</div>' +
              '<div class="grid grid-cols-2 gap-3">' +
                '<div><label class="text-xs text-slate-500 mb-1 block">Status</label><select oninput="state.milestoneStatus=this.value" class="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm">' + statuses.map(function(s) { return '<option value="' + s + '"' + (state.milestoneStatus === s ? ' selected' : '') + '>' + s.replace(/_/g, ' ') + '</option>'; }).join('') + '</select></div>' +
                '<div><label class="text-xs text-slate-500 mb-1 block">% Complete</label><input type="number" min="0" max="100" value="' + state.milestonePercent + '" oninput="state.milestonePercent=this.value" class="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm"></div>' +
              '</div>' +
              '<div class="flex gap-3"><button onclick="closeMilestoneForm()" class="flex-1 py-3 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-xl font-medium">Cancel</button><button onclick="saveMilestoneForm()" class="flex-1 py-3 bg-amber-500 hover:bg-amber-400 text-black rounded-xl font-bold">Save</button></div>' +
            '</div>';
          }
          function saveMilestoneForm() {
            hapticFeedback();
            if (!state.milestonePhase || !state.milestonePhase.trim()) { alert('Enter a phase name.'); return; }
            const payload = {
              id: state.editingMilestoneId || undefined,
              projectId: state.currentProject?.id || 'proj_001',
              phase: state.milestonePhase.trim(),
              sortOrder: state.milestones.length,
              plannedStart: state.milestonePlannedStart || null,
              plannedEnd: state.milestonePlannedEnd || null,
              actualStart: state.milestoneActualStart || null,
              actualEnd: state.milestoneActualEnd || null,
              status: state.milestoneStatus,
              percentComplete: state.milestonePercent ? parseInt(state.milestonePercent) : 0,
              loggedBy: state.currentUser.id
            };
            const wasEditingId = state.editingMilestoneId;
            state.milestoneFormOpen = false;
            state.editingMilestoneId = null;
            let localId = null;
            if (wasEditingId) {
              const idx = state.milestones.findIndex(function(m) { return m.id === wasEditingId; });
              if (idx >= 0) state.milestones[idx] = Object.assign({}, state.milestones[idx], payload, { id: wasEditingId });
            } else {
              localId = 'local_' + Date.now();
              state.milestones.push(Object.assign({}, payload, { id: localId }));
            }
            render();
            saveMilestoneToServer(payload, wasEditingId, localId);
          }
          async function saveMilestoneToServer(payload, wasEditingId, localId) {
            try {
              const res = await fetch('/api/milestones', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
              const created = await res.json();
              if (!wasEditingId && created && created.id && localId) {
                const idx = state.milestones.findIndex(function(m) { return m.id === localId; });
                if (idx >= 0) { state.milestones[idx].id = created.id; render(); }
              }
            } catch (e) { console.error('Save milestone error:', e); }
          }
          function deleteMilestone(id) {
            if (!confirm('Delete this phase?')) return;
            state.milestones = state.milestones.filter(function(m) { return m.id !== id; });
            render();
            fetch('/api/milestones?id=' + id, { method: 'DELETE' }).catch(function(e) { console.error('Delete milestone error:', e); });
          }

          // DOCUMENTS & COI
          function triggerDocFileInput(kind) { document.getElementById('docFileInput-' + kind).click(); }
          function handleDocFileSelect(event, kind) {
            const file = event.target.files[0]; if (!file) return;
            const reader = new FileReader();
            reader.onload = function(e) {
              const fileInfo = { name: file.name, type: file.type, size: file.size, dataUrl: e.target.result };
              if (kind === 'document') state.docPendingFile = fileInfo;
              else if (kind === 'coi') state.coiPendingFile = fileInfo;
              else if (kind === 'submittal') state.subPendingFile = fileInfo;
              render();
            };
            reader.readAsDataURL(file);
            event.target.value = '';
          }
          function renderDocuments() {
            const tabs = [{ id: 'library', label: 'Document Library' }, { id: 'coi', label: 'Insurance (COI)' }];
            const tabBar = '<div class="flex gap-2 mb-4 flex-wrap">' + tabs.map(function(t) { return '<button onclick="setDocumentsTab(\\'' + t.id + '\\')" class="mode-btn ' + (state.documentsTab === t.id ? 'mode-btn-active' : 'mode-btn-inactive') + '">' + t.label + '</button>'; }).join('') + '</div>';
            const body = state.documentsTab === 'library' ? renderDocumentLibrary() : renderCoiTracker();
            return '<div class="space-y-4 animate-fade-in">' +
              '<div class="flex items-center justify-between"><h1 class="font-display text-xl font-bold text-white">Documents &amp; Insurance</h1></div>' +
              tabBar + body +
            '</div>';
          }
          function setDocumentsTab(tab) { state.documentsTab = tab; render(); }
          function renderDocumentLibrary() {
            const categories = [
              { id: 'site_plans', label: 'Site Plans' }, { id: 'ifc_drawings', label: 'IFC Drawings' },
              { id: 'as_builts', label: 'As-Builts' }, { id: 'permits', label: 'Permits' },
              { id: 'specs', label: 'Specs' }, { id: 'other', label: 'Other' }
            ];
            const catLabel = {}; categories.forEach(function(c) { catLabel[c.id] = c.label; });
            const canDelete = hasRole('admin');
            const form = '<div class="card rounded-xl p-5 space-y-3 mb-4">' +
              '<h3 class="font-display font-semibold text-white text-sm">Upload a Document</h3>' +
              '<div><label class="text-xs text-slate-500 mb-1 block">Title</label><input type="text" value="' + (state.docTitle || '') + '" oninput="state.docTitle=this.value" placeholder="e.g. IFC Drawing Set Rev 4" class="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm"></div>' +
              '<div><label class="text-xs text-slate-500 mb-1 block">Category</label><select oninput="state.docCategory=this.value" class="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm">' + categories.map(function(c) { return '<option value="' + c.id + '"' + (state.docCategory === c.id ? ' selected' : '') + '>' + c.label + '</option>'; }).join('') + '</select></div>' +
              '<input type="file" id="docFileInput-document" class="hidden" onchange="handleDocFileSelect(event, \\'document\\')">' +
              '<button onclick="triggerDocFileInput(\\'document\\')" class="capture-btn w-full py-3 rounded-xl flex items-center justify-center gap-2 text-slate-400 hover:text-white">' + icon('upload', 'w-5 h-5') + '<span class="font-medium text-sm">' + (state.docPendingFile ? state.docPendingFile.name : 'Choose File') + '</span></button>' +
              '<button onclick="submitDocument()" class="w-full py-3 bg-amber-500 hover:bg-amber-400 text-black rounded-xl font-bold">Upload</button>' +
            '</div>';
            const list = state.documents.length > 0 ? '<div class="space-y-2">' + state.documents.map(function(d) {
              return '<div class="card rounded-xl p-4 flex items-center justify-between gap-3"><a href="' + d.fileUrl + '" target="_blank" rel="noopener" class="flex items-center gap-3 flex-1 min-w-0">' + icon('file-text', 'w-5 h-5 text-slate-400 flex-shrink-0') + '<div class="min-w-0"><p class="text-sm font-medium text-white truncate">' + d.title + '</p><p class="text-xs text-slate-500">' + (catLabel[d.category] || d.category) + ' · ' + d.uploadedBy + ' · ' + formatDate(d.createdAt) + '</p></div></a>' + (canDelete ? '<button onclick="deleteDocument(\\'' + d.id + '\\')" class="text-slate-500 hover:text-red-400 p-1 flex-shrink-0">' + icon('trash-2', 'w-4 h-4') + '</button>' : '') + '</div>';
            }).join('') + '</div>' : '<p class="text-sm text-slate-500">No documents uploaded yet.</p>';
            return form + list;
          }
          function submitDocument() {
            hapticFeedback();
            if (!state.docTitle || !state.docTitle.trim()) { alert('Enter a title.'); return; }
            if (!state.docPendingFile) { alert('Choose a file to upload.'); return; }
            const file = state.docPendingFile;
            const title = state.docTitle.trim(), category = state.docCategory;
            state.docTitle = ''; state.docPendingFile = null;
            render();
            saveDocument(title, category, file);
          }
          async function saveDocument(title, category, file) {
            try {
              const projectId = state.currentProject?.id || 'proj_001';
              const upRes = await fetch('/api/upload-document', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ dataUrl: file.dataUrl, context: 'document' }) });
              const upData = await upRes.json();
              if (!upData.url) { console.error('Document upload failed'); return; }
              const res = await fetch('/api/documents', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ projectId, title, category, fileKey: upData.key, fileUrl: upData.url, fileType: upData.contentType, fileSize: upData.size, uploadedBy: state.currentUser.id, filePendingUpload: !!upData.pendingUpload, fileUploadContext: 'document' }) });
              const created = await res.json();
              if (created && created.id) {
                state.documents.unshift({ id: created.id, title: created.title, category: created.category, fileUrl: created.fileUrl, fileType: created.fileType, fileSize: created.fileSize, uploadedBy: state.currentUser.name, createdAt: created.createdAt });
                render();
              }
            } catch (e) { console.error('Save document error:', e); }
          }
          function deleteDocument(id) {
            if (!confirm('Delete this document?')) return;
            state.documents = state.documents.filter(function(d) { return d.id !== id; });
            render();
            fetch('/api/documents?id=' + id, { method: 'DELETE' }).catch(function(e) { console.error('Delete document error:', e); });
          }
          function renderCoiTracker() {
            const coverageTypes = [
              { id: 'general_liability', label: 'General Liability' }, { id: 'workers_comp', label: 'Workers Comp' },
              { id: 'auto_liability', label: 'Auto Liability' }, { id: 'umbrella', label: 'Umbrella' }, { id: 'other', label: 'Other' }
            ];
            const covLabel = {}; coverageTypes.forEach(function(c) { covLabel[c.id] = c.label; });
            const canDelete = hasRole('admin');
            function coiStatus(expiresAt) {
              const days = Math.floor((new Date(expiresAt).getTime() - Date.now()) / 86400000);
              if (days < 0) return { label: 'Expired', hex: '#ef4444' };
              if (days <= 30) return { label: 'Expiring Soon', hex: '#eab308' };
              return { label: 'Valid', hex: '#22c55e' };
            }
            const form = '<div class="card rounded-xl p-5 space-y-3 mb-4">' +
              '<h3 class="font-display font-semibold text-white text-sm">Add a Certificate</h3>' +
              '<div class="grid grid-cols-2 gap-3">' +
                '<div><label class="text-xs text-slate-500 mb-1 block">Subcontractor</label><select oninput="state.coiSubcontractorId=this.value" class="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm"><option value="">Select…</option>' + state.subcontractors.map(function(s) { return '<option value="' + s.id + '"' + (state.coiSubcontractorId === s.id ? ' selected' : '') + '>' + s.name + '</option>'; }).join('') + '</select></div>' +
                '<div><label class="text-xs text-slate-500 mb-1 block">Coverage</label><select oninput="state.coiCoverageType=this.value" class="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm">' + coverageTypes.map(function(c) { return '<option value="' + c.id + '"' + (state.coiCoverageType === c.id ? ' selected' : '') + '>' + c.label + '</option>'; }).join('') + '</select></div>' +
              '</div>' +
              '<div><label class="text-xs text-slate-500 mb-1 block">Expires</label><input type="date" value="' + (state.coiExpiresAt || '') + '" oninput="state.coiExpiresAt=this.value" class="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm"></div>' +
              '<input type="file" id="docFileInput-coi" class="hidden" onchange="handleDocFileSelect(event, \\'coi\\')">' +
              '<button onclick="triggerDocFileInput(\\'coi\\')" class="capture-btn w-full py-3 rounded-xl flex items-center justify-center gap-2 text-slate-400 hover:text-white">' + icon('upload', 'w-5 h-5') + '<span class="font-medium text-sm">' + (state.coiPendingFile ? state.coiPendingFile.name : 'Attach Certificate (optional)') + '</span></button>' +
              '<button onclick="submitCoi()" class="w-full py-3 bg-amber-500 hover:bg-amber-400 text-black rounded-xl font-bold">Add Certificate</button>' +
            '</div>';
            const expiredOrSoon = state.cois.filter(function(c) { return coiStatus(c.expiresAt).label !== 'Valid'; });
            const warnBanner = expiredOrSoon.length > 0 ? '<div class="mb-4 px-4 py-3 rounded-xl flex items-center gap-2 text-sm font-medium" style="background: rgba(239, 68, 68, 0.1); border: 1px solid rgba(239, 68, 68, 0.3); color: #f87171;">' + icon('alert-triangle', 'w-4 h-4 flex-shrink-0') + '<span>' + expiredOrSoon.length + ' certificate' + (expiredOrSoon.length === 1 ? ' is' : 's are') + ' expired or expiring within 30 days.</span></div>' : '';
            const table = '<div class="card rounded-xl overflow-x-auto"><table class="w-full text-sm"><thead><tr class="text-left text-[10px] text-slate-500 uppercase"><th class="p-3">Subcontractor</th><th class="p-3">Coverage</th><th class="p-3">Expires</th><th class="p-3">Status</th><th class="p-3"></th></tr></thead><tbody>' +
              (state.cois.length > 0 ? state.cois.map(function(c) {
                const st = coiStatus(c.expiresAt);
                return '<tr class="border-t border-slate-700/50"><td class="p-3 text-white font-medium">' + c.subcontractor + '</td><td class="p-3 text-slate-400 text-xs">' + (covLabel[c.coverageType] || c.coverageType) + '</td><td class="p-3 text-slate-400 text-xs">' + formatDate(c.expiresAt) + '</td><td class="p-3">' + statusBadge(st.label, st.hex) + '</td><td class="p-3 text-right">' + (canDelete ? '<button onclick="deleteCoi(\\'' + c.id + '\\')" class="text-xs text-red-400 hover:text-red-300">Delete</button>' : '') + '</td></tr>';
              }).join('') : '<tr><td class="p-4 text-slate-500 text-sm" colspan="5">No certificates on file yet.</td></tr>') +
            '</tbody></table></div>';
            return form + warnBanner + table;
          }
          function submitCoi() {
            hapticFeedback();
            if (!state.coiSubcontractorId || !state.coiExpiresAt) { alert('Select a subcontractor and expiration date.'); return; }
            const subcontractorId = state.coiSubcontractorId, coverageType = state.coiCoverageType, expiresAt = state.coiExpiresAt, file = state.coiPendingFile;
            state.coiSubcontractorId = ''; state.coiExpiresAt = ''; state.coiPendingFile = null;
            render();
            saveCoi(subcontractorId, coverageType, expiresAt, file);
          }
          async function saveCoi(subcontractorId, coverageType, expiresAt, file) {
            try {
              const projectId = state.currentProject?.id || 'proj_001';
              let fileKey = null, fileUrl = null, filePendingUpload = false;
              if (file) {
                const upRes = await fetch('/api/upload-document', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ dataUrl: file.dataUrl, context: 'coi' }) });
                const upData = await upRes.json();
                fileKey = upData.key || null; fileUrl = upData.url || null; filePendingUpload = !!upData.pendingUpload;
              }
              const res = await fetch('/api/coi', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ projectId, subcontractorId, coverageType, expiresAt, fileKey, fileUrl, loggedBy: state.currentUser.id, filePendingUpload, fileUploadContext: 'coi' }) });
              const created = await res.json();
              if (created && created.id) {
                const sub = state.subcontractors.find(function(s) { return s.id === subcontractorId; });
                state.cois.unshift({ id: created.id, subcontractorId, subcontractor: sub ? sub.name : 'Unknown', coverageType, expiresAt: created.expiresAt, fileUrl, createdAt: created.createdAt });
                render();
              }
            } catch (e) { console.error('Save COI error:', e); }
          }
          function deleteCoi(id) {
            if (!confirm('Delete this certificate?')) return;
            state.cois = state.cois.filter(function(c) { return c.id !== id; });
            render();
            fetch('/api/coi?id=' + id, { method: 'DELETE' }).catch(function(e) { console.error('Delete COI error:', e); });
          }

          // RFIS & SUBMITTALS
          function renderRfiSubmittals() {
            const tabs = [{ id: 'rfis', label: 'RFIs' }, { id: 'submittals', label: 'Submittals' }];
            const tabBar = '<div class="flex gap-2 mb-4 flex-wrap">' + tabs.map(function(t) { return '<button onclick="setRfiSubmittalsTab(\\'' + t.id + '\\')" class="mode-btn ' + (state.rfiSubmittalsTab === t.id ? 'mode-btn-active' : 'mode-btn-inactive') + '">' + t.label + '</button>'; }).join('') + '</div>';
            const body = state.rfiSubmittalsTab === 'rfis' ? renderRfisTab() : renderSubmittalsTab();
            return '<div class="space-y-4 animate-fade-in">' +
              '<div class="flex items-center justify-between"><h1 class="font-display text-xl font-bold text-white">RFIs &amp; Submittals</h1></div>' +
              tabBar + body +
            '</div>';
          }
          function setRfiSubmittalsTab(tab) { state.rfiSubmittalsTab = tab; render(); }

          const RFI_CATEGORIES = [
            { id: 'civil', label: 'Civil' }, { id: 'structural', label: 'Structural' },
            { id: 'electrical', label: 'Electrical' }, { id: 'racking', label: 'Racking' }, { id: 'other', label: 'Other' }
          ];
          // Tracks the in-flight save promise for each locally-created RFI,
          // keyed by its temporary "local_..." id. If the user answers,
          // closes, reopens, or deletes an RFI before its create request has
          // resolved (spotty jobsite connectivity makes this common),
          // resolveRfiId waits for that save and swaps in the real server id
          // instead of firing the mutation against an id that never existed
          // server-side.
          const pendingRfiSaves = {};
          async function resolveRfiId(id) {
            if (typeof id !== 'string' || id.indexOf('local_') !== 0) return id;
            const pending = pendingRfiSaves[id];
            if (!pending) return id;
            const realId = await pending;
            return realId || id;
          }
          function renderRfisTab() {
            const catLabel = {}; RFI_CATEGORIES.forEach(function(c) { catLabel[c.id] = c.label; });
            const canDelete = hasRole('admin');
            const canAnswer = hasRole('manager');
            const openCount = state.rfis.filter(function(r) { return r.status !== 'closed'; }).length;
            const blockingCount = state.rfis.filter(function(r) { return r.blocking && r.status !== 'closed'; }).length;
            const statRow = '<div class="grid grid-cols-2 gap-3 mb-4">' +
              '<div class="card rounded-xl p-4"><p class="text-2xl font-bold text-white">' + openCount + '</p><p class="text-xs text-slate-500">Open RFIs</p></div>' +
              '<div class="card rounded-xl p-4"><p class="text-2xl font-bold ' + (blockingCount > 0 ? 'text-red-400' : 'text-white') + '">' + blockingCount + '</p><p class="text-xs text-slate-500">Blocking Work</p></div>' +
            '</div>';

            const form = '<div class="card rounded-xl p-5 space-y-3 mb-4">' +
              '<h3 class="font-display font-semibold text-white text-sm">Submit an RFI</h3>' +
              '<div><label class="text-xs text-slate-500 mb-1 block">Subject</label><input type="text" value="' + (state.rfiSubject || '') + '" oninput="state.rfiSubject=this.value" placeholder="e.g. Pile embedment conflict at row 12" class="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm"></div>' +
              '<div class="grid grid-cols-2 gap-3">' +
                '<div><label class="text-xs text-slate-500 mb-1 block">Category</label><select oninput="state.rfiCategory=this.value" class="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm">' + RFI_CATEGORIES.map(function(c) { return '<option value="' + c.id + '"' + (state.rfiCategory === c.id ? ' selected' : '') + '>' + c.label + '</option>'; }).join('') + '</select></div>' +
                '<div><label class="text-xs text-slate-500 mb-1 block">Submitted To</label><input type="text" value="' + (state.rfiSubmittedTo || '') + '" oninput="state.rfiSubmittedTo=this.value" placeholder="e.g. EPC Engineer" class="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm"></div>' +
              '</div>' +
              '<div><label class="text-xs text-slate-500 mb-1 block">Question</label><textarea oninput="state.rfiQuestion=this.value" rows="3" placeholder="What needs to be answered?" class="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm">' + (state.rfiQuestion || '') + '</textarea></div>' +
              '<label class="flex items-center gap-2 text-sm text-slate-300"><input type="checkbox" ' + (state.rfiBlocking ? 'checked' : '') + ' onchange="state.rfiBlocking=this.checked" class="w-4 h-4"> This is blocking work</label>' +
              renderPhotoCapture('rfi') +
              '<button onclick="submitRfi()" class="w-full py-3 bg-amber-500 hover:bg-amber-400 text-black rounded-xl font-bold">Submit RFI</button>' +
            '</div>';

            const rfiFilters = [{ id: 'open', label: 'Open' }, { id: 'answered', label: 'Answered' }, { id: 'closed', label: 'Closed' }, { id: 'all', label: 'All' }];
            const filterBar = '<div class="flex gap-1 p-1 bg-slate-800/50 rounded-xl overflow-x-auto max-w-md">' + rfiFilters.map(function(f) { return '<button onclick="setRfiFilter(\\'' + f.id + '\\')" class="flex-1 px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ' + (state.rfiFilter === f.id ? 'bg-amber-500 text-black' : 'text-slate-400 hover:text-white') + '">' + f.label + '</button>'; }).join('') + '</div>';
            const filteredRfis = state.rfiFilter === 'all' ? state.rfis : state.rfis.filter(function(r) { return r.status === state.rfiFilter; });

            const cards = filteredRfis.length > 0 ? '<div class="space-y-3">' + filteredRfis.map(function(r) {
              const statusHex = r.status === 'open' ? '#eab308' : r.status === 'answered' ? '#3b82f6' : '#22c55e';
              const statusLabel = r.status === 'open' ? 'Open' : r.status === 'answered' ? 'Answered' : 'Closed';
              const previousAnswer = r.answer ? '<div class="mt-3 pt-3 border-t border-slate-700/50"><p class="text-xs text-slate-500 mb-1">' + (r.status === 'open' ? 'Previous answer:' : 'Answer:') + '</p><p class="text-sm text-slate-300">' + r.answer + '</p></div>' : '';
              const answerInput = r.status === 'open' && canAnswer ?
                '<div class="' + (r.answer ? 'mt-2' : 'mt-3 pt-3 border-t border-slate-700/50') + ' space-y-2"><textarea id="rfiAnswerInput-' + r.id + '" oninput="state.rfiAnswerDraft[\\'' + r.id + '\\']=this.value" rows="2" placeholder="Type an answer…" class="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm">' + (state.rfiAnswerDraft[r.id] || '') + '</textarea><button onclick="submitRfiAnswer(\\'' + r.id + '\\')" class="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-medium">Answer</button></div>' : '';
              const answerBox = previousAnswer + answerInput;
              return '<div class="card rounded-xl p-4">' +
                '<div class="flex items-start justify-between gap-3">' +
                  '<div class="min-w-0"><p class="text-sm font-medium text-white">' + r.number + ': ' + r.subject + '</p><p class="text-xs text-slate-500">' + (catLabel[r.category] || r.category) + (r.submittedTo ? ' · to ' + r.submittedTo : '') + ' · ' + r.submittedBy + ' · ' + formatDate(r.createdAt) + '</p></div>' +
                  '<div class="flex items-center gap-2 flex-shrink-0">' + (r.blocking ? statusBadge('Blocking', '#ef4444') : '') + statusBadge(statusLabel, statusHex) + '</div>' +
                '</div>' +
                '<p class="text-sm text-slate-300 mt-2">' + r.question + '</p>' +
                (r.photos && r.photos.length > 0 ? '<div class="photo-grid mt-2">' + r.photos.map(function(p) { return '<div class="photo-thumb"><img src="' + p.url + '" alt="RFI photo"></div>'; }).join('') + '</div>' : '') +
                answerBox +
                '<div class="flex items-center gap-3 mt-3">' +
                  (r.status === 'answered' && canAnswer ? '<button onclick="closeRfi(\\'' + r.id + '\\')" class="text-xs text-green-400 hover:text-green-300 font-medium">Mark Closed</button>' : '') +
                  (r.status === 'closed' && canAnswer ? '<button onclick="reopenRfi(\\'' + r.id + '\\')" class="text-xs text-amber-400 hover:text-amber-300 font-medium">Reopen</button>' : '') +
                  (canDelete ? '<button onclick="deleteRfi(\\'' + r.id + '\\')" class="text-xs text-red-400 hover:text-red-300">Delete</button>' : '') +
                '</div>' +
              '</div>';
            }).join('') + '</div>' : '<p class="text-sm text-slate-500">No ' + (state.rfiFilter === 'all' ? '' : state.rfiFilter + ' ') + 'RFIs.</p>';

            return statRow + form + filterBar + cards;
          }
          function setRfiFilter(f) { state.rfiFilter = f; render(); }
          function submitRfi() {
            hapticFeedback();
            if (!state.rfiSubject || !state.rfiSubject.trim() || !state.rfiQuestion || !state.rfiQuestion.trim()) { alert('Enter a subject and question.'); return; }
            const localPhotos = state.rfiPhotos.map(function(p) { return { url: p.url, timestamp: p.timestamp, gps: p.gps }; });
            const rfi = { id: 'local_' + Date.now(), number: '—', subject: state.rfiSubject.trim(), category: state.rfiCategory, submittedTo: state.rfiSubmittedTo || null, question: state.rfiQuestion.trim(), blocking: !!state.rfiBlocking, status: 'open', answer: null, photos: localPhotos, submittedBy: state.currentUser.name, createdAt: new Date().toISOString() };
            state.rfis.unshift(rfi);
            const photosToUpload = state.rfiPhotos;
            state.rfiSubject = ''; state.rfiSubmittedTo = ''; state.rfiQuestion = ''; state.rfiBlocking = false; state.rfiPhotos = [];
            render();
            pendingRfiSaves[rfi.id] = saveRfi(rfi, photosToUpload);
          }
          async function saveRfi(rfi, photosToUpload) {
            try {
              const projectId = state.currentProject?.id || 'proj_001';
              const uploadedPhotos = await uploadPendingPhotos(photosToUpload, 'rfi', null);
              const res = await fetch('/api/rfis', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ projectId, subject: rfi.subject, category: rfi.category, submittedTo: rfi.submittedTo, question: rfi.question, blocking: rfi.blocking, photos: uploadedPhotos, submittedBy: state.currentUser.id }) });
              const created = await res.json();
              if (created && created.id) {
                const idx = state.rfis.findIndex(function(r) { return r.id === rfi.id; });
                if (idx >= 0) { state.rfis[idx].id = created.id; state.rfis[idx].number = created.number; state.rfis[idx].photos = uploadedPhotos; render(); }
                return created.id;
              }
              return null;
            } catch (e) { console.error('Save RFI error:', e); return null; }
            finally { delete pendingRfiSaves[rfi.id]; }
          }
          async function submitRfiAnswer(id) {
            const answer = (state.rfiAnswerDraft[id] || '').trim();
            if (!answer) { alert('Enter an answer.'); return; }
            hapticFeedback();
            const realId = await resolveRfiId(id);
            delete state.rfiAnswerDraft[id];
            const idx = state.rfis.findIndex(function(r) { return r.id === realId; });
            if (idx >= 0) { state.rfis[idx].status = 'answered'; state.rfis[idx].answer = answer; }
            render();
            fetch('/api/rfis', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: realId, status: 'answered', answer: answer, projectId: state.currentProject?.id || 'proj_001' }) }).catch(function(e) { console.error('Answer RFI error:', e); });
          }
          async function closeRfi(id) {
            hapticFeedback();
            const realId = await resolveRfiId(id);
            const idx = state.rfis.findIndex(function(r) { return r.id === realId; });
            if (idx >= 0) state.rfis[idx].status = 'closed';
            render();
            fetch('/api/rfis', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: realId, status: 'closed', projectId: state.currentProject?.id || 'proj_001' }) }).catch(function(e) { console.error('Close RFI error:', e); });
          }
          async function reopenRfi(id) {
            hapticFeedback();
            const realId = await resolveRfiId(id);
            const idx = state.rfis.findIndex(function(r) { return r.id === realId; });
            if (idx >= 0) state.rfis[idx].status = 'open';
            render();
            fetch('/api/rfis', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: realId, status: 'open', projectId: state.currentProject?.id || 'proj_001' }) }).catch(function(e) { console.error('Reopen RFI error:', e); });
          }
          async function deleteRfi(id) {
            if (!confirm('Delete this RFI?')) return;
            const realId = await resolveRfiId(id);
            state.rfis = state.rfis.filter(function(r) { return r.id !== realId; });
            render();
            fetch('/api/rfis?id=' + realId, { method: 'DELETE' }).catch(function(e) { console.error('Delete RFI error:', e); });
          }

          const SUBMITTAL_TYPES = [
            { id: 'product_data', label: 'Product Data' }, { id: 'shop_drawing', label: 'Shop Drawing' },
            { id: 'sample', label: 'Sample' }, { id: 'certificate', label: 'Certificate' }
          ];
          const SUBMITTAL_STATUSES = [
            { id: 'pending', label: 'Pending', hex: '#64748b' }, { id: 'submitted', label: 'Submitted', hex: '#3b82f6' },
            { id: 'under_review', label: 'Under Review', hex: '#eab308' }, { id: 'approved', label: 'Approved', hex: '#22c55e' },
            { id: 'approved_as_noted', label: 'Approved as Noted', hex: '#22c55e' }, { id: 'revise_resubmit', label: 'Revise & Resubmit', hex: '#f97316' },
            { id: 'rejected', label: 'Rejected', hex: '#ef4444' }
          ];
          // Same id-race protection as pendingRfiSaves/resolveRfiId, for Submittals.
          const pendingSubmittalSaves = {};
          async function resolveSubmittalId(id) {
            if (typeof id !== 'string' || id.indexOf('local_') !== 0) return id;
            const pending = pendingSubmittalSaves[id];
            if (!pending) return id;
            const realId = await pending;
            return realId || id;
          }
          function renderSubmittalsTab() {
            const typeLabel = {}; SUBMITTAL_TYPES.forEach(function(t) { typeLabel[t.id] = t.label; });
            const statusMeta = {}; SUBMITTAL_STATUSES.forEach(function(s) { statusMeta[s.id] = s; });
            const canDelete = hasRole('admin');
            const canReview = hasRole('manager');
            const notDoneStatuses = ['approved', 'approved_as_noted', 'rejected'];
            const openCount = state.submittals.filter(function(s) { return notDoneStatuses.indexOf(s.status) === -1; }).length;
            const overdueCount = state.submittals.filter(function(s) { return s.dueDate && new Date(s.dueDate).getTime() < Date.now() && notDoneStatuses.indexOf(s.status) === -1; }).length;
            const statRow = '<div class="grid grid-cols-2 gap-3 mb-4">' +
              '<div class="card rounded-xl p-4"><p class="text-2xl font-bold text-white">' + openCount + '</p><p class="text-xs text-slate-500">In Review</p></div>' +
              '<div class="card rounded-xl p-4"><p class="text-2xl font-bold ' + (overdueCount > 0 ? 'text-red-400' : 'text-white') + '">' + overdueCount + '</p><p class="text-xs text-slate-500">Overdue</p></div>' +
            '</div>';
            const warnBanner = overdueCount > 0 ? '<div class="mb-4 px-4 py-3 rounded-xl flex items-center gap-2 text-sm font-medium" style="background: rgba(239, 68, 68, 0.1); border: 1px solid rgba(239, 68, 68, 0.3); color: #f87171;">' + icon('alert-triangle', 'w-4 h-4 flex-shrink-0') + '<span>' + overdueCount + ' submittal' + (overdueCount === 1 ? ' is' : 's are') + ' past its due date.</span></div>' : '';

            const form = '<div class="card rounded-xl p-5 space-y-3 mb-4">' +
              '<h3 class="font-display font-semibold text-white text-sm">New Submittal</h3>' +
              '<div><label class="text-xs text-slate-500 mb-1 block">Spec Section</label><input type="text" value="' + (state.subSpecSection || '') + '" oninput="state.subSpecSection=this.value" placeholder="e.g. 33 11 00" class="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm"></div>' +
              '<div class="grid grid-cols-2 gap-3">' +
                '<div><label class="text-xs text-slate-500 mb-1 block">Type</label><select oninput="state.subType=this.value" class="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm">' + SUBMITTAL_TYPES.map(function(t) { return '<option value="' + t.id + '"' + (state.subType === t.id ? ' selected' : '') + '>' + t.label + '</option>'; }).join('') + '</select></div>' +
                '<div><label class="text-xs text-slate-500 mb-1 block">Related Material</label><select oninput="state.subMaterialId=this.value" class="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm"><option value="">None</option>' + state.materials.map(function(m) { return '<option value="' + m.id + '"' + (state.subMaterialId === m.id ? ' selected' : '') + '>' + m.name + '</option>'; }).join('') + '</select></div>' +
              '</div>' +
              '<div><label class="text-xs text-slate-500 mb-1 block">Due Date</label><input type="date" value="' + (state.subDueDate || '') + '" oninput="state.subDueDate=this.value" class="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm"></div>' +
              '<input type="file" id="docFileInput-submittal" class="hidden" onchange="handleDocFileSelect(event, \\'submittal\\')">' +
              '<button onclick="triggerDocFileInput(\\'submittal\\')" class="capture-btn w-full py-3 rounded-xl flex items-center justify-center gap-2 text-slate-400 hover:text-white">' + icon('upload', 'w-5 h-5') + '<span class="font-medium text-sm">' + (state.subPendingFile ? state.subPendingFile.name : 'Attach File (optional)') + '</span></button>' +
              '<button onclick="submitSubmittal()" class="w-full py-3 bg-amber-500 hover:bg-amber-400 text-black rounded-xl font-bold">Add Submittal</button>' +
            '</div>';

            const subFilters = [{ id: 'all', label: 'All' }].concat(SUBMITTAL_STATUSES.map(function(s) { return { id: s.id, label: s.label }; }));
            const filterBar = '<div class="flex gap-1 p-1 bg-slate-800/50 rounded-xl overflow-x-auto mb-4">' + subFilters.map(function(f) { return '<button onclick="setSubFilter(\\'' + f.id + '\\')" class="px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ' + (state.subFilter === f.id ? 'bg-amber-500 text-black' : 'text-slate-400 hover:text-white') + '">' + f.label + '</button>'; }).join('') + '</div>';
            const filteredSubmittals = state.subFilter === 'all' ? state.submittals : state.submittals.filter(function(s) { return s.status === state.subFilter; });

            const table = '<div class="card rounded-xl overflow-x-auto"><table class="w-full text-sm"><thead><tr class="text-left text-[10px] text-slate-500 uppercase"><th class="p-3">Number</th><th class="p-3">Spec Section</th><th class="p-3">Type</th><th class="p-3">Rev</th><th class="p-3">Due</th><th class="p-3">Status</th><th class="p-3"></th></tr></thead><tbody>' +
              (filteredSubmittals.length > 0 ? filteredSubmittals.map(function(s) {
                const meta = statusMeta[s.status] || { label: s.status, hex: '#64748b' };
                const canAdvance = notDoneStatuses.indexOf(s.status) === -1;
                const overdue = s.dueDate && new Date(s.dueDate).getTime() < Date.now() && canAdvance;
                const reopenLink = canReview && !canAdvance ? ' <button onclick="reopenSubmittal(\\'' + s.id + '\\')" class="text-xs text-amber-400 hover:text-amber-300 ml-2">Reopen</button>' : '';
                const statusSelect = (canReview && canAdvance ? '<select onchange="advanceSubmittal(\\'' + s.id + '\\', this.value)" class="bg-slate-900 border border-slate-600 rounded-lg px-2 py-1 text-white text-xs">' + SUBMITTAL_STATUSES.map(function(st) { return '<option value="' + st.id + '"' + (s.status === st.id ? ' selected' : '') + '>' + st.label + '</option>'; }).join('') + '</select>' : statusBadge(meta.label, meta.hex)) + reopenLink;
                return '<tr class="border-t border-slate-700/50"><td class="p-3 text-white font-medium">' + s.number + '</td><td class="p-3 text-slate-400 text-xs">' + s.specSection + (s.materialName ? ' · ' + s.materialName : '') + '</td><td class="p-3 text-slate-400 text-xs">' + (typeLabel[s.type] || s.type) + '</td><td class="p-3 text-slate-400 text-xs">' + s.revision + '</td><td class="p-3 text-xs ' + (overdue ? 'text-red-400 font-medium' : 'text-slate-400') + '">' + (s.dueDate ? formatDate(s.dueDate) : '—') + '</td><td class="p-3">' + statusSelect + '</td><td class="p-3 text-right">' + (s.fileUrl ? '<a href="' + s.fileUrl + '" target="_blank" rel="noopener" class="text-xs text-blue-400 hover:text-blue-300 mr-2">View</a>' : '') + (canDelete ? '<button onclick="deleteSubmittal(\\'' + s.id + '\\')" class="text-xs text-red-400 hover:text-red-300">Delete</button>' : '') + '</td></tr>';
              }).join('') : '<tr><td class="p-4 text-slate-500 text-sm" colspan="7">No ' + (state.subFilter === 'all' ? 'submittals tracked' : 'matching submittals') + ' yet.</td></tr>') +
            '</tbody></table></div>';

            return statRow + warnBanner + form + filterBar + table;
          }
          function setSubFilter(f) { state.subFilter = f; render(); }
          function submitSubmittal() {
            hapticFeedback();
            if (!state.subSpecSection || !state.subSpecSection.trim()) { alert('Enter a spec section.'); return; }
            const specSection = state.subSpecSection.trim(), type = state.subType, materialId = state.subMaterialId || null, dueDate = state.subDueDate || null, file = state.subPendingFile;
            const material = materialId ? state.materials.find(function(m) { return m.id === materialId; }) : null;
            const localId = 'local_' + Date.now();
            state.submittals.unshift({ id: localId, number: '—', specSection: specSection, type: type, revision: 0, status: 'pending', dueDate: dueDate, fileUrl: null, materialId: materialId, materialName: material ? material.name : null, submittedBy: state.currentUser.name, createdAt: new Date().toISOString() });
            state.subSpecSection = ''; state.subType = 'product_data'; state.subMaterialId = ''; state.subDueDate = ''; state.subPendingFile = null;
            render();
            pendingSubmittalSaves[localId] = saveSubmittal(localId, specSection, type, materialId, dueDate, file);
          }
          async function saveSubmittal(localId, specSection, type, materialId, dueDate, file) {
            try {
              const projectId = state.currentProject?.id || 'proj_001';
              let fileKey = null, fileUrl = null, filePendingUpload = false;
              if (file) {
                const upRes = await fetch('/api/upload-document', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ dataUrl: file.dataUrl, context: 'submittal' }) });
                const upData = await upRes.json();
                fileKey = upData.key || null; fileUrl = upData.url || null; filePendingUpload = !!upData.pendingUpload;
              }
              const res = await fetch('/api/submittals', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ projectId, specSection, type, materialId, dueDate, fileKey, fileUrl, submittedBy: state.currentUser.id, filePendingUpload, fileUploadContext: 'submittal' }) });
              const created = await res.json();
              if (created && created.id) {
                const idx = state.submittals.findIndex(function(s) { return s.id === localId; });
                if (idx >= 0) { state.submittals[idx].id = created.id; state.submittals[idx].number = created.number; state.submittals[idx].fileUrl = fileUrl; render(); }
                return created.id;
              }
              return null;
            } catch (e) { console.error('Save submittal error:', e); return null; }
            finally { delete pendingSubmittalSaves[localId]; }
          }
          async function advanceSubmittal(id, status) {
            hapticFeedback();
            const realId = await resolveSubmittalId(id);
            const idx = state.submittals.findIndex(function(s) { return s.id === realId; });
            if (idx >= 0) {
              if (status === 'revise_resubmit') state.submittals[idx].revision = (state.submittals[idx].revision || 0) + 1;
              state.submittals[idx].status = status;
            }
            render();
            fetch('/api/submittals', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: realId, status: status, projectId: state.currentProject?.id || 'proj_001' }) }).catch(function(e) { console.error('Advance submittal error:', e); });
          }
          async function reopenSubmittal(id) {
            hapticFeedback();
            const realId = await resolveSubmittalId(id);
            const idx = state.submittals.findIndex(function(s) { return s.id === realId; });
            if (idx >= 0) state.submittals[idx].status = 'under_review';
            render();
            fetch('/api/submittals', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: realId, status: 'under_review', projectId: state.currentProject?.id || 'proj_001' }) }).catch(function(e) { console.error('Reopen submittal error:', e); });
          }
          async function deleteSubmittal(id) {
            if (!confirm('Delete this submittal?')) return;
            const realId = await resolveSubmittalId(id);
            state.submittals = state.submittals.filter(function(s) { return s.id !== realId; });
            render();
            fetch('/api/submittals?id=' + realId, { method: 'DELETE' }).catch(function(e) { console.error('Delete submittal error:', e); });
          }

          // MATERIALS - bill of materials vs. delivered, with a delivery log.
          function renderMaterials() {
            const canDelete = hasRole('admin');
            function materialStatus(m) {
              if (m.orderedQty > 0 && m.deliveredQty >= m.orderedQty) return statusBadge('Complete', '#22c55e');
              if (m.expectedDate && new Date(m.expectedDate).getTime() < Date.now() && m.deliveredQty < m.orderedQty) return statusBadge('Behind', '#ef4444');
              if (m.deliveredQty > 0) return statusBadge('On Track', '#22c55e');
              return statusBadge('Not Started', '#64748b');
            }
            const behind = state.materials.filter(function(m) { return m.expectedDate && new Date(m.expectedDate).getTime() < Date.now() && m.deliveredQty < m.orderedQty; });
            const warnBanner = behind.length > 0 ? '<div class="mb-4 px-4 py-3 rounded-xl flex items-center gap-2 text-sm font-medium" style="background: rgba(239, 68, 68, 0.1); border: 1px solid rgba(239, 68, 68, 0.3); color: #f87171;">' + icon('alert-triangle', 'w-4 h-4 flex-shrink-0') + '<span>' + behind.map(function(m) { return m.name + ' (' + m.deliveredQty + '/' + m.orderedQty + ' ' + m.unit + ')'; }).join(', ') + ' behind schedule.</span></div>' : '';

            const materialForm = state.materialFormOpen ? '<div class="card rounded-xl p-5 space-y-3 mb-4">' +
              '<h3 class="font-display font-semibold text-white text-sm">New Material</h3>' +
              '<div><label class="text-xs text-slate-500 mb-1 block">Name</label><input type="text" value="' + (state.materialName || '') + '" oninput="state.materialName=this.value" placeholder="e.g. Racking Clips" class="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm"></div>' +
              '<div class="grid grid-cols-2 gap-3">' +
                '<div><label class="text-xs text-slate-500 mb-1 block">Ordered Qty</label><input type="number" min="0" value="' + (state.materialOrderedQty || '') + '" oninput="state.materialOrderedQty=this.value" class="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm"></div>' +
                '<div><label class="text-xs text-slate-500 mb-1 block">Unit</label><input type="text" value="' + (state.materialUnit || 'units') + '" oninput="state.materialUnit=this.value" class="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm"></div>' +
                '<div><label class="text-xs text-slate-500 mb-1 block">Expected Date</label><input type="date" value="' + (state.materialExpectedDate || '') + '" oninput="state.materialExpectedDate=this.value" class="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm"></div>' +
                '<div><label class="text-xs text-slate-500 mb-1 block">Supplier</label><input type="text" value="' + (state.materialSupplier || '') + '" oninput="state.materialSupplier=this.value" class="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm"></div>' +
              '</div>' +
              '<div class="flex gap-3"><button onclick="state.materialFormOpen=false; render();" class="flex-1 py-3 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-xl font-medium">Cancel</button><button onclick="submitMaterial()" class="flex-1 py-3 bg-amber-500 hover:bg-amber-400 text-black rounded-xl font-bold">Add</button></div>' +
            '</div>' : '';

            const bomTable = '<div class="card rounded-xl overflow-x-auto mb-4"><table class="w-full text-sm"><thead><tr class="text-left text-[10px] text-slate-500 uppercase"><th class="p-3">Material</th><th class="p-3">Ordered</th><th class="p-3">Delivered</th><th class="p-3">Remaining</th><th class="p-3">Expected</th><th class="p-3">Status</th><th class="p-3"></th></tr></thead><tbody>' +
              (state.materials.length > 0 ? state.materials.map(function(m) {
                return '<tr class="border-t border-slate-700/50"><td class="p-3 text-white font-medium">' + m.name + '</td><td class="p-3 text-slate-400">' + m.orderedQty + '</td><td class="p-3 text-slate-400">' + m.deliveredQty + '</td><td class="p-3 text-slate-400">' + Math.max(0, m.orderedQty - m.deliveredQty) + '</td><td class="p-3 text-slate-400 text-xs">' + (m.expectedDate ? formatDate(m.expectedDate) : '—') + '</td><td class="p-3">' + materialStatus(m) + '</td><td class="p-3 text-right">' + (canDelete ? '<button onclick="deleteMaterial(\\'' + m.id + '\\')" class="text-xs text-red-400 hover:text-red-300">Delete</button>' : '') + '</td></tr>';
              }).join('') : '<tr><td class="p-4 text-slate-500 text-sm" colspan="7">No materials tracked yet.</td></tr>') +
            '</tbody></table></div>';

            const deliveryForm = state.deliveryFormOpen ? '<div class="card rounded-xl p-5 space-y-3 mb-4">' +
              '<h3 class="font-display font-semibold text-white text-sm">Log a Delivery</h3>' +
              '<div><label class="text-xs text-slate-500 mb-1 block">Material</label><select oninput="state.deliveryMaterialId=this.value" class="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm"><option value="">Select…</option>' + state.materials.map(function(m) { return '<option value="' + m.id + '"' + (state.deliveryMaterialId === m.id ? ' selected' : '') + '>' + m.name + '</option>'; }).join('') + '</select></div>' +
              '<div class="grid grid-cols-2 gap-3">' +
                '<div><label class="text-xs text-slate-500 mb-1 block">Quantity</label><input type="number" min="1" value="' + (state.deliveryQty || '') + '" oninput="state.deliveryQty=this.value" class="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm"></div>' +
                '<div><label class="text-xs text-slate-500 mb-1 block">Supplier</label><input type="text" value="' + (state.deliverySupplier || '') + '" oninput="state.deliverySupplier=this.value" class="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm"></div>' +
                '<div><label class="text-xs text-slate-500 mb-1 block">Received By</label><input type="text" value="' + (state.deliveryReceivedBy || '') + '" oninput="state.deliveryReceivedBy=this.value" placeholder="' + (state.currentUser.name || '') + '" class="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm"></div>' +
                '<div><label class="text-xs text-slate-500 mb-1 block">Notes</label><input type="text" value="' + (state.deliveryNotes || '') + '" oninput="state.deliveryNotes=this.value" class="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm"></div>' +
              '</div>' +
              '<div class="flex gap-3"><button onclick="state.deliveryFormOpen=false; render();" class="flex-1 py-3 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-xl font-medium">Cancel</button><button onclick="submitDelivery()" class="flex-1 py-3 bg-amber-500 hover:bg-amber-400 text-black rounded-xl font-bold">Log Delivery</button></div>' +
            '</div>' : '';

            const deliveryLog = '<div class="space-y-2">' + (state.deliveries.length > 0 ? state.deliveries.slice(0, 15).map(function(d) {
              return '<div class="card rounded-xl p-4 flex items-center justify-between"><div><p class="text-sm font-medium text-white">' + d.material + ' — ' + d.quantity + ' ' + d.unit + '</p><p class="text-xs text-slate-500">' + (d.supplier ? d.supplier + ' · ' : '') + (d.receivedBy ? 'received by ' + d.receivedBy : '') + '</p></div><span class="text-xs text-slate-500">' + formatDate(d.date) + '</span></div>';
            }).join('') : '<p class="text-sm text-slate-500">No deliveries logged yet.</p>') + '</div>';

            return '<div class="space-y-4 animate-fade-in">' +
              '<div class="flex items-center justify-between flex-wrap gap-2"><h1 class="font-display text-xl font-bold text-white">Materials</h1><div class="flex gap-2"><button onclick="state.materialFormOpen=!state.materialFormOpen; render();" class="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-lg font-medium text-sm">+ Material</button><button onclick="state.deliveryFormOpen=!state.deliveryFormOpen; render();" class="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-black rounded-lg font-medium text-sm">+ Delivery</button></div></div>' +
              warnBanner + materialForm +
              '<h2 class="font-display font-semibold text-white text-sm">Bill of Materials</h2>' + bomTable +
              deliveryForm +
              '<h2 class="font-display font-semibold text-white text-sm">Delivery Log</h2>' + deliveryLog +
            '</div>';
          }
          function submitMaterial() {
            hapticFeedback();
            if (!state.materialName || !state.materialName.trim()) { alert('Enter a material name.'); return; }
            const payload = { projectId: state.currentProject?.id || 'proj_001', name: state.materialName.trim(), orderedQty: state.materialOrderedQty ? parseInt(state.materialOrderedQty) : 0, unit: state.materialUnit || 'units', expectedDate: state.materialExpectedDate || null, supplier: state.materialSupplier || null, loggedBy: state.currentUser.id };
            const localId = 'local_' + Date.now();
            state.materials.push(Object.assign({ id: localId, deliveredQty: 0 }, payload));
            state.materialName = ''; state.materialOrderedQty = ''; state.materialUnit = 'units'; state.materialExpectedDate = ''; state.materialSupplier = ''; state.materialFormOpen = false;
            render();
            saveMaterial(payload, localId);
          }
          async function saveMaterial(payload, localId) {
            try {
              const res = await fetch('/api/materials', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
              const created = await res.json();
              if (created && created.id) { const idx = state.materials.findIndex(function(m) { return m.id === localId; }); if (idx >= 0) { state.materials[idx].id = created.id; render(); } }
            } catch (e) { console.error('Save material error:', e); }
          }
          function deleteMaterial(id) {
            if (!confirm('Delete this material and its delivery log?')) return;
            state.materials = state.materials.filter(function(m) { return m.id !== id; });
            state.deliveries = state.deliveries.filter(function(d) { return d.materialId !== id; });
            render();
            fetch('/api/materials?id=' + id, { method: 'DELETE' }).catch(function(e) { console.error('Delete material error:', e); });
          }
          function submitDelivery() {
            hapticFeedback();
            if (!state.deliveryMaterialId || !state.deliveryQty || parseInt(state.deliveryQty) <= 0) { alert('Select a material and enter a quantity.'); return; }
            const material = state.materials.find(function(m) { return m.id === state.deliveryMaterialId; });
            if (!material) { alert('Select a material.'); return; }
            const qty = parseInt(state.deliveryQty);
            const payload = { projectId: state.currentProject?.id || 'proj_001', materialId: state.deliveryMaterialId, quantity: qty, supplier: state.deliverySupplier || null, receivedBy: state.deliveryReceivedBy || null, notes: state.deliveryNotes || null, loggedBy: state.currentUser.id };
            state.deliveries.unshift({ id: 'local_' + Date.now(), materialId: material.id, material: material.name, unit: material.unit, quantity: qty, supplier: payload.supplier, receivedBy: payload.receivedBy, date: new Date().toISOString(), notes: payload.notes });
            const idx = state.materials.findIndex(function(m) { return m.id === material.id; });
            if (idx >= 0) state.materials[idx].deliveredQty += qty;
            state.deliveryMaterialId = ''; state.deliveryQty = ''; state.deliverySupplier = ''; state.deliveryReceivedBy = ''; state.deliveryNotes = ''; state.deliveryFormOpen = false;
            render();
            saveDelivery(payload);
          }
          async function saveDelivery(payload) {
            try {
              await fetch('/api/deliveries', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
            } catch (e) { console.error('Save delivery error:', e); }
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
                      failReason: dbInsp.failReason,
                      photos: dbInsp.photos || []
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
                      achievedDepth: dbRef.achievedDepth,
                      notes: dbRef.notes || '',
                      photos: dbRef.photos || []
                    });
                  }
                });
                state.openRefusals = data.filter(r => r.status === 'open').length || data.length;
                render();
              }
            } catch (e) { console.error('Load refusals error:', e); }
          }

          // Loads this project's real daily production log. Previously
          // there was no such route and nothing ever called it - every
          // dashboard/analytics number derived from state.production was
          // reading an array that stayed empty in production (the fake
          // Math.random() figures only ever appeared in the local demo-data
          // fallback, never against a real database).
          async function loadProduction() {
            try {
              const projectId = state.currentProject?.id || 'proj_001';
              const res = await fetch('/api/production?projectId=' + projectId);
              const data = await res.json();
              if (Array.isArray(data)) {
                state.production = data;
                render();
              }
            } catch (e) { console.error('Load production error:', e); }
          }

          // Uploads each captured photo (still a local data: URL at this point)
          // to /api/upload, which stores it in the private bucket and hands
          // back a same-origin URL. Returns the array to persist alongside
          // the inspection/refusal record. A photo that fails to upload is
          // dropped rather than blocking the whole save.
          async function uploadPendingPhotos(photos, context, pileId) {
            const uploaded = [];
            for (const p of (photos || [])) {
              try {
                const res = await fetch('/api/upload', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ dataUrl: p.url, context, pileId })
                });
                const data = await res.json();
                if (data.url) uploaded.push({ key: data.key, url: data.url, timestamp: p.timestamp, gps: p.gps, pendingUpload: data.pendingUpload, uploadContext: data.uploadContext, uploadPileId: data.uploadPileId });
              } catch (e) { console.error('Photo upload error:', e); }
            }
            return uploaded;
          }

          async function saveInspection(inspection, photos) {
            try {
              const projectId = state.currentProject?.id || 'proj_001';
              const uploadedPhotos = await uploadPendingPhotos(photos, 'inspection', inspection.pileId);
              const gps = uploadedPhotos.find(p => p.gps)?.gps || null;
              // depth/plumbNS/plumbEW/failReason: the API route and schema
              // already supported these - the form just never collected
              // them, so they were silently omitted here and saved as null
              // on every inspection regardless of detailed-mode entries.
              await fetch('/api/inspections', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  projectId,
                  pileId: inspection.pileId,
                  status: inspection.status,
                  inspectedBy: state.currentUser.id,
                  depth: inspection.depth,
                  plumbNS: inspection.plumbNS,
                  plumbEW: inspection.plumbEW,
                  pileType: inspection.pileType,
                  heightIn: inspection.heightIn,
                  twistDeg: inspection.twistDeg,
                  spacingIn: inspection.spacingIn,
                  alignmentIn: inspection.alignmentIn,
                  failReason: inspection.failReason,
                  photos: uploadedPhotos,
                  gps
                })
              });
            } catch (e) { console.error('Save inspection error:', e); }
          }
          
          async function saveRefusal(refusal, photos) {
            try {
              const projectId = state.currentProject?.id || 'proj_001';
              const uploadedPhotos = await uploadPendingPhotos(photos, 'refusal', refusal.pileId);
              const gps = uploadedPhotos.find(p => p.gps)?.gps || null;
              await fetch('/api/refusals', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  projectId,
                  pileId: refusal.pileId,
                  reason: refusal.reason,
                  targetDepth: refusal.targetDepth,
                  achievedDepth: refusal.achievedDepth,
                  notes: refusal.notes,
                  reportedBy: state.currentUser.id,
                  photos: uploadedPhotos,
                  gps
                })
              });
            } catch (e) { console.error('Save refusal error:', e); }
          }

          // REFUSAL - WITH PHOTO CAPTURE
          function renderRefusal() {
            const pid = getPileId(state.refusalRow, state.refusalPile);
            const sh = state.achievedDepth ? state.targetDepth - state.achievedDepth : null;
            // Thresholds were calibrated for millimeters (500/200mm); now
            // that depth is in inches, the equivalent cutoffs are ~20/8in.
            const sc = sh !== null ? (sh > 20 ? 'shortfall-critical' : sh > 8 ? 'shortfall-warning' : 'shortfall-minor') : 'shortfall-neutral';
            const shortfallText = sh !== null ? (sh + '"') : 'Enter both depths';
            // Notes field always shows now - the old Quick/Detailed toggle
            // was removed since Notes was the only thing that ever differed
            // between the two modes.
            const notesPanel = '<div class="card rounded-xl p-4 mb-3"><h3 class="font-display font-semibold text-white text-sm mb-3">Notes</h3>' +
              '<textarea id="refusalNotesInput" rows="3" placeholder="What was encountered, crew observations, anything relevant to follow-up..." oninput="state.refusalNotes=this.value" class="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm resize-none">' + (state.refusalNotes || '') + '</textarea></div>';
            return '<div class="space-y-4 animate-fade-in max-w-lg mx-auto"><div class="flex items-center justify-between"><h1 class="font-display text-xl font-bold text-white">Pile Refusals</h1><span class="badge-open px-3 py-1.5 rounded-full text-sm">' + state.openRefusals + ' Open</span></div><div class="pile-display p-6"><div class="flex items-center justify-center gap-4 mb-4"><button onclick="decRefusalPile()" class="nav-arrow nav-arrow-large bg-slate-700 text-white">' + icon('chevron-left', 'w-8 h-8') + '</button><div class="flex-1 text-center"><span class="font-display text-5xl font-bold text-white">' + pid + '</span></div><button onclick="incRefusalPile()" class="nav-arrow nav-arrow-large bg-slate-700 text-white">' + icon('chevron-right', 'w-8 h-8') + '</button></div><div class="flex items-center justify-center gap-3"><button onclick="decRefusalRow()" class="nav-arrow nav-arrow-small bg-slate-700/50 text-slate-300">' + icon('chevron-left', 'w-5 h-5') + '</button><span class="text-sm text-slate-400 px-3">Row #' + state.refusalRow + '</span><button onclick="incRefusalRow()" class="nav-arrow nav-arrow-small bg-slate-700/50 text-slate-300">' + icon('chevron-right', 'w-5 h-5') + '</button></div></div><div class="grid grid-cols-2 gap-3"><div><label class="text-xs text-slate-500 mb-1 block">Target (in)</label><input type="number" id="refusalTarget" value="' + state.targetDepth + '" oninput="updateRefusalShortfall()" class="w-full bg-slate-800 border border-slate-600 rounded-xl px-4 py-3 text-white font-bold"></div><div><label class="text-xs text-slate-500 mb-1 block">Achieved (in)</label><input type="number" id="refusalDepth" value="' + (state.achievedDepth||'') + '" oninput="updateRefusalShortfall()" class="w-full bg-slate-800 border border-slate-600 rounded-xl px-4 py-3 text-white font-bold"></div></div><div id="refusalShortfallBox" class="' + sc + ' rounded-xl p-4 text-center"><span class="text-sm text-slate-400">Shortfall: <span id="refusalShortfallValue">' + shortfallText + '</span></span></div><div><label class="text-xs text-slate-500 mb-2 block">Reason</label><div class="grid grid-cols-4 gap-2">' + ['bedrock', 'cobble', 'obstruction', 'other'].map(r => '<button onclick="setRefusalReason(\\'' + r + '\\')" class="reason-btn ' + (state.refusalReason===r?'reason-btn-selected':'') + '"><span class="text-xs text-white capitalize">' + r + '</span></button>').join('') + '</div></div>' + notesPanel + '<div class="border-t border-slate-700 pt-4 mt-4">' + renderPhotoCapture('refusal') + '</div><button onclick="submitRefusal()" class="w-full py-4 bg-red-600 text-white rounded-xl font-bold mt-4">LOG REFUSAL</button></div>';
          }
          // Updates the Shortfall box live as the Target/Achieved inputs
          // are typed into, without going through render() - a full
          // render() replaces the whole tab's innerHTML, which would kick
          // focus out of whichever field is being typed in. Reads straight
          // from the DOM so it works mid-keystroke, before the value would
          // otherwise commit to state on blur.
          function updateRefusalShortfall() {
            const targetEl = document.getElementById('refusalTarget');
            const achievedEl = document.getElementById('refusalDepth');
            if (!targetEl || !achievedEl) return;
            const t = parseInt(targetEl.value, 10) || 0;
            const aRaw = achievedEl.value;
            const a = aRaw === '' ? null : parseInt(aRaw, 10);
            state.targetDepth = t;
            state.achievedDepth = (a === null || isNaN(a)) ? null : a;
            const sh = state.achievedDepth !== null ? state.targetDepth - state.achievedDepth : null;
            const sc = sh !== null ? (sh > 20 ? 'shortfall-critical' : sh > 8 ? 'shortfall-warning' : 'shortfall-minor') : 'shortfall-neutral';
            const box = document.getElementById('refusalShortfallBox');
            const val = document.getElementById('refusalShortfallValue');
            if (box) box.className = sc + ' rounded-xl p-4 text-center';
            if (val) val.textContent = sh !== null ? (sh + '"') : 'Enter both depths';
          }
          function incRefusalPile() { hapticFeedback(); if (state.refusalPile < state.heatmap.pilesPerRow) state.refusalPile++; render(); }
          function decRefusalPile() { hapticFeedback(); if (state.refusalPile > 1) state.refusalPile--; render(); }
          function incRefusalRow() { hapticFeedback(); if (state.refusalRow < state.heatmap.totalRows) state.refusalRow++; render(); }
          function decRefusalRow() { hapticFeedback(); if (state.refusalRow > 1) state.refusalRow--; render(); }
          function setRefusalReason(reason) { state.refusalReason = reason; render(); }
          function submitRefusal() {
            hapticFeedback();
            const photos = state.refusalPhotos;
            const pileId = getPileId(state.refusalRow, state.refusalPile);
            const refusal = {
              pileId,
              reason: state.refusalReason,
              timestamp: Date.now(),
              user: state.currentUser.name,
              targetDepth: state.targetDepth,
              achievedDepth: state.achievedDepth,
              notes: state.refusalNotes || null
            };
            // Replace, don't append, for the same reason as recordInspection:
            // re-logging a refusal for a pile that already has one shouldn't
            // leave two local entries with the older one winning lookups.
            const existingIdx = state.refusals.findIndex(r => r.pileId === pileId);
            const isNew = existingIdx < 0;
            if (existingIdx >= 0) state.refusals[existingIdx] = refusal; else state.refusals.push(refusal);
            if (isNew) {
              state.openRefusals++;
              if (state.currentProject) state.currentProject.refusalCount = (state.currentProject.refusalCount || 0) + 1;
            }
            if (state.refusalPile < state.heatmap.pilesPerRow) state.refusalPile++;
            state.achievedDepth = null;
            state.refusalReason = null;
            state.refusalNotes = '';
            state.refusalPhotos = [];
            render();
            // Save to database
            saveRefusal(refusal, photos);
          }

          // WEATHER & DELAY LOGGING - one entry per project per calendar
          // day, same shape as Production but for non-productive days, so
          // there's a real record to back up schedule conversations.
          function renderDelays() {
            const reasons = [
              { id: 'weather', label: 'Weather' },
              { id: 'permitting_hold', label: 'Permitting' },
              { id: 'equipment_down', label: 'Equipment' },
              { id: 'material_shortage', label: 'Materials' },
              { id: 'other', label: 'Other' }
            ];
            const recent = state.delays.slice(0, 10);
            return '<div class="space-y-4 animate-fade-in max-w-lg mx-auto">' +
              '<div class="flex items-center justify-between"><h1 class="font-display text-xl font-bold text-white">Delays</h1><span class="text-sm text-slate-500">' + state.delays.length + ' logged</span></div>' +
              '<div class="card rounded-xl p-5 space-y-4">' +
                '<div><label class="text-xs text-slate-500 uppercase mb-1.5 block">Date</label><input type="date" id="delayDateInput" value="' + state.delayDate + '" oninput="state.delayDate=this.value" class="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-3 text-white"></div>' +
                '<div><label class="text-xs text-slate-500 uppercase mb-2 block">Reason</label><div class="grid grid-cols-3 gap-2">' + reasons.map(r => '<button onclick="setDelayReason(\\'' + r.id + '\\')" class="reason-btn ' + (state.delayReason === r.id ? 'reason-btn-selected' : '') + '"><span class="text-xs text-white">' + r.label + '</span></button>').join('') + '</div></div>' +
                '<div><label class="text-xs text-slate-500 mb-1 block">Hours Lost (optional)</label><input type="number" step="0.5" min="0" max="24" id="delayHoursInput" value="' + (state.delayHours || '') + '" oninput="state.delayHours=this.value" class="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-3 text-white font-bold"></div>' +
                '<div><label class="text-xs text-slate-500 uppercase mb-1.5 block">Notes</label><textarea id="delayDescInput" rows="2" placeholder="Any detail worth keeping for the record..." oninput="state.delayDescription=this.value" class="w-full bg-slate-900 border border-slate-600 rounded-xl px-4 py-3 text-white resize-none text-sm">' + (state.delayDescription || '') + '</textarea></div>' +
                '<button onclick="submitDelay()" class="w-full py-4 bg-amber-500 hover:bg-amber-400 text-black rounded-xl font-bold text-lg">Log Delay</button>' +
              '</div>' +
              '<div class="card rounded-xl p-5"><h3 class="font-display font-semibold text-white text-sm mb-3">Recent Delays</h3>' + (recent.length > 0 ? '<div class="space-y-2">' + recent.map(d => '<div class="flex items-center justify-between py-2 border-b border-slate-700/50 last:border-0"><div><p class="text-sm text-white capitalize">' + d.reason.replace(/_/g, ' ') + '</p><p class="text-xs text-slate-500">' + formatDate(d.date) + (d.description ? ' · ' + d.description : '') + '</p></div>' + (d.hoursLost ? '<span class="text-xs text-slate-400">' + d.hoursLost + 'h</span>' : '') + '</div>').join('') + '</div>' : '<p class="text-sm text-slate-500">No delays logged yet.</p>') + '</div>' +
            '</div>';
          }
          function setDelayReason(reason) { hapticFeedback(); state.delayReason = reason; render(); }
          function submitDelay() {
            hapticFeedback();
            if (!state.delayReason) { alert('Select a reason for the delay.'); return; }
            const delay = {
              date: state.delayDate,
              reason: state.delayReason,
              description: state.delayDescription || null,
              hoursLost: state.delayHours ? parseFloat(state.delayHours) : null,
              user: state.currentUser.name
            };
            const existingIdx = state.delays.findIndex(d => d.date === delay.date);
            if (existingIdx >= 0) state.delays[existingIdx] = delay; else state.delays.unshift(delay);
            state.delays.sort(function(a, b) { return b.date.localeCompare(a.date); });
            state.delayReason = null;
            state.delayHours = '';
            state.delayDescription = '';
            render();
            saveDelay(delay);
          }
          async function saveDelay(delay) {
            try {
              const projectId = state.currentProject?.id || 'proj_001';
              await fetch('/api/delays', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  projectId,
                  date: delay.date,
                  reason: delay.reason,
                  description: delay.description,
                  hoursLost: delay.hoursLost,
                  loggedBy: state.currentUser.id
                })
              });
            } catch (e) { console.error('Save delay error:', e); }
          }
          async function loadDelays() {
            try {
              const projectId = state.currentProject?.id || 'proj_001';
              const res = await fetch('/api/delays?projectId=' + projectId);
              const data = await res.json();
              if (Array.isArray(data)) {
                state.delays = data;
                render();
              }
            } catch (e) { console.error('Load delays error:', e); }
          }

          // CLOSEOUT PUNCH LIST - not tied to a pile-by-pile flow like the
          // field-entry screens above; this is a filterable list with an
          // add-item form and per-item status controls, closer in shape to
          // the Settings tables than to the Refusal pattern.
          function renderPunchList() {
            const filters = [
              { id: 'open', label: 'Open' },
              { id: 'in_progress', label: 'In Progress' },
              { id: 'resolved', label: 'Resolved' },
              { id: 'all', label: 'All' }
            ];
            const items = state.punchFilter === 'all' ? state.punchItems : state.punchItems.filter(function(p) { return p.status === state.punchFilter; });
            const openCount = state.punchItems.filter(function(p) { return p.status !== 'resolved'; }).length;
            const canDelete = hasRole('admin');
            const priorityColor = { high: 'text-red-400', medium: 'text-amber-400', low: 'text-slate-400' };
            const addForm = state.punchFormOpen ? (
              '<div class="card rounded-xl p-5 space-y-3 mb-4">' +
                '<h3 class="font-display font-semibold text-white text-sm">New Punch Item</h3>' +
                '<div><label class="text-xs text-slate-500 mb-1 block">Description</label><textarea id="punchDescInput" rows="2" placeholder="What needs to be fixed or finished..." oninput="state.punchDescription=this.value" class="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm resize-none">' + (state.punchDescription || '') + '</textarea></div>' +
                '<div class="grid grid-cols-2 gap-3">' +
                  '<div><label class="text-xs text-slate-500 mb-1 block">Location</label><input type="text" id="punchLocationInput" value="' + (state.punchLocation || '') + '" oninput="state.punchLocation=this.value" placeholder="e.g. Row 12 / pile 12-4" class="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm"></div>' +
                  '<div><label class="text-xs text-slate-500 mb-1 block">Assigned To</label><input type="text" id="punchAssignedInput" value="' + (state.punchAssignedTo || '') + '" oninput="state.punchAssignedTo=this.value" class="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm"></div>' +
                '</div>' +
                '<div class="grid grid-cols-2 gap-3">' +
                  '<div><label class="text-xs text-slate-500 mb-1 block">Priority</label><div class="grid grid-cols-3 gap-2">' + ['low', 'medium', 'high'].map(function(p) { return '<button onclick="setPunchPriority(\\'' + p + '\\')" class="reason-btn text-xs py-2 capitalize ' + (state.punchPriority === p ? 'reason-btn-selected text-white' : 'text-slate-300') + '">' + p + '</button>'; }).join('') + '</div></div>' +
                  '<div><label class="text-xs text-slate-500 mb-1 block">Due Date</label><input type="date" id="punchDueInput" value="' + (state.punchDueDate || '') + '" oninput="state.punchDueDate=this.value" class="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm"></div>' +
                '</div>' +
                renderPhotoCapture('punchlist') +
                '<div class="flex gap-2"><button onclick="submitPunchItem()" class="flex-1 py-3 bg-amber-500 hover:bg-amber-400 text-black rounded-xl font-bold text-sm">Add Item</button><button onclick="closePunchForm()" class="px-4 py-3 bg-slate-700 text-slate-300 rounded-xl font-medium text-sm">Cancel</button></div>' +
              '</div>'
            ) : '';
            return '<div class="space-y-4 animate-fade-in">' +
              '<div class="flex items-center justify-between"><div><h1 class="font-display text-xl font-bold text-white">Punch List</h1><p class="text-sm text-slate-500">' + openCount + ' open item' + (openCount === 1 ? '' : 's') + '</p></div>' + (state.punchFormOpen ? '' : '<button onclick="openPunchForm()" class="px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-black rounded-xl font-bold text-sm flex items-center gap-2">' + icon('plus', 'w-4 h-4') + ' New Item</button>') + '</div>' +
              addForm +
              '<div class="flex gap-1 p-1 bg-slate-800/50 rounded-xl overflow-x-auto max-w-md">' + filters.map(function(f) { return '<button onclick="setPunchFilter(\\'' + f.id + '\\')" class="flex-1 px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ' + (state.punchFilter === f.id ? 'bg-amber-500 text-black' : 'text-slate-400 hover:text-white') + '">' + f.label + '</button>'; }).join('') + '</div>' +
              (items.length === 0 ? '<div class="card rounded-xl p-8 text-center text-slate-500 text-sm">No ' + (state.punchFilter === 'all' ? '' : state.punchFilter.replace('_', ' ') + ' ') + 'punch items.</div>' :
              '<div class="space-y-3">' + items.map(function(p) {
                const dueLabel = p.dueDate ? new Date(p.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : null;
                const overdue = p.dueDate && p.status !== 'resolved' && new Date(p.dueDate).getTime() < Date.now();
                return '<div class="card rounded-xl p-4">' +
                  '<div class="flex items-start justify-between gap-3">' +
                    '<div class="flex-1 min-w-0"><p class="text-white text-sm">' + p.description + '</p>' +
                    '<div class="flex flex-wrap gap-x-3 gap-y-1 mt-1.5 text-xs text-slate-500">' +
                      (p.location ? '<span>' + p.location + '</span>' : '') +
                      (p.assignedTo ? '<span>' + p.assignedTo + '</span>' : '') +
                      '<span class="' + (priorityColor[p.priority] || 'text-slate-400') + ' capitalize">' + p.priority + '</span>' +
                      (dueLabel ? '<span class="' + (overdue ? 'text-red-400' : '') + '">Due ' + dueLabel + '</span>' : '') +
                    '</div></div>' +
                    (canDelete ? '<button onclick="deletePunchItem(\\'' + p.id + '\\')" class="p-1.5 text-slate-500 hover:text-red-400">' + icon('trash-2', 'w-4 h-4') + '</button>' : '') +
                  '</div>' +
                  (p.photos && p.photos.length > 0 ? '<div class="photo-grid mt-3">' + p.photos.slice(0, 4).map(function(ph) { return '<div class="photo-thumb"><img src="' + ph.url + '" alt="Photo"></div>'; }).join('') + '</div>' : '') +
                  '<div class="flex gap-2 mt-3">' +
                    (p.status !== 'open' ? '<button onclick="setPunchStatus(\\'' + p.id + '\\', \\'open\\')" class="px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-700 text-slate-300">Reopen</button>' : '') +
                    (p.status !== 'in_progress' ? '<button onclick="setPunchStatus(\\'' + p.id + '\\', \\'in_progress\\')" class="px-3 py-1.5 rounded-lg text-xs font-medium bg-amber-500/20 text-amber-400">In Progress</button>' : '') +
                    (p.status !== 'resolved' ? '<button onclick="setPunchStatus(\\'' + p.id + '\\', \\'resolved\\')" class="px-3 py-1.5 rounded-lg text-xs font-medium bg-green-600 text-white">Resolve</button>' : '<span class="px-3 py-1.5 rounded-lg text-xs font-medium bg-green-600/20 text-green-400">Resolved</span>') +
                  '</div>' +
                '</div>';
              }).join('') + '</div>') +
            '</div>';
          }
          function openPunchForm() { state.punchFormOpen = true; render(); }
          function closePunchForm() {
            state.punchFormOpen = false;
            state.punchDescription = '';
            state.punchLocation = '';
            state.punchPriority = 'medium';
            state.punchAssignedTo = '';
            state.punchDueDate = '';
            state.punchNotes = '';
            state.punchPhotos = [];
            render();
          }
          function setPunchPriority(p) { state.punchPriority = p; render(); }
          function setPunchFilter(f) { state.punchFilter = f; render(); }
          async function submitPunchItem() {
            hapticFeedback();
            if (!state.punchDescription || !state.punchDescription.trim()) { alert('Enter a description for this punch item.'); return; }
            const uploadedPhotos = await uploadPendingPhotos(state.punchPhotos, 'punchlist', 'punch');
            try {
              const projectId = state.currentProject?.id || 'proj_001';
              const res = await fetch('/api/punchlist', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  projectId,
                  description: state.punchDescription.trim(),
                  location: state.punchLocation || null,
                  priority: state.punchPriority,
                  assignedTo: state.punchAssignedTo || null,
                  dueDate: state.punchDueDate || null,
                  photos: uploadedPhotos,
                  createdBy: state.currentUser.id
                })
              });
              const created = await res.json();
              if (created && created.id) {
                state.punchItems.unshift({
                  id: created.id,
                  description: created.description,
                  location: created.location,
                  status: created.status,
                  priority: created.priority,
                  assignedTo: created.assignedTo,
                  dueDate: created.dueDate,
                  notes: created.notes,
                  photos: uploadedPhotos,
                  resolvedAt: created.resolvedAt,
                  createdBy: state.currentUser.name,
                  createdAt: created.createdAt
                });
              }
            } catch (e) { console.error('Save punch item error:', e); }
            closePunchForm();
          }
          async function setPunchStatus(id, status) {
            hapticFeedback();
            const item = state.punchItems.find(function(p) { return p.id === id; });
            if (!item) return;
            item.status = status;
            if (status === 'resolved') item.resolvedAt = new Date().toISOString();
            render();
            try {
              await fetch('/api/punchlist', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id, projectId: state.currentProject?.id || 'proj_001', status })
              });
            } catch (e) { console.error('Update punch status error:', e); }
          }
          async function deletePunchItem(id) {
            if (!confirm('Delete this punch item? This cannot be undone.')) return;
            hapticFeedback();
            state.punchItems = state.punchItems.filter(function(p) { return p.id !== id; });
            render();
            try {
              const res = await fetch('/api/punchlist?id=' + id, { method: 'DELETE' });
              if (!res.ok) {
                const err = await res.json().catch(function() { return {}; });
                alert(err.error || 'Failed to delete punch item.');
                loadPunchItems();
              }
            } catch (e) { console.error('Delete punch item error:', e); }
          }
          async function loadPunchItems() {
            try {
              const projectId = state.currentProject?.id || 'proj_001';
              const res = await fetch('/api/punchlist?projectId=' + projectId);
              const data = await res.json();
              if (Array.isArray(data)) {
                state.punchItems = data;
                render();
              }
            } catch (e) { console.error('Load punch items error:', e); }
          }

          // PRODUCTION - WITH PHOTO CAPTURE
          function renderProduction() {
            const todayStr = localDateStr(Date.now());
            return '<div class="space-y-4 animate-fade-in max-w-lg mx-auto"><div><h1 class="font-display text-xl font-bold text-white">Production Entry</h1></div><div class="bg-slate-800/50 border border-slate-700 rounded-xl p-5 space-y-4"><div><label class="text-xs text-slate-500 uppercase mb-1.5 block">Date</label><input type="date" id="prodDate" value="' + todayStr + '" max="' + todayStr + '" class="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-3 text-white"><p class="text-xs text-slate-500 mt-1">Logging counts/photos for an earlier day? Pick that date here.</p></div><div><label class="text-xs text-slate-500 uppercase mb-1.5 block">Crew</label><select id="prodCrew" class="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-3 text-white"><option value="">Select...</option>' + state.crews.map(c => '<option value="' + c.id + '">' + c.name + '</option>').join('') + '</select></div><div><label class="text-xs text-slate-500 uppercase mb-1.5 block">Subcontractor</label><select id="prodSubcontractor" class="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-3 text-white"><option value="">Select...</option>' + state.subcontractors.map(s => '<option value="' + s.id + '">' + s.name + '</option>').join('') + '</select></div><div class="grid grid-cols-3 gap-3"><div><label class="text-xs text-slate-500 mb-1 block">Piles</label><input type="number" id="prodPiles" min="0" class="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-3 text-white font-mono text-center" placeholder="0"></div><div><label class="text-xs text-slate-500 mb-1 block">Tables</label><input type="number" id="prodTables" min="0" class="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-3 text-white font-mono text-center" placeholder="0"></div><div><label class="text-xs text-slate-500 mb-1 block">Modules</label><input type="number" id="prodModules" min="0" class="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-3 text-white font-mono text-center" placeholder="0"></div></div><div><label class="text-xs text-slate-500 uppercase mb-1.5 block">Notes</label><textarea id="prodNotes" rows="2" placeholder="Any issues or notes..." class="w-full bg-slate-900 border border-slate-600 rounded-xl px-4 py-3 text-white resize-none text-sm"></textarea></div><div>' + renderPhotoCapture('production') + '</div><button onclick="submitProduction()" class="w-full py-4 bg-amber-500 hover:bg-amber-400 text-black rounded-xl font-bold text-lg">Submit</button></div></div>';
          }
          // Previously this just showed an alert and threw away everything
          // typed into the form - nothing was ever read from the inputs or
          // sent anywhere, and there was no API route to receive it if it
          // had been. Every "production" figure on every dashboard, report,
          // and analytics chart was reading an array that could never
          // contain real data. This now actually reads the form, persists
          // it per-project via /api/production, and keeps the current
          // project's cached installedPiles count in sync with the server.
          async function submitProduction() {
            hapticFeedback();
            // Defaults to today (the date input is pre-filled and capped at
            // today), but a field crew logging yesterday's counts the next
            // morning can back-date this to whichever day the work actually
            // happened. Picking a date that already has an entry updates
            // that day's totals rather than adding a second entry for it -
            // same upsert-by-day behavior /api/production already had.
            const dateStr = document.getElementById('prodDate')?.value || null;
            const pilesInstalled = parseInt(document.getElementById('prodPiles')?.value) || 0;
            // Was appended into the Notes text as "N tables, N modules" -
            // now stored as real numeric fields so the dashboards can chart
            // them the same way they chart piles.
            const tablesInstalled = parseInt(document.getElementById('prodTables')?.value) || 0;
            const modulesInstalled = parseInt(document.getElementById('prodModules')?.value) || 0;
            const crewId = document.getElementById('prodCrew')?.value || null;
            const subcontractorId = document.getElementById('prodSubcontractor')?.value || null;
            const notes = (document.getElementById('prodNotes')?.value || '').trim();

            if (pilesInstalled <= 0 && tablesInstalled <= 0 && modulesInstalled <= 0 && !notes) {
              alert('Enter a pile, table or module count, or a note, before submitting.');
              return;
            }

            const photos = state.productionEntry.photos;
            const projectId = state.currentProject?.id || 'proj_001';
            try {
              const uploadedPhotos = await uploadPendingPhotos(photos, 'production', projectId);
              const res = await fetch('/api/production', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  projectId,
                  pilesInstalled,
                  tablesInstalled,
                  modulesInstalled,
                  date: dateStr || undefined,
                  crewId,
                  subcontractorId,
                  notes: notes || undefined,
                  loggedBy: state.currentUser.id,
                  photos: uploadedPhotos
                })
              });
              const data = await res.json();
              if (state.currentProject && typeof data.installedPiles === 'number') {
                state.currentProject.installedPiles = data.installedPiles;
                state.currentProject.tablesInstalled = data.tablesInstalled;
                state.currentProject.modulesInstalled = data.modulesInstalled;
                const proj = state.projects.find(p => p.id === projectId);
                if (proj) {
                  proj.installedPiles = data.installedPiles;
                  proj.tablesInstalled = data.tablesInstalled;
                  proj.modulesInstalled = data.modulesInstalled;
                }
              }
              state.productionEntry = { crew: null, subcontractor: null, notes: '', photos: [] };
              await loadProduction();
              alert('Production entry saved.');
            } catch (e) {
              console.error('Save production error:', e);
              alert('Failed to save production entry - check your connection and try again.');
            }
          }

          function renderSettings() {
            const tabs = [
              { id: 'company', label: 'Company', icon: 'building-2' },
              { id: 'projects', label: 'Projects', icon: 'folder' },
              { id: 'crews', label: 'Crews', icon: 'users' },
              { id: 'subcontractors', label: 'Subcontractors', icon: 'hard-hat' },
              { id: 'racking', label: 'Racking', icon: 'sliders-horizontal' },
              { id: 'pileLayout', label: 'Pile Layout', icon: 'layout-grid' },
              { id: 'users', label: 'Users', icon: 'user' },
            ];
            
            return '<div class="space-y-6 animate-fade-in">' +
              '<div class="flex items-center justify-between"><div><h1 class="font-display text-2xl font-bold text-white">Settings</h1><p class="text-slate-400">Manage your organization</p></div></div>' +
              '<div class="flex gap-1 p-1 bg-slate-800/50 rounded-xl overflow-x-auto">' + tabs.map(t => '<button onclick="setSettingsTab(\\'' + t.id + '\\')" class="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium whitespace-nowrap transition-all ' + (state.settingsTab === t.id ? 'bg-amber-500 text-black' : 'text-slate-400 hover:text-white hover:bg-slate-700/50') + '">' + icon(t.icon, 'w-4 h-4') + t.label + '</button>').join('') + '</div>' +
              '<div id="settingsContent">' + renderSettingsContent() + '</div>' +
              (state.editingItem ? renderEditModal() : '') +
            '</div>';
          }
          
          function setSettingsTab(tab) { state.settingsTab = tab; render(); }
          
          function renderSettingsContent() {
            switch(state.settingsTab) {
              case 'company': return renderCompanySettings();
              case 'projects': return renderProjectsSettings();
              case 'crews': return renderCrewsSettings();
              case 'subcontractors': return renderSubcontractorsSettings();
              case 'racking': return renderRackingSettings();
              case 'pileLayout': return renderPileLayoutSettings();
              case 'users': return renderUsersSettings();
              default: return renderCompanySettings();
            }
          }
          
          function renderCompanySettings() {
            const company = state.company || { name: 'Loading...', tier: 'starter' };
            const canEdit = hasRole('admin');
            const dis = canEdit ? '' : ' disabled';
            return '<div class="card rounded-xl p-6">' +
              '<h3 class="font-display font-semibold text-white mb-6">Company Information</h3>' +
              (canEdit ? '' : '<p class="text-xs text-slate-500 mb-4">View only - ask an admin to change company settings.</p>') +
              '<div class="space-y-4">' +
                '<div><label class="text-xs text-slate-500 uppercase mb-2 block">Company Name</label>' +
                '<input type="text" id="companyName" value="' + (company.name || '') + '"' + dis + ' class="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white disabled:opacity-50" placeholder="Enter company name"></div>' +
                '<div><label class="text-xs text-slate-500 uppercase mb-2 block">Subscription Tier</label>' +
                '<select id="companyTier"' + dis + ' class="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white disabled:opacity-50">' +
                  '<option value="starter" ' + (company.tier === 'starter' ? 'selected' : '') + '>Starter</option>' +
                  '<option value="professional" ' + (company.tier === 'professional' ? 'selected' : '') + '>Professional</option>' +
                  '<option value="enterprise" ' + (company.tier === 'enterprise' ? 'selected' : '') + '>Enterprise</option>' +
                '</select></div>' +
                (canEdit ? '<button onclick="saveCompanySettings()" class="w-full py-3 bg-amber-500 hover:bg-amber-400 text-black rounded-lg font-semibold">Save Changes</button>' : '') +
              '</div>' +
            '</div>';
          }
          
          function renderProjectsSettings() {
            const canEdit = hasRole('manager');
            const canDelete = hasRole('admin');
            const canReorder = canEdit && state.projects.length > 1;
            return '<div class="space-y-4">' +
              (canEdit ? '<div class="flex justify-end">' +
                '<button onclick="openEditModal(\\'project\\', null)" class="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-black rounded-lg font-medium text-sm flex items-center gap-2">' + icon('plus', 'w-4 h-4') + ' New Project</button>' +
              '</div>' : '<p class="text-xs text-slate-500">View only - ask a manager or admin to make changes.</p>') +
              (canReorder ? '<p class="text-xs text-slate-500">Drag ' + icon('grip-vertical', 'w-3 h-3 inline -mt-0.5') + ' to reorder - this is the order used everywhere projects are listed (sidebar, dashboard, here).</p>' : '') +
              '<div class="grid gap-4" id="projectOrderList">' +
                (state.projects.length === 0 ? '<p class="text-slate-400 text-center py-8">No projects yet. Create your first project above.</p>' :
                state.projects.map(p => '<div class="card rounded-xl p-5 project-order-row" id="project-card-' + p.id + '" data-project-id="' + p.id + '">' +
                  '<div class="flex items-start gap-3">' +
                    (canReorder ? '<div class="project-drag-handle" onpointerdown="startProjectReorder(event, \\'' + p.id + '\\')" title="Drag to reorder">' + icon('grip-vertical', 'w-5 h-5') + '</div>' : '') +
                    '<div class="flex-1 min-w-0">' +
                      '<div class="flex items-start justify-between mb-3">' +
                        '<div><h4 class="font-semibold text-white">' + p.name + '</h4>' +
                        '<p class="text-sm text-slate-400">' + p.location + '</p></div>' +
                        '<span class="px-2 py-1 text-xs rounded ' + (p.status === 'active' ? 'bg-green-500/20 text-green-400' : p.status === 'completed' ? 'bg-blue-500/20 text-blue-400' : 'bg-slate-500/20 text-slate-400') + '">' + p.status + '</span>' +
                      '</div>' +
                      '<div class="grid grid-cols-3 gap-2 text-xs text-slate-400 mb-3">' +
                        '<div><span class="block text-slate-500">Total Piles</span><span class="text-white font-medium">' + p.totalPiles + '</span></div>' +
                        '<div><span class="block text-slate-500">Rows</span><span class="text-white font-medium">' + p.totalRows + '</span></div>' +
                        '<div><span class="block text-slate-500">Piles/Row</span><span class="text-white font-medium">' + p.pilesPerRow + '</span></div>' +
                      '</div>' +
                      (canEdit || canDelete ? '<div class="flex gap-2">' +
                        (canEdit ? '<button onclick="openEditModal(\\'project\\', ' + (p.id ? '\\'' + p.id + '\\'' : 'null') + ')" class="flex-1 py-2 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-lg text-sm">Edit</button>' : '') +
                        (canDelete ? '<button onclick="resetProductionData(\\'' + p.id + '\\', \\'' + p.name.replace(/'/g, "\\\\'") + '\\')" title="Reset production/QC test data" class="py-2 px-3 bg-orange-500/20 hover:bg-orange-500/30 text-orange-400 rounded-lg text-sm">' + icon('eraser', 'w-4 h-4') + '</button>' : '') +
                        (canDelete ? '<button onclick="deleteItem(\\'project\\', ' + (p.id ? '\\'' + p.id + '\\'' : 'null') + ')" class="py-2 px-3 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg text-sm">' + icon('trash-2', 'w-4 h-4') + '</button>' : '') +
                      '</div>' : '') +
                    '</div>' +
                  '</div>' +
                '</div>').join('')) +
              '</div>' +
            '</div>';
          }

          // Manual project ordering (Settings -> Projects): drag the grip
          // handle to reorder, the same interaction as iOS Weather's city
          // cards. Pointer Events (not HTML5 drag-and-drop, which mobile
          // Safari/Chrome don't support) so one code path handles mouse and
          // touch. The pointermove/pointerup listeners below go on the
          // document object, never on anything inside #app - render()
          // replaces that entire subtree on nearly any state change (see
          // the addEventListener note elsewhere in this file), so a
          // listener attached to a row would be dragging an orphaned node
          // the moment an unrelated state change re-rendered mid-drag. The
          // document object itself is never replaced, so it's safe for the
          // drag's lifetime.
          let projectDragState = null;

          function startProjectReorder(e, projectId) {
            e.preventDefault();
            const row = document.getElementById('project-card-' + projectId);
            const list = document.getElementById('projectOrderList');
            if (!row || !list) return;
            const gap = parseFloat(getComputedStyle(list).rowGap) || 16;
            projectDragState = {
              projectId: projectId,
              row: row,
              rows: Array.from(list.querySelectorAll('.project-order-row')),
              startY: e.clientY,
              rowHeight: row.offsetHeight + gap,
              order: state.projects.map(function(p) { return p.id; }),
            };
            row.classList.add('dragging');
            document.addEventListener('pointermove', onProjectReorderMove);
            document.addEventListener('pointerup', endProjectReorder);
            document.addEventListener('pointercancel', endProjectReorder);
          }

          function onProjectReorderMove(e) {
            const d = projectDragState;
            if (!d) return;
            d.row.style.transform = 'translateY(' + (e.clientY - d.startY) + 'px)';

            // The dragged row is the only element actually under the
            // pointer - everything else gets repositioned with a CSS
            // transform based on its slot in the in-memory order, never
            // moved in the real DOM, so the drag can't be interrupted by a
            // render().
            const draggedIndex = d.order.indexOf(d.projectId);
            const draggedRect = d.row.getBoundingClientRect();
            const draggedMid = draggedRect.top + draggedRect.height / 2;
            d.rows.forEach(function(sibling) {
              const siblingId = sibling.dataset.projectId;
              if (siblingId === d.projectId) return;
              const siblingIndex = d.order.indexOf(siblingId);
              const rect = sibling.getBoundingClientRect();
              const siblingMid = rect.top + rect.height / 2;
              const movingDown = siblingIndex > draggedIndex;
              const crossed = movingDown ? draggedMid > siblingMid : draggedMid < siblingMid;
              if (crossed) {
                d.order.splice(draggedIndex, 1);
                const newIndex = d.order.indexOf(siblingId);
                d.order.splice(movingDown ? newIndex + 1 : newIndex, 0, d.projectId);
              }
            });
            d.rows.forEach(function(el) {
              const id = el.dataset.projectId;
              if (id === d.projectId) return;
              const originalIndex = d.rows.indexOf(el);
              const newIndex = d.order.indexOf(id);
              el.style.transition = 'transform 0.15s ease';
              el.style.transform = 'translateY(' + ((newIndex - originalIndex) * d.rowHeight) + 'px)';
            });
          }

          async function endProjectReorder() {
            const d = projectDragState;
            if (!d) return;
            document.removeEventListener('pointermove', onProjectReorderMove);
            document.removeEventListener('pointerup', endProjectReorder);
            document.removeEventListener('pointercancel', endProjectReorder);
            projectDragState = null;

            const newOrder = d.order;
            state.projects = newOrder.map(function(id) { return state.projects.find(function(p) { return p.id === id; }); }).filter(Boolean);
            render();

            try {
              const response = await fetch('/api/settings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ type: 'reorderProjects', companyId: state.companyId, data: { orderedIds: newOrder } }),
              });
              if (!response.ok) console.error('Failed to save project order:', response.status);
            } catch (err) {
              console.error('Failed to save project order:', err);
            }
          }

          function renderCrewsSettings() {
            const canEdit = hasRole('manager');
            const canDelete = hasRole('admin');
            return '<div class="space-y-4">' +
              (canEdit ? '<div class="flex justify-end">' +
                '<button onclick="openEditModal(\\'crew\\', null)" class="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-black rounded-lg font-medium text-sm flex items-center gap-2">' + icon('plus', 'w-4 h-4') + ' New Crew</button>' +
              '</div>' : '<p class="text-xs text-slate-500">View only - ask a manager or admin to make changes.</p>') +
              '<div class="grid gap-4">' +
                (state.crews.length === 0 ? '<p class="text-slate-400 text-center py-8">No crews yet. Create your first crew above.</p>' :
                state.crews.map(c => '<div class="card rounded-xl p-5">' +
                  '<div class="flex items-start justify-between mb-3">' +
                    '<div><h4 class="font-semibold text-white">' + c.name + '</h4>' +
                    '<p class="text-sm text-slate-400">Lead: ' + (c.lead || 'Not assigned') + '</p></div>' +
                    '<span class="px-2 py-1 text-xs rounded ' + (c.status === 'active' ? 'bg-green-500/20 text-green-400' : 'bg-slate-500/20 text-slate-400') + '">' + c.status + '</span>' +
                  '</div>' +
                  '<p class="text-sm text-slate-400 mb-3">' + (c.workerCount || 8) + ' workers</p>' +
                  (canEdit || canDelete ? '<div class="flex gap-2">' +
                    (canEdit ? '<button onclick="openEditModal(\\'crew\\', ' + (c.id ? '\\'' + c.id + '\\'' : 'null') + ')" class="flex-1 py-2 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-lg text-sm">Edit</button>' : '') +
                    (canDelete ? '<button onclick="deleteItem(\\'crew\\', ' + (c.id ? '\\'' + c.id + '\\'' : 'null') + ')" class="py-2 px-3 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg text-sm">' + icon('trash-2', 'w-4 h-4') + '</button>' : '') +
                  '</div>' : '') +
                '</div>').join('')) +
              '</div>' +
            '</div>';
          }
          
          function renderSubcontractorsSettings() {
            const canEdit = hasRole('manager');
            const canDelete = hasRole('admin');
            return '<div class="space-y-4">' +
              (canEdit ? '<div class="flex justify-end">' +
                '<button onclick="openEditModal(\\'subcontractor\\', null)" class="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-black rounded-lg font-medium text-sm flex items-center gap-2">' + icon('plus', 'w-4 h-4') + ' New Subcontractor</button>' +
              '</div>' : '<p class="text-xs text-slate-500">View only - ask a manager or admin to make changes.</p>') +
              '<div class="grid gap-4">' +
                (state.subcontractors.length === 0 ? '<p class="text-slate-400 text-center py-8">No subcontractors yet. Add your first one above.</p>' :
                state.subcontractors.map(s => '<div class="card rounded-xl p-5">' +
                  '<div class="flex items-start justify-between mb-3">' +
                    '<div><h4 class="font-semibold text-white">' + s.name + '</h4>' +
                    '<p class="text-sm text-slate-400">' + (s.contactPerson || 'No contact on file') + '</p></div>' +
                  '</div>' +
                  '<div class="grid grid-cols-2 gap-2 text-xs text-slate-400 mb-3">' +
                    '<div><span class="block text-slate-500">Phone</span><span class="text-white font-medium">' + (s.phone || '—') + '</span></div>' +
                    '<div><span class="block text-slate-500">Email</span><span class="text-white font-medium">' + (s.email || '—') + '</span></div>' +
                  '</div>' +
                  (canEdit || canDelete ? '<div class="flex gap-2">' +
                    (canEdit ? '<button onclick="openEditModal(\\'subcontractor\\', ' + (s.id ? '\\'' + s.id + '\\'' : 'null') + ')" class="flex-1 py-2 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-lg text-sm">Edit</button>' : '') +
                    (canDelete ? '<button onclick="deleteItem(\\'subcontractor\\', ' + (s.id ? '\\'' + s.id + '\\'' : 'null') + ')" class="py-2 px-3 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg text-sm">' + icon('trash-2', 'w-4 h-4') + '</button>' : '') +
                  '</div>' : '') +
                '</div>').join('')) +
              '</div>' +
            '</div>';
          }
          
          function renderRackingSettings() {
            const canEdit = hasRole('manager');
            const canDelete = hasRole('admin');
            return '<div class="space-y-4">' +
              (canEdit ? '<div class="flex justify-end">' +
                '<button onclick="openEditModal(\\'rackingProfile\\', null)" class="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-black rounded-lg font-medium text-sm flex items-center gap-2">' + icon('plus', 'w-4 h-4') + ' New Profile</button>' +
              '</div>' : '<p class="text-xs text-slate-500">View only - ask a manager or admin to make changes.</p>') +
              '<div class="grid gap-4">' +
                (state.rackingProfiles.length === 0 ? '<p class="text-slate-400 text-center py-8">No racking profiles yet.</p>' :
                state.rackingProfiles.map(r => '<div class="card rounded-xl p-5">' +
                  '<div class="flex items-start justify-between mb-3">' +
                    '<div><h4 class="font-semibold text-white">' + r.name + '</h4>' +
                    '<p class="text-sm text-slate-400">' + (r.manufacturer || r.name) + '</p></div>' +
                    '<span class="px-2 py-1 text-xs rounded ' + (r.isActive ? 'bg-green-500/20 text-green-400' : 'bg-slate-500/20 text-slate-400') + '">' + (r.isActive ? 'Active' : 'Inactive') + '</span>' +
                  '</div>' +
                  (Array.isArray(r.pileTypeSpecs) && r.pileTypeSpecs.length > 0 ?
                    '<div class="flex flex-wrap gap-1.5 mb-3">' + r.pileTypeSpecs.map(function(t) { return '<span class="px-2 py-1 text-xs rounded bg-slate-700/50 text-slate-300">' + (t.label || t.profile || 'Type') + '</span>'; }).join('') + '</div>' :
                    '<p class="text-xs text-amber-400/80 mb-3">No pile types configured yet - edit to add tolerances.</p>') +
                  (canEdit || canDelete ? '<div class="flex gap-2">' +
                    (canEdit ? '<button onclick="openEditModal(\\'rackingProfile\\', ' + (r.id ? '\\'' + r.id + '\\'' : 'null') + ')" class="flex-1 py-2 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-lg text-sm">Edit</button>' : '') +
                    (canDelete ? '<button onclick="deleteItem(\\'rackingProfile\\', ' + (r.id ? '\\'' + r.id + '\\'' : 'null') + ')" class="py-2 px-3 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg text-sm">' + icon('trash-2', 'w-4 h-4') + '</button>' : '') +
                  '</div>' : '') +
                '</div>').join('')) +
              '</div>' +
            '</div>';
          }
          
          function renderUsersSettings() {
            const canManage = hasRole('admin');
            return '<div class="space-y-4">' +
              (canManage ? '<div class="flex justify-end">' +
                '<button onclick="openEditModal(\\'user\\', null)" class="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-black rounded-lg font-medium text-sm flex items-center gap-2">' + icon('plus', 'w-4 h-4') + ' Invite User</button>' +
              '</div>' : '<p class="text-xs text-slate-500">View only - ask an admin to manage users.</p>') +
              '<div class="grid gap-4">' +
                (state.users.length === 0 ? '<p class="text-slate-400 text-center py-8">No users yet.</p>' :
                state.users.map(u => '<div class="card rounded-xl p-5">' +
                  '<div class="flex items-start justify-between mb-3">' +
                    '<div><h4 class="font-semibold text-white">' + u.name + '</h4>' +
                    '<p class="text-sm text-slate-400">' + u.email + '</p></div>' +
                    '<span class="px-2 py-1 text-xs rounded bg-blue-500/20 text-blue-400 capitalize">' + u.role + '</span>' +
                  '</div>' +
                  (canManage ? '<div class="flex gap-2">' +
                    '<button onclick="openEditModal(\\'user\\', ' + (u.id ? '\\'' + u.id + '\\'' : 'null') + ')" class="flex-1 py-2 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-lg text-sm">Edit</button>' +
                    '<button onclick="deleteItem(\\'user\\', ' + (u.id ? '\\'' + u.id + '\\'' : 'null') + ')" class="py-2 px-3 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg text-sm">' + icon('trash-2', 'w-4 h-4') + '</button>' +
                  '</div>' : '') +
                '</div>').join('')) +
              '</div>' +
            '</div>';
          }
          
          function renderEditModal() {
            const item = state.editingItem;
            if (!item) return '';
            
            let formContent = '';
            let title = '';
            
            if (item.type === 'project') {
              title = item.id ? 'Edit Project' : 'New Project';
              const p = item.id ? state.projects.find(x => x.id === item.id) || {} : {};
              formContent = 
                '<div><label class="text-xs text-slate-500 uppercase mb-2 block">Project Name</label>' +
                '<input type="text" id="modalName" value="' + (p.name || '') + '" class="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white"></div>' +
                '<div><label class="text-xs text-slate-500 uppercase mb-2 block">Location</label>' +
                '<input type="text" id="modalLocation" value="' + (p.location || '') + '" class="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white"></div>' +
                '<div><label class="text-xs text-slate-500 uppercase mb-2 block">Client</label>' +
                '<input type="text" id="modalClient" value="' + (p.client || '') + '" class="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white"></div>' +
                '<div><label class="text-xs text-slate-500 uppercase mb-2 block">Project Manager</label>' +
                '<input type="text" id="modalPM" value="' + (p.projectManager || '') + '" class="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white"></div>' +
                '<div class="grid grid-cols-3 gap-3">' +
                  '<div><label class="text-xs text-slate-500 mb-2 block">Rows</label>' +
                  '<input type="number" id="modalRows" value="' + (p.totalRows || 50) + '" class="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white"></div>' +
                  '<div><label class="text-xs text-slate-500 mb-2 block">Piles/Row</label>' +
                  '<input type="number" id="modalPilesPerRow" value="' + (p.pilesPerRow || 30) + '" class="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white"></div>' +
                  '<div><label class="text-xs text-slate-500 mb-2 block">Daily Target</label>' +
                  '<input type="number" id="modalTarget" value="' + (p.dailyTarget || 35) + '" class="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white"></div>' +
                '</div>' +
                '<div class="grid grid-cols-2 gap-3">' +
                  '<div><label class="text-xs text-slate-500 mb-2 block">Planned Tables</label>' +
                  '<input type="number" id="modalTotalTables" value="' + (p.totalTables || 0) + '" class="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white"></div>' +
                  '<div><label class="text-xs text-slate-500 mb-2 block">Planned Modules</label>' +
                  '<input type="number" id="modalTotalModules" value="' + (p.totalModules || 0) + '" class="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white"></div>' +
                '</div>' +
                '<div><label class="text-xs text-slate-500 uppercase mb-2 block">Racking Profile</label>' +
                '<select id="modalRackingProfileId" class="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white">' +
                  '<option value="">None</option>' +
                  state.rackingProfiles.map(function(r) { return '<option value="' + r.id + '" ' + (p.rackingProfileId === r.id ? 'selected' : '') + '>' + r.name + '</option>'; }).join('') +
                '</select></div>' +
                '<div><label class="text-xs text-slate-500 uppercase mb-2 block">Coordinates (for this project\\'s weather forecast)</label>' +
                '<div class="grid grid-cols-2 gap-3">' +
                  '<div><input type="number" step="any" id="modalLatitude" value="' + (p.latitude ?? '') + '" placeholder="Latitude" class="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white"></div>' +
                  '<div><input type="number" step="any" id="modalLongitude" value="' + (p.longitude ?? '') + '" placeholder="Longitude" class="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white"></div>' +
                '</div><p class="text-xs text-slate-500 mt-1">Leave blank to use the default Phoenix, AZ forecast.</p></div>' +
                '<div><label class="text-xs text-slate-500 uppercase mb-2 block">Status</label>' +
                '<select id="modalStatus" class="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white">' +
                  '<option value="active" ' + (p.status === 'active' ? 'selected' : '') + '>Active</option>' +
                  '<option value="completed" ' + (p.status === 'completed' ? 'selected' : '') + '>Completed</option>' +
                  '<option value="on_hold" ' + (p.status === 'on_hold' ? 'selected' : '') + '>On Hold</option>' +
                '</select></div>';
            } else if (item.type === 'crew') {
              title = item.id ? 'Edit Crew' : 'New Crew';
              const c = item.id ? state.crews.find(x => x.id === item.id) || {} : {};
              formContent = 
                '<div><label class="text-xs text-slate-500 uppercase mb-2 block">Crew Name</label>' +
                '<input type="text" id="modalName" value="' + (c.name || '') + '" class="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white"></div>' +
                '<div><label class="text-xs text-slate-500 uppercase mb-2 block">Crew Lead</label>' +
                '<input type="text" id="modalLead" value="' + (c.lead || '') + '" class="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white"></div>' +
                '<div class="grid grid-cols-2 gap-3">' +
                  '<div><label class="text-xs text-slate-500 mb-2 block">Worker Count</label>' +
                  '<input type="number" id="modalWorkers" value="' + (c.workerCount || 8) + '" class="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white"></div>' +
                  '<div><label class="text-xs text-slate-500 mb-2 block">Status</label>' +
                  '<select id="modalStatus" class="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white">' +
                    '<option value="active" ' + (c.status === 'active' ? 'selected' : '') + '>Active</option>' +
                    '<option value="standby" ' + (c.status === 'standby' ? 'selected' : '') + '>Standby</option>' +
                  '</select></div>' +
                '</div>';
            } else if (item.type === 'rackingProfile') {
              title = item.id ? 'Edit Racking Profile' : 'New Racking Profile';
              const r = item.id ? state.rackingProfiles.find(x => x.id === item.id) || {} : {};
              const types = state.editingRackingTypes || [];
              formContent =
                '<div><label class="text-xs text-slate-500 uppercase mb-2 block">Profile Name</label>' +
                '<input type="text" id="modalName" value="' + (r.name || '') + '" class="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white"></div>' +
                '<div><label class="text-xs text-slate-500 uppercase mb-2 block">Manufacturer</label>' +
                '<input type="text" id="modalManufacturer" value="' + (r.manufacturer || '') + '" class="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white"></div>' +
                '<div class="flex items-center justify-between pt-2 border-t border-slate-700/50">' +
                  '<label class="text-xs text-slate-500 uppercase block">Pile Types &amp; Tolerances</label>' +
                  '<button type="button" onclick="addRackingType()" class="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-black rounded-lg font-medium text-xs flex items-center gap-1">' + icon('plus', 'w-3.5 h-3.5') + ' Add Pile Type</button>' +
                '</div>' +
                (types.length === 0 ? '<p class="text-sm text-slate-500 text-center py-6">No pile types yet. Add one for each distinct pile spec this vendor gives you (e.g. by steel profile and embedment depth).</p>' :
                types.map(function(t, i) {
                  const tol = t.tolerances || {};
                  return '<div class="card rounded-xl p-4 space-y-3 bg-slate-800/40">' +
                    '<div class="flex items-center justify-between"><span class="text-xs text-slate-500 uppercase">Pile Type ' + (i + 1) + '</span>' +
                    '<button type="button" onclick="removeRackingType(' + i + ')" class="text-red-400 hover:text-red-300 text-xs flex items-center gap-1">' + icon('trash-2', 'w-3.5 h-3.5') + ' Remove</button></div>' +
                    '<div class="grid grid-cols-2 gap-3">' +
                      '<div><label class="text-xs text-slate-500 mb-1 block">Label</label><input type="text" value="' + (t.label || '') + '" oninput="state.editingRackingTypes[' + i + '].label=this.value" placeholder="W6x9 - 17.92ft" class="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm"></div>' +
                      '<div><label class="text-xs text-slate-500 mb-1 block">Color (vendor plan)</label><input type="text" value="' + (t.color || '') + '" oninput="state.editingRackingTypes[' + i + '].color=this.value" placeholder="Teal" class="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm"></div>' +
                    '</div>' +
                    '<div class="grid grid-cols-3 gap-3">' +
                      '<div><label class="text-xs text-slate-500 mb-1 block">Profile</label><input type="text" value="' + (t.profile || '') + '" oninput="state.editingRackingTypes[' + i + '].profile=this.value" placeholder="W6x9" class="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm"></div>' +
                      '<div><label class="text-xs text-slate-500 mb-1 block">Length (ft)</label><input type="number" step="0.01" value="' + (t.lengthFt ?? '') + '" oninput="state.editingRackingTypes[' + i + '].lengthFt=this.value?parseFloat(this.value):null" class="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm"></div>' +
                      '<div><label class="text-xs text-slate-500 mb-1 block">Target Embed (ft)</label><input type="number" step="0.01" value="' + (t.embedmentTargetFt ?? '') + '" oninput="state.editingRackingTypes[' + i + '].embedmentTargetFt=this.value?parseFloat(this.value):null" class="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm"></div>' +
                    '</div>' +
                    '<div class="border-t border-slate-700/50 pt-3"><p class="text-xs text-slate-500 uppercase mb-2">QC Tolerances</p><div class="grid grid-cols-2 gap-3">' +
                      rackingTolInput(i, 'embedmentMinIn', 'Embedment Min (in)', tol.embedmentMinIn) +
                      rackingTolInput(i, 'embedmentMaxIn', 'Embedment Max (in)', tol.embedmentMaxIn) +
                      rackingTolInput(i, 'heightMinIn', 'Reveal Height Min (in)', tol.heightMinIn) +
                      rackingTolInput(i, 'heightMaxIn', 'Reveal Height Max (in)', tol.heightMaxIn) +
                      rackingTolInput(i, 'plumbMaxDeg', 'Max Plumb (\\u00b0)', tol.plumbMaxDeg) +
                      rackingTolInput(i, 'twistMaxDeg', 'Max Twist (\\u00b0)', tol.twistMaxDeg) +
                      rackingTolInput(i, 'spacingTolIn', 'Spacing Tolerance (\\u00b1 in)', tol.spacingTolIn) +
                      rackingTolInput(i, 'alignmentTolIn', 'Alignment Tolerance (\\u00b1 in)', tol.alignmentTolIn) +
                    '</div></div>' +
                  '</div>';
                }).join(''));
            } else if (item.type === 'user') {
              title = item.id ? 'Edit User' : 'Invite User';
              const u = item.id ? state.users.find(x => x.id === item.id) || {} : {};
              formContent = 
                '<div><label class="text-xs text-slate-500 uppercase mb-2 block">Full Name</label>' +
                '<input type="text" id="modalName" value="' + (u.name || '') + '" class="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white"></div>' +
                '<div><label class="text-xs text-slate-500 uppercase mb-2 block">Email</label>' +
                '<input type="email" id="modalEmail" value="' + (u.email || '') + '" class="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white"></div>' +
                '<div><label class="text-xs text-slate-500 uppercase mb-2 block">Role</label>' +
                '<select id="modalRole" class="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white">' +
                  '<option value="inspector" ' + (u.role === 'inspector' ? 'selected' : '') + '>Inspector</option>' +
                  '<option value="manager" ' + (u.role === 'manager' ? 'selected' : '') + '>Manager</option>' +
                  '<option value="admin" ' + (u.role === 'admin' ? 'selected' : '') + '>Admin</option>' +
                '</select></div>' +
                (!item.id ? '<div><label class="text-xs text-slate-500 uppercase mb-2 block">Password</label>' +
                '<input type="password" id="modalPassword" class="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white" placeholder="Enter password"></div>' : '');
            } else if (item.type === 'subcontractor') {
              title = item.id ? 'Edit Subcontractor' : 'New Subcontractor';
              const s = item.id ? state.subcontractors.find(x => x.id === item.id) || {} : {};
              formContent = 
                '<div><label class="text-xs text-slate-500 uppercase mb-2 block">Company Name</label>' +
                '<input type="text" id="modalName" value="' + (s.name || '') + '" class="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white"></div>' +
                '<div><label class="text-xs text-slate-500 uppercase mb-2 block">Contact Person</label>' +
                '<input type="text" id="modalContactPerson" value="' + (s.contactPerson || '') + '" class="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white"></div>' +
                '<div><label class="text-xs text-slate-500 uppercase mb-2 block">Phone</label>' +
                '<input type="tel" id="modalPhone" value="' + (s.phone || '') + '" class="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white"></div>' +
                '<div><label class="text-xs text-slate-500 uppercase mb-2 block">Email</label>' +
                '<input type="email" id="modalSubEmail" value="' + (s.email || '') + '" class="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white"></div>';
            }
            
            // The backdrop itself is the scroll container (not the card),
            // with a min-h-full centering wrapper inside it - a taller form
            // (the Project modal especially, which can run to a dozen
            // fields) simply grows past one screen and the whole overlay
            // scrolls to reveal it, instead of relying on a fixed max-height
            // + inner overflow that can end up shorter than it looks once a
            // mobile on-screen keyboard eats into the visible viewport,
            // leaving the bottom fields (and the Save button) unreachable.
            return '<div class="fixed inset-0 z-50 overflow-y-auto modal-backdrop">' +
              '<div class="min-h-full flex items-center justify-center p-4" onclick="if(event.target === this) closeEditModal()">' +
                '<div class="bg-slate-900 border border-slate-700 rounded-2xl p-6 w-full max-w-md my-8">' +
                  '<div class="flex items-center justify-between mb-6">' +
                    '<h3 class="font-display font-semibold text-white text-lg">' + title + '</h3>' +
                    '<button onclick="closeEditModal()" class="p-2 hover:bg-slate-800 rounded-lg text-slate-400">' + icon('x', 'w-5 h-5') + '</button>' +
                  '</div>' +
                  '<div class="space-y-4">' + formContent + '</div>' +
                  '<div class="flex gap-3 mt-6">' +
                    '<button onclick="closeEditModal()" class="flex-1 py-3 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-lg font-medium">Cancel</button>' +
                    '<button onclick="saveEditModal()" class="flex-1 py-3 bg-amber-500 hover:bg-amber-400 text-black rounded-lg font-semibold">Save</button>' +
                  '</div>' +
                '</div>' +
              '</div>' +
            '</div>';
          }
          
          function openEditModal(type, id) {
            state.editingItem = { type, id };
            if (type === 'rackingProfile') {
              // Deep-clone into a draft array so edits (including add/
              // remove) don't touch state.rackingProfiles until Save is
              // actually pressed - Cancel should leave the real data alone.
              const r = id ? state.rackingProfiles.find(function(x) { return x.id === id; }) : null;
              state.editingRackingTypes = (r && Array.isArray(r.pileTypeSpecs) && r.pileTypeSpecs.length > 0)
                ? JSON.parse(JSON.stringify(r.pileTypeSpecs))
                : [];
            }
            render();
          }
          function closeEditModal() { state.editingItem = null; state.editingRackingTypes = []; render(); }
          function addRackingType() {
            state.editingRackingTypes = state.editingRackingTypes || [];
            state.editingRackingTypes.push({
              id: 'pt_' + Date.now() + '_' + Math.floor(Math.random() * 1000),
              label: '', profile: '', lengthFt: null, embedmentTargetFt: null, color: '',
              tolerances: { embedmentMinIn: null, embedmentMaxIn: null, heightMinIn: null, heightMaxIn: null, plumbMaxDeg: null, twistMaxDeg: null, spacingTolIn: null, alignmentTolIn: null }
            });
            render();
          }
          function removeRackingType(idx) {
            if (!confirm('Remove this pile type? Its tolerances will be lost when you save.')) return;
            state.editingRackingTypes.splice(idx, 1);
            render();
          }
          function rackingTolInput(i, key, label, val) {
            return '<div><label class="text-xs text-slate-500 mb-1 block">' + label + '</label><input type="number" step="0.1" value="' + (val ?? '') + '" oninput="state.editingRackingTypes[' + i + '].tolerances.' + key + '=this.value?parseFloat(this.value):null" class="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm"></div>';
          }
          
          async function saveEditModal() {
            const item = state.editingItem;
            if (!item) return;
            
            let data = {};
            
            if (item.type === 'project') {
              data = {
                name: document.getElementById('modalName')?.value || '',
                location: document.getElementById('modalLocation')?.value || '',
                client: document.getElementById('modalClient')?.value || '',
                projectManager: document.getElementById('modalPM')?.value || '',
                totalRows: parseInt(document.getElementById('modalRows')?.value) || 50,
                pilesPerRow: parseInt(document.getElementById('modalPilesPerRow')?.value) || 30,
                dailyTarget: parseInt(document.getElementById('modalTarget')?.value) || 35,
                totalTables: parseInt(document.getElementById('modalTotalTables')?.value) || 0,
                totalModules: parseInt(document.getElementById('modalTotalModules')?.value) || 0,
                status: document.getElementById('modalStatus')?.value || 'active',
              };
              const latVal = document.getElementById('modalLatitude')?.value;
              const lngVal = document.getElementById('modalLongitude')?.value;
              data.latitude = latVal ? parseFloat(latVal) : null;
              data.longitude = lngVal ? parseFloat(lngVal) : null;
              data.rackingProfileId = document.getElementById('modalRackingProfileId')?.value || null;
              // totalPiles is NOT sent here - the API recomputes it from
              // totalRows/pilesPerRow itself, but only when those actually
              // changed, so it can't silently clobber a totalPiles value
              // that doesn't match rows*pilesPerRow (see settings route).
            } else if (item.type === 'crew') {
              data = {
                name: document.getElementById('modalName')?.value || '',
                lead: document.getElementById('modalLead')?.value || '',
                workerCount: parseInt(document.getElementById('modalWorkers')?.value) || 8,
                status: document.getElementById('modalStatus')?.value || 'active',
              };
            } else if (item.type === 'rackingProfile') {
              // Pile type rows (label, profile, tolerances) are kept live in
              // state.editingRackingTypes via each input's oninput handler -
              // read that directly rather than the DOM, same reason
              // recordInspection() reads state instead of getElementById for
              // fields that can survive a re-render mid-edit.
              if (!state.editingRackingTypes || state.editingRackingTypes.length === 0) {
                alert('Add at least one pile type before saving.');
                return;
              }
              const missingLabel = state.editingRackingTypes.some(function(t) { return !t.label; });
              if (missingLabel) {
                alert('Every pile type needs a label.');
                return;
              }
              data = {
                name: document.getElementById('modalName')?.value || '',
                manufacturer: document.getElementById('modalManufacturer')?.value || '',
                pileTypeSpecs: state.editingRackingTypes,
                isActive: true,
              };
            } else if (item.type === 'user') {
              data = {
                name: document.getElementById('modalName')?.value || '',
                email: document.getElementById('modalEmail')?.value || '',
                role: document.getElementById('modalRole')?.value || 'inspector',
              };
              const pw = document.getElementById('modalPassword')?.value;
              if (pw) data.password = pw;
            } else if (item.type === 'subcontractor') {
              data = {
                name: document.getElementById('modalName')?.value || '',
                contactPerson: document.getElementById('modalContactPerson')?.value || '',
                phone: document.getElementById('modalPhone')?.value || '',
                email: document.getElementById('modalSubEmail')?.value || '',
              };
            }
            
            if (item.id) data.id = item.id;
            
            try {
              const response = await fetch('/api/settings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ type: item.type, data, companyId: state.companyId })
              });
              
              if (response.ok) {
                await loadSettings();
                // Editing your OWN account (name/email/role) here updates
                // the database, but the login session is a signed cookie
                // that keeps whatever it was issued with until this fires
                // - without it, the sidebar and every "logged by" field
                // would keep showing the old name until a full sign-out.
                if (item.type === 'user' && item.id && state.currentUser && item.id === state.currentUser.id) {
                  await refreshSessionUser();
                }
                closeEditModal();
              } else {
                const err = await response.json().catch(function() { return {}; });
                alert(err.error || 'Failed to save. Please try again.');
              }
            } catch (e) {
              console.error('Save error:', e);
              alert('Failed to save. Please try again.');
            }
          }

          // Forces NextAuth to re-issue this session's cookie from the
          // database, instead of the name/role/etc it was issued with at
          // login. This app has no React SessionProvider (it's plain JS,
          // not a client component tree), so this calls the same two
          // endpoints NextAuth's own useSession().update() calls under the
          // hood: a CSRF token, then a POST to /api/auth/session, which
          // fires the jwt callback's trigger==='update' branch in
          // src/lib/auth.ts - that branch re-reads the database itself
          // rather than trusting anything sent here, so this can only ever
          // pull in what's actually stored, never grant anything extra.
          async function refreshSessionUser() {
            try {
              const csrfRes = await fetch('/api/auth/csrf');
              const csrfData = await csrfRes.json();
              const res = await fetch('/api/auth/session', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ csrfToken: csrfData.csrfToken, data: {} }),
              });
              const fresh = await res.json();
              if (fresh && fresh.user) {
                state.currentUser = Object.assign({}, state.currentUser, {
                  id: fresh.user.id,
                  name: fresh.user.name,
                  role: fresh.user.role,
                });
                render();
              }
            } catch (e) {
              console.error('Session refresh error:', e);
            }
          }

          async function deleteItem(type, id) {
            if (!confirm('Are you sure you want to delete this item?')) return;
            
            try {
              const response = await fetch('/api/settings', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ type, id })
              });
              
              if (response.ok) {
                await loadSettings();
              } else {
                const err = await response.json().catch(function() { return {}; });
                alert(err.error || 'Failed to delete. Please try again.');
              }
            } catch (e) {
              console.error('Delete error:', e);
              alert('Failed to delete. Please try again.');
            }
          }
          
          // Admin-only: wipe test/demo Production Entry data (and,
          // optionally, test Inspection/Refusal data) for one project before
          // real field data starts. Requires typing the project name so a
          // stray click can't take out real history by accident - this
          // deletes rows outright, not something Edit/Undo can fix.
          async function resetProductionData(id, name) {
            const typed = prompt('This wipes ALL production entries (piles/tables/modules installed) for "' + name + '" and cannot be undone.\\n\\nType the project name to confirm:');
            if (typed === null) return;
            if (typed !== name) { alert('Name did not match "' + name + '" - nothing was deleted.'); return; }
            const includeQc = confirm('Also clear QC test data (inspections & refusals) for this project?\\n\\nOK = clear those too. Cancel = leave inspections/refusals untouched.');
            try {
              const res = await fetch('/api/admin/reset-production-data', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ projectId: id, includeQc: includeQc }),
              });
              if (res.ok) {
                const data = await res.json();
                let msg = 'Reset complete for ' + data.project + ': ' + data.productionEntriesDeleted + ' production ' + (data.productionEntriesDeleted === 1 ? 'entry' : 'entries') + ' deleted.';
                if (includeQc) msg += ' Also cleared ' + data.inspectionsDeleted + ' inspection(s) and ' + data.refusalsDeleted + ' refusal(s).';
                alert(msg);
                await loadSettings();
                render();
              } else {
                const err = await res.json().catch(function() { return {}; });
                alert(err.error || 'Failed to reset production data.');
              }
            } catch (e) { console.error('Reset production data error:', e); alert('Failed to reset production data.'); }
          }

          async function saveCompanySettings() {
            const name = document.getElementById('companyName')?.value;
            const tier = document.getElementById('companyTier')?.value;
            
            try {
              const response = await fetch('/api/settings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ type: 'company', data: { name, tier }, companyId: state.companyId })
              });
              
              if (response.ok) {
                await loadSettings();
                alert('Company settings saved!');
              } else {
                const err = await response.json().catch(function() { return {}; });
                alert(err.error || 'Failed to save company settings.');
              }
            } catch (e) {
              console.error('Save error:', e);
              alert('Failed to save company settings.');
            }
          }
          
          async function loadSettings() {
            try {
              const response = await fetch('/api/settings' + (state.companyId ? '?companyId=' + state.companyId : ''));
              const data = await response.json();
              
              if (data.companyId && !state.companyId) {
                state.companyId = data.companyId;
                await loadSettings();
                return;
              }
              
              if (data.company) state.company = data.company;
              if (data.projects) state.projects = data.projects;
              if (data.crews) state.crews = data.crews;
              if (data.subcontractors) state.subcontractors = data.subcontractors;
              if (data.rackingProfiles) state.rackingProfiles = data.rackingProfiles;
              if (data.users) state.users = data.users;

              if (!state.currentProject && state.projects && state.projects.length > 0) {
                state.currentProject = state.projects.find(p => p.status === 'active') || state.projects[0];
              } else if (state.currentProject && state.projects) {
                // loadSettings() always replaces state.projects wholesale, but
                // until now state.currentProject kept pointing at the OLD
                // object from before this reload - so editing a project's own
                // settings (location, GPS coordinates, daily target, etc.)
                // never showed up anywhere that reads state.currentProject
                // directly, weather chief among them: fetchWeatherData() reads
                // state.currentProject.latitude/longitude, so a project saved
                // with new coordinates kept silently falling back to the
                // default Phoenix, AZ forecast until a full page reload.
                // Project cards looked fine regardless, since those render
                // from state.projects, which was already correct.
                const refreshed = state.projects.find(p => p.id === state.currentProject.id);
                if (refreshed) state.currentProject = refreshed;
              }

              render();
            } catch (e) {
              console.error('Load settings error:', e);
            }
          }

          // IN-APP NOTIFICATIONS - a bell + dropdown, fed by createNotification
          // on the server (failed inspections, new refusals, failed pull
          // tests, a day that comes in well short of target). Polled on an
          // interval rather than pushed - no websockets in this app.
          function renderNotifBell() {
            const badge = state.unreadCount > 0 ? '<span class="absolute top-0.5 right-0.5 min-w-[16px] h-4 px-1 bg-red-500 rounded-full text-[10px] leading-4 text-white flex items-center justify-center font-bold">' + (state.unreadCount > 9 ? '9+' : state.unreadCount) + '</span>' : '';
            return '<button onclick="toggleNotifPanel(event)" class="relative p-2 text-slate-400 hover:text-white transition-colors">' + icon('bell', 'w-5 h-5') + badge + '</button>';
          }
          function renderNotifPanel() {
            const typeIcon = { inspection_fail: 'x-circle', refusal: 'alert-triangle', behind_schedule: 'trending-down' };
            const items = state.notifications.length > 0 ? state.notifications.map(n => '<div onclick="markNotificationRead(\\'' + n.id + '\\')" class="px-4 py-3 border-b border-slate-700/50 cursor-pointer hover:bg-slate-800/70 transition-colors ' + (n.read ? 'opacity-50' : 'bg-slate-800/40') + '"><div class="flex items-start gap-3"><div class="mt-0.5 text-amber-400">' + icon(typeIcon[n.type] || 'bell', 'w-4 h-4') + '</div><div class="flex-1 min-w-0"><p class="text-sm text-slate-200 leading-snug">' + n.message + '</p><p class="text-xs text-slate-500 mt-0.5">' + timeAgo(new Date(n.createdAt).getTime()) + '</p></div>' + (!n.read ? '<div class="w-2 h-2 rounded-full bg-amber-400 mt-1.5 flex-shrink-0"></div>' : '') + '</div></div>').join('') : '<div class="px-4 py-8 text-center text-sm text-slate-500">No notifications yet</div>';
            return '<div class="fixed top-16 right-4 lg:top-6 lg:left-64 lg:right-auto z-[60] w-80 max-w-[calc(100vw-2rem)] bg-slate-900 border border-slate-700 rounded-xl shadow-2xl overflow-hidden animate-fade-in"><div class="px-4 py-3 border-b border-slate-700/50 flex items-center justify-between"><h3 class="font-display font-semibold text-white text-sm">Notifications</h3>' + (state.unreadCount > 0 ? '<button onclick="markAllNotificationsRead()" class="text-xs text-amber-400 hover:text-amber-300">Mark all read</button>' : '') + '</div><div class="max-h-96 overflow-y-auto">' + items + '</div></div>';
          }
          function toggleNotifPanel(e) {
            if (e && e.stopPropagation) e.stopPropagation();
            state.notifPanelOpen = !state.notifPanelOpen;
            if (state.notifPanelOpen) loadNotifications();
            updateNotifUI();
          }
          async function loadNotifications() {
            if (!state.companyId) return;
            try {
              const res = await fetch('/api/notifications?companyId=' + state.companyId);
              const data = await res.json();
              if (Array.isArray(data.notifications)) {
                state.notifications = data.notifications;
                state.unreadCount = data.unreadCount || 0;
                updateNotifUI();
              }
            } catch (e) { console.error('Load notifications error:', e); }
          }
          async function markNotificationRead(id) {
            const n = state.notifications.find(x => x.id === id);
            if (!n || n.read) return;
            n.read = true;
            state.unreadCount = Math.max(0, state.unreadCount - 1);
            updateNotifUI();
            try {
              await fetch('/api/notifications', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'markRead', id }) });
            } catch (e) { console.error('Mark notification read error:', e); }
          }
          async function markAllNotificationsRead() {
            state.notifications.forEach(n => { n.read = true; });
            state.unreadCount = 0;
            updateNotifUI();
            try {
              await fetch('/api/notifications', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'markAllRead', companyId: state.companyId }) });
            } catch (e) { console.error('Mark all notifications read error:', e); }
          }

          // Mobile header's center brand slot. Normally just the logo
          // wordmark, but on a project-scoped view it swaps to the current
          // project's name instead - the sidebar (where the project
          // dropdown lives) closes itself after picking a nav item on
          // mobile (navigateTo sets sidebarOpen=false), so previously
          // nothing on screen said which project you were looking at once
          // you'd navigated away from the sidebar. Tapping it reopens the
          // sidebar, same as the hamburger button, so it doubles as a
          // shortcut back to the project switcher. Kept deliberately small
          // (same header height, truncates on long names) since mobile
          // screen space is tight.
          function mobileHeaderBrand() {
            // Mirrors the projectIndependentViews array near
            // initializeApp/saveNavState - those are the views with no
            // single "current" project to show (company-wide or settings).
            const projectIndependentViews = ['company', 'settings'];
            if (!state.currentProject || projectIndependentViews.indexOf(state.currentView) !== -1) {
              return '<div class="flex items-center gap-2"><img src="/logo-mark.png" alt="SolTrend Pro" class="w-8 h-8 rounded-lg"><span class="font-display font-bold text-white">SolTrend</span></div>';
            }
            return '<button onclick="toggleSidebar()" class="flex items-center gap-1.5 min-w-0 max-w-[58vw]" title="' + state.currentProject.name.replace(/"/g, '&quot;') + ' - tap to switch project">' +
              '<img src="/logo-mark.png" alt="SolTrend Pro" class="w-7 h-7 rounded-lg flex-shrink-0">' +
              '<span class="font-display font-semibold text-white text-sm truncate">' + state.currentProject.name + '</span>' +
              icon('chevron-down', 'w-3.5 h-3.5 text-slate-400 flex-shrink-0') +
            '</button>';
          }

          // MAIN RENDER
          function render() {
            const views = { company: renderCompanyDashboard, dashboard: renderProjectDashboard, production: renderProduction, inspection: renderInspection, refusal: renderRefusal, delays: renderDelays, punchlist: renderPunchList, heatmap: renderHeatMap, analytics: renderAnalytics, reports: renderReports, settings: renderSettings, safety: renderSafety, schedule: renderSchedule, documents: renderDocuments, materials: renderMaterials, rfiSubmittals: renderRfiSubmittals };
            const content = renderOfflineBanner() + (views[state.currentView] ? views[state.currentView]() : '<p>View not found</p>');
            document.getElementById('app').innerHTML = renderSidebar() + '<header class="lg:hidden fixed top-0 left-0 right-0 z-40 bg-slate-900/95 backdrop-blur border-b border-slate-700/50 px-4 py-3"><div class="flex items-center justify-between"><button onclick="toggleSidebar()" class="p-2 -ml-2 text-slate-300">' + icon('menu', 'w-5 h-5') + '</button>' + mobileHeaderBrand() + '<span class="notif-bell-slot">' + renderNotifBell() + '</span></div></header><main class="lg:ml-60 min-h-screen pt-16 lg:pt-0 pb-6"><div class="p-4 lg:p-6 max-w-6xl mx-auto">' + content + '</div></main>' + (state.sidebarOpen ? '<div onclick="toggleSidebar()" class="lg:hidden fixed inset-0 z-40 bg-black/50"></div>' : '') + '<div id="notifPanelHost">' + (state.notifPanelOpen ? '<div onclick="toggleNotifPanel()" class="fixed inset-0 z-[55]"></div>' + renderNotifPanel() : '') + '</div>';
            if (window.lucide) lucide.createIcons();
          }

          // Notifications poll every 60s (see initializeApp below) and can
          // also be marked read/opened at any time - none of that should
          // ever force the *entire* app to re-render, because render()
          // replaces #app's whole innerHTML, which would blow away
          // whatever the person is in the middle of typing anywhere else on
          // the page (cursor position, focus, and on some mobile browsers
          // in-flight IME/autocorrect text that hasn't committed to the
          // input's value yet). This updates only the bell badge(s) and the
          // notification panel/overlay in place, leaving every other node
          // on the page - including any open form - completely untouched.
          function updateNotifUI() {
            const bellSlots = document.querySelectorAll('.notif-bell-slot');
            bellSlots.forEach(function(el) { el.innerHTML = renderNotifBell(); });
            const panelHost = document.getElementById('notifPanelHost');
            if (panelHost) {
              panelHost.innerHTML = state.notifPanelOpen ? ('<div onclick="toggleNotifPanel()" class="fixed inset-0 z-[55]"></div>' + renderNotifPanel()) : '';
            }
            if (window.lucide) lucide.createIcons();
          }

          // Remembers which view (and, for a project-scoped view, which
          // project) the person had open, in localStorage rather than in
          // memory - state itself is rebuilt from scratch on every full
          // page load, so without this a refresh always dumped everyone
          // back on the Company Dashboard regardless of what they were
          // actually working on. Best-effort: a private window or a
          // browser blocking storage just means the old always-reset
          // behavior, not a crash.
          function saveNavState() {
            try {
              localStorage.setItem('soltrend_lastView', state.currentView);
              if (state.currentProject && state.currentProject.id) {
                localStorage.setItem('soltrend_lastProjectId', state.currentProject.id);
              }
            } catch (e) {}
          }
          function navigateTo(view) { state.currentView = view; state.sidebarOpen = false; render(); window.scrollTo(0, 0); saveNavState(); }
          function toggleSidebar() { state.sidebarOpen = !state.sidebarOpen; render(); }
          // Switching projects previously never reloaded inspections/
          // refusals/production or the heatmap's row/column dimensions for
          // the newly selected project - it just changed which object
          // state.currentProject pointed at, while every other piece of
          // per-project state kept showing whatever the first project
          // had loaded at boot.
          function switchToProject(project) {
            if (!project) return;
            state.currentProject = project;
            state.heatmap.totalRows = project.totalRows || 50;
            state.heatmap.pilesPerRow = project.pilesPerRow || 30;
            // Projects can each have their own weather coordinates now, so
            // a forecast cached for the previous project can't be reused -
            // clear it and let the Insights tab re-fetch for wherever this
            // project actually is.
            state.predictiveWeather = null;
            render();
            loadProjectData();
            saveNavState();
          }
          function openProject(id) { switchToProject(state.projects.find(p => p.id === id)); state.currentView = 'dashboard'; render(); saveNavState(); }

          document.addEventListener('keydown', (e) => {
            if (state.currentView !== 'inspection') return;
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
            if (e.key === 'p' || e.key === 'P') recordInspection('pass');
            else if (e.key === 'f' || e.key === 'F') recordInspection('fail');
          });

          // Tailwind's CDN build (loaded from cdn.tailwindcss.com) generates
          // utility CSS in the browser by scanning the DOM after it changes,
          // instead of shipping a pre-built stylesheet. Since the whole app
          // gets dropped into #app in one big innerHTML swap, there's a
          // window where the raw, unstyled markup is visible before
          // Tailwind's scan catches up - a jumbled flash, worse on a cold
          // page load. #app starts hidden (see the style block above) behind
          // a branded loading screen; revealApp() swaps them back once the
          // browser has had a paint cycle for Tailwind to finish, with a
          // timeout as a fallback in case something upstream goes wrong.
          function revealApp() {
            const app = document.getElementById('app');
            const loadingScreen = document.getElementById('app-loading');
            if (app) app.style.visibility = 'visible';
            if (loadingScreen) loadingScreen.style.display = 'none';
          }
          setTimeout(revealApp, 5000);

          // INITIALIZATION - Load data from database
          async function initializeApp() {
            // Show loading state
            render();
            requestAnimationFrame(() => requestAnimationFrame(revealApp));

            // Pick up any changes queued from a previous offline session -
            // if we're online now, sync them before loading fresh data.
            updatePendingSyncBadge();
            if (navigator.onLine) flushPendingWrites();

            // Try to load settings from database first
            await loadSettings();
            
            // If no data was loaded, fall back to demo data
            if (!state.company || state.projects.length === 0) {
              console.log('No data in database, using demo data');
              generateDemoData();
            }

            // Restore whichever project and view were open before a
            // refresh (see saveNavState) instead of always landing back on
            // the Company Dashboard. loadSettings() above already picked a
            // default active project as a fallback for a brand-new
            // session - this overrides that default only when a
            // previously-visited project still exists.
            try {
              const savedProjectId = localStorage.getItem('soltrend_lastProjectId');
              if (savedProjectId) {
                const savedProject = state.projects.find(function(p) { return p.id === savedProjectId; });
                if (savedProject) state.currentProject = savedProject;
              }
              const savedView = localStorage.getItem('soltrend_lastView');
              const validViews = ['company', 'dashboard', 'production', 'inspection', 'refusal', 'delays', 'punchlist', 'heatmap', 'analytics', 'reports', 'settings', 'safety', 'schedule', 'documents', 'materials', 'rfiSubmittals'];
              const projectIndependentViews = ['company', 'settings'];
              if (savedView && validViews.indexOf(savedView) !== -1 && (projectIndependentViews.indexOf(savedView) !== -1 || state.currentProject)) {
                state.currentView = savedView;
              }
            } catch (e) {}

            // Update heatmap config from current project
            if (state.currentProject) {
              state.heatmap.totalRows = state.currentProject.totalRows || 50;
              state.heatmap.pilesPerRow = state.currentProject.pilesPerRow || 30;
            }
            
            render();

            // Then seed database and load persisted data
            await seedDatabase();

            // Notifications aren't tied to a specific project, so load them
            // once the company is known and poll for new ones from there -
            // no websockets in this app, so a periodic refresh is the whole
            // "live" story.
            await loadNotifications();
            setInterval(loadNotifications, 60000);
          }

          initializeApp();
        `}
      </Script>
    </>
  )
}
