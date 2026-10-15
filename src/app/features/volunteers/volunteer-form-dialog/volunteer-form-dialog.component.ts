import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgIcon } from '@ng-icons/core';
import { Member, Volunteer, VolunteerDraft } from '../../../core/models/community.models';

export interface VolunteerFormValue {
  memberId: string;
  details: VolunteerDraft;
}

@Component({
  selector: 'app-volunteer-form-dialog',
  imports: [NgIcon, ReactiveFormsModule],
  templateUrl: './volunteer-form-dialog.component.html',
  styleUrl: './volunteer-form-dialog.component.scss',
})
export class VolunteerFormDialogComponent implements OnChanges {
  @Input() volunteer: Volunteer | null = null;
  @Input() availableMembers: Member[] = [];
  @Input() members: Member[] = [];
  @Output() saved = new EventEmitter<VolunteerFormValue>();
  @Output() cancelled = new EventEmitter<void>();

  private readonly formBuilder = inject(FormBuilder).nonNullable;
  readonly form = this.formBuilder.group({
    memberId: ['', Validators.required],
    skills: [''],
    availability: ['', [Validators.required, Validators.maxLength(100)]],
    active: [true],
  });
  submitted = false;

  ngOnChanges(_changes: SimpleChanges): void {
    this.submitted = false;
    this.form.reset({
      memberId: this.volunteer?.memberId ?? '',
      skills: this.volunteer?.skills.join(', ') ?? '',
      availability: this.volunteer?.availability ?? '',
      active: this.volunteer?.active ?? true,
    });
  }

  submit(): void {
    this.submitted = true;
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const value = this.form.getRawValue();
    this.saved.emit({
      memberId: value.memberId,
      details: {
        skills: value.skills.split(',').map((skill) => skill.trim()).filter(Boolean),
        availability: value.availability.trim(),
        active: value.active,
      },
    });
  }
}
