import { useState } from 'react';
import { Positioning, FormFactor, calcParameters, POSITIONING_LABELS, FORM_FACTOR_LABELS } from '../../store';
import { CheckCircle, AlertTriangle, Download, RotateCcw, Loader2, Users, Sparkles, Smartphone, Glasses, Headphones } from 'lucide-react';
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer } from 'recharts';

const G = {
  primary: '#00B42A', dark: '#009A29', text: '#00B42A',
  bg: '#E8F7EA', bgLight: '#F6FFED', border: '#B7EB8F',
  fill10: 'rgba(0,180,42,0.10)', fill20: 'rgba(0,180,42,0.20)',
  fill40: 'rgba(0,180,42,0.40)', fill60: 'rgba(0,180,42,0.60)',
  red: '#F53F3F', redBg: '#FFF1F0', redBorder: '#FFCCC7',
};

type ProductType = 'phone' | 'glasses' | 'neckband';
type PopulationCategory = 'general' | 'student' | 'business' | 'elderly' | 'gaming';
const POP_LABELS: Record<PopulationCategory, string> = { general: '大众用户', student: '学生群体', business: '商务人群', elderly: '银发人群', gaming: '游戏玩家' };

interface ReviewIssue {
  dimension: string;
  severity: 'pass' | 'warn' | 'fail';
  current: string;
  recommended: string;
  detail: string;
  zone?: string; // body zone for pressure map
}

interface ReviewResult {
  score: number;
  issues: ReviewIssue[];
  radarData: { dim: string; score: number; target: number }[];
  summary: string;
  pressureZones: { label: string; value: number; status: 'safe' | 'warn' | 'danger'; x: number; y: number }[];
}

/* ── Product definitions ── */
const PRODUCTS: Record<ProductType, {
  label: string; icon: typeof Smartphone; desc: string;
  demoModel: string; dimensions: string[];
}> = {
  phone: {
    label: '智能手机', icon: Smartphone,
    desc: '评估握持舒适度、压力分布、拇指可达性',
    demoModel: 'Flagship_Bar_2026.stp',
    dimensions: ['握持舒适', '单手操控', '拇指触达', '握持稳定', '重量感知'],
  },
  glasses: {
    label: '智能眼镜', icon: Glasses,
    desc: '评估鼻梁压强、耳侧压力、重量分布',
    demoModel: 'SmartGlasses_RayBan_Meta.stp',
    dimensions: ['鼻梁舒适', '耳侧压力', '重量平衡', '佩戴稳定', '长时舒适'],
  },
  neckband: {
    label: '挂脖耳机', icon: Headphones,
    desc: '评估颈部压力、热舒适度、佩戴稳定性',
    demoModel: 'Neckband_Pro_2026.stp',
    dimensions: ['颈部压力', '热舒适', '佩戴稳定', '重量感知', '运动适配'],
  },
};

/* ── Generate mock review for each product type ── */
function generateReview(product: ProductType, pop: PopulationCategory): ReviewResult {
  if (product === 'phone') {
    const issues: ReviewIssue[] = [
      { dimension: '宽度', severity: 'warn', current: '74.2 mm', recommended: '71.0 mm（±1.5）', detail: '偏宽 3.2mm，中小手型用户单手握持略感吃力', zone: '侧面握持区' },
      { dimension: '高度', severity: 'pass', current: '154.1 mm', recommended: '153.0 mm（±2.7）', detail: '在容差范围内', zone: '顶部触达区' },
      { dimension: '厚度', severity: 'pass', current: '7.4 mm', recommended: '7.2 mm（±0.3）', detail: '在容差范围内', zone: '背部贴合面' },
      { dimension: '重量', severity: 'fail', current: '198 g', recommended: '185 g（±7.5）', detail: '超重 13g，长时间单手持握疲劳度显著上升', zone: '整体重心' },
      { dimension: '圆角', severity: 'warn', current: '11.8 mm', recommended: '14.0 mm（±1.5）', detail: '圆角偏小，底部握持边缘锐利感评分偏低', zone: '四角过渡区' },
    ];
    return {
      score: 72,
      issues,
      radarData: [
        { dim: '握持舒适', score: 71, target: 85 }, { dim: '单手操控', score: 66, target: 80 },
        { dim: '拇指触达', score: 58, target: 78 }, { dim: '握持稳定', score: 78, target: 85 },
        { dim: '重量感知', score: 62, target: 82 },
      ],
      summary: `样机基本可用，但宽度和重量需针对${POP_LABELS[pop]}进行优化，建议收窄机身并减重至 185g 以内。`,
      pressureZones: [
        { label: '食指中段', value: 42, status: 'warn', x: 8, y: 40 },
        { label: '掌心接触', value: 28, status: 'safe', x: 15, y: 55 },
        { label: '拇指根部', value: 55, status: 'danger', x: 85, y: 48 },
        { label: '小指支撑', value: 48, status: 'warn', x: 12, y: 78 },
        { label: '虎口区域', value: 35, status: 'safe', x: 20, y: 35 },
        { label: '底部棱角', value: 58, status: 'danger', x: 50, y: 92 },
      ],
    };
  }
  if (product === 'glasses') {
    return {
      score: 68,
      issues: [
        { dimension: '鼻托压强', severity: 'fail', current: '38.2 kPa', recommended: '≤25 kPa', detail: '鼻梁压强过高，30分钟以上佩戴出现明显压痕', zone: '鼻梁中段' },
        { dimension: '镜腿夹持力', severity: 'warn', current: '3.8 N', recommended: '2.5–3.2 N', detail: '耳侧夹持力偏大，耳廓上缘长时间受压', zone: '耳侧' },
        { dimension: '整机重量', severity: 'warn', current: '52 g', recommended: '≤45 g', detail: '超出舒适阈值 7g，鼻梁负担加重', zone: '重心分布' },
        { dimension: '镜腿宽度', severity: 'pass', current: '142 mm', recommended: '140–148 mm', detail: '适配 P25–P75 头围', zone: '颞部' },
        { dimension: '前倾角', severity: 'pass', current: '8°', recommended: '6–10°', detail: '视野下沿对齐良好', zone: '鼻托角度' },
      ],
      radarData: [
        { dim: '鼻梁舒适', score: 45, target: 80 }, { dim: '耳侧压力', score: 62, target: 80 },
        { dim: '重量平衡', score: 58, target: 82 }, { dim: '佩戴稳定', score: 76, target: 85 },
        { dim: '长时舒适', score: 52, target: 78 },
      ],
      summary: `鼻梁压强严重超标（38.2 kPa > 25 kPa），是最核心的体验瓶颈。建议优化鼻托接触面积并减重至 45g 以下。`,
      pressureZones: [
        { label: '鼻梁中段', value: 78, status: 'danger', x: 50, y: 48 },
        { label: '鼻翼两侧', value: 52, status: 'warn', x: 38, y: 55 },
        { label: '左耳上缘', value: 48, status: 'warn', x: 12, y: 38 },
        { label: '右耳上缘', value: 46, status: 'warn', x: 88, y: 38 },
        { label: '颞部左', value: 32, status: 'safe', x: 15, y: 30 },
        { label: '颞部右', value: 30, status: 'safe', x: 85, y: 30 },
      ],
    };
  }
  // neckband
  return {
    score: 76,
    issues: [
      { dimension: '颈后压力', severity: 'warn', current: '18.5 kPa', recommended: '≤15 kPa', detail: '颈部 C3-C5 椎体区域局部压强偏高', zone: '颈后中段' },
      { dimension: '肩部接触', severity: 'pass', current: '8.2 kPa', recommended: '≤12 kPa', detail: '肩部压力分布均匀', zone: '肩部' },
      { dimension: '整机重量', severity: 'pass', current: '38 g', recommended: '≤42 g', detail: '重量在舒适范围内', zone: '整体' },
      { dimension: '热舒适', severity: 'fail', current: '39.2°C', recommended: '≤37°C', detail: '电池区域表面温度过高，颈部皮肤热感明显', zone: '电池区域' },
      { dimension: '弯曲适配', severity: 'pass', current: 'R85 mm', recommended: 'R80–R95 mm', detail: '弧度适配 P25–P75 颈围', zone: '整体弧度' },
    ],
    radarData: [
      { dim: '颈部压力', score: 65, target: 82 }, { dim: '热舒适', score: 48, target: 80 },
      { dim: '佩戴稳定', score: 82, target: 85 }, { dim: '重量感知', score: 85, target: 82 },
      { dim: '运动适配', score: 78, target: 80 },
    ],
    summary: `挂脖耳机整体佩戴舒适度可接受，但电池区域热控制不达标（39.2°C > 37°C），颈后局部压强需优化。`,
    pressureZones: [
      { label: '颈后 C3-C5', value: 62, status: 'warn', x: 50, y: 25 },
      { label: '左肩过渡', value: 28, status: 'safe', x: 18, y: 45 },
      { label: '右肩过渡', value: 26, status: 'safe', x: 82, y: 45 },
      { label: '电池区域(左)', value: 72, status: 'danger', x: 15, y: 65 },
      { label: '电池区域(右)', value: 70, status: 'danger', x: 85, y: 65 },
      { label: '颈侧接触', value: 35, status: 'safe', x: 32, y: 35 },
    ],
  };
}

const severityStyle = (s: 'pass' | 'warn' | 'fail') => {
  if (s === 'pass') return { bg: G.bg, color: G.primary, label: '✓ 合格' };
  if (s === 'warn') return { bg: G.fill10, color: G.fill40, label: '⚠ 建议调整' };
  return { bg: G.redBg, color: G.red, label: '✗ 不合格' };
};

const pressureColor = (status: 'safe' | 'warn' | 'danger') =>
  status === 'danger' ? G.red : status === 'warn' ? '#FF7D00' : G.primary;

/* ── Phone pressure visualization ── */
function PhonePressureView({ zones }: { zones: ReviewResult['pressureZones'] }) {
  return (
    <div className="relative w-full" style={{ aspectRatio: '3/4', background: '#FAFBFC', borderRadius: 12, overflow: 'hidden' }}>
      {/* Phone outline */}
      <svg width="100%" height="100%" viewBox="0 0 200 280" style={{ position: 'absolute', inset: 0 }}>
        <defs>
          <linearGradient id="phoneFill" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#F2F3F5" />
            <stop offset="100%" stopColor="#E5E6EB" />
          </linearGradient>
        </defs>
        <rect x="40" y="20" width="120" height="240" rx="20" ry="20" fill="url(#phoneFill)" stroke="#C9CDD4" strokeWidth="1.5" />
        {/* Screen */}
        <rect x="46" y="32" width="108" height="216" rx="14" ry="14" fill="white" stroke="#E5E6EB" strokeWidth="0.5" />
        {/* Hand silhouette hint */}
        <path d="M 30 100 Q 25 120 28 160 Q 30 200 35 220 Q 38 240 45 260"
          fill="none" stroke="rgba(0,180,42,0.15)" strokeWidth="8" strokeLinecap="round" />
        <path d="M 170 100 Q 175 120 172 160 Q 170 200 165 220 Q 162 240 155 260"
          fill="none" stroke="rgba(0,180,42,0.15)" strokeWidth="8" strokeLinecap="round" />
      </svg>
      {/* Pressure points */}
      {zones.map((z, i) => (
        <div key={i} className="absolute flex flex-col items-center" style={{ left: `${z.x}%`, top: `${z.y}%`, transform: 'translate(-50%, -50%)' }}>
          <div className="relative">
            <div className="rounded-full animate-pulse" style={{
              width: Math.max(20, z.value * 0.5),
              height: Math.max(20, z.value * 0.5),
              background: `${pressureColor(z.status)}20`,
              border: `2px solid ${pressureColor(z.status)}60`,
            }} />
            <div className="absolute inset-0 flex items-center justify-center" style={{ fontSize: 9, fontWeight: 700, color: pressureColor(z.status) }}>
              {z.value}
            </div>
          </div>
          <span className="mt-1 px-1.5 py-0.5 rounded whitespace-nowrap" style={{
            fontSize: 9, fontWeight: 500, color: pressureColor(z.status),
            background: `${pressureColor(z.status)}10`,
          }}>{z.label}</span>
        </div>
      ))}
    </div>
  );
}

/* ── Glasses pressure visualization ── */
function GlassesPressureView({ zones }: { zones: ReviewResult['pressureZones'] }) {
  return (
    <div className="relative w-full" style={{ aspectRatio: '4/3', background: '#FAFBFC', borderRadius: 12, overflow: 'hidden' }}>
      <svg width="100%" height="100%" viewBox="0 0 300 200" style={{ position: 'absolute', inset: 0 }}>
        {/* Glasses outline */}
        <ellipse cx="100" cy="100" rx="55" ry="45" fill="none" stroke="#C9CDD4" strokeWidth="1.5" />
        <ellipse cx="200" cy="100" rx="55" ry="45" fill="none" stroke="#C9CDD4" strokeWidth="1.5" />
        {/* Bridge */}
        <path d="M 145 100 Q 150 88 155 100" fill="none" stroke="#C9CDD4" strokeWidth="2" />
        {/* Temples */}
        <line x1="45" y1="80" x2="15" y2="70" stroke="#C9CDD4" strokeWidth="2.5" strokeLinecap="round" />
        <line x1="255" y1="80" x2="285" y2="70" stroke="#C9CDD4" strokeWidth="2.5" strokeLinecap="round" />
        {/* Nose pads */}
        <ellipse cx="140" cy="115" rx="6" ry="4" fill="#E5E6EB" stroke="#C9CDD4" strokeWidth="0.8" />
        <ellipse cx="160" cy="115" rx="6" ry="4" fill="#E5E6EB" stroke="#C9CDD4" strokeWidth="0.8" />
        {/* Face outline hint */}
        <ellipse cx="150" cy="110" rx="90" ry="75" fill="none" stroke="rgba(0,180,42,0.08)" strokeWidth="1" strokeDasharray="6 4" />
      </svg>
      {zones.map((z, i) => (
        <div key={i} className="absolute flex flex-col items-center" style={{ left: `${z.x}%`, top: `${z.y}%`, transform: 'translate(-50%, -50%)' }}>
          <div className="relative">
            <div className="rounded-full animate-pulse" style={{
              width: Math.max(18, z.value * 0.45),
              height: Math.max(18, z.value * 0.45),
              background: `${pressureColor(z.status)}20`,
              border: `2px solid ${pressureColor(z.status)}60`,
            }} />
            <div className="absolute inset-0 flex items-center justify-center" style={{ fontSize: 9, fontWeight: 700, color: pressureColor(z.status) }}>
              {z.value}
            </div>
          </div>
          <span className="mt-1 px-1.5 py-0.5 rounded whitespace-nowrap" style={{
            fontSize: 9, fontWeight: 500, color: pressureColor(z.status),
            background: `${pressureColor(z.status)}10`,
          }}>{z.label}</span>
        </div>
      ))}
    </div>
  );
}

/* ── Neckband pressure visualization ── */
function NeckbandPressureView({ zones }: { zones: ReviewResult['pressureZones'] }) {
  return (
    <div className="relative w-full" style={{ aspectRatio: '4/3', background: '#FAFBFC', borderRadius: 12, overflow: 'hidden' }}>
      <svg width="100%" height="100%" viewBox="0 0 300 220" style={{ position: 'absolute', inset: 0 }}>
        {/* Neck/shoulder outline */}
        <path d="M 90 40 Q 150 15 210 40" fill="none" stroke="rgba(0,180,42,0.12)" strokeWidth="12" strokeLinecap="round" />
        <path d="M 60 80 Q 50 120 40 180" fill="none" stroke="rgba(0,180,42,0.08)" strokeWidth="20" strokeLinecap="round" />
        <path d="M 240 80 Q 250 120 260 180" fill="none" stroke="rgba(0,180,42,0.08)" strokeWidth="20" strokeLinecap="round" />
        {/* Neckband */}
        <path d="M 45 130 Q 50 60 150 45 Q 250 60 255 130"
          fill="none" stroke="#C9CDD4" strokeWidth="5" strokeLinecap="round" />
        {/* Earbuds */}
        <circle cx="42" cy="140" r="14" fill="#E5E6EB" stroke="#C9CDD4" strokeWidth="1.5" />
        <circle cx="258" cy="140" r="14" fill="#E5E6EB" stroke="#C9CDD4" strokeWidth="1.5" />
        {/* Battery housing hint */}
        <rect x="30" y="145" width="24" height="35" rx="8" fill="#F2F3F5" stroke="#C9CDD4" strokeWidth="0.8" />
        <rect x="246" y="145" width="24" height="35" rx="8" fill="#F2F3F5" stroke="#C9CDD4" strokeWidth="0.8" />
      </svg>
      {zones.map((z, i) => (
        <div key={i} className="absolute flex flex-col items-center" style={{ left: `${z.x}%`, top: `${z.y}%`, transform: 'translate(-50%, -50%)' }}>
          <div className="relative">
            <div className="rounded-full animate-pulse" style={{
              width: Math.max(18, z.value * 0.45),
              height: Math.max(18, z.value * 0.45),
              background: `${pressureColor(z.status)}20`,
              border: `2px solid ${pressureColor(z.status)}60`,
            }} />
            <div className="absolute inset-0 flex items-center justify-center" style={{ fontSize: 9, fontWeight: 700, color: pressureColor(z.status) }}>
              {z.value}
            </div>
          </div>
          <span className="mt-1 px-1.5 py-0.5 rounded whitespace-nowrap" style={{
            fontSize: 9, fontWeight: 500, color: pressureColor(z.status),
            background: `${pressureColor(z.status)}10`,
          }}>{z.label}</span>
        </div>
      ))}
    </div>
  );
}

const PressureViews: Record<ProductType, React.FC<{ zones: ReviewResult['pressureZones'] }>> = {
  phone: PhonePressureView,
  glasses: GlassesPressureView,
  neckband: NeckbandPressureView,
};

const selBtn = (active: boolean) => active
  ? { background: G.bg, color: G.text, fontWeight: 600 as const, border: `1px solid ${G.border}` }
  : { border: '1px solid #E5E6EB', color: '#4E5969' };

export function IDValidate() {
  const [productType, setProductType] = useState<ProductType>('phone');
  const [population, setPopulation] = useState<PopulationCategory>('general');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<ReviewResult | null>(null);

  const product = PRODUCTS[productType];
  const PressureView = PressureViews[productType];

  function handleReview() {
    setIsAnalyzing(true);
    setTimeout(() => {
      setResult(generateReview(productType, population));
      setIsAnalyzing(false);
    }, 2000);
  }

  function handleReset() {
    setResult(null);
    setIsAnalyzing(false);
  }

  return (
    <div className="p-6 space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-slate-900" style={{ fontWeight: 700, fontSize: 18 }}>D2 样机 AI 评审</h1>
          <p className="text-sm mt-0.5" style={{ color: '#86909C', fontSize: 12 }}>选择产品类型与目标人群，AI 自动生成人因评审报告与压力分布分析</p>
        </div>
        {result && (
          <button onClick={handleReset} className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm transition-colors" style={{ border: '1px solid #E5E6EB', color: '#4E5969' }}>
            <RotateCcw size={14} /> 重新评审
          </button>
        )}
      </div>

      <div className="grid grid-cols-3 gap-5">
        {/* Left panel */}
        <div className="space-y-4">
          {/* Product type selector */}
          <div className="bg-white rounded-2xl border shadow-sm p-5" style={{ borderColor: '#E5E6EB' }}>
            <h3 style={{ fontSize: 13, fontWeight: 600, color: '#1D2129', marginBottom: 12 }}>产品类型</h3>
            <div className="space-y-2">
              {(Object.keys(PRODUCTS) as ProductType[]).map(type => {
                const p = PRODUCTS[type];
                const isActive = productType === type;
                return (
                  <button key={type} onClick={() => { setProductType(type); setResult(null); }}
                    className="w-full flex items-center gap-3 p-3 rounded-xl text-left transition-all"
                    style={isActive
                      ? { background: G.bg, border: `1px solid ${G.border}` }
                      : { border: '1px solid #E5E6EB' }
                    }>
                    <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: isActive ? G.primary : '#F2F3F5' }}>
                      <p.icon size={16} style={{ color: isActive ? 'white' : '#86909C' }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div style={{ fontSize: 13, fontWeight: isActive ? 600 : 400, color: isActive ? G.primary : '#1D2129' }}>{p.label}</div>
                      <div style={{ fontSize: 10, color: '#86909C', marginTop: 1 }}>{p.desc}</div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Demo model */}
          <div className="bg-white rounded-2xl border shadow-sm p-5" style={{ borderColor: '#E5E6EB' }}>
            <h3 style={{ fontSize: 13, fontWeight: 600, color: '#1D2129', marginBottom: 12 }}>Demo 样机</h3>
            <div className="flex items-center gap-3 p-3 rounded-xl" style={{ background: G.bgLight, border: `1px solid ${G.border}` }}>
              <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: G.bg }}>
                <product.icon size={16} style={{ color: G.primary }} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="truncate" style={{ fontSize: 12, fontWeight: 500, color: '#1D2129' }}>{product.demoModel}</div>
                <div style={{ fontSize: 10, color: '#86909C' }}>内置 Demo 模型 · 无需上传</div>
              </div>
            </div>
          </div>

          {/* Population */}
          <div className="bg-white rounded-2xl border shadow-sm p-5" style={{ borderColor: '#E5E6EB' }}>
            <div className="flex items-center gap-2 mb-3">
              <Users size={13} style={{ color: G.primary }} />
              <h3 style={{ fontSize: 13, fontWeight: 600, color: '#1D2129' }}>目标人群</h3>
            </div>
            <div className="space-y-1.5">
              {(Object.keys(POP_LABELS) as PopulationCategory[]).map(p => (
                <button key={p} onClick={() => { setPopulation(p); setResult(null); }}
                  className="w-full py-2 px-3 rounded-lg text-xs transition-all text-left"
                  style={selBtn(population === p)}>
                  {POP_LABELS[p]}
                </button>
              ))}
            </div>
          </div>

          <button onClick={handleReview} disabled={isAnalyzing}
            className="w-full py-3.5 rounded-xl text-sm transition-all shadow-sm flex items-center justify-center gap-2"
            style={isAnalyzing
              ? { background: '#F2F3F5', color: '#86909C' }
              : { background: G.primary, color: 'white', fontWeight: 600 }
            }>
            {isAnalyzing ? (
              <><Loader2 size={15} className="animate-spin" /> AI 正在评审 {product.label} 样机...</>
            ) : (
              <><Sparkles size={15} /> 发起 AI 评审</>
            )}
          </button>
        </div>

        {/* Right: results */}
        <div className="col-span-2 space-y-4">
          {isAnalyzing ? (
            <div className="flex items-center justify-center h-96 bg-white rounded-2xl border shadow-sm" style={{ borderColor: '#E5E6EB' }}>
              <div className="text-center">
                <Loader2 size={40} className="mx-auto mb-3 animate-spin" style={{ color: G.primary }} />
                <p className="text-sm" style={{ color: '#4E5969' }}>AI 正在分析 {product.label} 样机...</p>
                <p className="text-xs mt-1" style={{ color: '#C9CDD4' }}>
                  评估{product.dimensions.join('、')}等维度
                </p>
              </div>
            </div>
          ) : result ? (
            <>
              {/* Score header */}
              <div className="rounded-2xl p-5 text-white" style={{ background: result.score >= 85 ? G.primary : result.score >= 70 ? G.dark : G.red }}>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm opacity-80 mb-1">{product.label} · AI 人因评审综合评分</div>
                    <div style={{ fontWeight: 700, fontSize: 44 }}>{result.score}<span style={{ fontSize: 20 }}>分</span></div>
                    <div className="text-sm opacity-80 mt-1">{result.summary}</div>
                    <div className="mt-2 flex gap-2">
                      <span className="px-2 py-0.5 rounded-full text-xs" style={{ background: 'rgba(255,255,255,0.2)' }}>{product.label}</span>
                      <span className="px-2 py-0.5 rounded-full text-xs" style={{ background: 'rgba(255,255,255,0.2)' }}>{POP_LABELS[population]}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="rounded-xl p-3 text-center" style={{ background: 'rgba(255,255,255,0.15)' }}>
                      <div style={{ fontWeight: 700, fontSize: 28 }}>{result.issues.filter(i => i.severity !== 'pass').length}</div>
                      <div className="text-xs opacity-80">项需关注</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Pressure map + Radar */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white rounded-2xl border shadow-sm p-5" style={{ borderColor: '#E5E6EB' }}>
                  <div className="flex items-center justify-between mb-3">
                    <h3 style={{ fontSize: 13, fontWeight: 600, color: '#1D2129' }}>压力分布可视化</h3>
                    <div className="flex gap-2">
                      {[
                        { label: '安全', color: G.primary },
                        { label: '注意', color: '#FF7D00' },
                        { label: '过高', color: G.red },
                      ].map(l => (
                        <div key={l.label} className="flex items-center gap-1">
                          <div className="w-2 h-2 rounded-full" style={{ background: l.color }} />
                          <span style={{ fontSize: 10, color: '#86909C' }}>{l.label}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <PressureView zones={result.pressureZones} />
                  <p className="text-center mt-2" style={{ fontSize: 10, color: '#C9CDD4' }}>数值单位：相对压力指数（0–100），越高表示越需关注</p>
                </div>

                <div className="bg-white rounded-2xl border shadow-sm p-5" style={{ borderColor: '#E5E6EB' }}>
                  <h3 className="mb-3" style={{ fontSize: 13, fontWeight: 600, color: '#1D2129' }}>体验维度评估</h3>
                  <ResponsiveContainer width="100%" height={220}>
                    <RadarChart data={result.radarData}>
                      <PolarGrid stroke="#F2F3F5" />
                      <PolarAngleAxis dataKey="dim" tick={{ fontSize: 10, fill: '#86909C' }} />
                      <Radar key="radar-score" name="当前" dataKey="score" stroke={G.fill40} fill={G.fill40} fillOpacity={0.2} strokeWidth={2} />
                      <Radar key="radar-target" name="目标" dataKey="target" stroke={G.primary} fill={G.primary} fillOpacity={0.08} strokeWidth={1.5} strokeDasharray="4 2" />
                    </RadarChart>
                  </ResponsiveContainer>
                  <div className="flex gap-4 justify-center mt-1">
                    <div className="flex items-center gap-1.5 text-xs" style={{ color: '#86909C' }}>
                      <div className="w-3 h-0.5 rounded" style={{ background: G.fill40 }} />当前
                    </div>
                    <div className="flex items-center gap-1.5 text-xs" style={{ color: '#86909C' }}>
                      <div className="w-3 h-0.5 rounded" style={{ background: G.primary }} />目标
                    </div>
                  </div>
                </div>
              </div>

              {/* Issues table */}
              <div className="bg-white rounded-2xl border shadow-sm overflow-hidden" style={{ borderColor: '#E5E6EB' }}>
                <div className="px-4 py-3 border-b" style={{ borderColor: '#F2F3F5' }}>
                  <h3 style={{ fontSize: 13, fontWeight: 600, color: '#1D2129' }}>逐项评审详情</h3>
                </div>
                <table className="w-full text-sm">
                  <thead style={{ background: '#FAFAFA' }}>
                    <tr>
                      {['参数', '当前值', '推荐范围', '判定', '问题区域', '说明'].map(h => (
                        <th key={h} className="px-4 py-3 text-left text-xs" style={{ fontWeight: 600, color: '#86909C' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y" style={{ borderColor: '#F2F3F5' }}>
                    {result.issues.map(issue => {
                      const st = severityStyle(issue.severity);
                      return (
                        <tr key={issue.dimension} style={issue.severity === 'fail' ? { background: G.redBg } : {}}>
                          <td className="px-4 py-3" style={{ fontWeight: 500, color: '#1D2129', fontSize: 13 }}>{issue.dimension}</td>
                          <td className="px-4 py-3" style={{ fontWeight: 600, color: st.color, fontSize: 13 }}>{issue.current}</td>
                          <td className="px-4 py-3 text-xs" style={{ color: '#86909C' }}>{issue.recommended}</td>
                          <td className="px-4 py-3">
                            <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: st.bg, color: st.color, fontWeight: 500 }}>
                              {st.label}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-xs" style={{ color: '#4E5969' }}>{issue.zone}</td>
                          <td className="px-4 py-3 text-xs" style={{ color: '#4E5969' }}>{issue.detail}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <div className="flex gap-3">
                <button className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm text-white transition-colors" style={{ background: G.primary, fontWeight: 500 }}>
                  <Download size={15} /> 导出评审报告
                </button>
                <button onClick={handleReset} className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm transition-colors" style={{ border: '1px solid #E5E6EB', color: '#4E5969' }}>
                  <RotateCcw size={15} /> 重新评审
                </button>
              </div>
            </>
          ) : (
            <div className="flex items-center justify-center h-96 bg-white rounded-2xl border shadow-sm" style={{ borderColor: '#E5E6EB' }}>
              <div className="text-center">
                <product.icon size={40} className="mx-auto mb-3" style={{ color: '#C9CDD4' }} />
                <p className="text-sm" style={{ color: '#4E5969' }}>已加载 {product.label} Demo 样机</p>
                <p className="text-sm" style={{ color: '#4E5969' }}>选择目标人群后，点击「发起 AI 评审」</p>
                <p className="text-xs mt-3" style={{ color: '#C9CDD4' }}>
                  将评估：{product.dimensions.join('、')}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}