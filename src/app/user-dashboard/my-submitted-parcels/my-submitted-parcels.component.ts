import {Component, OnInit} from '@angular/core';
import {Router} from '@angular/router';
import {NgxSpinnerService} from 'ngx-spinner';
import {Subscription} from 'rxjs';
import {Deal} from 'src/app/models/Deal';
import {DealResponse} from 'src/app/models/DealResponse';
import Swal from 'sweetalert2';
import {UserDashboardService} from '../user-dashboard.service';
import {DatePipe} from "@angular/common";

@Component({
  selector: 'app-my-deals',
  templateUrl: './my-submitted-parcels.component.html',
  styleUrls: ['./my-submitted-parcels.component.css'],
})
export class MySubmittedParcelsComponent implements OnInit {
  public config_for_selfDeals: any;
  public dealResponse: DealResponse = new DealResponse();
  public dealStatusMapForCreatedDeals = new Map<string, string>([
    ['PENDING_FOR_CARRIER_ACCEPTANCE', 'WAITING FOR PICKUP'],
    ['PENDING_FOR_SENDER_CONFIRMATION', 'WAITING FOR HANDOVER PARCEL & LOCK'],
    ['LOCKED_BY_SENDER', 'LOCKED & CONFIRMED'],
    ['DELIVERED', 'DELIVERED'],
    ['CANCELLED_BY_SENDER', 'CANCELLED BY YOU'],
    ['CANCELLED_BY_CARRIER', 'CANCELLED BY CARRIER'],
  ]);
  key: string = 'id';
  reverse: boolean = true;
  private subscriptions$: Subscription[] = [];

  //public deal: Deal = new Deal();
  constructor(private userDashboardService: UserDashboardService,
              private spinnerService: NgxSpinnerService,
              private router: Router,
              private datePipe: DatePipe) {
    this.config_for_selfDeals = {
      itemsPerPage: 10,
      currentPage: 1,
      totalItems: this.dealResponse.selfCreatedDealList?.length || 0,
    };
  }

  ngOnInit(): void {
    this.getSubmittedDealsByContactNumber();
  }


  public pageChangedForSelfDeals(event: any) {
    this.config_for_selfDeals.currentPage = event;
  }

  public viewDealDetails(deal: Deal) {
    // @ts-ignore
    Swal.fire({
      title: '<span class="my-custom-title">Order Details</span>',
      html: `
    <div class="shipment-details">
      <h6>Deal Id</h6>
      <p>${deal.dealId}</p>

      <h6>Receiver Details</h6>
      <p><strong>Name:</strong> ${deal.receiver.receiverFirstName} ${deal.receiver.receiverLastName}</p>
      <p><strong>Phone:</strong> ${deal.receiver.receiverContactNo}</p>

      <h6>Pickup Location</h6>
      <p>${deal.pickUpLocation.addressLine} ${deal.pickUpLocation.city} ${deal.pickUpLocation.state} ${deal.pickUpLocation.pinCode}</p>

      <h6>Drop Location</h6>
      <p>${deal.dropLocation.addressLine} ${deal.dropLocation.city} ${deal.dropLocation.state} ${deal.dropLocation.pinCode}</p>

      <h6>Amount Paid</h6>
      <p>${deal.dealTotal} Rs</p>
      <div class="mb-2">
        <button id="parcelDetailsButton" class="btn btn-primary ">View Parcel Details</button>
        <button id="invoiceButton" class="btn btn-primary">Download Invoice</button>
      </div>
      <button id="paymentButton" class="btn btn-primary ">View Payment Details</button>
    </div>
  `,
      /* icon: 'info',*/
      showCloseButton: true,
      confirmButtonText: 'OK',
      customClass: {
        title: 'my-custom-title-class',
        content: 'my-custom-content-class',
        confirmButton: 'my-custom-button-class',
        popup: 'my-custom-popup-class'
      },
      didOpen: () => {
        const paymentButton = document.getElementById('paymentButton');
        // @ts-ignore
        paymentButton.addEventListener('click', () => {
          // Display the payment details pop-up
          this.spinnerService.show();
          const getDealsPaymentInfoSub$ = this.userDashboardService
            .getDealPaymentInfo(deal.dealId)
            .subscribe(
              (resp) => {
                resp.createdDate = this.datePipe.transform(resp.createdDate, 'dd-MMM-yyyy');
                resp.updatedDate = this.datePipe.transform(resp.updatedDate, 'dd-MMM-yyyy');
                this.spinnerService.hide();
                // @ts-ignore
                Swal.fire({
                  title: '<span class="my-custom-title">Payment Details</span>',
                  html: `
                    <div>
                      <h6>Deal Id</h6>
                      <p>${resp.dealId}</p>

                      <h6>Order Id</h6>
                      <p>${resp.orderId}</p>

                      <h6>Transaction Id</h6>
                      <p>${resp.transactionId}</p>

                      <h6>Order Amount</h6>
                      <p>Rs. ${resp.amount}</p>

                      <h6>Payment Status</h6>
                      <p>${resp.paymentStatus}</p>

                      <h6>Payment Date</h6>
                      <p>${resp.createdDate}</p>
                    </div>
                 `,
                  /*icon: 'info',*/
                  showCloseButton: true,
                  confirmButtonText: 'OK',
                  customClass: {
                    title: 'my-custom-title-class',
                    content: 'my-custom-content-class',
                    confirmButton: 'my-custom-button-class',
                    popup: 'my-custom-popup-class'
                  }
                });
              },
              (err) => {
                console.log('Error while fetching for the deal payment info');
                this.spinnerService.hide();
              }
            );

        });
        const parcelDetailsButton = document.getElementById('parcelDetailsButton');
        // @ts-ignore
        parcelDetailsButton.addEventListener('click', () => {
          // Display the payment details pop-up
          this.spinnerService.hide();
          // @ts-ignore
          Swal.fire({
            title: '<span class="my-custom-title">Parcel Details</span>',
            html: `
                    <div>
                      <h6>Parcel Weight</h6>
                      <p>${deal.parcel.parcelWeight}</p>

                      <h6>Parcel Length</h6>
                      <p>${deal.parcel.parcelLength}</p>

                      <h6>Parcel Height</h6>
                      <p>${deal.parcel.parcelHeight}</p>

                      <h6>Special Instructions</h6>
                      <p>${deal.parcel.specialInstruction}</p>

                      <h6>Parcel Status</h6>
                      <p>${deal.parcel.parcelStatus}</p>
                    </div>
                 `,
            /*icon: 'info',*/
            showCloseButton: true,
            confirmButtonText: 'OK',
            customClass: {
              title: 'my-custom-title-class',
              content: 'my-custom-content-class',
              confirmButton: 'my-custom-button-class',
              popup: 'my-custom-popup-class'
            }
          });
        });

        const downloadInvoiceButton = document.getElementById('invoiceButton');
        // @ts-ignore
        downloadInvoiceButton.addEventListener('click', () => {
          // Display the payment details pop-up
          this.spinnerService.show();
          // @ts-ignore
          const downloadPaymentInvoiceSub$ = this.userDashboardService
            .downloadPaymentInvoice(deal.dealId)
            .subscribe(
              (resp) => {
                console.log('Invoice downloaded');
                const blob = new Blob([resp], {type: 'application/pdf'});
                const pdfUrl = URL.createObjectURL(blob);
                this.spinnerService.hide();
                window.open(pdfUrl, '_blank');
              },
              (err) => {
                Swal.fire("Something went wrong while downloading invoice.", "Please try again after sometime", "error");
                this.spinnerService.hide();
              }
            );
          this.subscriptions$.push(downloadPaymentInvoiceSub$);
        });
      }
    });
  }

  public sort(key: string) {
    this.key = key;
    this.reverse = !this.reverse;
  }

  public getSubmittedDealsByContactNumber() {
    this.spinnerService.show();
    const contactNumber = localStorage!.getItem('username');
    const getDealsSub$ = this.userDashboardService
      .getSubmittedDealsByContactNumber(contactNumber)
      .subscribe(
        (resp) => {
          this.spinnerService.hide();
          this.dealResponse = resp;
        },
        (err) => {
          console.log('Error while fetching for the deals');
          this.spinnerService.hide();
        }
      );
    this.subscriptions$.push(getDealsSub$);
  }

  public confirmAndLockDeal(deal: Deal) {
    Swal.fire({
      title: 'Have you handed over your parcel to carrier?',
      text: "You will not able to cancel this order once you confirmed it.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, Confirm & Lock!',
    }).then((result) => {
      if (result.isConfirmed) {
        this.spinnerService.show();
        const updateParcelStatusSub$ = this.userDashboardService
          .updateParcelStatus(deal.dealId, 'LOCKED_BY_SENDER')
          .subscribe(
            (resp) => {
              this.spinnerService.hide();
              Swal.fire(
                'Deal has been confirmed & locked. Your Parcel is on the way!',
                '',
                'success'
              ).then(() => {
                deal.parcel.parcelStatus = 'LOCKED_BY_SENDER';
              });
            },
            (err) => {
              this.spinnerService.hide();
              Swal.fire(
                'Something went wrong while confirming deal',
                'Please try again in sometime',
                'error'
              ).then(() => {
                return
              });
            }
          );
        this.subscriptions$.push(updateParcelStatusSub$);
      }
    });
  }

  public cancelDeal(deal: Deal) {
    Swal.fire({
      title: 'Are you sure, you want to cancel this deal?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, Cancel it!',
    }).then((result) => {
      if (result.isConfirmed) {
        this.spinnerService.show();
        const cancelParcelStatusSub$ = this.userDashboardService
          .updateParcelStatus(deal.dealId, 'CANCELLED_BY_SENDER')
          .subscribe(
            (resp) => {
              this.spinnerService.hide();
              Swal.fire(
                'Deleted!',
                'Your deal has been cancelled.',
                'success'
              ).then(() => {
                deal.parcel.parcelStatus = 'CANCELLED_BY_SENDER';
              });
            },
            (err) => {
              this.spinnerService.hide();
              Swal.fire(
                'Something went wrong while cancelling deal',
                'Please try again in sometime',
                'error'
              ).then(() => {
                return
              });
            }
          );
        this.subscriptions$.push(cancelParcelStatusSub$);
      }
    });
  }

  public verifyOTPAndCompleteDeal(deal: Deal) {
    Swal.fire({
      title: 'Please enter OTP sent to receiver',
      input: 'text',
      inputAttributes: {
        autocapitalize: 'off',
      },
      showCancelButton: true,
      confirmButtonText: 'SUBMIT',
      showLoaderOnConfirm: true,
      preConfirm: (otp) => {
        this.spinnerService.show();
        return this.userDashboardService
          .verifyOTPAndCompleteDeal(otp, deal.dealId)
          .subscribe(
            (resp) => {
              if (resp != true) {
                throw new Error(resp.statusText);
              } else {
                Swal.fire(
                  'Delivered!',
                  'Parcel delivered successfully.',
                  'success'
                ).then(() => {
                  deal.parcel.parcelStatus = 'DELIVERED';
                });
              }
              this.spinnerService.hide();
            },
            (err) => {
              Swal.fire(
                'Incorrect OTP!',
                'Please try again after sometime.',
                'error'
              );
              this.spinnerService.hide();
            }
          );
      },
      allowOutsideClick: () => !Swal.isLoading(),
    });
  }

  public refresh() {
    this.getSubmittedDealsByContactNumber();
  }

  ngOnDestroy(): void {
    this.subscriptions$.map((sub) => sub && sub.unsubscribe());
  }
}
