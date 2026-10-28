import { Directive, EventEmitter, HostBinding, Input, OnChanges, OnDestroy, Output } from '@angular/core';

@Directive({
  selector: '[appAutoDismiss]',
  standalone: true
})
export class AutoDismissDirective implements OnChanges, OnDestroy {
  @Input() appAutoDismiss = '';
  @Output() appAutoDismissExpired = new EventEmitter<void>();

  @HostBinding('hidden') hidden = false;
  private timeoutId: ReturnType<typeof setTimeout> | null = null;

  ngOnChanges(): void {
    this.clearTimeout();
    this.hidden = false;
    if (this.appAutoDismiss) {
      this.timeoutId = setTimeout(() => {
        this.hidden = true;
        this.appAutoDismissExpired.emit();
        this.timeoutId = null;
      }, 5000);
    }
  }

  ngOnDestroy(): void {
    this.clearTimeout();
  }

  private clearTimeout(): void {
    if (this.timeoutId !== null) {
      clearTimeout(this.timeoutId);
      this.timeoutId = null;
    }
  }
}
