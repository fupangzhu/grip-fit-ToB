import { createBrowserRouter, Navigate } from 'react-router';
import { RoleSelect } from './components/RoleSelect';
import { HELayout } from './components/he/HELayout';
import { HEDashboard } from './components/he/Dashboard';
import { HEProjectList } from './components/he/ProjectList';
import { HENewProject } from './components/he/NewProject';
import { HEParadigm } from './components/he/Paradigm';
import { HEProjectDetail } from './components/he/ProjectDetail';
import { RunLayout } from './components/he/run/RunLayout';
import { Participants } from './components/he/run/Participants';
import { LabPage } from './components/he/run/Lab';
import { SetupPage } from './components/he/run/Setup';
import { QuestionnairePage } from './components/he/run/Questionnaire';
import { CollectPage } from './components/he/run/Collect';
import { ParticipantSessionPage } from './components/he/run/ParticipantSession';
import { AnalysisPage } from './components/he/run/Analysis';
import { IDLayout } from './components/id/IDLayout';
import { IDDashboard } from './components/id/Dashboard';
import { IDParams } from './components/id/Params';
import { IDValidate } from './components/id/Validate';

export const router = createBrowserRouter([
  {
    path: '/tob',
    children: [
      { index: true, element: <Navigate to="/tob/role-select" replace /> },
      { path: 'role-select', Component: RoleSelect },
      {
        path: 'he',
        Component: HELayout,
        children: [
          { index: true, element: <Navigate to="/tob/he/dashboard" replace /> },
          { path: 'dashboard', Component: HEDashboard },
          { path: 'projects', Component: HEProjectList },
          { path: 'projects/new', Component: HENewProject },
          { path: 'projects/new/paradigm', Component: HEParadigm },
          { path: 'projects/:id', Component: HEProjectDetail },
          {
            path: 'projects/:id/run',
            Component: RunLayout,
            children: [
              { index: true, element: <Navigate to="questionnaire" replace /> },
              { path: 'questionnaire', Component: QuestionnairePage },
              { path: 'participants', Component: Participants },
              { path: 'lab', Component: LabPage },
              { path: 'setup', Component: SetupPage },
              { path: 'collect', Component: CollectPage },
              { path: 'collect/:participantCode', Component: ParticipantSessionPage },
              { path: 'analysis', Component: AnalysisPage },
            ],
          },
        ],
      },
      {
        path: 'id',
        Component: IDLayout,
        children: [
          { index: true, element: <Navigate to="/tob/id/dashboard" replace /> },
          { path: 'dashboard', Component: IDDashboard },
          { path: 'params', Component: IDParams },
          { path: 'validate', Component: IDValidate },
        ],
      },
    ],
  },
  { path: '*', element: <Navigate to="/tob/role-select" replace /> },
]);