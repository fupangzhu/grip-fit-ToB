import { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router';
import { ArrowLeft, Save, CheckCircle, Clock, AlertTriangle, User, Hand, ChevronDown, ChevronUp, FileText, Activity, MessageSquare, Camera, Plus, Trash2 } from 'lucide-react';
import { useAppStore, RESEARCH_TYPE_LABELS } from '../../../store';

/* ── Questionnaire items generated based on project research types ── */
interface QItem {
  id: string;
  dimension: string;
  question: string;
  type: 'likert9' | 'likert7' | 'likert5' | 'sd' | 'nps' | 'text';
  anchors?: [string, string];
  value: number | string | null;
}

function generateItems(researchTypes: string[]): QItem[] {
  const items: QItem[] = [];
  let idx = 0;
  const mk = (dim: string, q: string, type: QItem['type'], anchors?: [string, string]): QItem =>
    ({ id: `q${++idx}`, dimension: dim, question: q, type, anchors, value: null });

  if (researchTypes.includes('comfort') || researchTypes.includes('form')) {
    items.push(
      mk('握持舒适度', '请评价当前手机的整体握持舒适感受', 'likert9', ['极不舒适', '极舒适']),
      mk('握持舒适度', '手机握持时手掌接触面的压力感受', 'likert9', ['压力明显', '无压力']),
      mk('握持舒适度', '握持 5 分钟后的疲劳程度', 'likert9', ['极度疲劳', '毫不疲劳']),
      mk('单手操控', '单手握持时拇指触达屏幕顶部的便利程度', 'likert9', ['极困难', '极便利']),
      mk('单手操控', '单手操作时的握持稳定感', 'likert9', ['极不稳', '极稳固']),
      mk('单手操控', '单手输入文字时的舒适度', 'likert9', ['极不舒适', '极舒适']),
      mk('形态感知', '手机外观给您的感觉：笨重 ↔ 轻盈', 'sd', ['笨重', '轻盈']),
      mk('形态感知', '手机外观给您的感觉：臃肿 ↔ 纤薄', 'sd', ['臃肿', '纤薄']),
      mk('形态感知', '手机外观给您的感觉：廉价 ↔ 精致', 'sd', ['廉价', '精致']),
      mk('综合评价', '您对这款手机握持体验的综合满意度', 'nps'),
    );
  }
  if (researchTypes.includes('thermal')) {
    items.push(
      mk('温度感受', '当前手机机身温度的主观感受', 'likert7', ['冷', '热']),
      mk('温度感受', '手机温度对使用意愿的影响', 'likert5', ['严重影响', '不影响']),
      mk('热舒适', '整体热舒适满意度', 'likert7', ['非常不满', '非常满意']),
    );
  }
  if (researchTypes.includes('vibration')) {
    items.push(
      mk('振动强度', '振动反馈的强度感知（参考=100）', 'text'),
      mk('振动质量', '振动手感：粗糙 ↔ 细腻', 'sd', ['粗糙', '细腻']),
      mk('振动质量', '振动手感：刺激 ↔ 柔和', 'sd', ['刺激', '柔和']),
      mk('反馈准确', '振动反馈与操作的匹配准确性', 'likert7', ['完全不准确', '非常准确']),
    );
  }
  if (researchTypes.includes('acoustic')) {
    items.push(
      mk('音质', '扬声器音质的整体评价', 'likert5', ['劣质', '优']),
      mk('音质', '人声清晰度评价', 'likert5', ['模糊', '清晰']),
      mk('通话', '通话舒适度', 'likert7', ['极不舒适', '极舒适']),
    );
  }
  if (researchTypes.includes('touch')) {
    items.push(
      mk('触感', '屏幕玻璃的触感评价', 'likert7', ['粗糙不适', '光滑舒适']),
      mk('触感', '边框材质的握持感受', 'likert7', ['不适', '舒适']),
    );
  }
  if (researchTypes.includes('weight')) {
    items.push(
      mk('重量感知', '手机拿在手上的主观重量感受', 'likert9', ['极重', '极轻']),
      mk('重量感知', '连续使用 10 分钟后的手腕疲劳感', 'likert9', ['极度疲劳', '毫不疲劳']),
    );
  }
  return items;
}

/* ── Likert scale component ── */
function LikertScale({ points, value, onChange, anchors }: {
  points: number; value: number | null; onChange: (v: number) => void; anchors?: [string, string];
}) {
  return (
    <div>
      <div className="flex items-center gap-1">
        {Array.from({ length: points }, (_, i) => i + 1).map(n => (
          <button key={n} onClick={() => onChange(n)}
            className="w-8 h-8 rounded-md text-xs transition-all flex items-center justify-center"
            style={value === n
              ? { background: '#3370FF', color: 'white', fontWeight: 600 }
              : { background: '#F7F8FA', color: '#4E5969', border: '1px solid #E5E6EB' }
            }>
            {n}
          </button>
        ))}
      </div>
      {anchors && (
        <div className="flex justify-between mt-1">
          <span style={{ fontSize: 10, color: '#C9CDD4' }}>{anchors[0]}</span>
          <span style={{ fontSize: 10, color: '#C9CDD4' }}>{anchors[1]}</span>
        </div>
      )}
    </div>
  );
}

/* ── NPS component ── */
function NPSScale({ value, onChange }: { value: number | null; onChange: (v: number) => void }) {
  return (
    <div>
      <div className="flex items-center gap-0.5">
        {Array.from({ length: 11 }, (_, i) => i).map(n => (
          <button key={n} onClick={() => onChange(n)}
            className="flex-1 h-8 rounded text-xs transition-all flex items-center justify-center"
            style={value === n
              ? { background: n <= 6 ? '#F53F3F' : n <= 8 ? '#FF7D00' : '#00B42A', color: 'white', fontWeight: 600 }
              : { background: '#F7F8FA', color: '#86909C', border: '1px solid #E5E6EB' }
            }>
            {n}
          </button>
        ))}
      </div>
      <div className="flex justify-between mt-1">
        <span style={{ fontSize: 10, color: '#C9CDD4' }}>完全不推荐</span>
        <span style={{ fontSize: 10, color: '#C9CDD4' }}>强烈推荐</span>
      </div>
    </div>
  );
}

/* ── Observation note ── */
interface ObsNote {
  id: string;
  time: string;
  text: string;
  tag: 'behavior' | 'verbal' | 'anomaly' | 'general';
}

const TAG_LABELS: Record<string, { label: string; color: string; bg: string }> = {
  behavior: { label: '行为', color: '#3370FF', bg: '#EEF3FF' },
  verbal:   { label: '口述', color: '#00B42A', bg: '#E8F7EA' },
  anomaly:  { label: '异常', color: '#F53F3F', bg: '#FFF1F0' },
  general:  { label: '备注', color: '#86909C', bg: '#F2F3F5' },
};

/* ── Main page ── */
export function ParticipantSessionPage() {
  const { id, participantCode } = useParams<{ id: string; participantCode: string }>();
  const navigate = useNavigate();
  const { state, dispatch } = useAppStore();
  const project = state.heProjects.find(p => p.id === id);

  const participant = project?.participants.find(p => p.code === participantCode);
  const questItems = useMemo(() => generateItems(project?.researchTypes ?? []), [project?.researchTypes]);

  const [answers, setAnswers] = useState<Record<string, number | string | null>>({});
  const [notes, setNotes] = useState<ObsNote[]>([]);
  const [newNote, setNewNote] = useState('');
  const [newNoteTag, setNewNoteTag] = useState<ObsNote['tag']>('general');
  const [collapsedDims, setCollapsedDims] = useState<Set<string>>(new Set());
  const [isSaved, setIsSaved] = useState(false);
  const [physioNotes, setPhysioNotes] = useState({ eeg: '', eda: '', video: '', other: '' });

  if (!project || !participant) {
    return (
      <div className="p-6 text-center" style={{ color: '#86909C' }}>
        <p>未找到被试信息</p>
        <button onClick={() => navigate(-1)} className="mt-3 text-sm" style={{ color: '#3370FF' }}>返回</button>
      </div>
    );
  }

  const setAnswer = (qId: string, val: number | string) => {
    setAnswers(prev => ({ ...prev, [qId]: val }));
    setIsSaved(false);
  };

  const answeredCount = Object.values(answers).filter(v => v !== null && v !== '').length;
  const totalCount = questItems.length;
  const progress = totalCount > 0 ? Math.round((answeredCount / totalCount) * 100) : 0;

  // Group items by dimension
  const grouped = questItems.reduce<Record<string, QItem[]>>((acc, item) => {
    (acc[item.dimension] ??= []).push(item);
    return acc;
  }, {});
  const dimensions = Object.keys(grouped);

  const toggleDim = (dim: string) => {
    setCollapsedDims(prev => {
      const next = new Set(prev);
      next.has(dim) ? next.delete(dim) : next.add(dim);
      return next;
    });
  };

  const addNote = () => {
    if (!newNote.trim()) return;
    const now = new Date();
    setNotes(prev => [...prev, {
      id: `n${Date.now()}`,
      time: `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`,
      text: newNote.trim(),
      tag: newNoteTag,
    }]);
    setNewNote('');
  };

  const deleteNote = (noteId: string) => {
    setNotes(prev => prev.filter(n => n.id !== noteId));
  };

  const handleSave = () => {
    // Update participant progress in store
    dispatch({
      type: 'UPDATE_HE_PROJECT',
      payload: {
        id: id!,
        updates: {
          participants: project.participants.map(p =>
            p.code === participantCode
              ? { ...p, questProgress: answeredCount, questTotal: totalCount, recordingStatus: answeredCount === totalCount ? 'done' as const : 'recording' as const }
              : p
          ),
        },
      },
    });
    setIsSaved(true);
  };

  const handleSubmitAndReturn = () => {
    handleSave();
    navigate(`/tob/he/projects/${id}/run/collect`);
  };

  return (
    <div className="p-5 space-y-4 max-w-5xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(`/tob/he/projects/${id}/run/collect`)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm transition-colors hover:bg-gray-100"
            style={{ color: '#4E5969', border: '1px solid #E5E6EB' }}>
            <ArrowLeft size={14} /> 返回采集
          </button>
          <div>
            <h2 style={{ fontSize: 16, fontWeight: 700, color: '#1D2129' }}>
              被试 {participant.code} · 数据采集
            </h2>
            <p style={{ fontSize: 12, color: '#86909C', marginTop: 2 }}>
              {project.name} · {project.researchTypes.map(rt => RESEARCH_TYPE_LABELS[rt]).join('、')}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={handleSave}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm transition-colors"
            style={isSaved
              ? { background: '#E8F7EA', color: '#00B42A', fontWeight: 500 }
              : { background: '#3370FF', color: 'white', fontWeight: 500 }
            }>
            {isSaved ? <><CheckCircle size={14} /> 已保存</> : <><Save size={14} /> 保存</>}
          </button>
          <button onClick={handleSubmitAndReturn}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm transition-colors"
            style={{ background: '#00B42A', color: 'white', fontWeight: 500 }}>
            <CheckCircle size={14} /> 提交并返回
          </button>
        </div>
      </div>

      {/* Participant info + progress */}
      <div className="grid grid-cols-3 gap-4">
        <div className="col-span-1 rounded-xl p-4" style={{ background: 'white', border: '1px solid #E5E6EB' }}>
          <div className="flex items-center gap-2 mb-3">
            <div className="w-9 h-9 rounded-full flex items-center justify-center" style={{ background: '#EEF3FF' }}>
              <User size={16} style={{ color: '#3370FF' }} />
            </div>
            <div>
              <span style={{ fontSize: 14, fontWeight: 600, color: '#1D2129', display: 'block' }}>{participant.code}</span>
              <span style={{ fontSize: 11, color: '#86909C' }}>
                {participant.ageGroup} · {participant.gripHabit === 'onehand' ? '单手握持' : '双手握持'}
              </span>
            </div>
          </div>
          <div className="space-y-2">
            {[
              { icon: Hand, label: '手长', value: `${participant.handLength} mm` },
              { icon: Hand, label: '手宽', value: `${participant.handWidth} mm` },
              { icon: Hand, label: '拇指跨距', value: `${participant.thumbSpan} mm` },
            ].map(item => (
              <div key={item.label} className="flex items-center justify-between py-1" style={{ borderBottom: '1px solid #F2F3F5' }}>
                <span className="flex items-center gap-1.5" style={{ fontSize: 12, color: '#86909C' }}>
                  <item.icon size={11} /> {item.label}
                </span>
                <span style={{ fontSize: 12, fontWeight: 500, color: '#1D2129' }}>{item.value}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="col-span-2 rounded-xl p-4" style={{ background: 'white', border: '1px solid #E5E6EB' }}>
          <div className="flex items-center justify-between mb-3">
            <span style={{ fontSize: 13, fontWeight: 600, color: '#1D2129' }}>量表作答进度</span>
            <span style={{ fontSize: 12, color: progress === 100 ? '#00B42A' : '#3370FF', fontWeight: 600 }}>
              {answeredCount} / {totalCount} 题（{progress}%）
            </span>
          </div>
          <div className="h-2 rounded-full overflow-hidden mb-4" style={{ background: '#F2F3F5' }}>
            <div className="h-full rounded-full transition-all" style={{
              width: `${progress}%`,
              background: progress === 100 ? '#00B42A' : '#3370FF',
            }} />
          </div>
          {/* Dimension progress */}
          <div className="grid grid-cols-3 gap-2">
            {dimensions.map(dim => {
              const items = grouped[dim];
              const dimAnswered = items.filter(q => answers[q.id] !== undefined && answers[q.id] !== null && answers[q.id] !== '').length;
              const dimDone = dimAnswered === items.length;
              return (
                <div key={dim} className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg" style={{ background: dimDone ? '#E8F7EA' : '#F7F8FA' }}>
                  {dimDone
                    ? <CheckCircle size={12} style={{ color: '#00B42A' }} />
                    : <Clock size={12} style={{ color: '#C9CDD4' }} />}
                  <span style={{ fontSize: 11, color: dimDone ? '#00B42A' : '#4E5969' }}>{dim}</span>
                  <span style={{ fontSize: 10, color: '#C9CDD4', marginLeft: 'auto' }}>{dimAnswered}/{items.length}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Two column: questionnaire + notes */}
      <div className="grid grid-cols-3 gap-4">
        {/* Questionnaire */}
        <div className="col-span-2 space-y-3">
          <div className="flex items-center gap-2 px-1">
            <FileText size={14} style={{ color: '#3370FF' }} />
            <span style={{ fontSize: 13, fontWeight: 600, color: '#1D2129' }}>量表填写</span>
            <span style={{ fontSize: 11, color: '#86909C' }}>按维度分组，支持手动逐项录入</span>
          </div>

          {dimensions.map(dim => {
            const items = grouped[dim];
            const isCollapsed = collapsedDims.has(dim);
            const dimAnswered = items.filter(q => answers[q.id] !== undefined && answers[q.id] !== null && answers[q.id] !== '').length;
            const dimDone = dimAnswered === items.length;

            return (
              <div key={dim} className="rounded-xl overflow-hidden" style={{ background: 'white', border: '1px solid #E5E6EB' }}>
                <div
                  className="flex items-center justify-between px-4 py-3 cursor-pointer transition-colors hover:bg-gray-50"
                  onClick={() => toggleDim(dim)}
                  style={{ borderBottom: isCollapsed ? undefined : '1px solid #F2F3F5' }}
                >
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full" style={{ background: dimDone ? '#00B42A' : '#3370FF' }} />
                    <span style={{ fontSize: 13, fontWeight: 600, color: '#1D2129' }}>{dim}</span>
                    <span className="px-2 py-0.5 rounded" style={{ fontSize: 10, background: dimDone ? '#E8F7EA' : '#F2F3F5', color: dimDone ? '#00B42A' : '#86909C' }}>
                      {dimAnswered}/{items.length}
                    </span>
                  </div>
                  {isCollapsed ? <ChevronDown size={14} style={{ color: '#86909C' }} /> : <ChevronUp size={14} style={{ color: '#86909C' }} />}
                </div>

                {!isCollapsed && (
                  <div className="divide-y" style={{ borderColor: '#F2F3F5' }}>
                    {items.map((q, qi) => (
                      <div key={q.id} className="px-4 py-4">
                        <div className="flex items-start gap-2 mb-3">
                          <span className="w-5 h-5 rounded flex items-center justify-center flex-shrink-0 mt-0.5"
                            style={{
                              fontSize: 10, fontWeight: 600,
                              background: answers[q.id] !== undefined && answers[q.id] !== null && answers[q.id] !== '' ? '#3370FF' : '#F2F3F5',
                              color: answers[q.id] !== undefined && answers[q.id] !== null && answers[q.id] !== '' ? 'white' : '#86909C',
                            }}>
                            {qi + 1}
                          </span>
                          <span style={{ fontSize: 13, color: '#1D2129' }}>{q.question}</span>
                        </div>

                        {q.type === 'likert9' && (
                          <LikertScale points={9} value={answers[q.id] as number | null ?? null} onChange={v => setAnswer(q.id, v)} anchors={q.anchors} />
                        )}
                        {q.type === 'likert7' && (
                          <LikertScale points={7} value={answers[q.id] as number | null ?? null} onChange={v => setAnswer(q.id, v)} anchors={q.anchors} />
                        )}
                        {q.type === 'likert5' && (
                          <LikertScale points={5} value={answers[q.id] as number | null ?? null} onChange={v => setAnswer(q.id, v)} anchors={q.anchors} />
                        )}
                        {q.type === 'sd' && (
                          <LikertScale points={7} value={answers[q.id] as number | null ?? null} onChange={v => setAnswer(q.id, v)} anchors={q.anchors} />
                        )}
                        {q.type === 'nps' && (
                          <NPSScale value={answers[q.id] as number | null ?? null} onChange={v => setAnswer(q.id, v)} />
                        )}
                        {q.type === 'text' && (
                          <input
                            type="text"
                            placeholder="请输入数值或描述..."
                            value={(answers[q.id] as string) ?? ''}
                            onChange={e => setAnswer(q.id, e.target.value)}
                            className="w-full px-3 py-2 rounded-lg outline-none transition-colors"
                            style={{ fontSize: 13, border: '1px solid #E5E6EB', background: '#F7F8FA' }}
                            onFocus={e => { e.target.style.borderColor = '#3370FF'; e.target.style.background = 'white'; }}
                            onBlur={e => { e.target.style.borderColor = '#E5E6EB'; e.target.style.background = '#F7F8FA'; }}
                          />
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Right sidebar: notes + physio */}
        <div className="space-y-4">
          {/* Observation notes */}
          <div className="rounded-xl overflow-hidden" style={{ background: 'white', border: '1px solid #E5E6EB' }}>
            <div className="flex items-center gap-2 px-4 py-3" style={{ borderBottom: '1px solid #F2F3F5' }}>
              <MessageSquare size={13} style={{ color: '#3370FF' }} />
              <span style={{ fontSize: 13, fontWeight: 600, color: '#1D2129' }}>观察记录</span>
              <span style={{ fontSize: 11, color: '#C9CDD4' }}>{notes.length} 条</span>
            </div>

            <div className="p-3">
              {/* Tag selector */}
              <div className="flex gap-1 mb-2">
                {(Object.keys(TAG_LABELS) as ObsNote['tag'][]).map(tag => (
                  <button key={tag} onClick={() => setNewNoteTag(tag)}
                    className="px-2 py-1 rounded text-xs transition-colors"
                    style={newNoteTag === tag
                      ? { background: TAG_LABELS[tag].bg, color: TAG_LABELS[tag].color, fontWeight: 500 }
                      : { color: '#86909C' }
                    }>
                    {TAG_LABELS[tag].label}
                  </button>
                ))}
              </div>
              {/* Input */}
              <div className="flex gap-2">
                <input
                  value={newNote}
                  onChange={e => setNewNote(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && addNote()}
                  placeholder="记录观察到的行为、口述..."
                  className="flex-1 px-3 py-2 rounded-lg outline-none text-sm"
                  style={{ border: '1px solid #E5E6EB', background: '#F7F8FA', fontSize: 12 }}
                />
                <button onClick={addNote}
                  className="px-3 py-2 rounded-lg transition-colors"
                  style={{ background: '#3370FF', color: 'white' }}>
                  <Plus size={14} />
                </button>
              </div>

              {/* Note list */}
              {notes.length > 0 && (
                <div className="mt-3 space-y-2 max-h-64 overflow-y-auto">
                  {notes.map(note => {
                    const tagStyle = TAG_LABELS[note.tag];
                    return (
                      <div key={note.id} className="flex items-start gap-2 p-2 rounded-lg" style={{ background: '#F7F8FA' }}>
                        <span className="px-1.5 py-0.5 rounded flex-shrink-0"
                          style={{ fontSize: 10, background: tagStyle.bg, color: tagStyle.color }}>
                          {tagStyle.label}
                        </span>
                        <div className="flex-1 min-w-0">
                          <p style={{ fontSize: 12, color: '#1D2129', lineHeight: 1.5 }}>{note.text}</p>
                          <span style={{ fontSize: 10, color: '#C9CDD4' }}>{note.time}</span>
                        </div>
                        <button onClick={() => deleteNote(note.id)} className="flex-shrink-0 p-0.5 rounded transition-colors hover:bg-gray-200" style={{ color: '#C9CDD4' }}>
                          <Trash2 size={11} />
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Physiological data notes */}
          <div className="rounded-xl overflow-hidden" style={{ background: 'white', border: '1px solid #E5E6EB' }}>
            <div className="flex items-center gap-2 px-4 py-3" style={{ borderBottom: '1px solid #F2F3F5' }}>
              <Activity size={13} style={{ color: '#3370FF' }} />
              <span style={{ fontSize: 13, fontWeight: 600, color: '#1D2129' }}>生理数据备注</span>
            </div>
            <div className="p-3 space-y-3">
              {[
                { key: 'eeg' as const, label: 'EEG 脑电', placeholder: '阻抗、信号质量、异常记录...' },
                { key: 'eda' as const, label: 'EDA 皮电', placeholder: '基线水平、传感器状态...' },
                { key: 'video' as const, label: '视频标注', placeholder: '关键时间点、行为事件...' },
                { key: 'other' as const, label: '其他备注', placeholder: '环境因素、被试状态...' },
              ].map(field => (
                <div key={field.key}>
                  <label style={{ fontSize: 11, fontWeight: 500, color: '#86909C', display: 'block', marginBottom: 4 }}>
                    {field.label}
                  </label>
                  <textarea
                    value={physioNotes[field.key]}
                    onChange={e => setPhysioNotes(prev => ({ ...prev, [field.key]: e.target.value }))}
                    placeholder={field.placeholder}
                    rows={2}
                    className="w-full px-3 py-2 rounded-lg outline-none resize-none"
                    style={{ fontSize: 12, border: '1px solid #E5E6EB', background: '#F7F8FA' }}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Quick action timestamps */}
          <div className="rounded-xl p-4" style={{ background: 'white', border: '1px solid #E5E6EB' }}>
            <div className="flex items-center gap-2 mb-3">
              <Camera size={13} style={{ color: '#3370FF' }} />
              <span style={{ fontSize: 13, fontWeight: 600, color: '#1D2129' }}>快捷操作</span>
            </div>
            <div className="space-y-2">
              <button
                onClick={() => {
                  const now = new Date();
                  const ts = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;
                  setNotes(prev => [...prev, { id: `n${Date.now()}`, time: ts, text: `时间戳标记 @ ${ts}`, tag: 'general' }]);
                }}
                className="w-full py-2 rounded-lg text-xs transition-colors hover:bg-gray-100"
                style={{ border: '1px solid #E5E6EB', color: '#4E5969' }}>
                + 插入时间戳
              </button>
              <button
                onClick={() => {
                  const now = new Date();
                  const ts = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;
                  setNotes(prev => [...prev, { id: `n${Date.now()}`, time: ts, text: `⚠ 被试表现异常 @ ${ts}`, tag: 'anomaly' }]);
                }}
                className="w-full py-2 rounded-lg text-xs transition-colors hover:bg-red-50"
                style={{ border: '1px solid #FFCCC7', color: '#F53F3F' }}>
                + 标记异常
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
