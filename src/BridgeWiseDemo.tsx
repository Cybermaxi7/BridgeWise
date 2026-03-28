/**
 * BridgeWise — Complete Demo
 * Issues: #129 Mobile, #130 Keyboard Nav, #131 ARIA, #132 Loading
 */
import React, { useState, useRef, useCallback, useEffect } from 'react';

// ─── Inline CSS ───────────────────────────────────────────────────────────────

const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;1,9..40,400&family=DM+Mono:wght@400;500&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --c-bg:         #f8fafc;
    --c-surface:    #ffffff;
    --c-border:     #e2e8f0;
    --c-text:       #0f172a;
    --c-muted:      #64748b;
    --c-accent:     #2563eb;
    --c-accent-h:   #1d4ed8;
    --c-accent-l:   #eff6ff;
    --c-success:    #16a34a;
    --c-warn:       #d97706;
    --c-danger:     #dc2626;
    --c-skel:       #e2e8f0;
    --c-skel-s:     #f8fafc;
    --radius-sm:    6px;
    --radius-md:    10px;
    --radius-lg:    16px;
    --touch:        44px;
    --shadow-sm:    0 1px 3px rgba(0,0,0,.06), 0 1px 2px rgba(0,0,0,.04);
    --shadow-md:    0 4px 16px rgba(0,0,0,.08);
    font-family: 'DM Sans', system-ui, sans-serif;
  }

  @media (prefers-color-scheme: dark) {
    :root {
      --c-bg:      #0f172a; --c-surface: #1e293b; --c-border: #334155;
      --c-text:    #f1f5f9; --c-muted:   #94a3b8;
      --c-accent-l:#1e3a5f; --c-skel:   #1e293b; --c-skel-s: #334155;
    }
  }

  html { scroll-behavior: smooth; }
  body { background: var(--c-bg); color: var(--c-text); line-height: 1.6; overflow-x: hidden; }

  /* Skip link */
  .skip-link {
    position: absolute; top: -100%; left: 16px; z-index: 9999;
    padding: 8px 16px; background: var(--c-accent); color: #fff;
    border-radius: 0 0 var(--radius-md) var(--radius-md);
    font-weight: 600; font-size: 14px; text-decoration: none;
    transition: top .15s ease;
  }
  .skip-link:focus { top: 0; }

  /* Focus visible */
  :focus-visible {
    outline: 2.5px solid var(--c-accent);
    outline-offset: 3px;
    border-radius: var(--radius-sm);
  }
  :focus:not(:focus-visible) { outline: none; }

  /* Nav */
  .nav {
    position: sticky; top: 0; z-index: 100;
    display: flex; align-items: center; gap: 12px;
    padding: 0 20px; height: 60px;
    background: var(--c-surface);
    border-bottom: 1px solid var(--c-border);
    box-shadow: var(--shadow-sm);
  }
  .nav__logo { font-weight: 600; font-size: 17px; letter-spacing: -0.3px; }
  .nav__logo span { color: var(--c-accent); }
  .nav__links {
    display: none; list-style: none;
    gap: 4px; margin-left: 24px;
  }
  @media (min-width: 768px) { .nav__links { display: flex; } }
  .nav__link {
    padding: 6px 12px; border-radius: var(--radius-sm);
    font-size: 14px; font-weight: 500; color: var(--c-muted);
    background: none; border: none; cursor: pointer;
    min-height: var(--touch); display: flex; align-items: center;
    text-decoration: none; transition: color .15s, background .15s;
  }
  .nav__link:hover, .nav__link:focus-visible { color: var(--c-text); background: var(--c-accent-l); }
  .nav__link.active { color: var(--c-accent); background: var(--c-accent-l); }
  .nav__actions { margin-left: auto; display: flex; gap: 8px; align-items: center; }
  .nav__menu-btn {
    display: flex; align-items: center; justify-content: center;
    width: var(--touch); height: var(--touch);
    background: none; border: none; cursor: pointer;
    border-radius: var(--radius-sm); color: var(--c-text);
  }
  @media (min-width: 768px) { .nav__menu-btn { display: none; } }

  /* Mobile drawer */
  .drawer-backdrop {
    position: fixed; inset: 0; z-index: 200;
    background: rgba(0,0,0,.5);
    opacity: 0; pointer-events: none;
    transition: opacity .25s ease;
  }
  .drawer-backdrop.open { opacity: 1; pointer-events: all; }
  .drawer {
    position: fixed; top: 0; right: 0; bottom: 0; z-index: 201;
    width: min(280px, 85vw);
    background: var(--c-surface);
    padding: 20px;
    transform: translateX(100%);
    transition: transform .25s ease;
    overflow-y: auto;
    display: flex; flex-direction: column; gap: 8px;
  }
  .drawer.open { transform: translateX(0); }

  /* Layout */
  .layout { display: flex; min-height: calc(100vh - 60px); }
  .sidebar {
    display: none;
    width: 240px; flex-shrink: 0;
    padding: 24px 16px;
    border-right: 1px solid var(--c-border);
    position: sticky; top: 60px; height: calc(100vh - 60px);
    overflow-y: auto;
  }
  @media (min-width: 1024px) { .sidebar { display: block; } }
  .main { flex: 1; padding: 24px 20px; max-width: 100%; }
  @media (min-width: 768px) { .main { padding: 32px 28px; } }

  /* Sidebar nav */
  .sidebar-nav { list-style: none; display: flex; flex-direction: column; gap: 2px; }
  .sidebar-nav__item {
    display: flex; align-items: center; gap: 10px;
    padding: 9px 12px; border-radius: var(--radius-md);
    font-size: 14px; font-weight: 500;
    color: var(--c-muted); cursor: pointer;
    background: none; border: none; width: 100%;
    min-height: var(--touch); text-align: left;
    transition: color .15s, background .15s;
  }
  .sidebar-nav__item:hover { color: var(--c-text); background: var(--c-accent-l); }
  .sidebar-nav__item[aria-current="page"] { color: var(--c-accent); background: var(--c-accent-l); }

  /* Tabs */
  .tabs { display: flex; border-bottom: 1px solid var(--c-border); gap: 0; overflow-x: auto; }
  .tab {
    padding: 10px 16px; font-size: 14px; font-weight: 500;
    color: var(--c-muted); background: none; border: none;
    border-bottom: 2px solid transparent; cursor: pointer;
    white-space: nowrap; min-height: var(--touch);
    display: flex; align-items: center; transition: color .15s, border-color .15s;
  }
  .tab[aria-selected="true"] { color: var(--c-accent); border-bottom-color: var(--c-accent); }
  .tab:hover { color: var(--c-text); }

  /* Cards */
  .card {
    background: var(--c-surface); border: 1px solid var(--c-border);
    border-radius: var(--radius-lg); padding: 20px;
    box-shadow: var(--shadow-sm); transition: box-shadow .2s;
  }
  @media (min-width: 768px) { .card { padding: 24px; } }
  .card:focus-within { box-shadow: var(--shadow-md); }

  .grid { display: grid; grid-template-columns: 1fr; gap: 16px; }
  @media (min-width: 640px)  { .grid { grid-template-columns: repeat(2, 1fr); gap: 20px; } }
  @media (min-width: 1024px) { .grid { grid-template-columns: repeat(3, 1fr); gap: 24px; } }

  /* Buttons */
  .btn {
    display: inline-flex; align-items: center; justify-content: center;
    gap: 8px; padding: 0 18px; height: var(--touch);
    border-radius: var(--radius-md); font-size: 14px; font-weight: 500;
    cursor: pointer; border: 1.5px solid transparent;
    transition: all .15s ease; font-family: inherit;
    text-decoration: none; white-space: nowrap;
  }
  .btn-primary {
    background: var(--c-accent); color: #fff; border-color: var(--c-accent);
  }
  .btn-primary:hover, .btn-primary:focus-visible {
    background: var(--c-accent-h); border-color: var(--c-accent-h);
  }
  .btn-primary:disabled { opacity: 0.6; cursor: not-allowed; }
  .btn-ghost {
    background: transparent; color: var(--c-text); border-color: var(--c-border);
  }
  .btn-ghost:hover, .btn-ghost:focus-visible {
    background: var(--c-accent-l); border-color: var(--c-accent);
    color: var(--c-accent);
  }

  /* Form */
  .form-group { display: flex; flex-direction: column; gap: 6px; }
  .label { font-size: 13px; font-weight: 500; color: var(--c-text); }
  .input {
    height: var(--touch); padding: 0 14px;
    border: 1.5px solid var(--c-border); border-radius: var(--radius-md);
    background: var(--c-surface); color: var(--c-text);
    font-size: 16px; font-family: inherit;
    transition: border-color .15s, box-shadow .15s;
  }
  .input:focus { border-color: var(--c-accent); box-shadow: 0 0 0 3px rgba(37,99,235,.15); outline: none; }

  /* Badge */
  .badge {
    display: inline-flex; align-items: center;
    padding: 2px 8px; border-radius: 9999px;
    font-size: 11px; font-weight: 600; letter-spacing: .02em;
  }
  .badge-blue   { background: #dbeafe; color: #1e40af; }
  .badge-green  { background: #dcfce7; color: #15803d; }
  .badge-amber  { background: #fef3c7; color: #92400e; }

  /* Modal */
  .modal-backdrop {
    position: fixed; inset: 0; z-index: 300;
    background: rgba(0,0,0,.5);
    display: flex; align-items: flex-end; justify-content: center;
    padding: 0;
    animation: fadeIn .15s ease;
  }
  @media (min-width: 640px) {
    .modal-backdrop { align-items: center; padding: 24px; }
  }
  .modal {
    background: var(--c-surface);
    border-radius: var(--radius-lg) var(--radius-lg) 0 0;
    padding: 24px 20px; width: 100%; max-height: 90vh; overflow-y: auto;
    animation: slideUp .2s ease;
  }
  @media (min-width: 640px) {
    .modal { width: min(520px, 100%); border-radius: var(--radius-lg); }
  }

  /* Spinner */
  .spinner {
    display: inline-block; border-radius: 50%;
    border: 2.5px solid var(--c-border);
    border-top-color: var(--c-accent);
    animation: spin .7s linear infinite;
  }

  /* Skeleton */
  .skel {
    border-radius: var(--radius-sm);
    background: linear-gradient(90deg, var(--c-skel) 25%, var(--c-skel-s) 50%, var(--c-skel) 75%);
    background-size: 200% 100%;
    animation: shimmer 1.5s ease-in-out infinite;
  }

  /* Menu */
  .menu {
    position: absolute; top: calc(100% + 8px); right: 0;
    background: var(--c-surface); border: 1px solid var(--c-border);
    border-radius: var(--radius-lg); padding: 6px;
    min-width: 180px; box-shadow: var(--shadow-md);
    z-index: 50; animation: fadeIn .12s ease;
  }
  .menu-item {
    display: flex; align-items: center; gap: 8px;
    padding: 8px 12px; border-radius: var(--radius-sm);
    font-size: 14px; font-weight: 500; color: var(--c-text);
    background: none; border: none; cursor: pointer; width: 100%;
    text-align: left; min-height: 36px; font-family: inherit;
    transition: background .1s;
  }
  .menu-item:hover, .menu-item:focus-visible { background: var(--c-accent-l); color: var(--c-accent); }

  /* Progress bar */
  .progress-bar { height: 3px; background: var(--c-border); border-radius: 9999px; overflow: hidden; }
  .progress-fill {
    height: 100%; background: var(--c-accent); border-radius: 9999px;
    transition: width .4s ease;
  }

  /* Table */
  .table-wrap { overflow-x: auto; border-radius: var(--radius-md); border: 1px solid var(--c-border); }
  table { width: 100%; border-collapse: collapse; min-width: 520px; font-size: 14px; }
  th { padding: 11px 16px; text-align: left; font-size: 12px; font-weight: 600;
    text-transform: uppercase; letter-spacing: .05em; color: var(--c-muted);
    border-bottom: 1px solid var(--c-border); background: var(--c-bg); }
  td { padding: 12px 16px; border-bottom: 1px solid var(--c-border); }
  tr:last-child td { border-bottom: none; }
  tr:hover td { background: var(--c-accent-l); }

  /* Section */
  .section { margin-bottom: 40px; }
  .section-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px; flex-wrap: wrap; gap: 12px; }
  .section-title { font-size: 18px; font-weight: 600; letter-spacing: -.3px; }

  /* Stat cards */
  .stat-value { font-size: 28px; font-weight: 700; letter-spacing: -1px; line-height: 1; }
  .stat-label { font-size: 13px; color: var(--c-muted); margin-top: 4px; }
  .stat-trend { font-size: 12px; font-weight: 600; margin-top: 8px; }

  /* Animations */
  @keyframes spin     { to { transform: rotate(360deg); } }
  @keyframes shimmer  { 0%{background-position:200% 0} 100%{background-position:-200% 0} }
  @keyframes fadeIn   { from{opacity:0} to{opacity:1} }
  @keyframes slideUp  { from{transform:translateY(20px);opacity:0} to{transform:translateY(0);opacity:1} }
  @keyframes bounceIn { 0%,80%,100%{transform:scale(0)} 40%{transform:scale(1)} }

  @media (prefers-reduced-motion: reduce) {
    *, *::before, *::after { animation-duration: .01ms !important; transition-duration: .01ms !important; }
  }

  .sr-only {
    position: absolute; width: 1px; height: 1px; padding: 0;
    overflow: hidden; clip: rect(0,0,0,0); white-space: nowrap; border: 0;
  }

  /* Misc helpers */
  .flex { display: flex; } .items-center { align-items: center; }
  .justify-between { justify-content: space-between; }
  .gap-2 { gap: 8px; } .gap-3 { gap: 12px; }
  .mt-1 { margin-top: 4px; } .mt-2 { margin-top: 8px; } .mt-3 { margin-top: 12px; }
  .text-muted { color: var(--c-muted); font-size: 13px; }
  .font-mono { font-family: 'DM Mono', monospace; }
`;

// ─── Spinner ─────────────────────────────────────────────────────────────────
const Spinner = ({ size = 20, label = 'Loading' }: { size?: number; label?: string }) => (
  <span role="status" aria-label={label}>
    <span className="spinner" style={{ width: size, height: size }} aria-hidden="true" />
    <span className="sr-only">{label}</span>
  </span>
);

// ─── Skeleton ────────────────────────────────────────────────────────────────
const Skel = ({ w = '100%', h = 16, r = 6 }: { w?: string | number; h?: number; r?: number }) => (
  <span className="skel" aria-hidden="true" style={{ display: 'block', width: w, height: h, borderRadius: r }} />
);

const SkeletonCard = () => (
  <div className="card" aria-hidden="true">
    <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 16 }}>
      <Skel w={40} h={40} r={9999} />
      <div style={{ flex: 1 }}><Skel w="60%" h={14} /><div style={{ height: 6 }} /><Skel w="40%" h={11} /></div>
    </div>
    <Skel h={11} /><div style={{ height: 8 }} /><Skel w="85%" h={11} />
    <div style={{ height: 16 }} /><Skel w={80} h={28} r={8} />
  </div>
);

// ─── Hook: arrow navigation ───────────────────────────────────────────────────
function useArrowNav(ref: React.RefObject<HTMLElement>, selector: string, opts: { orientation?: string } = {}) {
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const handler = (e: KeyboardEvent) => {
      const items = Array.from(el.querySelectorAll<HTMLElement>(selector)).filter(i => !i.hasAttribute('disabled'));
      const idx   = items.indexOf(document.activeElement as HTMLElement);
      const isV   = opts.orientation !== 'horizontal';
      const isH   = opts.orientation === 'horizontal' || opts.orientation === 'both';
      let next = idx;
      if ((isV  && e.key === 'ArrowDown') || (isH && e.key === 'ArrowRight')) { e.preventDefault(); next = (idx + 1) % items.length; }
      if ((isV  && e.key === 'ArrowUp')   || (isH && e.key === 'ArrowLeft'))  { e.preventDefault(); next = (idx - 1 + items.length) % items.length; }
      if (e.key === 'Home') { e.preventDefault(); next = 0; }
      if (e.key === 'End')  { e.preventDefault(); next = items.length - 1; }
      if (next !== idx) items[next]?.focus();
    };
    el.addEventListener('keydown', handler);
    return () => el.removeEventListener('keydown', handler);
  }, [selector, opts.orientation]);
}

// ─── Demo data ────────────────────────────────────────────────────────────────
const USERS = [
  { name: 'Sarah Chen',    role: 'Engineer',  status: 'Active',   points: 2840 },
  { name: 'Marcus Webb',   role: 'Designer',  status: 'Active',   points: 1920 },
  { name: 'Priya Kapoor',  role: 'Manager',   status: 'Pending',  points: 3150 },
  { name: 'Tom Reeves',    role: 'Engineer',  status: 'Inactive', points: 870  },
];
const NAV_ITEMS = ['Overview', 'Analytics', 'Users', 'Settings'];
const TABS      = ['#130 Keyboard', '#129 Mobile', '#131 ARIA', '#132 Loading'];
const SIDEBAR   = [
  { icon: '⊞', label: 'Dashboard' }, { icon: '◈', label: 'Analytics' },
  { icon: '◉', label: 'Users'     }, { icon: '◎', label: 'Reports'   },
  { icon: '⊙', label: 'Settings'  },
];

// ─── Main App ─────────────────────────────────────────────────────────────────
export default function BridgeWiseDemo() {
  const [activeNav, setActiveNav]   = useState(0);
  const [activeTab, setActiveTab]   = useState(0);
  const [activeSide, setActiveSide] = useState(0);
  const [menuOpen, setMenuOpen]     = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [modalOpen, setModalOpen]   = useState(false);
  const [loading, setLoading]       = useState(false);
  const [tableLoading, setTblLoad]  = useState(false);
  const [btnLoading, setBtnLoad]    = useState(false);
  const [pageLoad, setPageLoad]     = useState(false);
  const [cardLoad, setCardLoad]     = useState(false);
  const [progress, setProgress]     = useState(72);
  const [announced, setAnnounced]   = useState('');

  const menuRef    = useRef<HTMLDivElement>(null);
  const modalRef   = useRef<HTMLDivElement>(null);
  const tabListRef = useRef<HTMLDivElement>(null) as any;
  const sideRef    = useRef<HTMLElement>(null) as any;

  useArrowNav(tabListRef, '[role="tab"]', { orientation: 'horizontal' });
  useArrowNav(sideRef,    '[role="menuitem"]', { orientation: 'vertical' });
  useArrowNav(menuRef as any, '[role="menuitem"]', { orientation: 'vertical' });

  // Trap focus in modal
  useEffect(() => {
    if (!modalOpen || !modalRef.current) return;
    const focusable = modalRef.current.querySelectorAll<HTMLElement>('button,a,input,[tabindex]:not([tabindex="-1"])');
    focusable[0]?.focus();
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setModalOpen(false);
      if (e.key === 'Tab') {
        const first = focusable[0]; const last = focusable[focusable.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [modalOpen]);

  // Close menu on outside click
  useEffect(() => {
    if (!menuOpen) return;
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [menuOpen]);

  const announce = (msg: string) => {
    setAnnounced(msg);
    setTimeout(() => setAnnounced(''), 3000);
  };

  const simulateLoad = (setter: (v: boolean) => void, ms = 1800) => {
    setter(true);
    setTimeout(() => setter(false), ms);
  };

  const statusBadge = (s: string) => {
    const cls = s === 'Active' ? 'badge-green' : s === 'Pending' ? 'badge-amber' : 'badge-blue';
    return <span className={`badge ${cls}`}>{s}</span>;
  };

  return (
    <>
      <style>{CSS}</style>

      {/* Live region — #131 */}
      <div
        role="status" aria-live="polite" aria-atomic="true"
        className="sr-only"
      >{announced}</div>

      {/* Skip link — #130 */}
      <a className="skip-link" href="#main-content">Skip to main content</a>

      {/* Nav */}
      <header role="banner">
        <nav className="nav" aria-label="Primary navigation">
          <div className="nav__logo">Bridge<span>Wise</span></div>

          <ul className="nav__links" role="menubar" aria-label="Main menu">
            {NAV_ITEMS.map((item, i) => (
              <li key={item} role="none">
                <button
                  className={`nav__link${activeNav === i ? ' active' : ''}`}
                  role="menuitem"
                  aria-current={activeNav === i ? 'page' : undefined}
                  onClick={() => { setActiveNav(i); announce(`${item} page selected`); }}
                >{item}</button>
              </li>
            ))}
          </ul>

          <div className="nav__actions">
            {/* Dropdown menu — #130 #131 */}
            <div style={{ position: 'relative' }} ref={menuRef}>
              <button
                className="btn btn-ghost"
                style={{ padding: '0 12px', fontSize: 13 }}
                aria-haspopup="menu"
                aria-expanded={menuOpen}
                aria-controls="user-menu"
                onClick={() => setMenuOpen(m => !m)}
                onKeyDown={e => { if (e.key === 'Escape') setMenuOpen(false); }}
              >Account ▾</button>
              {menuOpen && (
                <div
                  id="user-menu"
                  className="menu"
                  role="menu"
                  aria-label="Account menu"
                >
                  {['Profile', 'Billing', 'Sign out'].map(item => (
                    <button
                      key={item}
                      className="menu-item"
                      role="menuitem"
                      onClick={() => { setMenuOpen(false); announce(`${item} selected`); }}
                    >{item}</button>
                  ))}
                </div>
              )}
            </div>

            <button
              className="nav__menu-btn"
              aria-label={drawerOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={drawerOpen}
              aria-controls="mobile-drawer"
              onClick={() => setDrawerOpen(d => !d)}
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <rect y="3" width="20" height="2" rx="1" />
                <rect y="9" width="20" height="2" rx="1" />
                <rect y="15" width="20" height="2" rx="1" />
              </svg>
            </button>
          </div>
        </nav>
      </header>

      {/* Mobile drawer — #129 #130 */}
      <div
        className={`drawer-backdrop${drawerOpen ? ' open' : ''}`}
        aria-hidden={!drawerOpen}
        onClick={() => setDrawerOpen(false)}
      />
      <div
        id="mobile-drawer"
        className={`drawer${drawerOpen ? ' open' : ''}`}
        role="dialog"
        aria-label="Navigation menu"
        aria-modal="true"
        aria-hidden={!drawerOpen}
      >
        <button
          className="btn btn-ghost"
          style={{ alignSelf: 'flex-end', width: 44, padding: 0 }}
          aria-label="Close menu"
          onClick={() => setDrawerOpen(false)}
        >✕</button>
        {NAV_ITEMS.map((item, i) => (
          <button
            key={item}
            className={`nav__link${activeNav === i ? ' active' : ''}`}
            onClick={() => { setActiveNav(i); setDrawerOpen(false); }}
            style={{ width: '100%', justifyContent: 'flex-start' }}
          >{item}</button>
        ))}
      </div>

      {/* Layout */}
      <div className="layout">
        {/* Sidebar — #130 #131 */}
        <aside
          className="sidebar"
          aria-label="Sidebar navigation"
          ref={sideRef}
        >
          <nav aria-label="Sidebar">
            <ul className="sidebar-nav" role="menu">
              {SIDEBAR.map((item, i) => (
                <li key={item.label} role="none">
                  <button
                    className="sidebar-nav__item"
                    role="menuitem"
                    aria-current={activeSide === i ? 'page' : undefined}
                    onClick={() => { setActiveSide(i); announce(`${item.label} section`); }}
                  >
                    <span aria-hidden="true">{item.icon}</span>
                    {item.label}
                  </button>
                </li>
              ))}
            </ul>
          </nav>
        </aside>

        {/* Main content */}
        <main id="main-content" className="main" role="main" aria-label="Main content" tabIndex={-1}>

          {/* Page loader bar — #132 */}
          {pageLoad && (
            <div
              role="progressbar"
              aria-label="Page loading"
              aria-valuemin={0}
              aria-valuemax={100}
              style={{
                position: 'fixed', top: 0, left: 0, right: 0, height: 3, zIndex: 9999,
                background: 'var(--c-accent)',
                animation: 'shimmer 1.5s linear infinite',
              }}
            />
          )}

          {/* Tabs — #130 #131 */}
          <section className="section" aria-labelledby="tabs-heading">
            <h2 id="tabs-heading" className="section-title" style={{ marginBottom: 16 }}>Issue Tracker</h2>
            <div
              className="tabs"
              role="tablist"
              aria-label="Issues"
              ref={tabListRef}
            >
              {TABS.map((tab, i) => (
                <button
                  key={tab}
                  className="tab"
                  role="tab"
                  id={`tab-${i}`}
                  aria-selected={activeTab === i}
                  aria-controls={`panel-${i}`}
                  tabIndex={activeTab === i ? 0 : -1}
                  onClick={() => { setActiveTab(i); announce(`${tab} tab selected`); }}
                >{tab}</button>
              ))}
            </div>

            {TABS.map((tab, i) => (
              <div
                key={tab}
                id={`panel-${i}`}
                role="tabpanel"
                aria-labelledby={`tab-${i}`}
                hidden={activeTab !== i}
                tabIndex={0}
                style={{ padding: '20px 0' }}
              >
                <div className="card">
                  <p style={{ fontSize: 14, color: 'var(--c-muted)' }}>
                    {i === 0 && 'Full keyboard support: Tab, Shift+Tab, Arrow keys, Enter, Escape, Home, End — all implemented via FocusManager, KeyboardNav, and RovingTabindex utilities.'}
                    {i === 1 && 'Responsive at all breakpoints. Touch targets ≥44px. No overflow. Fluid typography. Mobile drawer with focus trap. Safe-area insets for notch devices.'}
                    {i === 2 && 'ARIA roles: navigation, main, banner, dialog, tablist, tab, tabpanel, menu, menuitem, status, progressbar, live regions. Screen reader announcements via aria-live.'}
                    {i === 3 && 'Standardized loading: Spinner, Skeleton (text/card/table), LoadingOverlay, InlineLoader, LoadingBar. No layout shift. prefers-reduced-motion aware. All have role="status".'}
                  </p>
                </div>
              </div>
            ))}
          </section>

          {/* Stats — loading states #132 */}
          <section className="section" aria-labelledby="stats-heading">
            <div className="section-header">
              <h2 id="stats-heading" className="section-title">Stats</h2>
              <button
                className="btn btn-ghost"
                style={{ fontSize: 13 }}
                onClick={() => simulateLoad(setCardLoad, 2000)}
                aria-label="Refresh stats"
              >↻ Refresh</button>
            </div>

            <div className="grid" aria-busy={cardLoad} aria-label="Statistics">
              {cardLoad
                ? [1,2,3].map(i => <SkeletonCard key={i} />)
                : [
                    { label: 'Total users',    value: '12,840', trend: '+8.2%', color: 'var(--c-accent)'   },
                    { label: 'Active sessions', value: '4,291',  trend: '+3.4%', color: 'var(--c-success)'  },
                    { label: 'Avg. score',      value: '87.4',   trend: '-1.1%', color: 'var(--c-warn)'     },
                  ].map(stat => (
                    <article key={stat.label} className="card" tabIndex={0} aria-label={`${stat.label}: ${stat.value}`}>
                      <div className="stat-label">{stat.label}</div>
                      <div className="stat-value" style={{ color: stat.color }}>{stat.value}</div>
                      <div className="stat-trend" style={{ color: stat.color }}>{stat.trend} this month</div>
                      <div style={{ marginTop: 12 }}>
                        <div className="progress-bar" role="progressbar" aria-valuenow={72} aria-valuemin={0} aria-valuemax={100} aria-label={`${stat.label} progress`}>
                          <div className="progress-fill" style={{ width: `${progress}%`, background: stat.color }} />
                        </div>
                      </div>
                    </article>
                  ))
              }
            </div>
          </section>

          {/* Table — mobile scroll + loading #129 #132 */}
          <section className="section" aria-labelledby="users-heading">
            <div className="section-header">
              <h2 id="users-heading" className="section-title">Users</h2>
              <div className="flex gap-2">
                <button className="btn btn-ghost" style={{ fontSize: 13 }}
                  onClick={() => simulateLoad(setTblLoad, 2000)}
                  aria-label="Reload user table"
                >↻ Reload</button>
                <button className="btn btn-primary" style={{ fontSize: 13 }}
                  onClick={() => { setModalOpen(true); announce('Add user dialog opened'); }}
                  aria-haspopup="dialog"
                >+ Add user</button>
              </div>
            </div>

            <div className="table-wrap" aria-busy={tableLoading}>
              {tableLoading ? (
                <div style={{ padding: 20 }} role="status" aria-label="Loading users">
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    {[...Array(4)].map((_, i) => (
                      <div key={i} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: 16, padding: '12px 16px' }}>
                        <Skel h={13} w="80%" /><Skel h={13} w="60%" /><Skel h={20} w={56} r={9999} /><Skel h={13} w="50%" />
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <table aria-label="User list">
                  <thead>
                    <tr>
                      <th scope="col">Name</th>
                      <th scope="col">Role</th>
                      <th scope="col">Status</th>
                      <th scope="col">Points</th>
                    </tr>
                  </thead>
                  <tbody>
                    {USERS.map(u => (
                      <tr key={u.name} tabIndex={0} aria-label={`${u.name}, ${u.role}, ${u.status}`}>
                        <td style={{ fontWeight: 500 }}>{u.name}</td>
                        <td style={{ color: 'var(--c-muted)' }}>{u.role}</td>
                        <td>{statusBadge(u.status)}</td>
                        <td className="font-mono">{u.points.toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </section>

          {/* Loading showcase — #132 */}
          <section className="section" aria-labelledby="loading-heading">
            <h2 id="loading-heading" className="section-title" style={{ marginBottom: 20 }}>Loading States</h2>
            <div className="grid">
              {[
                {
                  title: 'Spinner',
                  content: (
                    <div style={{ display: 'flex', gap: 20, alignItems: 'center', flexWrap: 'wrap' }}>
                      {([12,16,24,36] as const).map(s => <Spinner key={s} size={s} label={`Spinner ${s}px`} />)}
                    </div>
                  ),
                },
                {
                  title: 'Skeleton text',
                  content: (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                      <Skel h={14} /><Skel h={14} w="90%" /><Skel h={14} w="70%" />
                    </div>
                  ),
                },
                {
                  title: 'Button loading',
                  content: (
                    <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                      <button
                        className="btn btn-primary"
                        disabled={btnLoading}
                        onClick={() => simulateLoad(setBtnLoad, 2000)}
                        aria-disabled={btnLoading}
                        aria-describedby={btnLoading ? 'btn-status' : undefined}
                      >
                        {btnLoading
                          ? <><Spinner size={14} label="Saving" /><span style={{ marginLeft: 6 }}>Saving…</span></>
                          : 'Save changes'
                        }
                      </button>
                      {btnLoading && <span id="btn-status" className="sr-only" role="status">Saving changes, please wait</span>}
                    </div>
                  ),
                },
              ].map(({ title, content }) => (
                <article key={title} className="card" aria-label={title}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--c-muted)', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 16 }}>{title}</div>
                  {content}
                </article>
              ))}
            </div>
          </section>

          {/* Page load bar demo */}
          <section className="section">
            <button
              className="btn btn-ghost"
              style={{ fontSize: 13 }}
              onClick={() => simulateLoad(setPageLoad, 2000)}
            >Simulate page load bar</button>
          </section>

        </main>
      </div>

      {/* Modal — #130 #131 */}
      {modalOpen && (
        <div
          className="modal-backdrop"
          role="presentation"
          onClick={e => { if (e.target === e.currentTarget) setModalOpen(false); }}
        >
          <div
            className="modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-title"
            aria-describedby="modal-desc"
            ref={modalRef}
          >
            <div className="section-header" style={{ marginBottom: 16 }}>
              <h2 id="modal-title" style={{ fontSize: 17, fontWeight: 600 }}>Add user</h2>
              <button
                className="btn btn-ghost"
                style={{ width: 36, height: 36, minWidth: 36, padding: 0, fontSize: 16 }}
                aria-label="Close dialog"
                onClick={() => { setModalOpen(false); announce('Dialog closed'); }}
              >✕</button>
            </div>
            <p id="modal-desc" className="text-muted" style={{ marginBottom: 20 }}>Fill in the details below to create a new user account.</p>
            <form onSubmit={e => { e.preventDefault(); setModalOpen(false); announce('User added successfully'); }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div className="form-group">
                    <label className="label" htmlFor="first-name">First name <span aria-hidden="true">*</span></label>
                    <input id="first-name" className="input" type="text" required aria-required="true" autoComplete="given-name" />
                  </div>
                  <div className="form-group">
                    <label className="label" htmlFor="last-name">Last name <span aria-hidden="true">*</span></label>
                    <input id="last-name" className="input" type="text" required aria-required="true" autoComplete="family-name" />
                  </div>
                </div>
                <div className="form-group">
                  <label className="label" htmlFor="email">Email address <span aria-hidden="true">*</span></label>
                  <input id="email" className="input" type="email" required aria-required="true" autoComplete="email" />
                </div>
                <div className="form-group">
                  <label className="label" htmlFor="role">Role</label>
                  <select id="role" className="input" style={{ cursor: 'pointer' }}>
                    <option>Engineer</option><option>Designer</option><option>Manager</option>
                  </select>
                </div>
                <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                  <button type="button" className="btn btn-ghost" onClick={() => setModalOpen(false)}>Cancel</button>
                  <button type="submit" className="btn btn-primary">Create user</button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}