import { Outlet, NavLink, useNavigate } from 'react-router';
import { LayoutDashboard, FolderOpen, Plus, Users, Archive, Settings, Smartphone, Bell, ChevronRight, LogOut, FlaskConical } from 'lucide-react';

const navGroups = [
  {
    label: '工作区',
    items: [
      { to: '/tob/he/dashboard', label: '工作看板', icon: LayoutDashboard, end: true },
      { to: '/tob/he/projects', label: '我的项目', icon: FolderOpen },
      { to: '/tob/he/projects/new', label: '新建项目', icon: Plus },
    ],
  },
  {
    label: '资源',
    items: [
      { to: '#', label: '被试库', icon: Users },
      { to: '#', label: '数据归档', icon: Archive },
      { to: '#', label: '系统设置', icon: Settings },
    ],
  },
];

export function HELayout() {
  const navigate = useNavigate();
  return (
    <div className="flex h-screen overflow-hidden" style={{ background: '#F7F8FA' }}>
      {/* Sidebar */}
      <aside className="w-56 flex-shrink-0 bg-white flex flex-col border-r" style={{ borderColor: '#E5E6EB' }}>
        {/* Brand */}
        <div className="px-4 py-4 flex items-center gap-2.5 border-b" style={{ borderColor: '#E5E6EB' }}>
          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #3370FF 0%, #1456F0 100%)' }}>
            <FlaskConical size={15} className="text-white" />
          </div>
          <div>
            <div className="text-sm" style={{ fontWeight: 600, color: '#1D2129' }}>GripFit ToB</div>
            <div className="text-xs" style={{ color: '#3370FF' }}>人因工程师</div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-2 py-3 overflow-y-auto">
          {navGroups.map(group => (
            <div key={group.label} className="mb-4">
              <div className="px-3 mb-1 text-xs uppercase tracking-wider" style={{ color: '#86909C', fontWeight: 500 }}>{group.label}</div>
              {group.items.map(item => (
                item.to === '#' ? (
                  <div key={item.label} className="flex items-center gap-2.5 px-3 py-2 rounded-md text-sm cursor-pointer transition-colors hover:bg-gray-50" style={{ color: '#4E5969' }}>
                    <item.icon size={15} style={{ color: '#86909C' }} />{item.label}
                  </div>
                ) : (
                  <NavLink key={item.to} to={item.to} end={item.end}
                    className={({ isActive }) =>
                      `flex items-center gap-2.5 px-3 py-2 rounded-md text-sm transition-colors ${isActive ? 'font-medium' : 'hover:bg-gray-50'}`
                    }
                    style={({ isActive }) => isActive ? { background: '#EEF3FF', color: '#3370FF', fontWeight: 500 } : { color: '#4E5969' }}
                  >
                    {({ isActive }) => (
                      <>
                        <item.icon size={15} style={{ color: isActive ? '#3370FF' : '#86909C' }} />
                        {item.label}
                      </>
                    )}
                  </NavLink>
                )
              ))}
            </div>
          ))}
        </nav>

        {/* Footer */}
        <div className="px-2 py-3 border-t" style={{ borderColor: '#E5E6EB' }}>
          <div className="flex items-center gap-2.5 px-3 py-2 rounded-md text-sm cursor-pointer transition-colors hover:bg-gray-50"
            style={{ color: '#4E5969' }}
            onClick={() => navigate('/tob/role-select')}>
            <LogOut size={15} style={{ color: '#86909C' }} />
            切换角色
          </div>
          <div className="flex items-center gap-2.5 px-3 pt-2 mt-1 border-t" style={{ borderColor: '#F2F3F5' }}>
            <div className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs" style={{ fontWeight: 600, background: '#3370FF' }}>张</div>
            <div>
              <div className="text-xs" style={{ fontWeight: 500, color: '#1D2129' }}>张研究员</div>
              <div className="text-xs" style={{ color: '#86909C' }}>人因工程师</div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-12 bg-white flex items-center justify-between px-5 flex-shrink-0 border-b" style={{ borderColor: '#E5E6EB' }}>
          <div className="flex items-center gap-1 text-sm" style={{ color: '#86909C' }}>
            <span>GripFit</span>
            <ChevronRight size={13} />
            <span style={{ color: '#1D2129' }}>人因工程师</span>
          </div>
          <div className="flex items-center gap-2">
            <button className="relative w-8 h-8 rounded-lg flex items-center justify-center transition-colors hover:bg-gray-100" style={{ color: '#4E5969' }}>
              <Bell size={16} />
              <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-red-500 rounded-full" />
            </button>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
