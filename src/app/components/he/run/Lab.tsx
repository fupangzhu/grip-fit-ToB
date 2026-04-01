import { useState } from 'react';
import { useParams, useNavigate } from 'react-router';
import { ArrowLeft, ArrowRight, MapPin, Users, Check, CalendarDays, CheckSquare, Square, Wifi, Camera, Mic, Brain, Activity } from 'lucide-react';
import { useAppStore, mockLabs } from '../../../store';

const TIME_SLOTS = ['09:00', '10:00', '11:00', '13:00', '14:00', '15:00', '16:00', '17:00'];
const DAYS = ['周一 3/24', '周二 3/25', '周三 3/26', '周四 3/27', '周五 3/28', '下周一 3/31', '下周二 4/1'];
const BOOKED_SLOTS = new Set(['lab-1_周二 3/25_09:00', 'lab-1_周二 3/25_10:00', 'lab-2_周三 3/26_14:00']);

const VENUE_CHECKLIST = [
  {
    category: '基础环境',
    color: '#3370FF',
    items: [
      { id: 'temp', label: '室温调节至 22±2°C', required: true },
      { id: 'light', label: '照明亮度 ≥ 500 lux', required: true },
      { id: 'noise', label: '背景噪音 ≤ 40 dB（量表实验）', required: true },
      { id: 'clean', label: '桌面清洁整洁，无杂物', required: false },
    ],
  },
  {
    category: '视频/录音设备',
    color: '#00B42A',
    items: [
      { id: 'cam1', label: '正面摄像头（45°俯视握持姿势）', required: true },
      { id: 'cam2', label: '侧面摄像头（记录拇指动作）', required: true },
      { id: 'mic', label: '录音设备测试 + 音量校准', required: true },
      { id: 'storage', label: '存储空间 ≥ 100GB', required: false },
    ],
  },
  {
    category: '生理信号设备',
    color: '#FF7D00',
    items: [
      { id: 'eeg', label: 'EEG设备连接测试 + 阻抗检查', required: false },
      { id: 'eda', label: '皮肤电导（EDA）传感器测试', required: false },
      { id: 'facecam', label: '面部情绪识别摄像头校准', required: false },
      { id: 'eyetrack', label: '眼动仪标定（若使用）', required: false },
    ],
  },
  {
    category: '实验材料',
    color: '#86909C',
    items: [
      { id: 'consent', label: '知情同意书（×被试人数）', required: true },
      { id: 'instruction', label: '实验指导语打印', required: true },
      { id: 'prototype', label: '样机就位并标记编号', required: true },
      { id: 'questionnaire', label: '备用纸质量表（网络故障时）', required: false },
    ],
  },
];

export function LabPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { state, dispatch } = useAppStore();
  const project = state.heProjects.find(p => p.id === id)!;

  const [activeTab, setActiveTab] = useState<'booking' | 'checklist'>('booking');
  const [selectedLab, setSelectedLab] = useState<string | null>(null);
  const [bookedSlots, setBookedSlots] = useState<Set<string>>(new Set());
  const [checked, setChecked] = useState<Set<string>>(new Set());

  if (!project) return null;
  const confirmed = project.participants.filter(p => p.invitationStatus === 'confirmed');
  const requiredItems = VENUE_CHECKLIST.flatMap(c => c.items.filter(i => i.required));
  const requiredDone = requiredItems.filter(i => checked.has(i.id)).length;
  const totalChecked = checked.size;

  function toggleSlot(labId: string, day: string, time: string) {
    if (!selectedLab || selectedLab !== labId) return;
    const key = `${labId}_${day}_${time}`;
    if (BOOKED_SLOTS.has(key)) return;
    setBookedSlots(prev => { const next = new Set(prev); next.has(key) ? next.delete(key) : next.add(key); return next; });
  }

  function toggleCheck(itemId: string) {
    setChecked(prev => { const next = new Set(prev); next.has(itemId) ? next.delete(itemId) : next.add(itemId); return next; });
  }

  const canGoNext = bookedSlots.size > 0 || requiredDone >= requiredItems.length / 2;

  return (
    <div className="p-5 space-y-4 max-w-5xl">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-base" style={{ fontWeight: 700, color: '#1D2129' }}>场地安排</h2>
          <p className="text-sm mt-0.5" style={{ color: '#86909C' }}>已确认被试 {confirmed.length} 人 · 预约实验室并完成场地准备核查</p>
        </div>
        <div className="px-3 py-1.5 rounded-full text-xs" style={{ background: '#EEF3FF', color: '#3370FF', fontWeight: 500 }}>步骤 3 / 6</div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 p-1 rounded-xl" style={{ background: '#F2F3F5' }}>
        {[
          { key: 'booking', label: '① 实验室预约', icon: CalendarDays },
          { key: 'checklist', label: '② 场地准备核查', icon: CheckSquare },
        ].map(tab => (
          <button key={tab.key} onClick={() => setActiveTab(tab.key as any)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm flex-1 justify-center transition-all"
            style={activeTab === tab.key
              ? { background: 'white', color: '#1D2129', fontWeight: 600, boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }
              : { color: '#4E5969' }}>
            <tab.icon size={14} />{tab.label}
          </button>
        ))}
      </div>

      {/* Tab: Booking */}
      {activeTab === 'booking' && (
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-3">
            {mockLabs.map(lab => (
              <div key={lab.id}
                onClick={() => lab.available && setSelectedLab(lab.id === selectedLab ? null : lab.id)}
                className="bg-white rounded-xl border-2 p-4 transition-all"
                style={{
                  borderColor: !lab.available ? '#F2F3F5' : selectedLab === lab.id ? '#3370FF' : '#E5E6EB',
                  opacity: !lab.available ? 0.6 : 1,
                  cursor: !lab.available ? 'not-allowed' : 'pointer',
                  background: selectedLab === lab.id ? '#F0F5FF' : 'white',
                }}>
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="text-sm mb-1" style={{ fontWeight: 600, color: '#1D2129' }}>{lab.name}</div>
                    <div className="flex items-center gap-1 text-xs" style={{ color: '#86909C' }}>
                      <MapPin size={10} />{lab.location}
                    </div>
                  </div>
                  {selectedLab === lab.id && (
                    <div className="w-5 h-5 rounded-full flex items-center justify-center" style={{ background: '#3370FF' }}>
                      <Check size={11} className="text-white" />
                    </div>
                  )}
                  {!lab.available && <span className="text-xs px-1.5 py-0.5 rounded-full" style={{ background: '#FFECE8', color: '#F53F3F' }}>已占用</span>}
                </div>
                <div className="flex items-center gap-1 text-xs mb-3" style={{ color: '#4E5969' }}>
                  <Users size={10} /> 容纳 {lab.capacity} 人
                </div>
                <div className="flex flex-wrap gap-1">
                  {lab.equipment.map(e => (
                    <span key={e} className="text-xs px-1.5 py-0.5 rounded-md" style={{ background: '#F2F3F5', color: '#4E5969' }}>{e}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {selectedLab && (
            <div className="bg-white rounded-xl border overflow-hidden" style={{ borderColor: '#E5E6EB' }}>
              <div className="flex items-center justify-between px-4 py-3 border-b" style={{ borderColor: '#F2F3F5' }}>
                <div>
                  <h3 className="text-sm" style={{ fontWeight: 600, color: '#1D2129' }}>排期规划</h3>
                  <p className="text-xs mt-0.5" style={{ color: '#86909C' }}>点击可用时间槽进行预约，灰色=已被他人占用</p>
                </div>
                {bookedSlots.size > 0 && (
                  <span className="text-xs px-2.5 py-1 rounded-full" style={{ background: '#E8F7EA', color: '#00B42A', fontWeight: 500 }}>
                    已预约 {bookedSlots.size} 个时段
                  </span>
                )}
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead style={{ background: '#FAFAFA' }}>
                    <tr>
                      <th className="px-4 py-2.5 text-left w-20" style={{ color: '#86909C', fontWeight: 600 }}>时间</th>
                      {DAYS.map(d => (
                        <th key={d} className="px-2 py-2.5 text-center whitespace-nowrap" style={{ color: '#86909C', fontWeight: 500 }}>{d}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {TIME_SLOTS.map(time => (
                      <tr key={time} className="hover:bg-gray-50">
                        <td className="px-4 py-2 whitespace-nowrap" style={{ color: '#4E5969', fontWeight: 500 }}>{time}</td>
                        {DAYS.map(day => {
                          const key = `${selectedLab}_${day}_${time}`;
                          const isBooked = BOOKED_SLOTS.has(key);
                          const isSel = bookedSlots.has(key);
                          return (
                            <td key={day} className="px-2 py-2 text-center">
                              <button
                                onClick={() => toggleSlot(selectedLab, day, time)}
                                className="w-full py-1.5 rounded-lg transition-all text-xs"
                                style={
                                  isBooked ? { background: '#F2F3F5', color: '#C9CDD4', cursor: 'not-allowed' } :
                                  isSel ? { background: '#3370FF', color: 'white' } :
                                  { background: '#E8F7EA', color: '#00B42A', border: '1px solid #B7EB8F' }
                                }>
                                {isBooked ? '占用' : isSel ? '已约' : '可用'}
                              </button>
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {bookedSlots.size > 0 && (
                <div className="px-4 py-3 border-t flex items-center justify-between" style={{ borderColor: '#F2F3F5', background: '#F6FFED' }}>
                  <span className="text-xs" style={{ color: '#389E0D', fontWeight: 500 }}>
                    已预约 {bookedSlots.size} 个时间段，共可安排约 {bookedSlots.size * 2} 人次
                  </span>
                  <button className="text-xs px-3 py-1 rounded-lg border transition-colors" style={{ borderColor: '#B7EB8F', color: '#389E0D', background: 'white' }}>
                    <CalendarDays size={10} className="inline mr-1" />同步至日历
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Tab: Checklist */}
      {activeTab === 'checklist' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 rounded-xl border" style={{ background: '#F0F5FF', borderColor: '#BFD0FF' }}>
            <span className="text-sm" style={{ color: '#1456F0' }}>
              必要项 {requiredDone}/{requiredItems.length} · 全部项 {totalChecked}/{VENUE_CHECKLIST.flatMap(c => c.items).length}
            </span>
            <div className="h-2 w-48 rounded-full overflow-hidden" style={{ background: '#C3D5FF' }}>
              <div className="h-full rounded-full transition-all" style={{ width: `${(totalChecked / VENUE_CHECKLIST.flatMap(c => c.items).length) * 100}%`, background: '#3370FF' }} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {VENUE_CHECKLIST.map(cat => (
              <div key={cat.category} className="bg-white rounded-xl border overflow-hidden" style={{ borderColor: '#E5E6EB' }}>
                <div className="px-4 py-2.5 border-b flex items-center gap-2" style={{ borderColor: '#F2F3F5' }}>
                  <div className="w-2 h-2 rounded-full" style={{ background: cat.color }} />
                  <span className="text-xs" style={{ fontWeight: 600, color: '#1D2129' }}>{cat.category}</span>
                </div>
                <div className="p-3 space-y-2">
                  {cat.items.map(item => (
                    <label key={item.id} className="flex items-start gap-2.5 cursor-pointer group">
                      <div onClick={() => toggleCheck(item.id)}
                        className="w-4.5 h-4.5 rounded border-2 flex items-center justify-center flex-shrink-0 mt-0.5 transition-all"
                        style={checked.has(item.id)
                          ? { borderColor: cat.color, background: cat.color, width: 18, height: 18 }
                          : { borderColor: '#C9CDD4', width: 18, height: 18 }}>
                        {checked.has(item.id) && <Check size={10} className="text-white" />}
                      </div>
                      <span className="text-xs leading-relaxed flex-1" style={{ color: checked.has(item.id) ? '#C9CDD4' : '#1D2129', textDecoration: checked.has(item.id) ? 'line-through' : 'none' }}>
                        {item.label}
                        {item.required && <span className="ml-1 text-xs" style={{ color: '#F53F3F' }}>*必要</span>}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Device quick status */}
          <div className="bg-white rounded-xl border p-4" style={{ borderColor: '#E5E6EB' }}>
            <h3 className="text-sm mb-3" style={{ fontWeight: 600, color: '#1D2129' }}>生理信号设备状态（可选）</h3>
            <div className="grid grid-cols-4 gap-3">
              {[
                { icon: Brain, label: 'EEG脑电', status: 'ready', note: '阻抗 <5kΩ' },
                { icon: Activity, label: '皮肤电导', status: 'ready', note: '基线稳定' },
                { icon: Camera, label: '面部情绪识别', status: 'checking', note: '正在校准...' },
                { icon: Wifi, label: '眼动仪', status: 'offline', note: '未连接' },
              ].map(d => (
                <div key={d.label} className="p-3 rounded-xl border text-center" style={{ borderColor: '#E5E6EB', background: '#FAFAFA' }}>
                  <d.icon size={18} className="mx-auto mb-1.5" style={{ color: d.status === 'ready' ? '#00B42A' : d.status === 'checking' ? '#FF7D00' : '#C9CDD4' }} />
                  <div className="text-xs" style={{ fontWeight: 500, color: '#1D2129' }}>{d.label}</div>
                  <div className="text-xs mt-0.5" style={{ color: d.status === 'ready' ? '#00B42A' : d.status === 'checking' ? '#FF7D00' : '#86909C' }}>{d.note}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between pt-4 border-t" style={{ borderColor: '#E5E6EB' }}>
        <button onClick={() => navigate(`/tob/he/projects/${id}/run/participants`)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm"
          style={{ border: '1px solid #E5E6EB', color: '#4E5969', background: 'white' }}>
          <ArrowLeft size={15} /> 上一步
        </button>
        <button onClick={() => {
          dispatch({ type: 'UPDATE_HE_PROJECT', payload: { id: id!, updates: { currentStep: 'setup' } } });
          navigate(`/tob/he/projects/${id}/run/setup`);
        }}
          className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm text-white shadow-sm"
          style={{ background: '#3370FF', fontWeight: 500 }}>
          场地确认 · 下一步：设备准备 <ArrowRight size={15} />
        </button>
      </div>
    </div>
  );
}
