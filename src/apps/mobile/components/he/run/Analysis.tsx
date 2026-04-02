import { useParams, useNavigate } from 'react-router';
import { BarChart2, Download } from 'lucide-react';
import { useAppStore } from '../../../store';

export function AnalysisPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { state, dispatch } = useAppStore();
  const project = state.heProjects.find(p => p.id === id)!;
  if (!project) return null;

  const done = project.participants.filter(p => p.recordingStatus === 'done').length;

  return (
    <div className="px-4 py-4 space-y-4">
      <span style={{ fontSize: 14, fontWeight: 700, color: '#1D2129' }}>分析报告</span>

      <div className="bg-white rounded-xl p-4 border" style={{ borderColor: '#E5E6EB' }}>
        <div className="flex items-center gap-2 mb-3">
          <BarChart2 size={14} style={{ color: '#3370FF' }} />
          <span style={{ fontSize: 12, fontWeight: 600, color: '#1D2129' }}>数据概览</span>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {[
            { label: '有效数据', value: `${done} 份` },
            { label: '研究类型', value: `${project.researchTypes.length} 类` },
            { label: '数据完整率', value: done > 0 ? '94%' : '—' },
            { label: '量表信度α', value: done > 0 ? '0.87' : '—' },
          ].map(s => (
            <div key={s.label} className="p-2.5 rounded-lg" style={{ background: '#F7F8FA' }}>
              <div style={{ fontSize: 10, color: '#86909C' }}>{s.label}</div>
              <div style={{ fontSize: 14, fontWeight: 700, color: '#1D2129', marginTop: 2 }}>{s.value}</div>
            </div>
          ))}
        </div>
      </div>

      {done > 0 ? (
        <div className="space-y-3">
          <div className="bg-white rounded-xl p-4 border" style={{ borderColor: '#E5E6EB' }}>
            <span style={{ fontSize: 12, fontWeight: 600, color: '#1D2129', display: 'block', marginBottom: 8 }}>关键发现</span>
            {[
              '机身宽度偏大（74.2mm），P25以下手型用户单手操控显著不适 (p<0.01)',
              '握持舒适度均值 M=6.5/9，高于行业基准（M=5.8）',
              '拇指可达性评分较低（M=4.8/9），建议优化屏幕顶部 UI 布局',
            ].map((f, i) => (
              <div key={i} className="flex items-start gap-2 mb-2">
                <div className="w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0" style={{ background: '#3370FF' }} />
                <span style={{ fontSize: 11, color: '#4E5969', lineHeight: 1.5 }}>{f}</span>
              </div>
            ))}
          </div>

          <button className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-white"
            style={{ background: '#3370FF', fontSize: 13, fontWeight: 600 }}>
            <Download size={14} /> 导出报告
          </button>

          <button onClick={() => {
            dispatch({ type: 'UPDATE_HE_PROJECT', payload: { id: id!, updates: { status: 'completed' as any, progress: 100 } } });
            navigate(`/tob/he/projects/${id}`);
          }}
            className="w-full py-3 rounded-xl flex items-center justify-center"
            style={{ border: '1px solid #E5E6EB', color: '#4E5969', fontSize: 13 }}>
            完成项目
          </button>
        </div>
      ) : (
        <div className="text-center py-10">
          <BarChart2 size={32} className="mx-auto mb-2" style={{ color: '#C9CDD4' }} />
          <p style={{ fontSize: 12, color: '#86909C' }}>需先完成数据采集</p>
        </div>
      )}
    </div>
  );
}
