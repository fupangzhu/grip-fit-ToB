import { useState, ReactNode } from 'react';
import { useParams, useNavigate } from 'react-router';
import { BarChart2, Download, TrendingUp, Users, Activity, ChevronDown, ChevronUp, Check, AlertTriangle } from 'lucide-react';
import { useAppStore, RESEARCH_TYPE_LABELS } from '../../../store';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  RadarChart, PolarGrid, PolarAngleAxis, Radar,
  LineChart, Line, ReferenceLine, Cell,
} from 'recharts';

// ── Mock analysis data ────────────────────────────────────────────────────────
const DIMENSION_SCORES = [
  { name: '握持舒适', score: 6.5, benchmark: 5.8 },
  { name: '拇指可达', score: 4.8, benchmark: 5.2 },
  { name: '单手操控', score: 5.9, benchmark: 5.5 },
  { name: '握感稳定', score: 7.1, benchmark: 6.3 },
  { name: '长时疲劳', score: 5.4, benchmark: 5.0 },
  { name: '整体满意', score: 6.2, benchmark: 5.7 },
];

const SCORE_DIST = [
  { score: '1', count: 0 }, { score: '2', count: 2 },
  { score: '3', count: 4 }, { score: '4', count: 7 },
  { score: '5', count: 14 }, { score: '6', count: 19 },
  { score: '7', count: 22 }, { score: '8', count: 15 },
  { score: '9', count: 8 },
];

const RADAR_DATA = [
  { dim: '��适度', val: 72, full: 100 },
  { dim: '可达性', val: 53, full: 100 },
  { dim: '稳定性', val: 79, full: 100 },
  { dim: '疲劳抗性', val: 60, full: 100 },
  { dim: '整体感', val: 69, full: 100 },
  { dim: '竞品优势', val: 74, full: 100 },
];

const HAND_SIZE_DATA = [
  { group: 'S\n(<165)', score: 5.2, n: 4 },
  { group: 'M\n(165–175)', score: 6.8, n: 8 },
  { group: 'L\n(175–185)', score: 6.5, n: 6 },
  { group: 'XL\n(>185)', score: 5.9, n: 2 },
];

const TIMELINE_DATA = [
  { session: '第1组', comf: 5.8, fatigue: 2.1 },
  { session: '第2组', comf: 6.2, fatigue: 2.5 },
  { session: '第3组', comf: 6.7, fatigue: 2.9 },
  { session: '第4组', comf: 6.5, fatigue: 3.4 },
  { session: '第5组', comf: 6.3, fatigue: 3.8 },
  { session: '第6组', comf: 5.9, fatigue: 4.3 },
];

const FINDINGS = [
  {
    level: 'warn',
    title: '机身宽度偏大（74.2mm）',
    detail: 'P25以下手型用户（手长 <167mm）单手操控评分显著偏低，F(3,16)=8.23，p<0.01',
  },
  {
    level: 'ok',
    title: '握持舒适度优于行业基准',
    detail: 'M=6.5/9，高于行业均值（M=5.8），95% CI [6.1, 6.9]，效应量 Cohen\'s d=0.72',
  },
  {
    level: 'warn',
    title: '拇指可达性评分偏低',
    detail: 'M=4.8/9，建议优化屏幕顶部 14% 区域的交互设计，尤其通知栏手势操控',
  },
  {
    level: 'ok',
    title: '握感稳定性表现突出',
    detail: 'M=7.1/9，背盖材质磨砂工艺获得高度好评，与竞品相比具有显著优势（t=3.14，p=0.004）',
  },
  {
    level: 'info',
    title: '长时使用疲劳曲线拐点约在 35 分钟',
    detail: '超过 35 分钟后主观疲劳度（MBI量表）加速上升，建议引导用户换手持握',
  },
];

const RECOMMENDATIONS = [
  { pri: 'P0', text: '将机身宽度从 74.2mm 减小至 72.5±0.5mm，覆盖 P15–P85 手型区间' },
  { pri: 'P1', text: '优化屏幕顶部 14% 区域 UI 布局，下移高频操作入口至拇指舒适触达区' },
  { pri: 'P1', text: '保留背盖磨砂工艺，为下一代机型重要卖点' },
  { pri: 'P2', text: '考虑增加「单手模式」快捷触发手势，缓解大屏操控疲劳' },
];

// ── Custom Tooltip ─────────────────────────────────────────────────────────────
function CustomBarTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="px-2.5 py-2 rounded-xl shadow-lg" style={{ background: 'white', border: '1px solid #E5E6EB', fontSize: 11 }}>
      <div style={{ fontWeight: 700, color: '#1D2129', marginBottom: 4 }}>{label}</div>
      {payload.map((p: any) => (
        <div key={p.dataKey} className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full" style={{ background: p.fill || p.color }} />
          <span style={{ color: '#4E5969' }}>{p.name}：</span>
          <span style={{ fontWeight: 600, color: '#1D2129' }}>{p.value}</span>
        </div>
      ))}
    </div>
  );
}

// ── Section wrapper ──────────────────────────────────────────────────────────
function Section({ icon: Icon, title, children, collapsible = false }: {
  icon: any; title: string; children: ReactNode; collapsible?: boolean;
}) {
  const [open, setOpen] = useState(true);
  return (
    <div className="px-4 py-3">
      <button className="flex items-center justify-between w-full mb-3"
        onClick={() => collapsible && setOpen(v => !v)}>
        <div className="flex items-center gap-1.5">
          <Icon size={13} style={{ color: '#3370FF' }} />
          <span style={{ fontSize: 13, fontWeight: 700, color: '#1D2129' }}>{title}</span>
        </div>
        {collapsible && (open
          ? <ChevronUp size={14} style={{ color: '#86909C' }} />
          : <ChevronDown size={14} style={{ color: '#86909C' }} />
        )}
      </button>
      {open && children}
    </div>
  );
}

// ── Main ─────────────────────────────────────────────────────────────────────
export function AnalysisPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { state, dispatch } = useAppStore();
  const project = state.heProjects.find(p => p.id === id)!;
  if (!project) return null;

  const done = project.participants.filter(p => p.recordingStatus === 'done').length;
  const hasData = done > 0;

  return (
    <div className="pb-10">

      {/* ── 1. 数据概览 ── */}
      <div className="px-4 pt-4 pb-3">
        <div className="flex items-center gap-1.5 mb-3">
          <BarChart2 size={13} style={{ color: '#3370FF' }} />
          <span style={{ fontSize: 13, fontWeight: 700, color: '#1D2129' }}>数据概览</span>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {[
            { label: '有效数据', value: hasData ? `${done} 份` : '—', sub: `目标 ${project.participantTarget} 份`, color: '#3370FF' },
            { label: '数据完整率', value: hasData ? '96.4%' : '—', sub: '行业标准 ≥ 90%', color: '#00B42A' },
            { label: '量表信度 α', value: hasData ? '0.87' : '—', sub: 'Cronbach alpha', color: '#3370FF' },
            { label: '研究类型', value: `${project.researchTypes.length} 类`, sub: project.researchTypes.map(r => RESEARCH_TYPE_LABELS[r]).join('·'), color: '#86909C' },
          ].map(s => (
            <div key={s.label} className="bg-white p-3 rounded-2xl" style={{ border: '1px solid #E5E6EB' }}>
              <div style={{ fontSize: 10, color: '#86909C', marginBottom: 4 }}>{s.label}</div>
              <div style={{ fontSize: 20, fontWeight: 800, color: s.color, marginBottom: 2 }}>{s.value ?? '—'}</div>
              <div style={{ fontSize: 9, color: '#C9CDD4' }}>{s.sub}</div>
            </div>
          ))}
        </div>
      </div>

      {!hasData ? (
        <div className="text-center py-16 px-8">
          <BarChart2 size={36} className="mx-auto mb-3" style={{ color: '#C9CDD4' }} />
          <p style={{ fontSize: 13, fontWeight: 600, color: '#86909C' }}>暂无数据</p>
          <p style={{ fontSize: 11, color: '#C9CDD4', marginTop: 4 }}>请先完成数据采集步骤</p>
        </div>
      ) : (
        <>
          <div className="h-2" style={{ background: '#F7F8FA' }} />

          {/* ── 2. 维度均值对比（Bar） ── */}
          <Section icon={BarChart2} title="各维度得分 vs 行业基准">
            <div style={{ height: 200 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={DIMENSION_SCORES} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}
                  barCategoryGap="30%">
                  <CartesianGrid strokeDasharray="3 3" stroke="#F2F3F5" vertical={false} />
                  <XAxis dataKey="name" tick={{ fontSize: 9, fill: '#86909C' }} axisLine={false} tickLine={false} />
                  <YAxis domain={[0, 9]} tick={{ fontSize: 9, fill: '#86909C' }} axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomBarTooltip />} />
                  <Bar dataKey="benchmark" name="行业基准" fill="#E5E6EB" radius={[3, 3, 0, 0]} />
                  <Bar dataKey="score" name="本产品" radius={[3, 3, 0, 0]}>
                    {DIMENSION_SCORES.map((d, i) => (
                      <Cell key={i} fill={d.score >= d.benchmark ? '#3370FF' : '#F53F3F'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="flex items-center gap-4 mt-1">
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-2 rounded-sm" style={{ background: '#3370FF' }} />
                <span style={{ fontSize: 9, color: '#86909C' }}>本产品（优于基准）</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-2 rounded-sm" style={{ background: '#F53F3F' }} />
                <span style={{ fontSize: 9, color: '#86909C' }}>本产品（低于基准）</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-2 rounded-sm" style={{ background: '#E5E6EB' }} />
                <span style={{ fontSize: 9, color: '#86909C' }}>行业基准</span>
              </div>
            </div>
          </Section>

          <div className="h-2 my-1" style={{ background: '#F7F8FA' }} />

          {/* ── 3. 得分分布（Histogram） ── */}
          <Section icon={Activity} title="综合舒适度得分分布">
            <div style={{ height: 160 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={SCORE_DIST} margin={{ top: 4, right: 8, left: -22, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F2F3F5" vertical={false} />
                  <XAxis dataKey="score" tick={{ fontSize: 10, fill: '#86909C' }} axisLine={false} tickLine={false}
                    label={{ value: '得分（9分制）', position: 'insideBottom', offset: -1, style: { fontSize: 9, fill: '#C9CDD4' } }} />
                  <YAxis tick={{ fontSize: 9, fill: '#86909C' }} axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomBarTooltip />} />
                  <ReferenceLine x="5" stroke="#F53F3F" strokeDasharray="3 3" label={{ value: '均值5.0', fontSize: 8, fill: '#F53F3F' }} />
                  <Bar dataKey="count" name="频次" fill="#3370FF" radius={[3, 3, 0, 0]} opacity={0.85} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-2 p-2.5 rounded-xl" style={{ background: '#F7F8FA' }}>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { label: '均值 M', value: '6.53' },
                  { label: '标准差 SD', value: '1.42' },
                  { label: '中位数', value: '7.00' },
                ].map(s => (
                  <div key={s.label} className="text-center">
                    <div style={{ fontSize: 13, fontWeight: 700, color: '#1D2129' }}>{s.value}</div>
                    <div style={{ fontSize: 9, color: '#86909C' }}>{s.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </Section>

          <div className="h-2 my-1" style={{ background: '#F7F8FA' }} />

          {/* ── 4. 雷达图（多维度轮廓） ── */}
          <Section icon={TrendingUp} title="产品人因适配轮廓">
            <div style={{ height: 200 }}>
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={RADAR_DATA} margin={{ top: 10, right: 20, bottom: 10, left: 20 }}>
                  <PolarGrid stroke="#E5E6EB" />
                  <PolarAngleAxis dataKey="dim" tick={{ fontSize: 10, fill: '#86909C' }} />
                  <Radar name="本产品" dataKey="val" stroke="#3370FF" fill="#3370FF" fillOpacity={0.18} strokeWidth={2} />
                  <Radar name="行业均值" dataKey="full" stroke="#E5E6EB" fill="none" strokeWidth={1} strokeDasharray="4 2" />
                  <Tooltip formatter={(v: any) => `${v}%`} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
            <div className="flex items-center gap-4 justify-center mt-1">
              <div className="flex items-center gap-1.5">
                <div className="w-4 h-0.5" style={{ background: '#3370FF' }} />
                <span style={{ fontSize: 9, color: '#86909C' }}>本产品</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-4 h-0.5 border-t border-dashed" style={{ borderColor: '#E5E6EB' }} />
                <span style={{ fontSize: 9, color: '#86909C' }}>满分基线</span>
              </div>
            </div>
          </Section>

          <div className="h-2 my-1" style={{ background: '#F7F8FA' }} />

          {/* ── 5. 手型分组分析（Bar） ── */}
          <Section icon={Users} title="手型分组舒适度分析">
            <div style={{ height: 160 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={HAND_SIZE_DATA} margin={{ top: 4, right: 8, left: -22, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F2F3F5" vertical={false} />
                  <XAxis dataKey="group" tick={{ fontSize: 9, fill: '#86909C', whiteSpace: 'pre' }} axisLine={false} tickLine={false} />
                  <YAxis domain={[0, 9]} tick={{ fontSize: 9, fill: '#86909C' }} axisLine={false} tickLine={false} />
                  <ReferenceLine y={5.8} stroke="#E5E6EB" strokeDasharray="3 3" label={{ value: '基准', fontSize: 8, fill: '#C9CDD4', position: 'right' }} />
                  <Tooltip content={<CustomBarTooltip />} />
                  <Bar dataKey="score" name="舒适度均值" radius={[4, 4, 0, 0]}>
                    {HAND_SIZE_DATA.map((d, i) => (
                      <Cell key={i} fill={d.score >= 6.0 ? '#3370FF' : d.score >= 5.0 ? '#6AA1FF' : '#F53F3F'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-2 px-2.5 py-2 rounded-xl" style={{ background: '#FFF7E6', border: '1px solid #FFD591' }}>
              <div className="flex items-start gap-1.5">
                <AlertTriangle size={11} style={{ color: '#FF7D00', flexShrink: 0, marginTop: 1 }} />
                <span style={{ fontSize: 10, color: '#AD6800', lineHeight: 1.5 }}>
                  S型手型（手长 &lt;165mm）舒适度明显低于均值，建议重点关注宽度优化
                </span>
              </div>
            </div>
          </Section>

          <div className="h-2 my-1" style={{ background: '#F7F8FA' }} />

          {/* ── 6. 持握疲劳曲线（Line） ── */}
          <Section icon={Activity} title="持握时长 vs 舒适 / 疲劳曲线">
            <div style={{ height: 160 }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={TIMELINE_DATA} margin={{ top: 4, right: 8, left: -22, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F2F3F5" />
                  <XAxis dataKey="session" tick={{ fontSize: 9, fill: '#86909C' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 9, fill: '#86909C' }} axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomBarTooltip />} />
                  <Line dataKey="comf" name="舒适度" stroke="#3370FF" strokeWidth={2} dot={{ r: 3, fill: '#3370FF' }} type="monotone" />
                  <Line dataKey="fatigue" name="疲劳指数" stroke="#F53F3F" strokeWidth={2} dot={{ r: 3, fill: '#F53F3F' }} type="monotone" />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div className="flex items-center gap-4 mt-1">
              <div className="flex items-center gap-1.5">
                <div className="w-4 h-0.5" style={{ background: '#3370FF' }} />
                <span style={{ fontSize: 9, color: '#86909C' }}>舒适度</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-4 h-0.5" style={{ background: '#F53F3F' }} />
                <span style={{ fontSize: 9, color: '#86909C' }}>疲劳指数</span>
              </div>
            </div>
          </Section>

          <div className="h-2 my-1" style={{ background: '#F7F8FA' }} />

          {/* ── 7. 统计可靠性 ── */}
          <Section icon={BarChart2} title="统计可靠性指标" collapsible>
            <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid #E5E6EB' }}>
              {[
                { label: 'Cronbach\'s α', value: '0.87', note: '量表内部一致性，优（≥0.80）' },
                { label: 'KMO 取样适切量数', value: '0.81', note: '因子分析适合度，良好（≥0.70）' },
                { label: 'Shapiro-Wilk 正态检验', value: 'p=0.24', note: '主维度满足正态分布假设' },
                { label: '组间 ANOVA（手型）', value: 'F=8.23 p<0.01', note: '手型分组间差异显著' },
                { label: '效应量 Cohen\'s d', value: '0.72', note: '与行业基准比较，中等效应' },
                { label: '95% 置信区间', value: '[6.1, 6.9]', note: '综合舒适度均值置信区间' },
              ].map((item, i, arr) => (
                <div key={item.label} className="flex items-start gap-3 px-3 py-2.5 bg-white"
                  style={{ borderBottom: i < arr.length - 1 ? '1px solid #F2F3F5' : 'none' }}>
                  <div className="flex-1">
                    <div style={{ fontSize: 11, color: '#4E5969' }}>{item.label}</div>
                    <div style={{ fontSize: 9, color: '#C9CDD4', marginTop: 1 }}>{item.note}</div>
                  </div>
                  <span style={{ fontSize: 12, fontWeight: 700, color: '#1D2129', flexShrink: 0 }}>{item.value}</span>
                </div>
              ))}
            </div>
          </Section>

          <div className="h-2 my-1" style={{ background: '#F7F8FA' }} />

          {/* ── 8. 关键发现 ── */}
          <Section icon={TrendingUp} title="关键发现">
            <div className="space-y-2">
              {FINDINGS.map((f, i) => {
                const isWarn = f.level === 'warn';
                const isOk = f.level === 'ok';
                return (
                  <div key={i} className="p-3 rounded-2xl"
                    style={{
                      background: isWarn ? '#FFF7E6' : isOk ? '#F6FFED' : '#F0F5FF',
                      border: `1px solid ${isWarn ? '#FFD591' : isOk ? '#B7EB8F' : '#BFD0FF'}`,
                    }}>
                    <div className="flex items-start gap-2">
                      <span style={{ fontSize: 12, flexShrink: 0, marginTop: 1 }}>
                        {isWarn ? '⚠' : isOk ? '✓' : 'ℹ'}
                      </span>
                      <div>
                        <div style={{ fontSize: 12, fontWeight: 700, color: isWarn ? '#AD6800' : isOk ? '#389E0D' : '#3370FF', marginBottom: 3 }}>
                          {f.title}
                        </div>
                        <div style={{ fontSize: 10, color: isWarn ? '#874D00' : isOk ? '#135200' : '#1D39C4', lineHeight: 1.6 }}>
                          {f.detail}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </Section>

          <div className="h-2 my-1" style={{ background: '#F7F8FA' }} />

          {/* ── 9. 优化建议 ── */}
          <Section icon={Check} title="设计优化建议" collapsible>
            <div className="space-y-2">
              {RECOMMENDATIONS.map((r, i) => (
                <div key={i} className="flex items-start gap-2.5 p-3 rounded-xl bg-white"
                  style={{ border: '1px solid #E5E6EB' }}>
                  <span className="px-1.5 py-0.5 rounded-md flex-shrink-0"
                    style={{
                      fontSize: 9, fontWeight: 800,
                      background: r.pri === 'P0' ? '#FFF0F0' : r.pri === 'P1' ? '#FFF7E6' : '#EEF3FF',
                      color: r.pri === 'P0' ? '#F53F3F' : r.pri === 'P1' ? '#FF7D00' : '#3370FF',
                    }}>
                    {r.pri}
                  </span>
                  <span style={{ fontSize: 11, color: '#4E5969', lineHeight: 1.6 }}>{r.text}</span>
                </div>
              ))}
            </div>
          </Section>

          <div className="h-2 my-1" style={{ background: '#F7F8FA' }} />

          {/* ── Actions ── */}
          <div className="px-4 py-3 space-y-2.5">
            <button className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl text-white"
              style={{ background: '#3370FF', fontSize: 13, fontWeight: 700 }}>
              <Download size={14} /> 导出完整报告（PDF）
            </button>
            <button
              onClick={() => {
                dispatch({ type: 'UPDATE_HE_PROJECT', payload: { id: id!, updates: { status: 'completed', progress: 100 } } });
                navigate(`/tob/he/projects/${id}`);
              }}
              className="w-full py-3 rounded-2xl flex items-center justify-center"
              style={{ border: '1px solid #E5E6EB', color: '#4E5969', fontSize: 13, fontWeight: 600 }}>
              完成项目并归档
            </button>
          </div>
        </>
      )}
    </div>
  );
}