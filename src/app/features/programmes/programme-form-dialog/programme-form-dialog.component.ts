import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgIcon } from '@ng-icons/core';
import { EmpowermentProgramme, ProgrammeDraft } from '../../../core/models/community.models';

function dateOnly(value: string): string {
  return new Date(value).toISOString().slice(0, 10);
}

@Component({
  selector: 'app-programme-form-dialog',
  imports: [NgIcon, ReactiveFormsModule],
  templateUrl: './programme-form-dialog.component.html',
  styleUrl: './programme-form-dialog.component.scss',
})
export class ProgrammeFormDialogComponent implements OnChanges {
  @Input() programme: EmpowermentProgramme | null = null;
  @Output() saved = new EventEmitter<ProgrammeDraft>();
  @Output() cancelled = new EventEmitter<void>();

  private readonly formBuilder = inject(FormBuilder).nonNullable;
  readonly form = this.formBuilder.group({
    title: ['', [Validators.required, Validators.maxLength(100)]],
    category: ['', [Validators.required, Validators.maxLength(80)]],
    startsAt: ['', Validators.required],
    endsAt: ['', Validators.required],
    capacity: [20, [Validators.required, Validators.min(1), Validators.max(1000)]],
    status: ['Open' as ProgrammeDraft['status'], Validators.required],
  });
  submitted = false;

  ngOnChanges(_changes: SimpleChanges): void {
    const start = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString();
    const end = new Date(Date.now() + 45 * 24 * 60 * 60 * 1000).toISOString();
    this.submitted = false;
    this.form.reset({
      title: this.programme?.title ?? '',
      category: this.programme?.category ?? '',
      startsAt: this.programme ? dateOnly(this.programme.startsAt) : dateOnly(start),
      endsAt: this.programme ? dateOnly(this.programme.endsAt) : dateOnly(end),
      capacity: this.programme?.capacity ?? 20,
      status: this.programme?.status ?? 'Open',
    });
  }

  submit(): void {
    this.submitted = true;
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const value = this.form.getRawValue();
    const startsAt = new Date(`${value.startsAt}T12:00:00`);
    const endsAt = new Date(`${value.endsAt}T12:00:00`);
    if (endsAt.getTime() < startsAt.getTime()) {
      this.form.setErrors({ endsBeforeStart: true });
      return;
    }
    this.saved.emit({
      ...value,
      startsAt: startsAt.toISOString(),
      endsAt: endsAt.toISOString(),
      capacity: Number(value.capacity),
    });
  }
}
