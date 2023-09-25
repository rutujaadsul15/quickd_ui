import {UserDashboardService} from './user-dashboard.service';
import {Component, OnInit} from '@angular/core';
import {Subscription} from 'rxjs/internal/Subscription';

@Component({
  selector: 'app-user-dashboard',
  templateUrl: './user-dashboard.component.html',
  styleUrls: ['./user-dashboard.component.css'],
})
export class UserDashboardComponent implements OnInit {



  //******************************************* SUBMIT DEAL CONFIG *******************************************
  private subscription$: Subscription[] = [];
  public contactNo!: string;
  public createNewDealFlag = true;
  public pickParcelFlag = false;
  public myDealsFlag = false;



  constructor(private userDashboardService: UserDashboardService) {}

  ngOnInit(): void {
    const contactNoFromSession = localStorage.getItem('username');
    if (contactNoFromSession) {
      this.contactNo = contactNoFromSession;
    }
  }









  //******************************************* COMMON CONFIG *******************************************************


  public updateFlag(flag: string) {
    switch (flag) {
      case 'createNewDealFlag':

        this.createNewDealFlag = true;
        this.pickParcelFlag = false;
        this.myDealsFlag = false;
        break;
      case 'pickParcelFlag':

        this.createNewDealFlag = false;
        this.pickParcelFlag = true;
        this.myDealsFlag = false;
        break;
      case 'myDealsFlag':

        this.createNewDealFlag = false;
        this.pickParcelFlag = false;
        this.myDealsFlag = true;
        break;
      default:

        this.createNewDealFlag = true;
        this.pickParcelFlag = false;
        this.myDealsFlag = false;
        break;
    }
  }
}
