import { Component, inject } from '@angular/core';
import { NgIcon } from '@ng-icons/core';
import { ToastService } from '../../core/services/toast.service';

@Component({
  selector: 'app-toast-stack',
  imports: [NgIcon],
  templateUrl: './toast-stack.component.html',
  styleUrl: './toast-stack.component.scss',
})
export class ToastStackComponent {
  readonly toastService = inject(ToastService);

  iconFor(kind: 'success' | 'error' | 'info'): string {
    if (kind === 'success') return 'lucideCheck';
    if (kind === 'error') return 'lucideX';
    return 'lucideCircleHelp';
  }
}
