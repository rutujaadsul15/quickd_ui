import {Component, OnInit} from '@angular/core';
import {CommonAuthService} from "../shared-services/common-auth.service";

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {

  constructor(private commonAuthService: CommonAuthService) {
  }

  ngOnInit(): void {
  }

  getSendParcelLink(): string {
    if (this.commonAuthService.isUserLoggedIn()) {
      return '/dashboard';
    } else {
      return '/login';
    }
  }

  getPickNewParcelLink(): string {
    if (this.commonAuthService.isUserLoggedIn()) {
      return '/dashboard/searchdeals';
    } else {
      return '/login';
    }
  }

}
