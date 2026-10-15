import { Component, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { NgIcon } from '@ng-icons/core';
import { Member, MemberDraft, MemberStatus } from '../../core/models/community.models';
import { CommunityDataService } from '../../core/services/community-data.service';
import { ToastService } from '../../core/services/toast.service';
import { downloadCsv, toCsv } from '../../core/utils/csv.utils';
import { ConfirmDialogComponent } from '../../shared/confirm-dialog/confirm-dialog.component';
import { MemberFormDialogComponent } from './member-form-dialog/member-form-dialog.component';

type MemberSortField = 'fullName' | 'registeredAt' | 'status';

@Component({
  selector: 'app-members',
  imports: [ConfirmDialogComponent, MemberFormDialogComponent, NgIcon, RouterLink],
  templateUrl: './members.component.html',
  styleUrl: './members.component.scss',
})
export class MembersComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly toast = inject(ToastService);
  readonly community = inject(CommunityDataService);

  readonly searchTerm = signal('');
  readonly statusFilter = signal<'All' | MemberStatus>('All');
  readonly fromDate = signal('');
  readonly toDate = signal('');
  readonly sortField = signal<MemberSortField>('registeredAt');
  readonly sortAscending = signal(false);
  readonly currentPage = signal(1);
  readonly pageSize = 8;
  readonly formOpen = signal(false);
  readonly editingMember = signal<Member | null>(null);
  readonly profileMember = signal<Member | null>(null);
  readonly pendingDelete = signal<Member | null>(null);

  readonly filteredMembers = computed(() => {
    const query = this.searchTerm().trim().toLocaleLowerCase();
    const fromDate = this.fromDate();
    const toDate = this.toDate();
    const status = this.statusFilter();

    return this.community.members()
      .filter((member) => status === 'All' || member.status === status)
      .filter((member) => !query || [
        member.fullName,
        member.email,
        member.phone,
      ].some((value) => value.toLocaleLowerCase().includes(query)))
      .filter((member) => !fromDate || member.registeredAt.slice(0, 10) >= fromDate)
      .filter((member) => !toDate || member.registeredAt.slice(0, 10) <= toDate)
      .sort((left, right) => {
        const field = this.sortField();
        const comparison = field === 'registeredAt'
          ? left.registeredAt.localeCompare(right.registeredAt)
          : left[field].localeCompare(right[field]);
        return this.sortAscending() ? comparison : -comparison;
      });
  });

  readonly visibleMembers = computed(() => {
    const start = (this.currentPage() - 1) * this.pageSize;
    return this.filteredMembers().slice(start, start + this.pageSize);
  });

  readonly pageCount = computed(() => Math.max(1, Math.ceil(this.filteredMembers().length / this.pageSize)));
  readonly activeCount = computed(() => this.community.members().filter((member) => member.status === 'Active').length);
  readonly pendingCount = computed(() => this.community.members().filter((member) => member.status === 'Pending').length);

  constructor() {
    if (this.route.snapshot.queryParamMap.get('create') === 'true') {
      queueMicrotask(() => this.openCreateForm());
      void this.router.navigate([], {
        relativeTo: this.route,
        queryParams: { create: null },
        queryParamsHandling: 'merge',
        replaceUrl: true,
      });
    }
  }

  setSearch(event: Event): void {
    this.searchTerm.set((event.target as HTMLInputElement).value);
    this.currentPage.set(1);
  }

  setStatus(event: Event): void {
    this.statusFilter.set((event.target as HTMLSelectElement).value as 'All' | MemberStatus);
    this.currentPage.set(1);
  }

  setDate(event: Event, edge: 'from' | 'to'): void {
    const value = (event.target as HTMLInputElement).value;
    if (edge === 'from') this.fromDate.set(value);
    else this.toDate.set(value);
    this.currentPage.set(1);
  }

  toggleSort(field: MemberSortField): void {
    if (this.sortField() === field) this.sortAscending.update((ascending) => !ascending);
    else {
      this.sortField.set(field);
      this.sortAscending.set(field === 'fullName');
    }
  }

  changePage(page: number): void {
    this.currentPage.set(Math.max(1, Math.min(page, this.pageCount())));
  }

  clearFilters(): void {
    this.searchTerm.set('');
    this.statusFilter.set('All');
    this.fromDate.set('');
    this.toDate.set('');
    this.currentPage.set(1);
  }

  openCreateForm(): void {
    this.editingMember.set(null);
    this.formOpen.set(true);
  }

  openEditForm(member: Member): void {
    this.editingMember.set(member);
    this.formOpen.set(true);
  }

  closeForm(): void {
    this.formOpen.set(false);
    this.editingMember.set(null);
  }

  saveMember(details: MemberDraft): void {
    try {
      const existing = this.editingMember();
      if (existing) {
        this.community.updateMember(existing.id, details);
        this.toast.success(`${details.fullName}’s details have been updated.`);
      } else {
        this.community.addMember(details);
        this.toast.success(`${details.fullName} has been added to your community.`);
      }
      this.closeForm();
      this.currentPage.set(1);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'The member could not be saved.';
      this.toast.error(message);
    }
  }

  deleteMember(): void {
    const member = this.pendingDelete();
    if (!member) return;

    try {
      this.community.deleteMember(member.id);
      this.pendingDelete.set(null);
      this.profileMember.set(null);
      this.toast.success(`${member.fullName} has been removed.`);
      this.changePage(this.currentPage());
    } catch (error) {
      const message = error instanceof Error ? error.message : 'The member could not be removed.';
      this.toast.error(message);
    }
  }

  exportCsv(): void {
    const rows = this.filteredMembers().map((member) => [
      member.fullName,
      member.email,
      member.phone,
      member.address,
      new Date(member.registeredAt).toISOString().slice(0, 10),
      member.skills.join('; '),
      member.interests.join('; '),
      member.status,
      member.group,
    ]);

    try {
      downloadCsv(`community-members-${new Date().toISOString().slice(0, 10)}.csv`, toCsv(
        ['Full name', 'Email', 'Phone', 'Address', 'Date registered', 'Skills', 'Interests', 'Status', 'Community group'],
        rows,
      ));
      this.toast.success(`${rows.length} member record${rows.length === 1 ? '' : 's'} exported.`);
    } catch (error) {
      console.error('Could not export member records.', error);
      this.toast.error('Member records could not be exported. Please try again.');
    }
  }

  initials(name: string): string {
    return name.split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]).join('').toUpperCase();
  }

  formattedDate(value: string): string {
    return new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(value));
  }

  get rangeStart(): number {
    return this.filteredMembers().length === 0 ? 0 : (this.currentPage() - 1) * this.pageSize + 1;
  }

  get rangeEnd(): number {
    return Math.min(this.currentPage() * this.pageSize, this.filteredMembers().length);
  }
}
