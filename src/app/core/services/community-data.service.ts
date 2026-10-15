import { computed, effect, Injectable, signal } from '@angular/core';
import {
  CommunityData,
  CommunityEvent,
  CommunityProject,
  DashboardMetrics,
  EventDraft,
  MemberDraft,
  Member,
  Volunteer,
} from '../models/community.models';

const STORAGE_KEY = 'communityhub.demo-data.v1';
const DAY_MS = 24 * 60 * 60 * 1000;

function daysFromToday(days: number): string {
  return new Date(Date.now() + days * DAY_MS).toISOString();
}

function daysAgo(days: number): string {
  return daysFromToday(-days);
}

function createDemoData(): CommunityData {
  const members: Member[] = [
    { id: 'm-1001', fullName: 'Amara Okafor', email: 'amara.okafor@example.org', phone: '+44 7700 900101', address: '14 Willow Lane, Bristol', registeredAt: daysAgo(12), skills: ['Community organising', 'Public speaking'], interests: ['Youth development'], status: 'Active', group: 'Eastside Neighbours' },
    { id: 'm-1002', fullName: 'Daniel Mensah', email: 'daniel.mensah@example.org', phone: '+44 7700 900102', address: '8 Orchard Street, Bristol', registeredAt: daysAgo(34), skills: ['Carpentry', 'Mentoring'], interests: ['Skills training'], status: 'Active', group: 'Green Futures' },
    { id: 'm-1003', fullName: 'Priya Nair', email: 'priya.nair@example.org', phone: '+44 7700 900103', address: '22 Park View, Bristol', registeredAt: daysAgo(61), skills: ['First aid', 'Event planning'], interests: ['Wellbeing'], status: 'Active', group: 'Eastside Neighbours' },
    { id: 'm-1004', fullName: 'Jacob Williams', email: 'jacob.williams@example.org', phone: '+44 7700 900104', address: '5 Brook Road, Bristol', registeredAt: daysAgo(89), skills: ['Photography', 'Design'], interests: ['Arts and culture'], status: 'Pending', group: 'Creative Circle' },
    { id: 'm-1005', fullName: 'Fatima Hassan', email: 'fatima.hassan@example.org', phone: '+44 7700 900105', address: '31 Meadow Walk, Bristol', registeredAt: daysAgo(116), skills: ['Cooking', 'Languages'], interests: ['Food security'], status: 'Active', group: 'Green Futures' },
    { id: 'm-1006', fullName: 'Oliver Chen', email: 'oliver.chen@example.org', phone: '+44 7700 900106', address: '17 Station Road, Bristol', registeredAt: daysAgo(147), skills: ['Web development', 'Digital skills'], interests: ['Digital inclusion'], status: 'Active', group: 'Digital Bridges' },
    { id: 'm-1007', fullName: 'Sofia Petrova', email: 'sofia.petrova@example.org', phone: '+44 7700 900107', address: '42 Riverside Close, Bristol', registeredAt: daysAgo(176), skills: ['Gardening', 'Project coordination'], interests: ['Environment'], status: 'Inactive', group: 'Green Futures' },
    { id: 'm-1008', fullName: 'Ethan Clarke', email: 'ethan.clarke@example.org', phone: '+44 7700 900108', address: '9 Linden Avenue, Bristol', registeredAt: daysAgo(205), skills: ['Coaching', 'First aid'], interests: ['Sport and wellbeing'], status: 'Active', group: 'Eastside Neighbours' },
    { id: 'm-1009', fullName: 'Zainab Bello', email: 'zainab.bello@example.org', phone: '+44 7700 900109', address: '26 Cedar Court, Bristol', registeredAt: daysAgo(239), skills: ['Accounting', 'Administration'], interests: ['Enterprise'], status: 'Active', group: 'Creative Circle' },
    { id: 'm-1010', fullName: 'Noah Thompson', email: 'noah.thompson@example.org', phone: '+44 7700 900110', address: '3 Ash Grove, Bristol', registeredAt: daysAgo(273), skills: ['Electrical work', 'Mentoring'], interests: ['Skills training'], status: 'Active', group: 'Digital Bridges' },
    { id: 'm-1011', fullName: 'Leila Rahman', email: 'leila.rahman@example.org', phone: '+44 7700 900111', address: '12 Queen Street, Bristol', registeredAt: daysAgo(309), skills: ['Translation', 'Advocacy'], interests: ['New arrivals'], status: 'Pending', group: 'Eastside Neighbours' },
    { id: 'm-1012', fullName: 'Samuel Adeyemi', email: 'samuel.adeyemi@example.org', phone: '+44 7700 900112', address: '19 Hillcrest Road, Bristol', registeredAt: daysAgo(346), skills: ['Music', 'Youth work'], interests: ['Arts and culture'], status: 'Active', group: 'Creative Circle' },
  ];

  const events: CommunityEvent[] = [
    { id: 'e-201', title: 'Community Garden Open Day', description: 'A friendly day to plant, share skills and meet neighbours.', venue: 'Eastside Community Garden', startsAt: daysFromToday(2), endsAt: daysFromToday(2), capacity: 40, registeredMemberIds: ['m-1001', 'm-1003', 'm-1005', 'm-1007', 'm-1009', 'm-1012'], attendedMemberIds: [] },
    { id: 'e-202', title: 'Digital Skills Drop-in', description: 'Practical support with everyday digital skills and devices.', venue: 'Barton Library', startsAt: daysFromToday(5), endsAt: daysFromToday(5), capacity: 24, registeredMemberIds: ['m-1002', 'm-1004', 'm-1006', 'm-1010'], attendedMemberIds: [] },
    { id: 'e-203', title: 'Neighbourhood Wellbeing Walk', description: 'A relaxed, accessible walk followed by tea and conversation.', venue: 'Castle Park, main gate', startsAt: daysFromToday(9), endsAt: daysFromToday(9), capacity: 30, registeredMemberIds: ['m-1001', 'm-1003', 'm-1008'], attendedMemberIds: [] },
    { id: 'e-204', title: 'Spring Community Forum', description: 'Bring ideas for our next year of neighbourhood projects.', venue: 'Easton Community Centre', startsAt: daysAgo(21), endsAt: daysAgo(21), capacity: 60, registeredMemberIds: ['m-1001', 'm-1002', 'm-1003', 'm-1005', 'm-1006', 'm-1008', 'm-1009'], attendedMemberIds: ['m-1001', 'm-1002', 'm-1003', 'm-1005', 'm-1008'] },
  ];

  const volunteers: Volunteer[] = [
    { id: 'v-301', memberId: 'm-1001', skills: ['Community organising', 'Public speaking'], availability: 'Weekends', hoursContributed: 28, active: true },
    { id: 'v-302', memberId: 'm-1003', skills: ['First aid', 'Event planning'], availability: 'Weekday evenings', hoursContributed: 16, active: true },
    { id: 'v-303', memberId: 'm-1005', skills: ['Cooking'], availability: 'Flexible', hoursContributed: 42, active: true },
    { id: 'v-304', memberId: 'm-1008', skills: ['Coaching', 'First aid'], availability: 'Saturday mornings', hoursContributed: 21, active: true },
    { id: 'v-305', memberId: 'm-1009', skills: ['Accounting'], availability: 'Weekday evenings', hoursContributed: 9, active: false },
  ];

  const programmes: CommunityData['programmes'] = [
    { id: 'p-401', title: 'Introduction to Digital Skills', category: 'Digital inclusion', startsAt: daysAgo(10), endsAt: daysFromToday(20), capacity: 18, participantMemberIds: ['m-1002', 'm-1004', 'm-1006', 'm-1010'], status: 'In progress' },
    { id: 'p-402', title: 'Community Leadership Lab', category: 'Leadership', startsAt: daysFromToday(14), endsAt: daysFromToday(50), capacity: 16, participantMemberIds: ['m-1001', 'm-1009'], status: 'Open' },
    { id: 'p-403', title: 'Grow Your Own Food', category: 'Environment', startsAt: daysAgo(70), endsAt: daysAgo(7), capacity: 20, participantMemberIds: ['m-1003', 'm-1005', 'm-1007'], status: 'Completed' },
  ];

  const projects: CommunityProject[] = [
    { id: 'pr-501', title: 'Eastside Community Garden', objective: 'Create an inclusive shared growing space for local residents.', coordinatorMemberId: 'm-1007', deadline: daysFromToday(75), progress: 68, status: 'In progress', milestones: ['Site secured', 'Raised beds installed', 'Community planting day'] },
    { id: 'pr-502', title: 'Warm Welcome Network', objective: 'Connect new residents with trusted local support and activities.', coordinatorMemberId: 'm-1011', deadline: daysFromToday(110), progress: 34, status: 'In progress', milestones: ['Partner mapping', 'Volunteer induction'] },
    { id: 'pr-503', title: 'Neighbourhood Repair Cafe', objective: 'Reduce waste through shared repair skills and monthly meetups.', coordinatorMemberId: 'm-1002', deadline: daysFromToday(35), progress: 82, status: 'In progress', milestones: ['Venue agreement', 'Tool library', 'First repair session'] },
  ];

  const activities: CommunityData['activities'] = [
    { id: 'a-601', description: 'joined the community', createdAt: daysAgo(0), kind: 'member', actor: 'Amara Okafor' },
    { id: 'a-602', description: 'registered for Digital Skills Drop-in', createdAt: daysAgo(1), kind: 'event', actor: 'Oliver Chen' },
    { id: 'a-603', description: 'completed a volunteer shift', createdAt: daysAgo(2), kind: 'volunteer', actor: 'Fatima Hassan' },
    { id: 'a-604', description: 'applied to Community Leadership Lab', createdAt: daysAgo(3), kind: 'programme', actor: 'Zainab Bello' },
    { id: 'a-605', description: 'recorded a new project milestone', createdAt: daysAgo(4), kind: 'project', actor: 'Daniel Mensah' },
  ];

  return { members, events, volunteers, programmes, projects, activities };
}

function hasCommunityData(value: unknown): value is CommunityData {
  if (!value || typeof value !== 'object') return false;
  const data = value as Partial<CommunityData>;
  return ['members', 'events', 'volunteers', 'programmes', 'projects', 'activities']
    .every((key) => Array.isArray(data[key as keyof CommunityData]));
}

function loadInitialData(): CommunityData {
  if (typeof localStorage === 'undefined') return createDemoData();

  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return createDemoData();
    const parsed: unknown = JSON.parse(saved);
    if (hasCommunityData(parsed)) return parsed;
    console.warn('CommunityHub demo data was invalid; loading fresh demo records.');
  } catch (error) {
    console.warn('CommunityHub could not load saved demo data; loading fresh demo records.', error);
  }

  return createDemoData();
}

@Injectable({ providedIn: 'root' })
export class CommunityDataService {
  private readonly dataState = signal<CommunityData>(loadInitialData());

  readonly members = computed(() => this.dataState().members);
  readonly events = computed(() => this.dataState().events);
  readonly volunteers = computed(() => this.dataState().volunteers);
  readonly programmes = computed(() => this.dataState().programmes);
  readonly projects = computed(() => this.dataState().projects);
  readonly activities = computed(() => this.dataState().activities);

  readonly metrics = computed<DashboardMetrics>(() => {
    const data = this.dataState();
    const now = Date.now();
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    const currentMonthMembers = data.members.filter((member) => {
      const registered = new Date(member.registeredAt);
      return registered.getMonth() === currentMonth && registered.getFullYear() === currentYear;
    }).length;
    const previousMonthDate = new Date(currentYear, currentMonth - 1, 1);
    const previousMonthMembers = data.members.filter((member) => {
      const registered = new Date(member.registeredAt);
      return registered.getMonth() === previousMonthDate.getMonth()
        && registered.getFullYear() === previousMonthDate.getFullYear();
    }).length;
    const registrationTotal = data.events.reduce((total, event) => total + event.registeredMemberIds.length, 0);
    const attendanceTotal = data.events.reduce((total, event) => total + event.attendedMemberIds.length, 0);

    return {
      totalMembers: data.members.length,
      activeVolunteers: data.volunteers.filter((volunteer) => volunteer.active).length,
      upcomingEvents: data.events.filter((event) => new Date(event.startsAt).getTime() >= now).length,
      ongoingProgrammes: data.programmes.filter((programme) => programme.status === 'In progress').length,
      memberGrowthPercent: previousMonthMembers === 0
        ? (currentMonthMembers > 0 ? 100 : 0)
        : Math.round(((currentMonthMembers - previousMonthMembers) / previousMonthMembers) * 100),
      attendanceRate: registrationTotal === 0 ? 0 : Math.round((attendanceTotal / registrationTotal) * 100),
    };
  });

  readonly memberGrowth = computed(() => {
    const now = new Date();
    return Array.from({ length: 7 }, (_, index) => {
      const monthDate = new Date(now.getFullYear(), now.getMonth() - 5 + index, 1);
      const count = this.members().filter((member) => {
        const registered = new Date(member.registeredAt);
        return registered.getFullYear() === monthDate.getFullYear()
          && registered.getMonth() === monthDate.getMonth();
      }).length;
      return {
        label: new Intl.DateTimeFormat('en', { month: 'short' }).format(monthDate),
        count,
      };
    });
  });

  readonly attendanceSummary = computed(() => this.events()
    .filter((event) => event.attendedMemberIds.length > 0)
    .map((event) => ({
      label: event.title,
      registered: event.registeredMemberIds.length,
      attended: event.attendedMemberIds.length,
    })));

  constructor() {
    effect(() => this.persist(this.dataState()));
  }

  getMember(id: string): Member | undefined {
    return this.members().find((member) => member.id === id);
  }

  getVolunteerName(volunteer: Volunteer): string {
    return this.getMember(volunteer.memberId)?.fullName ?? 'Community member';
  }

  getCoordinatorName(project: CommunityProject): string {
    return this.getMember(project.coordinatorMemberId)?.fullName ?? 'Unassigned';
  }

  addMember(details: MemberDraft): Member {
    this.assertEmailAvailable(details.email);
    const nextId = Math.max(
      1000,
      ...this.members().map((member) => Number(member.id.replace('m-', '')) || 0),
    ) + 1;
    const member: Member = {
      ...this.cleanMemberDraft(details),
      id: `m-${nextId}`,
      registeredAt: new Date().toISOString(),
    };

    this.dataState.update((data) => ({
      ...data,
      members: [member, ...data.members],
      activities: [{
        id: `a-${Date.now()}`,
        description: 'joined the community',
        createdAt: member.registeredAt,
        kind: 'member',
        actor: member.fullName,
      }, ...data.activities],
    }));

    return member;
  }

  updateMember(id: string, details: MemberDraft): Member {
    const current = this.getMember(id);
    if (!current) throw new Error('The member could not be found.');
    this.assertEmailAvailable(details.email, id);

    const updated: Member = { ...current, ...this.cleanMemberDraft(details) };
    this.dataState.update((data) => ({
      ...data,
      members: data.members.map((member) => member.id === id ? updated : member),
    }));
    return updated;
  }

  deleteMember(id: string): void {
    const member = this.getMember(id);
    if (!member) throw new Error('The member could not be found.');

    this.dataState.update((data) => ({
      ...data,
      members: data.members.filter((item) => item.id !== id),
      volunteers: data.volunteers.filter((item) => item.memberId !== id),
      events: data.events.map((event) => ({
        ...event,
        registeredMemberIds: event.registeredMemberIds.filter((memberId) => memberId !== id),
        attendedMemberIds: event.attendedMemberIds.filter((memberId) => memberId !== id),
      })),
      programmes: data.programmes.map((programme) => ({
        ...programme,
        participantMemberIds: programme.participantMemberIds.filter((memberId) => memberId !== id),
      })),
      projects: data.projects.map((project) => ({
        ...project,
        coordinatorMemberId: project.coordinatorMemberId === id ? '' : project.coordinatorMemberId,
      })),
    }));
  }

  addEvent(details: EventDraft): CommunityEvent {
    this.validateEventDraft(details);
    const nextId = Math.max(
      200,
      ...this.events().map((event) => Number(event.id.replace('e-', '')) || 0),
    ) + 1;
    const event: CommunityEvent = {
      ...this.cleanEventDraft(details),
      id: `e-${nextId}`,
      registeredMemberIds: [],
      attendedMemberIds: [],
    };
    this.dataState.update((data) => ({
      ...data,
      events: [event, ...data.events],
      activities: [{
        id: `a-${Date.now()}`,
        description: `created ${event.title}`,
        createdAt: new Date().toISOString(),
        kind: 'event',
        actor: 'Alex Morgan',
      }, ...data.activities],
    }));
    return event;
  }

  updateEvent(id: string, details: EventDraft): CommunityEvent {
    const current = this.events().find((event) => event.id === id);
    if (!current) throw new Error('The event could not be found.');
    this.validateEventDraft(details);
    if (details.capacity < current.registeredMemberIds.length) {
      throw new Error('Capacity cannot be lower than the number of registered members.');
    }
    const updated: CommunityEvent = { ...current, ...this.cleanEventDraft(details) };
    this.dataState.update((data) => ({
      ...data,
      events: data.events.map((event) => event.id === id ? updated : event),
    }));
    return updated;
  }

  deleteEvent(id: string): void {
    const event = this.events().find((item) => item.id === id);
    if (!event) throw new Error('The event could not be found.');
    this.dataState.update((data) => ({
      ...data,
      events: data.events.filter((item) => item.id !== id),
    }));
  }

  registerMember(eventId: string, memberId: string): void {
    const member = this.getMember(memberId);
    const event = this.events().find((item) => item.id === eventId);
    if (!event) throw new Error('The event could not be found.');
    if (!member) throw new Error('Choose a member from the directory.');
    if (member.status !== 'Active') throw new Error('Only active members can register for events.');
    if (event.registeredMemberIds.includes(memberId)) throw new Error('This member is already registered.');
    if (event.registeredMemberIds.length >= event.capacity) throw new Error('This event has reached capacity.');

    this.dataState.update((data) => ({
      ...data,
      events: data.events.map((item) => item.id === eventId
        ? { ...item, registeredMemberIds: [...item.registeredMemberIds, memberId] }
        : item),
      activities: [{
        id: `a-${Date.now()}`,
        description: 'registered for an event',
        createdAt: new Date().toISOString(),
        kind: 'event',
        actor: member.fullName,
      }, ...data.activities],
    }));
  }

  setAttendance(eventId: string, memberId: string, attended: boolean): void {
    const event = this.events().find((item) => item.id === eventId);
    if (!event) throw new Error('The event could not be found.');
    if (!event.registeredMemberIds.includes(memberId)) {
      throw new Error('Only registered members can have attendance recorded.');
    }

    this.dataState.update((data) => ({
      ...data,
      events: data.events.map((item) => {
        if (item.id !== eventId) return item;
        const attendedMemberIds = attended
          ? [...new Set([...item.attendedMemberIds, memberId])]
          : item.attendedMemberIds.filter((id) => id !== memberId);
        return { ...item, attendedMemberIds };
      }),
    }));
  }

  getEventStatus(event: CommunityEvent): 'Upcoming' | 'Ongoing' | 'Completed' {
    const now = Date.now();
    if (new Date(event.startsAt).getTime() > now) return 'Upcoming';
    if (new Date(event.endsAt).getTime() >= now) return 'Ongoing';
    return 'Completed';
  }

  private validateEventDraft(details: EventDraft): void {
    const startsAt = new Date(details.startsAt).getTime();
    const endsAt = new Date(details.endsAt).getTime();
    if (!details.title.trim() || !details.venue.trim()) throw new Error('Event title and venue are required.');
    if (!Number.isFinite(startsAt) || !Number.isFinite(endsAt)) throw new Error('Enter a valid event start and end time.');
    if (endsAt < startsAt) throw new Error('The event end time must be after the start time.');
    if (!Number.isInteger(details.capacity) || details.capacity < 1) throw new Error('Event capacity must be at least 1.');
  }

  private cleanEventDraft(details: EventDraft): EventDraft {
    return {
      ...details,
      title: details.title.trim(),
      description: details.description.trim(),
      venue: details.venue.trim(),
    };
  }

  private assertEmailAvailable(email: string, exceptId?: string): void {
    const normalizedEmail = email.trim().toLowerCase();
    const duplicate = this.members().some((member) =>
      member.id !== exceptId && member.email.toLowerCase() === normalizedEmail,
    );
    if (duplicate) throw new Error('A member with this email address already exists.');
  }

  private cleanMemberDraft(details: MemberDraft): MemberDraft {
    return {
      ...details,
      fullName: details.fullName.trim(),
      email: details.email.trim().toLowerCase(),
      phone: details.phone.trim(),
      address: details.address.trim(),
      group: details.group.trim(),
      skills: details.skills.map((skill) => skill.trim()).filter(Boolean),
      interests: details.interests.map((interest) => interest.trim()).filter(Boolean),
    };
  }

  private persist(data: CommunityData): void {
    if (typeof localStorage === 'undefined') return;

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (error) {
      console.error('CommunityHub could not save demo data to local storage.', error);
    }
  }
}
