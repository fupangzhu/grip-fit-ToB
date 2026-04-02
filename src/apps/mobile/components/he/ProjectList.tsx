import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router';
import { Plus, Search, ArrowRight, Users, Filter, CheckCircle } from 'lucide-react';
import { useAppStore, STATUS_COLORS, STATUS_LABELS, RESEARCH_TYPE_LABELS, RESEARCH_TYPE_ICONS, ExperimentStatus, RUN_STEPS } from '../../store';

const FILTERS: { key: ExperimentStatus | 'all'; label: string }[] = [
  { key: 'all', label: '全部' }, { key: 'running', label: '进行中' },
  { key: 'recruiting', label: '招募' }, { key: 'analyzing', label: '分析' },
  { key: 'completed', label: '完成' },
];

export function HEProjectList() {
  const { state } = useAppStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<ExperimentStatus | 'all'>('all');
  const [highlightId, setHighlightId] = useState<string | null>(
    (location.state as { highlightId?: string } | null)?.highlightId ?? null
  );
  const [showBanner, setShowBanner] = useState(!!highlightId);
  const highlightRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!highlightId) return;
    // auto-scroll to the highlighted card
    const timer = setTimeout(() => {
      highlightRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 100);
    // fade out highlight after 3s
    const clearTimer = setTimeout(() => {
      setHighlightId(null);
      setShowBanner(false);
    }, 3000);
    return () => { clearTimeout(timer); clearTimeout(clearTimer); };
  }, [highlightId]);

  const list = state.heProjects.filter(p => {
    if (filter !== 'all' && p.status !== filter) return false;
    if (search && !p.name.includes(search)) return false;
    return true;
  });

  return (
    <div className="px-4 py-4 space-y-3">
      {/* Success banner */}
      {showBanner && (
        <div className="flex items-center gap-2 px-3 py-2 rounded-xl"
          style={{ background: '#EEF3FF', border: '1px solid #BFD0FF' }}>
          <CheckCircle size={14} style={{ color: '#3370FF', flexShrink: 0 }} />
          <span style={{ fontSize: 12, color: '#3370FF', fontWeight: 500 }}>项目已创建，已为你定位到新项目</span>
        </div>
      )}

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
          const isHighlighted = p.id === highlightId;
          return (
            <div
              key={p.id}
              ref={isHighlighted ? highlightRef : null}
              onClick={() => navigate(`/tob/he/projects/${p.id}`)}
              className="bg-white rounded-xl p-3 border active:bg-gray-50"
              style={{
                borderColor: isHighlighted ? '#3370FF' : '#E5E6EB',
                borderWidth: isHighlighted ? 2 : 1,
                boxShadow: isHighlighted ? '0 0 0 3px rgba(51,112,255,0.15)' : undefined,
                transition: 'box-shadow 0.4s ease, border-color 0.4s ease',
              }}
            >
              {isHighlighted && (
                <div className="flex items-center gap-1 mb-1.5">
                  <span className="px-1.5 py-0.5 rounded-full text-white" style={{ fontSize: 9, fontWeight: 700, background: '#3370FF' }}>NEW</span>
                  <span style={{ fontSize: 10, color: '#3370FF', fontWeight: 500 }}>刚刚创建</span>
                </div>
              )}
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