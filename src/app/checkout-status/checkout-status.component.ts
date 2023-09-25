import {Component, OnInit} from '@angular/core';
import {CommonRestService} from 'src/app/shared-services/common-rest.service';
import {NgxSpinnerService} from 'ngx-spinner';
import {Subscription} from "rxjs";
import {PhonePeTransactionStatusResponse} from "../models/PhonePeTransactionStatusResponse";
import {ActivatedRoute, Router} from "@angular/router";

declare var Razorpay: any;

@Component({
  selector: 'app-checkout-status',
  templateUrl: './checkout-status.component.html',
  styleUrls: ['./checkout-status.component.css'],
})
export class CheckoutStatusComponent implements OnInit {
  private subscriptions$: Subscription[] = [];
  public phonePeTransactionStatusResponse!: PhonePeTransactionStatusResponse;
  public merchantTransactionId!: string;

  constructor(
    private commonRestService: CommonRestService,
    private spinnerService: NgxSpinnerService,
    private route: ActivatedRoute,
    private router: Router
  ) {
  }

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.merchantTransactionId = params['merchantTransactionId'];
      console.log('merchantTransactionId:', this.merchantTransactionId);
    });

    this.checkPaymentStatus(this.merchantTransactionId);
  }

  public ngOnDestroy(): void {
    this.subscriptions$.map(sub => sub && sub.unsubscribe());
  }


  public checkPaymentStatus(merchantTransactionId: string): void {
    this.spinnerService.show();
    //const merchantTransactionId = localStorage.getItem('merchantTransactionId')
    const phonePayStatus$ = this.commonRestService.checkPaymentStatus(merchantTransactionId).subscribe(
      (statusResponse: any) => {
        this.phonePeTransactionStatusResponse = statusResponse;
        this.spinnerService.hide();
        console.log("STATUS RESPONSE  : " + statusResponse);
      },
      (err: any) => {
        this.spinnerService.hide();
        console.log('Something went wrong while checking payment status :', err);
      }
    );
    this.subscriptions$.push(phonePayStatus$);
  }

  public goToMyBookings() {
    this.router.navigate(['/dashboard/mysubmittedparcels']);
  }

  public goToSendNewParcel() {
    this.router.navigate(['/dashboard/submitdeal']);
  }
}
