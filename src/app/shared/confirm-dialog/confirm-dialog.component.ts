import { AfterViewInit, Component, ElementRef, EventEmitter, Input, OnChanges, Output, SimpleChanges, ViewChild } from '@angular/core';
import { NgIcon } from '@ng-icons/core';

@Component({
  selector: 'app-confirm-dialog',
  imports: [NgIcon],
  templateUrl: './confirm-dialog.component.html',
  styleUrl: './confirm-dialog.component.scss',
})
export class ConfirmDialogComponent implements AfterViewInit, OnChanges {
  @Input() open = false;
  @Input() title = 'Are you sure?';
  @Input() message = 'This action cannot be undone.';
  @Input() confirmLabel = 'Confirm';
  @Input() destructive = false;
  @Output() confirmed = new EventEmitter<void>();
  @Output() cancelled = new EventEmitter<void>();

  @ViewChild('dialog') private dialog?: ElementRef<HTMLDialogElement>;

  ngAfterViewInit(): void {
    this.syncDialog();
  }

  ngOnChanges(_changes: SimpleChanges): void {
    this.syncDialog();
  }

  cancelFromEscape(event: Event): void {
    event.preventDefault();
    this.cancelled.emit();
  }

  cancelFromBackdrop(event: MouseEvent): void {
    if (event.target === this.dialog?.nativeElement) this.cancelled.emit();
  }

  private syncDialog(): void {
    const element = this.dialog?.nativeElement;
    if (!element) return;

    if (this.open && !element.open) element.showModal();
    if (!this.open && element.open) element.close();
  }
}
