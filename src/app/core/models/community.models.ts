export type MemberStatus = 'Active' | 'Pending' | 'Inactive';
export type EventStatus = 'Upcoming' | 'Ongoing' | 'Completed';
export type ProgrammeStatus = 'Open' | 'In progress' | 'Completed';
export type ProjectStatus = 'Planning' | 'In progress' | 'Completed' | 'On hold';

export interface Member {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  address: string;
  registeredAt: string;
  skills: string[];
  interests: string[];
  status: MemberStatus;
  group: string;
}

export type MemberDraft = Omit<Member, 'id' | 'registeredAt'>;

export interface CommunityEvent {
  id: string;
  title: string;
  description: string;
  venue: string;
  startsAt: string;
  endsAt: string;
  capacity: number;
  registeredMemberIds: string[];
  attendedMemberIds: string[];
}

export type EventDraft = Pick<CommunityEvent, 'title' | 'description' | 'venue' | 'startsAt' | 'endsAt' | 'capacity'>;

export interface Volunteer {
  id: string;
  memberId: string;
  skills: string[];
  availability: string;
  hoursContributed: number;
  active: boolean;
}

export interface EmpowermentProgramme {
  id: string;
  title: string;
  category: string;
  startsAt: string;
  endsAt: string;
  capacity: number;
  participantMemberIds: string[];
  status: ProgrammeStatus;
}

export interface CommunityProject {
  id: string;
  title: string;
  objective: string;
  coordinatorMemberId: string;
  deadline: string;
  progress: number;
  status: ProjectStatus;
  milestones: string[];
}

export interface CommunityActivity {
  id: string;
  description: string;
  createdAt: string;
  kind: 'member' | 'event' | 'volunteer' | 'programme' | 'project';
  actor: string;
}

export interface CommunityData {
  members: Member[];
  events: CommunityEvent[];
  volunteers: Volunteer[];
  programmes: EmpowermentProgramme[];
  projects: CommunityProject[];
  activities: CommunityActivity[];
}

export interface DashboardMetrics {
  totalMembers: number;
  activeVolunteers: number;
  upcomingEvents: number;
  ongoingProgrammes: number;
  memberGrowthPercent: number;
  attendanceRate: number;
}
