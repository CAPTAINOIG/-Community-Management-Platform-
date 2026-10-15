import { Component, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { NgIcon } from '@ng-icons/core';
import { CommunityEvent, EventDraft, EventStatus, Member } from '../../core/models/community.models';
import { CommunityDataService } from '../../core/services/community-data.service';
import { ToastService } from '../../core/services/toast.service';
import { ConfirmDialogComponent } from '../../shared/confirm-dialog/confirm-dialog.component';
import { EventFormDialogComponent } from './event-form-dialog/event-form-dialog.component';

@Component({
  selector: 'app-events',
  imports: [ConfirmDialogComponent, EventFormDialogComponent, NgIcon, RouterLink],
  templateUrl: './events.component.html',
  styleUrl: './events.component.scss',
})
export class EventsComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly toast = inject(ToastService);
  readonly community = inject(CommunityDataService);

  readonly eventId = signal(this.route.snapshot.paramMap.get('eventId'));
  readonly selectedEvent = computed(() => {
    const id = this.eventId();
    return id ? this.community.events().find((event) => event.id === id) : undefined;
  });
  readonly statusFilter = signal<'All' | EventStatus>('All');
  readonly searchTerm = signal('');
  readonly formOpen = signal(false);
  readonly editingEvent = signal<CommunityEvent | null>(null);
  readonly pendingDelete = signal<CommunityEvent | null>(null);
  readonly selectedMemberId = signal('');

  readonly filteredEvents = computed(() => {
    const query = this.searchTerm().trim().toLocaleLowerCase();
    const status = this.statusFilter();
    return this.community.events()
      .filter((event) => status === 'All' || this.community.getEventStatus(event) === status)
      .filter((event) => !query || `${event.title} ${event.venue} ${event.description}`.toLocaleLowerCase().includes(query))
      .sort((left, right) => left.startsAt.localeCompare(right.startsAt));
  });

  readonly upcomingCount = computed(() => this.community.events().filter((event) => this.community.getEventStatus(event) === 'Upcoming').length);
  readonly ongoingCount = computed(() => this.community.events().filter((event) => this.community.getEventStatus(event) === 'Ongoing').length);
  readonly completedCount = computed(() => this.community.events().filter((event) => this.community.getEventStatus(event) === 'Completed').length);
  readonly eventAttendees = computed(() => {
    const event = this.selectedEvent();
    if (!event) return [];
    return event.registeredMemberIds.flatMap((id) => {
      const member = this.community.getMember(id);
      return member ? [{ member, attended: event.attendedMemberIds.includes(id) }] : [];
    });
  });
  readonly availableMembers = computed(() => {
    const event = this.selectedEvent();
    if (!event || event.registeredMemberIds.length >= event.capacity) return [];
    return this.community.members().filter((member) =>
      member.status === 'Active' && !event.registeredMemberIds.includes(member.id),
    );
  });

  openCreateForm(): void {
    this.editingEvent.set(null);
    this.formOpen.set(true);
  }

  openEditForm(event: CommunityEvent): void {
    this.editingEvent.set(event);
    this.formOpen.set(true);
  }

  closeForm(): void {
    this.formOpen.set(false);
    this.editingEvent.set(null);
  }

  saveEvent(details: EventDraft): void {
    try {
      const existing = this.editingEvent();
      if (existing) {
        this.community.updateEvent(existing.id, details);
        this.toast.success(`${details.title} has been updated.`);
      } else {
        this.community.addEvent(details);
        this.toast.success(`${details.title} has been created.`);
      }
      this.closeForm();
    } catch (error) {
      this.toast.error(error instanceof Error ? error.message : 'The event could not be saved.');
    }
  }

  deleteEvent(): void {
    const event = this.pendingDelete();
    if (!event) return;
    try {
      this.community.deleteEvent(event.id);
      this.pendingDelete.set(null);
      this.toast.success(`${event.title} has been removed.`);
      if (this.eventId() === event.id) void this.router.navigateByUrl('/events');
    } catch (error) {
      this.toast.error(error instanceof Error ? error.message : 'The event could not be removed.');
    }
  }

  registerMember(): void {
    const event = this.selectedEvent();
    const memberId = this.selectedMemberId();
    if (!event || !memberId) {
      this.toast.info('Choose a member to register for this event.');
      return;
    }
    try {
      this.community.registerMember(event.id, memberId);
      const member = this.community.getMember(memberId);
      this.selectedMemberId.set('');
      if (member) this.toast.success(`${member.fullName} has been registered.`);
    } catch (error) {
      this.toast.error(error instanceof Error ? error.message : 'The member could not be registered.');
    }
  }

  updateAttendance(member: Member, attended: boolean): void {
    const event = this.selectedEvent();
    if (!event) return;
    try {
      this.community.setAttendance(event.id, member.id, attended);
      this.toast.success(`${member.fullName} marked ${attended ? 'as attended' : 'as not attended'}.`);
    } catch (error) {
      this.toast.error(error instanceof Error ? error.message : 'Attendance could not be updated.');
    }
  }

  setStatusFilter(event: EventStatus | 'All'): void {
    this.statusFilter.set(event);
  }

  setSearch(event: Event): void {
    this.searchTerm.set((event.target as HTMLInputElement).value);
  }

  selectMember(event: Event): void {
    this.selectedMemberId.set((event.target as HTMLSelectElement).value);
  }

  updateAttendanceFromInput(event: Event, member: Member): void {
    this.updateAttendance(member, (event.target as HTMLInputElement).checked);
  }

  formatDate(value: string): string {
    return new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(value));
  }

  formatTime(value: string): string {
    return new Intl.DateTimeFormat('en-GB', { hour: 'numeric', minute: '2-digit' }).format(new Date(value));
  }

  capacityPercent(event: CommunityEvent): number {
    return Math.min(100, Math.round((event.registeredMemberIds.length / event.capacity) * 100));
  }

  attendancePercent(event: CommunityEvent): number {
    return event.registeredMemberIds.length === 0
      ? 0
      : Math.round((event.attendedMemberIds.length / event.registeredMemberIds.length) * 100);
  }

  eventStatus(event: CommunityEvent): EventStatus {
    return this.community.getEventStatus(event);
  }
}
