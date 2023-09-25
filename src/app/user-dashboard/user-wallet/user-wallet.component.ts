import {Deal} from 'src/app/models/Deal';
import {Component, Input, OnInit} from '@angular/core';
import {CommonRestService} from 'src/app/shared-services/common-rest.service';
import {HttpClient} from '@angular/common/http';
import {Router} from '@angular/router';
import {UserDashboardService} from '../user-dashboard.service';
import {PaytmOrderResponse} from "../../models/PaytmOrderResponse";
import {Wallet} from "../../models/Wallet";
import {NgxSpinnerService} from "ngx-spinner";

declare var Razorpay: any;

@Component({
  selector: 'app-user-wallet',
  templateUrl: './user-wallet.component.html',
  styleUrls: ['./user-wallet.component.css'],
})
export class UserWalletComponent implements OnInit {
  @Input()
  public deal!: Deal;
  public paymentId!: string;
  public error!: string;
  //public depositAmount!: string;
  public paymentSuccessFlag: Boolean = false;
  public paymentDetails: any;
  //public upiId!: string;
  public depositFlag: Boolean = false;
  public paytmOrderResponse !: PaytmOrderResponse;
  public walletResponse !: Wallet;
  public userContactNumber: string = '';
  public firstName: string = '';
  public lastName: string = '';

  constructor(
    private commonRestService: CommonRestService,
    private userDashboardService: UserDashboardService,
    private spinnerService: NgxSpinnerService,
    private http: HttpClient,
    private router: Router
  ) {
  }

  ngOnInit(): void {
    this.fetchWalletDetails();
  }

  public fetchWalletDetails() {
    if (localStorage.getItem('username')) {
      // @ts-ignore
      this.userContactNumber = localStorage.getItem('username');
      // @ts-ignore
      this.firstName = localStorage.getItem('firstName');
      // @ts-ignore
      this.lastName = localStorage.getItem('lastName');
      this.userDashboardService.getUserWalletDetails(this.userContactNumber).subscribe(
        (resp: Wallet) => {
          if (resp.userContactNumber != null && resp.walletBalance != null) {
            this.walletResponse = resp;
          }
        }, (err) => {
          console.log("Error while fetching wallet details")
        }
      )
    } else {
      console.log("Error while fetching wallet details");
    }
  }


  public toggleDepositFlag() {
    this.depositFlag = !this.depositFlag;
  }

  showDeposit: boolean = false;
  showWithdraw: boolean = false;
  depositAmount: number = 0;
  depositUpiId: string = '';
  withdrawAmount: number = 0;
  withdrawUpiId: string = '';

  public openDeposit() {
    this.showDeposit = true;
    this.showWithdraw = false;
  }

  public openWithdraw() {
    this.showDeposit = false;
    this.showWithdraw = true;
  }


  public submitDeposit() {
    // Handle deposit submission logic here
    console.log('Deposit Amount:', this.depositAmount);
    console.log('UPI to be deposited:', this.depositUpiId);
    // Perform necessary actions such as API calls, validation, etc.
  }

  public submitWithdraw() {
    // Handle withdraw submission logic here
    console.log('Withdraw Amount:', this.withdrawAmount);
    console.log('UPI from withdraw:', this.withdrawUpiId);
    // Perform necessary actions such as API calls, validation, etc.
  }

}
