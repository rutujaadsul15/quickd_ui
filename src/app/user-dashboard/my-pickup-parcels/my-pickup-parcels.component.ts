import {Component, OnInit} from '@angular/core';
import {DealResponse} from "../../models/DealResponse";
import {Subscription} from "rxjs";
import {UserDashboardService} from "../user-dashboard.service";
import {NgxSpinnerService} from "ngx-spinner";
import {Router} from "@angular/router";
import {Deal} from "../../models/Deal";
import Swal from "sweetalert2";

@Component({
  selector: 'app-my-pickup-parcels',
  templateUrl: './my-pickup-parcels.component.html',
  styleUrls: ['./my-pickup-parcels.component.css']
})
export class MyPickupParcelsComponent implements OnInit {
  public config_for_pickupDeals: any;
  public dealResponse: DealResponse = new DealResponse();
  public dealStatusMapForPickUpDeals = new Map<string, string>([
    ['PENDING_FOR_CARRIER_ACCEPTANCE', 'WAITING FOR YOUR PICKUP'],
    ['PENDING_FOR_SENDER_CONFIRMATION', 'WAITING FOR SENDER CONFIRMATION'],
    ['LOCKED_BY_SENDER', 'LOCKED & CONFIRMED BY SENDER'],
    ['DELIVERED', 'DELIVERED'],
    ['CANCELLED_BY_SENDER', 'CANCELLED BY SENDER'],
    ['CANCELLED_BY_CARRIER', 'CANCELLED BY YOU'],
  ]);
  key: string = 'id';
  reverse: boolean = true;
  private subscriptions$: Subscription[] = [];
  constructor(private userDashboardService: UserDashboardService, private spinnerService: NgxSpinnerService, private router: Router) {
    this.config_for_pickupDeals = {
      itemsPerPage: 10,
      currentPage: 1,
      totalItems: this.dealResponse.pickUpDealList?.length || 0,
    };
  }

  ngOnInit(): void {
    this.getPickupDealsByContactNumber();
  }

  ngOnDestroy(): void {
    this.subscriptions$.map((sub) => sub && sub.unsubscribe());
  }


  public pageChangedForPickupDeals(event: any) {
    this.config_for_pickupDeals.currentPage = event;
  }

  public sort(key: string) {
    this.key = key;
    this.reverse = !this.reverse;
  }

  public getPickupDealsByContactNumber() {
    this.spinnerService.show();
    const contactNumber = localStorage!.getItem('username');
    const getDealsSub$ = this.userDashboardService
      .getPickupDealsByContactNumber(contactNumber)
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

  public acceptDeal(deal: Deal) {
    Swal.fire({
      title: 'Are you sure, you want to accept this deal?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, Accept it!',
    }).then((result) => {
      if (result.isConfirmed) {
        const updateParcelStatusSub$ = this.userDashboardService
          .updateParcelStatus(deal.dealId, 'PENDING_FOR_SENDER_CONFIRMATION')
          .subscribe(
            (resp) => {
              this.spinnerService.hide();
              Swal.fire(
                'Deal has been accepted. Please reach out to sender & collect the parcel',
                '',
                'success'
              ).then(() => {
                deal.parcel.parcelStatus = 'PENDING_FOR_SENDER_CONFIRMATION';
              });
            },
            (err) => {
              this.spinnerService.hide();
              Swal.fire(
                'Something went wrong while accepting deal',
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
        const cancelParcelStatusSub$ = this.userDashboardService
          .updateParcelStatus(deal.dealId, 'CANCELLED_BY_CARRIER')
          .subscribe(
            (resp) => {
              this.spinnerService.hide();
              Swal.fire(
                'Deleted!',
                'Your deal has been cancelled.',
                'success'
              ).then(() => {
                deal.parcel.parcelStatus = 'CANCELLED_BY_CARRIER';
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
      confirmButtonText: 'Submit',
      showLoaderOnConfirm: true,
      preConfirm: (otp) => {
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
            },
            (err) => {
              Swal.fire(
                'Incorrect OTP!',
                'Please try again with correct OTP.',
                'error'
              )
            }
          );
      },
      allowOutsideClick: () => !Swal.isLoading(),
    });
  }

  public viewDealDetails(deal: Deal) {
    // @ts-ignore
    Swal.fire({
      title: '<span class="my-custom-title">Order Details</span>',
      showCloseButton : true,
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
      <p>₹ ${deal.dealTotalAsCarrier}</p>
    </div>
  `,
      confirmButtonText: 'OK',
      customClass: {
        title: 'my-custom-title-class',
        content: 'my-custom-content-class',
        confirmButton: 'my-custom-button-class',
        popup: 'my-custom-popup-class'
      }
    });
  }



  public refresh() {
    this.getPickupDealsByContactNumber();
  }
}
