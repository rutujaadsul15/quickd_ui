import {Component, OnInit} from '@angular/core';
import {Router} from '@angular/router';

@Component({
  selector: 'app-user-nav',
  templateUrl: './user-nav.component.html',
  styleUrls: ['./user-nav.component.css']
})
export class UserNavComponent implements OnInit {
  public isNavbarCollapsed = true;

  constructor(private router: Router) { }

  ngOnInit(): void {
  }

  public toggleNavbar(): void {
    this.isNavbarCollapsed = !this.isNavbarCollapsed;
  }


  public updateActiveClass() {
    let links = document.querySelectorAll('a');
    links.forEach((link) => {
      link.addEventListener('click', function () {
        links.forEach((linkd) => linkd.classList.remove('active'));
        this.classList.add('active');
      });
    });
  }


  public isCurrentRoute(route: string) {
    return this.router.url === route;

  }

  public isDefaultRoute(): boolean {
    // Replace '/dashboard/submitdeal' with your default route
    return this.router.url === '/dashboard';
  }


}
