import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgIcon } from '@ng-icons/core';
import { EmpowermentProgramme, Member } from '../../../core/models/community.models';

@Component({
  selector: 'app-application-dialog',
  imports: [NgIcon, ReactiveFormsModule],
  templateUrl: './application-dialog.component.html',
  styleUrl: './application-dialog.component.scss',
})
export class ApplicationDialogComponent implements OnChanges {
  @Input() programme: EmpowermentProgramme | null = null;
  @Input() availableMembers: Member[] = [];
  @Output() applied = new EventEmitter<string>();
  @Output() cancelled = new EventEmitter<void>();

  private readonly formBuilder = inject(FormBuilder).nonNullable;
  readonly form = this.formBuilder.group({ memberId: ['', Validators.required] });
  submitted = false;

  ngOnChanges(_changes: SimpleChanges): void {
    this.submitted = false;
    this.form.reset({ memberId: '' });
  }

  submit(): void {
    this.submitted = true;
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.applied.emit(this.form.getRawValue().memberId);
  }
}
