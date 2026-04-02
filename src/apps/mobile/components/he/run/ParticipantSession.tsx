import { useState } from 'react';
import { useParams, useNavigate } from 'react-router';
import { ArrowLeft, Save, CheckCircle, Plus, Trash2 } from 'lucide-react';
import { useAppStore } from '../../../store';

interface QItem { id: string; dim: string; q: string; type: 'likert' | 'sd' | 'text'; value: number | string | null; anchors?: [string, string] }

function makeItems(types: string[]): QItem[] {
  const items: QItem[] = [];
  let i = 0;
  const mk = (dim: string, q: string, type: QItem['type'], anchors?: [string, string]): QItem =>
    ({ id: `q${++i}`, dim, q, type, anchors, value: null });
  if (types.includes('comfort') || types.includes('form')) {
    items.push(mk('握持舒适', '整体握持舒适感受', 'likert', ['极不舒适', '极舒适']));
    items.push(mk('单手操控', '拇指触达屏幕顶部便利度', 'likert', ['极困难', '极便利']));
    items.push(mk('形态感知', '外观感觉：笨重↔轻盈', 'sd', ['笨重', '轻盈']));
    items.push(mk('综合评价', '综合满意度(0–10)', 'text'));
  }
  if (types.includes('thermal')) items.push(mk('温度', '机身温度感受', 'likert', ['冷', '热']));
  if (types.includes('vibration')) items.push(mk('振动', '振动手感：粗糙↔细腻', 'sd', ['粗糙', '细腻']));
  if (types.includes('acoustic')) items.push(mk('音质', '扬声器音质', 'likert', ['劣质', '优']));
  return items;
}

export function ParticipantSessionPage() {
  const { id, participantCode } = useParams<{ id: string; participantCode: string }>();
  const navigate = useNavigate();
  const { state, dispatch } = useAppStore();
  const project = state.heProjects.find(p => p.id === id);
  const participant = project?.participants.find(p => p.code === participantCode);

  const [items, setItems] = useState<QItem[]>(() => makeItems(project?.researchTypes ?? []));
  const [notes, setNotes] = useState<string[]>([]);
  const [newNote, setNewNote] = useState('');
  const [saved, setSaved] = useState(false);

  if (!project || !participant) return null;
  const answered = items.filter(q => q.value !== null).length;

  function updateItem(qid: string, value: number | string) {
    setItems(prev => prev.map(q => q.id === qid ? { ...q, value } : q));
  }

  function handleSave() {
    const updated = project.participants.map(p =>
      p.code === participantCode ? { ...p, recordingStatus: 'done' as const, questProgress: items.length, questTotal: items.length } : p
    );
    dispatch({ type: 'UPDATE_HE_PROJECT', payload: { id: id!, updates: { participants: updated } } });
    setSaved(true);
  }

  return (
    <div className="px-4 py-4 space-y-3">
      <div className="flex items-center gap-2">
        <button onClick={() => navigate(`/tob/he/projects/${id}/run/collect`)} style={{ color: '#86909C' }}><ArrowLeft size={16} /></button>
        <div>
          <span style={{ fontSize: 14, fontWeight: 700, color: '#1D2129' }}>{participantCode}</span>
          <span className="ml-2" style={{ fontSize: 10, color: '#86909C' }}>手长 {participant.handLength}mm · {participant.ageGroup}</span>
        </div>
      </div>

      <div className="flex items-center justify-between p-2.5 rounded-lg" style={{ background: '#EEF3FF' }}>
        <span style={{ fontSize: 11, color: '#3370FF', fontWeight: 500 }}>量表进度 {answered}/{items.length}</span>
        <div className="w-20 h-1 rounded-full" style={{ background: '#BFD0FF' }}>
          <div className="h-full rounded-full" style={{ width: `${(answered / items.length) * 100}%`, background: '#3370FF' }} />
        </div>
      </div>

      {/* Questions */}
      <div className="space-y-3">
        {items.map(q => (
          <div key={q.id} className="bg-white rounded-xl p-3 border" style={{ borderColor: '#E5E6EB' }}>
            <div className="flex items-center gap-1.5 mb-2">
              <span className="px-1.5 py-0.5 rounded" style={{ fontSize: 9, background: '#F2F3F5', color: '#86909C' }}>{q.dim}</span>
              <span style={{ fontSize: 12, fontWeight: 500, color: '#1D2129' }}>{q.q}</span>
            </div>
            {q.type === 'text' ? (
              <input type="text" value={q.value ?? ''} onChange={e => updateItem(q.id, e.target.value)}
                placeholder="输入…"
                className="w-full px-2.5 py-2 rounded-lg outline-none"
                style={{ border: '1px solid #E5E6EB', fontSize: 12 }} />
            ) : (
              <div>
                {q.anchors && (
                  <div className="flex justify-between mb-1" style={{ fontSize: 9, color: '#86909C' }}>
                    <span>{q.anchors[0]}</span><span>{q.anchors[1]}</span>
                  </div>
                )}
                <div className="flex gap-1">
                  {(q.type === 'sd' ? [1,2,3,4,5,6,7] : [1,2,3,4,5,6,7,8,9]).map(n => (
                    <button key={n} onClick={() => updateItem(q.id, n)}
                      className="flex-1 py-1.5 rounded transition-all"
                      style={q.value === n
                        ? { background: '#3370FF', color: 'white', fontSize: 10, fontWeight: 700 }
                        : { background: '#F2F3F5', color: '#4E5969', fontSize: 10 }
                      }>{n}</button>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Notes */}
      <div className="bg-white rounded-xl p-3 border" style={{ borderColor: '#E5E6EB' }}>
        <span style={{ fontSize: 12, fontWeight: 600, color: '#1D2129', display: 'block', marginBottom: 8 }}>观察记录</span>
        {notes.map((n, i) => (
          <div key={i} className="flex items-center gap-2 mb-1.5">
            <span className="flex-1" style={{ fontSize: 11, color: '#4E5969' }}>{n}</span>
            <button onClick={() => setNotes(prev => prev.filter((_, j) => j !== i))} style={{ color: '#C9CDD4' }}><Trash2 size={12} /></button>
          </div>
        ))}
        <div className="flex gap-2">
          <input value={newNote} onChange={e => setNewNote(e.target.value)}
            placeholder="添加记录…" className="flex-1 px-2.5 py-1.5 rounded-lg outline-none"
            style={{ border: '1px solid #E5E6EB', fontSize: 11 }} />
          <button onClick={() => { if (newNote.trim()) { setNotes(p => [...p, newNote]); setNewNote(''); } }}
            className="px-2.5 py-1.5 rounded-lg" style={{ background: '#F2F3F5', color: '#4E5969' }}>
            <Plus size={14} />
          </button>
        </div>
      </div>

      <button onClick={handleSave}
        className="w-full py-3 rounded-xl flex items-center justify-center gap-2 text-white"
        style={{ background: saved ? '#00B42A' : '#3370FF', fontSize: 13, fontWeight: 600 }}>
        {saved ? <><CheckCircle size={15} /> 已保存</> : <><Save size={15} /> 保存并完成</>}
      </button>
    </div>
  );
}
