import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router';
import { ArrowLeft, ArrowRight, AlertTriangle, CheckCircle, Clock, Play, FileEdit, Camera, Brain, Activity, Eye, Mic, Wifi, WifiOff, RefreshCw, Pause, BarChart2, ChevronDown } from 'lucide-react';
import { useAppStore } from '../../../store';

const SIGNAL_COLORS = { good: '#00B42A', warn: '#FF7D00', error: '#F53F3F', idle: '#C9CDD4' };

export function CollectPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { state, dispatch } = useAppStore();
  const project = state.heProjects.find(p => p.id === id)!;

  const [warnings, setWarnings] = useState([
    { type: 'warning', msg: 'P004 量表作答时间异常（47秒完成18题），建议复测', dismissed: false },
    { type: 'warning', msg: 'EDA 信号基线偏高（P007），请检查传感器接触', dismissed: false },
  ]);
  const [activeParticipant, setActiveParticipant] = useState<string | null>(null);
  const [eegSimTime, setEegSimTime] = useState(0);
  const [edaSimValue, setEdaSimValue] = useState(4.2);

  useEffect(() => {
    const t = setInterval(() => {
      setEegSimTime(p => p + 1);
      setEdaSimValue(p => parseFloat((p + (Math.random() - 0.5) * 0.3).toFixed(2)));
    }, 1000);
    return () => clearInterval(t);
  }, []);

  if (!project) return null;

  const participants = project.participants;
  const done = participants.filter(p => p.recordingStatus === 'done');
  const inProgress = participants.filter(p => p.recordingStatus === 'recording');
  const pending = participants.filter(p => p.recordingStatus === 'pending');
  const allDone = done.length === participants.length && participants.length > 0;

  // Automated signal streams
  const signalStreams = [
    {
      id: 'scale', label: '主观量表', icon: FileEdit, status: 'active',
      detail: `自动化采集中 · ${done.length}/${participants.length} 人已完成`,
      subDetail: '二维码扫码作答 · 实时同步服务器',
      color: '#3370FF', value: `${participants.length > 0 ? Math.round(done.length / participants.length * 100) : 0}%`,
    },
    {
      id: 'video', label: '视频录制', icon: Camera, status: 'active',
      detail: '摄像头 1,2 录制中 · 自动标注时间戳',
      subDetail: '分辨率 1080p · 帧率 30fps',
      color: '#00B42A', value: `${done.length + inProgress.length} 段`,
    },
    {
      id: 'audio', label: '音频采集', icon: Mic, status: 'active',
      detail: '全向麦克风录音中 · 音量正常',
      subDetail: '采样率 44.1kHz · WAV格式',
      color: '#00B42A', value: `${Math.round(eegSimTime / 60)}:${String(eegSimTime % 60).padStart(2, '0')}`,
    },
    {
      id: 'face', label: '面部情绪识别', icon: Eye, status: 'active',
      detail: '基于 FaceAction AU 编码 · 实时识别 7 类情绪',
      subDetail: `愉悦 34% · 中性 51% · 厌倦 15%`,
      color: '#FF7D00', value: 'LIVE',
    },
    {
      id: 'eeg', label: 'EEG 脑电', icon: Brain, status: 'active',
      detail: '14通道采集中 · 128Hz采样 · 阻抗均正常',
      subDetail: `α波 8.3μV · β波 12.1μV · 注意力指数 ${Math.round(60 + Math.sin(eegSimTime * 0.1) * 15)}%`,
      color: '#8B5CF6', value: `${128}Hz`,
    },
    {
      id: 'eda', label: '皮肤电导（EDA）', icon: Activity, status: 'active',
      detail: `实时监测皮肤电导变化 · 当前值 ${edaSimValue} μS`,
      subDetail: `SCR 峰值 ${(edaSimValue * 0.8).toFixed(1)} · 唤醒度 ${Math.round(edaSimValue * 12)}%`,
      color: '#06B6D4', value: `${edaSimValue}μS`,
    },
  ];

  const dismissWarning = (i: number) => {
    setWarnings(prev => prev.map((w, idx) => idx === i ? { ...w, dismissed: true } : w));
  };

  const activeWarnings = warnings.filter(w => !w.dismissed);

  return (
    <div className="p-5 space-y-4 max-w-5xl">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-base" style={{ fontWeight: 700, color: '#1D2129' }}>自动化数据采集</h2>
          <p className="text-sm mt-0.5" style={{ color: '#86909C' }}>实验进行中 · 所有数据流实时自动采集 · 无需手动导入</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs" style={{ background: '#E8F7EA', color: '#00B42A', fontWeight: 500 }}>
            <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
            采集中
          </div>
          <div className="px-3 py-1.5 rounded-full text-xs" style={{ background: '#EEF3FF', color: '#3370FF', fontWeight: 500 }}>步骤 5 / 6</div>
        </div>
      </div>

      {/* Alerts */}
      {activeWarnings.length > 0 && (
        <div className="space-y-2">
          {activeWarnings.map((w, i) => (
            <div key={i} className="flex items-center gap-3 p-3 rounded-xl border" style={{ background: '#FFF7E8', borderColor: '#FFD65B' }}>
              <AlertTriangle size={15} style={{ color: '#FF7D00', flexShrink: 0 }} />
              <span className="text-sm flex-1" style={{ color: '#7D4E00' }}>{w.msg}</span>
              <button onClick={() => dismissWarning(i)} className="text-xs px-2 py-1 rounded-lg" style={{ color: '#86909C', border: '1px solid #E5E6EB' }}>忽略</button>
            </div>
          ))}
        </div>
      )}

      {/* Signal streams grid */}
      <div className="grid grid-cols-3 gap-3">
        {signalStreams.map(s => (
          <div key={s.id} className="bg-white rounded-xl border p-3.5 transition-all hover:shadow-sm" style={{ borderColor: '#E5E6EB' }}>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full animate-pulse" style={{ background: s.color }} />
                <s.icon size={14} style={{ color: s.color }} />
                <span className="text-sm" style={{ fontWeight: 600, color: '#1D2129' }}>{s.label}</span>
              </div>
              <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: `${s.color}15`, color: s.color, fontWeight: 600 }}>{s.value}</span>
            </div>
            <p className="text-xs mb-1" style={{ color: '#4E5969' }}>{s.detail}</p>
            <p className="text-xs" style={{ color: '#86909C' }}>{s.subDetail}</p>
          </div>
        ))}
      </div>

      {/* Real-time EEG/EDA visualization */}
      <div className="grid grid-cols-2 gap-4">
        {/* EEG waveform (simulated) */}
        <div className="bg-white rounded-xl border p-4" style={{ borderColor: '#E5E6EB' }}>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm" style={{ fontWeight: 600, color: '#1D2129' }}>EEG 实时波形（当前被试）</h3>
            <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: '#F3F0FF', color: '#8B5CF6' }}>P013 · 通道 Fz/Cz</span>
          </div>
          <div className="rounded-lg overflow-hidden" style={{ background: '#0A0A1A', height: 80 }}>
            <svg width="100%" height="80" viewBox="0 0 400 80">
              {Array.from({ length: 50 }, (_, i) => {
                const x1 = i * 8;
                const x2 = (i + 1) * 8;
                const y1 = 40 + Math.sin((i + eegSimTime * 2) * 0.4) * 15 + Math.sin((i + eegSimTime) * 1.2) * 8;
                const y2 = 40 + Math.sin((i + 1 + eegSimTime * 2) * 0.4) * 15 + Math.sin((i + 1 + eegSimTime) * 1.2) * 8;
                return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#8B5CF6" strokeWidth="1.5" opacity="0.9" />;
              })}
              {Array.from({ length: 50 }, (_, i) => {
                const x1 = i * 8;
                const x2 = (i + 1) * 8;
                const y1 = 40 + Math.cos((i + eegSimTime * 1.5) * 0.3) * 10 + Math.random() * 4;
                const y2 = 40 + Math.cos((i + 1 + eegSimTime * 1.5) * 0.3) * 10 + Math.random() * 4;
                return <line key={`c${i}`} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#06B6D4" strokeWidth="1" opacity="0.6" />;
              })}
            </svg>
          </div>
          <div className="flex gap-3 mt-2">
            {[{ label: 'α', value: '8.3μV', color: '#8B5CF6' }, { label: 'β', value: '12.1μV', color: '#06B6D4' }, { label: 'θ', value: '4.7μV', color: '#10B981' }].map(b => (
              <div key={b.label} className="flex items-center gap-1">
                <div className="w-2 h-0.5 rounded-full" style={{ background: b.color }} />
                <span className="text-xs" style={{ color: '#86909C' }}>{b.label} {b.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* EDA */}
        <div className="bg-white rounded-xl border p-4" style={{ borderColor: '#E5E6EB' }}>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm" style={{ fontWeight: 600, color: '#1D2129' }}>皮肤电导（EDA）实时趋势</h3>
            <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: '#ECFEFF', color: '#06B6D4' }}>{edaSimValue} μS</span>
          </div>
          <div className="rounded-lg overflow-hidden" style={{ background: '#F0FFFE', height: 80, position: 'relative' }}>
            <svg width="100%" height="80" viewBox="0 0 400 80">
              <defs>
                <linearGradient id="edaGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#06B6D4" stopOpacity="0.3" />
                  <stop offset="100%" stopColor="#06B6D4" stopOpacity="0.05" />
                </linearGradient>
              </defs>
              {/* EDA line */}
              <polyline
                points={Array.from({ length: 40 }, (_, i) => `${i * 10},${40 - Math.sin(i * 0.3 + eegSimTime * 0.2) * 20 - Math.random() * 5}`).join(' ')}
                fill="none" stroke="#06B6D4" strokeWidth="2"
              />
              {/* SCR spikes */}
              {[80, 180, 290].map((x, i) => (
                <line key={i} x1={x} y1={40} x2={x} y2={15} stroke="#F53F3F" strokeWidth="1" strokeDasharray="3 2" opacity="0.6" />
              ))}
            </svg>
            <div className="absolute top-1 right-2 text-xs" style={{ color: '#06B6D4' }}>SCR 峰值标记</div>
          </div>
          <div className="flex gap-4 mt-2 text-xs" style={{ color: '#86909C' }}>
            <span>基线 {(edaSimValue * 0.7).toFixed(1)} μS</span>
            <span>峰值 {(edaSimValue * 1.3).toFixed(1)} μS</span>
            <span>唤醒度 {Math.round(edaSimValue * 12)}%</span>
          </div>
        </div>
      </div>

      {/* Overall progress */}
      <div className="bg-white rounded-xl border p-4" style={{ borderColor: '#E5E6EB' }}>
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm" style={{ fontWeight: 600, color: '#1D2129' }}>总体采集进度</span>
          <span className="text-sm" style={{ color: '#4E5969' }}>
            已完成 <span style={{ color: '#3370FF', fontWeight: 700 }}>{done.length}</span> / {participants.length} 人
          </span>
        </div>
        <div className="h-2.5 rounded-full overflow-hidden mb-3" style={{ background: '#F2F3F5' }}>
          <div className="h-full rounded-full transition-all" style={{ width: `${(done.length / (participants.length || 1)) * 100}%`, background: 'linear-gradient(90deg, #3370FF, #00B42A)' }} />
        </div>
        <div className="flex gap-5 text-xs" style={{ color: '#86909C' }}>
          <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full inline-block" style={{ background: '#00B42A' }} />已完成 {done.length}</span>
          <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full inline-block" style={{ background: '#3370FF' }} />进行中 {inProgress.length}</span>
          <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full inline-block" style={{ background: '#C9CDD4' }} />待开始 {pending.length}</span>
        </div>
      </div>

      {/* Participant table */}
      <div className="bg-white rounded-xl border overflow-hidden" style={{ borderColor: '#E5E6EB' }}>
        <div className="px-4 py-3 border-b flex items-center justify-between" style={{ borderColor: '#F2F3F5' }}>
          <h3 className="text-sm" style={{ fontWeight: 600, color: '#1D2129' }}>被试实验进度跟踪</h3>
          <span className="text-xs" style={{ color: '#86909C' }}>点击被试编号进入详细数据采集页</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead style={{ background: '#FAFAFA' }}>
              <tr>
                {['被试编号', '量表进度', '视频录制', 'EEG状态', 'EDA状态', '面部情绪', '操作'].map(h => (
                  <th key={h} className="px-4 py-2.5 text-left text-xs whitespace-nowrap" style={{ fontWeight: 600, color: '#86909C' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y" style={{ borderColor: '#F2F3F5' }}>
              {participants.slice(0, 12).map((p, i) => (
                <tr key={i} className="hover:bg-blue-50 transition-colors cursor-pointer group"
                  style={p.recordingStatus === 'recording' ? { background: '#F0F5FF' } : {}}
                  onClick={() => navigate(`/tob/he/projects/${id}/run/collect/${p.code}`)}>
                  <td className="px-4 py-3">
                    <span className="group-hover:underline" style={{ fontWeight: 500, color: '#3370FF' }}>{p.code}</span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-1.5 rounded-full overflow-hidden w-16" style={{ background: '#F2F3F5' }}>
                        <div className="h-full rounded-full" style={{ width: `${(p.questProgress / (p.questTotal || 1)) * 100}%`, background: '#3370FF' }} />
                      </div>
                      <span className="text-xs whitespace-nowrap" style={{ color: '#86909C' }}>{p.questProgress}/{p.questTotal}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    {p.recordingStatus === 'done' ? (
                      <span className="text-xs flex items-center gap-1" style={{ color: '#00B42A' }}><CheckCircle size={11} />已保存</span>
                    ) : p.recordingStatus === 'recording' ? (
                      <span className="text-xs flex items-center gap-1" style={{ color: '#F53F3F' }}><div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" />录制中</span>
                    ) : (
                      <span className="text-xs flex items-center gap-1" style={{ color: '#C9CDD4' }}><Clock size={11} />待开始</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <div className="w-1.5 h-1.5 rounded-full" style={{ background: p.recordingStatus === 'done' ? '#00B42A' : p.recordingStatus === 'recording' ? '#8B5CF6' : '#C9CDD4' }} />
                      <span className="text-xs" style={{ color: '#86909C' }}>{p.recordingStatus === 'done' ? '完成' : p.recordingStatus === 'recording' ? `${Math.round(70 + Math.random() * 20)}%` : '—'}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-xs" style={{ color: '#86909C' }}>
                      {p.recordingStatus === 'done' ? `${(3.5 + Math.random() * 2).toFixed(1)} μS` : p.recordingStatus === 'recording' ? `${edaSimValue.toFixed(1)} μS` : '—'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-xs" style={{ color: '#86909C' }}>
                      {p.recordingStatus !== 'pending' ? '中性 52%' : '—'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {p.recordingStatus === 'done' ? (
                      <button className="text-xs" style={{ color: '#3370FF' }}
                        onClick={e => { e.stopPropagation(); navigate(`/tob/he/projects/${id}/run/collect/${p.code}`); }}>查看→</button>
                    ) : p.recordingStatus === 'pending' ? (
                      <button className="text-xs px-2 py-0.5 rounded-lg text-white flex items-center gap-1" style={{ background: '#3370FF' }}
                        onClick={e => { e.stopPropagation(); navigate(`/tob/he/projects/${id}/run/collect/${p.code}`); }}>
                        <Play size={9} />开始
                      </button>
                    ) : (
                      <button className="text-xs" style={{ color: '#3370FF' }}
                        onClick={e => { e.stopPropagation(); navigate(`/tob/he/projects/${id}/run/collect/${p.code}`); }}>填写→</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="flex items-center justify-between pt-4 border-t" style={{ borderColor: '#E5E6EB' }}>
        <button onClick={() => navigate(`/tob/he/projects/${id}/run/setup`)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm"
          style={{ border: '1px solid #E5E6EB', color: '#4E5969', background: 'white' }}>
          <ArrowLeft size={15} /> 上一步
        </button>
        <button onClick={() => {
          dispatch({ type: 'UPDATE_HE_PROJECT', payload: { id: id!, updates: { currentStep: 'analysis' } } });
          navigate(`/tob/he/projects/${id}/run/analysis`);
        }}
          className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm text-white shadow-sm"
          style={{ background: '#3370FF', fontWeight: 500 }}>
          {allDone ? '所有数据已采集，进入自动分析' : `进入分析（${done.length}/${participants.length} 人已采集）`} <ArrowRight size={15} />
        </button>
      </div>
    </div>
  );
}