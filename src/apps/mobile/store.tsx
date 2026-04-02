import React, { createContext, useContext, useReducer, ReactNode } from 'react';

// ─── Core types ─────────────────────────────────────────────────────────────
export type Role = 'he' | 'id';
export type ResearchType = 'comfort' | 'thermal' | 'acoustic' | 'vibration' | 'touch' | 'weight' | 'form';
export type FormFactor = 'bar' | 'flip' | 'fold';
export type ExperimentStatus = 'draft' | 'recruiting' | 'running' | 'analyzing' | 'completed' | 'archived';
export type RunStep = 'participants' | 'lab' | 'setup' | 'questionnaire' | 'collect' | 'analysis';
export type InvitationStatus = 'sent' | 'confirmed' | 'declined' | 'noReply';

// ─── Label maps ──────────────────────────────────────────────────────────────
export const RESEARCH_TYPE_LABELS: Record<ResearchType, string> = {
  comfort: '握持舒适度', thermal: '热控制体验', acoustic: '声学体验',
  vibration: '振动体验', touch: '触控手感', weight: '重量感知', form: '形态适配性',
};
export const RESEARCH_TYPE_ICONS: Record<ResearchType, string> = {
  comfort: '', thermal: '', acoustic: '',
  vibration: '', touch: '', weight: '', form: '',
};
export const RESEARCH_TYPE_DESC: Record<ResearchType, string> = {
  comfort: '静态与动态握持的主观舒适感受',
  thermal: '长时间使用下机身温度的主观感受',
  acoustic: '扬声器音量、音质与通话清晰度感受',
  vibration: '马达震动的力度、纹理、反馈识别感',
  touch: '屏幕玻璃触感、边框握感、按键阻尼',
  weight: '主观重量感受与持握疲劳评估',
  form: '整机尺寸与用户手型的匹配程度',
};
export const STATUS_LABELS: Record<ExperimentStatus, string> = {
  draft: '规划中', recruiting: '招募被试', running: '实验进行中',
  analyzing: '数据分析中', completed: '已完成', archived: '已归档',
};
export const STATUS_COLORS: Record<ExperimentStatus, string> = {
  draft: 'bg-slate-100 text-slate-600',
  recruiting: 'bg-blue-100 text-blue-700',
  running: 'bg-indigo-100 text-indigo-700',
  analyzing: 'bg-violet-100 text-violet-700',
  completed: 'bg-green-100 text-green-700',
  archived: 'bg-gray-100 text-gray-500',
};
export const FORM_FACTOR_LABELS: Record<FormFactor, string> = {
  bar: '直板', flip: '竖折', fold: '横折',
};
export const RUN_STEPS: { key: RunStep; label: string }[] = [
  { key: 'questionnaire', label: '量表设计' },
  { key: 'participants', label: '被试方案' },
  { key: 'lab', label: '场地安排' },
  { key: 'setup', label: '设备准备' },
  { key: 'collect', label: '数据采集' },
  { key: 'analysis', label: '分析报告' },
];

// ─── Interfaces ──────────────────────────────────────────────────────────────
export interface ProjectParticipant {
  code: string;
  handLength: number;
  handWidth: number;
  thumbSpan: number;
  gripHabit: 'onehand' | 'twohand';
  ageGroup: '18-25' | '26-35' | '36-45';
  invitationStatus: InvitationStatus;
  questProgress: number;
  questTotal: number;
  recordingStatus: 'pending' | 'recording' | 'done';
  notes: string;
}
export interface Lab {
  id: string; name: string; location: string;
  capacity: number; equipment: string[]; available: boolean;
}
export interface HEProject {
  id: string; name: string; status: ExperimentStatus;
  researchTypes: ResearchType[]; formFactor: FormFactor;
  paradigm: string; startDate: string; period: string;
  description: string; createdAt: string; updatedAt: string;
  currentStep: RunStep; participants: ProjectParticipant[];
  participantTarget: number; deadline: string;
  memberCount: number; progress: number;
}
export interface WizardState {
  name: string; researchTypes: ResearchType[]; formFactor: FormFactor;
  startDate: string; period: string; description: string; paradigm: string;
}

// ─── ID-designer types (preserved from v1) ───────────────────────────────────
export type Positioning = 'entry' | 'mid' | 'flagship' | 'ultra';
export type GripStyle = 'onehand' | 'twohand' | 'mixed';
export interface Parameter {
  recommended: number; min: number; max: number;
  tolerance: number; unit: string; coverage: number; constraint?: number;
}
export interface Parameters {
  width: Parameter; height: Parameter; thickness: Parameter;
  weight: Parameter; cornerRadius: Parameter;
}
export const POSITIONING_LABELS: Record<Positioning, string> = {
  entry: '入门', mid: '中端', flagship: '旗舰', ultra: '超旗舰',
};
export const GRIP_STYLE_LABELS: Record<GripStyle, string> = {
  onehand: '单手握持', twohand: '双手握持', mixed: '混合握持',
};
export const POSITIONING_COLORS: Record<Positioning, string> = {
  entry: 'bg-green-50 text-green-700', mid: 'bg-green-100 text-green-700',
  flagship: 'bg-green-200 text-green-800', ultra: 'bg-green-300 text-green-900',
};
export function calcParameters(p: Positioning, f: FormFactor, g: GripStyle): Parameters {
  const base: Record<Positioning, Record<string, number>> = {
    entry:    { width: 75.5, height: 163.5, thickness: 8.5, weight: 205, cornerRadius: 10 },
    mid:      { width: 73.0, height: 158.0, thickness: 7.8, weight: 190, cornerRadius: 12 },
    flagship: { width: 71.0, height: 153.0, thickness: 7.2, weight: 185, cornerRadius: 14 },
    ultra:    { width: 69.5, height: 149.2, thickness: 6.5, weight: 175, cornerRadius: 16 },
  };
  let b = { ...base[p] };
  if (f === 'fold') { b.width = Math.round(b.width*1.85*10)/10; b.thickness = Math.round(b.thickness*1.4*10)/10; b.weight = Math.round(b.weight*1.38); }
  else if (f === 'flip') { b.height = Math.round(b.height*0.555*10)/10; b.thickness = Math.round(b.thickness*2.05*10)/10; b.weight = Math.round(b.weight*1.02); }
  if (g === 'onehand') b.width = Math.round((b.width-1.5)*10)/10;
  else if (g === 'twohand') b.width = Math.round((b.width+1.5)*10)/10;
  const tol: Record<Positioning, number> = { entry:2.5, mid:2.0, flagship:1.5, ultra:1.2 };
  const t = tol[p];
  const cov: Record<Positioning, number[]> = {
    entry:[79.3,82.1,87.6,81.4,84.5], mid:[83.2,86.4,89.1,84.7,88.0],
    flagship:[87.5,89.2,91.3,87.8,90.5], ultra:[88.5,91.2,94.1,89.7,92.3],
  };
  const [wC,hC,tC,wtC,rC] = cov[p];
  return {
    width:        { recommended: b.width, min: Math.round((b.width-t)*10)/10, max: Math.round((b.width+t)*10)/10, tolerance: t, unit:'mm', coverage: wC },
    height:       { recommended: b.height, min: Math.round((b.height-t*1.8)*10)/10, max: Math.round((b.height+t*1.8)*10)/10, tolerance: t*1.8, unit:'mm', coverage: hC },
    thickness:    { recommended: b.thickness, min: Math.round((b.thickness-t*0.2)*10)/10, max: Math.round((b.thickness+t*0.2)*10)/10, tolerance: t*0.2, unit:'mm', coverage: tC },
    weight:       { recommended: b.weight, min: Math.round(b.weight-t*5), max: Math.round(b.weight+t*5), tolerance: t*5, unit:'g', coverage: wtC },
    cornerRadius: { recommended: b.cornerRadius, min: Math.round((b.cornerRadius-t)*10)/10, max: Math.round((b.cornerRadius+t)*10)/10, tolerance: t, unit:'mm', coverage: rC },
  };
}

// ─── Mock data ───────────────────────────────────────────────────────────────
function mkP(code: string, hl: number, hw: number, ts: number, grip: 'onehand'|'twohand', age: '18-25'|'26-35'|'36-45', inv: InvitationStatus, qp: number, qt: number, rec: 'pending'|'recording'|'done'): ProjectParticipant {
  return { code, handLength: hl, handWidth: hw, thumbSpan: ts, gripHabit: grip, ageGroup: age, invitationStatus: inv, questProgress: qp, questTotal: qt, recordingStatus: rec, notes: '' };
}

const mockHEProjects: HEProject[] = [
  {
    id: 'he-001', name: '旗舰机握持舒适度研究 A2026', status: 'recruiting',
    researchTypes: ['comfort', 'form'], formFactor: 'bar',
    paradigm: '主观量表评定 + 比较判断法', startDate: '2026-03-25', period: '2周',
    description: '针对新旗舰机型握持手感的系统性用户研究，目标覆盖M/L手型主力用户群',
    createdAt: '2026-03-10', updatedAt: '2026-03-18', currentStep: 'participants',
    participantTarget: 20, deadline: '2026-04-15', memberCount: 4, progress: 18,
    participants: [
      mkP('P001',178,80,95,'onehand','26-35','confirmed',0,18,'pending'),
      mkP('P002',165,74,88,'onehand','18-25','confirmed',0,18,'pending'),
      mkP('P003',182,84,100,'twohand','26-35','confirmed',0,18,'pending'),
      mkP('P004',171,78,92,'onehand','36-45','confirmed',0,18,'pending'),
      mkP('P005',176,81,96,'onehand','26-35','confirmed',0,18,'pending'),
      mkP('P006',168,76,90,'twohand','18-25','sent',0,18,'pending'),
      mkP('P007',183,85,102,'twohand','36-45','sent',0,18,'pending'),
      mkP('P008',170,77,91,'onehand','26-35','sent',0,18,'pending'),
      mkP('P009',174,79,94,'onehand','18-25','noReply',0,18,'pending'),
      mkP('P010',180,82,98,'twohand','26-35','noReply',0,18,'pending'),
      mkP('P011',167,75,89,'onehand','36-45','declined',0,18,'pending'),
    ],
  },
  {
    id: 'he-002', name: 'Fold Z4 热控制体验研究', status: 'running',
    researchTypes: ['thermal'], formFactor: 'fold',
    paradigm: '温度主观感受量表 + 热舒适区间评定', startDate: '2026-03-01', period: '1月',
    description: '评估折叠屏手机长时间使用下的热感知体验，建立热舒适标准',
    createdAt: '2026-02-18', updatedAt: '2026-03-17', currentStep: 'collect',
    participantTarget: 20, deadline: '2026-04-01', memberCount: 5, progress: 65,
    participants: [
      mkP('P001',178,80,95,'onehand','26-35','confirmed',10,10,'done'),
      mkP('P002',165,74,88,'onehand','18-25','confirmed',10,10,'done'),
      mkP('P003',182,84,100,'twohand','26-35','confirmed',10,10,'done'),
      mkP('P004',171,78,92,'onehand','36-45','confirmed',10,10,'done'),
      mkP('P005',176,81,96,'onehand','26-35','confirmed',10,10,'done'),
      mkP('P006',168,76,90,'twohand','18-25','confirmed',10,10,'done'),
      mkP('P007',183,85,102,'twohand','36-45','confirmed',10,10,'done'),
      mkP('P008',170,77,91,'onehand','26-35','confirmed',10,10,'done'),
      mkP('P009',174,79,94,'onehand','18-25','confirmed',10,10,'done'),
      mkP('P010',180,82,98,'twohand','26-35','confirmed',10,10,'done'),
      mkP('P011',167,75,89,'onehand','36-45','confirmed',10,10,'done'),
      mkP('P012',175,80,94,'onehand','26-35','confirmed',10,10,'done'),
      mkP('P013',179,82,97,'twohand','18-25','confirmed',7,10,'recording'),
      mkP('P014',166,74,88,'onehand','26-35','confirmed',5,10,'recording'),
      mkP('P015',181,83,99,'twohand','36-45','confirmed',3,10,'recording'),
      mkP('P016',172,78,93,'onehand','18-25','confirmed',0,10,'pending'),
      mkP('P017',177,80,95,'twohand','26-35','confirmed',0,10,'pending'),
      mkP('P018',184,86,103,'onehand','36-45','confirmed',0,10,'pending'),
      mkP('P019',169,76,90,'onehand','26-35','confirmed',0,10,'pending'),
      mkP('P020',173,79,93,'twohand','18-25','confirmed',0,10,'pending'),
    ],
  },
  {
    id: 'he-003', name: 'X Ultra 振动感知量化实验', status: 'analyzing',
    researchTypes: ['vibration'], formFactor: 'bar',
    paradigm: '振动强度感知量表 + 触觉纹理辨别', startDate: '2026-02-10', period: '3周',
    description: '量化不同马达参数组合对用户振动感知的影响，建立优化模型',
    createdAt: '2026-02-01', updatedAt: '2026-03-15', currentStep: 'analysis',
    participantTarget: 20, deadline: '2026-03-31', memberCount: 3, progress: 88,
    participants: Array.from({ length: 20 }, (_, i) =>
      mkP(`P${String(i+1).padStart(3,'0')}`, 168+i, 76+Math.floor(i/4), 90+i, i%2===0?'onehand':'twohand', i<7?'18-25':i<14?'26-35':'36-45', 'confirmed', 8, 8, 'done')
    ),
  },
  {
    id: 'he-004', name: 'Fold Z5 声学体验评测规划', status: 'draft',
    researchTypes: ['acoustic'], formFactor: 'fold',
    paradigm: '', startDate: '', period: '2周',
    description: '下一代折叠屏扬声器与通话体验的前期研究规划',
    createdAt: '2026-03-15', updatedAt: '2026-03-15', currentStep: 'participants',
    participantTarget: 25, deadline: '2026-05-01', memberCount: 2, progress: 5,
    participants: [],
  },
  {
    id: 'he-005', name: 'Nova Flip 触控手感与重量研究', status: 'running',
    researchTypes: ['touch', 'weight'], formFactor: 'flip',
    paradigm: '主观量表评定 + 持续握持疲劳测试', startDate: '2026-03-05', period: '2周',
    description: '竖折手机展开/折叠态下触控手感与重量感知专项研究',
    createdAt: '2026-02-28', updatedAt: '2026-03-16', currentStep: 'setup',
    participantTarget: 15, deadline: '2026-04-10', memberCount: 4, progress: 40,
    participants: Array.from({ length: 15 }, (_, i) =>
      mkP(`P${String(i+1).padStart(3,'0')}`, 165+i, 74+Math.floor(i/3), 88+i, i%3===0?'twohand':'onehand', i<5?'18-25':i<10?'26-35':'36-45', 'confirmed', 0, 12, 'pending')
    ),
  },
  {
    id: 'he-006', name: 'Lite S6 形态适配研究', status: 'completed',
    researchTypes: ['form', 'weight'], formFactor: 'bar',
    paradigm: '主观量表评定 + 身体地图标注', startDate: '2026-01-05', period: '3周',
    description: '入门级直板机型对大众手型的适配性评估，已完成归档',
    createdAt: '2025-12-20', updatedAt: '2026-02-10', currentStep: 'analysis',
    participantTarget: 22, deadline: '2026-02-15', memberCount: 5, progress: 100,
    participants: Array.from({ length: 22 }, (_, i) =>
      mkP(`P${String(i+1).padStart(3,'0')}`, 164+i, 73+Math.floor(i/4), 87+i, i%2===0?'onehand':'twohand', i<8?'18-25':i<16?'26-35':'36-45', 'confirmed', 18, 18, 'done')
    ),
  },
];

export const mockLabs: Lab[] = [
  { id: 'lab-1', name: '人因实验室 A', location: 'B栋3楼 301室', capacity: 8, equipment: ['摄像头×4', '录音设备', '压力板×2', '眼动仪'], available: true },
  { id: 'lab-2', name: '声学暗室', location: 'B栋2楼 205室', capacity: 4, equipment: ['专业麦克风×4', '隔音设备', '音频分析仪'], available: true },
  { id: 'lab-3', name: '开放实验区', location: 'C栋1楼 大厅', capacity: 12, equipment: ['摄像头×2', '录音设备'], available: false },
];

// ─── App state & reducer ─────────────────────────────────────────────────────
// v2.1 - useAppStore returns fallback when outside AppProvider
const defaultWizard: WizardState = {
  name: '', researchTypes: [], formFactor: 'bar',
  startDate: '', period: '2周', description: '', paradigm: '',
};

interface AppState {
  role: Role | null;
  heProjects: HEProject[];
  wizard: WizardState;
}

type Action =
  | { type: 'SET_ROLE'; payload: Role | null }
  | { type: 'SET_WIZARD'; payload: Partial<WizardState> }
  | { type: 'ADD_HE_PROJECT'; payload: HEProject }
  | { type: 'UPDATE_HE_PROJECT'; payload: { id: string; updates: Partial<HEProject> } }
  | { type: 'RESET_WIZARD' };

function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'SET_ROLE': return { ...state, role: action.payload };
    case 'SET_WIZARD': return { ...state, wizard: { ...state.wizard, ...action.payload } };
    case 'ADD_HE_PROJECT': return { ...state, heProjects: [action.payload, ...state.heProjects] };
    case 'UPDATE_HE_PROJECT':
      return { ...state, heProjects: state.heProjects.map(p => p.id === action.payload.id ? { ...p, ...action.payload.updates } : p) };
    case 'RESET_WIZARD': return { ...state, wizard: defaultWizard };
    default: return state;
  }
}

interface AppContextType { state: AppState; dispatch: React.Dispatch<Action>; }
const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, {
    role: null,
    heProjects: mockHEProjects,
    wizard: defaultWizard,
  });
  return <AppContext.Provider value={{ state, dispatch }}>{children}</AppContext.Provider>;
}

const fallbackState: AppState = { role: null, heProjects: mockHEProjects, wizard: defaultWizard };
const fallbackCtx: AppContextType = { state: fallbackState, dispatch: () => {} };

export function useAppStore(): AppContextType {
  const ctx = useContext(AppContext);
  if (!ctx) return fallbackCtx;
  return ctx;
}