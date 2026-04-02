import { Outlet, NavLink, useNavigate } from 'react-router';
import { LayoutDashboard, FolderOpen, Plus, LogOut, FlaskConical } from 'lucide-react';

const tabs = [
  { to: '/tob/he/dashboard', label: '看板', icon: LayoutDashboard, end: true },
  { to: '/tob/he/projects', label: '项目', icon: FolderOpen },
  { to: '/tob/he/projects/new', label: '新建', icon: Plus },
];

export function HELayout() {
  const navigate = useNavigate();
  return (
    <div className="flex flex-col h-screen" style={{ background: '#F7F8FA', maxWidth: 430, margin: '0 auto' }}>
      {/* Top bar */}
      <header className="flex items-center justify-between px-4 py-2.5 bg-white border-b flex-shrink-0" style={{ borderColor: '#E5E6EB' }}>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-md flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #3370FF, #1456F0)' }}>
            <FlaskConical size={11} className="text-white" />
          </div>
          <span style={{ fontSize: 13, fontWeight: 600, color: '#1D2129' }}>人因工程师</span>
        </div>
        <button onClick={() => navigate('/tob/role-select')} className="p-1.5 rounded-lg" style={{ color: '#86909C' }}>
          <LogOut size={16} />
        </button>
      </header>

      <main className="flex-1 overflow-y-auto">
        <Outlet />
      </main>

      {/* Bottom tab bar */}
      <nav className="flex items-center bg-white border-t flex-shrink-0" style={{ borderColor: '#E5E6EB' }}>
        {tabs.map(t => (
          <NavLink key={t.to} to={t.to} end={t.end}
            className="flex-1 flex flex-col items-center py-2 gap-0.5"
            style={({ isActive }) => ({ color: isActive ? '#3370FF' : '#86909C' })}>
            {({ isActive }) => (
              <>
                <t.icon size={18} strokeWidth={isActive ? 2.2 : 1.8} />
                <span style={{ fontSize: 10, fontWeight: isActive ? 600 : 400 }}>{t.label}</span>
              </>
            )}
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
