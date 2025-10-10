type ClockifyMembershipStatus = 'PENDING' | 'ACTIVE' | 'DECLINED' | 'INACTIVE';
type ClockifyMembershipType = 'WORKSPACE' | 'PROJECT' | 'USERGROUP' | 'ALL';
type ClockifyUserSettingsSummaryReportSettingsGroup =
  | 'Project'
  | 'Client'
  | 'User'
  | 'Tag'
  | 'Time Entry'
  | 'Task';
type ClockifyUserSettingsSummaryReportSettingsSubgroup =
  | 'Project'
  | 'Client'
  | 'User'
  | 'Tag'
  | 'Time Entry';
type ClockifyUserStatus = 'PENDING' | 'ACTIVE' | 'DECLINED' | 'INACTIVE';

interface ClockifyMembership {
  userId: string;
  targetId?: string;
  membershipStatus?: ClockifyMembershipStatus;
  membershipType?: ClockifyMembershipType;
  hourlyRate?: { amount: number; currency?: string };
  costRate?: { amount: number; currency?: string };
}

export interface ClockifyUser {
  id: string;
  name: string;
  email: string;
  profilePicture: string;
  activeWorkspace: string;
  defaultWorkspace: string;
  status: ClockifyUserStatus;
  memberships: ClockifyMembership[];
  settings: {
    collapseAllProjectLists: boolean;
    dashboardPinToTop: boolean;
    dashboardSelection: string;
    dashboardViewType: string;
    dateFormat: string;
    isCompactViewOn: boolean;
    longRunning: boolean;
    projectListCollapse: null;
    sendNewsletter: boolean;
    summaryReportSettings: {
      group: ClockifyUserSettingsSummaryReportSettingsGroup;
      subgroup: ClockifyUserSettingsSummaryReportSettingsSubgroup;
    };
    timeFormat: string;
    timeTrackingManual: boolean;
    timeZone: string;
    weekStart: string;
    weeklyUpdates: boolean;
  };
}

type ClockifyTimeEstimateType = 'MANUAL' | 'AUTO';
type ClockifyBudgetEstimateType = 'MANUAL' | 'AUTO';
type ClockifyTimeEstimateResetOption = 'MONTHLY';
type ClockifyBudgetEstimateResetOption = 'MONTHLY';

export interface ClockifyProjectType {
  id: string;
  name: string;
  hourlyRate: null | number;
  clientId: string;
  workspaceId: string;
  billable: boolean;
  memberships: {
    userId: string;
    hourlyRate: {
      amount: number;
      currency: string;
    };
    targetId: string;
    membershipStatus: ClockifyMembershipStatus;
    membershipType: ClockifyMembershipType;
  }[];
  color: string;
  archived: boolean;
  duration: string;
  clientName: string;
  note: string;
  template: boolean;
  public: boolean;
  costRate: null | number;
  timeEstimate: {
    estimate: string;
    type: ClockifyTimeEstimateType;
    resetOption: null | ClockifyTimeEstimateResetOption;
    active: boolean;
  } | null;
  budgetEstimate: {
    estimate: number;
    type: ClockifyBudgetEstimateType;
    resetOption: null | ClockifyBudgetEstimateResetOption;
    active: boolean;
  } | null;
}

export interface ClockifyTimeEntry {
  billable: boolean;
  description: string;
  id: string;
  isLocked: boolean;
  projectId: string;
  tagIds: string[];
  taskId: string;
  timeInterval: {
    duration: string;
    end: Date;
    start: Date;
  };
  userId: string;
  workspaceId: string;
  customFields: {
    customFieldId: string;
    timeEntryId: string;
    value: string;
    name: string;
  }[];
}

export interface ClockifyProject {
  id: string;
  name: string;
  hourlyRate: null | number;
  clientId: string;
  workspaceId: string;
  billable: boolean;
  memberships: {
    userId: string;
    hourlyRate: {
      amount: number;
      currency: string;
    };
    targetId: string;
    membershipStatus: ClockifyMembershipStatus;
    membershipType: ClockifyMembershipType;
  }[];
  color: string;
  archived: boolean;
  duration: string;
  clientName: string;
  note: string;
  template: boolean;
  public: boolean;
  costRate: null | number;
  timeEstimate: {
    estimate: string;
    type: ClockifyTimeEstimateType;
    resetOption: null | ClockifyTimeEstimateResetOption;
    active: boolean;
  } | null;
  budgetEstimate: {
    estimate: number;
    type: ClockifyBudgetEstimateType;
    resetOption: null | ClockifyBudgetEstimateResetOption;
    active: boolean;
  } | null;
}
