import { Injectable, signal } from '@angular/core';

const ORDER_AVAILABILITY_STORAGE_KEY = 'supera-order-acceptance-enabled';

@Injectable({ providedIn: 'root' })
export class OrderAvailabilityService {
  readonly enabled = signal<boolean>(this.loadInitialValue());

  constructor() {
    if (typeof window !== 'undefined') {
      window.addEventListener('storage', this.onStorageChange.bind(this));
    }
  }

  setEnabled(value: boolean): void {
    this.enabled.set(value);
    this.saveValue(value);
  }

  toggle(): void {
    this.setEnabled(!this.enabled());
  }

  private loadInitialValue(): boolean {
    if (typeof window === 'undefined') {
      return true;
    }

    const stored = localStorage.getItem(ORDER_AVAILABILITY_STORAGE_KEY);
    return stored === null ? true : stored === 'true';
  }

  private saveValue(value: boolean): void {
    if (typeof window === 'undefined') {
      return;
    }
    localStorage.setItem(ORDER_AVAILABILITY_STORAGE_KEY, String(value));
  }

  private onStorageChange(event: StorageEvent): void {
    if (event.key !== ORDER_AVAILABILITY_STORAGE_KEY) {
      return;
    }
    this.enabled.set(event.newValue === 'true');
  }
}
