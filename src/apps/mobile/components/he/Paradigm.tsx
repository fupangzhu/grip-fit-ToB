import { useState } from 'react';
import { useNavigate, Navigate } from 'react-router';
import { ArrowLeft, ArrowRight, ChevronDown, ChevronUp, Check, Plus, X } from 'lucide-react';
import { useAppStore, RESEARCH_TYPE_LABELS, RESEARCH_TYPE_ICONS, ResearchType, HEProject, RunStep } from '../../store';

type Paradigm = { key: string; name: string; desc: string; sample: string; tags: string[] };

const PARADIGMS: Partial<Record<ResearchType, Paradigm[]>> = {
  comfort: [
    { key: 'likert', name: '主观量表评定', desc: 'Likert量表打分', sample: '20–30人', tags: ['推荐'] },
    { key: 'bodymap', name: '身体地图标注', desc: '标注不适部位', sample: '15–25人', tags: ['定性'] },
    { key: 'compare', name: '比较判断法', desc: '样机两两对比', sample: '25–35人', tags: ['竞品'] },
  ],
  thermal: [
    { key: 'thermalscale', name: '温度感受量表', desc: '主观热感评分', sample: '20–30人', tags: ['推荐'] },
  ],
  acoustic: [
    { key: 'audioqual', name: '音质主观评价', desc: 'ACR 5分制', sample: '20–30人', tags: ['推荐'] },
  ],
  vibration: [
    { key: 'vibscale', name: '振动感知量表', desc: '强度偏好排序', sample: '20–30人', tags: ['推荐'] },
  ],
  touch: [
    { key: 'touchscale', name: '触控手感量表', desc: '屏幕触感评分', sample: '20–25人', tags: ['推荐'] },
  ],
  weight: [
    { key: 'weightperc', name: '重量感知量表', desc: '重量感受评估', sample: '20–30人', tags: ['推荐'] },
  ],
  form: [
    { key: 'formfit', name: '形态适配性量表', desc: '尺寸匹配度', sample: '25–35人', tags: ['推荐'] },
  ],
};

export function HEParadigm() {
  const navigate = useNavigate();
  const { state, dispatch } = useAppStore();
  const { wizard } = state;

  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [activeType, setActiveType] = useState<ResearchType>(wizard.researchTypes[0]);

  if (wizard.researchTypes.length === 0) return <Navigate to="/tob/he/projects/new" replace />;

  function toggle(rt: ResearchType, key: string) {
    const id = `${rt}_${key}`;
    setSelected(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
  }

  function handleCreate() {
    const names = Array.from(selected).map(id => {
      const [rt, ...rest] = id.split('_');
      return (PARADIGMS[rt as ResearchType] ?? []).find(p => p.key === rest.join('_'))?.name ?? '';
    }).filter(Boolean).join(' + ');

    dispatch({ type: 'SET_WIZARD', payload: { paradigm: names } });
    const newId = `he-${Date.now()}`;
    const newProject: HEProject = {
      id: newId, name: wizard.name, status: 'draft',
      researchTypes: wizard.researchTypes, formFactor: wizard.formFactor,
      paradigm: names, startDate: wizard.startDate, period: wizard.period,
      description: wizard.description,
      createdAt: new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0],
      currentStep: 'questionnaire' as RunStep,
      participants: [], participantTarget: 25,
      deadline: '', memberCount: 1, progress: 5,
    };
    dispatch({ type: 'ADD_HE_PROJECT', payload: newProject });
    navigate('/tob/he/projects', { state: { highlightId: newId } });
    dispatch({ type: 'RESET_WIZARD' });
  }

  return (
    <div className="px-4 py-4 space-y-4">
      {/* Step */}
      <div className="flex items-center gap-2">
        <span className="px-2.5 py-1 rounded-full" style={{ fontSize: 11, background: '#EEF3FF', color: '#3370FF' }}>1 项目信息</span>
        <div className="w-4 h-px" style={{ background: '#E5E6EB' }} />
        <span className="px-2.5 py-1 rounded-full text-white" style={{ fontSize: 11, fontWeight: 600, background: '#3370FF' }}>2 实验范式</span>
      </div>

      {/* Type tabs */}
      <div className="flex gap-1.5 overflow-x-auto pb-1">
        {wizard.researchTypes.map(rt => {
          const count = (PARADIGMS[rt] ?? []).filter(p => selected.has(`${rt}_${p.key}`)).length;
          return (
            <button key={rt} onClick={() => setActiveType(rt)}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-full whitespace-nowrap"
              style={activeType === rt
                ? { background: '#3370FF', color: 'white', fontSize: 11, fontWeight: 600 }
                : { background: 'white', border: '1px solid #E5E6EB', color: '#4E5969', fontSize: 11 }
              }>
              {RESEARCH_TYPE_ICONS[rt]} {RESEARCH_TYPE_LABELS[rt]}
              {count > 0 && <span className="w-4 h-4 rounded-full flex items-center justify-center text-white" style={{ background: activeType === rt ? 'rgba(255,255,255,0.3)' : '#3370FF', fontSize: 9, fontWeight: 700 }}>{count}</span>}
            </button>
          );
        })}
      </div>

      {/* Paradigm cards */}
      <div className="space-y-2">
        {(PARADIGMS[activeType] ?? []).map(p => {
          const sel = selected.has(`${activeType}_${p.key}`);
          return (
            <button key={p.key} onClick={() => toggle(activeType, p.key)}
              className="w-full flex items-center gap-3 p-3 rounded-xl text-left transition-all"
              style={sel
                ? { background: '#EEF3FF', border: '2px solid #3370FF' }
                : { background: 'white', border: '1px solid #E5E6EB' }
              }>
              <div className="w-5 h-5 rounded flex items-center justify-center flex-shrink-0"
                style={sel ? { background: '#3370FF' } : { border: '1.5px solid #C9CDD4' }}>
                {sel && <Check size={11} className="text-white" />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <span style={{ fontSize: 13, fontWeight: 600, color: '#1D2129' }}>{p.name}</span>
                  {p.tags.map(t => (
                    <span key={t} className="px-1.5 py-0.5 rounded-full" style={{ fontSize: 9, background: '#EEF3FF', color: '#3370FF' }}>{t}</span>
                  ))}
                </div>
                <div style={{ fontSize: 11, color: '#86909C', marginTop: 1 }}>{p.desc} · {p.sample}</div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Selected summary */}
      {selected.size > 0 && (
        <div className="p-3 rounded-xl" style={{ background: '#F0F5FF', border: '1px solid #BFD0FF' }}>
          <span style={{ fontSize: 11, fontWeight: 600, color: '#3370FF' }}>已选 {selected.size} 个范式</span>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-2 pt-1">
        <button onClick={() => navigate('/tob/he/projects/new')}
          className="flex-1 py-2.5 rounded-lg flex items-center justify-center gap-1"
          style={{ border: '1px solid #E5E6EB', color: '#4E5969', fontSize: 13 }}>
          <ArrowLeft size={14} /> 上一步
        </button>
        <button onClick={handleCreate} disabled={selected.size === 0}
          className="flex-1 py-2.5 rounded-lg flex items-center justify-center gap-1 text-white"
          style={selected.size > 0 ? { background: '#3370FF', fontSize: 13, fontWeight: 600 } : { background: '#C9CDD4', fontSize: 13 }}>
          创建项目 <ArrowRight size={14} />
        </button>
      </div>
    </div>
  );
}