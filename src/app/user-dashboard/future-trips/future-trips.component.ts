import {Component, OnInit} from '@angular/core';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {Router} from '@angular/router';
import {NgxSpinnerService} from 'ngx-spinner';
import {Subscription} from 'rxjs';
import Swal from 'sweetalert2';
import {UserDashboardService} from '../user-dashboard.service';
import {FutureTrip} from "../../models/FutureTrip";
import {DatePipe} from "@angular/common";
import {SubmitDealComponent} from "../submit-deal/submit-deal.component";

@Component({
  selector: 'app-future-trips',
  templateUrl: './future-trips.component.html',
  styleUrls: ['./future-trips.component.css']
})
export class FutureTripsComponent implements OnInit {
  private subscriptions$: Subscription[] = [];
  public displayTripFlag = false;
  public config_for_futureTrips: any;
  public futureTripList!: FutureTrip[];
  public tripDateAndTime: Date = new Date();

  key: string = 'id';
  reverse: boolean = true;

  constructor(
    private userDashboardService: UserDashboardService,
    private spinnerService: NgxSpinnerService,
    private submitDealComponent: SubmitDealComponent,
    private router: Router,
    private datePipe: DatePipe
  ) {
    this.config_for_futureTrips = {
      itemsPerPage: 10,
      currentPage: 1,
      totalItems: this.futureTripList?.length || 0
    };
  }

  ngOnInit(): void {
    this.getFutureTrips();
  }

  public addTripForm = new FormGroup({
    //PICKUP LOCATION DETAILS
    dateAndTime: new FormControl(this.tripDateAndTime, [Validators.required]),
    pickUpLocation: new FormGroup({
      addressLine: new FormControl('', [Validators.required, Validators.minLength(1), Validators.maxLength(500),
      ]),
      latitude: new FormControl('', [Validators.required]),
      longitude: new FormControl('', [Validators.required]),
      city: new FormControl('', [Validators.required]),
      state: new FormControl('', [Validators.required]),
      pinCode: new FormControl('', [Validators.required]),
      placeId: new FormControl('', [Validators.required]),
      landmark: new FormControl('', []),
    }),
    //DROP LOCATION DETAILS
    dropLocation: new FormGroup({
      addressLine: new FormControl('', [Validators.required, Validators.minLength(1), Validators.maxLength(500),
      ]),
      latitude: new FormControl('', [Validators.required]),
      longitude: new FormControl('', [Validators.required]),
      city: new FormControl('', [Validators.required]),
      state: new FormControl('', [Validators.required]),
      pinCode: new FormControl('', [Validators.required]),
      placeId: new FormControl('', [Validators.required]),
      landmark: new FormControl('', []),
    }),
  });

  public async submitFutureTrip() {
    this.spinnerService.show();
    var username = localStorage.getItem('username');

    this.addTripForm.controls.dateAndTime.setValue(this.tripDateAndTime);
    var pickupPinCode = this.addTripForm.value.pickUpLocation?.pinCode;
    var dropPinCode = this.addTripForm.value.dropLocation?.pinCode;
    var pickupLat = this.addTripForm.value.pickUpLocation?.latitude;
    var pickupLong = this.addTripForm.value.pickUpLocation?.longitude;
    var dropLat = this.addTripForm.value.dropLocation?.latitude;
    var dropLong = this.addTripForm.value.dropLocation?.longitude;
    if (pickupPinCode === dropPinCode && pickupLat === dropLat && pickupLong === dropLong) {
      await Swal.fire(
        'Pickup & drop location should be different',
        'Please enter different pickup & drop locations',
        'error'
      );
      return;
    }
    if (pickupPinCode == '') {
      await Swal.fire(
        'Pincode Required',
        'Please enter pickup location with pincode',
        'error'
      );
      return;
    }
    if (dropPinCode == '') {
      await Swal.fire(
        'Pincode Required',
        'Please enter drop location with pincode',
        'error'
      );
      return;
    }
    const addTripSub$ = this.userDashboardService.submitFutureTrip(this.addTripForm.value, username)
      .subscribe((resp: any) => {
          this.spinnerService.hide();
          if (resp === true) {
            Swal.fire('Your future trip has been added successfully', '', 'success').then((result) => {
              this.refresh()
            });
          } else {
            Swal.fire('Could not add trip, please try again after sometime', '', 'error').then((result) => {
            });
          }
        },
        (err: any) => {
          console.log('Error while adding future trip');
          this.spinnerService.hide();
          this.displayTripFlag = false;
        }
      );
    this.subscriptions$.push(addTripSub$);
  }

  public getFutureTrips() {
    this.spinnerService.show();
    const contactNumber = localStorage!.getItem('username');
    const getTripsSub$ = this.userDashboardService
      .getFutureTrips(contactNumber)
      .subscribe(
        (resp) => {
          this.spinnerService.hide();
          this.futureTripList = resp;
        },
        (err) => {
          console.log('Error while fetching future trips');
          this.spinnerService.hide();
        }
      );
    this.subscriptions$.push(getTripsSub$);
  }

  public deleteFutureTrip(futureTrip: FutureTrip) {
    const userContactNo = localStorage!.getItem('username');
    if (futureTrip && futureTrip.futureTripId && userContactNo) {
      Swal.fire({
        title: 'Are you sure, you want to delete this trip?',
        text: "You won't be able to revert this!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Delete',
      }).then((result) => {
        if (result.isConfirmed) {
          this.spinnerService.show();
          const getTripsSub$ = this.userDashboardService
            .deleteFutureTrip(futureTrip.futureTripId, userContactNo)
            .subscribe(
              (resp) => {
                this.spinnerService.hide();
                this.refresh();
                if (resp === true) {
                  Swal.fire(
                    'Your future trip has been deleted successfully',
                    '',
                    'success'
                  ).then((result) => {
                  });
                } else {
                  Swal.fire(
                    'Could not delete trip, please try again after sometime',
                    '',
                    'error'
                  ).then((result) => {
                  });
                }
              },
              (err) => {
                console.log('Error while deleting future trips');
                this.spinnerService.hide();
              }
            );
          this.subscriptions$.push(getTripsSub$);
        }
      });
    } else {
      Swal.fire(
        'Something went wrong, please try again after sometime',
        '',
        'error'
      ).then((result) => {
      });
    }
  }

  public async handlePickUpAddressChange(address: any) {
    let postal_code: any = '';
    let city: any = '';
    let state: any = '';
    address.address_components.forEach(function (component: any) {
      component.types.forEach((type: string) => {
        if (type == 'postal_code') {
          postal_code = component.long_name;
        }
        if (type == 'locality') {
          city = component.long_name;
        }
        if (type == 'administrative_area_level_1') {
          state = component.long_name;
        }
      });
    });

    if (postal_code == '' || postal_code == null) {
      postal_code = await this.submitDealComponent.getPincodeManuallyFromUser();
    }
    this.addTripForm.controls.pickUpLocation.controls.addressLine.setValue(
      address.formatted_address
    );
    this.addTripForm.controls.pickUpLocation.controls.latitude.setValue(
      address.geometry.location.lat()
    );
    this.addTripForm.controls.pickUpLocation.controls.longitude.setValue(
      address.geometry.location.lng()
    );
    this.addTripForm.controls.pickUpLocation.controls.city.setValue(city);
    this.addTripForm.controls.pickUpLocation.controls.state.setValue(state);
    this.addTripForm.controls.pickUpLocation.controls.pinCode.setValue(
      postal_code
    );
    this.addTripForm.controls.pickUpLocation.controls.placeId.setValue(
      address.place_id
    );
  }

  public async handleDropAddressChange(address: any) {
    let postal_code: any = '';
    let city: any = '';
    let state: any = '';
    address.address_components.forEach(function (component: any) {
      component.types.forEach((type: string) => {
        if (type == 'postal_code') {
          postal_code = component.long_name;
        }
        if (type == 'locality') {
          city = component.long_name;
        }
        if (type == 'administrative_area_level_1') {
          state = component.long_name;
        }
      });
    });
    if (postal_code == '' || postal_code == null) {
      postal_code = await this.submitDealComponent.getPincodeManuallyFromUser();
    }

    this.addTripForm.controls.dropLocation.controls.addressLine.setValue(
      address.formatted_address
    );
    this.addTripForm.controls.dropLocation.controls.latitude.setValue(
      address.geometry.location.lat()
    );
    this.addTripForm.controls.dropLocation.controls.longitude.setValue(
      address.geometry.location.lng()
    );
    this.addTripForm.controls.dropLocation.controls.city.setValue(city);
    this.addTripForm.controls.dropLocation.controls.state.setValue(state);
    this.addTripForm.controls.dropLocation.controls.pinCode.setValue(
      postal_code
    );
    this.addTripForm.controls.dropLocation.controls.placeId.setValue(
      address.place_id
    );
  }

  public pageChangedForFutureTrips(event: any) {
    this.config_for_futureTrips.currentPage = event;
  }

  public viewTripDetails(trip: FutureTrip) {
    const dateAndTimeMillis = trip.dateAndTime;
    const dateAndTime = new Date(dateAndTimeMillis);
    // @ts-ignore
    Swal.fire({
      title: '<span class="my-custom-title">Trip Details</span>',
      html: `
    <div class="shipment-details">
      <h6>Trip Id</h6>
      <p>${trip.futureTripId}</p>

      <h6>Pickup Location</h6>
      <p>${trip.pickupAddressLine} ${trip.pickupCity} ${trip.pickupState} ${trip.pickupPinCode}</p>

      <h6>Drop Location</h6>
      <p>${trip.dropAddressLine} ${trip.dropCity} ${trip.dropState} ${trip.dropPinCode}</p>

      <h6>Scheduled Time</h6>
       <p>${this.datePipe.transform(dateAndTime, 'dd-MMM-yyyy')} ${this.datePipe.transform(dateAndTime, 'shortTime')}</p>

     <!-- <div class="mb-2">
        <button id="parcelDetailsButton" class="btn btn-primary ">View Parcel Details</button>
        <button id="invoiceButton" class="btn btn-primary">Download Invoice</button>
      </div>
      <button id="paymentButton" class="btn btn-primary ">View Payment Details</button>-->
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
      },
    });
  }

  public sort(key: string) {
    this.key = key;
    this.reverse = !this.reverse;
  }

  public refresh() {
    this.getFutureTrips();
  }

  ngOnDestroy(): void {
    this.subscriptions$.map((sub) => sub && sub.unsubscribe());
  }
}
