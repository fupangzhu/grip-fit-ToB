import { Outlet, useParams, useNavigate, useLocation } from 'react-router';
import { ArrowLeft, Check } from 'lucide-react';
import { useAppStore, RunStep } from '../../../store';

const RUN_STEPS = [
  { key: 'questionnaire', label: '量表设计', step: 1 },
  { key: 'participants', label: '被试方案', step: 2 },
  { key: 'lab', label: '场地安排', step: 3 },
  { key: 'setup', label: '设备准备', step: 4 },
  { key: 'collect', label: '数据采集', step: 5 },
  { key: 'analysis', label: '分析报告', step: 6 },
];

const STEP_ORDER: Record<string, number> = {
  questionnaire: 0, participants: 1, lab: 2, setup: 3, collect: 4, analysis: 5,
};

export function RunLayout() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { state } = useAppStore();

  const project = state.heProjects.find(p => p.id === id);
  // Extract current step from path - handle sub-routes like collect/P001
  const pathAfterRun = location.pathname.split('/run/')[1] ?? '';
  const currentStep = pathAfterRun.split('/')[0] as RunStep;
  const currentIndex = STEP_ORDER[currentStep] ?? 0;
  const projectStepIndex = STEP_ORDER[project?.currentStep ?? 'questionnaire'] ?? 0;
  const maxReachableIndex = Math.max(projectStepIndex, currentIndex);

  return (
    <div className="flex flex-col min-h-full">
      {/* Sub-header */}
      <div className="bg-white border-b px-5 py-3" style={{ borderColor: '#E5E6EB' }}>
        <div className="flex items-center gap-2 mb-3">
          <button onClick={() => navigate(`/tob/he/projects/${id}`)}
            className="flex items-center gap-1.5 text-sm transition-colors hover:opacity-80"
            style={{ color: '#86909C' }}>
            <ArrowLeft size={14} />
            <span>{project?.name ?? '返回项目'}</span>
          </button>
          <span style={{ color: '#C9CDD4' }}>/</span>
          <span className="text-sm" style={{ color: '#1D2129', fontWeight: 500 }}>方案执行</span>
        </div>

        {/* Step progress */}
        <div className="flex items-center gap-0">
          {RUN_STEPS.map((step, i) => {
            const isDone = i < projectStepIndex || (i <= projectStepIndex && i < currentIndex);
            const isActive = currentStep === step.key;
            const isReachable = i <= maxReachableIndex;
            return (
              <div key={step.key} className="flex items-center">
                <button
                  onClick={() => isReachable && navigate(`/tob/he/projects/${id}/run/${step.key}`)}
                  disabled={!isReachable}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs transition-all"
                  style={
                    isActive ? { background: '#3370FF', color: 'white', fontWeight: 600 } :
                    isDone ? { background: '#E8F3FF', color: '#1456F0', fontWeight: 500 } :
                    isReachable ? { background: '#F7F8FA', color: '#4E5969' } :
                    { background: 'transparent', color: '#C9CDD4', cursor: 'not-allowed' }
                  }
                >
                  <span className="w-4 h-4 rounded-full flex items-center justify-center text-xs flex-shrink-0"
                    style={{
                      fontWeight: 700,
                      background: isActive ? 'rgba(255,255,255,0.25)' : isDone ? '#3370FF' : 'rgba(0,0,0,0.08)',
                      color: isDone && !isActive ? 'white' : 'inherit',
                    }}>
                    {isDone && !isActive ? <Check size={9} /> : step.step}
                  </span>
                  {step.label}
                </button>
                {i < RUN_STEPS.length - 1 && (
                  <div className="w-4 h-px mx-0.5" style={{ background: i < projectStepIndex ? '#BFD0FF' : '#E5E6EB' }} />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Step content */}
      <div className="flex-1 overflow-y-auto">
        <Outlet />
      </div>
    </div>
  );
}