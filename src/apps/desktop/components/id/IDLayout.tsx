import { Outlet, NavLink, useNavigate } from 'react-router';
import { LayoutDashboard, Ruler, TestTube, Smartphone, Bell, ChevronRight, LogOut, Pencil } from 'lucide-react';

const navItems = [
  { to: '/tob/id/dashboard', label: '工作台', icon: LayoutDashboard, end: true },
  { to: '/tob/id/params', label: '设计参考工具', icon: Ruler },
  { to: '/tob/id/validate', label: '样机 AI 评审', icon: TestTube },
];

export function IDLayout() {
  const navigate = useNavigate();
  return (
    <div className="flex h-screen overflow-hidden" style={{ background: '#F7F8FA' }}>
      <aside className="w-56 flex-shrink-0 bg-white flex flex-col border-r" style={{ borderColor: '#E5E6EB' }}>
        <div className="px-4 py-4 flex items-center gap-2.5 border-b" style={{ borderColor: '#E5E6EB' }}>
          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #00B42A 0%, #009A29 100%)' }}>
            <Pencil size={15} className="text-white" />
          </div>
          <div>
            <div className="text-sm" style={{ fontWeight: 600, color: '#1D2129' }}>GripFit ToB</div>
            <div className="text-xs" style={{ color: '#00B42A' }}>ID 设计师</div>
          </div>
        </div>
        <nav className="flex-1 px-2 py-3 overflow-y-auto">
          <div className="px-3 mb-1 text-xs uppercase tracking-wider" style={{ color: '#86909C', fontWeight: 500 }}>工具</div>
          {navItems.map(item => (
            <NavLink key={item.to} to={item.to} end={item.end}
              className={({ isActive }) =>
                `flex items-center gap-2.5 px-3 py-2 rounded-md text-sm transition-colors ${isActive ? '' : 'hover:bg-gray-50'}`
              }
              style={({ isActive }) => isActive ? { background: '#E8F7EA', color: '#00B42A', fontWeight: 500 } : { color: '#4E5969' }}
            >
              {({ isActive }) => (
                <>
                  <item.icon size={15} style={{ color: isActive ? '#00B42A' : '#86909C' }} />
                  {item.label}
                </>
              )}
            </NavLink>
          ))}
        </nav>
        <div className="px-2 py-3 border-t" style={{ borderColor: '#E5E6EB' }}>
          <div className="flex items-center gap-2.5 px-3 py-2 rounded-md text-sm cursor-pointer transition-colors hover:bg-gray-50"
            style={{ color: '#4E5969' }}
            onClick={() => navigate('/tob/role-select')}>
            <LogOut size={15} style={{ color: '#86909C' }} />切换角色
          </div>
          <div className="flex items-center gap-2.5 px-3 pt-2 mt-1 border-t" style={{ borderColor: '#F2F3F5' }}>
            <div className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs" style={{ fontWeight: 600, background: '#00B42A' }}>李</div>
            <div>
              <div className="text-xs" style={{ fontWeight: 500, color: '#1D2129' }}>李设计师</div>
              <div className="text-xs" style={{ color: '#86909C' }}>ID 设计师</div>
            </div>
          </div>
        </div>
      </aside>
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-12 bg-white flex items-center justify-between px-5 flex-shrink-0 border-b" style={{ borderColor: '#E5E6EB' }}>
          <div className="flex items-center gap-1 text-sm" style={{ color: '#86909C' }}>
            <span>GripFit</span><ChevronRight size={13} /><span style={{ color: '#1D2129' }}>ID 设计师</span>
          </div>
          <button className="relative w-8 h-8 rounded-lg flex items-center justify-center transition-colors hover:bg-gray-100" style={{ color: '#4E5969' }}>
            <Bell size={16} />
            <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full" style={{ background: '#00B42A' }} />
          </button>
        </header>
        <main className="flex-1 overflow-y-auto"><Outlet /></main>
      </div>
    </div>
  );
}