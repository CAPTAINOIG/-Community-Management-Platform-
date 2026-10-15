import { Component, computed, inject, signal } from '@angular/core';
import { NgIcon } from '@ng-icons/core';
import {
  EmpowermentProgramme,
  ProgrammeApplication,
  ProgrammeApplicationStatus,
  ProgrammeDraft,
} from '../../core/models/community.models';
import { CommunityDataService } from '../../core/services/community-data.service';
import { ToastService } from '../../core/services/toast.service';
import { ConfirmDialogComponent } from '../../shared/confirm-dialog/confirm-dialog.component';
import { ApplicationDialogComponent } from './application-dialog/application-dialog.component';
import { ProgrammeFormDialogComponent } from './programme-form-dialog/programme-form-dialog.component';

@Component({
  selector: 'app-programmes',
  imports: [ApplicationDialogComponent, ConfirmDialogComponent, NgIcon, ProgrammeFormDialogComponent],
  templateUrl: './programmes.component.html',
  styleUrl: './programmes.component.scss',
})
export class ProgrammesComponent {
  readonly community = inject(CommunityDataService);
  private readonly toast = inject(ToastService);

  readonly statusFilter = signal<'All' | 'Open' | 'In progress' | 'Completed'>('All');
  readonly selectedProgrammeId = signal('');
  readonly formOpen = signal(false);
  readonly editingProgramme = signal<EmpowermentProgramme | null>(null);
  readonly applyingProgramme = signal<EmpowermentProgramme | null>(null);
  readonly pendingDelete = signal<EmpowermentProgramme | null>(null);

  readonly visibleProgrammes = computed(() => this.community.programmes()
    .filter((programme) => this.statusFilter() === 'All' || programme.status === this.statusFilter())
    .sort((left, right) => left.startsAt.localeCompare(right.startsAt)));
  readonly visibleApplications = computed(() => {
    const programmeId = this.selectedProgrammeId();
    return this.community.applications()
      .filter((application) => !programmeId || application.programmeId === programmeId)
      .map((application) => ({
        application,
        memberName: this.community.getMember(application.memberId)?.fullName ?? 'Community member',
        programmeName: this.community.programmes().find((programme) => programme.id === application.programmeId)?.title ?? 'Removed programme',
      }))
      .sort((left, right) => right.application.appliedAt.localeCompare(left.application.appliedAt));
  });
  readonly openCount = computed(() => this.community.programmes().filter((programme) => programme.status === 'Open').length);
  readonly inProgressCount = computed(() => this.community.programmes().filter((programme) => programme.status === 'In progress').length);
  readonly participantCount = computed(() => this.community.programmes().reduce((total, programme) => total + programme.participantMemberIds.length, 0));
  readonly pendingCount = computed(() => this.community.applications().filter((application) => application.status === 'Pending').length);

  readonly activeMembersForApplication = computed(() => {
    const programme = this.applyingProgramme();
    if (!programme) return [];
    const existingApplications = this.community.applications()
      .filter((application) => application.programmeId === programme.id)
      .map((application) => application.memberId);
    return this.community.members().filter((member) =>
      member.status === 'Active' && !existingApplications.includes(member.id),
    );
  });

  openCreateForm(): void {
    this.editingProgramme.set(null);
    this.formOpen.set(true);
  }

  openEditForm(programme: EmpowermentProgramme): void {
    this.editingProgramme.set(programme);
    this.formOpen.set(true);
  }

  saveProgramme(details: ProgrammeDraft): void {
    try {
      const existing = this.editingProgramme();
      if (existing) {
        this.community.updateProgramme(existing.id, details);
        this.toast.success(`${details.title} has been updated.`);
      } else {
        this.community.addProgramme(details);
        this.toast.success(`${details.title} has been created.`);
      }
      this.formOpen.set(false);
      this.editingProgramme.set(null);
    } catch (error) {
      this.toast.error(error instanceof Error ? error.message : 'The programme could not be saved.');
    }
  }

  applyMember(memberId: string): void {
    const programme = this.applyingProgramme();
    if (!programme) return;
    try {
      const application = this.community.applyToProgramme(programme.id, memberId);
      this.applyingProgramme.set(null);
      this.toast.success(`Application submitted for ${this.community.getMember(application.memberId)?.fullName ?? 'the member'}.`);
    } catch (error) {
      this.toast.error(error instanceof Error ? error.message : 'The application could not be submitted.');
    }
  }

  changeApplicationStatus(application: ProgrammeApplication, status: ProgrammeApplicationStatus): void {
    try {
      this.community.updateApplicationStatus(application.id, status);
      const memberName = this.community.getMember(application.memberId)?.fullName ?? 'The member';
      const message = status === 'Rejected' ? 'application was declined.' : status === 'Completed' ? 'programme completion was recorded.' : 'application was approved.';
      this.toast.success(`${memberName}’s ${message}`);
    } catch (error) {
      this.toast.error(error instanceof Error ? error.message : 'The application status could not be updated.');
    }
  }

  deleteProgramme(): void {
    const programme = this.pendingDelete();
    if (!programme) return;
    try {
      this.community.deleteProgramme(programme.id);
      this.pendingDelete.set(null);
      if (this.selectedProgrammeId() === programme.id) this.selectedProgrammeId.set('');
      this.toast.success(`${programme.title} has been removed.`);
    } catch (error) {
      this.toast.error(error instanceof Error ? error.message : 'The programme could not be removed.');
    }
  }

  setStatusFilter(status: 'All' | 'Open' | 'In progress' | 'Completed'): void {
    this.statusFilter.set(status);
  }

  setApplicationFilter(event: Event): void {
    this.selectedProgrammeId.set((event.target as HTMLSelectElement).value);
  }

  participantPercent(programme: EmpowermentProgramme): number {
    return Math.min(100, Math.round((programme.participantMemberIds.length / programme.capacity) * 100));
  }

  applicationCount(programme: EmpowermentProgramme): number {
    return this.community.applications().filter((application) => application.programmeId === programme.id).length;
  }

  formatDate(value: string): string {
    return new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(value));
  }

  pendingDeleteMessage(): string {
    const programme = this.pendingDelete();
    return programme ? `${programme.title} and its application records will be permanently removed.` : '';
  }
}
