import { TestBed } from '@angular/core/testing';
import { provideIcons } from '@ng-icons/core';
import { lucideCheck, lucideX } from '@ng-icons/lucide';
import { MemberFormDialogComponent } from './member-form-dialog.component';

describe('MemberFormDialogComponent', () => {
  const providers = [provideIcons({ lucideCheck, lucideX })];

  it('requires valid contact and membership details before saving', async () => {
    await TestBed.configureTestingModule({
      imports: [MemberFormDialogComponent],
      providers,
    }).compileComponents();

    const fixture = TestBed.createComponent(MemberFormDialogComponent);
    fixture.detectChanges();
    const component = fixture.componentInstance;
    let saved = false;
    component.saved.subscribe(() => saved = true);

    component.submit();
    expect(component.form.invalid).toBe(true);
    expect(component.form.controls.fullName.touched).toBe(true);
    expect(saved).toBe(false);
  }, 15000);

  it('emits a normalized member draft when the form is valid', async () => {
    await TestBed.configureTestingModule({
      imports: [MemberFormDialogComponent],
      providers,
    }).compileComponents();

    const fixture = TestBed.createComponent(MemberFormDialogComponent);
    fixture.detectChanges();
    const component = fixture.componentInstance;
    let savedName = '';
    let savedSkills: string[] = [];
    component.saved.subscribe((member) => {
      savedName = member.fullName;
      savedSkills = member.skills;
    });

    component.form.setValue({
      fullName: '  Amina Shah  ',
      email: 'amina@example.org',
      phone: '+44 7700 900220',
      address: '2 Harbour Road, Bristol',
      group: 'Eastside Neighbours',
      status: 'Active',
      skills: ' First aid, Mentoring ',
      interests: ' Wellbeing ',
    });
    component.submit();

    expect(savedName).toBe('Amina Shah');
    expect(savedSkills).toEqual(['First aid', 'Mentoring']);
  }, 15000);
});
