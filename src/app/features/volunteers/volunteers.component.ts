import { Component, computed, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { NgIcon } from '@ng-icons/core';
import { Member, Volunteer } from '../../core/models/community.models';
import { CommunityDataService } from '../../core/services/community-data.service';
import { ToastService } from '../../core/services/toast.service';
import { ConfirmDialogComponent } from '../../shared/confirm-dialog/confirm-dialog.component';
import { VolunteerFormDialogComponent, VolunteerFormValue } from './volunteer-form-dialog/volunteer-form-dialog.component';

@Component({
  selector: 'app-volunteers',
  imports: [ConfirmDialogComponent, DatePipe, NgIcon, VolunteerFormDialogComponent],
  templateUrl: './volunteers.component.html',
  styleUrl: './volunteers.component.scss',
})
export class VolunteersComponent {
  readonly community = inject(CommunityDataService);
  private readonly toast = inject(ToastService);

  readonly searchTerm = signal('');
  readonly statusFilter = signal<'All' | 'Active' | 'Inactive'>('All');
  readonly formOpen = signal(false);
  readonly editingVolunteer = signal<Volunteer | null>(null);
  readonly selectedVolunteer = signal<Volunteer | null>(null);
  readonly pendingDelete = signal<Volunteer | null>(null);
  readonly hoursToAdd = signal(1);

  readonly filteredVolunteers = computed(() => {
    const query = this.searchTerm().trim().toLocaleLowerCase();
    const status = this.statusFilter();
    return this.community.volunteers()
      .filter((volunteer) => status === 'All' || (volunteer.active ? 'Active' : 'Inactive') === status)
      .filter((volunteer) => {
        const member = this.community.getMember(volunteer.memberId);
        const searchable = `${member?.fullName ?? ''} ${member?.email ?? ''} ${member?.group ?? ''} ${volunteer.skills.join(' ')} ${volunteer.availability}`;
        return searchable.toLocaleLowerCase().includes(query);
      })
      .sort((left, right) => this.community.getVolunteerName(left).localeCompare(this.community.getVolunteerName(right)));
  });

  readonly activeCount = computed(() => this.community.volunteers().filter((volunteer) => volunteer.active).length);
  readonly assignedCount = computed(() => this.community.volunteers().filter((volunteer) =>
    volunteer.assignedEventIds.length + volunteer.assignedProjectIds.length > 0,
  ).length);
  readonly availableMembers = computed(() => this.community.members().filter((member) =>
    member.status === 'Active' && !this.community.volunteers().some((volunteer) => volunteer.memberId === member.id),
  ));

  openCreateForm(): void {
    this.editingVolunteer.set(null);
    this.formOpen.set(true);
  }

  openEditForm(volunteer: Volunteer): void {
    this.editingVolunteer.set(volunteer);
    this.formOpen.set(true);
  }

  saveVolunteer(value: VolunteerFormValue): void {
    try {
      const existing = this.editingVolunteer();
      if (existing) {
        this.community.updateVolunteer(existing.id, value.details);
        this.toast.success(`${this.community.getVolunteerName(existing)}’s volunteer profile has been updated.`);
      } else {
        const volunteer = this.community.addVolunteer(value.memberId, value.details);
        this.toast.success(`${this.community.getVolunteerName(volunteer)} has joined the volunteer team.`);
      }
      this.formOpen.set(false);
      this.editingVolunteer.set(null);
    } catch (error) {
      this.toast.error(error instanceof Error ? error.message : 'The volunteer profile could not be saved.');
    }
  }

  recordHours(volunteer: Volunteer): void {
    try {
      this.community.recordVolunteerHours(volunteer.id, this.hoursToAdd());
      this.toast.success(`${this.hoursToAdd()} volunteer hour${this.hoursToAdd() === 1 ? '' : 's'} recorded.`);
      this.hoursToAdd.set(1);
      this.selectedVolunteer.set(this.community.volunteers().find((item) => item.id === volunteer.id) ?? null);
    } catch (error) {
      this.toast.error(error instanceof Error ? error.message : 'Volunteer hours could not be recorded.');
    }
  }

  setHours(event: Event): void {
    const value = Number((event.target as HTMLInputElement).value);
    this.hoursToAdd.set(Number.isNaN(value) ? 0 : value);
  }

  toggleAssignment(volunteer: Volunteer, type: 'event' | 'project', id: string, inputEvent: Event): void {
    const checked = (inputEvent.target as HTMLInputElement).checked;
    try {
      this.community.setVolunteerAssignment(volunteer.id, type, id, checked);
      const label = type === 'event' ? 'event' : 'project';
      this.toast.success(`${this.community.getVolunteerName(volunteer)} ${checked ? 'assigned to' : 'removed from'} ${label}.`);
      this.selectedVolunteer.set(this.community.volunteers().find((item) => item.id === volunteer.id) ?? null);
    } catch (error) {
      this.toast.error(error instanceof Error ? error.message : 'The assignment could not be updated.');
    }
  }

  removeVolunteer(): void {
    const volunteer = this.pendingDelete();
    if (!volunteer) return;
    try {
      this.community.deleteVolunteer(volunteer.id);
      this.selectedVolunteer.set(null);
      this.pendingDelete.set(null);
      this.toast.success(`${this.community.getVolunteerName(volunteer)} was removed from the volunteer team.`);
    } catch (error) {
      this.toast.error(error instanceof Error ? error.message : 'The volunteer could not be removed.');
    }
  }

  setFilter(event: Event): void {
    this.statusFilter.set((event.target as HTMLSelectElement).value as 'All' | 'Active' | 'Inactive');
  }

  setSearch(event: Event): void {
    this.searchTerm.set((event.target as HTMLInputElement).value);
  }

  memberFor(volunteer: Volunteer): Member | undefined {
    return this.community.getMember(volunteer.memberId);
  }

  historyFor(volunteer: Volunteer) {
    const name = this.community.getVolunteerName(volunteer);
    return this.community.activities().filter((activity) => activity.kind === 'volunteer' && activity.actor === name);
  }

  initials(name: string): string {
    return name.split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]).join('').toUpperCase();
  }

  formatDate(value: string): string {
    return new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short' }).format(new Date(value));
  }

  pendingDeleteMessage(): string {
    const volunteer = this.pendingDelete();
    return volunteer
      ? `${this.community.getVolunteerName(volunteer)} will be removed from volunteer assignments. Their member record will remain.`
      : '';
  }
}
