import { useState } from 'react';
import type { ReactNode } from 'react';
import { useParams, useNavigate } from 'react-router';
import { ArrowLeft, ArrowRight, Send, UserCheck, UserX, Clock, Filter, ChevronDown, Mail, Zap, Target, Users, ClipboardList, Info } from 'lucide-react';
import { useAppStore } from '../../../store';
import type { ProjectParticipant } from '../../../store';

const MOCK_POOL: Omit<ProjectParticipant, 'invitationStatus' | 'questProgress' | 'questTotal' | 'recordingStatus' | 'notes'>[] = [
  { code: 'P001', handLength: 178, handWidth: 80, thumbSpan: 95, gripHabit: 'onehand', ageGroup: '26-35' },
  { code: 'P002', handLength: 165, handWidth: 74, thumbSpan: 88, gripHabit: 'onehand', ageGroup: '18-25' },
  { code: 'P003', handLength: 182, handWidth: 84, thumbSpan: 100, gripHabit: 'twohand', ageGroup: '26-35' },
  { code: 'P004', handLength: 171, handWidth: 78, thumbSpan: 92, gripHabit: 'onehand', ageGroup: '36-45' },
  { code: 'P005', handLength: 176, handWidth: 81, thumbSpan: 96, gripHabit: 'onehand', ageGroup: '26-35' },
  { code: 'P006', handLength: 168, handWidth: 76, thumbSpan: 90, gripHabit: 'twohand', ageGroup: '18-25' },
  { code: 'P007', handLength: 183, handWidth: 85, thumbSpan: 102, gripHabit: 'twohand', ageGroup: '36-45' },
  { code: 'P008', handLength: 170, handWidth: 77, thumbSpan: 91, gripHabit: 'onehand', ageGroup: '26-35' },
  { code: 'P009', handLength: 174, handWidth: 79, thumbSpan: 94, gripHabit: 'onehand', ageGroup: '18-25' },
  { code: 'P010', handLength: 180, handWidth: 82, thumbSpan: 98, gripHabit: 'twohand', ageGroup: '26-35' },
];

const INCLUSION_CRITERIA = [
  { criterion: '年龄范围', value: '18–45 岁', note: '覆盖主力用户群体' },
  { criterion: '手长范围', value: '160–195 mm', note: '覆盖P5–P95手型' },
  { criterion: '握持习惯', value: '单手/双手均可', note: '按各50%比例分层' },
  { criterion: '视力', value: '矫正后1.0以上', note: '保证操作任务执行' },
  { criterion: '无手部疾病', value: '关节炎/腱鞘炎等排除', note: '避免混淆变量' },
];

const EXCLUSION_CRITERIA = [
  '3个月内参与过同类研究',
  '手部存在活动性损伤',
  '对实验任务存在明显偏见',
];

export function Participants() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { state, dispatch } = useAppStore();
  const project = state.heProjects.find(p => p.id === id)!;

  const [activeTab, setActiveTab] = useState<'criteria' | 'recruit'>('criteria');
  const [handLengthRange, setHandLengthRange] = useState([160, 195]);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showAll, setShowAll] = useState(false);

  if (!project) return null;

  const participants = project.participants;
  const confirmed = participants.filter(p => p.invitationStatus === 'confirmed');
  const sent = participants.filter(p => p.invitationStatus === 'sent');
  const declined = participants.filter(p => p.invitationStatus === 'declined');
  const noReply = participants.filter(p => p.invitationStatus === 'noReply');
  const displayList = showAll ? participants : participants.slice(0, 8);

  const statusMap: Record<string, { label: string; icon: ReactNode; bg: string; color: string }> = {
    confirmed: { label: '已确认', bg: '#E8F7EA', color: '#00B42A', icon: <UserCheck size={11} /> },
    sent: { label: '已发送', bg: '#EEF3FF', color: '#3370FF', icon: <Send size={11} /> },
    declined: { label: '已拒绝', bg: '#FFECE8', color: '#F53F3F', icon: <UserX size={11} /> },
    noReply: { label: '未回复', bg: '#F2F3F5', color: '#86909C', icon: <Clock size={11} /> },
  };

  function quickRecruit() {
    const count = project.participantTarget || 10;
    const newParticipants: ProjectParticipant[] = [];
    for (let i = 0; i < count; i++) {
      const base = MOCK_POOL[i % MOCK_POOL.length];
      newParticipants.push({
        ...base,
        code: `P${String(i + 1).padStart(3, '0')}`,
        handLength: base.handLength + Math.floor(Math.random() * 6) - 3,
        handWidth: base.handWidth + Math.floor(Math.random() * 4) - 2,
        thumbSpan: base.thumbSpan + Math.floor(Math.random() * 4) - 2,
        invitationStatus: i < Math.ceil(count * 0.5) ? 'confirmed' : i < Math.ceil(count * 0.75) ? 'sent' : 'noReply',
        questProgress: 0, questTotal: 18, recordingStatus: 'pending', notes: '',
      });
    }
    dispatch({ type: 'UPDATE_HE_PROJECT', payload: { id: id!, updates: { participants: newParticipants } } });
  }

  function confirmAll() {
    const updated = participants.map(p =>
      p.invitationStatus === 'sent' ? { ...p, invitationStatus: 'confirmed' as const } : p
    );
    dispatch({ type: 'UPDATE_HE_PROJECT', payload: { id: id!, updates: { participants: updated } } });
  }

  return (
    <div className="p-5 space-y-4 max-w-5xl">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-base" style={{ fontWeight: 700, color: '#1D2129' }}>被试方案规划</h2>
          <p className="text-sm mt-0.5" style={{ color: '#86909C' }}>目标 {project.participantTarget} 人 · 已确认 {confirmed.length} 人</p>
        </div>
        <div className="flex items-center gap-3">
          {[
            { label: '已确认', count: confirmed.length, color: '#00B42A' },
            { label: '已发送', count: sent.length, color: '#3370FF' },
            { label: '已拒绝', count: declined.length, color: '#F53F3F' },
            { label: '未回复', count: noReply.length, color: '#86909C' },
          ].map(s => (
            <div key={s.label} className="text-center">
              <div className="text-lg" style={{ fontWeight: 700, color: s.color }}>{s.count}</div>
              <div className="text-xs" style={{ color: '#86909C' }}>{s.label}</div>
            </div>
          ))}
          <div className="px-3 py-1.5 rounded-full text-xs ml-2" style={{ background: '#EEF3FF', color: '#3370FF', fontWeight: 500 }}>
            步骤 2 / 6
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 p-1 rounded-xl" style={{ background: '#F2F3F5' }}>
        {[
          { key: 'criteria', label: '① 被试筛选标准', icon: Target },
          { key: 'recruit', label: '② 招募与管理', icon: Users },
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

      {/* Tab: Criteria */}
      {activeTab === 'criteria' && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            {/* Inclusion */}
            <div className="bg-white rounded-xl border overflow-hidden" style={{ borderColor: '#E5E6EB' }}>
              <div className="px-4 py-3 border-b" style={{ borderColor: '#F2F3F5', background: '#F6FFED' }}>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ background: '#00B42A' }} />
                  <span className="text-sm" style={{ fontWeight: 600, color: '#1D2129' }}>纳入标准</span>
                </div>
              </div>
              <div className="divide-y" style={{ borderColor: '#F2F3F5' }}>
                {INCLUSION_CRITERIA.map((c, i) => (
                  <div key={i} className="px-4 py-3">
                    <div className="flex items-center justify-between mb-0.5">
                      <span className="text-xs" style={{ fontWeight: 600, color: '#1D2129' }}>{c.criterion}</span>
                      <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: '#E8F7EA', color: '#00B42A', fontWeight: 500 }}>{c.value}</span>
                    </div>
                    <p className="text-xs" style={{ color: '#86909C' }}>{c.note}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Exclusion */}
            <div className="space-y-3">
              <div className="bg-white rounded-xl border overflow-hidden" style={{ borderColor: '#E5E6EB' }}>
                <div className="px-4 py-3 border-b" style={{ borderColor: '#F2F3F5', background: '#FFECE8' }}>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full" style={{ background: '#F53F3F' }} />
                    <span className="text-sm" style={{ fontWeight: 600, color: '#1D2129' }}>排除标准</span>
                  </div>
                </div>
                <div className="px-4 py-3 space-y-2">
                  {EXCLUSION_CRITERIA.map((c, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: '#F53F3F' }} />
                      <span className="text-sm" style={{ color: '#4E5969' }}>{c}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Sample size justification */}
              <div className="p-4 rounded-xl border" style={{ background: '#F0F5FF', borderColor: '#BFD0FF' }}>
                <div className="flex items-center gap-2 mb-2">
                  <Info size={13} style={{ color: '#3370FF' }} />
                  <span className="text-xs" style={{ fontWeight: 600, color: '#1456F0' }}>样本量依据</span>
                </div>
                <p className="text-xs" style={{ color: '#2B4ACB' }}>
                  基于所选范式推荐样本量 <strong>{project.participantTarget}</strong> 人。
                  统计检验力分析（Power=0.80, α=0.05, 中等效应量 d=0.5）要求最小 n=17，
                  加上15%流失率缓冲，建议招募 {Math.ceil(project.participantTarget * 1.15)} 人。
                </p>
              </div>

              {/* DOE brief */}
              <div className="bg-white rounded-xl border p-4" style={{ borderColor: '#E5E6EB' }}>
                <h4 className="text-sm mb-2" style={{ fontWeight: 600, color: '#1D2129' }}>被试分组方案（DOE）</h4>
                <div className="space-y-1.5">
                  {[
                    { group: 'A 组', desc: `手长 160–175mm · 单手握持 · ${Math.ceil(project.participantTarget * 0.35)} 人` },
                    { group: 'B 组', desc: `手长 175–190mm · 混合握持 · ${Math.ceil(project.participantTarget * 0.4)} 人` },
                    { group: 'C 组', desc: `手长 190mm+ · 双手握持 · ${Math.floor(project.participantTarget * 0.25)} 人` },
                  ].map(g => (
                    <div key={g.group} className="flex items-center gap-2.5 p-2.5 rounded-lg" style={{ background: '#F7F8FA' }}>
                      <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: '#EEF3FF', color: '#3370FF', fontWeight: 600 }}>{g.group}</span>
                      <span className="text-xs" style={{ color: '#4E5969' }}>{g.desc}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Handsize filter */}
          <div className="bg-white rounded-xl border p-4" style={{ borderColor: '#E5E6EB' }}>
            <div className="flex items-center gap-2 mb-3">
              <Filter size={13} style={{ color: '#86909C' }} />
              <h3 className="text-sm" style={{ fontWeight: 600, color: '#1D2129' }}>手型范围快速筛选</h3>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs mb-2 block" style={{ color: '#86909C', fontWeight: 500 }}>
                  手长范围：{handLengthRange[0]}–{handLengthRange[1]} mm
                </label>
                <div className="space-y-2">
                  <input type="range" min={150} max={210} value={handLengthRange[0]}
                    onChange={e => setHandLengthRange([+e.target.value, handLengthRange[1]])}
                    className="w-full h-1.5 appearance-none rounded-full" style={{ accentColor: '#3370FF' }} />
                  <input type="range" min={150} max={210} value={handLengthRange[1]}
                    onChange={e => setHandLengthRange([handLengthRange[0], +e.target.value])}
                    className="w-full h-1.5 appearance-none rounded-full" style={{ accentColor: '#3370FF' }} />
                </div>
              </div>
              <div className="p-3 rounded-lg" style={{ background: '#F0F5FF' }}>
                <div className="text-sm" style={{ fontWeight: 600, color: '#3370FF' }}>
                  符合条件：约 {Math.floor((handLengthRange[1] - handLengthRange[0]) / 60 * 1200)} 人
                </div>
                <div className="text-xs mt-0.5" style={{ color: '#86909C' }}>
                  占数据库约 {Math.round((handLengthRange[1] - handLengthRange[0]) / 60 * 100)}%
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab: Recruit */}
      {activeTab === 'recruit' && (
        <div className="space-y-4">
          {/* Quick recruit */}
          {participants.length === 0 && (
            <div className="flex items-center justify-between p-4 rounded-xl border" style={{ background: '#FFF7E8', borderColor: '#FFD65B' }}>
              <div>
                <p className="text-sm" style={{ fontWeight: 600, color: '#7D4E00' }}>当前项目暂无被试数据</p>
                <p className="text-xs mt-0.5" style={{ color: '#965E00' }}>从被试数据库中快速筛选并模拟招募</p>
              </div>
              <button onClick={quickRecruit}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm text-white whitespace-nowrap"
                style={{ background: '#FF7D00', fontWeight: 500 }}>
                <Zap size={14} /> 一键模拟招募
              </button>
            </div>
          )}

          {participants.length > 0 && sent.length > 0 && (
            <div className="flex items-center justify-between p-4 rounded-xl border" style={{ background: '#EEF3FF', borderColor: '#BFD0FF' }}>
              <p className="text-sm" style={{ color: '#1456F0' }}>
                有 <strong>{sent.length}</strong> 位被试已收到邀请���可一键模拟确认
              </p>
              <button onClick={confirmAll}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs text-white"
                style={{ background: '#3370FF', fontWeight: 500 }}>
                <UserCheck size={12} /> 模拟全部确认
              </button>
            </div>
          )}

          {/* Progress */}
          <div className="bg-white rounded-xl border p-4" style={{ borderColor: '#E5E6EB' }}>
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm" style={{ fontWeight: 500, color: '#1D2129' }}>招募进度</span>
              <span className="text-sm" style={{ color: '#4E5969' }}>
                已确认 <strong style={{ color: '#3370FF' }}>{confirmed.length}</strong> / 目标 {project.participantTarget} 人
              </span>
            </div>
            <div className="h-2 rounded-full overflow-hidden" style={{ background: '#F2F3F5' }}>
              <div className="h-full rounded-full transition-all" style={{ width: `${Math.min(100, (confirmed.length / project.participantTarget) * 100)}%`, background: '#3370FF' }} />
            </div>
            {confirmed.length < project.participantTarget && (
              <p className="text-xs mt-2" style={{ color: '#FF7D00' }}>
                ⚠ 还需 {project.participantTarget - confirmed.length} 人确认
              </p>
            )}
          </div>

          {/* Participant table */}
          <div className="bg-white rounded-xl border overflow-hidden" style={{ borderColor: '#E5E6EB' }}>
            <div className="flex items-center justify-between px-4 py-3 border-b" style={{ borderColor: '#F2F3F5' }}>
              <h3 className="text-sm" style={{ fontWeight: 600, color: '#1D2129' }}>被试状态跟踪</h3>
              <button onClick={() => setShowInviteModal(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-white"
                style={{ background: '#3370FF', fontWeight: 500 }}>
                <Mail size={12} /> 一键邀请
              </button>
            </div>
            {participants.length === 0 ? (
              <div className="px-4 py-10 text-center text-sm" style={{ color: '#86909C' }}>暂无被试数据，请先点击「一键模拟招募」</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead style={{ background: '#FAFAFA' }}>
                    <tr>
                      {['编号', '手长', '手宽', '握持', '年龄段', '邀请状态'].map(h => (
                        <th key={h} className="px-4 py-2.5 text-left text-xs whitespace-nowrap" style={{ fontWeight: 600, color: '#86909C' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y" style={{ borderColor: '#F2F3F5' }}>
                    {displayList.map((p, i) => (
                      <tr key={i} className="hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-3" style={{ fontWeight: 500, color: '#1D2129' }}>{p.code}</td>
                        <td className="px-4 py-3" style={{ color: '#4E5969' }}>{p.handLength} mm</td>
                        <td className="px-4 py-3" style={{ color: '#4E5969' }}>{p.handWidth} mm</td>
                        <td className="px-4 py-3 text-xs" style={{ color: '#4E5969' }}>{p.gripHabit === 'onehand' ? '单手' : '双手'}</td>
                        <td className="px-4 py-3 text-xs" style={{ color: '#4E5969' }}>{p.ageGroup}</td>
                        <td className="px-4 py-3">
                          <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full"
                            style={{ background: statusMap[p.invitationStatus]?.bg, color: statusMap[p.invitationStatus]?.color }}>
                            {statusMap[p.invitationStatus]?.icon}
                            {statusMap[p.invitationStatus]?.label}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            {participants.length > 8 && (
              <div className="px-4 py-2.5 border-t" style={{ borderColor: '#F2F3F5' }}>
                <button onClick={() => setShowAll(!showAll)}
                  className="flex items-center gap-1 text-xs transition-colors"
                  style={{ color: '#3370FF' }}>
                  {showAll ? '收起' : `查看全部 ${participants.length} 人`}
                  <ChevronDown size={12} className={showAll ? 'rotate-180 transition-transform' : 'transition-transform'} />
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Navigation */}
      <div className="flex items-center justify-between pt-4 border-t" style={{ borderColor: '#E5E6EB' }}>
        <button onClick={() => navigate(`/tob/he/projects/${id}/run/questionnaire`)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm transition-colors"
          style={{ border: '1px solid #E5E6EB', color: '#4E5969', background: 'white' }}>
          <ArrowLeft size={15} /> 上一步
        </button>
        <button onClick={() => {
          dispatch({ type: 'UPDATE_HE_PROJECT', payload: { id: id!, updates: { currentStep: 'lab', status: 'running' } } });
          navigate(`/tob/he/projects/${id}/run/lab`);
        }} disabled={confirmed.length < 1}
          className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm text-white transition-all shadow-sm"
          style={confirmed.length >= 1 ? { background: '#3370FF' } : { background: '#C9CDD4', cursor: 'not-allowed' }}>
          被试方案确认 · 下一步：场地安排 <ArrowRight size={15} />
        </button>
      </div>

      {/* Invite modal */}
      {showInviteModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50" style={{ background: 'rgba(0,0,0,0.4)' }}
          onClick={() => setShowInviteModal(false)}>
          <div className="bg-white rounded-2xl p-6 max-w-md w-full mx-4 shadow-2xl" onClick={e => e.stopPropagation()}>
            <h3 className="mb-4" style={{ fontWeight: 700, fontSize: '1rem', color: '#1D2129' }}>生成邀请信息</h3>
            <div className="p-4 rounded-xl text-sm leading-relaxed mb-4" style={{ background: '#F7F8FA', color: '#4E5969' }}>
              您好！我们正在开展《{project.name}》研究项目，诚邀您参与本次实验。实验时间约60–90分钟，地点为人因实验室A，报酬100元。请回复本消息确认参与意愿。感谢您的支持！
            </div>
            <div className="flex gap-2 mb-4">
              {['站内消息', '邮件', '微信分享'].map(m => (
                <button key={m} className="flex-1 py-2 rounded-xl text-sm transition-colors" style={{ border: '1px solid #E5E6EB', color: '#4E5969' }}>{m}</button>
              ))}
            </div>
            <div className="flex gap-3">
              <button onClick={() => setShowInviteModal(false)}
                className="flex-1 py-2.5 rounded-xl text-sm" style={{ border: '1px solid #E5E6EB', color: '#4E5969' }}>取消</button>
              <button onClick={() => setShowInviteModal(false)}
                className="flex-1 py-2.5 rounded-xl text-sm text-white" style={{ background: '#3370FF', fontWeight: 500 }}>发送邀请</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}