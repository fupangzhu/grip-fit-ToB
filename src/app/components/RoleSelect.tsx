import { useState } from 'react';
import type { ReactNode } from 'react';
import { useNavigate } from 'react-router';
import { FlaskConical, Pencil, ArrowRight, Smartphone, ChevronRight } from 'lucide-react';
import { useAppStore, Role } from '../store';

const ROLES: { key: Role; icon: ReactNode; title: string; subtitle: string; desc: string; primaryColor: string; bgColor: string; borderColor: string; activeBg: string; route: string }[] = [
  {
    key: 'he',
    icon: <FlaskConical size={28} />,
    title: '人因工程师',
    subtitle: 'Human Factors Engineer',
    desc: '负责实验设计、被试招募、生理数据采集（EEG/EDA/面部情绪）、统计分析与研究报告输出',
    primaryColor: '#3370FF',
    bgColor: '#EEF3FF',
    borderColor: '#BFD0FF',
    activeBg: '#F0F5FF',
    route: '/tob/he/dashboard',
  },
  {
    key: 'id',
    icon: <Pencil size={28} />,
    title: 'ID 设计师',
    subtitle: 'Industrial Designer',
    desc: '基于人因研究数据优化机身参数（宽度/高度/厚度/圆角），获得直接可用的设计规范与验证评估',
    primaryColor: '#00B42A',
    bgColor: '#E8F7EA',
    borderColor: '#B7EB8F',
    activeBg: '#F6FFED',
    route: '/tob/id/dashboard',
  },
];

export function RoleSelect() {
  const navigate = useNavigate();
  const { dispatch } = useAppStore();
  const [selected, setSelected] = useState<Role | null>(null);

  function handleEnter() {
    if (!selected) return;
    dispatch({ type: 'SET_ROLE', payload: selected });
    const role = ROLES.find(r => r.key === selected);
    if (role) navigate(role.route);
  }

  const selectedRole = ROLES.find(r => r.key === selected);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8" style={{ background: '#F7F8FA' }}>
      {/* Brand */}
      <div className="flex items-center gap-3 mb-12">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center shadow-sm" style={{ background: 'linear-gradient(135deg, #3370FF 0%, #1456F0 100%)' }}>
          <Smartphone size={20} className="text-white" />
        </div>
        <div>
          <div className="text-sm" style={{ fontWeight: 700, color: '#1D2129' }}>GripFit ToB</div>
          <div className="text-xs" style={{ color: '#86909C' }}>人因研究管理平台</div>
        </div>
      </div>

      {/* Title */}
      <div className="text-center mb-8">
        <h1 className="mb-2" style={{ fontWeight: 700, fontSize: '1.75rem', color: '#1D2129' }}>选择你的工作角色</h1>
        <p style={{ color: '#86909C' }}>不同角色对应专属工作台与数据视图</p>
      </div>

      {/* Role cards */}
      <div className="grid grid-cols-2 gap-4 max-w-2xl w-full mb-8">
        {ROLES.map(role => {
          const isSelected = selected === role.key;
          return (
            <button
              key={role.key}
              onClick={() => setSelected(role.key)}
              className="relative p-6 rounded-2xl border-2 text-left transition-all duration-200 group"
              style={{
                background: isSelected ? role.activeBg : 'white',
                borderColor: isSelected ? role.primaryColor : '#E5E6EB',
                boxShadow: isSelected ? `0 4px 12px ${role.primaryColor}20` : 'none',
                transform: isSelected ? 'scale(1.02)' : 'scale(1)',
              }}
            >
              {/* Selection indicator */}
              {isSelected && (
                <div className="absolute top-4 right-4 w-6 h-6 rounded-full flex items-center justify-center text-white" style={{ background: role.primaryColor }}>
                  <div className="w-2.5 h-2.5 bg-white rounded-full" />
                </div>
              )}

              {/* Icon */}
              <div className="mb-4 w-12 h-12 rounded-xl flex items-center justify-center transition-colors"
                style={{ background: isSelected ? role.bgColor : '#F2F3F5', color: isSelected ? role.primaryColor : '#86909C' }}>
                {role.icon}
              </div>

              {/* Text */}
              <div className="mb-0.5" style={{ fontWeight: 700, fontSize: '1rem', color: '#1D2129' }}>{role.title}</div>
              <div className="text-xs mb-3" style={{ color: '#86909C' }}>{role.subtitle}</div>
              <p className="text-sm leading-relaxed" style={{ color: '#4E5969' }}>{role.desc}</p>

              {/* Bottom arrow indicator */}
              <div className="mt-4 flex items-center gap-1 text-xs transition-opacity opacity-0 group-hover:opacity-100"
                style={{ color: role.primaryColor, fontWeight: 500 }}>
                进入工作台 <ChevronRight size={12} />
              </div>
            </button>
          );
        })}
      </div>

      {/* Enter button */}
      <button
        onClick={handleEnter}
        disabled={!selected}
        className="flex items-center gap-3 px-10 py-3.5 rounded-2xl text-sm transition-all duration-200 shadow-sm"
        style={
          selected
            ? { background: selectedRole?.primaryColor ?? '#3370FF', color: 'white', fontWeight: 600, boxShadow: `0 4px 16px ${selectedRole?.primaryColor}40` }
            : { background: '#F2F3F5', color: '#C9CDD4', cursor: 'not-allowed' }
        }
      >
        {selected ? `进入 ${ROLES.find(r => r.key === selected)?.title} 工作台` : '请选择你的角色'}
        <ArrowRight size={16} />
      </button>

      <div className="mt-10 text-xs" style={{ color: '#C9CDD4' }}>GripFit ToB · 人因研究管理平台 v2.0</div>
    </div>
  );
}