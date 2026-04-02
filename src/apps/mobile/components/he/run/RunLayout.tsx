import { Outlet, useParams, useNavigate, useLocation } from 'react-router';
import { ArrowLeft, Check } from 'lucide-react';
import { useAppStore, RunStep } from '../../../store';

const STEPS = [
  { key: 'questionnaire', label: '量表', step: 1 },
  { key: 'participants', label: '被试', step: 2 },
  { key: 'lab', label: '场地', step: 3 },
  { key: 'setup', label: '设备', step: 4 },
  { key: 'collect', label: '采集', step: 5 },
  { key: 'analysis', label: '分析', step: 6 },
];
const ORDER: Record<string, number> = { questionnaire: 0, participants: 1, lab: 2, setup: 3, collect: 4, analysis: 5 };

export function RunLayout() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { state } = useAppStore();
  const project = state.heProjects.find(p => p.id === id);

  const pathAfterRun = location.pathname.split('/run/')[1] ?? '';
  const currentStep = pathAfterRun.split('/')[0] as RunStep;
  const currentIndex = ORDER[currentStep] ?? 0;
  const projectStepIndex = ORDER[project?.currentStep ?? 'questionnaire'] ?? 0;
  const maxReachable = Math.max(projectStepIndex, currentIndex);

  return (
    <div className="flex flex-col min-h-full">
      {/* Compact header */}
      <div className="bg-white border-b px-3 py-2" style={{ borderColor: '#E5E6EB' }}>
        <div className="flex items-center gap-2 mb-2">
          <button onClick={() => navigate(`/tob/he/projects/${id}`)} style={{ color: '#86909C' }}>
            <ArrowLeft size={16} />
          </button>
          <span className="truncate" style={{ fontSize: 12, fontWeight: 500, color: '#1D2129' }}>{project?.name ?? '方案执行'}</span>
        </div>
        {/* Horizontal step dots */}
        <div className="flex items-center gap-0">
          {STEPS.map((step, i) => {
            const isDone = i < projectStepIndex;
            const isActive = currentStep === step.key;
            const reachable = i <= maxReachable;
            return (
              <div key={step.key} className="flex items-center flex-1">
                <button onClick={() => reachable && navigate(`/tob/he/projects/${id}/run/${step.key}`)}
                  disabled={!reachable}
                  className="flex flex-col items-center gap-0.5 w-full"
                  style={{ opacity: reachable ? 1 : 0.4 }}>
                  <div className="w-5 h-5 rounded-full flex items-center justify-center"
                    style={{
                      background: isActive ? '#3370FF' : isDone ? '#00B42A' : '#E5E6EB',
                      color: isActive || isDone ? 'white' : '#86909C',
                      fontSize: 9, fontWeight: 700,
                    }}>
                    {isDone && !isActive ? <Check size={9} /> : step.step}
                  </div>
                  <span style={{ fontSize: 9, color: isActive ? '#3370FF' : '#86909C', fontWeight: isActive ? 600 : 400 }}>{step.label}</span>
                </button>
                {i < STEPS.length - 1 && (
                  <div className="h-px flex-1 -mt-3" style={{ background: i < projectStepIndex ? '#BFD0FF' : '#E5E6EB' }} />
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        <Outlet />
      </div>
    </div>
  );
}
