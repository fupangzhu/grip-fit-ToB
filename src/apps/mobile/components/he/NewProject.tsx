import { useState } from 'react';
import { useNavigate } from 'react-router';
import { ArrowRight, Check } from 'lucide-react';
import { useAppStore, ResearchType, FormFactor, RESEARCH_TYPE_LABELS, RESEARCH_TYPE_ICONS, FORM_FACTOR_LABELS } from '../../store';

const PRESET_TYPES: ResearchType[] = ['comfort', 'thermal', 'acoustic', 'vibration', 'touch', 'weight', 'form'];

export function HENewProject() {
  const navigate = useNavigate();
  const { state, dispatch } = useAppStore();
  const { wizard } = state;

  const [name, setName] = useState(wizard.name);
  const [types, setTypes] = useState<ResearchType[]>(wizard.researchTypes);
  const [formFactor, setFormFactor] = useState<FormFactor>(wizard.formFactor);
  const [errors, setErrors] = useState<Record<string, string>>({});

  function toggleType(t: ResearchType) {
    setTypes(prev => prev.includes(t) ? prev.filter(x => x !== t) : [...prev, t]);
  }

  function handleNext() {
    const e: Record<string, string> = {};
    if (!name.trim()) e.name = '请填写项目名称';
    if (types.length === 0) e.types = '请至少选择一种';
    setErrors(e);
    if (Object.keys(e).length > 0) return;
    dispatch({ type: 'SET_WIZARD', payload: { name, researchTypes: types, formFactor } });
    navigate('/tob/he/projects/new/paradigm');
  }

  return (
    <div className="px-4 py-4 space-y-4">
      {/* Step indicator */}
      <div className="flex items-center gap-2">
        <span className="px-2.5 py-1 rounded-full text-white" style={{ fontSize: 11, fontWeight: 600, background: '#3370FF' }}>1 项目信息</span>
        <div className="w-4 h-px" style={{ background: '#E5E6EB' }} />
        <span className="px-2.5 py-1 rounded-full" style={{ fontSize: 11, background: '#F2F3F5', color: '#C9CDD4' }}>2 实验范式</span>
      </div>

      {/* Name */}
      <div>
        <label style={{ fontSize: 12, fontWeight: 500, color: '#4E5969', display: 'block', marginBottom: 4 }}>项目名称 *</label>
        <input type="text" value={name} onChange={e => setName(e.target.value)}
          placeholder="例：旗舰机握持研究"
          className="w-full px-3 py-2.5 rounded-lg outline-none"
          style={{ border: `1px solid ${errors.name ? '#F53F3F' : '#E5E6EB'}`, fontSize: 13 }} />
        {errors.name && <p style={{ fontSize: 10, color: '#F53F3F', marginTop: 2 }}>{errors.name}</p>}
      </div>

      {/* Form factor */}
      <div>
        <label style={{ fontSize: 12, fontWeight: 500, color: '#4E5969', display: 'block', marginBottom: 4 }}>手机形态</label>
        <div className="grid grid-cols-3 gap-2">
          {(['bar', 'flip', 'fold'] as FormFactor[]).map(f => (
            <button key={f} onClick={() => setFormFactor(f)}
              className="py-2 rounded-lg text-center transition-all"
              style={formFactor === f
                ? { background: '#EEF3FF', border: '2px solid #3370FF', color: '#3370FF', fontSize: 12, fontWeight: 600 }
                : { border: '1px solid #E5E6EB', color: '#4E5969', fontSize: 12 }
              }>{FORM_FACTOR_LABELS[f]}</button>
          ))}
        </div>
      </div>

      {/* Research types */}
      <div>
        <label style={{ fontSize: 12, fontWeight: 500, color: '#4E5969', display: 'block', marginBottom: 4 }}>
          研究类型 * <span style={{ fontWeight: 400, color: '#86909C' }}>（多选）</span>
        </label>
        {errors.types && <p style={{ fontSize: 10, color: '#F53F3F', marginBottom: 4 }}>{errors.types}</p>}
        <div className="space-y-1.5">
          {PRESET_TYPES.map(t => {
            const sel = types.includes(t);
            return (
              <button key={t} onClick={() => toggleType(t)}
                className="w-full flex items-center gap-2.5 p-2.5 rounded-lg text-left transition-all"
                style={sel
                  ? { background: '#EEF3FF', border: '1.5px solid #3370FF' }
                  : { border: '1px solid #E5E6EB' }
                }>
                <div className="w-4 h-4 rounded flex items-center justify-center flex-shrink-0"
                  style={sel ? { background: '#3370FF' } : { border: '1.5px solid #C9CDD4' }}>
                  {sel && <Check size={10} className="text-white" />}
                </div>
                <span style={{ fontSize: 12, fontWeight: sel ? 600 : 400, color: sel ? '#3370FF' : '#4E5969' }}>
                  {RESEARCH_TYPE_ICONS[t]} {RESEARCH_TYPE_LABELS[t]}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-2 pt-2">
        <button onClick={() => navigate('/tob/he/dashboard')}
          className="flex-1 py-2.5 rounded-lg" style={{ border: '1px solid #E5E6EB', color: '#4E5969', fontSize: 13 }}>
          取消
        </button>
        <button onClick={handleNext}
          className="flex-1 py-2.5 rounded-lg flex items-center justify-center gap-1 text-white"
          style={{ background: '#3370FF', fontSize: 13, fontWeight: 600 }}>
          下一步 <ArrowRight size={14} />
        </button>
      </div>
    </div>
  );
}
