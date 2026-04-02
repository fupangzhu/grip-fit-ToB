import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router';
import { ArrowRight, Users, Activity, Zap, Radio, Wifi, Check, ChevronRight } from 'lucide-react';
import { useAppStore } from '../../../store';

const SENSORS = [
  { key: 'eeg', name: 'EEG 脑电', sub: '32通道 · 凝胶电极', signal: 92, ch: '32ch' },
  { key: 'eda', name: 'EDA 皮电', sub: '手指电极 · 双通道', signal: 88, ch: '2ch' },
  { key: 'cam', name: '4K 摄像', sub: '多角度 · 自动追踪', signal: 100, ch: '×4' },
  { key: 'sync', name: '云端同步', sub: '实时加密上传', signal: 97, ch: '实时' },
];

function SignalBar({ pct, active }: { pct: number; active: boolean }) {
  return (
    <div className="flex items-center gap-1.5">
      <div className="flex-1 h-1.5 rounded-full" style={{ background: '#F2F3F5' }}>
        <div className="h-full rounded-full transition-all duration-700"
          style={{ width: active ? `${pct}%` : '0%', background: pct > 90 ? '#00B42A' : '#3370FF' }} />
      </div>
      <span style={{ fontSize: 9, color: '#86909C', width: 22, textAlign: 'right' }}>
        {active ? `${pct}%` : '—'}
      </span>
    </div>
  );
}

function SessionTimer({ active }: { active: boolean }) {
  const [secs, setSecs] = useState(0);
  const ref = useRef<ReturnType<typeof setInterval> | null>(null);
  useEffect(() => {
    if (active) {
      ref.current = setInterval(() => setSecs(s => s + 1), 1000);
    } else {
      if (ref.current) clearInterval(ref.current);
    }
    return () => { if (ref.current) clearInterval(ref.current); };
  }, [active]);
  const m = String(Math.floor(secs / 60)).padStart(2, '0');
  const s = String(secs % 60).padStart(2, '0');
  return <span style={{ fontSize: 11, fontWeight: 700, color: '#3370FF', fontVariantNumeric: 'tabular-nums' }}>{m}:{s}</span>;
}

export function CollectPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { state, dispatch } = useAppStore();
  const project = state.heProjects.find(p => p.id === id)!;
  if (!project) return null;

  const [autoMode, setAutoMode] = useState(true);
  const [timerActive, setTimerActive] = useState(false);

  const confirmed = project.participants.filter(p => p.invitationStatus === 'confirmed');
  const done = confirmed.filter(p => p.recordingStatus === 'done').length;
  const recording = confirmed.filter(p => p.recordingStatus === 'recording').length;
  const pending = confirmed.filter(p => p.recordingStatus === 'pending').length;
  const progress = confirmed.length ? (done / confirmed.length) * 100 : 0;

  return (
    <div className="pb-8">

      {/* ── 1. 采集进度总览 ── */}
      <div className="px-4 pt-4">
        <div className="bg-white rounded-2xl p-4" style={{ border: '1px solid #E5E6EB' }}>
          <div className="flex items-center justify-between mb-2">
            <span style={{ fontSize: 13, fontWeight: 700, color: '#1D2129' }}>采集进度总览</span>
            <span style={{ fontSize: 11, color: '#86909C' }}>{done}/{confirmed.length} 完成</span>
          </div>

          {/* Progress bar */}
          <div className="h-2.5 rounded-full mb-3 overflow-hidden" style={{ background: '#F2F3F5' }}>
            <div className="h-full rounded-full transition-all duration-700"
              style={{ width: `${progress}%`, background: progress === 100 ? '#00B42A' : '#3370FF' }} />
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-3 gap-2">
            {[
              { label: '已完成', value: done, color: '#00B42A', bg: '#F6FFED' },
              { label: '采集中', value: recording, color: '#3370FF', bg: '#EEF3FF' },
              { label: '待开始', value: pending, color: '#86909C', bg: '#F7F8FA' },
            ].map(s => (
              <div key={s.label} className="py-2.5 rounded-xl text-center" style={{ background: s.bg }}>
                <div style={{ fontSize: 18, fontWeight: 800, color: s.color }}>{s.value}</div>
                <div style={{ fontSize: 10, color: s.color, opacity: 0.85, marginTop: 1 }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="h-2 my-3" style={{ background: '#F7F8FA' }} />

      {/* ── 2. 自动采集模块 ── */}
      <div className="px-4 py-1">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-1.5">
            <Activity size={13} style={{ color: '#3370FF' }} />
            <span style={{ fontSize: 13, fontWeight: 700, color: '#1D2129' }}>自动采集模块</span>
          </div>
          {/* Mode toggle */}
          <button onClick={() => setAutoMode(v => !v)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full transition-all"
            style={{
              background: autoMode ? '#3370FF' : '#F2F3F5',
              border: `1.5px solid ${autoMode ? '#3370FF' : '#E5E6EB'}`,
            }}>
            <div className="w-2 h-2 rounded-full"
              style={{ background: autoMode ? 'white' : '#C9CDD4' }} />
            <span style={{ fontSize: 11, fontWeight: 600, color: autoMode ? 'white' : '#86909C' }}>
              {autoMode ? '自动模式' : '手动模式'}
            </span>
          </button>
        </div>

        {/* Sensor grid */}
        <div className="grid grid-cols-2 gap-2 mb-3">
          {SENSORS.map(s => (
            <div key={s.key} className="p-3 rounded-xl" style={{ background: 'white', border: `1px solid ${autoMode ? '#E5E6EB' : '#F2F3F5'}` }}>
              <div className="flex items-center justify-between mb-2">
                <span style={{ fontSize: 11, fontWeight: 700, color: '#1D2129' }}>{s.name}</span>
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 rounded-full"
                    style={{ background: autoMode ? '#00B42A' : '#C9CDD4', transition: 'background 0.3s' }} />
                </div>
              </div>
              <SignalBar pct={s.signal} active={autoMode} />
              <div style={{ fontSize: 9, color: '#86909C', marginTop: 4 }}>
                {s.ch} · {autoMode ? '已连接' : '待启动'}
              </div>
              <div style={{ fontSize: 9, color: '#C9CDD4', marginTop: 1 }}>{s.sub}</div>
            </div>
          ))}
        </div>

        {/* Status banner */}
        {autoMode ? (
          <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl"
            style={{ background: '#F0FFF4', border: '1px solid #B7EB8F' }}>
            <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: '#00B42A', animation: 'pulse 1.5s infinite' }} />
            <div className="flex-1">
              <div style={{ fontSize: 11, fontWeight: 600, color: '#00B42A' }}>系统就绪 · 自动采集已激活</div>
              <div style={{ fontSize: 10, color: '#52C41A', marginTop: 1 }}>被试入场后将自动触发录制，数据实时加密同步</div>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl"
            style={{ background: '#F7F8FA', border: '1px solid #E5E6EB' }}>
            <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: '#C9CDD4' }} />
            <div style={{ fontSize: 11, color: '#86909C' }}>手动模式：进入被试详情页逐一开始录制</div>
          </div>
        )}
      </div>

      {/* ── 3. 实时计时器（手动模式下显示） ── */}
      {!autoMode && (
        <>
          <div className="h-2 my-3" style={{ background: '#F7F8FA' }} />
          <div className="px-4 py-2">
            <div className="flex items-center gap-1.5 mb-3">
              <Radio size={13} style={{ color: '#3370FF' }} />
              <span style={{ fontSize: 13, fontWeight: 700, color: '#1D2129' }}>会话计时器</span>
            </div>
            <div className="bg-white rounded-2xl p-4 flex items-center justify-between"
              style={{ border: '1px solid #E5E6EB' }}>
              <div>
                <div style={{ fontSize: 10, color: '#86909C', marginBottom: 4 }}>当前会话用时</div>
                <SessionTimer active={timerActive} />
              </div>
              <div className="flex gap-2">
                <button onClick={() => setTimerActive(v => !v)}
                  className="px-4 py-2 rounded-xl flex items-center gap-1.5 text-white"
                  style={{ background: timerActive ? '#F53F3F' : '#3370FF', fontSize: 12, fontWeight: 600 }}>
                  {timerActive ? '暂停' : '开始'}
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      <div className="h-2 my-3" style={{ background: '#F7F8FA' }} />

      {/* ── 4. 被试采集列表 ── */}
      <div className="px-4 py-1">
        <div className="flex items-center gap-1.5 mb-3">
          <Users size={13} style={{ color: '#3370FF' }} />
          <span style={{ fontSize: 13, fontWeight: 700, color: '#1D2129' }}>被试采集列表</span>
        </div>

        <div className="space-y-2">
          {confirmed.map(p => {
            const isDone = p.recordingStatus === 'done';
            const isRec = p.recordingStatus === 'recording';
            const statusColor = isDone ? '#00B42A' : isRec ? '#3370FF' : '#86909C';
            const statusBg = isDone ? '#F6FFED' : isRec ? '#EEF3FF' : '#F7F8FA';
            const statusLabel = isDone ? '✓ 完成' : isRec ? '采集中' : '待开始';
            const questPct = p.questTotal > 0 ? Math.round((p.questProgress / p.questTotal) * 100) : 0;

            return (
              <div key={p.code}
                onClick={() => navigate(`/tob/he/projects/${id}/run/collect/${p.code}`)}
                className="bg-white rounded-2xl p-3 active:bg-gray-50"
                style={{
                  border: `${isRec ? '2px' : '1px'} solid ${isRec ? '#3370FF' : '#E5E6EB'}`,
                  cursor: 'pointer',
                }}>
                <div className="flex items-center gap-2.5">
                  {/* Avatar */}
                  <div className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{ background: statusBg, fontSize: 11, fontWeight: 700, color: statusColor }}>
                    {p.code.slice(-2)}
                  </div>

                  <div className="flex-1 min-w-0">
                    {/* Row 1 */}
                    <div className="flex items-center gap-2 mb-1.5">
                      <span style={{ fontSize: 12, fontWeight: 700, color: '#1D2129' }}>{p.code}</span>
                      <span style={{ fontSize: 9, color: '#86909C' }}>
                        {p.handLength}mm · {p.gripHabit === 'onehand' ? '单手' : '双手'} · {p.ageGroup}
                      </span>
                      <span className="ml-auto px-2 py-0.5 rounded-full"
                        style={{ fontSize: 9, fontWeight: 600, background: statusBg, color: statusColor }}>
                        {statusLabel}
                      </span>
                    </div>

                    {/* Quest progress */}
                    <div className="flex items-center gap-2">
                      <span style={{ fontSize: 9, color: '#86909C', flexShrink: 0 }}>量表</span>
                      <div className="flex-1 h-1.5 rounded-full" style={{ background: '#F2F3F5' }}>
                        <div className="h-full rounded-full transition-all"
                          style={{ width: `${questPct}%`, background: isDone ? '#00B42A' : '#3370FF' }} />
                      </div>
                      <span style={{ fontSize: 9, color: '#86909C', flexShrink: 0 }}>{p.questProgress}/{p.questTotal}</span>
                    </div>

                    {/* Recording indicator */}
                    {isRec && (
                      <div className="flex items-center gap-1.5 mt-1.5">
                        <div className="w-1.5 h-1.5 rounded-full" style={{ background: '#3370FF' }} />
                        <span style={{ fontSize: 9, color: '#3370FF', fontWeight: 600 }}>录制中 · EEG+EDA+CAM 实时同步</span>
                      </div>
                    )}
                  </div>

                  <ChevronRight size={14} style={{ color: '#C9CDD4', flexShrink: 0 }} />
                </div>
              </div>
            );
          })}

          {confirmed.length === 0 && (
            <div className="text-center py-12">
              <Users size={28} className="mx-auto mb-2" style={{ color: '#C9CDD4' }} />
              <p style={{ fontSize: 12, color: '#86909C' }}>暂无已确认被试</p>
              <p style={{ fontSize: 10, color: '#C9CDD4', marginTop: 4 }}>请先在「被试方案」步骤确认被试</p>
            </div>
          )}
        </div>
      </div>

      {/* ── 数据完整性提示 ── */}
      {done > 0 && (
        <>
          <div className="h-2 my-3" style={{ background: '#F7F8FA' }} />
          <div className="px-4 py-2">
            <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid #E5E6EB' }}>
              <div className="px-3 py-2" style={{ background: '#F7F8FA', borderBottom: '1px solid #E5E6EB' }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: '#1D2129' }}>数据质量概览</span>
              </div>
              {[
                { label: '已录制被试', value: `${done} 人` },
                { label: '数据完整率', value: '96.4%' },
                { label: 'EEG 有效段落', value: `${done * 12} 段` },
                { label: '量表完成率', value: `${Math.round((confirmed.filter(p => p.questProgress === p.questTotal && p.questTotal > 0).length / Math.max(done, 1)) * 100)}%` },
                { label: '自动标记伪迹', value: `${done * 3} 处` },
              ].map((item, i, arr) => (
                <div key={item.label} className="flex items-center justify-between px-3 py-2.5 bg-white"
                  style={{ borderBottom: i < arr.length - 1 ? '1px solid #F2F3F5' : 'none' }}>
                  <span style={{ fontSize: 11, color: '#86909C' }}>{item.label}</span>
                  <span style={{ fontSize: 11, fontWeight: 700, color: '#1D2129' }}>{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {/* ── CTA ── */}
      <div className="px-4 pt-4">
        <button onClick={() => {
          dispatch({ type: 'UPDATE_HE_PROJECT', payload: { id: id!, updates: { currentStep: 'analysis' } } });
          navigate(`/tob/he/projects/${id}/run/analysis`);
        }}
          className="w-full py-3 rounded-2xl flex items-center justify-center gap-1.5 text-white"
          style={{ background: '#3370FF', fontSize: 13, fontWeight: 700 }}>
          下一步：分析报告 <ArrowRight size={14} />
        </button>
      </div>
    </div>
  );
}
