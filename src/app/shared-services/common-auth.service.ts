import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class CommonAuthService {
  public userRole$: BehaviorSubject<string> = new BehaviorSubject<string>(
    ''
  );

  constructor() {}

  public updateUserInSession(obj: any) {
    localStorage.setItem('token', obj.accessToken);
    localStorage.setItem('username', obj.username);
    localStorage.setItem('userRole', obj.userRole);
    localStorage.setItem('firstName', obj.firstName);
    localStorage.setItem('lastName', obj.lastName);
    localStorage.setItem('isCarrierKycUploaded', obj.carrierKycUploaded);
    this.updateUserRole(obj.userRole);
  }

  public updateUserRole(userRole: string): void {
    this.userRole$.next(userRole);
  }

  public setUserRoleFromSessionStorage(): void {
    const userRoleFromSessionStorage = localStorage.getItem('userRole');
    if (userRoleFromSessionStorage) {
      this.updateUserRole(userRoleFromSessionStorage);
    }
  }

  public isUserLoggedIn(): boolean {
    if (
      localStorage.getItem('userRole') &&
      localStorage.getItem('username')
    ) {
      const userRoleFromSessionStorage = localStorage.getItem('userRole');
      if (userRoleFromSessionStorage) {
        this.updateUserRole(userRoleFromSessionStorage);
      }
      return true;
    } else {
      return false;
    }
  }

  public getUserRoll(): Observable<string> {
    return this.userRole$;
  }
}
