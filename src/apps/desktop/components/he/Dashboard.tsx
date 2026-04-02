import { useNavigate } from 'react-router';
import { Plus, TrendingUp, Clock, CheckCircle, Users, AlertCircle, CalendarDays, ArrowRight, CalendarClock } from 'lucide-react';
import { useAppStore, STATUS_COLORS, STATUS_LABELS, RESEARCH_TYPE_LABELS, RESEARCH_TYPE_ICONS, ExperimentStatus, HEProject } from '../../store';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const qualityData = [
  { month: '10月', planned: 20, actual: 18, returnRate: 92, validity: 88 },
  { month: '11月', planned: 25, actual: 22, returnRate: 88, validity: 85 },
  { month: '12月', planned: 18, actual: 17, returnRate: 94, validity: 91 },
  { month: '1月', planned: 22, actual: 20, returnRate: 90, validity: 87 },
  { month: '2月', planned: 20, actual: 19, returnRate: 95, validity: 93 },
  { month: '3月', planned: 28, actual: 21, returnRate: 89, validity: 86 },
];

const timeline = [
  { date: '明天', label: '旗舰机握持研究', note: '被试确认截止 (已确认5/20)', urgent: true },
  { date: '后天', label: 'Fold Z4 热控研究', note: '实验室A 预约时间 14:00', urgent: false },
  { date: '3月25日', label: 'Nova Flip 触控研究', note: '环境搭建核查', urgent: false },
  { date: '4月1日', label: 'Fold Z4 热控研究', note: '数据采集截止', urgent: false },
  { date: '4月10日', label: 'Nova Flip 触控研究', note: '被试确认截止', urgent: false },
];

const KANBAN_COLS: { key: ExperimentStatus; label: string; color: string }[] = [
  { key: 'draft', label: '规划中', color: '#86909C' },
  { key: 'recruiting', label: '招募被试', color: '#3370FF' },
  { key: 'running', label: '实验进行中', color: '#FF7D00' },
  { key: 'analyzing', label: '数据分析中', color: '#8B5CF6' },
];

function ProjectCard({ project, onClick }: { project: HEProject; onClick: () => void }) {
  const stepLabels: Record<string, string> = {
    participants: '被试方案', lab: '场地安排', setup: '设备准备',
    questionnaire: '量表设计', collect: '数据采集', analysis: '分析报告',
  };
  const confirmed = project.participants.filter(p => p.invitationStatus === 'confirmed').length;
  return (
    <div onClick={onClick} className="bg-white rounded-xl border p-4 cursor-pointer transition-all group hover:shadow-md"
      style={{ borderColor: '#E5E6EB' }}
      onMouseEnter={e => (e.currentTarget.style.borderColor = '#BFD0FF')}
      onMouseLeave={e => (e.currentTarget.style.borderColor = '#E5E6EB')}>
      <div className="flex items-start justify-between mb-2">
        <div className="flex-1 min-w-0">
          <div className="text-sm mb-1.5 truncate" style={{ fontWeight: 600, color: '#1D2129' }}>{project.name}</div>
          <div className="flex flex-wrap gap-1">
            {project.researchTypes.map(rt => (
              <span key={rt} className="text-xs px-1.5 py-0.5 rounded-md" style={{ background: '#F2F3F5', color: '#4E5969' }}>
                {RESEARCH_TYPE_ICONS[rt]}{RESEARCH_TYPE_LABELS[rt]}
              </span>
            ))}
          </div>
        </div>
      </div>
      <div className="text-xs mb-2" style={{ color: '#3370FF' }}>{stepLabels[project.currentStep]}</div>
      <div className="mb-2">
        <div className="flex items-center justify-between text-xs mb-1" style={{ color: '#86909C' }}>
          <span>进度</span><span>{project.progress}%</span>
        </div>
        <div className="h-1.5 rounded-full overflow-hidden" style={{ background: '#F2F3F5' }}>
          <div className="h-full rounded-full transition-all" style={{ width: `${project.progress}%`, background: '#3370FF' }} />
        </div>
      </div>
      <div className="flex items-center justify-between text-xs" style={{ color: '#86909C' }}>
        <span className="flex items-center gap-1"><Users size={11} /> {confirmed}/{project.participantTarget}</span>
        {project.deadline && <span className="flex items-center gap-1" style={{ color: new Date(project.deadline) <= new Date('2026-04-05') ? '#F53F3F' : '#86909C' }}><CalendarClock size={11} /> {project.deadline}</span>}
      </div>
    </div>
  );
}

export function HEDashboard() {
  const { state } = useAppStore();
  const navigate = useNavigate();
  const { heProjects } = state;

  const activeCount = heProjects.filter(p => p.status === 'running' || p.status === 'recruiting').length;
  const completedCount = heProjects.filter(p => p.status === 'completed').length;
  const totalParticipants = heProjects.reduce((s, p) => s + p.participants.filter(pp => pp.invitationStatus === 'confirmed').length, 0);
  const pendingTasks = heProjects.filter(p => p.status !== 'completed' && p.status !== 'archived').length;

  const statCards = [
    { label: '本月进行中实验', value: activeCount, change: '+1', up: true, icon: TrendingUp, color: '#3370FF', bg: '#EEF3FF' },
    { label: '待处理任务', value: pendingTasks, change: '需关注', up: false, icon: AlertCircle, color: '#FF7D00', bg: '#FFF3E8' },
    { label: '本月已完成', value: completedCount, change: `完成率 ${Math.round((completedCount / (heProjects.length || 1)) * 100)}%`, up: true, icon: CheckCircle, color: '#00B42A', bg: '#E8F7EA' },
    { label: '被试参与总人次', value: totalParticipants, change: '累计', up: true, icon: Users, color: '#8B5CF6', bg: '#F3F0FF' },
  ];

  return (
    <div className="p-5 space-y-5" style={{ background: '#F7F8FA', minHeight: '100vh' }}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-base" style={{ fontWeight: 700, color: '#1D2129' }}>工作看板</h1>
          <p className="text-sm mt-0.5" style={{ color: '#86909C' }}>2026年3月 · 张研究员的工作台</p>
        </div>
        <button onClick={() => navigate('/tob/he/projects/new')}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm text-white"
          style={{ background: '#3370FF', fontWeight: 500 }}>
          <Plus size={15} /> 新建项目
        </button>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-4 gap-3">
        {statCards.map((c, i) => (
          <div key={i} className="bg-white rounded-xl border p-4" style={{ borderColor: '#E5E6EB' }}>
            <div className="flex items-start justify-between mb-3">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: c.bg }}>
                <c.icon size={16} style={{ color: c.color }} />
              </div>
            </div>
            <div className="mb-1" style={{ fontWeight: 700, fontSize: '1.75rem', color: '#1D2129' }}>{c.value}</div>
            <div className="text-sm" style={{ color: '#4E5969' }}>{c.label}</div>
            <div className="text-xs mt-1" style={{ color: c.up ? '#00B42A' : '#FF7D00' }}>{c.change}</div>
          </div>
        ))}
      </div>

      {/* Kanban + Timeline */}
      <div className="grid grid-cols-4 gap-4">
        <div className="col-span-3">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm" style={{ fontWeight: 600, color: '#1D2129' }}>项目进度看板</h2>
            <button onClick={() => navigate('/tob/he/projects')} className="text-xs flex items-center gap-1" style={{ color: '#3370FF' }}>
              查看全部 <ArrowRight size={11} />
            </button>
          </div>
          <div className="grid grid-cols-4 gap-3">
            {KANBAN_COLS.map(col => {
              const projects = heProjects.filter(p => p.status === col.key);
              return (
                <div key={col.key} className="rounded-xl p-3" style={{ background: '#F2F3F5' }}>
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-2 h-2 rounded-full" style={{ background: col.color }} />
                    <span className="text-xs" style={{ fontWeight: 600, color: '#4E5969' }}>{col.label}</span>
                    <span className="ml-auto text-xs bg-white rounded-full px-1.5 py-0.5" style={{ color: '#86909C' }}>{projects.length}</span>
                  </div>
                  <div className="space-y-2">
                    {projects.map(p => (
                      <ProjectCard key={p.id} project={p} onClick={() => navigate(`/tob/he/projects/${p.id}`)} />
                    ))}
                    {projects.length === 0 && (
                      <div className="text-xs text-center py-4" style={{ color: '#C9CDD4' }}>暂无项目</div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Timeline */}
        <div>
          <h2 className="text-sm mb-3" style={{ fontWeight: 600, color: '#1D2129' }}>近期任务</h2>
          <div className="bg-white rounded-xl border p-4 space-y-0" style={{ borderColor: '#E5E6EB' }}>
            {timeline.map((item, i) => (
              <div key={i} className="flex gap-3 pb-4 last:pb-0">
                <div className="flex flex-col items-center">
                  <div className="w-2 h-2 rounded-full mt-1 flex-shrink-0" style={{ background: item.urgent ? '#F53F3F' : '#BFD0FF' }} />
                  {i < timeline.length - 1 && <div className="w-px flex-1 mt-1" style={{ background: '#F2F3F5' }} />}
                </div>
                <div className="flex-1 min-w-0 cursor-pointer" onClick={() => navigate('/tob/he/projects')}>
                  <div className="text-xs mb-0.5" style={{ fontWeight: 600, color: item.urgent ? '#F53F3F' : '#86909C' }}>{item.date}</div>
                  <div className="text-xs truncate" style={{ fontWeight: 500, color: '#1D2129' }}>{item.label}</div>
                  <div className="text-xs mt-0.5" style={{ color: '#86909C' }}>{item.note}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quality chart */}
      <div className="bg-white rounded-xl border p-5" style={{ borderColor: '#E5E6EB' }}>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-sm" style={{ fontWeight: 600, color: '#1D2129' }}>实验质量指标（近6个月）</h2>
            <p className="text-xs mt-0.5" style={{ color: '#86909C' }}>计划被试数 vs 实际参与数 / 量表回收率 / 数据有效率</p>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={qualityData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#F2F3F5" />
            <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#86909C' }} axisLine={false} tickLine={false} />
            <YAxis id="yaxis-quality" tick={{ fontSize: 11, fill: '#86909C' }} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={{ fontSize: '12px', borderRadius: '8px', border: '1px solid #E5E6EB' }} />
            <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: '12px' }} />
            <Line key="line-planned" type="monotone" dataKey="planned" name="计划被试数" stroke="#C9CDD4" strokeWidth={2} dot={false} />
            <Line key="line-actual" type="monotone" dataKey="actual" name="实际参与数" stroke="#3370FF" strokeWidth={2.5} dot={{ r: 4, fill: '#3370FF' }} />
            <Line key="line-returnRate" type="monotone" dataKey="returnRate" name="量表回收率%" stroke="#00B42A" strokeWidth={2} dot={false} strokeDasharray="5 3" />
            <Line key="line-validity" type="monotone" dataKey="validity" name="数据有效率%" stroke="#FF7D00" strokeWidth={2} dot={false} strokeDasharray="5 3" />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}