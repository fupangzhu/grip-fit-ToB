import { useState } from 'react';
import { useNavigate } from 'react-router';
import { FlaskConical, Pencil, ArrowRight, Smartphone } from 'lucide-react';
import { useAppStore, Role } from '../store';

const ROLES: { key: Role; icon: React.ReactNode; title: string; sub: string; color: string; bg: string; border: string; route: string }[] = [
  { key: 'he', icon: <FlaskConical size={20} />, title: '人因工程师', sub: '实验设计·数据采集·统计分析', color: '#3370FF', bg: '#EEF3FF', border: '#BFD0FF', route: '/tob/he/dashboard' },
  { key: 'id', icon: <Pencil size={20} />, title: 'ID 设计师', sub: '参数优化·底模生成·样机评审', color: '#00B42A', bg: '#E8F7EA', border: '#B7EB8F', route: '/tob/id/dashboard' },
];

export function RoleSelect() {
  const navigate = useNavigate();
  const { dispatch } = useAppStore();
  const [selected, setSelected] = useState<Role | null>(null);

  function handleEnter() {
    if (!selected) return;
    dispatch({ type: 'SET_ROLE', payload: selected });
    navigate(ROLES.find(r => r.key === selected)!.route);
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-5 py-10" style={{ background: '#F7F8FA' }}>
      <div className="w-full" style={{ maxWidth: 360 }}>
        <div className="flex items-center gap-2 justify-center mb-8">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #3370FF, #1456F0)' }}>
            <Smartphone size={16} className="text-white" />
          </div>
          <span style={{ fontSize: 14, fontWeight: 700, color: '#1D2129' }}>GripFit</span>
        </div>

        <h1 className="text-center mb-6" style={{ fontSize: 18, fontWeight: 700, color: '#1D2129' }}>选择角色</h1>

        <div className="space-y-3 mb-6">
          {ROLES.map(r => {
            const active = selected === r.key;
            return (
              <button key={r.key} onClick={() => setSelected(r.key)}
                className="w-full flex items-center gap-3 p-4 rounded-xl transition-all text-left"
                style={{ background: active ? r.bg : 'white', border: `2px solid ${active ? r.color : '#E5E6EB'}` }}>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ background: active ? r.color : '#F2F3F5', color: active ? 'white' : '#86909C' }}>
                  {r.icon}
                </div>
                <div className="flex-1">
                  <div style={{ fontSize: 14, fontWeight: 600, color: '#1D2129' }}>{r.title}</div>
                  <div style={{ fontSize: 11, color: '#86909C', marginTop: 1 }}>{r.sub}</div>
                </div>
                {active && <div className="w-5 h-5 rounded-full flex items-center justify-center" style={{ background: r.color }}><div className="w-2 h-2 bg-white rounded-full" /></div>}
              </button>
            );
          })}
        </div>

        <button onClick={handleEnter} disabled={!selected}
          className="w-full py-3 rounded-xl flex items-center justify-center gap-2 transition-all"
          style={selected
            ? { background: ROLES.find(r => r.key === selected)!.color, color: 'white', fontSize: 14, fontWeight: 600 }
            : { background: '#F2F3F5', color: '#C9CDD4', fontSize: 14 }
          }>
          {selected ? '进入工作台' : '请选择角色'} <ArrowRight size={15} />
        </button>

        <p className="text-center mt-6" style={{ fontSize: 10, color: '#C9CDD4' }}>GripFit v2.0</p>
      </div>
    </div>
  );
}
