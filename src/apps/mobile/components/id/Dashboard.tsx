import { useState } from 'react';
import { useNavigate } from 'react-router';
import { Ruler, TestTube, ArrowRight, Bell, Target, ChevronDown, ChevronUp } from 'lucide-react';
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer } from 'recharts';

const C = {
  t1: '#1D2129', t2: '#4E5969', t3: '#86909C', t4: '#C9CDD4',
  bg: '#F7F8FA', card: '#FFFFFF', divider: '#F2F3F5', border: '#E5E6EB',
  g: '#00B42A', gBg: '#E8F7EA', gBg2: '#F6FFED', gBorder: '#B7EB8F',
  g40: 'rgba(0,180,42,0.40)', r: '#F53F3F', rBg: '#FFF1F0',
};

const notifications = [
  { id: 1, msg: '振动感知量化实验结论已同步', time: '1h前', isNew: true },
  { id: 2, msg: '握持舒适度数据分析完成', time: '3h前', isNew: true },
  { id: 3, msg: 'Lite S6 形态适配报告已归档', time: '昨天', isNew: false },
];

const designParams = [
  { param: '机身宽度', current: '76mm', rec: '≤71mm', status: 'bad' as const, tip: '每+1mm 舒适度-0.31分，建议收窄5mm' },
  { param: '机身高度', current: '163mm', rec: '≤158mm', status: 'bad' as const, tip: '高度过大致拇指可达性偏低' },
  { param: '机身厚度', current: '7.8mm', rec: '7.2–8.0mm', status: 'good' as const, tip: '处于舒适区间，维持当前设计' },
  { param: '整机重量', current: '195g', rec: '175–185g', status: 'warn' as const, tip: '稍偏重，建议减重约10g' },
  { param: '圆角R值', current: '10mm', rec: '12–14mm', status: 'warn' as const, tip: '偏小致握持锐利感，建议增大' },
  { param: '侧边弧度', current: '平直', rec: '轻微内凹', status: 'bad' as const, tip: '增加0.3–0.5mm内凹弧度' },
];

const radarData = [
  { dim: '握持舒适', score: 69, target: 85 },
  { dim: '单手操控', score: 64, target: 80 },
  { dim: '拇指触达', score: 53, target: 78 },
  { dim: '握持稳定', score: 79, target: 85 },
  { dim: '重量感知', score: 72, target: 82 },
  { dim: '圆角体验', score: 61, target: 80 },
];

const STATUS = {
  good: { sym: '✓', color: C.g, bg: C.gBg },
  warn: { sym: '⚠', color: C.g40, bg: 'rgba(0,180,42,0.08)' },
  bad: { sym: '✗', color: C.r, bg: C.rBg },
};

export function IDDashboard() {
  const navigate = useNavigate();
  const [expanded, setExpanded] = useState<string | null>(null);

  const counts = { bad: 0, warn: 0, good: 0 };
  designParams.forEach(p => counts[p.status]++);

  return (
    <div className="px-4 py-4 space-y-4" style={{ background: C.bg }}>
      {/* Header */}
      <div>
        <h1 style={{ fontSize: 16, fontWeight: 700, color: C.t1 }}>ID 设计师工作台</h1>
        <p style={{ fontSize: 11, color: C.t3, marginTop: 2 }}>基于最新人因研究数据</p>
      </div>

      {/* Status summary */}
      <div className="flex gap-4 px-3 py-2.5 rounded-xl" style={{ background: C.card, border: `1px solid ${C.border}` }}>
        {([['bad', '需优化', C.r], ['warn', '调整', C.g40], ['good', '良好', C.g]] as const).map(([key, label, color]) => (
          <div key={key} className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full" style={{ background: color }} />
            <span style={{ fontSize: 11, color: C.t3 }}>{label}</span>
            <span style={{ fontSize: 12, fontWeight: 600, color }}>{counts[key]}</span>
          </div>
        ))}
      </div>

      {/* Notifications */}
      <div className="rounded-xl overflow-hidden" style={{ background: C.card, border: `1px solid ${C.border}` }}>
        <div className="flex items-center justify-between px-3 py-2.5 border-b" style={{ borderColor: C.divider }}>
          <div className="flex items-center gap-1.5">
            <Bell size={12} style={{ color: C.g }} />
            <span style={{ fontSize: 12, fontWeight: 600, color: C.t1 }}>研究通知</span>
          </div>
          <span className="px-1.5 py-0.5 rounded" style={{ fontSize: 10, background: C.gBg, color: C.g }}>2 条</span>
        </div>
        {notifications.map((n, i) => (
          <div key={n.id} className="flex items-start gap-2 px-3 py-2.5"
            style={{ background: n.isNew ? C.gBg2 : undefined, borderTop: i > 0 ? `1px solid ${C.divider}` : undefined }}>
            {n.isNew && <div className="w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0" style={{ background: C.g }} />}
            <p className="flex-1" style={{ fontSize: 12, color: C.t1 }}>{n.msg}</p>
            <span className="flex-shrink-0" style={{ fontSize: 10, color: C.t4 }}>{n.time}</span>
          </div>
        ))}
      </div>

      {/* Parameters */}
      <div className="rounded-xl overflow-hidden" style={{ background: C.card, border: `1px solid ${C.border}` }}>
        <div className="flex items-center gap-1.5 px-3 py-2.5 border-b" style={{ borderColor: C.divider }}>
          <Target size={12} style={{ color: C.g }} />
          <span style={{ fontSize: 12, fontWeight: 600, color: C.t1 }}>设计参数评估</span>
        </div>
        {designParams.map((p, i) => {
          const st = STATUS[p.status];
          const isOpen = expanded === p.param;
          return (
            <div key={p.param}>
              <div onClick={() => setExpanded(isOpen ? null : p.param)}
                className="flex items-center px-3 py-2.5 active:bg-gray-50"
                style={{ borderTop: i > 0 ? `1px solid ${C.divider}` : undefined }}>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span style={{ fontSize: 12, fontWeight: 500, color: C.t1 }}>{p.param}</span>
                    <span className="px-1.5 py-0.5 rounded" style={{ fontSize: 10, fontWeight: 500, color: st.color, background: st.bg }}>
                      {st.sym}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <span style={{ fontSize: 11, color: C.t2 }}>{p.current}</span>
                    <span style={{ fontSize: 10, color: C.t4 }}>→</span>
                    <span style={{ fontSize: 11, color: C.t3 }}>{p.rec}</span>
                  </div>
                </div>
                <div style={{ color: C.t4 }}>{isOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}</div>
              </div>
              {isOpen && (
                <div className="px-3 pb-3">
                  <div className="p-2.5 rounded-lg" style={{ background: C.gBg2, border: `1px solid ${C.gBorder}` }}>
                    <p style={{ fontSize: 11, color: C.t2, lineHeight: 1.6 }}>{p.tip}</p>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Radar chart */}
      <div className="rounded-xl p-4" style={{ background: C.card, border: `1px solid ${C.border}` }}>
        <span style={{ fontSize: 12, fontWeight: 600, color: C.t1, display: 'block', marginBottom: 8 }}>设计体验评分</span>
        <ResponsiveContainer width="100%" height={200}>
          <RadarChart data={radarData}>
            <PolarGrid stroke={C.divider} />
            <PolarAngleAxis dataKey="dim" tick={{ fontSize: 9, fill: C.t3 }} />
            <Radar key="radar-score" dataKey="score" stroke={C.g40} fill={C.g40} fillOpacity={0.15} strokeWidth={1.5} />
            <Radar key="radar-target" dataKey="target" stroke={C.g} fill={C.g} fillOpacity={0.06} strokeWidth={1.5} strokeDasharray="4 3" />
          </RadarChart>
        </ResponsiveContainer>
        <div className="flex gap-4 justify-center">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-px" style={{ background: C.g40 }} />
            <span style={{ fontSize: 10, color: C.t3 }}>当前</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 border-t border-dashed" style={{ borderColor: C.g }} />
            <span style={{ fontSize: 10, color: C.t3 }}>目标</span>
          </div>
        </div>
      </div>

      {/* Quick actions */}
      <div className="space-y-2">
        {[
          { icon: Ruler, label: '设计参考工具', desc: '参数与舒适度的量化关系', to: '/tob/id/params' },
          { icon: TestTube, label: '样机 AI 评审', desc: 'AI 自动提取参数生成评审报告', to: '/tob/id/validate' },
        ].map(card => (
          <div key={card.label} onClick={() => navigate(card.to)}
            className="flex items-center gap-3 p-3 rounded-xl active:bg-gray-50"
            style={{ background: C.card, border: `1px solid ${C.border}` }}>
            <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: C.gBg }}>
              <card.icon size={16} style={{ color: C.g }} />
            </div>
            <div className="flex-1">
              <span style={{ fontSize: 13, fontWeight: 600, color: C.t1 }}>{card.label}</span>
              <p style={{ fontSize: 10, color: C.t3, marginTop: 1 }}>{card.desc}</p>
            </div>
            <ArrowRight size={14} style={{ color: C.t4 }} />
          </div>
        ))}
      </div>
    </div>
  );
}
