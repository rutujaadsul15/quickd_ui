import {Deal} from 'src/app/models/Deal';
import {ChangeDetectorRef, Component, EventEmitter, HostListener, Input, OnInit, Output} from '@angular/core';
import {CommonRestService} from 'src/app/shared-services/common-rest.service';
import {NgxSpinnerService} from 'ngx-spinner';
import {HttpClient} from '@angular/common/http';
import {OrderForCashfree} from 'src/app/models/OrderForCashfree';
import {Router} from '@angular/router';
import {UserDashboardService} from '../user-dashboard.service';
import {RazorPayPaymentOrderDetails} from 'src/app/models/RazorPayPaymentOrderDetails';
import {PaytmOrderResponse} from "../../models/PaytmOrderResponse";
import Swal from "sweetalert2";
import {Subscription} from "rxjs";
import {PhonePeTransactionStatusResponse} from "../../models/PhonePeTransactionStatusResponse";

declare var Razorpay: any;

@Component({
  selector: 'app-checkout-deal',
  templateUrl: './checkout-deal.component.html',
  styleUrls: ['./checkout-deal.component.css'],
})
export class CheckoutDealComponent implements OnInit {
  @Input()
  public deal!: Deal;
  @Output() navigateToParent: EventEmitter<any> = new EventEmitter<any>();
  public paymentId!: string;
  public error!: string;
  public paymentSuccessFlag: Boolean = false;
  public paymentDetails: any;
  public upiId!: string;
  public payByUpiFlag: Boolean = false;
  public paytmOrderResponse !: PaytmOrderResponse;
  private subscriptions$: Subscription[] = [];
  public phonePeTransactionStatusResponse!: PhonePeTransactionStatusResponse;
  public options = {
    key: '',
    amount: '',
    name: 'PICKMYPARCEL.IN',
    description: 'Platform to deliver your parcel quickly',
    image:
      'https://www.javachinna.com/wp-content/uploads/2020/02/android-chrome-512x512-1.png',
    order_id: '',
    handler: function (response: any) {
      var event = new CustomEvent('payment.success', {
        detail: response,
        bubbles: true,
        cancelable: true,
      });
      window.dispatchEvent(event);
    },
    prefill: {
      name: '',
      email: '',
      contact: '',
    },
    notes: {
      address: '',
    },
    theme: {
      color: '#3399cc',
    },
  };

  constructor(
    private commonRestService: CommonRestService,
    private userDashboardService: UserDashboardService,
    private spinnerService: NgxSpinnerService,
    private http: HttpClient,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {
    this.paymentSuccessFlag = false;
  }

  ngOnInit(): void {
    this.paymentSuccessFlag = false;
    console.log('deal deatils' + this.deal);
  }

  public ngOnDestroy(): void {
    this.subscriptions$.map(sub => sub && sub.unsubscribe());
  }

  public payUsingUPI(): void {
    this.spinnerService.show();
    console.log(this.upiId);
    this.paymentId = '';
    this.error = '';
    const paymentSub$ = this.commonRestService.createOrderForPaytm(this.deal, this.upiId).subscribe(
      (resp: PaytmOrderResponse) => {
        this.spinnerService.hide();
        if (resp.resultStatus === 'TXN_SUCCESS') {
          this.paytmOrderResponse = resp;
          Swal.fire('Your order has been successfully placed', '', 'success').then((result) => {
            if (result.isConfirmed || result.isDismissed || result.isDenied) {
              this.paymentSuccessFlag = true;
            }
          });
        } else {
          if (resp.message != '' || resp.message != null) {
            Swal.fire(resp.message, '', 'error').then((result) => {
            });
          } else {
            Swal.fire('Something went wrong while processing payment. Please try again after sometime', '', 'error').then((result) => {
            });
          }
        }
      },
      (err) => {
        this.spinnerService.hide();
        Swal.fire('Something went wrong while processing payment. Please try again after sometime', '', 'error').then((result) => {
        });
        this.error = err.error.message;
      }
    );
    this.subscriptions$.push(paymentSub$);
  }

  public payUsingPhonePay(): void {
    this.spinnerService.show();
    const phonePaySub$ = this.commonRestService.initiatePhonePayPayment(this.deal).subscribe(
      (resp: any) => {
        if (resp.data) {
          //localStorage.setItem('merchantTransactionId', resp.data.merchantTransactionId);
          window.location.href = resp.data.instrumentResponse.redirectInfo.url;
          console.log("this is after redirection");
          /* this.commonRestService.checkPaymentStatus(resp.data.merchantTransactionId).subscribe(
             (statusResponse: any) => {
               this.paymentSuccessFlag = true;
             }, (statusResponseErr: any) => {
               console.log("Something went wrong while checking payment status");
             }
           )*/
        } else {
          console.log('Failed to initiate payment');
        }
      },
      (err: any) => {
        console.log('Error initiating payment:', err);
      }
    );
    this.subscriptions$.push(phonePaySub$);
  }

  /* public redirectToPaymentPage(redirectUrl: string): void {
     window.location.href = redirectUrl;
     // Once redirected, initiate the status check after a short delay (e.g., 2 seconds)
     setTimeout(() => {
       const merchantTransactionId = sessionStorage.getItem('merchantTransactionId');
       if (merchantTransactionId) {
         this.commonRestService.checkPaymentStatus(merchantTransactionId).subscribe(
           (resp: PhonePeTransactionStatusResponse) => {
             this.phonePeTransactionStatusResponse = resp;
             this.paymentSuccessFlag = true;
             console.log('PhonePeTransactionStatusResponse : ' + this.phonePeTransactionStatusResponse);
           },
           (statusResponseErr: any) => {
             console.log('Something went wrong while checking payment status');
           }
         );
       } else {
         console.log('Merchant transaction ID not found.');
       }
     }, 2000);// Adjust the delay as needed
  } */


  public togglePayBuUpiFlag() {
    this.payByUpiFlag = !this.payByUpiFlag;
  }

  @HostListener('window:payment.success', ['$event'])
  onPaymentSuccess(event: any): void {
    this.paymentSuccessFlag = true;
    console.log('payment done');
    this.paymentDetails = event.detail;
    var razorPayPaymentOrderDetails = new RazorPayPaymentOrderDetails();
    razorPayPaymentOrderDetails.dealId = this.deal.dealId;
    razorPayPaymentOrderDetails.razorpay_payment_id = this.paymentDetails.razorpay_payment_id;
    razorPayPaymentOrderDetails.razorpay_order_id = this.paymentDetails.razorpay_order_id;
    razorPayPaymentOrderDetails.paymentStatus = 'PAID'; // UPDATE STATUS FROM PAYMENT_INITIATED TO PAID
    this.userDashboardService.updateDealPaymentStatus(razorPayPaymentOrderDetails).subscribe(
      (data) => {
        if (data == true) {
          console.log('Deal payment status updated successfully with status : ' + data.status);
        } else {
          console.error('Deal payment status update failed with status : ' + data.status);
        }
      },
      (err) => {
        console.error('Deal payment status update failed');
      }
    )
  }

  public loadSubmitDealComponent() {
    this.navigateToParent.emit();
  }

  public payUsingCashfree(): void {
    var order = new OrderForCashfree();
    if (this.deal.sender.senderFirstName && this.deal.sender.senderLastName && this.deal.sender.senderContactNo && this.deal.dealTotal) {
      order.customerName = this.deal.sender.senderFirstName + ' ' + this.deal.sender.senderLastName;
      order.customerPhone = this.deal.sender.senderContactNo;
      order.orderAmount = this.deal.dealTotal;
      order.returnUrl = "localhost:8008/payment/handlePaymentResponse";
    }
    this.commonRestService.createOrderForCashfree(order).subscribe(
      (data) => {
        console.log(data);
        if ((data = null && data.paymentLink != null)) {
          this.router.navigate([data.paymentLink]);
        }
      },
      (err) => {
        console.log(err.error.message);
      }
    );
  }

  public payUsingRazorpay(): void {
    this.paymentId = '';
    this.error = '';

    this.commonRestService.createOrderForRazorpay(this.deal).subscribe(
      (data) => {
        this.options.key = data.secretId;
        this.options.order_id = data.razorpayOrderId;
        this.options.amount = data.applicationFee; //paise
        this.options.prefill.name = 'PICKMYPARCEL.IN';
        this.options.prefill.email = 'vishalrajapure@gmail.com';
        this.options.prefill.contact = '9960743366';
        this.deal.dealId = data.dealId;

        if (data.pgName === 'razor2') {
          this.options.image = '';
          var rzp1 = new Razorpay(this.options);
          rzp1.open();
        } else {
          var rzp2 = new Razorpay(this.options);
          rzp2.open();
        }

        rzp1.on('payment.failed', (response: any) => {
          // Todo - store this information in the server
          console.log(response);
          console.log(response.error.code);
          console.log(response.error.description);
          console.log(response.error.source);
          console.log(response.error.step);
          console.log(response.error.reason);
          console.log(response.error.metadata.order_id);
          console.log(response.error.metadata.payment_id);
          this.error = response.error.reason;
        });
      },
      (err) => {
        this.error = err.error.message;
      }
    );
  }


}
