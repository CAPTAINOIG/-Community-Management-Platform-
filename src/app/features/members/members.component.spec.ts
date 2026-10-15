import { TestBed } from '@angular/core/testing';
import { provideIcons } from '@ng-icons/core';
import { lucideCheck, lucideCircleHelp, lucideDownload, lucideSearch, lucideUsers, lucideX } from '@ng-icons/lucide';
import { provideRouter } from '@angular/router';
import { MembersComponent } from './members.component';

describe('MembersComponent', () => {
  it('searches members by name, email, and phone and applies status filters', async () => {
    localStorage.clear();
    await TestBed.configureTestingModule({
      imports: [MembersComponent],
      providers: [
        provideRouter([]),
        provideIcons({ lucideCheck, lucideCircleHelp, lucideDownload, lucideSearch, lucideUsers, lucideX }),
      ],
    }).compileComponents();

    const fixture = TestBed.createComponent(MembersComponent);
    fixture.detectChanges();
    const component = fixture.componentInstance;

    component.searchTerm.set('amara');
    expect(component.filteredMembers().map((member) => member.id)).toEqual(['m-1001']);
    component.searchTerm.set('daniel.mensah@example.org');
    expect(component.filteredMembers().map((member) => member.id)).toEqual(['m-1002']);
    component.searchTerm.set('900103');
    expect(component.filteredMembers().map((member) => member.id)).toEqual(['m-1003']);

    component.searchTerm.set('');
    component.statusFilter.set('Inactive');
    expect(component.filteredMembers().map((member) => member.id)).toEqual(['m-1007']);
  }, 15000);

  it('paginates the filtered member directory', async () => {
    localStorage.clear();
    await TestBed.configureTestingModule({
      imports: [MembersComponent],
      providers: [
        provideRouter([]),
        provideIcons({ lucideCheck, lucideCircleHelp, lucideDownload, lucideSearch, lucideUsers, lucideX }),
      ],
    }).compileComponents();

    const fixture = TestBed.createComponent(MembersComponent);
    fixture.detectChanges();
    const component = fixture.componentInstance;

    expect(component.pageCount()).toBe(2);
    expect(component.visibleMembers()).toHaveLength(8);
    component.changePage(2);
    expect(component.visibleMembers()).toHaveLength(4);
  }, 15000);
});
