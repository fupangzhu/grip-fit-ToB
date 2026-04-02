import { useState } from 'react';
import { useParams, useNavigate } from 'react-router';
import { ArrowRight, Check, BookOpen } from 'lucide-react';
import { useAppStore, RESEARCH_TYPE_LABELS, RESEARCH_TYPE_ICONS } from '../../../store';

const TEMPLATES = [
  { key: 'comfort', name: '握持舒适度量表', count: 18, dur: '~8min', types: ['comfort', 'form'] },
  { key: 'semantic', name: '产品语义差异量表', count: 12, dur: '~5min', types: ['comfort', 'form'] },
  { key: 'thermal', name: '热感知评价量表', count: 10, dur: '~4min', types: ['thermal'] },
  { key: 'vibration', name: '振动感知量表', count: 8, dur: '~3min', types: ['vibration'] },
  { key: 'fatigue', name: '使用疲劳量表', count: 6, dur: '~2min', types: ['comfort', 'thermal', 'touch', 'weight', 'form', 'vibration', 'acoustic'] },
  { key: 'acoustic', name: '音质主观评价量表', count: 15, dur: '~6min', types: ['acoustic'] },
];

export function QuestionnairePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { state, dispatch } = useAppStore();
  const project = state.heProjects.find(p => p.id === id);
  const [selected, setSelected] = useState<string[]>(() =>
    TEMPLATES.filter(t => t.types.some(type => project?.researchTypes.includes(type as any))).map(t => t.key)
  );

  if (!project) return null;
  const totalQ = TEMPLATES.filter(t => selected.includes(t.key)).reduce((s, t) => s + t.count, 0);

  return (
    <div className="px-4 py-4 space-y-3">
      <div>
        <span style={{ fontSize: 14, fontWeight: 700, color: '#1D2129' }}>量表设计</span>
        <p style={{ fontSize: 11, color: '#86909C', marginTop: 2 }}>已选 {selected.length} 个量表 · {totalQ} 题</p>
      </div>

      <div className="space-y-2">
        {TEMPLATES.map(t => {
          const relevant = t.types.some(type => project.researchTypes.includes(type as any));
          const sel = selected.includes(t.key);
          return (
            <button key={t.key}
              onClick={() => relevant && setSelected(p => p.includes(t.key) ? p.filter(k => k !== t.key) : [...p, t.key])}
              className="w-full flex items-center gap-2.5 p-3 rounded-xl text-left transition-all"
              style={{
                background: sel ? '#EEF3FF' : 'white',
                border: `1.5px solid ${sel ? '#3370FF' : '#E5E6EB'}`,
                opacity: relevant ? 1 : 0.4,
              }}>
              <div className="w-4 h-4 rounded flex items-center justify-center flex-shrink-0"
                style={sel ? { background: '#3370FF' } : { border: '1.5px solid #C9CDD4' }}>
                {sel && <Check size={10} className="text-white" />}
              </div>
              <div className="flex-1 min-w-0">
                <span style={{ fontSize: 12, fontWeight: 600, color: '#1D2129' }}>{t.name}</span>
                <div style={{ fontSize: 10, color: '#86909C', marginTop: 1 }}>{t.count}题 · {t.dur}</div>
              </div>
              {relevant && <span className="px-1.5 py-0.5 rounded" style={{ fontSize: 9, background: '#EEF3FF', color: '#3370FF' }}>推荐</span>}
            </button>
          );
        })}
      </div>

      <button onClick={() => {
        dispatch({ type: 'UPDATE_HE_PROJECT', payload: { id: project.id, currentStep: 'participants' } });
        navigate(`/tob/he/projects/${id}/run/participants`);
      }}
        className="w-full py-3 rounded-xl flex items-center justify-center gap-1 text-white"
        style={{ background: '#3370FF', fontSize: 13, fontWeight: 600 }}>
        下一步：被试方案 <ArrowRight size={14} />
      </button>
    </div>
  );
}
