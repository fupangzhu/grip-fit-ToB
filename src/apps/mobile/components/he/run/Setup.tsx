import { useState } from 'react';
import { useParams, useNavigate } from 'react-router';
import { ArrowRight, Check } from 'lucide-react';
import { useAppStore } from '../../../store';

const EQUIPMENT = [
  { key: 'eeg', name: 'EEG 脑电设备', desc: '32通道 · 需凝胶' },
  { key: 'eda', name: 'EDA 皮电设备', desc: '手指电极' },
  { key: 'cam', name: '摄像头', desc: '4K · 多角度' },
  { key: 'mic', name: '录音设备', desc: '指向性麦克风' },
  { key: 'tablet', name: '量表终端', desc: 'iPad 量表填写' },
  { key: 'samples', name: '样机样品', desc: '需至少3组' },
];

export function SetupPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { dispatch } = useAppStore();
  const [checked, setChecked] = useState<Set<string>>(new Set());

  return (
    <div className="px-4 py-4 space-y-3">
      <div className="flex items-center justify-between">
        <span style={{ fontSize: 14, fontWeight: 700, color: '#1D2129' }}>设备准备</span>
        <span style={{ fontSize: 11, color: '#86909C' }}>{checked.size}/{EQUIPMENT.length} 已确认</span>
      </div>

      <div className="space-y-2">
        {EQUIPMENT.map(eq => {
          const done = checked.has(eq.key);
          return (
            <button key={eq.key}
              onClick={() => setChecked(p => { const n = new Set(p); n.has(eq.key) ? n.delete(eq.key) : n.add(eq.key); return n; })}
              className="w-full flex items-center gap-3 p-3 rounded-xl text-left transition-all"
              style={done
                ? { background: '#F6FFED', border: '1.5px solid #B7EB8F' }
                : { background: 'white', border: '1px solid #E5E6EB' }
              }>
              <div className="w-5 h-5 rounded flex items-center justify-center flex-shrink-0"
                style={done ? { background: '#00B42A' } : { border: '1.5px solid #C9CDD4' }}>
                {done && <Check size={11} className="text-white" />}
              </div>
              <div className="flex-1">
                <span style={{ fontSize: 12, fontWeight: 600, color: '#1D2129' }}>{eq.name}</span>
                <div style={{ fontSize: 10, color: '#86909C' }}>{eq.desc}</div>
              </div>
            </button>
          );
        })}
      </div>

      <button onClick={() => {
        dispatch({ type: 'UPDATE_HE_PROJECT', payload: { id: id!, updates: { currentStep: 'collect' } } });
        navigate(`/tob/he/projects/${id}/run/collect`);
      }}
        className="w-full py-3 rounded-xl flex items-center justify-center gap-1 text-white"
        style={{ background: '#3370FF', fontSize: 13, fontWeight: 600 }}>
        下一步：数据采集 <ArrowRight size={14} />
      </button>
    </div>
  );
}