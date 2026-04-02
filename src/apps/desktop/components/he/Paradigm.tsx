import { useState } from 'react';
import { useNavigate, Navigate } from 'react-router';
import { ArrowLeft, ArrowRight, ChevronDown, ChevronUp, Check, Users, Plus, X, Info } from 'lucide-react';
import { useAppStore, RESEARCH_TYPE_LABELS, RESEARCH_TYPE_ICONS, ResearchType, HEProject, RunStep } from '../../store';

type Paradigm = { key: string; name: string; desc: string; flow: string; sampleRange: string; duration: string; tags: string[] };

const PARADIGMS: Partial<Record<ResearchType, Paradigm[]>> = {
  comfort: [
    { key: 'likert', name: '主观量表评定', desc: '使用 Likert / SD 语义差异量表，被试握持后对多个维度打分，是最常用的主观评价范式', flow: '握持样机 → 量表作答 → 重复3次 → 汇总', sampleRange: '20–30', duration: '60–90分钟/人', tags: ['推荐', '信效度佳'] },
    { key: 'bodymap', name: '身体地图标注', desc: '被试在数字人体图上直观标注不适部位与程度，适合定位痛点', flow: '握持样机 → 标注不适位置 → 半结构访谈', sampleRange: '15–25', duration: '45–60分钟/人', tags: ['定性'] },
    { key: 'compare', name: '比较判断法', desc: '多款样机两两对比，产出相对偏好排序，适合竞品比较', flow: '样机A vs B → 偏好评分 → 全排列', sampleRange: '25–35', duration: '90分钟/人', tags: ['竞品对比'] },
    { key: 'fatigue', name: '持续握持疲劳测试', desc: '指定时长握持后评估疲劳程度，关注长时间使用场景', flow: '连续握持15min → 疲劳量表 → 恢复后重测', sampleRange: '20–25', duration: '120分钟/人', tags: ['纵向'] },
  ],
  thermal: [
    { key: 'thermalscale', name: '温度主观感受量表', desc: '不同使用时长下的主观热感评分，记录主观热感随时间变化趋势', flow: '使用5/10/15min → 热感量表 → 记录皮肤温度', sampleRange: '20–30', duration: '60分钟/人', tags: ['推荐'] },
    { key: 'thermalrange', name: '热舒适区间评定', desc: '确定被试认为「舒适」的温度上下限，建立热舒适阈值', flow: '热感受训练 → 舒适阈值标定 → 区间确认', sampleRange: '15–20', duration: '45分钟/人', tags: ['阈值研究'] },
  ],
  acoustic: [
    { key: 'audioqual', name: '音质主观评价（ACR）', desc: 'ITU-T P.800 标准化主观听音实验，ACR 5分制评分', flow: '参考音频校准 → 各条件播放 → ACR评分', sampleRange: '20–30', duration: '60分钟/人', tags: ['标准化', '推荐'] },
    { key: 'clarity', name: '通话清晰度评定（MOS）', desc: '特定语料下的主观清晰度评分，MOS分值计算', flow: '安静/噪音环境各测一次 → MOS评分', sampleRange: '20–25', duration: '45分钟/人', tags: ['MOS'] },
  ],
  vibration: [
    { key: 'vibscale', name: '振动强度感知量表', desc: '对不同马达参数的强度偏好与识别率，建立振动感知模型', flow: '盲测振动样本 → 强度评分 → 偏好排序', sampleRange: '20–30', duration: '60分钟/人', tags: ['推荐'] },
    { key: 'texture', name: '触觉纹理辨别实验', desc: '被试区分不同振动模式的准确率，评估振动可辨别性', flow: '振动模式训练 → 盲测辨别 → 记录正确率', sampleRange: '15–20', duration: '45分钟/人', tags: ['辨别率'] },
  ],
  touch: [
    { key: 'touchscale', name: '触控手感量表', desc: '针对屏幕触感、边框手感的主观评分及偏好访谈', flow: '触控操作任务 → 手感量表 → 偏好访谈', sampleRange: '20–25', duration: '50分钟/人', tags: ['推荐'] },
  ],
  weight: [
    { key: 'weightperc', name: '重量感知量表', desc: '主观重量感受与持握疲劳综合评估', flow: '握持标准时长 → 重量感知评分 → 疲劳评估', sampleRange: '20–30', duration: '60分钟/人', tags: ['推荐'] },
  ],
  form: [
    { key: 'formfit', name: '形态适配性量表', desc: '整机尺寸与用户手型的匹配度综合评估', flow: '握持样机 → 适配性量表 → 手型测量', sampleRange: '25–35', duration: '50分钟/人', tags: ['推荐'] },
    { key: 'bodymap_form', name: '身体地图·形态版', desc: '标注机身各区域与手部接触点的适配状况', flow: '持握 → 接触点标注 → 不适区域定量', sampleRange: '15–20', duration: '40分钟/人', tags: ['定性'] },
  ],
};

// Multi-select: key = `${researchType}_${paradigmKey}`
type SelectedSet = Set<string>;

export function HEParadigm() {
  const navigate = useNavigate();
  const { state, dispatch } = useAppStore();
  const { wizard } = state;

  const [selected, setSelected] = useState<SelectedSet>(new Set());
  const [expandedType, setExpandedType] = useState<ResearchType | null>(wizard.researchTypes[0] ?? null);
  const [expandedParadigm, setExpandedParadigm] = useState<string | null>(null);

  if (wizard.researchTypes.length === 0) return <Navigate to="/tob/he/projects/new" replace />;

  function toggleParadigm(rt: ResearchType, key: string) {
    const id = `${rt}_${key}`;
    setSelected(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  function isSelected(rt: ResearchType, key: string) {
    return selected.has(`${rt}_${key}`);
  }

  function getSelectedForType(rt: ResearchType) {
    return (PARADIGMS[rt] ?? []).filter(p => selected.has(`${rt}_${p.key}`));
  }

  const totalSelectedCount = selected.size;
  const allTypesHaveSelection = wizard.researchTypes.every(rt => getSelectedForType(rt).length > 0);

  // Compute sample estimate from selected paradigms
  const sampleNums = Array.from(selected).map(id => {
    const [rt, key] = [id.split('_')[0] as ResearchType, id.split('_').slice(1).join('_')];
    const p = (PARADIGMS[rt] ?? []).find(pp => pp.key === key);
    return p ? parseInt(p.sampleRange) : 0;
  });
  const maxSample = sampleNums.length > 0 ? Math.max(...sampleNums) : 0;
  const sampleEst = maxSample > 0 ? `建议 ${maxSample}–${maxSample + 10} 人` : '请先选择范式';

  function handleCreate() {
    const paradigmNames = Array.from(selected).map(id => {
      const [rt, ...rest] = id.split('_');
      const key = rest.join('_');
      return (PARADIGMS[rt as ResearchType] ?? []).find(pp => pp.key === key)?.name ?? '';
    }).filter(Boolean).join(' + ');

    dispatch({ type: 'SET_WIZARD', payload: { paradigm: paradigmNames } });
    const newId = `he-${Date.now()}`;
    const newProject: HEProject = {
      id: newId, name: wizard.name, status: 'draft',
      researchTypes: wizard.researchTypes, formFactor: wizard.formFactor,
      paradigm: paradigmNames, startDate: wizard.startDate, period: wizard.period,
      description: wizard.description,
      createdAt: new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0],
      currentStep: 'questionnaire' as RunStep,
      participants: [], participantTarget: maxSample > 0 ? maxSample + 5 : 20,
      deadline: wizard.startDate ? new Date(new Date(wizard.startDate).getTime() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] : '',
      memberCount: 1, progress: 5,
    };
    dispatch({ type: 'ADD_HE_PROJECT', payload: newProject });
    dispatch({ type: 'RESET_WIZARD' });
    navigate(`/tob/he/projects/${newId}/run/questionnaire`);
  }

  const tagColors: Record<string, string> = {
    '推荐': 'bg-blue-50 text-blue-600',
    '信效度佳': 'bg-green-50 text-green-600',
    '定性': 'bg-purple-50 text-purple-600',
    '竞品对比': 'bg-orange-50 text-orange-600',
    '纵向': 'bg-indigo-50 text-indigo-600',
    '阈值研究': 'bg-amber-50 text-amber-600',
    '标准化': 'bg-teal-50 text-teal-600',
    '辨别率': 'bg-cyan-50 text-cyan-600',
    'MOS': 'bg-violet-50 text-violet-600',
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      {/* Steps indicator */}
      <div className="flex items-center gap-2 mb-6">
        {['填写项目信息', '选择实验范式'].map((s, i) => (
          <div key={s} className="flex items-center gap-2">
            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm ${i === 1 ? 'text-white' : 'text-blue-600'}`}
              style={i === 1 ? { background: '#3370FF' } : { background: '#EEF3FF' }}>
              <span className="w-5 h-5 rounded-full flex items-center justify-center text-xs" style={{ fontWeight: 700, background: i === 1 ? 'rgba(255,255,255,0.25)' : 'rgba(51,112,255,0.15)' }}>{i + 1}</span>
              {s}
            </div>
            {i < 1 && <ArrowRight size={13} style={{ color: '#C9CDD4' }} />}
          </div>
        ))}

        <div className="ml-auto flex items-center gap-2">
          {totalSelectedCount > 0 && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs" style={{ background: '#EEF3FF', color: '#3370FF' }}>
              <Check size={12} />已选 {totalSelectedCount} 个范式
            </div>
          )}
        </div>
      </div>

      {/* Info banner */}
      <div className="flex items-start gap-3 p-3 rounded-xl mb-5" style={{ background: '#F0F5FF', borderLeft: '3px solid #3370FF' }}>
        <Info size={15} style={{ color: '#3370FF', marginTop: 1 }} className="flex-shrink-0" />
        <p className="text-sm" style={{ color: '#2B4ACB' }}>
          每种研究类型可选择<strong>一个或多个</strong>实验范式，多范式组合可以从不同角度交叉验证研究结论，建议每类至少选择1个。
        </p>
      </div>

      <div className="grid grid-cols-4 gap-5">
        {/* Left: research type list */}
        <div>
          <h3 className="text-sm mb-3" style={{ fontWeight: 600, color: '#1D2129' }}>已选研究类型</h3>
          <div className="space-y-1.5">
            {wizard.researchTypes.map(rt => {
              const selCount = getSelectedForType(rt).length;
              return (
                <button key={rt} onClick={() => setExpandedType(rt === expandedType ? null : rt)}
                  className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl border text-sm transition-all text-left"
                  style={expandedType === rt
                    ? { borderColor: '#3370FF', background: '#EEF3FF', color: '#3370FF' }
                    : { borderColor: '#E5E6EB', background: 'white', color: '#4E5969' }}>
                  <span>{RESEARCH_TYPE_ICONS[rt]}</span>
                  <span className="flex-1 text-sm" style={{ fontWeight: 500 }}>{RESEARCH_TYPE_LABELS[rt]}</span>
                  {selCount > 0 && (
                    <span className="w-5 h-5 rounded-full flex items-center justify-center text-xs text-white" style={{ background: '#3370FF', fontWeight: 700 }}>{selCount}</span>
                  )}
                </button>
              );
            })}
          </div>

          <div className="mt-4 p-4 rounded-xl border" style={{ background: '#F0F5FF', borderColor: '#BFD0FF' }}>
            <div className="flex items-center gap-2 mb-2">
              <Users size={13} style={{ color: '#3370FF' }} />
              <span className="text-xs" style={{ fontWeight: 600, color: '#2B4ACB' }}>被试量估算</span>
            </div>
            <div style={{ fontWeight: 700, fontSize: '1.1rem', color: '#1D2129' }}>{sampleEst}</div>
            <p className="text-xs mt-1" style={{ color: '#3370FF' }}>取所选范式最大值</p>
          </div>

          {/* Selected paradigms summary */}
          {totalSelectedCount > 0 && (
            <div className="mt-3 p-3 rounded-xl border" style={{ background: 'white', borderColor: '#E5E6EB' }}>
              <div className="text-xs mb-2" style={{ fontWeight: 600, color: '#1D2129' }}>已选范式</div>
              <div className="space-y-1">
                {Array.from(selected).map(id => {
                  const [rt, ...rest] = id.split('_');
                  const key = rest.join('_');
                  const p = (PARADIGMS[rt as ResearchType] ?? []).find(pp => pp.key === key);
                  return p ? (
                    <div key={id} className="flex items-center gap-1.5">
                      <span className="text-xs" style={{ color: '#4E5969' }}>{RESEARCH_TYPE_ICONS[rt as ResearchType]}</span>
                      <span className="text-xs flex-1 truncate" style={{ color: '#4E5969' }}>{p.name}</span>
                      <button onClick={() => toggleParadigm(rt as ResearchType, key)} className="text-gray-400 hover:text-red-500 transition-colors">
                        <X size={11} />
                      </button>
                    </div>
                  ) : null;
                })}
              </div>
            </div>
          )}
        </div>

        {/* Right: paradigm cards */}
        <div className="col-span-3">
          {expandedType ? (
            <>
              <div className="flex items-center gap-2 mb-3">
                <span className="text-lg">{RESEARCH_TYPE_ICONS[expandedType]}</span>
                <h3 className="text-sm" style={{ fontWeight: 600, color: '#1D2129' }}>{RESEARCH_TYPE_LABELS[expandedType]} — 可用实验范式（可多选）</h3>
              </div>
              <div className="space-y-2.5">
                {(PARADIGMS[expandedType] ?? []).map(p => {
                  const sel = isSelected(expandedType, p.key);
                  return (
                    <div key={p.key}
                      className="bg-white rounded-xl border-2 transition-all"
                      style={{ borderColor: sel ? '#3370FF' : '#E5E6EB' }}>
                      <div className="flex items-start gap-3 p-4">
                        {/* Checkbox */}
                        <div
                          onClick={() => toggleParadigm(expandedType, p.key)}
                          className="w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 mt-0.5 cursor-pointer transition-all"
                          style={sel ? { borderColor: '#3370FF', background: '#3370FF' } : { borderColor: '#C9CDD4' }}>
                          {sel && <Check size={11} className="text-white" />}
                        </div>
                        <div className="flex-1 cursor-pointer" onClick={() => toggleParadigm(expandedType, p.key)}>
                          <div className="flex items-center gap-2 flex-wrap mb-1">
                            <span className="text-sm" style={{ fontWeight: 600, color: '#1D2129' }}>{p.name}</span>
                            {p.tags.map(tag => (
                              <span key={tag} className={`text-xs px-1.5 py-0.5 rounded-full ${tagColors[tag] || 'bg-gray-100 text-gray-600'}`}>{tag}</span>
                            ))}
                          </div>
                          <p className="text-sm" style={{ color: '#4E5969' }}>{p.desc}</p>
                          <div className="flex gap-4 mt-1.5 text-xs" style={{ color: '#86909C' }}>
                            <span>样本量 {p.sampleRange}人</span>
                            <span>⏱ {p.duration}</span>
                          </div>
                        </div>
                        <button onClick={() => setExpandedParadigm(expandedParadigm === p.key ? null : p.key)}
                          className="transition-colors flex-shrink-0" style={{ color: '#86909C' }}>
                          {expandedParadigm === p.key ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                        </button>
                      </div>
                      {expandedParadigm === p.key && (
                        <div className="px-4 pb-4 ml-8 border-t" style={{ borderColor: '#F2F3F5' }}>
                          <div className="rounded-lg p-3 mt-3" style={{ background: '#F7F8FA' }}>
                            <div className="text-xs mb-1.5" style={{ fontWeight: 600, color: '#4E5969' }}>实验流程</div>
                            <p className="text-xs" style={{ color: '#1D2129' }}>{p.flow}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </>
          ) : (
            <div className="flex items-center justify-center h-48 rounded-xl border-2 border-dashed" style={{ borderColor: '#E5E6EB', color: '#86909C' }}>
              ← 请在左侧选择研究类型
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between mt-6 pt-5 border-t" style={{ borderColor: '#E5E6EB' }}>
        <button onClick={() => navigate('/tob/he/projects/new')}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm transition-colors"
          style={{ border: '1px solid #E5E6EB', color: '#4E5969', background: 'white' }}>
          <ArrowLeft size={15} /> 上一步
        </button>
        <div className="flex items-center gap-3">
          {!allTypesHaveSelection && totalSelectedCount > 0 && (
            <p className="text-xs" style={{ color: '#FF7D00' }}>⚠ 部分研究类型尚未选择范式</p>
          )}
          <button onClick={handleCreate} disabled={totalSelectedCount === 0}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm text-white transition-all shadow-sm"
            style={totalSelectedCount > 0 ? { background: '#3370FF' } : { background: '#C9CDD4', cursor: 'not-allowed' }}
          >
            <Plus size={15} /> 创建项目，进入方案规划 <ArrowRight size={15} />
          </button>
        </div>
      </div>
    </div>
  );
}