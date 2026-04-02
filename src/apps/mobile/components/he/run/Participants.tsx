import { useState } from 'react';
import { useParams, useNavigate } from 'react-router';
import { ArrowRight, UserCheck, Zap, Users } from 'lucide-react';
import { useAppStore } from '../../../store';
import type { ProjectParticipant } from '../../../store';

const POOL = [
  { code: 'P001', handLength: 178, handWidth: 80, thumbSpan: 95, gripHabit: 'onehand' as const, ageGroup: '26-35' },
  { code: 'P002', handLength: 165, handWidth: 74, thumbSpan: 88, gripHabit: 'onehand' as const, ageGroup: '18-25' },
  { code: 'P003', handLength: 182, handWidth: 84, thumbSpan: 100, gripHabit: 'twohand' as const, ageGroup: '26-35' },
  { code: 'P004', handLength: 171, handWidth: 78, thumbSpan: 92, gripHabit: 'onehand' as const, ageGroup: '36-45' },
  { code: 'P005', handLength: 176, handWidth: 81, thumbSpan: 96, gripHabit: 'onehand' as const, ageGroup: '26-35' },
];

export function Participants() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { state, dispatch } = useAppStore();
  const project = state.heProjects.find(p => p.id === id)!;
  if (!project) return null;

  const ps = project.participants;
  const confirmed = ps.filter(p => p.invitationStatus === 'confirmed').length;
  const sent = ps.filter(p => p.invitationStatus === 'sent').length;

  function quickRecruit() {
    const count = project.participantTarget || 10;
    const list: ProjectParticipant[] = [];
    for (let i = 0; i < count; i++) {
      const b = POOL[i % POOL.length];
      list.push({
        ...b, code: `P${String(i + 1).padStart(3, '0')}`,
        handLength: b.handLength + Math.floor(Math.random() * 6) - 3,
        handWidth: b.handWidth + Math.floor(Math.random() * 4) - 2,
        thumbSpan: b.thumbSpan + Math.floor(Math.random() * 4) - 2,
        invitationStatus: i < Math.ceil(count * 0.5) ? 'confirmed' : i < Math.ceil(count * 0.75) ? 'sent' : 'noReply',
        questProgress: 0, questTotal: 18, recordingStatus: 'pending', notes: '',
      });
    }
    dispatch({ type: 'UPDATE_HE_PROJECT', payload: { id: id!, updates: { participants: list } } });
  }

  function confirmAll() {
    const updated = ps.map(p => p.invitationStatus === 'sent' ? { ...p, invitationStatus: 'confirmed' as const } : p);
    dispatch({ type: 'UPDATE_HE_PROJECT', payload: { id: id!, updates: { participants: updated } } });
  }

  return (
    <div className="px-4 py-4 space-y-3">
      <div className="flex items-center justify-between">
        <span style={{ fontSize: 14, fontWeight: 700, color: '#1D2129' }}>被试方案</span>
        <span style={{ fontSize: 11, color: '#86909C' }}>目标 {project.participantTarget} 人</span>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-2">
        {[
          { label: '已确认', value: confirmed, color: '#00B42A' },
          { label: '已发送', value: sent, color: '#3370FF' },
          { label: '总计', value: ps.length, color: '#4E5969' },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-xl p-2.5 border text-center" style={{ borderColor: '#E5E6EB' }}>
            <div style={{ fontSize: 18, fontWeight: 700, color: s.color }}>{s.value}</div>
            <div style={{ fontSize: 10, color: '#86909C' }}>{s.label}</div>
          </div>
        ))}
      </div>

      {ps.length === 0 ? (
        <button onClick={quickRecruit}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-white"
          style={{ background: '#FF7D00', fontSize: 13, fontWeight: 600 }}>
          <Zap size={15} /> 一键模拟招募
        </button>
      ) : (
        <>
          {sent > 0 && (
            <button onClick={confirmAll}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl"
              style={{ background: '#EEF3FF', color: '#3370FF', fontSize: 12, fontWeight: 500, border: '1px solid #BFD0FF' }}>
              <UserCheck size={13} /> 模拟全部确认 ({sent}人)
            </button>
          )}

          {/* Participant list */}
          <div className="space-y-1.5">
            {ps.slice(0, 10).map(p => (
              <div key={p.code} className="flex items-center gap-2 bg-white rounded-lg p-2.5 border" style={{ borderColor: '#E5E6EB' }}>
                <span style={{ fontSize: 12, fontWeight: 600, color: '#1D2129', width: 40 }}>{p.code}</span>
                <span style={{ fontSize: 10, color: '#86909C' }}>{p.handLength}mm · {p.gripHabit === 'onehand' ? '单手' : '双手'}</span>
                <span className="ml-auto px-1.5 py-0.5 rounded-full" style={{
                  fontSize: 9, fontWeight: 500,
                  background: p.invitationStatus === 'confirmed' ? '#E8F7EA' : p.invitationStatus === 'sent' ? '#EEF3FF' : '#F2F3F5',
                  color: p.invitationStatus === 'confirmed' ? '#00B42A' : p.invitationStatus === 'sent' ? '#3370FF' : '#86909C',
                }}>{p.invitationStatus === 'confirmed' ? '已确认' : p.invitationStatus === 'sent' ? '已发送' : '未回复'}</span>
              </div>
            ))}
            {ps.length > 10 && <p className="text-center" style={{ fontSize: 10, color: '#86909C' }}>共 {ps.length} 人</p>}
          </div>
        </>
      )}

      <button onClick={() => {
        dispatch({ type: 'UPDATE_HE_PROJECT', payload: { id: project.id, updates: { currentStep: 'lab' } } });
        navigate(`/tob/he/projects/${id}/run/lab`);
      }}
        className="w-full py-3 rounded-xl flex items-center justify-center gap-1 text-white"
        style={{ background: '#3370FF', fontSize: 13, fontWeight: 600 }}>
        下一步：场地安排 <ArrowRight size={14} />
      </button>
    </div>
  );
}