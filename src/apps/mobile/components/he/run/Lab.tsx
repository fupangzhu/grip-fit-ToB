import { useState } from 'react';
import { useParams, useNavigate } from 'react-router';
import { ArrowRight, MapPin, Check } from 'lucide-react';
import { useAppStore, mockLabs } from '../../../store';

export function LabPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { dispatch } = useAppStore();
  const [selectedLab, setSelectedLab] = useState<string | null>(null);

  return (
    <div className="px-4 py-4 space-y-3">
      <span style={{ fontSize: 14, fontWeight: 700, color: '#1D2129' }}>场地安排</span>

      <div className="space-y-2">
        {mockLabs.map(lab => (
          <button key={lab.id} onClick={() => setSelectedLab(lab.id)}
            className="w-full flex items-center gap-3 p-3 rounded-xl text-left transition-all"
            style={selectedLab === lab.id
              ? { background: '#EEF3FF', border: '2px solid #3370FF' }
              : { background: 'white', border: '1px solid #E5E6EB' }
            }>
            <div className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ background: selectedLab === lab.id ? '#3370FF' : '#F2F3F5' }}>
              <MapPin size={14} style={{ color: selectedLab === lab.id ? 'white' : '#86909C' }} />
            </div>
            <div className="flex-1">
              <span style={{ fontSize: 13, fontWeight: 600, color: '#1D2129' }}>{lab.name}</span>
              <div style={{ fontSize: 10, color: '#86909C', marginTop: 1 }}>
                容纳{lab.capacity}人 · {lab.equipment.slice(0, 3).join(' / ')}
              </div>
            </div>
            {selectedLab === lab.id && <Check size={16} style={{ color: '#3370FF' }} />}
          </button>
        ))}
      </div>

      <button onClick={() => {
        dispatch({ type: 'UPDATE_HE_PROJECT', payload: { id: id!, currentStep: 'setup' } });
        navigate(`/tob/he/projects/${id}/run/setup`);
      }}
        className="w-full py-3 rounded-xl flex items-center justify-center gap-1 text-white"
        style={{ background: '#3370FF', fontSize: 13, fontWeight: 600 }}>
        下一步：设备准备 <ArrowRight size={14} />
      </button>
    </div>
  );
}
