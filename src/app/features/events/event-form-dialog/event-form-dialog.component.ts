import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges, inject } from '@angular/core';
import { AbstractControl, FormBuilder, ReactiveFormsModule, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { NgIcon } from '@ng-icons/core';
import { CommunityEvent, EventDraft } from '../../../core/models/community.models';

const eventTimeRangeValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
  const start = control.get('startsAt')?.value as string | undefined;
  const end = control.get('endsAt')?.value as string | undefined;
  if (!start || !end) return null;
  return new Date(end).getTime() >= new Date(start).getTime() ? null : { endsBeforeStart: true };
};

function toLocalDateTime(value: string): string {
  const date = new Date(value);
  const offsetDate = new Date(date.getTime() - date.getTimezoneOffset() * 60_000);
  return offsetDate.toISOString().slice(0, 16);
}

@Component({
  selector: 'app-event-form-dialog',
  imports: [NgIcon, ReactiveFormsModule],
  templateUrl: './event-form-dialog.component.html',
  styleUrl: './event-form-dialog.component.scss',
})
export class EventFormDialogComponent implements OnChanges {
  @Input() event: CommunityEvent | null = null;
  @Output() saved = new EventEmitter<EventDraft>();
  @Output() cancelled = new EventEmitter<void>();

  private readonly formBuilder = inject(FormBuilder).nonNullable;
  readonly form = this.formBuilder.group({
    title: ['', [Validators.required, Validators.maxLength(100)]],
    description: ['', [Validators.required, Validators.maxLength(1000)]],
    venue: ['', [Validators.required, Validators.maxLength(160)]],
    startsAt: ['', Validators.required],
    endsAt: ['', Validators.required],
    capacity: [20, [Validators.required, Validators.min(1), Validators.max(5000)]],
  }, { validators: eventTimeRangeValidator });
  submitted = false;

  ngOnChanges(_changes: SimpleChanges): void {
    const now = new Date();
    const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    this.submitted = false;
    this.form.reset({
      title: this.event?.title ?? '',
      description: this.event?.description ?? '',
      venue: this.event?.venue ?? '',
      startsAt: this.event ? toLocalDateTime(this.event.startsAt) : toLocalDateTime(tomorrow.toISOString()),
      endsAt: this.event ? toLocalDateTime(this.event.endsAt) : toLocalDateTime(tomorrow.toISOString()),
      capacity: this.event?.capacity ?? 20,
    });
  }

  isInvalid(controlName: string): boolean {
    const control = this.form.get(controlName);
    return !!control && control.invalid && (control.touched || this.submitted);
  }

  submit(): void {
    this.submitted = true;
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const value = this.form.getRawValue();
    this.saved.emit({
      ...value,
      startsAt: new Date(value.startsAt).toISOString(),
      endsAt: new Date(value.endsAt).toISOString(),
      capacity: Number(value.capacity),
    });
  }
}
