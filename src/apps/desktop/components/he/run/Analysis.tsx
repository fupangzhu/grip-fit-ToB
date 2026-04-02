import { useState } from 'react';
import { useParams, useNavigate } from 'react-router';
import { ArrowLeft, CheckCircle, AlertTriangle, Download, Copy, RefreshCw, Send, ChevronDown, ChevronUp, TrendingUp, BarChart2, GitBranch, Layers, Activity } from 'lucide-react';
import { useAppStore } from '../../../store';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ErrorBar, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ComposedChart, Scatter, Line } from 'recharts';

const scoreData = [
  { condition: '握持舒适', mean: 6.2, error: 1.4 },
  { condition: '单手操作', mean: 5.8, error: 1.6 },
  { condition: '拇指可达', mean: 4.8, error: 1.2 },
  { condition: '握持稳定', mean: 7.1, error: 0.9 },
  { condition: '重量感知', mean: 6.5, error: 1.1 },
];

const radarData = [
  { dim: '整体舒适', score: 69 }, { dim: '单手操控', score: 64 },
  { dim: '拇指触达', score: 53 }, { dim: '握持稳定', score: 79 },
  { dim: '重量感知', score: 72 }, { dim: '外观形态', score: 81 },
];

const normalityData = [
  { q: -2.5, theoretical: -2.5, actual: -2.3 }, { q: -1.5, theoretical: -1.5, actual: -1.6 },
  { q: -0.5, theoretical: -0.5, actual: -0.4 }, { q: 0.5, theoretical: 0.5, actual: 0.6 },
  { q: 1.5, theoretical: 1.5, actual: 1.4 }, { q: 2.5, theoretical: 2.5, actual: 2.6 },
];

const efaData = [
  { factor: 'F1 舒适体验', items: ['握持舒适', '单手操作', '握持稳定'], loading: [0.84, 0.78, 0.72], variance: '31.2%' },
  { factor: 'F2 操控便利', items: ['拇指可达', '重量感知'], loading: [0.89, 0.71], variance: '24.5%' },
  { factor: 'F3 形态适配', items: ['外观形态', '整体满意'], loading: [0.82, 0.68], variance: '18.3%' },
];

const ANALYSIS_SECTIONS = [
  { id: 'preprocess', label: '数据预处理', icon: Activity, status: 'done' },
  { id: 'reliability', label: '信效度分析', icon: CheckCircle, status: 'done' },
  { id: 'normality', label: '正态性检验', icon: TrendingUp, status: 'done' },
  { id: 'descriptive', label: '描述性统计', icon: BarChart2, status: 'done' },
  { id: 'ttest', label: '差异检验（t/U）', icon: BarChart2, status: 'done' },
  { id: 'anova', label: '方差分析（ANOVA）', icon: Layers, status: 'done' },
  { id: 'regression', label: '相关与回归', icon: TrendingUp, status: 'done' },
  { id: 'efa', label: '探索性因子分析（EFA）', icon: GitBranch, status: 'done' },
  { id: 'sem', label: '结构方程模型（SEM）', icon: GitBranch, status: 'warn' },
];

const preprocessLog = [
  { ok: true, msg: '量表数据导入：20份，有效19份（剔除P015：作答时间极端异常，47s完成18题）' },
  { ok: true, msg: 'EEG数据处理：ICA去伪迹，保留19段有效信号，Alpha功率提取完成' },
  { ok: true, msg: 'EDA数据处理：Butterworth滤波0.05Hz，SCR峰值提取，19段有效' },
  { ok: true, msg: '面部情绪数据：AU编码完成，FACS分类7类情绪，与量表时间戳对齐' },
  { ok: true, msg: '缺失值处理：3处空值已用均值填充（均<5%缺失率），已标注' },
  { ok: false, msg: '注意：EEG数据对P008存在轻微眼电伪迹，已ICA处理，建议人工复核' },
];

const defaultConclusion = `【握持舒适度研究 A2026】综合研究报告

■ 研究概要
本次实验共收集19名有效被试（手长 M=178.3mm, SD=8.1mm）对旗舰样机A的多维度握持体验评分。数据来源：主观量表(n=19)、EEG(n=19)、EDA(n=18)、面部情绪(n=19)。

■ 主要发现
1. 整体握持舒适度均分 6.2/9（SD=1.4），显著高于中性值5（t(18)=3.74, p=0.003, d=0.86），握持体验整体正向。
2. 拇指可达性得分偏低（M=4.8/9），为本次设计的核心痛点；EDA数据同步显示，被试在触达屏幕顶部时SCR幅值增大（M=1.23μS vs 基线0.67μS），说明存在认知努力提升。
3. 握持宽度与整体舒适度显著负相关（r=-0.68, p<0.001），回归分析显示宽度每增加1mm，舒适度均分下降0.31分（β=-0.31, p<0.001）。
4. EFA提取3因子，累计解释方差74.0%：F1舒适体验（α=0.87）、F2操控便利（α=0.82）、F3形态适配（α=0.79）。
5. SEM分析显示，手型匹配度通过握持舒适度间接影响使用意愿（间接效应=0.38, Bootstrap 95%CI: [0.19, 0.57]）。

■ 设计建议
• 机身宽度建议控制在 ≤71mm（当前76mm），可提升舒适度约 +1.5分
• 整机高度建议降低 3–5mm，以改善顶部拇指触达性
• 当前重量（约195g）偏重，建议目标区间 175–185g
• 单手握持友好型设计需重点优化单侧弧度，增加防滑纹理`;

export function AnalysisPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { state, dispatch } = useAppStore();
  const project = state.heProjects.find(p => p.id === id)!;

  const [expandedSection, setExpandedSection] = useState<string | null>('reliability');
  const [conclusion, setConclusion] = useState(defaultConclusion);
  const [saved, setSaved] = useState(false);
  const [activeTab, setActiveTab] = useState<'analysis' | 'report'>('analysis');

  if (!project) return null;
  const done = project.participants.filter(p => p.recordingStatus === 'done').length;

  const StatBadge = ({ v, ok }: { v: string; ok: boolean }) => (
    <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: ok ? '#E8F7EA' : '#FFECE8', color: ok ? '#00B42A' : '#F53F3F', fontWeight: 600 }}>{v}</span>
  );

  return (
    <div className="p-5 space-y-4 max-w-5xl">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-base" style={{ fontWeight: 700, color: '#1D2129' }}>自动化数据分析与研究报告</h2>
          <p className="text-sm mt-0.5" style={{ color: '#86909C' }}>基于 {done} 份有效数据 · 全自动统计分析 · 多模态数据融合</p>
        </div>
        <div className="px-3 py-1.5 rounded-full text-xs" style={{ background: '#EEF3FF', color: '#3370FF', fontWeight: 500 }}>步骤 6 / 6</div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 p-1 rounded-xl" style={{ background: '#F2F3F5' }}>
        {[
          { key: 'analysis', label: '统计分析全览' },
          { key: 'report', label: '综合研究报告' },
        ].map(tab => (
          <button key={tab.key} onClick={() => setActiveTab(tab.key as any)}
            className="flex-1 py-2 rounded-lg text-sm transition-all"
            style={activeTab === tab.key
              ? { background: 'white', color: '#1D2129', fontWeight: 600, boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }
              : { color: '#4E5969' }}>
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'analysis' && (
        <div className="space-y-3">
          {/* Analysis pipeline overview */}
          <div className="grid grid-cols-9 gap-1 items-center p-3 rounded-xl" style={{ background: 'white', border: '1px solid #E5E6EB' }}>
            {ANALYSIS_SECTIONS.map((s, i) => (
              <div key={s.id} className="flex items-center gap-1">
                <div className="flex flex-col items-center">
                  <div className="w-6 h-6 rounded-full flex items-center justify-center" style={{ background: s.status === 'done' ? '#E8F7EA' : '#FFF7E8' }}>
                    {s.status === 'done' ? <CheckCircle size={12} style={{ color: '#00B42A' }} /> : <AlertTriangle size={12} style={{ color: '#FF7D00' }} />}
                  </div>
                  <span className="text-center mt-1" style={{ fontSize: 10, color: '#86909C', lineHeight: 1.2 }}>{s.label.split('（')[0]}</span>
                </div>
                {i < ANALYSIS_SECTIONS.length - 1 && <div className="w-3 h-px flex-shrink-0" style={{ background: '#E5E6EB' }} />}
              </div>
            ))}
          </div>

          {/* Sections */}
          {[
            {
              id: 'preprocess', title: '① 数据预处理（自动执行）',
              content: (
                <div className="space-y-2">
                  {preprocessLog.map((log, i) => (
                    <div key={i} className="flex items-start gap-2.5 p-2.5 rounded-lg text-sm" style={{ background: log.ok ? '#F6FFED' : '#FFF7E8' }}>
                      {log.ok ? <CheckCircle size={13} style={{ color: '#00B42A', flexShrink: 0, marginTop: 1 }} /> : <AlertTriangle size={13} style={{ color: '#FF7D00', flexShrink: 0, marginTop: 1 }} />}
                      <span style={{ color: log.ok ? '#389E0D' : '#7D4E00' }}>{log.msg}</span>
                    </div>
                  ))}
                </div>
              ),
            },
            {
              id: 'reliability', title: '② 量表信效度分析',
              content: (
                <div className="space-y-3">
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { label: 'Cronbach\'s α', value: '0.87', note: '内部一致性信度', ok: true, threshold: '≥0.80 ✓' },
                      { label: '分半信度', value: '0.83', note: 'Spearman-Brown校正', ok: true, threshold: '≥0.80 ✓' },
                      { label: 'AVE 均值', value: '0.61', note: '平均方差提取量', ok: true, threshold: '≥0.50 ��' },
                    ].map(m => (
                      <div key={m.label} className="p-3 rounded-xl border text-center" style={{ borderColor: '#E5E6EB', background: '#FAFAFA' }}>
                        <div className="text-2xl mb-1" style={{ fontWeight: 700, color: '#00B42A' }}>{m.value}</div>
                        <div className="text-xs mb-1" style={{ fontWeight: 600, color: '#1D2129' }}>{m.label}</div>
                        <div className="text-xs" style={{ color: '#86909C' }}>{m.note}</div>
                        <div className="text-xs mt-1" style={{ color: '#00B42A' }}>{m.threshold}</div>
                      </div>
                    ))}
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead style={{ background: '#FAFAFA' }}>
                        <tr>
                          {['因子', 'α值', 'AVE', 'CR组合信度', '判断'].map(h => (
                            <th key={h} className="px-3 py-2 text-left text-xs" style={{ fontWeight: 600, color: '#86909C' }}>{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y" style={{ borderColor: '#F2F3F5' }}>
                        {[
                          { factor: '舒适体验（F1）', alpha: '0.87', ave: '0.68', cr: '0.91', ok: true },
                          { factor: '操控便利（F2）', alpha: '0.82', ave: '0.58', cr: '0.87', ok: true },
                          { factor: '形态适配（F3）', alpha: '0.79', ave: '0.54', cr: '0.83', ok: true },
                        ].map((r, i) => (
                          <tr key={i}>
                            <td className="px-3 py-2.5" style={{ color: '#1D2129', fontWeight: 500 }}>{r.factor}</td>
                            <td className="px-3 py-2.5"><StatBadge v={r.alpha} ok={r.ok} /></td>
                            <td className="px-3 py-2.5"><StatBadge v={r.ave} ok={r.ok} /></td>
                            <td className="px-3 py-2.5"><StatBadge v={r.cr} ok={r.ok} /></td>
                            <td className="px-3 py-2.5 text-xs" style={{ color: '#00B42A' }}>✓ 通过</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ),
            },
            {
              id: 'normality', title: '③ 数据分布与正态性检验',
              content: (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-xs mb-3" style={{ fontWeight: 600, color: '#4E5969' }}>Shapiro-Wilk 正态性检验结果</h4>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead style={{ background: '#FAFAFA' }}>
                          <tr>
                            {['变量', 'W统计量', 'p值', '结论'].map(h => (
                              <th key={h} className="px-3 py-2 text-left text-xs" style={{ fontWeight: 600, color: '#86909C' }}>{h}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="divide-y" style={{ borderColor: '#F2F3F5' }}>
                          {[
                            { v: '握持舒适度', w: '0.963', p: '0.612', normal: true },
                            { v: '拇指可达性', w: '0.948', p: '0.387', normal: true },
                            { v: '握持稳定性', w: '0.971', p: '0.734', normal: true },
                            { v: 'EDA均值', w: '0.921', p: '0.103', normal: true },
                            { v: 'Alpha功率', w: '0.894', p: '0.042', normal: false },
                          ].map((r, i) => (
                            <tr key={i}>
                              <td className="px-3 py-2" style={{ color: '#1D2129' }}>{r.v}</td>
                              <td className="px-3 py-2" style={{ color: '#4E5969' }}>{r.w}</td>
                              <td className="px-3 py-2"><StatBadge v={r.p} ok={parseFloat(r.p) > 0.05} /></td>
                              <td className="px-3 py-2 text-xs" style={{ color: r.normal ? '#00B42A' : '#FF7D00' }}>
                                {r.normal ? '✓ 正态' : '⚠ 非正态，用Mann-Whitney'}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                  <div>
                    <h4 className="text-xs mb-3" style={{ fontWeight: 600, color: '#4E5969' }}>Q-Q 正态概率图（握持舒适度）</h4>
                    <div className="rounded-xl border p-3" style={{ borderColor: '#E5E6EB', background: '#FAFAFA' }}>
                      <ResponsiveContainer width="100%" height={160}>
                        <ComposedChart data={normalityData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#F2F3F5" />
                          <XAxis dataKey="q" name="理论分位数" tick={{ fontSize: 10, fill: '#86909C' }} axisLine={false} tickLine={false} />
                          <YAxis dataKey="actual" name="实际分位数" tick={{ fontSize: 10, fill: '#86909C' }} axisLine={false} tickLine={false} />
                          <Tooltip contentStyle={{ fontSize: '11px', borderRadius: '8px' }} />
                          <Line type="linear" dataKey="theoretical" dot={false} stroke="#F53F3F" strokeDasharray="4 2" strokeWidth={1} />
                          <Scatter dataKey="actual" fill="#3370FF" />
                        </ComposedChart>
                      </ResponsiveContainer>
                      <p className="text-center text-xs mt-1" style={{ color: '#86909C' }}>点贴近对角线 → 正态分布假设成立</p>
                    </div>
                  </div>
                </div>
              ),
            },
            {
              id: 'ttest', title: '④ 推断统计：差异检验（t检验 / Mann-Whitney U）',
              content: (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead style={{ background: '#FAFAFA' }}>
                      <tr>
                        {['维度', '均 M', 'SD', '检验方法', '统计量', 'p值', '效应量', '结论'].map(h => (
                          <th key={h} className="px-3 py-2.5 text-left text-xs whitespace-nowrap" style={{ fontWeight: 600, color: '#86909C' }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y" style={{ borderColor: '#F2F3F5' }}>
                      {[
                        { dim: '握持舒适', m: '6.2', sd: '1.4', method: '单样本t', stat: 't(18)=3.74', p: '0.003', eff: 'd=0.86（大）', ok: true, note: '显著高于中性值5' },
                        { dim: '拇指可达', m: '4.8', sd: '1.2', method: '单样本t', stat: 't(18)=-0.71', p: '0.483', eff: 'd=0.17（小）', ok: false, note: '与中性值无显著差异' },
                        { dim: '握持稳定', m: '7.1', sd: '0.9', method: '单样本t', stat: 't(18)=5.88', p: '<0.001', eff: 'd=1.35（大）', ok: true, note: '显著高于中性值' },
                        { dim: 'Alpha功率（EEG）', m: '8.3μV', sd: '2.1', method: 'Mann-Whitney U', stat: 'U=142.5', p: '0.031', eff: 'r=0.48（中）', ok: true, note: '握持时Alpha显著高于静息' },
                        { dim: 'EDA反应（SCR）', m: '1.23μS', sd: '0.45', method: '独立样本t', stat: 't(36)=2.14', p: '0.039', eff: 'd=0.72（中）', ok: true, note: '操作困难时SCR显著升高' },
                      ].map((row, i) => (
                        <tr key={i} className="hover:bg-gray-50">
                          <td className="px-3 py-2.5" style={{ fontWeight: 500, color: '#1D2129' }}>{row.dim}</td>
                          <td className="px-3 py-2.5" style={{ color: '#4E5969' }}>{row.m}</td>
                          <td className="px-3 py-2.5" style={{ color: '#4E5969' }}>{row.sd}</td>
                          <td className="px-3 py-2.5 text-xs" style={{ color: '#86909C' }}>{row.method}</td>
                          <td className="px-3 py-2.5 text-xs" style={{ color: '#4E5969' }}>{row.stat}</td>
                          <td className="px-3 py-2.5"><StatBadge v={row.p} ok={row.ok} /></td>
                          <td className="px-3 py-2.5 text-xs" style={{ color: '#4E5969' }}>{row.eff}</td>
                          <td className="px-3 py-2.5 text-xs" style={{ color: row.ok ? '#00B42A' : '#86909C' }}>{row.note}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ),
            },
            {
              id: 'anova', title: '⑤ 方差分析（One-Way ANOVA + Post-hoc）',
              content: (
                <div className="space-y-3">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead style={{ background: '#FAFAFA' }}>
                        <tr>
                          {['因素', '因变量', 'F统计量', 'p值', 'η²效应量', 'Post-hoc（Tukey）', '结论'].map(h => (
                            <th key={h} className="px-3 py-2.5 text-left text-xs whitespace-nowrap" style={{ fontWeight: 600, color: '#86909C' }}>{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y" style={{ borderColor: '#F2F3F5' }}>
                        {[
                          { factor: '手型分组（A/B/C）', dv: '握持舒适度', f: 'F(2,16)=5.34', p: '0.017', eta: 'η²=0.40', posthoc: 'A<C (p=0.012)', ok: true, note: '大手型用户舒适度显著更高' },
                          { factor: '握持习惯（单/双）', dv: '拇指可达性', f: 'F(1,17)=8.12', p: '0.011', eta: 'η²=0.32', posthoc: '双手<单手 (p=0.011)', ok: true, note: '双手用户可达性评分更低' },
                          { factor: '年龄段（18-25/26-35/36-45）', dv: '握持疲劳', f: 'F(2,16)=2.11', p: '0.152', eta: 'η²=0.21', posthoc: 'n.s.', ok: false, note: '年龄组间无显著差异' },
                        ].map((row, i) => (
                          <tr key={i} className="hover:bg-gray-50">
                            <td className="px-3 py-2.5 text-xs" style={{ color: '#1D2129', fontWeight: 500 }}>{row.factor}</td>
                            <td className="px-3 py-2.5 text-xs" style={{ color: '#4E5969' }}>{row.dv}</td>
                            <td className="px-3 py-2.5 text-xs" style={{ color: '#4E5969' }}>{row.f}</td>
                            <td className="px-3 py-2.5"><StatBadge v={row.p} ok={row.ok} /></td>
                            <td className="px-3 py-2.5 text-xs" style={{ color: '#4E5969' }}>{row.eta}</td>
                            <td className="px-3 py-2.5 text-xs" style={{ color: '#86909C' }}>{row.posthoc}</td>
                            <td className="px-3 py-2.5 text-xs" style={{ color: row.ok ? '#00B42A' : '#86909C' }}>{row.note}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ),
            },
            {
              id: 'regression', title: '⑥ 相关分析与多元回归',
              content: (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-xs mb-3" style={{ fontWeight: 600, color: '#4E5969' }}>Pearson相关矩阵（主要变量）</h4>
                    <div className="overflow-x-auto">
                      <table className="w-full text-xs">
                        <thead style={{ background: '#FAFAFA' }}>
                          <tr>
                            {['', '舒适度', '可达性', '稳定性', '手长', 'EDA'].map(h => (
                              <th key={h} className="px-2 py-2 text-center" style={{ fontWeight: 600, color: '#86909C' }}>{h}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {[
                            { label: '舒适度', vals: ['—', '.58**', '.72**', '-.68**', '-.41*'] },
                            { label: '可达性', vals: ['.58**', '—', '.44*', '-.52**', '-.29'] },
                            { label: '稳定性', vals: ['.72**', '.44*', '—', '.38', '-.21'] },
                            { label: '手长', vals: ['-.68**', '-.52**', '.38', '—', '.15'] },
                            { label: 'EDA', vals: ['-.41*', '-.29', '-.21', '.15', '—'] },
                          ].map((row, i) => (
                            <tr key={i} className="hover:bg-gray-50">
                              <td className="px-2 py-2" style={{ fontWeight: 600, color: '#1D2129' }}>{row.label}</td>
                              {row.vals.map((v, j) => (
                                <td key={j} className="px-2 py-2 text-center"
                                  style={{ color: v.includes('**') ? '#F53F3F' : v.includes('*') ? '#FF7D00' : '#4E5969', fontWeight: v.includes('*') ? 600 : 400 }}>
                                  {v}
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                      <p className="text-xs mt-2" style={{ color: '#86909C' }}>** p&lt;0.01, * p&lt;0.05</p>
                    </div>
                  </div>
                  <div>
                    <h4 className="text-xs mb-3" style={{ fontWeight: 600, color: '#4E5969' }}>多元线性回归：握持舒适度预测模型</h4>
                    <div className="p-3 rounded-xl border mb-2" style={{ borderColor: '#E5E6EB', background: '#FAFAFA' }}>
                      <div className="text-sm mb-1" style={{ fontWeight: 600, color: '#1D2129' }}>R²=0.71, F(3,15)=12.24, p&lt;0.001</div>
                      <p className="text-xs" style={{ color: '#86909C' }}>模型解释握持舒适度方差的71%</p>
                    </div>
                    <div className="space-y-2">
                      {[
                        { pred: '手长（mm）', beta: '-0.52', p: '0.001', sig: true },
                        { pred: '握持稳定性评分', beta: '+0.38', p: '0.008', sig: true },
                        { pred: 'EDA均值（μS）', beta: '-0.29', p: '0.047', sig: true },
                      ].map((r, i) => (
                        <div key={i} className="flex items-center justify-between p-2.5 rounded-lg" style={{ background: '#F7F8FA' }}>
                          <span className="text-xs" style={{ color: '#1D2129', fontWeight: 500 }}>{r.pred}</span>
                          <div className="flex items-center gap-2">
                            <span className="text-xs" style={{ color: parseFloat(r.beta) > 0 ? '#00B42A' : '#F53F3F', fontWeight: 600 }}>β={r.beta}</span>
                            <StatBadge v={r.p} ok={r.sig} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ),
            },
            {
              id: 'efa', title: '⑦ 探索性因子分析（EFA）',
              content: (
                <div className="space-y-3">
                  <div className="grid grid-cols-3 gap-3 mb-3">
                    {[
                      { label: 'KMO检验', value: '0.81', note: '适合因子分析', ok: true },
                      { label: 'Bartlett球形检验', value: 'p<0.001', note: '相关矩阵非单位阵', ok: true },
                      { label: '累计方差解释', value: '74.0%', note: '3因子', ok: true },
                    ].map(m => (
                      <div key={m.label} className="p-3 rounded-xl border text-center" style={{ borderColor: '#E5E6EB', background: '#FAFAFA' }}>
                        <div className="text-lg mb-1" style={{ fontWeight: 700, color: '#3370FF' }}>{m.value}</div>
                        <div className="text-xs mb-0.5" style={{ fontWeight: 600, color: '#1D2129' }}>{m.label}</div>
                        <div className="text-xs" style={{ color: '#86909C' }}>{m.note}</div>
                      </div>
                    ))}
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    {efaData.map(f => (
                      <div key={f.factor} className="bg-white rounded-xl border p-3" style={{ borderColor: '#E5E6EB' }}>
                        <div className="text-xs mb-2" style={{ fontWeight: 600, color: '#1D2129' }}>{f.factor}</div>
                        <div className="text-xs mb-2 px-2 py-0.5 rounded-full inline-block" style={{ background: '#EEF3FF', color: '#3370FF' }}>解释方差 {f.variance}</div>
                        <div className="space-y-1.5">
                          {f.items.map((item, i) => (
                            <div key={item} className="flex items-center gap-2">
                              <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: '#F2F3F5' }}>
                                <div className="h-full rounded-full" style={{ width: `${f.loading[i] * 100}%`, background: '#3370FF' }} />
                              </div>
                              <span className="text-xs whitespace-nowrap" style={{ color: '#4E5969' }}>{f.loading[i]} {item}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ),
            },
            {
              id: 'sem', title: '⑧ 结构方程模型（SEM）',
              content: (
                <div className="space-y-3">
                  <div className="p-3 rounded-xl border" style={{ background: '#FFF7E8', borderColor: '#FFD65B' }}>
                    <div className="flex items-center gap-2 mb-1">
                      <AlertTriangle size={13} style={{ color: '#FF7D00' }} />
                      <span className="text-xs" style={{ fontWeight: 600, color: '#7D4E00' }}>SEM建模注意：当前样本量(n=19)偏小，SEM结果仅供参考，建议n≥100进行稳健分析</span>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h4 className="text-xs mb-3" style={{ fontWeight: 600, color: '#4E5969' }}>模型适配指数</h4>
                      <div className="space-y-2">
                        {[
                          { index: 'χ²/df', value: '1.87', threshold: '<3.0', ok: true },
                          { index: 'CFI', value: '0.943', threshold: '>0.90', ok: true },
                          { index: 'RMSEA', value: '0.071', threshold: '<0.08', ok: true },
                          { index: 'SRMR', value: '0.058', threshold: '<0.08', ok: true },
                          { index: 'GFI', value: '0.891', threshold: '>0.90（偏低）', ok: false },
                        ].map(m => (
                          <div key={m.index} className="flex items-center justify-between p-2.5 rounded-lg" style={{ background: '#FAFAFA' }}>
                            <span className="text-xs" style={{ fontWeight: 600, color: '#1D2129' }}>{m.index}</span>
                            <div className="flex items-center gap-2">
                              <StatBadge v={m.value} ok={m.ok} />
                              <span className="text-xs" style={{ color: '#86909C' }}>阈值{m.threshold}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div>
                      <h4 className="text-xs mb-3" style={{ fontWeight: 600, color: '#4E5969' }}>路径系数（标准化）</h4>
                      <div className="space-y-2">
                        {[
                          { path: '手型适配 → 握持舒适', coeff: '0.62**', ok: true },
                          { path: '握持舒适 → 使用意愿', coeff: '0.61**', ok: true },
                          { path: '手型适配 → 使用意愿（间接）', coeff: '0.38**', ok: true },
                          { path: '拇指可达 → 操控便利', coeff: '0.74**', ok: true },
                          { path: '操控便利 → 使用意愿', coeff: '0.44*', ok: true },
                        ].map((p, i) => (
                          <div key={i} className="flex items-center justify-between p-2.5 rounded-lg" style={{ background: '#FAFAFA' }}>
                            <span className="text-xs" style={{ color: '#4E5969' }}>{p.path}</span>
                            <StatBadge v={p.coeff} ok={p.ok} />
                          </div>
                        ))}
                      </div>
                      <p className="text-xs mt-2" style={{ color: '#86909C' }}>间接效应 Bootstrap 95%CI: [0.19, 0.57]</p>
                    </div>
                  </div>
                </div>
              ),
            },
          ].map(section => (
            <div key={section.id} className="bg-white rounded-xl border overflow-hidden" style={{ borderColor: '#E5E6EB' }}>
              <button
                className="w-full flex items-center justify-between px-4 py-3.5 transition-colors hover:bg-gray-50"
                onClick={() => setExpandedSection(expandedSection === section.id ? null : section.id)}>
                <span className="text-sm" style={{ fontWeight: 600, color: '#1D2129' }}>{section.title}</span>
                {expandedSection === section.id ? <ChevronUp size={15} style={{ color: '#86909C' }} /> : <ChevronDown size={15} style={{ color: '#86909C' }} />}
              </button>
              {expandedSection === section.id && (
                <div className="px-4 pb-4 border-t" style={{ borderColor: '#F2F3F5' }}>
                  <div className="pt-4">{section.content}</div>
                </div>
              )}
            </div>
          ))}

          {/* Visualization charts */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white rounded-xl border p-4" style={{ borderColor: '#E5E6EB' }}>
              <h3 className="text-sm mb-4" style={{ fontWeight: 600, color: '#1D2129' }}>各维度评分均值（含误差棒）</h3>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={scoreData} margin={{ top: 10, right: 16, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F2F3F5" />
                  <XAxis dataKey="condition" tick={{ fontSize: 11, fill: '#86909C' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: '#86909C' }} axisLine={false} tickLine={false} domain={[0, 9]} />
                  <Tooltip contentStyle={{ fontSize: '12px', borderRadius: '8px', border: '1px solid #E5E6EB' }} />
                  <Bar dataKey="mean" name="均值" fill="#3370FF" radius={[6, 6, 0, 0]}>
                    <ErrorBar dataKey="error" width={4} strokeWidth={2} stroke="#1456F0" />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="bg-white rounded-xl border p-4" style={{ borderColor: '#E5E6EB' }}>
              <h3 className="text-sm mb-4" style={{ fontWeight: 600, color: '#1D2129' }}>多维度综合体验雷达图</h3>
              <ResponsiveContainer width="100%" height={200}>
                <RadarChart data={radarData} margin={{ top: 10, right: 20, left: 20, bottom: 10 }}>
                  <PolarGrid stroke="#F2F3F5" />
                  <PolarAngleAxis dataKey="dim" tick={{ fontSize: 11, fill: '#86909C' }} />
                  <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fontSize: 10, fill: '#C9CDD4' }} />
                  <Radar name="得分" dataKey="score" stroke="#3370FF" fill="#3370FF" fillOpacity={0.25} strokeWidth={2} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* Report Tab */}
      {activeTab === 'report' && (
        <div className="space-y-4">
          <div className="bg-white rounded-xl border p-4" style={{ borderColor: '#E5E6EB' }}>
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="text-sm" style={{ fontWeight: 600, color: '#1D2129' }}>综合研究报告（AI辅助生成）</h3>
                <p className="text-xs mt-0.5" style={{ color: '#86909C' }}>草稿报告 · 已融合主观量表、EEG、EDA、面部情绪四维数据</p>
              </div>
              <div className="flex gap-2">
                <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs border transition-colors hover:bg-gray-50" style={{ borderColor: '#E5E6EB', color: '#4E5969' }}>
                  <RefreshCw size={11} />重新生成
                </button>
                <button onClick={() => navigator.clipboard?.writeText(conclusion)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs border transition-colors hover:bg-gray-50" style={{ borderColor: '#E5E6EB', color: '#4E5969' }}>
                  <Copy size={11} />复制
                </button>
              </div>
            </div>
            <textarea value={conclusion} onChange={e => setConclusion(e.target.value)} rows={16}
              className="w-full rounded-xl px-4 py-3 text-sm leading-relaxed outline-none resize-none"
              style={{ border: '1px solid #E5E6EB', color: '#1D2129', background: '#FAFAFA' }} />
          </div>

          <div className="p-4 rounded-xl border" style={{ background: '#FAFAFA', borderColor: '#E5E6EB' }}>
            <h3 className="text-sm mb-3" style={{ fontWeight: 600, color: '#1D2129' }}>报告导出与协作</h3>
            <div className="flex flex-wrap gap-3">
              <button className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm text-white shadow-sm" style={{ background: '#3370FF', fontWeight: 500 }}>
                <Download size={14} /> 导出完整报告（PDF）
              </button>
              <button onClick={() => setSaved(true)} className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm"
                style={saved ? { background: '#E8F7EA', color: '#00B42A', border: '1px solid #B7EB8F' } : { border: '1px solid #E5E6EB', color: '#4E5969', background: 'white' }}>
                {saved ? <><CheckCircle size={14} />已保存至数据库</> : <><BarChart2 size={14} />保存至数据库</>}
              </button>
              <button className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm"
                style={{ border: '1px solid #BFD0FF', background: '#EEF3FF', color: '#3370FF', fontWeight: 500 }}>
                <Send size={14} /> 同步给设计团队
              </button>
              <button className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm"
                style={{ border: '1px solid #E5E6EB', color: '#4E5969', background: 'white' }}>
                <Download size={14} /> 导出数据集（CSV/SPSS）
              </button>
            </div>
            {saved && <p className="text-xs mt-3" style={{ color: '#00B42A' }}>研究结论已归档，ID设计师与UX设计师将在工作台收到通知。</p>}
          </div>
        </div>
      )}

      <div className="flex items-center justify-between pt-4 border-t" style={{ borderColor: '#E5E6EB' }}>
        <button onClick={() => navigate(`/tob/he/projects/${id}/run/collect`)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm"
          style={{ border: '1px solid #E5E6EB', color: '#4E5969', background: 'white' }}>
          <ArrowLeft size={15} /> 上一步
        </button>
        <button onClick={() => {
          dispatch({ type: 'UPDATE_HE_PROJECT', payload: { id: id!, updates: { status: 'completed', progress: 100 } } });
          navigate(`/tob/he/projects/${id}`);
        }}
          className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm text-white shadow-sm"
          style={{ background: '#00B42A', fontWeight: 500 }}>
          <CheckCircle size={15} /> 完成实验，归档项目
        </button>
      </div>
    </div>
  );
}