import { useParams, useNavigate } from 'react-router';
import { ArrowRight, Users } from 'lucide-react';
import { useAppStore } from '../../../store';

export function CollectPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { state, dispatch } = useAppStore();
  const project = state.heProjects.find(p => p.id === id)!;
  if (!project) return null;

  const confirmed = project.participants.filter(p => p.invitationStatus === 'confirmed');
  const done = confirmed.filter(p => p.recordingStatus === 'done').length;

  return (
    <div className="px-4 py-4 space-y-3">
      <div className="flex items-center justify-between">
        <span style={{ fontSize: 14, fontWeight: 700, color: '#1D2129' }}>数据采集</span>
        <span style={{ fontSize: 11, color: '#86909C' }}>{done}/{confirmed.length} 已完成</span>
      </div>

      <div className="h-1.5 rounded-full" style={{ background: '#F2F3F5' }}>
        <div className="h-full rounded-full" style={{ width: confirmed.length ? `${(done / confirmed.length) * 100}%` : '0%', background: '#3370FF' }} />
      </div>

      <div className="space-y-1.5">
        {confirmed.map(p => (
          <div key={p.code}
            onClick={() => navigate(`/tob/he/projects/${id}/run/collect/${p.code}`)}
            className="flex items-center gap-2.5 bg-white rounded-xl p-3 border active:bg-gray-50"
            style={{ borderColor: '#E5E6EB' }}>
            <div className="w-7 h-7 rounded-full flex items-center justify-center"
              style={{ background: p.recordingStatus === 'done' ? '#E8F7EA' : '#EEF3FF', fontSize: 10, fontWeight: 700, color: p.recordingStatus === 'done' ? '#00B42A' : '#3370FF' }}>
              {p.code.slice(-2)}
            </div>
            <div className="flex-1">
              <span style={{ fontSize: 12, fontWeight: 600, color: '#3370FF' }}>{p.code}</span>
              <div style={{ fontSize: 10, color: '#86909C' }}>{p.handLength}mm · {p.ageGroup}</div>
            </div>
            <span className="px-2 py-0.5 rounded-full" style={{
              fontSize: 9, fontWeight: 500,
              background: p.recordingStatus === 'done' ? '#E8F7EA' : p.recordingStatus === 'recording' ? '#EEF3FF' : '#F2F3F5',
              color: p.recordingStatus === 'done' ? '#00B42A' : p.recordingStatus === 'recording' ? '#3370FF' : '#86909C',
            }}>{p.recordingStatus === 'done' ? '✓ 完成' : p.recordingStatus === 'recording' ? '进行中' : '待开始'}</span>
          </div>
        ))}
        {confirmed.length === 0 && (
          <div className="text-center py-8" style={{ color: '#C9CDD4' }}>
            <Users size={24} className="mx-auto mb-2" />
            <p style={{ fontSize: 12 }}>暂无已确认被试</p>
          </div>
        )}
      </div>

      <button onClick={() => {
        dispatch({ type: 'UPDATE_HE_PROJECT', payload: { id: id!, currentStep: 'analysis' } });
        navigate(`/tob/he/projects/${id}/run/analysis`);
      }}
        className="w-full py-3 rounded-xl flex items-center justify-center gap-1 text-white"
        style={{ background: '#3370FF', fontSize: 13, fontWeight: 600 }}>
        下一步：分析报告 <ArrowRight size={14} />
      </button>
    </div>
  );
}
