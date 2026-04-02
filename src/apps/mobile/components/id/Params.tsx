import { useState, useMemo } from 'react';
import { Positioning, GripStyle, FormFactor, calcParameters, POSITIONING_LABELS, GRIP_STYLE_LABELS, FORM_FACTOR_LABELS } from '../../store';
import { Save, Info, Users, Box, Download, FileDown, Image, Table, ChevronRight, Sparkles, CheckCircle } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, BarChart, Bar, Cell } from 'recharts';

const G = {
  primary: '#00B42A', dark: '#009A29', text: '#00B42A',
  bg: '#E8F7EA', bgLight: '#F6FFED', border: '#B7EB8F',
  fill10: 'rgba(0,180,42,0.10)', fill20: 'rgba(0,180,42,0.20)',
  fill40: 'rgba(0,180,42,0.40)', fill60: 'rgba(0,180,42,0.60)',
  fill80: 'rgba(0,180,42,0.80)',
};

type Gender = 'male' | 'female' | 'all';
type AgeRange = '18-24' | '25-34' | '35-44' | '45-54' | '55+' | 'all';
type PopulationCategory = 'general' | 'student' | 'business' | 'elderly' | 'gaming';

const GENDER_LABELS: Record<Gender, string> = { male: '男性', female: '女性', all: '全部' };
const AGE_LABELS: Record<AgeRange, string> = { '18-24': '18–24岁', '25-34': '25–34岁', '35-44': '35–44岁', '45-54': '45–54岁', '55+': '55岁以上', all: '全年龄段' };
const POP_LABELS: Record<PopulationCategory, string> = { general: '大众用户', student: '学生群体', business: '商务人群', elderly: '银发人群', gaming: '游戏玩家' };
const POP_DESC: Record<PopulationCategory, string> = {
  general: '覆盖主流消费群体，手型分布均匀', student: '以18–24岁为主，偏好轻薄单手操作',
  business: '25–45岁为主，注重握感稳定与质感', elderly: '45岁以上，手部灵活性下降，需大圆角',
  gaming: '长时间双手横握，重量与散热敏感',
};

function normalCDF(x: number, mean: number, std: number): number {
  const z = (x - mean) / std;
  const t = 1 / (1 + 0.2316419 * Math.abs(z));
  const poly = t * (0.31938153 + t * (-0.356563782 + t * (1.781477937 + t * (-1.821255978 + t * 1.330274429))));
  const phi = Math.exp(-0.5 * z * z) / Math.sqrt(2 * Math.PI);
  let p = 1 - phi * poly;
  if (z < 0) p = 1 - p;
  return Math.min(99, Math.max(1, p * 100));
}

function genCurve(mean: number, stdAdj: number = 0) {
  const std = 2.8 + stdAdj;
  const data = [];
  for (let w = mean - 6; w <= mean + 6; w += 0.5)
    data.push({ width: parseFloat(w.toFixed(1)), coverage: parseFloat(normalCDF(w, mean, std).toFixed(1)) });
  return data;
}

function getPersonaHandData(pop: PopulationCategory, gender: Gender): { size: string; pct: number }[] {
  if (gender === 'female') return [{ size: 'XS', pct: 15 }, { size: 'S', pct: 32 }, { size: 'M', pct: 35 }, { size: 'L', pct: 14 }, { size: 'XL', pct: 4 }];
  if (gender === 'male') return [{ size: 'XS', pct: 2 }, { size: 'S', pct: 10 }, { size: 'M', pct: 38 }, { size: 'L', pct: 35 }, { size: 'XL', pct: 15 }];
  if (pop === 'student') return [{ size: 'XS', pct: 10 }, { size: 'S', pct: 25 }, { size: 'M', pct: 40 }, { size: 'L', pct: 18 }, { size: 'XL', pct: 7 }];
  if (pop === 'elderly') return [{ size: 'XS', pct: 8 }, { size: 'S', pct: 20 }, { size: 'M', pct: 42 }, { size: 'L', pct: 22 }, { size: 'XL', pct: 8 }];
  if (pop === 'gaming') return [{ size: 'XS', pct: 3 }, { size: 'S', pct: 12 }, { size: 'M', pct: 36 }, { size: 'L', pct: 33 }, { size: 'XL', pct: 16 }];
  return [{ size: 'XS', pct: 5 }, { size: 'S', pct: 18 }, { size: 'M', pct: 40 }, { size: 'L', pct: 27 }, { size: 'XL', pct: 10 }];
}

const BAR_FILLS = [G.fill20, G.fill40, G.primary, G.fill80, G.fill60];

/* ── Phone SVG blueprint ── */
function PhoneBlueprint({ width, height, thickness, cornerRadius, formFactor }: {
  width: number; height: number; thickness: number; cornerRadius: number; formFactor: FormFactor;
}) {
  const scale = 1.8;
  const W = width * scale;
  const H = height * scale;
  const R = cornerRadius * scale;
  const T = thickness * scale;
  const offsetX = 60;
  const offsetY = 30;
  const sideX = offsetX + W + 50;

  return (
    <svg width="100%" height="100%" viewBox={`0 0 ${sideX + T + 80} ${H + offsetY * 2 + 20}`} style={{ maxHeight: 360 }}>
      {/* Grid background */}
      <defs>
        <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
          <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#F2F3F5" strokeWidth="0.5" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#grid)" />

      {/* Front view */}
      <text x={offsetX + W / 2} y={offsetY - 10} textAnchor="middle" fill="#86909C" fontSize="10" fontWeight="600">正面视图</text>
      <rect x={offsetX} y={offsetY} width={W} height={H} rx={R} ry={R}
        fill="none" stroke="#00B42A" strokeWidth="1.5" />
      {/* Screen area */}
      <rect x={offsetX + 4} y={offsetY + 8} width={W - 8} height={H - 16} rx={R - 2} ry={R - 2}
        fill="rgba(0,180,42,0.04)" stroke="rgba(0,180,42,0.2)" strokeWidth="0.5" strokeDasharray="4 2" />
      {/* Camera notch */}
      <circle cx={offsetX + W / 2} cy={offsetY + 16} r={3} fill="none" stroke="rgba(0,180,42,0.3)" strokeWidth="0.8" />

      {formFactor === 'fold' && (
        <line x1={offsetX} y1={offsetY + H / 2} x2={offsetX + W} y2={offsetY + H / 2}
          stroke="#00B42A" strokeWidth="0.8" strokeDasharray="6 3" />
      )}
      {formFactor === 'flip' && (
        <line x1={offsetX} y1={offsetY + H * 0.45} x2={offsetX + W} y2={offsetY + H * 0.45}
          stroke="#00B42A" strokeWidth="0.8" strokeDasharray="6 3" />
      )}

      {/* Width dimension */}
      <line x1={offsetX} y1={offsetY + H + 16} x2={offsetX + W} y2={offsetY + H + 16} stroke="#4E5969" strokeWidth="0.8" markerStart="url(#arrowL)" markerEnd="url(#arrowR)" />
      <text x={offsetX + W / 2} y={offsetY + H + 30} textAnchor="middle" fill="#1D2129" fontSize="11" fontWeight="600">{width} mm</text>

      {/* Height dimension */}
      <line x1={offsetX - 16} y1={offsetY} x2={offsetX - 16} y2={offsetY + H} stroke="#4E5969" strokeWidth="0.8" />
      <text x={offsetX - 24} y={offsetY + H / 2} textAnchor="middle" fill="#1D2129" fontSize="11" fontWeight="600"
        transform={`rotate(-90, ${offsetX - 24}, ${offsetY + H / 2})`}>{height} mm</text>

      {/* Corner radius callout */}
      <path d={`M ${offsetX + R} ${offsetY} A ${R} ${R} 0 0 0 ${offsetX} ${offsetY + R}`}
        fill="none" stroke="#F53F3F" strokeWidth="1" strokeDasharray="3 2" />
      <text x={offsetX + R + 6} y={offsetY - 2} fill="#F53F3F" fontSize="9">R{cornerRadius}</text>

      {/* Side view */}
      <text x={sideX + T / 2} y={offsetY - 10} textAnchor="middle" fill="#86909C" fontSize="10" fontWeight="600">侧面视图</text>
      <rect x={sideX} y={offsetY} width={T} height={H} rx={T / 2.5} ry={T / 2.5}
        fill="none" stroke="#00B42A" strokeWidth="1.5" />
      {/* Thickness dimension */}
      <line x1={sideX} y1={offsetY + H + 16} x2={sideX + T} y2={offsetY + H + 16} stroke="#4E5969" strokeWidth="0.8" />
      <text x={sideX + T / 2} y={offsetY + H + 30} textAnchor="middle" fill="#1D2129" fontSize="11" fontWeight="600">{thickness} mm</text>

      {/* Grip comfort zone indicators */}
      <rect x={offsetX - 3} y={offsetY + H * 0.3} width={3} height={H * 0.4} rx={1.5}
        fill="rgba(0,180,42,0.3)" />
      <rect x={offsetX + W} y={offsetY + H * 0.3} width={3} height={H * 0.4} rx={1.5}
        fill="rgba(0,180,42,0.3)" />
      <text x={offsetX + W + 14} y={offsetY + H * 0.5} fill="#00B42A" fontSize="8" dominantBaseline="middle">握持区</text>

      {/* Thumb reach zone */}
      <ellipse cx={offsetX + W * 0.4} cy={offsetY + H * 0.55} rx={W * 0.3} ry={H * 0.22}
        fill="none" stroke="rgba(0,180,42,0.15)" strokeWidth="0.8" strokeDasharray="4 3" />
      <text x={offsetX + W * 0.4} y={offsetY + H * 0.55 + 2} textAnchor="middle" fill="rgba(0,180,42,0.4)" fontSize="8">拇指舒适区</text>

      {/* Arrow markers */}
      <defs>
        <marker id="arrowL" markerWidth="6" markerHeight="4" refX="0" refY="2" orient="auto">
          <path d="M 6 0 L 0 2 L 6 4" fill="none" stroke="#4E5969" strokeWidth="0.8" />
        </marker>
        <marker id="arrowR" markerWidth="6" markerHeight="4" refX="6" refY="2" orient="auto">
          <path d="M 0 0 L 6 2 L 0 4" fill="none" stroke="#4E5969" strokeWidth="0.8" />
        </marker>
      </defs>
    </svg>
  );
}

export function IDParams() {
  const [positioning, setPositioning] = useState<Positioning>('flagship');
  const [formFactor, setFormFactor] = useState<FormFactor>('bar');
  const [gripStyle, setGripStyle] = useState<GripStyle>('onehand');
  const [gender, setGender] = useState<Gender>('all');
  const [age, setAge] = useState<AgeRange>('all');
  const [population, setPopulation] = useState<PopulationCategory>('general');
  const [saved, setSaved] = useState(false);
  const [modelGenerated, setModelGenerated] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [activeTab, setActiveTab] = useState<'config' | 'model' | 'data'>('config');

  const params = calcParameters(positioning, formFactor, gripStyle);
  const curveData = genCurve(params.width.recommended, gender === 'female' ? -0.5 : gender === 'male' ? 0.3 : 0);
  const handData = getPersonaHandData(population, gender);
  const personaLabel = [POP_LABELS[population], gender !== 'all' ? GENDER_LABELS[gender] : '', age !== 'all' ? AGE_LABELS[age] : ''].filter(Boolean).join(' · ');

  const selBtn = (active: boolean) => active
    ? { background: G.bg, color: G.text, fontWeight: 600 as const, border: `1px solid ${G.border}` }
    : { border: '1px solid #E5E6EB', color: '#4E5969' };

  const handleGenerate = () => {
    setGenerating(true);
    setTimeout(() => {
      setGenerating(false);
      setModelGenerated(true);
      setActiveTab('model');
    }, 1800);
  };

  const modelLabel = useMemo(() =>
    `${POSITIONING_LABELS[positioning]} · ${FORM_FACTOR_LABELS[formFactor]} · ${GRIP_STYLE_LABELS[gripStyle]} · ${personaLabel}`
  , [positioning, formFactor, gripStyle, personaLabel]);

  return (
    <div className="p-6 space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-slate-900" style={{ fontWeight: 700, fontSize: 18 }}>D1 设计参考工具</h1>
          <p className="text-sm mt-0.5" style={{ color: '#86909C', fontSize: 12 }}>选择目标市场与人群画像，生成人因 + 视觉最优底模方案</p>
        </div>
        <div className="flex gap-2">
          {modelGenerated && (
            <button onClick={() => setSaved(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm transition-colors"
              style={saved ? { background: G.bg, color: G.text, fontWeight: 500 } : { background: G.primary, color: 'white', fontWeight: 500 }}>
              <Save size={15} />{saved ? '已保存方案' : '保存为设计参数方案'}
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 p-1 rounded-xl" style={{ background: '#F2F3F5' }}>
        {([
          { key: 'config' as const, label: '① 目标配置' },
          { key: 'model' as const, label: '② 底模预览' },
          { key: 'data' as const, label: '③ 数据 & 图表' },
        ]).map(tab => (
          <button key={tab.key} onClick={() => setActiveTab(tab.key)}
            className="flex-1 py-2 rounded-lg text-sm transition-all"
            style={activeTab === tab.key
              ? { background: 'white', color: '#1D2129', fontWeight: 600, boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }
              : { color: '#4E5969' }}>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab 1: Config */}
      {activeTab === 'config' && (
        <div className="space-y-5">
          {/* Filters */}
          <div className="bg-white rounded-2xl border shadow-sm p-5" style={{ borderColor: '#E5E6EB' }}>
            <h3 className="text-sm mb-4" style={{ fontWeight: 600, color: '#1D2129', fontSize: 13 }}>产品形态配置</h3>
            <div className="grid grid-cols-3 gap-5">
              <div>
                <label className="text-xs mb-2 block" style={{ color: '#86909C', fontWeight: 500 }}>产品定位</label>
                <div className="grid grid-cols-2 gap-1.5">
                  {(['entry', 'mid', 'flagship', 'ultra'] as Positioning[]).map(p => (
                    <button key={p} onClick={() => { setPositioning(p); setModelGenerated(false); }}
                      className="py-2 px-3 rounded-lg text-xs transition-all"
                      style={selBtn(positioning === p)}>{POSITIONING_LABELS[p]}</button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-xs mb-2 block" style={{ color: '#86909C', fontWeight: 500 }}>手机形态</label>
                <div className="flex flex-col gap-1.5">
                  {(['bar', 'flip', 'fold'] as FormFactor[]).map(f => (
                    <button key={f} onClick={() => { setFormFactor(f); setModelGenerated(false); }}
                      className="py-2 px-3 rounded-lg text-xs transition-all text-left"
                      style={selBtn(formFactor === f)}>{FORM_FACTOR_LABELS[f]}</button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-xs mb-2 block" style={{ color: '#86909C', fontWeight: 500 }}>握持风格</label>
                <div className="flex flex-col gap-1.5">
                  {(['onehand', 'twohand', 'mixed'] as GripStyle[]).map(g => (
                    <button key={g} onClick={() => { setGripStyle(g); setModelGenerated(false); }}
                      className="py-2 px-3 rounded-lg text-xs transition-all text-left"
                      style={selBtn(gripStyle === g)}>{GRIP_STYLE_LABELS[g]}</button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* User Persona */}
          <div className="bg-white rounded-2xl border shadow-sm p-5" style={{ borderColor: '#E5E6EB' }}>
            <div className="flex items-center gap-2 mb-4">
              <Users size={14} style={{ color: G.primary }} />
              <h3 className="text-sm" style={{ fontWeight: 600, color: '#1D2129', fontSize: 13 }}>目标用户画像</h3>
              <span className="px-2 py-0.5 rounded-full text-xs" style={{ background: G.bg, color: G.text }}>{personaLabel}</span>
            </div>
            <div className="grid grid-cols-3 gap-5">
              <div>
                <label className="text-xs mb-2 block" style={{ color: '#86909C', fontWeight: 500 }}>人群分类</label>
                <div className="grid grid-cols-1 gap-1.5">
                  {(Object.keys(POP_LABELS) as PopulationCategory[]).map(p => (
                    <button key={p} onClick={() => { setPopulation(p); setModelGenerated(false); }}
                      className="py-2 px-3 rounded-lg text-xs transition-all text-left"
                      style={selBtn(population === p)}>
                      <div>{POP_LABELS[p]}</div>
                      <div className="mt-0.5" style={{ color: '#86909C', fontSize: 10 }}>{POP_DESC[p]}</div>
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-xs mb-2 block" style={{ color: '#86909C', fontWeight: 500 }}>性别</label>
                <div className="flex flex-col gap-1.5">
                  {(Object.keys(GENDER_LABELS) as Gender[]).map(g => (
                    <button key={g} onClick={() => { setGender(g); setModelGenerated(false); }}
                      className="py-2 px-3 rounded-lg text-xs transition-all"
                      style={selBtn(gender === g)}>{GENDER_LABELS[g]}</button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-xs mb-2 block" style={{ color: '#86909C', fontWeight: 500 }}>年龄段</label>
                <div className="grid grid-cols-1 gap-1.5">
                  {(Object.keys(AGE_LABELS) as AgeRange[]).map(a => (
                    <button key={a} onClick={() => { setAge(a); setModelGenerated(false); }}
                      className="py-2 px-3 rounded-lg text-xs transition-all"
                      style={selBtn(age === a)}>{AGE_LABELS[a]}</button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Generate button */}
          <button onClick={handleGenerate} disabled={generating}
            className="w-full py-4 rounded-xl text-sm transition-all shadow-sm flex items-center justify-center gap-2"
            style={generating
              ? { background: '#F2F3F5', color: '#86909C' }
              : { background: G.primary, color: 'white', fontWeight: 600 }
            }>
            {generating ? (
              <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> 正在基于人因数据 + 视觉设计规范生成最优底模...</>
            ) : (
              <><Sparkles size={16} /> 生成底模方案（人因触摸 + 视觉设计双维度优化）</>
            )}
          </button>
        </div>
      )}

      {/* Tab 2: Model Preview */}
      {activeTab === 'model' && (
        <div className="space-y-5">
          {!modelGenerated ? (
            <div className="flex items-center justify-center h-96 bg-white rounded-2xl border shadow-sm" style={{ borderColor: '#E5E6EB' }}>
              <div className="text-center">
                <Box size={40} className="mx-auto mb-3" style={{ color: '#C9CDD4' }} />
                <p className="text-sm" style={{ color: '#4E5969' }}>请先在「目标配置」中完成选择</p>
                <p className="text-sm" style={{ color: '#4E5969' }}>并点击「生成底模方案」</p>
                <button onClick={() => setActiveTab('config')} className="mt-3 text-xs px-4 py-2 rounded-lg" style={{ color: G.primary, background: G.bg }}>
                  前往配置
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Model info bar */}
              <div className="flex items-center justify-between p-4 rounded-xl" style={{ background: G.bgLight, border: `1px solid ${G.border}` }}>
                <div className="flex items-center gap-2">
                  <CheckCircle size={16} style={{ color: G.primary }} />
                  <div>
                    <span style={{ fontSize: 13, fontWeight: 600, color: '#1D2129' }}>底模方案已生成</span>
                    <span className="ml-3" style={{ fontSize: 11, color: '#86909C' }}>{modelLabel}</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  {[
                    { label: '导出 STP', icon: FileDown, ext: '.stp' },
                    { label: '导出 FBX', icon: FileDown, ext: '.fbx' },
                    { label: '导出 SVG 线框', icon: Image, ext: '.svg' },
                    { label: '导出数据', icon: Table, ext: '.csv' },
                  ].map(btn => (
                    <button key={btn.ext} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs transition-colors hover:bg-white"
                      style={{ border: '1px solid #E5E6EB', color: '#4E5969', background: 'white' }}>
                      <btn.icon size={12} /> {btn.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-3 gap-5">
                {/* Blueprint preview */}
                <div className="col-span-2 bg-white rounded-2xl border shadow-sm overflow-hidden" style={{ borderColor: '#E5E6EB' }}>
                  <div className="px-5 py-3 border-b flex items-center justify-between" style={{ borderColor: '#F2F3F5' }}>
                    <div className="flex items-center gap-2">
                      <Box size={14} style={{ color: G.primary }} />
                      <span style={{ fontSize: 13, fontWeight: 600, color: '#1D2129' }}>底模蓝图预览</span>
                    </div>
                    <span style={{ fontSize: 11, color: '#86909C' }}>人因触摸区域 + 视觉比例已标注</span>
                  </div>
                  <div className="p-4" style={{ background: '#FAFBFC', minHeight: 380 }}>
                    <PhoneBlueprint
                      width={params.width.recommended}
                      height={params.height.recommended}
                      thickness={params.thickness.recommended}
                      cornerRadius={params.cornerRadius.recommended}
                      formFactor={formFactor}
                    />
                  </div>
                </div>

                {/* Right: key specs + design notes */}
                <div className="space-y-4">
                  <div className="bg-white rounded-2xl border shadow-sm p-5" style={{ borderColor: '#E5E6EB' }}>
                    <span style={{ fontSize: 13, fontWeight: 600, color: '#1D2129', display: 'block', marginBottom: 12 }}>核心尺寸参数</span>
                    {Object.entries(params).map(([key, p]) => {
                      const label: Record<string, string> = { width: '宽度', height: '高度', thickness: '厚度', weight: '重量', cornerRadius: '圆角' };
                      return (
                        <div key={key} className="flex items-center justify-between py-2.5" style={{ borderBottom: '1px solid #F2F3F5' }}>
                          <span style={{ fontSize: 12, color: '#86909C' }}>{label[key]}</span>
                          <span style={{ fontSize: 13, fontWeight: 700, color: G.primary }}>{p.recommended}<span style={{ fontSize: 11, color: '#86909C', marginLeft: 2 }}>{p.unit}</span></span>
                        </div>
                      );
                    })}
                  </div>

                  <div className="bg-white rounded-2xl border shadow-sm p-5" style={{ borderColor: '#E5E6EB' }}>
                    <span style={{ fontSize: 13, fontWeight: 600, color: '#1D2129', display: 'block', marginBottom: 12 }}>设计优化要点</span>
                    <div className="space-y-3">
                      {[
                        { title: '人因触摸优化', desc: `侧面中段（30%–70%位置）为主要握持区域，圆角 R${params.cornerRadius.recommended} 确保手掌贴合无压痛` },
                        { title: '视觉比例平衡', desc: `宽高比 ${(params.width.recommended / params.height.recommended).toFixed(3)}，接近 0.464 黄金握持比例，视觉纤长感良好` },
                        { title: '拇指可达性', desc: `屏幕有效触达率约 ${Math.round(82 + (positioning === 'ultra' ? 6 : positioning === 'flagship' ? 3 : 0))}%，${gripStyle === 'onehand' ? '单手场景优化' : '双手场景兼容'}` },
                        { title: '重量分布', desc: `建议整机重心位于几何中心偏下 ${formFactor === 'bar' ? '3–5mm' : '8–12mm'}，提升单手平衡感` },
                      ].map((tip, i) => (
                        <div key={i} className="p-3 rounded-lg" style={{ background: '#F7F8FA' }}>
                          <span style={{ fontSize: 11, fontWeight: 600, color: '#1D2129', display: 'block', marginBottom: 2 }}>{tip.title}</span>
                          <p style={{ fontSize: 11, color: '#86909C', lineHeight: 1.6 }}>{tip.desc}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* Tab 3: Data & Charts */}
      {activeTab === 'data' && (
        <div className="space-y-5">
          <div className="grid grid-cols-2 gap-5">
            <div className="bg-white rounded-2xl border shadow-sm p-5" style={{ borderColor: '#E5E6EB' }}>
              <h3 className="text-sm mb-3" style={{ fontWeight: 600, color: '#1D2129', fontSize: 13 }}>宽度 × 人群覆盖率曲线</h3>
              <p className="text-xs mb-4" style={{ color: '#86909C' }}>基于 <span style={{ fontWeight: 600, color: G.text }}>{personaLabel}</span> 画像</p>
              <ResponsiveContainer width="100%" height={200}>
                <AreaChart data={curveData} margin={{ top: 10, right: 20, left: 0, bottom: 5 }}>
                  <defs>
                    <linearGradient id="idCovGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={G.primary} stopOpacity={0.2} />
                      <stop offset="95%" stopColor={G.primary} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="width" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} tickFormatter={v => `${v}mm`} />
                  <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} unit="%" domain={[0, 100]} />
                  <Tooltip formatter={(v: number) => [`${v.toFixed(1)}%`, '覆盖率']} labelFormatter={l => `宽度 ${l}mm`} contentStyle={{ fontSize: '12px', borderRadius: '8px', border: '1px solid #e2e8f0' }} />
                  <Area type="monotone" dataKey="coverage" stroke={G.primary} strokeWidth={2.5} fill="url(#idCovGrad)" dot={false} />
                  <ReferenceLine x={params.width.recommended} stroke={G.dark} strokeDasharray="4 3" strokeWidth={1.5}
                    label={{ value: `推荐 ${params.width.recommended}mm`, fontSize: 10, fill: G.dark, position: 'top' }} />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-white rounded-2xl border shadow-sm p-5" style={{ borderColor: '#E5E6EB' }}>
              <h3 className="text-sm mb-3" style={{ fontWeight: 600, color: '#1D2129', fontSize: 13 }}>目标用户手型分布</h3>
              <p className="text-xs mb-4" style={{ color: '#86909C' }}>基于 <span style={{ fontWeight: 600, color: G.text }}>{personaLabel}</span>，N=10,000</p>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={handData} barCategoryGap="20%">
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="size" tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} unit="%" />
                  <Tooltip formatter={(v: number) => [`${v}%`, '占比']} contentStyle={{ fontSize: '12px', borderRadius: '8px', border: '1px solid #e2e8f0' }} />
                  <Bar dataKey="pct" radius={[6, 6, 0, 0]}>
                    {handData.map((_, i) => <Cell key={`cell-${i}`} fill={BAR_FILLS[i]} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Param table */}
          <div className="bg-white rounded-2xl border shadow-sm overflow-hidden" style={{ borderColor: '#E5E6EB' }}>
            <div className="px-5 py-4 border-b" style={{ borderColor: '#F2F3F5' }}>
              <h3 className="text-sm" style={{ fontWeight: 600, color: '#1D2129', fontSize: 13 }}>推荐参数汇总</h3>
            </div>
            <div className="divide-y" style={{ borderColor: '#F2F3F5' }}>
              {Object.entries(params).map(([key, p]) => {
                const label: Record<string, string> = { width: '宽度', height: '高度', thickness: '厚度', weight: '重量', cornerRadius: '圆角半径' };
                return (
                  <div key={key} className="px-5 py-4 flex items-center gap-4">
                    <span className="text-sm w-20" style={{ color: '#4E5969', fontSize: 13 }}>{label[key]}</span>
                    <span style={{ fontWeight: 700, fontSize: 18, color: G.primary }}>{p.recommended}<span className="text-sm ml-1" style={{ color: '#86909C' }}>{p.unit}</span></span>
                    <span className="text-xs" style={{ color: '#C9CDD4' }}>范围 [{p.min} – {p.max}]</span>
                    <div className="flex-1">
                      <div className="h-1.5 rounded-full overflow-hidden" style={{ background: '#F2F3F5' }}>
                        <div className="h-full rounded-full" style={{ width: `${p.coverage}%`, backgroundColor: p.coverage >= 90 ? G.primary : p.coverage >= 80 ? G.fill60 : G.fill40 }} />
                      </div>
                    </div>
                    <span className="text-xs w-12 text-right" style={{ fontWeight: 600, color: p.coverage >= 90 ? G.primary : p.coverage >= 80 ? G.dark : G.fill40 }}>{p.coverage}%</span>
                    <div className="flex items-center gap-1 text-xs" style={{ color: '#C9CDD4' }}><Info size={11} />覆盖率</div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
