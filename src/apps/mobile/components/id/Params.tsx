import { useState, useMemo } from 'react';
import { Positioning, FormFactor, GripStyle, calcParameters, POSITIONING_LABELS, FORM_FACTOR_LABELS, GRIP_STYLE_LABELS } from '../../store';
import { Save, Box, Sparkles, CheckCircle } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, BarChart, Bar, Cell } from 'recharts';

const G = {
  primary: '#00B42A', dark: '#009A29', text: '#00B42A',
  bg: '#E8F7EA', bgLight: '#F6FFED', border: '#B7EB8F',
  fill20: 'rgba(0,180,42,0.20)', fill40: 'rgba(0,180,42,0.40)',
  fill60: 'rgba(0,180,42,0.60)', fill80: 'rgba(0,180,42,0.80)',
};

type Gender = 'male' | 'female' | 'all';
type Pop = 'general' | 'student' | 'business' | 'elderly' | 'gaming';

const GENDER_LABELS: Record<Gender, string> = { male: '男', female: '女', all: '全部' };
const POP_LABELS: Record<Pop, string> = { general: '大众', student: '学生', business: '商务', elderly: '银发', gaming: '游戏' };

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

function getHandData(pop: Pop, gender: Gender) {
  if (gender === 'female') return [{ size: 'XS', pct: 15 }, { size: 'S', pct: 32 }, { size: 'M', pct: 35 }, { size: 'L', pct: 14 }, { size: 'XL', pct: 4 }];
  if (gender === 'male') return [{ size: 'XS', pct: 2 }, { size: 'S', pct: 10 }, { size: 'M', pct: 38 }, { size: 'L', pct: 35 }, { size: 'XL', pct: 15 }];
  return [{ size: 'XS', pct: 5 }, { size: 'S', pct: 18 }, { size: 'M', pct: 40 }, { size: 'L', pct: 27 }, { size: 'XL', pct: 10 }];
}

const BAR_FILLS = [G.fill20, G.fill40, G.primary, G.fill80, G.fill60];

function PhoneBlueprint({ width, height, thickness, cornerRadius, formFactor }: {
  width: number; height: number; thickness: number; cornerRadius: number; formFactor: FormFactor;
}) {
  const s = 2.2;
  const W = width * s, H = height * s, R = cornerRadius * s, T = thickness * s;
  const oX = 50, oY = 25, sX = oX + W + 40;
  return (
    <svg width="100%" viewBox={`0 0 ${sX + T + 40} ${H + oY * 2 + 30}`} style={{ maxHeight: 300 }}>
      <defs>
        <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
          <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#F2F3F5" strokeWidth="0.5" />
        </pattern>
        <marker id="arrowL" markerWidth="6" markerHeight="4" refX="0" refY="2" orient="auto">
          <path d="M 6 0 L 0 2 L 6 4" fill="none" stroke="#4E5969" strokeWidth="0.8" />
        </marker>
        <marker id="arrowR" markerWidth="6" markerHeight="4" refX="6" refY="2" orient="auto">
          <path d="M 0 0 L 6 2 L 0 4" fill="none" stroke="#4E5969" strokeWidth="0.8" />
        </marker>
      </defs>
      <rect width="100%" height="100%" fill="url(#grid)" />
      <text x={oX + W / 2} y={oY - 8} textAnchor="middle" fill="#86909C" fontSize="9" fontWeight="600">正面</text>
      <rect x={oX} y={oY} width={W} height={H} rx={R} ry={R} fill="none" stroke="#00B42A" strokeWidth="1.5" />
      <rect x={oX + 3} y={oY + 6} width={W - 6} height={H - 12} rx={R - 2} ry={R - 2}
        fill="rgba(0,180,42,0.04)" stroke="rgba(0,180,42,0.2)" strokeWidth="0.5" strokeDasharray="4 2" />
      {formFactor === 'fold' && <line x1={oX} y1={oY + H / 2} x2={oX + W} y2={oY + H / 2} stroke="#00B42A" strokeWidth="0.8" strokeDasharray="6 3" />}
      {formFactor === 'flip' && <line x1={oX} y1={oY + H * 0.45} x2={oX + W} y2={oY + H * 0.45} stroke="#00B42A" strokeWidth="0.8" strokeDasharray="6 3" />}
      <line x1={oX} y1={oY + H + 14} x2={oX + W} y2={oY + H + 14} stroke="#4E5969" strokeWidth="0.8" markerStart="url(#arrowL)" markerEnd="url(#arrowR)" />
      <text x={oX + W / 2} y={oY + H + 26} textAnchor="middle" fill="#1D2129" fontSize="10" fontWeight="600">{width}mm</text>
      <line x1={oX - 14} y1={oY} x2={oX - 14} y2={oY + H} stroke="#4E5969" strokeWidth="0.8" />
      <text x={oX - 22} y={oY + H / 2} textAnchor="middle" fill="#1D2129" fontSize="10" fontWeight="600"
        transform={`rotate(-90, ${oX - 22}, ${oY + H / 2})`}>{height}mm</text>
      <path d={`M ${oX + R} ${oY} A ${R} ${R} 0 0 0 ${oX} ${oY + R}`}
        fill="none" stroke="#F53F3F" strokeWidth="1" strokeDasharray="3 2" />
      <text x={oX + R + 4} y={oY - 2} fill="#F53F3F" fontSize="8">R{cornerRadius}</text>
      <text x={sX + T / 2} y={oY - 8} textAnchor="middle" fill="#86909C" fontSize="9" fontWeight="600">侧面</text>
      <rect x={sX} y={oY} width={T} height={H} rx={T / 2.5} ry={T / 2.5} fill="none" stroke="#00B42A" strokeWidth="1.5" />
      <text x={sX + T / 2} y={oY + H + 26} textAnchor="middle" fill="#1D2129" fontSize="10" fontWeight="600">{thickness}mm</text>
      <rect x={oX - 3} y={oY + H * 0.3} width={3} height={H * 0.4} rx={1.5} fill="rgba(0,180,42,0.3)" />
      <text x={oX + W + 10} y={oY + H * 0.5} fill="#00B42A" fontSize="7" dominantBaseline="middle">握持区</text>
    </svg>
  );
}

const selBtn = (active: boolean): React.CSSProperties => active
  ? { background: G.bg, color: G.text, fontWeight: 600, border: `1.5px solid ${G.border}` }
  : { border: '1px solid #E5E6EB', color: '#4E5969' };

export function IDParams() {
  const [positioning, setPositioning] = useState<Positioning>('flagship');
  const [formFactor, setFormFactor] = useState<FormFactor>('bar');
  const [gripStyle, setGripStyle] = useState<GripStyle>('onehand');
  const [gender, setGender] = useState<Gender>('all');
  const [population, setPopulation] = useState<Pop>('general');
  const [saved, setSaved] = useState(false);
  const [modelGenerated, setModelGenerated] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [activeTab, setActiveTab] = useState<'config' | 'model' | 'data'>('config');

  const params = calcParameters(positioning, formFactor, gripStyle);
  const curveData = genCurve(params.width.recommended, gender === 'female' ? -0.5 : gender === 'male' ? 0.3 : 0);
  const handData = getHandData(population, gender);

  const handleGenerate = () => {
    setGenerating(true);
    setTimeout(() => { setGenerating(false); setModelGenerated(true); setActiveTab('model'); }, 1800);
  };

  return (
    <div className="px-4 py-4 space-y-4">
      <div>
        <h1 style={{ fontSize: 16, fontWeight: 700, color: '#1D2129' }}>设计参考工具</h1>
        <p style={{ fontSize: 11, color: '#86909C', marginTop: 2 }}>配置目标 → 生成底模 → 数据图表</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 rounded-lg" style={{ background: '#F2F3F5' }}>
        {([
          { key: 'config' as const, label: '① 配置' },
          { key: 'model' as const, label: '② 底模' },
          { key: 'data' as const, label: '③ 图表' },
        ]).map(tab => (
          <button key={tab.key} onClick={() => setActiveTab(tab.key)}
            className="flex-1 py-2 rounded-md transition-all"
            style={activeTab === tab.key
              ? { background: 'white', color: '#1D2129', fontWeight: 600, fontSize: 12, boxShadow: '0 1px 2px rgba(0,0,0,0.06)' }
              : { color: '#4E5969', fontSize: 12 }}>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab 1: Config */}
      {activeTab === 'config' && (
        <div className="space-y-4">
          {/* Product config */}
          <div className="bg-white rounded-xl p-4" style={{ border: '1px solid #E5E6EB' }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: '#1D2129', display: 'block', marginBottom: 10 }}>产品形态</span>

            <label style={{ fontSize: 11, color: '#86909C', fontWeight: 500, display: 'block', marginBottom: 6 }}>定位</label>
            <div className="grid grid-cols-4 gap-1.5 mb-4">
              {(['entry', 'mid', 'flagship', 'ultra'] as Positioning[]).map(p => (
                <button key={p} onClick={() => { setPositioning(p); setModelGenerated(false); }}
                  className="py-2 rounded-lg transition-all" style={{ ...selBtn(positioning === p), fontSize: 11 }}>
                  {POSITIONING_LABELS[p]}
                </button>
              ))}
            </div>

            <label style={{ fontSize: 11, color: '#86909C', fontWeight: 500, display: 'block', marginBottom: 6 }}>形态</label>
            <div className="grid grid-cols-3 gap-1.5 mb-4">
              {(['bar', 'flip', 'fold'] as FormFactor[]).map(f => (
                <button key={f} onClick={() => { setFormFactor(f); setModelGenerated(false); }}
                  className="py-2 rounded-lg transition-all" style={{ ...selBtn(formFactor === f), fontSize: 11 }}>
                  {FORM_FACTOR_LABELS[f]}
                </button>
              ))}
            </div>

            <label style={{ fontSize: 11, color: '#86909C', fontWeight: 500, display: 'block', marginBottom: 6 }}>握持</label>
            <div className="grid grid-cols-3 gap-1.5">
              {(['onehand', 'twohand', 'mixed'] as GripStyle[]).map(g => (
                <button key={g} onClick={() => { setGripStyle(g); setModelGenerated(false); }}
                  className="py-2 rounded-lg transition-all" style={{ ...selBtn(gripStyle === g), fontSize: 11 }}>
                  {GRIP_STYLE_LABELS[g]}
                </button>
              ))}
            </div>
          </div>

          {/* User persona */}
          <div className="bg-white rounded-xl p-4" style={{ border: '1px solid #E5E6EB' }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: '#1D2129', display: 'block', marginBottom: 10 }}>目标人群</span>

            <label style={{ fontSize: 11, color: '#86909C', fontWeight: 500, display: 'block', marginBottom: 6 }}>人群</label>
            <div className="grid grid-cols-5 gap-1.5 mb-4">
              {(Object.keys(POP_LABELS) as Pop[]).map(p => (
                <button key={p} onClick={() => { setPopulation(p); setModelGenerated(false); }}
                  className="py-2 rounded-lg transition-all" style={{ ...selBtn(population === p), fontSize: 11 }}>
                  {POP_LABELS[p]}
                </button>
              ))}
            </div>

            <label style={{ fontSize: 11, color: '#86909C', fontWeight: 500, display: 'block', marginBottom: 6 }}>性别</label>
            <div className="grid grid-cols-3 gap-1.5">
              {(Object.keys(GENDER_LABELS) as Gender[]).map(g => (
                <button key={g} onClick={() => { setGender(g); setModelGenerated(false); }}
                  className="py-2 rounded-lg transition-all" style={{ ...selBtn(gender === g), fontSize: 11 }}>
                  {GENDER_LABELS[g]}
                </button>
              ))}
            </div>
          </div>

          <button onClick={handleGenerate} disabled={generating}
            className="w-full py-3 rounded-xl flex items-center justify-center gap-2 text-white"
            style={generating ? { background: '#F2F3F5', color: '#86909C' } : { background: G.primary, fontSize: 13, fontWeight: 600 }}>
            {generating ? (
              <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> 生成中...</>
            ) : (
              <><Sparkles size={15} /> 生成底模方案</>
            )}
          </button>
        </div>
      )}

      {/* Tab 2: Model */}
      {activeTab === 'model' && (
        <div className="space-y-4">
          {!modelGenerated ? (
            <div className="flex flex-col items-center justify-center py-16 bg-white rounded-xl" style={{ border: '1px solid #E5E6EB' }}>
              <Box size={32} className="mb-2" style={{ color: '#C9CDD4' }} />
              <p style={{ fontSize: 12, color: '#4E5969' }}>请先在「配置」中生成</p>
              <button onClick={() => setActiveTab('config')} className="mt-2 px-3 py-1.5 rounded-lg" style={{ fontSize: 11, color: G.primary, background: G.bg }}>
                前往配置
              </button>
            </div>
          ) : (
            <>
              <div className="flex items-center gap-2 p-3 rounded-xl" style={{ background: G.bgLight, border: `1px solid ${G.border}` }}>
                <CheckCircle size={14} style={{ color: G.primary }} />
                <span style={{ fontSize: 12, fontWeight: 600, color: '#1D2129' }}>底模已生成</span>
              </div>

              {/* Blueprint */}
              <div className="bg-white rounded-xl overflow-hidden" style={{ border: '1px solid #E5E6EB' }}>
                <div className="px-3 py-2.5 border-b flex items-center gap-1.5" style={{ borderColor: '#F2F3F5' }}>
                  <Box size={12} style={{ color: G.primary }} />
                  <span style={{ fontSize: 12, fontWeight: 600, color: '#1D2129' }}>蓝图预览</span>
                </div>
                <div className="p-3" style={{ background: '#FAFBFC' }}>
                  <PhoneBlueprint
                    width={params.width.recommended}
                    height={params.height.recommended}
                    thickness={params.thickness.recommended}
                    cornerRadius={params.cornerRadius.recommended}
                    formFactor={formFactor}
                  />
                </div>
              </div>

              {/* Key specs */}
              <div className="bg-white rounded-xl p-4" style={{ border: '1px solid #E5E6EB' }}>
                <span style={{ fontSize: 12, fontWeight: 600, color: '#1D2129', display: 'block', marginBottom: 8 }}>核心尺寸</span>
                {Object.entries(params).map(([key, p]) => {
                  const label: Record<string, string> = { width: '宽度', height: '高度', thickness: '厚度', weight: '重量', cornerRadius: '圆角' };
                  return (
                    <div key={key} className="flex items-center justify-between py-2" style={{ borderBottom: '1px solid #F2F3F5' }}>
                      <span style={{ fontSize: 11, color: '#86909C' }}>{label[key]}</span>
                      <div className="flex items-center gap-1.5">
                        <span style={{ fontSize: 13, fontWeight: 700, color: G.primary }}>{p.recommended}</span>
                        <span style={{ fontSize: 10, color: '#86909C' }}>{p.unit}</span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {modelGenerated && (
                <button onClick={() => setSaved(true)}
                  className="w-full py-3 rounded-xl flex items-center justify-center gap-2 transition-all"
                  style={saved
                    ? { background: G.bg, color: G.text, fontSize: 13, fontWeight: 600 }
                    : { background: G.primary, color: 'white', fontSize: 13, fontWeight: 600 }
                  }>
                  <Save size={14} /> {saved ? '已保存' : '保存方案'}
                </button>
              )}
            </>
          )}
        </div>
      )}

      {/* Tab 3: Data */}
      {activeTab === 'data' && (
        <div className="space-y-4">
          {/* Coverage curve */}
          <div className="bg-white rounded-xl p-4" style={{ border: '1px solid #E5E6EB' }}>
            <span style={{ fontSize: 12, fontWeight: 600, color: '#1D2129', display: 'block', marginBottom: 8 }}>宽度 × 人群覆盖率</span>
            <ResponsiveContainer width="100%" height={180}>
              <AreaChart data={curveData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                <defs>
                  <linearGradient id="idCovGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={G.primary} stopOpacity={0.2} />
                    <stop offset="95%" stopColor={G.primary} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="width" tick={{ fontSize: 9, fill: '#94a3b8' }} axisLine={false} tickLine={false} tickFormatter={v => `${v}`} />
                <YAxis tick={{ fontSize: 9, fill: '#94a3b8' }} axisLine={false} tickLine={false} unit="%" domain={[0, 100]} />
                <Tooltip formatter={(v: number) => [`${v.toFixed(1)}%`, '覆盖率']} contentStyle={{ fontSize: 11, borderRadius: 8, border: '1px solid #e2e8f0' }} />
                <Area type="monotone" dataKey="coverage" stroke={G.primary} strokeWidth={2} fill="url(#idCovGrad)" dot={false} />
                <ReferenceLine x={params.width.recommended} stroke={G.dark} strokeDasharray="4 3" strokeWidth={1.5}
                  label={{ value: `${params.width.recommended}mm`, fontSize: 9, fill: G.dark, position: 'top' }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Hand distribution */}
          <div className="bg-white rounded-xl p-4" style={{ border: '1px solid #E5E6EB' }}>
            <span style={{ fontSize: 12, fontWeight: 600, color: '#1D2129', display: 'block', marginBottom: 8 }}>手型分布</span>
            <ResponsiveContainer width="100%" height={160}>
              <BarChart data={handData} barCategoryGap="20%">
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="size" tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 9, fill: '#94a3b8' }} axisLine={false} tickLine={false} unit="%" />
                <Tooltip formatter={(v: number) => [`${v}%`, '占比']} contentStyle={{ fontSize: 11, borderRadius: 8, border: '1px solid #e2e8f0' }} />
                <Bar dataKey="pct" radius={[6, 6, 0, 0]}>
                  {handData.map((_, i) => <Cell key={`cell-${i}`} fill={BAR_FILLS[i]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Param summary */}
          <div className="bg-white rounded-xl overflow-hidden" style={{ border: '1px solid #E5E6EB' }}>
            <div className="px-3 py-2.5 border-b" style={{ borderColor: '#F2F3F5' }}>
              <span style={{ fontSize: 12, fontWeight: 600, color: '#1D2129' }}>推荐参数汇总</span>
            </div>
            {Object.entries(params).map(([key, p]) => {
              const label: Record<string, string> = { width: '宽度', height: '高度', thickness: '厚度', weight: '重量', cornerRadius: '圆角' };
              return (
                <div key={key} className="px-3 py-3" style={{ borderBottom: '1px solid #F2F3F5' }}>
                  <div className="flex items-center justify-between mb-1">
                    <span style={{ fontSize: 12, color: '#4E5969' }}>{label[key]}</span>
                    <span style={{ fontSize: 13, fontWeight: 700, color: G.primary }}>{p.recommended} {p.unit}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-1 rounded-full overflow-hidden" style={{ background: '#F2F3F5' }}>
                      <div className="h-full rounded-full" style={{ width: `${p.coverage}%`, background: p.coverage >= 90 ? G.primary : G.fill40 }} />
                    </div>
                    <span style={{ fontSize: 10, fontWeight: 600, color: p.coverage >= 90 ? G.primary : G.fill40 }}>{p.coverage}%</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
