import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useState } from 'react';

// ─── SVG Icons (inline, avoids icon lib dependency) ───────────────────────
const IconRequests   = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>;
const IconCandidates = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>;
const IconDashboard  = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>;
const IconUsers      = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>;
const IconSettings   = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14M4.93 4.93a10 10 0 0 0 0 14.14"/></svg>;
const IconLogout     = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>;
const IconChevron    = ({ left }: { left?: boolean }) => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    {left ? <polyline points="15 18 9 12 15 6"/> : <polyline points="9 18 15 12 9 6"/>}
  </svg>
);

const NAV_ITEMS = [
  { to: '/requests',   label: 'Requests',   icon: <IconRequests /> },
  { to: '/candidates', label: 'Candidates', icon: <IconCandidates /> },
  { to: '/dashboard',  label: 'Dashboard',  icon: <IconDashboard /> },
];

const ADMIN_ITEMS = [
  { to: '/admin/users',       label: 'Users',       icon: <IconUsers /> },
  { to: '/admin/master-data', label: 'Master Data', icon: <IconSettings /> },
];

export default function MainLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  const sidebarW = collapsed ? 60 : 224;

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', background: 'var(--ghn-surface)' }}>

      {/* ── Sidebar ── */}
      <aside className="bg-slate-900" style={{
        width: sidebarW,
        minWidth: sidebarW,
        display: 'flex',
        flexDirection: 'column',
        transition: 'width 0.22s cubic-bezier(.4,0,.2,1)',
        overflow: 'hidden',
        position: 'relative',
        zIndex: 10,
        boxShadow: '2px 0 12px rgba(0,0,0,0.18)',
        flexShrink: 0,
      }}>

        {/* ── Brand / Logo ── */}
        <div style={{
          padding: collapsed ? '18px 0' : '16px 14px',
          borderBottom: '1px solid rgba(255,255,255,0.07)',
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          minHeight: 64,
          justifyContent: collapsed ? 'center' : 'flex-start',
          transition: 'padding 0.22s',
        }}>
          <img
            src="/ghn-icon.svg"
            alt="GHN"
            style={{
              width: 34, height: 34,
              borderRadius: 8,
              flexShrink: 0,
              filter: 'drop-shadow(0 2px 6px rgba(255,82,0,0.5))',
            }}
          />
          {!collapsed && (
            <div style={{ overflow: 'hidden', lineHeight: 1 }}>
              <div className="text-white" style={{ fontWeight: 800, fontSize: 14, whiteSpace: 'nowrap', letterSpacing: '-0.2px' }}>
                GHN Recruit
              </div>
              <div className="text-slate-600" style={{ fontSize: 10.5, marginTop: 2 }}>HRBP Portal</div>
            </div>
          )}
        </div>

        {/* ── Navigation ── */}
        <nav style={{
          flex: 1,
          padding: '10px 8px',
          display: 'flex',
          flexDirection: 'column',
          gap: 2,
          overflowY: 'auto',
          overflowX: 'hidden',
        }}>
          {/* Section label */}
          {!collapsed && (
            <div className="text-slate-700" style={{
              fontSize: 10, fontWeight: 600,
              textTransform: 'uppercase', letterSpacing: '0.07em',
              padding: '6px 10px 4px',
            }}>Menu</div>
          )}

          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              title={collapsed ? item.label : ''}
              style={({ isActive }) => ({
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: collapsed ? '10px 0' : '9px 10px',
                justifyContent: collapsed ? 'center' : 'flex-start',
                borderRadius: 8,
                textDecoration: 'none',
                color: isActive ? 'white' : '#6B7280',
                background: isActive ? 'rgba(255,82,0,0.15)' : 'transparent',
                borderLeft: isActive ? '3px solid #FF5200' : '3px solid transparent',
                fontWeight: isActive ? 600 : 400,
                fontSize: 13,
                transition: 'all 0.15s ease',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
              })}
            >
              <span style={{ flexShrink: 0, display: 'flex', alignItems: 'center' }}>{item.icon}</span>
              {!collapsed && item.label}
            </NavLink>
          ))}

          {/* Admin section */}
          {user?.role === 'admin' && (
            <>
              {!collapsed && (
                <div className="text-slate-700" style={{
                  fontSize: 10, fontWeight: 600,
                  textTransform: 'uppercase', letterSpacing: '0.07em',
                  padding: '14px 10px 4px',
                }}>Admin</div>
              )}
              {collapsed && <div style={{ margin: '8px 0', borderTop: '1px solid rgba(255,255,255,0.07)' }} />}

              {ADMIN_ITEMS.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  title={collapsed ? item.label : ''}
                  style={({ isActive }) => ({
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    padding: collapsed ? '10px 0' : '9px 10px',
                    justifyContent: collapsed ? 'center' : 'flex-start',
                    borderRadius: 8,
                    textDecoration: 'none',
                    color: isActive ? 'white' : '#6B7280',
                    background: isActive ? 'rgba(255,82,0,0.15)' : 'transparent',
                    borderLeft: isActive ? '3px solid #FF5200' : '3px solid transparent',
                    fontWeight: isActive ? 600 : 400,
                    fontSize: 13,
                    transition: 'all 0.15s ease',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                  })}
                >
                  <span style={{ flexShrink: 0, display: 'flex', alignItems: 'center' }}>{item.icon}</span>
                  {!collapsed && item.label}
                </NavLink>
              ))}
            </>
          )}
        </nav>

        {/* ── User + Collapse ── */}
        <div style={{ padding: '8px', borderTop: '1px solid rgba(255,255,255,0.07)' }}>
          {/* User chip */}
          {!collapsed && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: 8,
              padding: '8px 10px', borderRadius: 8,
              background: 'rgba(255,255,255,0.04)',
              marginBottom: 6, overflow: 'hidden',
            }}>
              <div className="text-white" style={{
                width: 30, height: 30, borderRadius: '50%', flexShrink: 0,
                background: 'linear-gradient(135deg, #FF5200, #F67700)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontWeight: 700, fontSize: 12,
                boxShadow: '0 2px 8px rgba(255,82,0,0.35)',
              }}>
                {user?.fullName?.charAt(0) ?? 'U'}
              </div>
              <div style={{ overflow: 'hidden', flex: 1, minWidth: 0 }}>
                <div className="text-white" style={{ fontSize: 12.5, fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {user?.fullName}
                </div>
                <div className="text-slate-600" style={{ fontSize: 10.5 }}>
                  {user?.role === 'admin' ? 'Admin' : 'HRBP'}
                </div>
              </div>
            </div>
          )}

          {/* Logout */}
          <button
            id="btn-logout"
            onClick={handleLogout}
            title="Đăng xuất"
            className="text-slate-500"
            style={{
              width: '100%', padding: collapsed ? '9px 0' : '8px 10px',
              display: 'flex', alignItems: 'center',
              justifyContent: collapsed ? 'center' : 'flex-start',
              gap: 8, background: 'transparent', border: 'none',
              cursor: 'pointer', borderRadius: 8,
              fontSize: 13, transition: 'color 0.15s, background 0.15s',
              fontFamily: 'inherit', marginBottom: 2,
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = '#EF4444'; (e.currentTarget as HTMLElement).style.background = 'rgba(239,68,68,0.08)'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = '#6B7280'; (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
          >
            <span style={{ display: 'flex', alignItems: 'center', flexShrink: 0 }}><IconLogout /></span>
            {!collapsed && 'Đăng xuất'}
          </button>

          {/* Collapse toggle */}
          <button
            onClick={() => setCollapsed(!collapsed)}
            title={collapsed ? 'Mở rộng sidebar' : 'Thu gọn sidebar'}
            className="text-slate-600"
            style={{
              width: '100%', padding: collapsed ? '8px 0' : '7px 10px',
              display: 'flex', alignItems: 'center',
              justifyContent: collapsed ? 'center' : 'flex-start',
              gap: 8, background: 'transparent', border: 'none',
              cursor: 'pointer', borderRadius: 8,
              fontSize: 12, transition: 'color 0.15s',
              fontFamily: 'inherit',
            }}
            onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = 'white'}
            onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = '#4B5563'}
          >
            <span style={{ display: 'flex', alignItems: 'center', flexShrink: 0 }}>
              {collapsed ? <IconChevron /> : <IconChevron left />}
            </span>
            {!collapsed && 'Thu gọn'}
          </button>
        </div>
      </aside>

      {/* ── Main content ── */}
      <main style={{ flex: 1, overflow: 'auto', display: 'flex', flexDirection: 'column', minWidth: 0 }}>

        {/* Top bar */}
        <header className="bg-white" style={{
          padding: '0 24px',
          height: 52,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1px solid #E5E7EB',
          flexShrink: 0,
          gap: 16,
        }}>
          {/* Breadcrumb placeholder / page title area */}
          <div style={{ fontSize: 13, color: 'var(--ghn-silver)' }} />

          {/* Right: user greeting + avatar */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 13, color: 'var(--ghn-silver)' }}>
              Xin chào, <strong style={{ color: 'var(--ghn-navy)' }}>{user?.fullName}</strong>
            </span>
            <div className="text-white" style={{
              width: 30, height: 30, borderRadius: '50%',
              background: 'linear-gradient(135deg, #FF5200, #F67700)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontWeight: 700, fontSize: 12,
              boxShadow: '0 2px 8px rgba(255,82,0,0.30)',
            }}>
              {user?.fullName?.charAt(0) ?? 'U'}
            </div>
          </div>
        </header>

        {/* Page content */}
        <div style={{ flex: 1, overflow: 'auto' }}>
          <Outlet />
        </div>
      </main>
    </div>
  );
}
