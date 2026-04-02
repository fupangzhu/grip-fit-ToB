import { useState } from 'react';
import { CheckCircle, AlertTriangle, Download, RotateCcw, Loader2, Sparkles, Smartphone, Glasses, Headphones } from 'lucide-react';
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer } from 'recharts';

const G = {
  primary: '#00B42A', dark: '#009A29',
  bg: '#E8F7EA', bgLight: '#F6FFED', border: '#B7EB8F',
  fill40: 'rgba(0,180,42,0.40)',
  red: '#F53F3F', redBg: '#FFF1F0',
};

type ProductType = 'phone' | 'glasses' | 'neckband';
type Pop = 'general' | 'student' | 'business' | 'elderly' | 'gaming';
const POP_LABELS: Record<Pop, string> = { general: '大众', student: '学生', business: '商务', elderly: '银发', gaming: '游戏' };

interface Issue { dim: string; severity: 'pass' | 'warn' | 'fail'; current: string; rec: string; detail: string }
interface Result { score: number; issues: Issue[]; radar: { dim: string; score: number; target: number }[]; summary: string; zones: { label: string; value: number; status: 'safe' | 'warn' | 'danger'; x: number; y: number }[] }

const PRODUCTS: Record<ProductType, { label: string; icon: typeof Smartphone; desc: string; demo: string; dims: string[] }> = {
  phone: { label: '智能手机', icon: Smartphone, desc: '握持舒适·压力分布', demo: 'Flagship_Bar_2026.stp', dims: ['握持舒适', '单手操控', '拇指触达', '握持稳定', '重量感知'] },
  glasses: { label: '智能眼镜', icon: Glasses, desc: '鼻梁压强·耳侧压力', demo: 'SmartGlasses_Meta.stp', dims: ['鼻梁舒适', '耳侧压力', '重量平衡', '佩戴稳定', '长时舒适'] },
  neckband: { label: '挂脖耳机', icon: Headphones, desc: '颈部压力·热舒适', demo: 'Neckband_Pro.stp', dims: ['颈部压力', '热舒适', '佩戴稳定', '重量感知', '运动适配'] },
};

function genReview(product: ProductType): Result {
  if (product === 'phone') return {
    score: 72,
    issues: [
      { dim: '宽度', severity: 'warn', current: '74.2mm', rec: '≤71mm', detail: '偏宽致单手握持吃力' },
      { dim: '高度', severity: 'pass', current: '154.1mm', rec: '153±2.7mm', detail: '容差范围内' },
      { dim: '重量', severity: 'fail', current: '198g', rec: '≤185g', detail: '超重13g，疲劳度上升' },
      { dim: '圆角', severity: 'warn', current: '11.8mm', rec: '14±1.5mm', detail: '偏小致底部锐利感' },
    ],
    radar: [{ dim: '握持舒适', score: 71, target: 85 }, { dim: '单手操控', score: 66, target: 80 }, { dim: '拇指触达', score: 58, target: 78 }, { dim: '握持稳定', score: 78, target: 85 }, { dim: '重量感知', score: 62, target: 82 }],
    summary: '宽度和重量需优化，建议收窄并减重至185g以内',
    zones: [{ label: '食指中段', value: 42, status: 'warn', x: 8, y: 40 }, { label: '拇指根部', value: 55, status: 'danger', x: 85, y: 48 }, { label: '小指支撑', value: 48, status: 'warn', x: 12, y: 78 }, { label: '底部棱角', value: 58, status: 'danger', x: 50, y: 92 }],
  };
  if (product === 'glasses') return {
    score: 68,
    issues: [
      { dim: '鼻托压强', severity: 'fail', current: '38.2kPa', rec: '≤25kPa', detail: '30min以上出现压痕' },
      { dim: '镜腿夹力', severity: 'warn', current: '3.8N', rec: '2.5–3.2N', detail: '耳侧长时间受压' },
      { dim: '重量', severity: 'warn', current: '52g', rec: '≤45g', detail: '鼻梁负担加重' },
    ],
    radar: [{ dim: '鼻梁舒适', score: 45, target: 80 }, { dim: '耳侧压力', score: 62, target: 80 }, { dim: '重量平衡', score: 58, target: 82 }, { dim: '佩戴稳定', score: 76, target: 85 }, { dim: '长时舒适', score: 52, target: 78 }],
    summary: '鼻梁压强严重超标，需优化鼻托面积并减重',
    zones: [{ label: '鼻梁中段', value: 78, status: 'danger', x: 50, y: 48 }, { label: '左耳上缘', value: 48, status: 'warn', x: 12, y: 38 }, { label: '右耳上缘', value: 46, status: 'warn', x: 88, y: 38 }],
  };
  return {
    score: 76,
    issues: [
      { dim: '颈后压力', severity: 'warn', current: '18.5kPa', rec: '≤15kPa', detail: '颈部C3-C5区域偏高' },
      { dim: '热舒适', severity: 'fail', current: '39.2°C', rec: '≤37°C', detail: '电池区温度过高' },
    ],
    radar: [{ dim: '颈部压力', score: 65, target: 82 }, { dim: '热舒适', score: 48, target: 80 }, { dim: '佩戴稳定', score: 82, target: 85 }, { dim: '重量感知', score: 85, target: 82 }, { dim: '运动适配', score: 78, target: 80 }],
    summary: '电池区热控不达标，颈后压强需优化',
    zones: [{ label: '颈后C3-C5', value: 62, status: 'warn', x: 50, y: 25 }, { label: '电池区(左)', value: 72, status: 'danger', x: 15, y: 65 }, { label: '电池区(右)', value: 70, status: 'danger', x: 85, y: 65 }],
  };
}

const sevStyle = (s: 'pass' | 'warn' | 'fail') => {
  if (s === 'pass') return { bg: G.bg, color: G.primary, label: '✓' };
  if (s === 'warn') return { bg: 'rgba(0,180,42,0.08)', color: G.fill40, label: '⚠' };
  return { bg: G.redBg, color: G.red, label: '✗' };
};

const pColor = (s: 'safe' | 'warn' | 'danger') => s === 'danger' ? G.red : s === 'warn' ? '#FF7D00' : G.primary;

function PressureMap({ zones, product }: { zones: Result['zones']; product: ProductType }) {
  const vb = product === 'phone' ? '0 0 200 280' : product === 'glasses' ? '0 0 300 200' : '0 0 300 220';
  const ar = product === 'phone' ? '3/4' : '4/3';
  return (
    <div className="relative w-full" style={{ aspectRatio: ar, background: '#FAFBFC', borderRadius: 10, overflow: 'hidden' }}>
      <svg width="100%" height="100%" viewBox={vb} style={{ position: 'absolute', inset: 0 }}>
        {product === 'phone' && <>
          <rect x="40" y="20" width="120" height="240" rx="20" fill="none" stroke="#C9CDD4" strokeWidth="1.5" />
          <rect x="46" y="32" width="108" height="216" rx="14" fill="white" stroke="#E5E6EB" strokeWidth="0.5" />
        </>}
        {product === 'glasses' && <>
          <ellipse cx="100" cy="100" rx="55" ry="45" fill="none" stroke="#C9CDD4" strokeWidth="1.5" />
          <ellipse cx="200" cy="100" rx="55" ry="45" fill="none" stroke="#C9CDD4" strokeWidth="1.5" />
          <path d="M 145 100 Q 150 88 155 100" fill="none" stroke="#C9CDD4" strokeWidth="2" />
          <line x1="45" y1="80" x2="15" y2="70" stroke="#C9CDD4" strokeWidth="2.5" strokeLinecap="round" />
          <line x1="255" y1="80" x2="285" y2="70" stroke="#C9CDD4" strokeWidth="2.5" strokeLinecap="round" />
        </>}
        {product === 'neckband' && <>
          <path d="M 45 130 Q 50 60 150 45 Q 250 60 255 130" fill="none" stroke="#C9CDD4" strokeWidth="5" strokeLinecap="round" />
          <circle cx="42" cy="140" r="14" fill="#E5E6EB" stroke="#C9CDD4" strokeWidth="1.5" />
          <circle cx="258" cy="140" r="14" fill="#E5E6EB" stroke="#C9CDD4" strokeWidth="1.5" />
        </>}
      </svg>
      {zones.map((z, i) => (
        <div key={i} className="absolute flex flex-col items-center" style={{ left: `${z.x}%`, top: `${z.y}%`, transform: 'translate(-50%,-50%)' }}>
          <div className="rounded-full animate-pulse flex items-center justify-center" style={{
            width: Math.max(18, z.value * 0.4), height: Math.max(18, z.value * 0.4),
            background: `${pColor(z.status)}20`, border: `2px solid ${pColor(z.status)}60`,
          }}>
            <span style={{ fontSize: 8, fontWeight: 700, color: pColor(z.status) }}>{z.value}</span>
          </div>
          <span className="mt-0.5 px-1 py-0.5 rounded whitespace-nowrap" style={{ fontSize: 8, fontWeight: 500, color: pColor(z.status), background: `${pColor(z.status)}10` }}>{z.label}</span>
        </div>
      ))}
    </div>
  );
}

const selBtn = (active: boolean): React.CSSProperties => active
  ? { background: G.bg, color: G.primary, fontWeight: 600, border: `1.5px solid ${G.border}` }
  : { border: '1px solid #E5E6EB', color: '#4E5969' };

export function IDValidate() {
  const [productType, setProductType] = useState<ProductType>('phone');
  const [population, setPopulation] = useState<Pop>('general');
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<Result | null>(null);

  const product = PRODUCTS[productType];

  function handleReview() {
    setAnalyzing(true);
    setTimeout(() => { setResult(genReview(productType)); setAnalyzing(false); }, 2000);
  }

  return (
    <div className="px-4 py-4 space-y-4">
      <div>
        <h1 style={{ fontSize: 16, fontWeight: 700, color: '#1D2129' }}>样机 AI 评审</h1>
        <p style={{ fontSize: 11, color: '#86909C', marginTop: 2 }}>选择产品 → 发起评审 → 查看报告</p>
      </div>

      {!result && !analyzing && (
        <>
          {/* Product type */}
          <div className="space-y-2">
            {(Object.keys(PRODUCTS) as ProductType[]).map(type => {
              const p = PRODUCTS[type];
              const active = productType === type;
              return (
                <button key={type} onClick={() => { setProductType(type); setResult(null); }}
                  className="w-full flex items-center gap-3 p-3 rounded-xl text-left transition-all"
                  style={active ? { background: G.bg, border: `1.5px solid ${G.border}` } : { background: 'white', border: '1px solid #E5E6EB' }}>
                  <div className="w-9 h-9 rounded-lg flex items-center justify-center"
                    style={{ background: active ? G.primary : '#F2F3F5' }}>
                    <p.icon size={16} style={{ color: active ? 'white' : '#86909C' }} />
                  </div>
                  <div>
                    <span style={{ fontSize: 13, fontWeight: active ? 600 : 400, color: active ? G.primary : '#1D2129' }}>{p.label}</span>
                    <p style={{ fontSize: 10, color: '#86909C', marginTop: 1 }}>{p.desc}</p>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Demo model */}
          <div className="flex items-center gap-2 p-3 rounded-xl" style={{ background: G.bgLight, border: `1px solid ${G.border}` }}>
            <product.icon size={14} style={{ color: G.primary }} />
            <div>
              <span style={{ fontSize: 11, fontWeight: 500, color: '#1D2129' }}>{product.demo}</span>
              <p style={{ fontSize: 10, color: '#86909C' }}>Demo 模型</p>
            </div>
          </div>

          {/* Population */}
          <div>
            <span style={{ fontSize: 12, fontWeight: 600, color: '#1D2129', display: 'block', marginBottom: 8 }}>目标人群</span>
            <div className="grid grid-cols-5 gap-1.5">
              {(Object.keys(POP_LABELS) as Pop[]).map(p => (
                <button key={p} onClick={() => setPopulation(p)}
                  className="py-2 rounded-lg transition-all" style={{ ...selBtn(population === p), fontSize: 11 }}>
                  {POP_LABELS[p]}
                </button>
              ))}
            </div>
          </div>

          <button onClick={handleReview}
            className="w-full py-3 rounded-xl flex items-center justify-center gap-2 text-white"
            style={{ background: G.primary, fontSize: 13, fontWeight: 600 }}>
            <Sparkles size={15} /> 发起 AI 评审
          </button>
        </>
      )}

      {analyzing && (
        <div className="flex flex-col items-center justify-center py-16 bg-white rounded-xl" style={{ border: '1px solid #E5E6EB' }}>
          <Loader2 size={32} className="animate-spin mb-3" style={{ color: G.primary }} />
          <p style={{ fontSize: 12, color: '#4E5969' }}>AI 正在评审 {product.label}...</p>
        </div>
      )}

      {result && !analyzing && (
        <>
          {/* Score */}
          <div className="rounded-xl p-4 text-white" style={{ background: result.score >= 85 ? G.primary : result.score >= 70 ? G.dark : G.red }}>
            <p style={{ fontSize: 11, opacity: 0.8 }}>{product.label} · AI 评审</p>
            <div style={{ fontSize: 36, fontWeight: 700, marginTop: 4 }}>
              {result.score}<span style={{ fontSize: 16 }}>分</span>
            </div>
            <p style={{ fontSize: 11, opacity: 0.8, marginTop: 4 }}>{result.summary}</p>
          </div>

          {/* Pressure map */}
          <div className="bg-white rounded-xl p-3" style={{ border: '1px solid #E5E6EB' }}>
            <div className="flex items-center justify-between mb-2">
              <span style={{ fontSize: 12, fontWeight: 600, color: '#1D2129' }}>压力分布</span>
              <div className="flex gap-2">
                {[{ l: '安全', c: G.primary }, { l: '注意', c: '#FF7D00' }, { l: '过高', c: G.red }].map(x => (
                  <div key={x.l} className="flex items-center gap-1">
                    <div className="w-1.5 h-1.5 rounded-full" style={{ background: x.c }} />
                    <span style={{ fontSize: 9, color: '#86909C' }}>{x.l}</span>
                  </div>
                ))}
              </div>
            </div>
            <PressureMap zones={result.zones} product={productType} />
          </div>

          {/* Radar */}
          <div className="bg-white rounded-xl p-3" style={{ border: '1px solid #E5E6EB' }}>
            <span style={{ fontSize: 12, fontWeight: 600, color: '#1D2129', display: 'block', marginBottom: 4 }}>维度评估</span>
            <ResponsiveContainer width="100%" height={180}>
              <RadarChart data={result.radar}>
                <PolarGrid stroke="#F2F3F5" />
                <PolarAngleAxis dataKey="dim" tick={{ fontSize: 9, fill: '#86909C' }} />
                <Radar key="radar-score" dataKey="score" stroke={G.fill40} fill={G.fill40} fillOpacity={0.2} strokeWidth={2} />
                <Radar key="radar-target" dataKey="target" stroke={G.primary} fill={G.primary} fillOpacity={0.08} strokeWidth={1.5} strokeDasharray="4 2" />
              </RadarChart>
            </ResponsiveContainer>
          </div>

          {/* Issues */}
          <div className="rounded-xl overflow-hidden" style={{ border: '1px solid #E5E6EB' }}>
            <div className="px-3 py-2.5 border-b" style={{ borderColor: '#F2F3F5', background: 'white' }}>
              <span style={{ fontSize: 12, fontWeight: 600, color: '#1D2129' }}>评审详情</span>
            </div>
            {result.issues.map((issue, i) => {
              const st = sevStyle(issue.severity);
              return (
                <div key={issue.dim} className="px-3 py-3 bg-white"
                  style={{ borderTop: i > 0 ? '1px solid #F2F3F5' : undefined, background: issue.severity === 'fail' ? G.redBg : 'white' }}>
                  <div className="flex items-center gap-2 mb-1">
                    <span style={{ fontSize: 12, fontWeight: 600, color: '#1D2129' }}>{issue.dim}</span>
                    <span className="px-1.5 py-0.5 rounded" style={{ fontSize: 10, fontWeight: 500, color: st.color, background: st.bg }}>{st.label}</span>
                  </div>
                  <div className="flex items-center gap-2 mb-1">
                    <span style={{ fontSize: 12, fontWeight: 600, color: st.color }}>{issue.current}</span>
                    <span style={{ fontSize: 10, color: '#C9CDD4' }}>→</span>
                    <span style={{ fontSize: 11, color: '#86909C' }}>{issue.rec}</span>
                  </div>
                  <p style={{ fontSize: 11, color: '#4E5969' }}>{issue.detail}</p>
                </div>
              );
            })}
          </div>

          {/* Actions */}
          <div className="space-y-2">
            <button className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-white"
              style={{ background: G.primary, fontSize: 13, fontWeight: 600 }}>
              <Download size={14} /> 导出报告
            </button>
            <button onClick={() => { setResult(null); }}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl"
              style={{ border: '1px solid #E5E6EB', color: '#4E5969', fontSize: 13 }}>
              <RotateCcw size={14} /> 重新评审
            </button>
          </div>
        </>
      )}
    </div>
  );
}
