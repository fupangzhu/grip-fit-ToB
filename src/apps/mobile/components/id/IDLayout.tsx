import { Outlet, NavLink, useNavigate } from 'react-router';
import { LayoutDashboard, Ruler, TestTube, LogOut, Pencil } from 'lucide-react';

const tabs = [
  { to: '/tob/id/dashboard', label: '工作台', icon: LayoutDashboard, end: true },
  { to: '/tob/id/params', label: '设计参考', icon: Ruler },
  { to: '/tob/id/validate', label: 'AI评审', icon: TestTube },
];

export function IDLayout() {
  const navigate = useNavigate();
  return (
    <div className="flex flex-col h-screen" style={{ background: '#F7F8FA', maxWidth: 430, margin: '0 auto' }}>
      <header className="flex items-center justify-between px-4 py-2.5 bg-white border-b flex-shrink-0" style={{ borderColor: '#E5E6EB' }}>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-md flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #00B42A, #009A29)' }}>
            <Pencil size={11} className="text-white" />
          </div>
          <span style={{ fontSize: 13, fontWeight: 600, color: '#1D2129' }}>ID 设计师</span>
        </div>
        <button onClick={() => navigate('/tob/role-select')} className="p-1.5 rounded-lg" style={{ color: '#86909C' }}>
          <LogOut size={16} />
        </button>
      </header>

      <main className="flex-1 overflow-y-auto">
        <Outlet />
      </main>

      <nav className="flex items-center bg-white border-t flex-shrink-0" style={{ borderColor: '#E5E6EB' }}>
        {tabs.map(t => (
          <NavLink key={t.to} to={t.to} end={t.end}
            className="flex-1 flex flex-col items-center py-2 gap-0.5"
            style={({ isActive }) => ({ color: isActive ? '#00B42A' : '#86909C' })}>
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
