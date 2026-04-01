import { useState } from 'react';
import { useParams, useNavigate } from 'react-router';
import { ArrowLeft, ArrowRight, CheckSquare, Square, RefreshCw } from 'lucide-react';
import { useAppStore } from '../../../store';

const ENV_PARAMS = [
  { label: '室温要求', default: '22±2°C', note: '影响热控制实验结果' },
  { label: '照明亮度', default: '500 lux', note: '标准办公室照明' },
  { label: '背景噪音上限', default: '≤40 dB', note: '声学实验需更低' },
  { label: '摄像机角度', default: '45°正面 + 侧面', note: '录制握持姿势' },
  { label: '录音设备放置', default: '距被试 30cm', note: '—' },
];

const CHECKLIST: { phase: string; items: string[] }[] = [
  {
    phase: '实验前',
    items: ['检查室内温度并记录', '校准压力测量设备', '启动录音录像设备并测试', '在桌面摆放知情同意书与指导语', '准备样机并确认编号与状态'],
  },
  {
    phase: '被试到达时',
    items: ['引导被试阅读并签署知情同意书', '简要说明实验流程（≤5分钟）', '确认被试已理解评分规则', '记录被试手型参数（手长/手宽/虎口）'],
  },
  {
    phase: '实验进行中',
    items: ['启动录像并确认拍摄角度', '计时并记录关键节点', '如被试提出不适立即中止并记录', '确保量表按序作答'],
  },
  {
    phase: '实验结束后',
    items: ['保存录像并备份', '导出量表作答数据', '向被试致谢并发放报酬', '清洁实验区域并重置设备'],
  },
];

const DEVICES = [
  { name: '摄像头', status: 'connected' as const },
  { name: '录音模块', status: 'connected' as const },
  { name: '压力板', status: 'disconnected' as const },
];

export function SetupPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { state, dispatch } = useAppStore();
  const project = state.heProjects.find(p => p.id === id);

  const [checked, setChecked] = useState<Set<string>>(new Set());
  const [envParams, setEnvParams] = useState<Record<string, string>>(
    Object.fromEntries(ENV_PARAMS.map(p => [p.label, p.default]))
  );
  const [deviceStatus, setDeviceStatus] = useState(DEVICES);

  if (!project) return null;

  const total = CHECKLIST.reduce((s, c) => s + c.items.length, 0);
  const doneCount = checked.size;
  const allRequired = CHECKLIST[0].items.filter(item => checked.has(item)).length >= 3;

  function toggle(item: string) {
    setChecked(prev => { const next = new Set(prev); next.has(item) ? next.delete(item) : next.add(item); return next; });
  }

  function retryDevice(name: string) {
    setDeviceStatus(prev => prev.map(d => d.name === name ? { ...d, status: 'connected' } : d));
  }

  return (
    <div className="p-5 space-y-4 max-w-5xl">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-base" style={{ fontWeight: 700, color: '#1D2129' }}>设备准备与环境核查</h2>
          <p className="text-sm mt-0.5" style={{ color: '#86909C' }}>Checklist {doneCount}/{total} 项已完成</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10">
            <svg viewBox="0 0 36 36" className="rotate-[-90deg]">
              <circle cx="18" cy="18" r="15.9" fill="none" stroke="#E5E6EB" strokeWidth="3" />
              <circle cx="18" cy="18" r="15.9" fill="none" stroke="#3370FF" strokeWidth="3"
                strokeDasharray={`${(doneCount / total) * 100} 100`} strokeLinecap="round" />
            </svg>
          </div>
          <div className="px-3 py-1.5 rounded-full text-xs" style={{ background: '#EEF3FF', color: '#3370FF', fontWeight: 500 }}>步骤 4 / 6</div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {/* Env params */}
        <div className="bg-white rounded-xl border p-4" style={{ borderColor: '#E5E6EB' }}>
          <h3 className="text-sm mb-4" style={{ fontWeight: 600, color: '#1D2129' }}>环境标准参数</h3>
          <div className="space-y-3">
            {ENV_PARAMS.map(p => (
              <div key={p.label}>
                <label className="text-xs mb-1 block" style={{ color: '#86909C', fontWeight: 500 }}>{p.label}</label>
                <input type="text" value={envParams[p.label]}
                  onChange={e => setEnvParams(prev => ({ ...prev, [p.label]: e.target.value }))}
                  className="w-full rounded-lg px-3 py-2 text-sm outline-none"
                  style={{ border: '1px solid #E5E6EB', color: '#1D2129' }}
                  onFocus={e => e.target.style.borderColor = '#3370FF'}
                  onBlur={e => e.target.style.borderColor = '#E5E6EB'} />
                <p className="text-xs mt-0.5" style={{ color: '#C9CDD4' }}>{p.note}</p>
              </div>
            ))}
          </div>

          <div className="mt-4 pt-4 border-t" style={{ borderColor: '#F2F3F5' }}>
            <h4 className="text-xs mb-3" style={{ fontWeight: 600, color: '#1D2129' }}>设备连接状态</h4>
            <div className="space-y-2">
              {deviceStatus.map(d => (
                <div key={d.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm" style={{ color: '#1D2129' }}>
                    <div className="w-2 h-2 rounded-full" style={{ background: d.status === 'connected' ? '#00B42A' : '#F53F3F' }} />
                    {d.name}
                  </div>
                  {d.status === 'disconnected' ? (
                    <button onClick={() => retryDevice(d.name)} className="flex items-center gap-1 text-xs" style={{ color: '#F53F3F' }}>
                      <RefreshCw size={10} /> 重试
                    </button>
                  ) : (
                    <span className="text-xs" style={{ color: '#00B42A' }}>已连接</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Checklist */}
        <div className="col-span-2 space-y-3">
          {CHECKLIST.map(phase => (
            <div key={phase.phase} className="bg-white rounded-xl border p-4" style={{ borderColor: '#E5E6EB' }}>
              <h3 className="text-sm mb-3" style={{ fontWeight: 600, color: '#1D2129' }}>{phase.phase}</h3>
              <div className="space-y-2">
                {phase.items.map(item => (
                  <label key={item} className="flex items-start gap-3 cursor-pointer group">
                    <div onClick={() => toggle(item)}
                      className="flex items-center justify-center flex-shrink-0 mt-0.5 transition-all rounded-md border-2"
                      style={{
                        width: 18, height: 18,
                        borderColor: checked.has(item) ? '#3370FF' : '#C9CDD4',
                        background: checked.has(item) ? '#3370FF' : 'transparent',
                      }}>
                      {checked.has(item) && <CheckSquare size={10} className="text-white" style={{ strokeWidth: 3 }} />}
                    </div>
                    <span className="text-sm leading-relaxed" style={{ color: checked.has(item) ? '#C9CDD4' : '#1D2129', textDecoration: checked.has(item) ? 'line-through' : 'none' }}>
                      {item}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-between pt-4 border-t" style={{ borderColor: '#E5E6EB' }}>
        <button onClick={() => navigate(`/tob/he/projects/${id}/run/lab`)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm"
          style={{ border: '1px solid #E5E6EB', color: '#4E5969', background: 'white' }}>
          <ArrowLeft size={15} /> 上一步
        </button>
        <div className="flex items-center gap-3">
          {!allRequired && <p className="text-xs" style={{ color: '#FF7D00' }}>请至少完成「实验前」阶段的 3 项清单</p>}
          <button onClick={() => {
            dispatch({ type: 'UPDATE_HE_PROJECT', payload: { id: id!, updates: { currentStep: 'collect' } } });
            navigate(`/tob/he/projects/${id}/run/collect`);
          }}
            disabled={!allRequired}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm text-white shadow-sm"
            style={allRequired ? { background: '#3370FF', fontWeight: 500 } : { background: '#C9CDD4', cursor: 'not-allowed' }}>
            准备完成 · 开始数据采集 <ArrowRight size={15} />
          </button>
        </div>
      </div>
    </div>
  );
}