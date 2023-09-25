import {Component, OnInit} from '@angular/core';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {NgxSpinnerService} from 'ngx-spinner';

import {Subscription} from 'rxjs/internal/Subscription';
import {Deal} from 'src/app/models/Deal';
import Swal from 'sweetalert2';
import {UserDashboardService} from '../user-dashboard.service';
import {FutureTrip} from "../../models/FutureTrip";
import {DatePipe} from "@angular/common";

@Component({
  selector: 'app-submit-deal',
  templateUrl: './submit-deal.component.html',
  styleUrls: ['./submit-deal.component.css'],
})
export class SubmitDealComponent implements OnInit {
  currentStep = 0;
  private subscription$: Subscription[] = [];
  public form: any = {};
  public checkoutFlag = false;
  public futureTripList!: FutureTrip[];
  public futureTripScreenFlag = false;
  public config_for_futureTrips: any;
  public deal!: Deal;

  constructor(
    private userDashboardService: UserDashboardService,
    private spinnerService: NgxSpinnerService,
    private datePipe: DatePipe
  ) {
    this.checkoutFlag = false;
    this.futureTripScreenFlag = false;
    this.futureTripList = [];
    this.config_for_futureTrips = {
      itemsPerPage: 10,
      currentPage: 1,
      totalItems: this.futureTripList?.length || 0
    }
  }

  ngOnInit(): void {
    this.checkoutFlag = false;
    this.futureTripList = [];
    this.dealForm.controls.sender.controls.senderContactNo.setValue(
      localStorage.getItem('username')
    );
    this.dealForm.controls.sender.controls.senderFirstName.setValue(
      localStorage.getItem('firstName')
    );
    this.dealForm.controls.sender.controls.senderLastName.setValue(
      localStorage.getItem('lastName')
    );
  }

  public ngAfterViewInit(): void {
    this.fixStepIndicator(0); // Set the first step as active
  }

  public ngOnDestroy(): void {
    this.subscription$.map(sub => sub && sub.unsubscribe());
  }

  // Function to go to the next step
  public nextStep() {
    this.fixStepIndicator(this.currentStep);
    this.currentStep++;
  }

  // Function to go to the previous step
  public previousStep() {
    this.fixStepIndicator(this.currentStep);
    this.currentStep--;
  }

  public fixStepIndicator(n: number) {
    // This function removes the "active" class from all steps and adds it to the current step:
    const stepIndicators = document.querySelectorAll(".stepIndicator");
    stepIndicators.forEach((indicator, index) => {
      if (index === n) {
        indicator.classList.add("active");
      } else {
        indicator.classList.remove("active");
      }
    });
  }

  public dealForm = new FormGroup({
    dealTotal: new FormControl('', []),
    dealDistanceInKilometers: new FormControl('', []),
    //SENDER DETAILS
    sender: new FormGroup({
      senderContactNo: new FormControl('', [
        Validators.required,
        Validators.pattern('^[0-9]*$'),
        Validators.maxLength(10),
        Validators.minLength(10),
      ]),
      senderFirstName: new FormControl('', [
        Validators.required,
        Validators.minLength(1),
        Validators.maxLength(100),
      ]),
      senderLastName: new FormControl('', [
        Validators.required,
        Validators.minLength(1),
        Validators.maxLength(100),
      ]),
    }),
    //RECEIVER DETAILS
    receiver: new FormGroup({
      receiverContactNo: new FormControl('', [
        Validators.required,
        Validators.pattern('^[0-9]*$'),
        Validators.maxLength(10),
        Validators.minLength(10),
      ]),
      receiverFirstName: new FormControl('', [
        Validators.required,
        Validators.minLength(1),
        Validators.maxLength(100),
      ]),
      receiverLastName: new FormControl('', [
        Validators.required,
        Validators.minLength(1),
        Validators.maxLength(100),
      ]),
    }),

    //CARRIER DETAILS - This is options at the time of new parcel submission. If future trip exist, then we are linking carrier
    carrier: new FormGroup({
      carrierContactNo: new FormControl('', [
        Validators.maxLength(10),
      ]),
      carrierFirstName: new FormControl('', [
        Validators.maxLength(100),
      ]),
      carrierLastName: new FormControl('', [
        Validators.maxLength(100),
      ]),
    }),

    //PICKUP LOCATION DETAILS
    pickUpLocation: new FormGroup({
      addressLine: new FormControl('', [
        Validators.required,
        Validators.minLength(1),
        Validators.maxLength(500),
      ]),
      latitude: new FormControl('', []),
      longitude: new FormControl('', []),
      city: new FormControl('', []),
      state: new FormControl('', []),
      pinCode: new FormControl('', []),
      placeId: new FormControl('', []),
      landmark: new FormControl('', []),
    }),

    //DROP LOCATION DETAILS
    dropLocation: new FormGroup({
      addressLine: new FormControl('', [
        Validators.required,
        Validators.minLength(1),
        Validators.maxLength(500),
      ]),
      latitude: new FormControl('', []),
      longitude: new FormControl('', []),
      city: new FormControl('', []),
      state: new FormControl('', []),
      pinCode: new FormControl('', []),
      placeId: new FormControl('', []),
      landmark: new FormControl('', []),
    }),

    //PARCEL DETAILS
    parcel: new FormGroup({
      parcelWeight: new FormControl('', [
        Validators.required,
        Validators.min(1),
        Validators.max(10000),
      ]),
      parcelLength: new FormControl('', [
        Validators.required,
        Validators.min(1),
        Validators.max(200),
      ]),
      parcelHeight: new FormControl('', [
        Validators.required,
        Validators.min(1),
        Validators.max(200),
      ]),
      specialInstruction: new FormControl('', [Validators.required]),
    }),
  });

  public isSenderValid(): boolean {
    const senderGroup = this.dealForm.get('sender') as FormGroup;
    return senderGroup.valid;
  }

  public isReceiverValid(): boolean {
    const receiverGroup = this.dealForm.get('receiver') as FormGroup;
    return receiverGroup.valid;
  }

  public isPickUpLocationValid(): boolean {
    const pickUpLocationGroup = this.dealForm.get('pickUpLocation') as FormGroup;
    return pickUpLocationGroup.valid;
  }

  public isDropLocationValid(): boolean {
    const dropUpLocationGroup = this.dealForm.get('dropLocation') as FormGroup;
    return dropUpLocationGroup.valid;
  }

  public calculateDealDistanceAndDealTotal() {
    console.log(this.dealForm);
    this.spinnerService.show();
    const addDealSub$ = this.userDashboardService
      .calculateDealDistanceAndDealTotal(this.dealForm.value)
      .subscribe(
        (resp: Deal) => {
          console.log('Deal distance for the deal has been calculated successfully');
          this.spinnerService.hide();
          this.deal = resp;
          this.checkoutFlag = true;
          this.futureTripScreenFlag = false;
        },
        (err) => {
          console.log('Error while calculating deal distance and deal total');
          this.spinnerService.hide();
          this.checkoutFlag = false;
        }
      );
    this.subscription$.push(addDealSub$);
  }

  public async checkFutureTripIfAvailable() {
    console.log(this.dealForm);
    var pickupPinCode = this.dealForm.value.pickUpLocation?.pinCode;
    var dropPinCode = this.dealForm.value.dropLocation?.pinCode;
    var pickupLat = this.dealForm.value.pickUpLocation?.latitude;
    var pickupLong = this.dealForm.value.pickUpLocation?.longitude;
    var dropLat = this.dealForm.value.dropLocation?.latitude;
    var dropLong = this.dealForm.value.dropLocation?.longitude;
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
    this.spinnerService.show();
    const futureTripSub$ = this.userDashboardService
      .getFutureTripByPinCodes(pickupPinCode, dropPinCode)
      .subscribe(
        (futureTrips: FutureTrip[]) => {
          console.log('Fetched available future trips successfully');
          this.spinnerService.hide();
          if (futureTrips.length > 0) {
            this.futureTripList = futureTrips;
            this.futureTripScreenFlag = true;
          } else {
            this.calculateDealDistanceAndDealTotal();
          }
        },
        (err) => {
          console.log('Error while fetching future trips');
          this.spinnerService.hide();
          this.checkoutFlag = false;
        }
      );
    this.subscription$.push(futureTripSub$);
  }

  public selectTrip(event: any, trip: FutureTrip) {
    if (event.target.checked) {
      this.dealForm.controls.carrier.controls.carrierContactNo.setValue(trip.carrierContactNo);
      this.dealForm.controls.carrier.controls.carrierFirstName.setValue(trip.carrierFirstName);
      this.dealForm.controls.carrier.controls.carrierLastName.setValue(trip.carrierLastName);
      Swal.fire({
        position: 'center',
        icon: 'success',
        title: 'Trip has been selected',
        showConfirmButton: false,
        timer: 1500,
      });
    } else {
      Swal.fire({
        position: 'center',
        icon: 'warning',
        title: 'You have not selected the existing carrier',
        showConfirmButton: false,
        timer: 1500,
      });
    }
  }

  public loadFirstScreenOfSubmitDeal() {
    this.checkoutFlag = false;
    this.futureTripList = [];
  }


  public loadSecondScreenOfSubmitDeal() {
    if (this.futureTripList && this.futureTripList.length > 0) {
      this.futureTripScreenFlag = true;
      this.checkoutFlag = false;
    } else {
      this.loadFirstScreenOfSubmitDeal();
    }
  }

  public submitDeal() {
    console.log(this.dealForm);
    this.spinnerService.show();
    const addDealSub$ = this.userDashboardService
      .submitDeal(this.dealForm.value)
      .subscribe(
        (resp) => {
          console.log('New deal has been submitted successfully');
          this.fireSuccessDealSwal();
          this.spinnerService.hide();
        },
        (err) => {
          console.log('Error while submitting the deal');
          this.spinnerService.hide();
        }
      );
    this.subscription$.push(addDealSub$);
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
      postal_code = await this.getPincodeManuallyFromUser();
    }
    this.dealForm.controls.pickUpLocation.controls.addressLine.setValue(
      address.formatted_address
    );
    this.dealForm.controls.pickUpLocation.controls.latitude.setValue(
      address.geometry.location.lat()
    );
    this.dealForm.controls.pickUpLocation.controls.longitude.setValue(
      address.geometry.location.lng()
    );
    this.dealForm.controls.pickUpLocation.controls.city.setValue(city);
    this.dealForm.controls.pickUpLocation.controls.state.setValue(state);
    this.dealForm.controls.pickUpLocation.controls.pinCode.setValue(
      postal_code
    );
    this.dealForm.controls.pickUpLocation.controls.placeId.setValue(
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
      postal_code = await this.getPincodeManuallyFromUser();
    }

    this.dealForm.controls.dropLocation.controls.addressLine.setValue(
      address.formatted_address
    );
    this.dealForm.controls.dropLocation.controls.latitude.setValue(
      address.geometry.location.lat()
    );
    this.dealForm.controls.dropLocation.controls.longitude.setValue(
      address.geometry.location.lng()
    );
    this.dealForm.controls.dropLocation.controls.city.setValue(city);
    this.dealForm.controls.dropLocation.controls.state.setValue(state);
    this.dealForm.controls.dropLocation.controls.pinCode.setValue(postal_code);
    this.dealForm.controls.dropLocation.controls.placeId.setValue(
      address.place_id
    );
  }

  public fireSuccessDealSwal() {
    Swal.fire({
      position: 'center',
      icon: 'success',
      title: 'Deal has been saved successfully',
      showConfirmButton: false,
      timer: 1500,
    });
  }

  /*  // @ts-ignore
    public async checkIfPinCodeExist(pickupPinCode: any, dropPinCode: any): string{
      // @ts-ignore
      return new Promise<string>((resolve) => {
        if (pickupPinCode == '' || dropPinCode == '') {
          Swal.fire(
            'Pincode Required',
            'Please enter pincode of pickup and drop location',
            'error'

          ).then((result) => {
           resolve("success");
          });
        }
      });
    }*/
  //we are using promises to return pincode take from user. Promise is needed here in order to wait for current execution of method.
  // Hence this method is async and call method is also async
  // @ts-ignore
  public async getPincodeManuallyFromUser(): string {
    // @ts-ignore
    return new Promise<string>((resolve) => {
      // @ts-ignore
      Swal.fire({
        title: 'Please enter area pincode',
        input: 'text',
        inputAttributes: {
          autocapitalize: 'off',
          pattern: '[0-9]{6}', // Regular expression to enforce 6-digit numeric value
          inputmode: 'numeric', // To display numeric keyboard on mobile devices
          maxlength: 6
        },
        confirmButtonText: 'Submit',
        showLoaderOnConfirm: true,
        // @ts-ignore
        preConfirm: (inputValue) => {
          if (!/^\d{6}$/.test(inputValue)) {
            Swal.showValidationMessage('Please enter a valid 6-digit area pincode');
            return false;
          }
        }
        // @ts-ignore
      }).then((result) => {
        if (result.isConfirmed) {
          const postalCode = result.value;
          resolve(postalCode);
        } else if (result.dismiss === Swal.DismissReason.backdrop) {
          this.getPincodeManuallyFromUser(); // Show the input dialog again if the user clicks anywhere
        }
      });
    });
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

      <h6>Carrier Name</h6>
      <p>${trip.carrierFirstName} ${trip.carrierLastName}</p>

      <h6>Carrier Contact No.</h6>
      <p>${trip.carrierContactNo}</p>
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

  public handleNavigateToParent() {
    /*this.router.navigate(['/dashboard/submitdeal']);*/
    window.location.reload();
  }

  public pageChangedForFutureTrips(event: any) {
    this.config_for_futureTrips.currentPage = event;
  }
}
