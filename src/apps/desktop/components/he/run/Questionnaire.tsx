import { useState } from 'react';
import { useParams, useNavigate } from 'react-router';
import { ArrowRight, Eye, QrCode, Download, Plus, Check, BookOpen, Target, Lightbulb, ChevronDown, ChevronUp, Info } from 'lucide-react';
import { useAppStore, RESEARCH_TYPE_LABELS, RESEARCH_TYPE_ICONS } from '../../../store';

const DIMENSION_PLAN: Record<string, { dim: string; type: string; scale: string; items: number; basis: string }[]> = {
  comfort: [
    { dim: '整体握持舒适度', type: 'Likert 9点', scale: '1=极不舒适 … 9=极舒适', items: 3, basis: 'ISO 9241-11 主观评价框架' },
    { dim: '单手操作便利性', type: 'Likert 9点', scale: '1=极困难 … 9=极便利', items: 3, basis: '拇指可达性研究文献' },
    { dim: '握持稳定性', type: 'Likert 9点', scale: '1=极不稳 … 9=极稳固', items: 2, basis: '持握力学研究' },
    { dim: '长时间握持疲劳', type: 'Likert 9点', scale: '1=极度疲劳 … 9=毫不疲劳', items: 3, basis: 'Borg 疲劳量表改编' },
    { dim: '外观与形态适配', type: 'SD语义差异', scale: '笨重↔轻盈，臃肿↔纤薄', items: 6, basis: 'Osgood 语义差异法' },
    { dim: '综合满意度', type: 'NPS/总体评分', scale: '0–10分', items: 1, basis: 'NPS标准' },
  ],
  thermal: [
    { dim: '机身温度主观感受', type: 'ASHRAE热感7点', scale: '-3冷 … 0中性 … +3热', items: 3, basis: 'ASHRAE 55热舒适标准' },
    { dim: '热舒适满意度', type: 'Likert 7点', scale: '1=非常不满 … 7=非常满意', items: 2, basis: '热环境评价研究' },
    { dim: '使用意愿影响', type: 'Likert 5点', scale: '1=严重影响使用 … 5=不影响', items: 2, basis: '用户体验研究' },
  ],
  vibration: [
    { dim: '振动强度感知', type: 'Magnitude Estimation', scale: '参考刺激=100，相对评分', items: 4, basis: 'Stevens 幂律感知理论' },
    { dim: '振动质量偏好', type: 'SD语义差异', scale: '粗糙↔细腻，刺激↔柔和', items: 4, basis: '触觉感知研究' },
    { dim: '反馈准确性', type: 'Likert 7点', scale: '1=完全不准确 … 7=非常准确', items: 2, basis: '触觉反馈研究' },
  ],
  acoustic: [
    { dim: '音量主观感受', type: 'ACR 5点', scale: '1=劣质 2=差 3=一般 4=好 5=优', items: 3, basis: 'ITU-T P.800 ACR' },
    { dim: '音质清晰度', type: 'MOS评分', scale: '1–5分（0.5步长）', items: 3, basis: 'ITU-T P.800 MOS' },
    { dim: '通话舒适度', type: 'Likert 7点', scale: '1=极不舒适 … 7=极舒适', items: 2, basis: '通话体验研究' },
  ],
};

const TEMPLATES = [
  { key: 'comfort', name: '握持舒适度主量表（推荐）', types: ['comfort', 'form'], count: 18, duration: '约8分钟', validated: true },
  { key: 'semantic', name: '产品语义差异量表', types: ['comfort', 'form'], count: 12, duration: '约5分钟', validated: true },
  { key: 'thermal', name: '热感知评价量表（ASHRAE改编）', types: ['thermal'], count: 10, duration: '约4分钟', validated: true },
  { key: 'vibration', name: '振动感知量表', types: ['vibration'], count: 8, duration: '约3分钟', validated: true },
  { key: 'fatigue', name: '使用疲劳量表（Borg改编）', types: ['comfort', 'thermal', 'touch', 'weight', 'form', 'vibration', 'acoustic'], count: 6, duration: '约2分钟', validated: true },
  { key: 'acoustic', name: '音质主观评价量表（ITU-T P.800）', types: ['acoustic'], count: 15, duration: '约6分钟', validated: true },
];

const RELIABILITY_TIPS = [
  { title: '目标信度 α ≥ 0.80', desc: 'Cronbach\'s α 反映量表内部一致性，建议在正式实验前进行预测试（n=5–10）验证', level: 'must' },
  { title: '建构效度（CFA）', desc: '正式分析阶段将自动进行验证性因子分析，检验量表是否符合理论结构', level: 'auto' },
  { title: '收敛效度 AVE ≥ 0.50', desc: '平均方差提取量（AVE）衡量测量指标的收敛程度，低于阈值需修改题目', level: 'auto' },
  { title: '题目表述中性化', desc: '避免引导性提问，使用"您认为…"而非"这款手机是否让您感到舒适"', level: 'must' },
];

export function QuestionnairePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { state, dispatch } = useAppStore();
  const project = state.heProjects.find(p => p.id === id);

  const [activeTab, setActiveTab] = useState<'plan' | 'templates' | 'settings'>('plan');
  const [selectedTemplates, setSelectedTemplates] = useState<string[]>(() => {
    if (!project) return [];
    return TEMPLATES.filter(t => t.types.some(type => project.researchTypes.includes(type as any))).map(t => t.key);
  });
  const [expandedDim, setExpandedDim] = useState<string | null>(null);
  const [distributeMethod, setDistributeMethod] = useState('qr');
  const [randomOrder, setRandomOrder] = useState(false);
  const [allowBack, setAllowBack] = useState(true);

  if (!project) return null;

  const relevantDimensions = project.researchTypes.flatMap(rt => DIMENSION_PLAN[rt] ?? []);
  const totalQ = TEMPLATES.filter(t => selectedTemplates.includes(t.key)).reduce((s, t) => s + t.count, 0);

  function toggleTemplate(key: string) {
    setSelectedTemplates(prev => prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]);
  }

  const tabs = [
    { key: 'plan', label: '① 测量规划', icon: Target },
    { key: 'templates', label: '② 量表配置', icon: BookOpen },
    { key: 'settings', label: '③ 发放设置', icon: QrCode },
  ] as const;

  return (
    <div className="p-5 space-y-4 max-w-5xl">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-base" style={{ fontWeight: 700, color: '#1D2129' }}>量表设计 · 方案规划</h2>
          <p className="text-sm mt-0.5" style={{ color: '#86909C' }}>
            范式：{project.paradigm || '已选多范式'} · 覆盖 {project.researchTypes.length} 个研究维度
          </p>
        </div>
        <div className="px-3 py-1.5 rounded-full text-xs" style={{ background: '#EEF3FF', color: '#3370FF', fontWeight: 500 }}>
          步骤 1 / 6
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 p-1 rounded-xl" style={{ background: '#F2F3F5' }}>
        {tabs.map(tab => (
          <button key={tab.key} onClick={() => setActiveTab(tab.key)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm flex-1 justify-center transition-all"
            style={activeTab === tab.key
              ? { background: 'white', color: '#1D2129', fontWeight: 600, boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }
              : { color: '#4E5969' }}>
            <tab.icon size={14} />{tab.label}
          </button>
        ))}
      </div>

      {/* Tab 1: Measurement Planning */}
      {activeTab === 'plan' && (
        <div className="space-y-4">
          <div className="p-4 rounded-xl border" style={{ background: '#F0F5FF', borderColor: '#BFD0FF' }}>
            <div className="flex items-center gap-2 mb-2">
              <Lightbulb size={14} style={{ color: '#3370FF' }} />
              <span className="text-sm" style={{ fontWeight: 600, color: '#1456F0' }}>系统已根据所选研究类型和范式自动推荐测量维度</span>
            </div>
            <p className="text-xs" style={{ color: '#2B4ACB' }}>
              共 {relevantDimensions.length} 个测量维度 · 理论依据已标注 · 可在量表配置步骤中调整题目数量
            </p>
          </div>

          <div className="bg-white rounded-xl border overflow-hidden" style={{ borderColor: '#E5E6EB' }}>
            <div className="px-4 py-3 border-b" style={{ borderColor: '#F2F3F5', background: '#FAFAFA' }}>
              <div className="grid grid-cols-5 gap-4 text-xs" style={{ color: '#86909C', fontWeight: 600 }}>
                <div className="col-span-2">测量维度</div>
                <div>量表类型</div>
                <div>题目数</div>
                <div>理论依据</div>
              </div>
            </div>
            <div className="divide-y" style={{ borderColor: '#F2F3F5' }}>
              {relevantDimensions.map((dim, i) => (
                <div key={i}>
                  <div className="px-4 py-3 grid grid-cols-5 gap-4 cursor-pointer hover:bg-gray-50 transition-colors"
                    onClick={() => setExpandedDim(expandedDim === `${i}` ? null : `${i}`)}>
                    <div className="col-span-2 flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: '#3370FF' }} />
                      <span className="text-sm" style={{ fontWeight: 500, color: '#1D2129' }}>{dim.dim}</span>
                    </div>
                    <div className="text-sm" style={{ color: '#4E5969' }}>{dim.type}</div>
                    <div>
                      <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: '#EEF3FF', color: '#3370FF' }}>{dim.items} 题</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs" style={{ color: '#86909C' }}>{dim.basis.split(' ')[0]}…</span>
                      {expandedDim === `${i}` ? <ChevronUp size={13} style={{ color: '#86909C' }} /> : <ChevronDown size={13} style={{ color: '#86909C' }} />}
                    </div>
                  </div>
                  {expandedDim === `${i}` && (
                    <div className="px-4 pb-3 ml-4" style={{ background: '#FAFAFA' }}>
                      <div className="p-3 rounded-lg border" style={{ borderColor: '#E5E6EB', background: 'white' }}>
                        <div className="text-xs mb-1" style={{ fontWeight: 600, color: '#4E5969' }}>量表说明</div>
                        <p className="text-xs mb-2" style={{ color: '#4E5969' }}>计分方式：{dim.scale}</p>
                        <div className="text-xs" style={{ fontWeight: 600, color: '#4E5969' }}>理论依据</div>
                        <p className="text-xs" style={{ color: '#86909C' }}>{dim.basis}</p>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Reliability tips */}
          <div className="bg-white rounded-xl border p-4" style={{ borderColor: '#E5E6EB' }}>
            <h3 className="text-sm mb-3" style={{ fontWeight: 600, color: '#1D2129' }}>量表信效度设计要点</h3>
            <div className="grid grid-cols-2 gap-3">
              {RELIABILITY_TIPS.map((tip, i) => (
                <div key={i} className="flex items-start gap-2.5 p-3 rounded-lg"
                  style={{ background: tip.level === 'must' ? '#FFF3E8' : '#F0F5FF', border: `1px solid ${tip.level === 'must' ? '#FFD8A8' : '#BFD0FF'}` }}>
                  <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 text-white text-xs mt-0.5"
                    style={{ background: tip.level === 'must' ? '#FF7D00' : '#3370FF', fontWeight: 700 }}>
                    {tip.level === 'must' ? '!' : 'A'}
                  </div>
                  <div>
                    <div className="text-xs mb-0.5" style={{ fontWeight: 600, color: '#1D2129' }}>{tip.title}</div>
                    <p className="text-xs" style={{ color: '#4E5969' }}>{tip.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Template selection */}
      {activeTab === 'templates' && (
        <div className="space-y-3">
          <div className="bg-white rounded-xl border overflow-hidden" style={{ borderColor: '#E5E6EB' }}>
            <div className="px-4 py-3 border-b flex items-center justify-between" style={{ borderColor: '#F2F3F5' }}>
              <h3 className="text-sm" style={{ fontWeight: 600, color: '#1D2129' }}>量表模板库（已验证）</h3>
              <span className="text-xs" style={{ color: '#86909C' }}>系统已根据研究类型自动推荐，可调整</span>
            </div>
            <div className="divide-y" style={{ borderColor: '#F2F3F5' }}>
              {TEMPLATES.map(t => {
                const isRelevant = t.types.some(type => project.researchTypes.includes(type as any));
                const isSel = selectedTemplates.includes(t.key);
                return (
                  <div key={t.key} className={`flex items-center gap-3 px-4 py-3.5 transition-colors ${isRelevant ? 'hover:bg-gray-50 cursor-pointer' : 'opacity-40'}`}
                    onClick={() => isRelevant && toggleTemplate(t.key)}>
                    <div className="w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 transition-all"
                      style={isSel ? { borderColor: '#3370FF', background: '#3370FF' } : { borderColor: '#C9CDD4' }}>
                      {isSel && <Check size={11} className="text-white" />}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm" style={{ fontWeight: 500, color: '#1D2129' }}>{t.name}</span>
                        {t.validated && <span className="text-xs px-1.5 py-0.5 rounded-full" style={{ background: '#E8F7EA', color: '#00B42A' }}>已验证</span>}
                        {isRelevant && <span className="text-xs px-1.5 py-0.5 rounded-full" style={{ background: '#EEF3FF', color: '#3370FF' }}>推荐</span>}
                      </div>
                      <div className="flex gap-3 text-xs mt-0.5" style={{ color: '#86909C' }}>
                        <span>{t.count} 题</span>
                        <span>{t.duration}</span>
                        <span>适用：{t.types.map(tt => RESEARCH_TYPE_LABELS[tt as any]).join('、')}</span>
                      </div>
                    </div>
                    <button className="text-xs px-3 py-1 rounded-lg border transition-colors hover:bg-gray-50" style={{ borderColor: '#E5E6EB', color: '#4E5969' }}>
                      <Eye size={12} className="inline mr-1" />预览
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {totalQ > 0 && (
            <div className="flex items-center justify-between p-4 rounded-xl" style={{ background: '#EEF3FF' }}>
              <div>
                <span className="text-sm" style={{ fontWeight: 600, color: '#1456F0' }}>
                  已选 {selectedTemplates.length} 份量表 · 共 {totalQ} 题
                </span>
                <span className="text-xs ml-3" style={{ color: '#3370FF' }}>预计作答时间 {Math.round(totalQ * 0.45)} 分钟</span>
              </div>
              <div className="flex gap-2">
                <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs border" style={{ borderColor: '#BFD0FF', color: '#3370FF', background: 'white' }}>
                  <Download size={12} />导出 PDF
                </button>
                <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs border" style={{ borderColor: '#BFD0FF', color: '#3370FF', background: 'white' }}>
                  <QrCode size={12} />生成二维码
                </button>
              </div>
            </div>
          )}

          <button className="flex items-center gap-2 text-sm w-full py-3 rounded-xl border-dashed border-2 justify-center transition-colors hover:bg-gray-50"
            style={{ borderColor: '#C9CDD4', color: '#4E5969' }}>
            <Plus size={14} /> 添加自定义量表
          </button>
        </div>
      )}

      {/* Tab 3: Distribution settings */}
      {activeTab === 'settings' && (
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white rounded-xl border p-4" style={{ borderColor: '#E5E6EB' }}>
            <h3 className="text-sm mb-4" style={{ fontWeight: 600, color: '#1D2129' }}>发放方式</h3>
            <div className="space-y-2">
              {[
                { key: 'qr', label: '二维码（现场扫描）', desc: '被试到场后扫码作答，支持实时监控' },
                { key: 'tablet', label: '平板直接作答', desc: '由研究员管理平板，适合实验室场景' },
                { key: 'link', label: '链接（远程发送）', desc: '发送给被试自行填写，适合问卷调查' },
              ].map(m => (
                <label key={m.key} className="flex items-start gap-3 cursor-pointer p-3 rounded-xl transition-colors hover:bg-gray-50"
                  style={distributeMethod === m.key ? { background: '#EEF3FF' } : {}}>
                  <div className="w-4 h-4 rounded-full border-2 flex items-center justify-center mt-0.5 flex-shrink-0"
                    style={{ borderColor: distributeMethod === m.key ? '#3370FF' : '#C9CDD4' }}>
                    {distributeMethod === m.key && <div className="w-2 h-2 rounded-full" style={{ background: '#3370FF' }} />}
                  </div>
                  <input type="radio" value={m.key} checked={distributeMethod === m.key} onChange={() => setDistributeMethod(m.key)} className="sr-only" />
                  <div>
                    <div className="text-sm" style={{ fontWeight: 500, color: '#1D2129' }}>{m.label}</div>
                    <div className="text-xs" style={{ color: '#86909C' }}>{m.desc}</div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <div className="bg-white rounded-xl border p-4" style={{ borderColor: '#E5E6EB' }}>
              <h3 className="text-sm mb-3" style={{ fontWeight: 600, color: '#1D2129' }}>作答控制</h3>
              <div className="space-y-3">
                {[
                  { key: 'random', label: '随机题目顺序', desc: '减少顺序效应干扰', value: randomOrder, set: setRandomOrder },
                  { key: 'back', label: '允许返回修改', desc: '让被试可修正之前的作答', value: allowBack, set: setAllowBack },
                ].map(opt => (
                  <div key={opt.key} className="flex items-center justify-between">
                    <div>
                      <div className="text-sm" style={{ color: '#1D2129' }}>{opt.label}</div>
                      <div className="text-xs" style={{ color: '#86909C' }}>{opt.desc}</div>
                    </div>
                    <div onClick={() => opt.set(!opt.value)}
                      className="w-10 h-5.5 rounded-full transition-colors cursor-pointer relative flex-shrink-0"
                      style={{ background: opt.value ? '#3370FF' : '#C9CDD4', width: 40, height: 22 }}>
                      <div className="absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all shadow-sm"
                        style={{ left: opt.value ? 'auto' : 3, right: opt.value ? 3 : 'auto' }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-4 rounded-xl border" style={{ background: '#F6FFED', borderColor: '#B7EB8F' }}>
              <div className="flex items-center gap-2 mb-2">
                <Info size={13} style={{ color: '#389E0D' }} />
                <span className="text-xs" style={{ fontWeight: 600, color: '#389E0D' }}>数据自动化</span>
              </div>
              <p className="text-xs" style={{ color: '#52C41A' }}>
                实验开始后，被试作答数据将<strong>自动采集并存储</strong>，无需手动导入。完成率、异常作答将实时报警。
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Navigation */}
      <div className="flex items-center justify-between pt-4 border-t" style={{ borderColor: '#E5E6EB' }}>
        <button onClick={() => navigate(`/tob/he/projects/${id}`)}
          className="px-4 py-2.5 rounded-xl text-sm transition-colors"
          style={{ border: '1px solid #E5E6EB', color: '#4E5969', background: 'white' }}>
          返回项目
        </button>
        <button onClick={() => {
          dispatch({ type: 'UPDATE_HE_PROJECT', payload: { id: id!, updates: { currentStep: 'participants' } } });
          navigate(`/tob/he/projects/${id}/run/participants`);
        }} disabled={selectedTemplates.length === 0}
          className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm text-white transition-all shadow-sm"
          style={selectedTemplates.length > 0 ? { background: '#3370FF' } : { background: '#C9CDD4', cursor: 'not-allowed' }}>
          量表方案确定 · 下一步：被试方案 <ArrowRight size={15} />
        </button>
      </div>
    </div>
  );
}
