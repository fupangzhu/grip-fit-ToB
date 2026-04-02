import { useState } from 'react';
import { useNavigate } from 'react-router';
import { Ruler, TestTube, ArrowRight, Bell, FileText, Target, Layers, ChevronDown, ChevronUp, Maximize2, Crosshair, Scale, Hand } from 'lucide-react';
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer } from 'recharts';

/* ── Color tokens ── green-only + red for error ── */
const C = {
  // text hierarchy (neutral)
  t1: '#1D2129',   // title
  t2: '#4E5969',   // body
  t3: '#86909C',   // secondary
  t4: '#C9CDD4',   // caption / disabled
  // surface
  bg: '#F7F8FA',
  card: '#FFFFFF',
  divider: '#F2F3F5',
  border: '#E5E6EB',
  // green
  g: '#00B42A',
  gDark: '#009A29',
  gBg: '#E8F7EA',
  gBg2: '#F6FFED',
  gBorder: '#B7EB8F',
  g40: 'rgba(0,180,42,0.40)',
  g15: 'rgba(0,180,42,0.15)',
  g08: 'rgba(0,180,42,0.08)',
  // red (error only)
  r: '#F53F3F',
  rBg: '#FFF1F0',
};

/* ── Data ── */
const notifications = [
  { id: 1, from: '张研究员（人因工程师）', msg: '「X Ultra 振动感知量化实验」研究结论已同步，含 EEG 与 EDA 多模态分析结果', time: '1小时前', isNew: true },
  { id: 2, from: '系统通知', msg: '「旗舰机握持舒适度研究」数据分析完成，设计建议已生成', time: '3小时前', isNew: true },
  { id: 3, from: '张研究员', msg: '「Lite S6 形态适配研究」完整报告已归档，建议查阅', time: '昨天', isNew: false },
];

const designParams = [
  { param: '机身宽度', current: 76, recommended: '≤71', unit: 'mm', status: 'bad' as const, impact: '每 +1mm，舒适度 -0.31 分（p<0.001）', suggestion: '收窄 5mm，预计提升舒适度约 +1.5 分' },
  { param: '机身高度', current: 163, recommended: '≤158', unit: 'mm', status: 'bad' as const, impact: '高度过大导致拇指可达性评分偏低（M=4.8/9）', suggestion: '降低 3–5mm 改善顶部触达性' },
  { param: '机身厚度', current: 7.8, recommended: '7.2–8.0', unit: 'mm', status: 'good' as const, impact: '当前厚度处于舒适区间内', suggestion: '维持当前设计' },
  { param: '整机重量', current: 195, recommended: '175–185', unit: 'g', status: 'warn' as const, impact: '重量感知评分 M=6.5，稍偏重', suggestion: '建议目标 ≤185g，减重约 10g' },
  { param: '圆角 R 值', current: 10, recommended: '12–14', unit: 'mm', status: 'warn' as const, impact: '当前圆角偏小，握持边缘锐利感较强', suggestion: '增大至 R12–R14，改善握持舒适' },
  { param: '侧边弧度', current: '平直', recommended: '轻微内凹', unit: '', status: 'bad' as const, impact: '平直侧面握持稳定性评分较低', suggestion: '增加 0.3–0.5mm 内凹弧度提升稳定感' },
];

const radarData = [
  { dim: '握持舒适', score: 69, target: 85 },
  { dim: '单手操控', score: 64, target: 80 },
  { dim: '拇指触达', score: 53, target: 78 },
  { dim: '握持稳定', score: 79, target: 85 },
  { dim: '重量感知', score: 72, target: 82 },
  { dim: '圆角体验', score: 61, target: 80 },
];

const handTypeData = [
  { type: '小手', range: 'P5–P25', coverage: 23, comfort: 5.4 },
  { type: '中手', range: 'P25–P75', coverage: 52, comfort: 6.5 },
  { type: '大手', range: 'P75–P95', coverage: 21, comfort: 7.2 },
  { type: '超大手', range: 'P95+', coverage: 4, comfort: 6.8 },
];

const DESIGN_PRINCIPLES = [
  { icon: Maximize2, title: '以手型覆盖率为基准', desc: '优先覆盖 P25–P75 主力手型（52%），兼顾 P5–P95（96% 用户）' },
  { icon: Crosshair, title: '优化拇指可达区域', desc: '屏幕顶部 18% 为困难触达区，UI 元素应远离该区域' },
  { icon: Scale, title: '重量中心前移', desc: '相机模组集中上部时，重心前移可改善单手握持平衡感' },
  { icon: Hand, title: '侧边材质与纹理', desc: '哑光 / 微磨砂表面握持稳定性比抛光高 +0.8 分（p=0.023）' },
];

/* ── Status helpers ── */
type Status = 'good' | 'warn' | 'bad';
const STATUS_MAP: Record<Status, { symbol: string; color: string; bg: string }> = {
  good: { symbol: '✓', color: C.g, bg: C.gBg },
  warn: { symbol: '⚠', color: C.g40, bg: C.g08 },
  bad:  { symbol: '✗', color: C.r, bg: C.rBg },
};

/* ── Section header component ── */
function SectionHead({ icon: Icon, title, right }: { icon: typeof Target; title: string; right?: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between px-5 py-3 border-b" style={{ borderColor: C.divider }}>
      <div className="flex items-center gap-2">
        <Icon size={14} style={{ color: C.g }} />
        <span style={{ fontSize: 13, fontWeight: 600, color: C.t1 }}>{title}</span>
      </div>
      {right}
    </div>
  );
}

/* ── Main ── */
export function IDDashboard() {
  const navigate = useNavigate();
  const [expandedParam, setExpandedParam] = useState<string | null>(null);

  const counts = { bad: 0, warn: 0, good: 0 };
  designParams.forEach(p => counts[p.status]++);

  return (
    <div className="p-6 space-y-5" style={{ background: C.bg, minHeight: '100vh' }}>

      {/* ── Header ── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 style={{ fontSize: 18, fontWeight: 700, color: C.t1, lineHeight: 1.4 }}>ID 设计师工作台</h1>
          <p style={{ fontSize: 12, color: C.t3, marginTop: 2 }}>
            李设计师 · {new Date().toLocaleDateString('zh-CN')} · 基于最新人因研究数据
          </p>
        </div>
        <div className="flex items-center gap-5 px-4 py-2 rounded-lg" style={{ background: C.card, border: `1px solid ${C.border}` }}>
          {([['bad', '需优化', C.r], ['warn', '建议调整', C.g40], ['good', '良好', C.g]] as const).map(([key, label, color]) => (
            <div key={key} className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full" style={{ background: color }} />
              <span style={{ fontSize: 12, color: C.t3 }}>{label}</span>
              <span style={{ fontSize: 12, fontWeight: 600, color }}>{counts[key]}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Notifications ── */}
      <div className="rounded-xl overflow-hidden" style={{ background: C.card, border: `1px solid ${C.border}` }}>
        <SectionHead icon={Bell} title="最新研究通知" right={
          <span className="px-2 py-0.5 rounded" style={{ fontSize: 11, background: C.gBg, color: C.g }}>2 条未读</span>
        } />
        <div>
          {notifications.map((n, i) => (
            <div key={n.id} className="flex items-start gap-3 px-5 py-3 cursor-pointer transition-colors hover:bg-gray-50"
              style={{ background: n.isNew ? C.gBg2 : undefined, borderTop: i > 0 ? `1px solid ${C.divider}` : undefined }}>
              <div className="w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0" style={{ background: n.isNew ? C.g : 'transparent' }} />
              <div className="flex-1 min-w-0">
                <span style={{ fontSize: 11, color: C.t3 }}>{n.from}</span>
                <p style={{ fontSize: 13, color: C.t1, marginTop: 1 }}>{n.msg}</p>
              </div>
              <span className="flex-shrink-0" style={{ fontSize: 11, color: C.t4 }}>{n.time}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Main grid ── */}
      <div className="grid grid-cols-3 gap-5">
        {/* Parameter evaluation */}
        <div className="col-span-2 rounded-xl overflow-hidden" style={{ background: C.card, border: `1px solid ${C.border}` }}>
          <SectionHead icon={Target} title="设计参数评估" right={
            <span style={{ fontSize: 11, color: C.t4 }}>点击展开优化建议</span>
          } />
          <div>
            {designParams.map((p, i) => {
              const st = STATUS_MAP[p.status];
              const isOpen = expandedParam === p.param;
              return (
                <div key={p.param}>
                  <div
                    className="flex items-center px-5 py-3 cursor-pointer transition-colors hover:bg-gray-50"
                    style={{ borderTop: i > 0 ? `1px solid ${C.divider}` : undefined }}
                    onClick={() => setExpandedParam(isOpen ? null : p.param)}
                  >
                    <span className="w-20 flex-shrink-0" style={{ fontSize: 13, fontWeight: 500, color: C.t1 }}>{p.param}</span>
                    <span className="flex-shrink-0" style={{ fontSize: 13, color: C.t2 }}>
                      {p.current}<span style={{ fontSize: 11, color: C.t3, marginLeft: 1 }}>{p.unit}</span>
                    </span>
                    <span className="mx-3 flex-shrink-0" style={{ fontSize: 11, color: C.t4 }}>→</span>
                    <span className="flex-shrink-0" style={{ fontSize: 12, color: C.t3 }}>{p.recommended}{p.unit}</span>
                    <div className="flex-1" />
                    <span className="px-2 py-0.5 rounded flex-shrink-0" style={{ fontSize: 11, fontWeight: 500, color: st.color, background: st.bg }}>
                      {st.symbol} {p.status === 'good' ? '良好' : p.status === 'warn' ? '建议调整' : '需优化'}
                    </span>
                    <div className="ml-2 flex-shrink-0" style={{ color: C.t4 }}>
                      {isOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                    </div>
                  </div>
                  {isOpen && (
                    <div className="px-5 pb-4" style={{ background: C.bg }}>
                      <div className="grid grid-cols-2 gap-3 pt-3">
                        <div className="p-3 rounded-lg" style={{ background: C.card, border: `1px solid ${C.border}` }}>
                          <span style={{ fontSize: 11, fontWeight: 600, color: C.t3, display: 'block', marginBottom: 4 }}>研究依据</span>
                          <p style={{ fontSize: 12, color: C.t2, lineHeight: 1.6 }}>{p.impact}</p>
                        </div>
                        <div className="p-3 rounded-lg" style={{ background: C.gBg2, border: `1px solid ${C.gBorder}` }}>
                          <span style={{ fontSize: 11, fontWeight: 600, color: C.g, display: 'block', marginBottom: 4 }}>优化建议</span>
                          <p style={{ fontSize: 12, color: C.t2, lineHeight: 1.6 }}>{p.suggestion}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Right column */}
        <div className="space-y-5">
          {/* Radar */}
          <div className="rounded-xl p-5" style={{ background: C.card, border: `1px solid ${C.border}` }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: C.t1, display: 'block' }}>设计体验综合评分</span>
            <span style={{ fontSize: 11, color: C.t3, display: 'block', marginTop: 2, marginBottom: 12 }}>当前（实线） vs 目标（虚线）</span>
            <ResponsiveContainer width="100%" height={190}>
              <RadarChart data={radarData}>
                <PolarGrid stroke={C.divider} />
                <PolarAngleAxis dataKey="dim" tick={{ fontSize: 10, fill: C.t3 }} />
                <Radar key="radar-score" dataKey="score" stroke={C.g40} fill={C.g40} fillOpacity={0.15} strokeWidth={1.5} />
                <Radar key="radar-target" dataKey="target" stroke={C.g} fill={C.g} fillOpacity={0.06} strokeWidth={1.5} strokeDasharray="4 3" />
              </RadarChart>
            </ResponsiveContainer>
            <div className="flex gap-5 justify-center" style={{ marginTop: 4 }}>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-px" style={{ background: C.g40 }} />
                <span style={{ fontSize: 11, color: C.t3 }}>当前</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3 border-t border-dashed" style={{ borderColor: C.g }} />
                <span style={{ fontSize: 11, color: C.t3 }}>目标</span>
              </div>
            </div>
          </div>

          {/* Hand type */}
          <div className="rounded-xl p-5" style={{ background: C.card, border: `1px solid ${C.border}` }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: C.t1, display: 'block', marginBottom: 12 }}>手型覆盖 & 舒适度</span>
            <div className="space-y-3">
              {handTypeData.map(h => (
                <div key={h.type}>
                  <div className="flex items-center justify-between" style={{ marginBottom: 4 }}>
                    <span style={{ fontSize: 12, color: C.t2 }}>{h.type}<span style={{ fontSize: 11, color: C.t4, marginLeft: 4 }}>{h.range}</span></span>
                    <span style={{ fontSize: 11, color: C.t3 }}>{h.comfort}/9</span>
                  </div>
                  <div className="h-1.5 rounded-full overflow-hidden" style={{ background: C.divider }}>
                    <div className="h-full rounded-full transition-all" style={{
                      width: `${(h.comfort / 9) * 100}%`,
                      background: h.comfort >= 6.5 ? C.g : C.g40,
                    }} />
                  </div>
                  <span style={{ fontSize: 10, color: C.t4, display: 'block', marginTop: 2 }}>覆盖 {h.coverage}% 用户</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Design principles ── */}
      <div className="rounded-xl overflow-hidden" style={{ background: C.card, border: `1px solid ${C.border}` }}>
        <SectionHead icon={Layers} title="基于研究数据的 ID 设计原则" />
        <div className="grid grid-cols-4 gap-4 p-5">
          {DESIGN_PRINCIPLES.map((p, i) => (
            <div key={i} className="p-4 rounded-lg" style={{ background: C.bg }}>
              <div className="w-7 h-7 rounded-md flex items-center justify-center" style={{ background: C.gBg, marginBottom: 10 }}>
                <p.icon size={14} style={{ color: C.g }} />
              </div>
              <span style={{ fontSize: 12, fontWeight: 600, color: C.t1, display: 'block', marginBottom: 4 }}>{p.title}</span>
              <p style={{ fontSize: 11, color: C.t3, lineHeight: 1.6 }}>{p.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Quick actions ── */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { icon: FileText, label: '完整研究报告', desc: '查看人因团队已同步的全部研究数据与统计分析结果', to: '/tob/id/params' },
          { icon: Ruler, label: '设计参考工具', desc: '交互探索物理参数与舒适度的量化关系曲线', to: '/tob/id/params' },
          { icon: TestTube, label: '样机 AI 评审', desc: '导入 STEP 文件，AI 自动提取参数并生成人因评审报告', to: '/tob/id/validate' },
        ].map(card => (
          <div key={card.label} onClick={() => navigate(card.to)}
            className="p-5 rounded-xl cursor-pointer transition-all group hover:shadow-sm"
            style={{ background: C.card, border: `1px solid ${C.border}` }}>
            <div className="w-8 h-8 rounded-md flex items-center justify-center" style={{ background: C.gBg, marginBottom: 12 }}>
              <card.icon size={15} style={{ color: C.g }} />
            </div>
            <span style={{ fontSize: 13, fontWeight: 600, color: C.t1, display: 'block', marginBottom: 4 }}>{card.label}</span>
            <p style={{ fontSize: 12, color: C.t3, lineHeight: 1.6 }}>{card.desc}</p>
            <div className="mt-3 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity" style={{ fontSize: 12, color: C.g, fontWeight: 500 }}>
              进入 <ArrowRight size={12} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}