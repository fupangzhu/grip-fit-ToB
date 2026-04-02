import { useNavigate } from 'react-router';
import { Plus, TrendingUp, CheckCircle, Users, AlertCircle, ArrowRight, CalendarClock } from 'lucide-react';
import { useAppStore, STATUS_LABELS, STATUS_COLORS, RESEARCH_TYPE_LABELS, RESEARCH_TYPE_ICONS, ExperimentStatus } from '../../store';

const KANBAN_COLS: { key: ExperimentStatus; label: string; color: string }[] = [
  { key: 'running', label: '进行中', color: '#FF7D00' },
  { key: 'recruiting', label: '招募', color: '#3370FF' },
  { key: 'analyzing', label: '分析中', color: '#8B5CF6' },
];

export function HEDashboard() {
  const { state } = useAppStore();
  const navigate = useNavigate();
  const { heProjects } = state;

  const active = heProjects.filter(p => p.status === 'running' || p.status === 'recruiting').length;
  const done = heProjects.filter(p => p.status === 'completed').length;
  const participants = heProjects.reduce((s, p) => s + p.participants.filter(pp => pp.invitationStatus === 'confirmed').length, 0);

  return (
    <div className="px-4 py-4 space-y-4">
      {/* Stats */}
      <div className="grid grid-cols-3 gap-2">
        {[
          { label: '进行中', value: active, icon: TrendingUp, color: '#3370FF', bg: '#EEF3FF' },
          { label: '已完成', value: done, icon: CheckCircle, color: '#00B42A', bg: '#E8F7EA' },
          { label: '被试数', value: participants, icon: Users, color: '#8B5CF6', bg: '#F3F0FF' },
        ].map(c => (
          <div key={c.label} className="bg-white rounded-xl p-3 border" style={{ borderColor: '#E5E6EB' }}>
            <div className="w-6 h-6 rounded-md flex items-center justify-center mb-2" style={{ background: c.bg }}>
              <c.icon size={12} style={{ color: c.color }} />
            </div>
            <div style={{ fontSize: 20, fontWeight: 700, color: '#1D2129' }}>{c.value}</div>
            <div style={{ fontSize: 10, color: '#86909C' }}>{c.label}</div>
          </div>
        ))}
      </div>

      {/* Quick action */}
      <button onClick={() => navigate('/tob/he/projects/new')}
        className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-white"
        style={{ background: '#3370FF', fontSize: 13, fontWeight: 600 }}>
        <Plus size={15} /> 新建项目
      </button>

      {/* Project list by status */}
      {KANBAN_COLS.map(col => {
        const projects = heProjects.filter(p => p.status === col.key);
        if (projects.length === 0) return null;
        return (
          <div key={col.key}>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 rounded-full" style={{ background: col.color }} />
              <span style={{ fontSize: 12, fontWeight: 600, color: '#4E5969' }}>{col.label}</span>
              <span className="ml-auto px-1.5 py-0.5 rounded-full" style={{ fontSize: 10, background: '#F2F3F5', color: '#86909C' }}>{projects.length}</span>
            </div>
            <div className="space-y-2">
              {projects.map(p => {
                const confirmed = p.participants.filter(pp => pp.invitationStatus === 'confirmed').length;
                return (
                  <div key={p.id} onClick={() => navigate(`/tob/he/projects/${p.id}`)}
                    className="bg-white rounded-xl p-3 border active:bg-gray-50"
                    style={{ borderColor: '#E5E6EB' }}>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="truncate" style={{ fontSize: 13, fontWeight: 600, color: '#1D2129', maxWidth: '70%' }}>{p.name}</span>
                      <span style={{ fontSize: 10, color: col.color, fontWeight: 500 }}>{p.progress}%</span>
                    </div>
                    <div className="h-1 rounded-full overflow-hidden mb-2" style={{ background: '#F2F3F5' }}>
                      <div className="h-full rounded-full" style={{ width: `${p.progress}%`, background: col.color }} />
                    </div>
                    <div className="flex items-center gap-3" style={{ fontSize: 10, color: '#86909C' }}>
                      <span className="flex items-center gap-0.5"><Users size={9} /> {confirmed}/{p.participantTarget}</span>
                      {p.deadline && <span className="flex items-center gap-0.5"><CalendarClock size={9} /> {p.deadline}</span>}
                      <span className="flex items-center gap-0.5 ml-auto" style={{ color: '#3370FF' }}>详情 <ArrowRight size={9} /></span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
