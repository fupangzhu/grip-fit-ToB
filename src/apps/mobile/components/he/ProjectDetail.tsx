import { useState } from 'react';
import { useParams, useNavigate, Navigate } from 'react-router';
import { ArrowLeft, Play, Users, Clock } from 'lucide-react';
import { useAppStore, STATUS_COLORS, STATUS_LABELS, RESEARCH_TYPE_LABELS, RESEARCH_TYPE_ICONS, FORM_FACTOR_LABELS, RUN_STEPS } from '../../store';

export function HEProjectDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { state } = useAppStore();

  const project = state.heProjects.find(p => p.id === id);
  if (!project) return <Navigate to="/tob/he/projects" replace />;

  const confirmed = project.participants.filter(p => p.invitationStatus === 'confirmed').length;
  const done = project.participants.filter(p => p.recordingStatus === 'done').length;

  return (
    <div className="px-4 py-4 space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button onClick={() => navigate('/tob/he/projects')} style={{ color: '#86909C' }}><ArrowLeft size={18} /></button>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="truncate" style={{ fontSize: 15, fontWeight: 700, color: '#1D2129' }}>{project.name}</span>
            <span className={`px-2 py-0.5 rounded-full ${STATUS_COLORS[project.status]}`} style={{ fontSize: 10, fontWeight: 500 }}>{STATUS_LABELS[project.status]}</span>
          </div>
          <div className="flex items-center gap-2 mt-0.5" style={{ fontSize: 10, color: '#86909C' }}>
            <span>{FORM_FACTOR_LABELS[project.formFactor]}</span>
            {project.researchTypes.map(rt => <span key={rt}>{RESEARCH_TYPE_ICONS[rt]}{RESEARCH_TYPE_LABELS[rt]}</span>)}
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-2">
        {[
          { label: '目标', value: project.participantTarget },
          { label: '已确认', value: confirmed },
          { label: '已采集', value: done },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-xl p-2.5 border text-center" style={{ borderColor: '#E5E6EB' }}>
            <div style={{ fontSize: 18, fontWeight: 700, color: '#1D2129' }}>{s.value}</div>
            <div style={{ fontSize: 10, color: '#86909C' }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Progress */}
      <div className="bg-white rounded-xl p-3 border" style={{ borderColor: '#E5E6EB' }}>
        <div className="flex items-center justify-between mb-2">
          <span style={{ fontSize: 12, fontWeight: 600, color: '#1D2129' }}>进度 {project.progress}%</span>
          {project.deadline && <span style={{ fontSize: 10, color: '#86909C' }}>截止 {project.deadline}</span>}
        </div>
        <div className="h-1.5 rounded-full" style={{ background: '#F2F3F5' }}>
          <div className="h-full rounded-full" style={{ width: `${project.progress}%`, background: '#3370FF' }} />
        </div>
      </div>

      {/* Steps */}
      <div className="space-y-2">
        <span style={{ fontSize: 13, fontWeight: 600, color: '#1D2129' }}>执行步骤</span>
        {RUN_STEPS.map((step, i) => {
          const stepIndex = RUN_STEPS.findIndex(s => s.key === project.currentStep);
          const isDone = i < stepIndex;
          const isCurrent = step.key === project.currentStep;
          const disabled = i > stepIndex;
          return (
            <div key={step.key}
              onClick={() => !disabled && navigate(`/tob/he/projects/${id}/run/${step.key}`)}
              className="flex items-center gap-3 p-3 rounded-xl transition-all"
              style={{
                background: isCurrent ? '#EEF3FF' : isDone ? '#F6FFED' : '#F7F8FA',
                border: `1px solid ${isCurrent ? '#BFD0FF' : isDone ? '#B7EB8F' : '#E5E6EB'}`,
                opacity: disabled ? 0.5 : 1,
                cursor: disabled ? 'not-allowed' : 'pointer',
              }}>
              <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0"
                style={{
                  background: isCurrent ? '#3370FF' : isDone ? '#00B42A' : '#E5E6EB',
                  color: isCurrent || isDone ? 'white' : '#86909C',
                  fontSize: 10, fontWeight: 700,
                }}>
                {isDone ? '✓' : i + 1}
              </div>
              <div className="flex-1">
                <span style={{ fontSize: 12, fontWeight: 600, color: isCurrent ? '#3370FF' : isDone ? '#00B42A' : '#86909C' }}>{step.label}</span>
              </div>
              {isCurrent && <span style={{ fontSize: 10, color: '#3370FF', fontWeight: 500 }}>进入 →</span>}
            </div>
          );
        })}
      </div>
    </div>
  );
}
