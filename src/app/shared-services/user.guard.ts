import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree, Router } from '@angular/router';
import { CanActivate } from '@angular/router';
import { CommonAuthService } from './common-auth.service';
import { UserRoles } from '../app.constant';

@Injectable({
  providedIn: 'root'
})
export class UserGurad implements CanActivate {
  userRole: string | undefined;
  constructor(private authService: CommonAuthService, private router: Router) {

  }
/*  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean | UrlTree | import("rxjs").Observable<boolean | UrlTree> | Promise<boolean | UrlTree> {
    if (this.authService.isUserLoggedIn()) {
      this.authService.userRole$.subscribe(role => {
        this.userRole = role;
      });

      if (state.url.includes('dashboard')) {
        return this.userRole === UserRoles.USER;
      }
      else {
        return false;
      }
    } else {
      this.router.navigate(['login']);
      return false;
    }
  }*/

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean | UrlTree | import("rxjs").Observable<boolean | UrlTree> | Promise<boolean | UrlTree> {
    if (this.authService.isUserLoggedIn()) {
      this.authService.userRole$.subscribe(role => {
        this.userRole = role;
      });

     /* if (state.url.includes('dashboard/checkoutstatus')) {
        // Allow access to checkoutstatus route
        return true;
      } else*/ if (state.url.includes('dashboard')) {
        // Enforce guard's behavior for other dashboard routes
        return this.userRole === UserRoles.USER;
      } else {
        // Non-dashboard routes can proceed without guard
        return true;
      }
    } else {
      this.router.navigate(['login']);
      return false;
    }
  }
}
