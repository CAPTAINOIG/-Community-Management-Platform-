import { TestBed } from '@angular/core/testing';
import { provideIcons } from '@ng-icons/core';
import { lucideCheck, lucideX } from '@ng-icons/lucide';
import { EventFormDialogComponent } from './event-form-dialog.component';

describe('EventFormDialogComponent', () => {
  it('blocks invalid details and end times before the start', async () => {
    await TestBed.configureTestingModule({
      imports: [EventFormDialogComponent],
      providers: [provideIcons({ lucideCheck, lucideX })],
    }).compileComponents();

    const fixture = TestBed.createComponent(EventFormDialogComponent);
    fixture.detectChanges();
    const component = fixture.componentInstance;

    component.form.setValue({
      title: 'Workshop',
      description: 'Community skills session',
      venue: 'Eastside Hall',
      startsAt: '2026-10-20T12:00',
      endsAt: '2026-10-20T11:00',
      capacity: 20,
    });
    component.submit();

    expect(component.form.invalid).toBe(true);
    expect(component.form.hasError('endsBeforeStart')).toBe(true);
  }, 15000);
});
