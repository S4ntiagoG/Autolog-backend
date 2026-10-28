import { Component } from '@angular/core';
import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';

import { AutoDismissDirective } from './auto-dismiss.directive';

@Component({
  standalone: true,
  imports: [AutoDismissDirective],
  template: '@if (message) { <p [appAutoDismiss]="message" (appAutoDismissExpired)="message = \'\'">{{ message }}</p> } <span [appAutoDismiss]="\'static\'">Aviso fijo</span>'
})
class AutoDismissHostComponent {
  message = 'Aviso temporal';
}

describe('AutoDismissDirective', () => {
  let fixture: ComponentFixture<AutoDismissHostComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AutoDismissHostComponent]
    }).compileComponents();
    fixture = TestBed.createComponent(AutoDismissHostComponent);
  });

  it('dismisses the message after five seconds', fakeAsync(() => {
    fixture.detectChanges();
    tick(4999);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('p')).not.toBeNull();

    tick(1);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('p')).toBeNull();
  }));

  it('restarts the timeout when the message changes', fakeAsync(() => {
    fixture.detectChanges();
    tick(3000);
    fixture.componentInstance.message = 'Nuevo aviso';
    fixture.detectChanges();

    tick(4999);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('p')?.textContent.trim()).toBe('Nuevo aviso');

    tick(1);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('p')).toBeNull();
  }));

  it('hides messages without a dismissal handler after five seconds', fakeAsync(() => {
    fixture.detectChanges();
    const message = fixture.nativeElement.querySelector('span') as HTMLSpanElement;
    expect(message.hidden).toBeFalse();

    tick(5000);
    fixture.detectChanges();
    expect(message.hidden).toBeTrue();
  }));
});
