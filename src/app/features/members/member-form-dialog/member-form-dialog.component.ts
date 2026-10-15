import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgIcon } from '@ng-icons/core';
import { Member, MemberDraft, MemberStatus } from '../../../core/models/community.models';

@Component({
  selector: 'app-member-form-dialog',
  imports: [NgIcon, ReactiveFormsModule],
  templateUrl: './member-form-dialog.component.html',
  styleUrl: './member-form-dialog.component.scss',
})
export class MemberFormDialogComponent implements OnChanges {
  @Input() member: Member | null = null;
  @Output() saved = new EventEmitter<MemberDraft>();
  @Output() cancelled = new EventEmitter<void>();

  private readonly formBuilder = inject(FormBuilder).nonNullable;
  readonly form = this.formBuilder.group({
    fullName: ['', [Validators.required, Validators.maxLength(100)]],
    email: ['', [Validators.required, Validators.email, Validators.maxLength(160)]],
    phone: ['', [Validators.required, Validators.pattern(/^[+()\d.\s-]{7,24}$/)]],
    address: ['', [Validators.required, Validators.maxLength(180)]],
    group: ['', [Validators.required, Validators.maxLength(80)]],
    status: ['Active' as MemberStatus, Validators.required],
    skills: [''],
    interests: [''],
  });

  submitted = false;
  readonly groups = [
    'Eastside Neighbours',
    'Green Futures',
    'Creative Circle',
    'Digital Bridges',
  ];

  ngOnChanges(_changes: SimpleChanges): void {
    this.submitted = false;
    this.form.reset({
      fullName: this.member?.fullName ?? '',
      email: this.member?.email ?? '',
      phone: this.member?.phone ?? '',
      address: this.member?.address ?? '',
      group: this.member?.group ?? '',
      status: this.member?.status ?? 'Active',
      skills: this.member?.skills.join(', ') ?? '',
      interests: this.member?.interests.join(', ') ?? '',
    });
  }

  isInvalid(controlName: string): boolean {
    const control = this.form.get(controlName);
    return !!control && control.invalid && (control.touched || this.submitted);
  }

  errorMessage(controlName: string): string {
    const control = this.form.get(controlName);
    if (!control?.errors) return '';
    if (control.hasError('required')) return 'This field is required.';
    if (control.hasError('email')) return 'Enter a valid email address.';
    if (control.hasError('pattern')) return 'Enter a valid phone number.';
    if (control.hasError('maxlength')) return 'This value is too long.';
    return 'Check this value and try again.';
  }

  onBackdrop(event: MouseEvent): void {
    if (event.target === event.currentTarget) this.cancelled.emit();
  }

  submit(): void {
    this.submitted = true;
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const { skills, interests, ...fields } = this.form.getRawValue();
    const splitList = (value: string): string[] => value.split(',').map((item) => item.trim()).filter(Boolean);
    this.saved.emit({
      ...fields,
      fullName: fields.fullName.trim(),
      email: fields.email.trim(),
      phone: fields.phone.trim(),
      address: fields.address.trim(),
      group: fields.group.trim(),
      skills: splitList(skills),
      interests: splitList(interests),
    });
  }
}
