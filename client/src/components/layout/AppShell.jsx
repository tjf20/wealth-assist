import { NavLink, useLocation } from 'react-router-dom'

const NAV = [
  { to: '/',        label: 'Home',        icon: 'ti-home' },
  { to: '/today',   label: 'Today',       icon: 'ti-calendar' },
  { to: '/clients', label: 'Clients',     icon: 'ti-users' },
  { to: '/reports', label: 'Reports',     icon: 'ti-file-analytics' },
]

const ADVISOR = { name: 'James Whitfield', initials: 'JW' }

export default function AppShell({ children }) {
  const location = useLocation()

  const fmt = new Intl.DateTimeFormat('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  }).format(new Date())

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', background: 'var(--bg)' }}>
      {/* Top navigation */}
      <nav style={{
        height: 50,
        background: 'var(--nav)',
        borderBottom: '0.5px solid var(--border)',
        display: 'flex',
        alignItems: 'center',
        padding: '0 28px',
        flexShrink: 0,
        gap: 0,
        position: 'sticky',
        top: 0,
        zIndex: 50
      }}>
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginRight: 32 }}>
          <div style={{
            width: 28, height: 28, background: 'var(--accent)',
            borderRadius: 7, display: 'flex', alignItems: 'center',
            justifyContent: 'center'
          }}>
            <span style={{ color: '#fff', fontSize: 11, fontWeight: 500 }}>WA</span>
          </div>
          <span style={{ fontSize: 14, fontWeight: 500, color: 'var(--text)' }}>Wealth Assistant</span>
        </div>

        {/* Nav links */}
        {NAV.map(({ to, label, icon }) => {
          const isActive = to === '/'
            ? location.pathname === '/'
            : location.pathname.startsWith(to)
          return (
            <NavLink key={to} to={to} style={{
              height: 50,
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              padding: '0 16px',
              fontSize: 13,
              color: isActive ? 'var(--text)' : 'var(--subtle)',
              textDecoration: 'none',
              borderBottom: isActive ? '2px solid var(--accent)' : '2px solid transparent',
              transition: 'color 0.15s'
            }}>
              <i className={`ti ${icon}`} style={{ fontSize: 15 }} aria-hidden="true" />
              {label}
            </NavLink>
          )
        })}

        {/* Right side */}
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 14 }}>
          <span style={{ fontSize: 12, color: 'var(--subtle)' }}>{fmt}</span>
          <div style={{ fontSize: 18, color: 'var(--subtle)', cursor: 'pointer' }}>
            <i className="ti ti-bell" aria-hidden="true" />
          </div>
          <div title={ADVISOR.name} style={{
            width: 28, height: 28, borderRadius: '50%',
            background: 'rgba(29,78,216,0.3)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 10, fontWeight: 500, color: 'var(--accent-light)', cursor: 'pointer'
          }}>
            {ADVISOR.initials}
          </div>
        </div>
      </nav>

      {/* Page content */}
      <main style={{ flex: 1, overflow: 'auto' }} className="page-enter">
        {children}
      </main>
    </div>
  )
}
