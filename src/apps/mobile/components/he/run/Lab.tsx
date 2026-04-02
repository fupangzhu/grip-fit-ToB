import { useState } from 'react';
import { useParams, useNavigate } from 'react-router';
import { MapPin, Check, Calendar, Clock, Users, FileCheck, ArrowRight, ChevronDown, ChevronUp } from 'lucide-react';
import { useAppStore, mockLabs } from '../../../store';

const TIME_SLOTS = [
  { id: 'am1', label: '09:00 – 11:00', available: true },
  { id: 'am2', label: '11:00 – 13:00', available: false },
  { id: 'pm1', label: '14:00 – 16:00', available: true },
  { id: 'pm2', label: '16:00 – 18:00', available: true },
];

const DATES = [
  { label: '今天', date: '04/02', day: '周四' },
  { label: '明天', date: '04/03', day: '周五' },
  { label: '', date: '04/07', day: '周一' },
  { label: '', date: '04/08', day: '周二' },
  { label: '', date: '04/09', day: '周三' },
];

const VENUE_CHECKS = [
  { key: 'clean', label: '场地清洁与消毒', detail: '桌面、椅子、设备表面全部清洁' },
  { key: 'power', label: '设备电源与充电确认', detail: '所有设备满电或已接通电源' },
  { key: 'sound', label: '隔音环境确认', detail: '背景噪音 < 40dB，关闭门窗' },
  { key: 'light', label: '照明条件达标', detail: '桌面照度 ≥ 500lux，避免眩光' },
  { key: 'temp', label: '室温调节完毕', detail: '20–24°C，相对湿度 40–60%' },
  { key: 'layout', label: '座位摆放确认', detail: '主试与被试间距 ≥ 1.5m' },
  { key: 'signs', label: '引导标识就位', detail: '门口及走廊引导牌已张贴' },
  { key: 'emergency', label: '应急通道畅通', detail: '紧急出口无遮挡，预案已备' },
  { key: 'privacy', label: '隐私保护确认', detail: '知情同意书打印备齐' },
  { key: 'refreshment', label: '茶水饮品准备', detail: '常温水、纸杯备好，避免有味饮品' },
];

export function LabPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { dispatch } = useAppStore();

  const [selectedLab, setSelectedLab] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [checklist, setChecklist] = useState<Set<string>>(new Set());
  const [notes, setNotes] = useState('');
  const [checklistOpen, setChecklistOpen] = useState(true);

  const toggleCheck = (key: string) => {
    setChecklist(prev => {
      const n = new Set(prev);
      n.has(key) ? n.delete(key) : n.add(key);
      return n;
    });
  };

  const selectedLabData = mockLabs.find(l => l.id === selectedLab);
  const selectedTimeData = TIME_SLOTS.find(t => t.id === selectedTime);
  const selectedDateData = DATES.find(d => d.date === selectedDate);
  const canProceed = !!selectedLab && !!selectedDate && !!selectedTime;
  const checkPct = Math.round((checklist.size / VENUE_CHECKS.length) * 100);

  return (
    <div className="pb-8">

      {/* ── 1. 选择实验场地 ── */}
      <div className="px-4 pt-4 pb-2">
        <div className="flex items-center gap-1.5 mb-3">
          <MapPin size={13} style={{ color: '#3370FF' }} />
          <span style={{ fontSize: 13, fontWeight: 700, color: '#1D2129' }}>选择实验场地</span>
        </div>
        <div className="space-y-2">
          {mockLabs.map(lab => {
            const sel = selectedLab === lab.id;
            return (
              <button key={lab.id} onClick={() => setSelectedLab(lab.id)}
                className="w-full p-3 rounded-2xl text-left transition-all"
                style={sel
                  ? { background: '#EEF3FF', border: '2px solid #3370FF' }
                  : { background: 'white', border: '1px solid #E5E6EB' }
                }>
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: sel ? '#3370FF' : '#F2F3F5' }}>
                    <MapPin size={14} style={{ color: sel ? 'white' : '#86909C' }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span style={{ fontSize: 13, fontWeight: 700, color: '#1D2129' }}>{lab.name}</span>
                      <span className="px-1.5 py-0.5 rounded-full" style={{
                        fontSize: 9, fontWeight: 600,
                        background: lab.available ? '#E8F7EA' : '#FFF0F0',
                        color: lab.available ? '#00B42A' : '#F53F3F',
                      }}>{lab.available ? '可预约' : '已占用'}</span>
                    </div>
                    <div className="flex items-center gap-1" style={{ fontSize: 10, color: '#86909C', marginBottom: 6 }}>
                      <span>{lab.location}</span>
                      <span>·</span>
                      <Users size={9} />
                      <span>容纳 {lab.capacity} 人</span>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {lab.equipment.map(eq => (
                        <span key={eq} className="px-1.5 py-0.5 rounded"
                          style={{ fontSize: 9, background: sel ? 'rgba(51,112,255,0.1)' : '#F2F3F5', color: sel ? '#3370FF' : '#4E5969' }}>
                          {eq}
                        </span>
                      ))}
                    </div>
                  </div>
                  {sel && (
                    <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                      style={{ background: '#3370FF' }}>
                      <Check size={10} className="text-white" />
                    </div>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <div className="h-2 my-2" style={{ background: '#F7F8FA' }} />

      {/* ── 2. 预约时间 ── */}
      <div className="px-4 py-3">
        <div className="flex items-center gap-1.5 mb-3">
          <Calendar size={13} style={{ color: '#3370FF' }} />
          <span style={{ fontSize: 13, fontWeight: 700, color: '#1D2129' }}>预约时间</span>
        </div>

        {/* Date scroll */}
        <div className="flex gap-2 overflow-x-auto pb-1 mb-3 -mx-0">
          {DATES.map(d => {
            const sel = selectedDate === d.date;
            return (
              <button key={d.date} onClick={() => setSelectedDate(d.date)}
                className="flex flex-col items-center px-3 py-2.5 rounded-2xl flex-shrink-0 transition-all"
                style={sel
                  ? { background: '#3370FF', minWidth: 60 }
                  : { background: 'white', border: '1px solid #E5E6EB', minWidth: 60 }
                }>
                {d.label
                  ? <span style={{ fontSize: 9, color: sel ? 'rgba(255,255,255,0.8)' : '#86909C', marginBottom: 1 }}>{d.label}</span>
                  : <span style={{ fontSize: 9, color: 'transparent', marginBottom: 1 }}>-</span>
                }
                <span style={{ fontSize: 14, fontWeight: 700, color: sel ? 'white' : '#1D2129' }}>{d.date}</span>
                <span style={{ fontSize: 9, color: sel ? 'rgba(255,255,255,0.7)' : '#86909C', marginTop: 1 }}>{d.day}</span>
              </button>
            );
          })}
        </div>

        {/* Time slots */}
        <div className="grid grid-cols-2 gap-2">
          {TIME_SLOTS.map(slot => {
            const sel = selectedTime === slot.id;
            return (
              <button key={slot.id}
                onClick={() => slot.available && setSelectedTime(slot.id)}
                disabled={!slot.available}
                className="p-2.5 rounded-xl text-center transition-all"
                style={!slot.available
                  ? { background: '#F7F8FA', border: '1px solid #F0F0F0', opacity: 0.55 }
                  : sel
                    ? { background: '#EEF3FF', border: '2px solid #3370FF' }
                    : { background: 'white', border: '1px solid #E5E6EB' }
                }>
                <div className="flex items-center justify-center gap-1">
                  <Clock size={11} style={{ color: sel ? '#3370FF' : '#86909C' }} />
                  <span style={{ fontSize: 11, fontWeight: sel ? 700 : 500, color: sel ? '#3370FF' : '#1D2129' }}>
                    {slot.label}
                  </span>
                </div>
                {!slot.available && (
                  <span style={{ fontSize: 9, color: '#F53F3F', display: 'block', marginTop: 2 }}>已被预约</span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── 3. 预约确认信息 ── */}
      {canProceed && (
        <>
          <div className="h-2 my-2" style={{ background: '#F7F8FA' }} />
          <div className="px-4 py-3">
            <div className="flex items-center gap-1.5 mb-3">
              <Check size={13} style={{ color: '#00B42A' }} />
              <span style={{ fontSize: 13, fontWeight: 700, color: '#1D2129' }}>预约确认信息</span>
            </div>
            <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid #E5E6EB' }}>
              {[
                { label: '实验场地', value: selectedLabData?.name ?? '' },
                { label: '场地位置', value: selectedLabData?.location ?? '' },
                { label: '预约日期', value: `${selectedDateData?.date ?? ''} (${selectedDateData?.day ?? ''})` },
                { label: '预约时段', value: selectedTimeData?.label ?? '' },
                { label: '最大容量', value: `${selectedLabData?.capacity ?? 0} 人` },
                { label: '可用设备', value: selectedLabData?.equipment.join(' / ') ?? '' },
              ].map((item, i, arr) => (
                <div key={item.label}
                  className="flex items-start gap-3 px-3 py-2.5 bg-white"
                  style={{ borderBottom: i < arr.length - 1 ? '1px solid #F2F3F5' : 'none' }}>
                  <span style={{ fontSize: 11, color: '#86909C', flexShrink: 0, width: 56 }}>{item.label}</span>
                  <span style={{ fontSize: 11, fontWeight: 600, color: '#1D2129', textAlign: 'right', flex: 1 }}>{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      <div className="h-2 my-2" style={{ background: '#F7F8FA' }} />

      {/* ── 4. 场地准备清单 ── */}
      <div className="px-4 py-3">
        <button className="flex items-center justify-between w-full mb-3"
          onClick={() => setChecklistOpen(v => !v)}>
          <div className="flex items-center gap-1.5">
            <FileCheck size={13} style={{ color: '#3370FF' }} />
            <span style={{ fontSize: 13, fontWeight: 700, color: '#1D2129' }}>场地准备清单</span>
          </div>
          <div className="flex items-center gap-2">
            <span style={{ fontSize: 11, color: checklist.size === VENUE_CHECKS.length ? '#00B42A' : '#86909C', fontWeight: 600 }}>
              {checklist.size}/{VENUE_CHECKS.length}
            </span>
            {checklistOpen ? <ChevronUp size={14} style={{ color: '#86909C' }} /> : <ChevronDown size={14} style={{ color: '#86909C' }} />}
          </div>
        </button>

        {/* Progress bar */}
        <div className="h-1.5 rounded-full mb-3" style={{ background: '#E5E6EB' }}>
          <div className="h-full rounded-full transition-all duration-500"
            style={{ width: `${checkPct}%`, background: checklist.size === VENUE_CHECKS.length ? '#00B42A' : '#3370FF' }} />
        </div>

        {checklistOpen && (
          <div className="space-y-1.5">
            {VENUE_CHECKS.map(item => {
              const done = checklist.has(item.key);
              return (
                <button key={item.key} onClick={() => toggleCheck(item.key)}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all"
                  style={done
                    ? { background: '#F6FFED', border: '1.5px solid #B7EB8F' }
                    : { background: 'white', border: '1px solid #E5E6EB' }
                  }>
                  <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
                    style={done ? { background: '#00B42A' } : { border: '1.5px solid #C9CDD4' }}>
                    {done && <Check size={10} className="text-white" />}
                  </div>
                  <div className="flex-1">
                    <div style={{ fontSize: 12, fontWeight: 600, color: done ? '#00B42A' : '#1D2129' }}>{item.label}</div>
                    <div style={{ fontSize: 10, color: '#86909C', marginTop: 1 }}>{item.detail}</div>
                  </div>
                </button>
              );
            })}
          </div>
        )}

        {checklist.size === VENUE_CHECKS.length && (
          <div className="mt-2 flex items-center gap-2 px-3 py-2 rounded-xl"
            style={{ background: '#F6FFED', border: '1px solid #B7EB8F' }}>
            <Check size={12} style={{ color: '#00B42A', flexShrink: 0 }} />
            <span style={{ fontSize: 11, color: '#00B42A', fontWeight: 600 }}>清单全部完成，场地已就绪</span>
          </div>
        )}
      </div>

      <div className="h-2 my-2" style={{ background: '#F7F8FA' }} />

      {/* ── 5. 备注 ── */}
      <div className="px-4 py-3">
        <span style={{ fontSize: 13, fontWeight: 700, color: '#1D2129', display: 'block', marginBottom: 8 }}>特殊备注</span>
        <textarea
          value={notes}
          onChange={e => setNotes(e.target.value)}
          placeholder="如有特殊要求、注意事项或协调事项请在此说明…"
          rows={3}
          className="w-full px-3 py-2.5 rounded-xl outline-none resize-none"
          style={{ border: '1px solid #E5E6EB', fontSize: 12, color: '#1D2129', lineHeight: 1.5 }}
        />
      </div>

      {/* ── CTA ── */}
      <div className="px-4 pt-1">
        <button
          onClick={() => {
            if (!canProceed) return;
            dispatch({ type: 'UPDATE_HE_PROJECT', payload: { id: id!, updates: { currentStep: 'setup' } } });
            navigate(`/tob/he/projects/${id}/run/setup`);
          }}
          className="w-full py-3 rounded-2xl flex items-center justify-center gap-1.5"
          style={canProceed
            ? { background: '#3370FF', color: 'white', fontSize: 13, fontWeight: 700 }
            : { background: '#E5E6EB', color: '#C9CDD4', fontSize: 13, fontWeight: 700 }
          }>
          确认预约，进入设备准备 <ArrowRight size={14} />
        </button>
        {!canProceed && (
          <p style={{ fontSize: 10, color: '#86909C', textAlign: 'center', marginTop: 6 }}>
            请先选择场地、日期和时段
          </p>
        )}
      </div>
    </div>
  );
}
