import { TestBed } from '@angular/core/testing';
import { CommunityDataService } from './community-data.service';

describe('CommunityDataService', () => {
  let service: CommunityDataService;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({});
    service = TestBed.inject(CommunityDataService);
  });

  it('calculates dashboard metrics from demo records', () => {
    expect(service.metrics()).toMatchObject({
      totalMembers: 12,
      activeVolunteers: 4,
      upcomingEvents: 3,
      ongoingProgrammes: 1,
      attendanceRate: 25,
    });
  });

  it('creates a seven-month member registration series', () => {
    expect(service.memberGrowth()).toHaveLength(7);
    expect(service.memberGrowth().some((month) => month.count > 0)).toBe(true);
  });

  it('derives event status from event dates', () => {
    expect(service.events().filter((event) => service.getEventStatus(event) === 'Upcoming')).toHaveLength(3);
    expect(service.events().filter((event) => service.getEventStatus(event) === 'Completed')).toHaveLength(1);
  });

  it('creates and edits a member while keeping dashboard totals in sync', () => {
    const member = service.addMember({
      fullName: 'Test Member',
      email: 'test.member@example.org',
      phone: '+44 7700 900200',
      address: '1 Test Street, Bristol',
      skills: ['Listening'],
      interests: ['Neighbourhood'],
      status: 'Active',
      group: 'Test group',
    });

    expect(service.metrics().totalMembers).toBe(13);
    expect(member.id).toBe('m-1013');

    const updated = service.updateMember(member.id, {
      fullName: 'Updated Member',
      email: member.email,
      phone: member.phone,
      address: member.address,
      skills: ['Listening', 'First aid'],
      interests: member.interests,
      status: 'Pending',
      group: member.group,
    });

    expect(updated.fullName).toBe('Updated Member');
    expect(service.getMember(member.id)?.status).toBe('Pending');
  });

  it('prevents duplicate emails and removes related member assignments', () => {
    expect(() => service.addMember({
      fullName: 'Duplicate Email',
      email: 'AMARA.OKAFOR@example.org',
      phone: '+44 7700 900200',
      address: '1 Test Street, Bristol',
      skills: [],
      interests: [],
      status: 'Active',
      group: 'Test group',
    })).toThrow('A member with this email address already exists.');

    service.deleteMember('m-1001');
    expect(service.getMember('m-1001')).toBeUndefined();
    expect(service.volunteers().some((volunteer) => volunteer.memberId === 'm-1001')).toBe(false);
    expect(service.events().every((event) => !event.registeredMemberIds.includes('m-1001'))).toBe(true);
  });

  it('creates events and enforces event registration and attendance rules', () => {
    const event = service.addEvent({
      title: 'Neighbourhood listening circle',
      description: 'Share ideas for the next community season.',
      venue: 'Eastside Community Centre',
      startsAt: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
      endsAt: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000 + 60 * 60 * 1000).toISOString(),
      capacity: 1,
    });

    service.registerMember(event.id, 'm-1001');
    expect(() => service.registerMember(event.id, 'm-1003')).toThrow('This event has reached capacity.');
    service.setAttendance(event.id, 'm-1001', true);
    expect(service.events().find((item) => item.id === event.id)?.attendedMemberIds).toEqual(['m-1001']);
    expect(service.metrics().upcomingEvents).toBe(4);
  });

  it('rejects invalid event times and capacity reductions below current registrations', () => {
    const event = service.events().find((item) => item.id === 'e-201');
    expect(event).toBeDefined();
    if (!event) return;

    expect(() => service.updateEvent(event.id, {
      title: event.title,
      description: event.description,
      venue: event.venue,
      startsAt: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toISOString(),
      endsAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
      capacity: event.capacity,
    })).toThrow('The event end time must be after the start time.');

    expect(() => service.updateEvent(event.id, {
      title: event.title,
      description: event.description,
      venue: event.venue,
      startsAt: event.startsAt,
      endsAt: event.endsAt,
      capacity: event.registeredMemberIds.length - 1,
    })).toThrow('Capacity cannot be lower than the number of registered members.');
  });
});
