import {Component, OnInit} from '@angular/core';
import {CommonAuthService} from '../shared-services/common-auth.service';
import {Router} from '@angular/router';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {

  public firstName: any;
  public lastName: any;

  constructor(private router: Router, private commonAuthService: CommonAuthService) {
  }


  ngOnInit(): void {
  }

  public validLogin() {
    if ((localStorage.getItem('userRole')) && (localStorage.getItem('username'))) {
      this.firstName = localStorage.getItem('firstName');
      return true;
    } else {
      return false;
    }
  }


  public logout() {
    localStorage.clear();
    this.commonAuthService.updateUserRole(''); //making user roll to known while logging out
    this.router.navigate([''])
  }

}
