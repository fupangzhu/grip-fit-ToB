import { useState } from 'react';
import { useNavigate } from 'react-router';
import { Plus, Search, ArrowRight, Users, Filter } from 'lucide-react';
import { useAppStore, STATUS_COLORS, STATUS_LABELS, RESEARCH_TYPE_LABELS, RESEARCH_TYPE_ICONS, ExperimentStatus, RUN_STEPS } from '../../store';

const FILTERS: { key: ExperimentStatus | 'all'; label: string }[] = [
  { key: 'all', label: '全部' }, { key: 'running', label: '进行中' },
  { key: 'recruiting', label: '招募' }, { key: 'analyzing', label: '分析' },
  { key: 'completed', label: '完成' },
];

export function HEProjectList() {
  const { state } = useAppStore();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<ExperimentStatus | 'all'>('all');

  const list = state.heProjects.filter(p => {
    if (filter !== 'all' && p.status !== filter) return false;
    if (search && !p.name.includes(search)) return false;
    return true;
  });

  return (
    <div className="px-4 py-4 space-y-3">
      <div className="flex items-center justify-between">
        <span style={{ fontSize: 16, fontWeight: 700, color: '#1D2129' }}>我的项目</span>
        <button onClick={() => navigate('/tob/he/projects/new')}
          className="w-8 h-8 rounded-lg flex items-center justify-center text-white"
          style={{ background: '#3370FF' }}>
          <Plus size={16} />
        </button>
      </div>

      <div className="relative">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: '#C9CDD4' }} />
        <input value={search} onChange={e => setSearch(e.target.value)}
          placeholder="搜索项目…"
          className="w-full pl-9 pr-3 py-2 rounded-lg text-sm outline-none"
          style={{ border: '1px solid #E5E6EB', fontSize: 12 }} />
      </div>

      <div className="flex gap-1.5 overflow-x-auto pb-1">
        {FILTERS.map(f => (
          <button key={f.key} onClick={() => setFilter(f.key)}
            className="px-2.5 py-1 rounded-full whitespace-nowrap"
            style={filter === f.key
              ? { background: '#3370FF', color: 'white', fontSize: 11, fontWeight: 600 }
              : { background: 'white', border: '1px solid #E5E6EB', color: '#4E5969', fontSize: 11 }
            }>{f.label}</button>
        ))}
      </div>

      <div className="space-y-2">
        {list.map(p => {
          const confirmed = p.participants.filter(pp => pp.invitationStatus === 'confirmed').length;
          return (
            <div key={p.id} onClick={() => navigate(`/tob/he/projects/${p.id}`)}
              className="bg-white rounded-xl p-3 border active:bg-gray-50" style={{ borderColor: '#E5E6EB' }}>
              <div className="flex items-center gap-2 mb-1">
                <span className="truncate flex-1" style={{ fontSize: 13, fontWeight: 600, color: '#1D2129' }}>{p.name}</span>
                <span className={`text-xs px-2 py-0.5 rounded-full ${STATUS_COLORS[p.status]}`} style={{ fontSize: 10, fontWeight: 500 }}>{STATUS_LABELS[p.status]}</span>
              </div>
              <div className="flex flex-wrap gap-1 mb-2">
                {p.researchTypes.map(rt => (
                  <span key={rt} className="px-1.5 py-0.5 rounded" style={{ fontSize: 10, background: '#F2F3F5', color: '#4E5969' }}>
                    {RESEARCH_TYPE_ICONS[rt]}{RESEARCH_TYPE_LABELS[rt]}
                  </span>
                ))}
              </div>
              <div className="h-1 rounded-full mb-2" style={{ background: '#F2F3F5' }}>
                <div className="h-full rounded-full" style={{ width: `${p.progress}%`, background: '#3370FF' }} />
              </div>
              <div className="flex items-center" style={{ fontSize: 10, color: '#86909C' }}>
                <Users size={9} className="mr-1" />{confirmed}/{p.participantTarget}
                <span className="ml-auto flex items-center gap-0.5" style={{ color: '#3370FF' }}>查看 <ArrowRight size={9} /></span>
              </div>
            </div>
          );
        })}
        {list.length === 0 && (
          <div className="text-center py-12">
            <Filter size={24} className="mx-auto mb-2" style={{ color: '#C9CDD4' }} />
            <p style={{ fontSize: 12, color: '#86909C' }}>无匹配项目</p>
          </div>
        )}
      </div>
    </div>
  );
}
