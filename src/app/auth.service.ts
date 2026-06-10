import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly authenticated = signal(false);

  get isAuthenticated(): boolean {
    return this.authenticated();
  }

  login(username: string, password: string): boolean {
    const isValid = username === 'user' && password === 'Supera052026';
    this.authenticated.set(isValid);
    return isValid;
  }

  logout(): void {
    this.authenticated.set(false);
  }
}
