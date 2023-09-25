import {Component, OnInit} from '@angular/core';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {NgxSpinnerService} from 'ngx-spinner';
import {Subscription} from 'rxjs';
import {Deal} from 'src/app/models/Deal';
import Swal from 'sweetalert2';
import {UserDashboardService} from '../user-dashboard.service';
import {Router} from '@angular/router';
import {Carrier} from "../../models/Carrier";
import {SubmitDealComponent} from "../submit-deal/submit-deal.component";
import {CommonRestService} from "../../shared-services/common-rest.service";
// @ts-ignore
import * as AWS from 'aws-sdk';
// Configure AWS credentials
AWS.config.update({
  accessKeyId: 'AKIA6MIZIY77H5JUHYZU',
  secretAccessKey: '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',
  region: 'ap-south-1',
});

@Component({
  selector: 'app-pick-new-parcel',
  templateUrl: './pick-new-parcel.component.html',
  styleUrls: ['./pick-new-parcel.component.css']
})
export class PickNewParcelComponent implements OnInit {
  private subscriptions$: Subscription[] = [];
  public AVAILABLE_DEAL_LIST!: Deal[];
  public displayDealsFlag = false;
  public config: any;
  public searchString: any;
  public selectedDeal: Deal | null = null;
  public formData = new FormData();
  public selectedFile1: File | null = null;
  public selectedFile2: File | null = null;
  public uploadResult!: Boolean;
  public isCarrierKycUploaded: Boolean = false;

  constructor(
    private userDashboardService: UserDashboardService,
    private spinnerService: NgxSpinnerService,
    private submitDealComponent: SubmitDealComponent,
    private router: Router,
    private commonRestService: CommonRestService
  ) {
    this.config = {
      itemsPerPage: 5,
      currentPage: 1,
      totalItems: this.AVAILABLE_DEAL_LIST?.length || 0,
    };
  }


  public Toast = Swal.mixin({
    toast: true,
    position: 'center',
    showConfirmButton: false,
    timer: 2000,
    didOpen: (toast) => {
      toast.addEventListener('mouseenter', Swal.stopTimer);
      toast.addEventListener('mouseleave', Swal.resumeTimer);
    },
  });

  ngOnInit(): void {
    this.selectedDeal = null;
    this.searchDealForm.controls.carrierContactNumber.setValue(
      localStorage.getItem('username')
    );
    this.kycDocumentForm.controls.mobileNo.setValue(
      localStorage.getItem('username')
    );
    const isCarrierKycUploadedRes = localStorage.getItem('isCarrierKycUploaded');
    // @ts-ignore
    if (isCarrierKycUploadedRes == 'true') {
      this.isCarrierKycUploaded = true;
    }
  }

  ngOnDestroy(): void {
    this.subscriptions$.map((sub) => sub && sub.unsubscribe());
  }

  //******************************************* PICK UP PARCEL CONFIG *******************************************

  public searchDealForm = new FormGroup({
    //CONTACT NUMBER
    carrierContactNumber: new FormControl(
      {value: localStorage.getItem('username'), disabled: true},
      [
        Validators.required,
        Validators.pattern('^[0-9]*$'),
        Validators.maxLength(10),
        Validators.minLength(10),
      ]
    ),
    //VEHICLE DETAILS
    vehicleDetails: new FormControl('', []),
    //PICKUP LOCATION DETAILS
    pickUpLocation: new FormGroup({
      addressLine: new FormControl('', [
        Validators.required,
        Validators.minLength(1),
        Validators.maxLength(500),
      ]),
      latitude: new FormControl('', [Validators.required]),
      longitude: new FormControl('', [Validators.required]),
      city: new FormControl('', []),
      state: new FormControl('', []),
      pinCode: new FormControl('', [Validators.required]),
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
      latitude: new FormControl('', [Validators.required]),
      longitude: new FormControl('', [Validators.required]),
      city: new FormControl('', []),
      state: new FormControl('', []),
      pinCode: new FormControl('', [Validators.required]),
      placeId: new FormControl('', []),
      landmark: new FormControl('', []),
    }),
  });

  public kycDocumentForm = new FormGroup({
    firstName: new FormControl({value: localStorage.getItem('firstName'), disabled: true}, [Validators.required]),
    lastName: new FormControl({value: localStorage.getItem('lastName'), disabled: true}, [Validators.required]),
    mobileNo: new FormControl({value: localStorage.getItem('username'), disabled: true}, [Validators.required]),
    alternativeMobileNo: new FormControl(),
    address: new FormControl(),
    email: new FormControl(),
    kycVehicleDetails: new FormControl()
  });

  public async searchDeals() {
    if (this.searchDealForm.invalid) {
      Swal.fire({
        template: '#submitCheckDealForm',
      });
      return;
    }
    var pickupPinCode = this.searchDealForm.value.pickUpLocation?.pinCode;
    var dropPinCode = this.searchDealForm.value.dropLocation?.pinCode;
    var pickupLat = this.searchDealForm.value.pickUpLocation?.latitude;
    var pickupLong = this.searchDealForm.value.pickUpLocation?.longitude;
    var dropLat = this.searchDealForm.value.dropLocation?.latitude;
    var dropLong = this.searchDealForm.value.dropLocation?.longitude;
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
    const addDealSub$ = this.userDashboardService
      .searchDeals(this.searchDealForm.value)
      .subscribe(
        (resp) => {
          this.spinnerService.hide();
          this.AVAILABLE_DEAL_LIST = resp;
          if (this.AVAILABLE_DEAL_LIST.length <= 0) {
            Swal.fire(
              'There are no deals available on this route. Please try again after sometime',
              '',
              'error'
            ).then((result) => {
              this.router.navigate(['/dashboard/searchdeals']);
            });
          } else {
            this.displayDealsFlag = true;
          }
        },
        (err) => {
          console.log('Error while searching for the deals');
          this.spinnerService.hide();
          this.displayDealsFlag = false;
        }
      );
    this.subscriptions$.push(addDealSub$);
  }

  key: string = 'id';
  reverse: boolean = true;

  public sort(key: string) {
    this.key = key;
    this.reverse = !this.reverse;
  }

  public pageChanged(event: any) {
    this.config.currentPage = event;
  }

  public checkDeal(deal: any) {
    this.selectedDeal = deal;
    this.fireSwalForCheckDeal();
  }

  public requestSenderForConfirmation() {
    const carrierContactNumber = localStorage!.getItem('username');
    if (carrierContactNumber && this.selectedDeal) {
      let carrier = new Carrier();
      carrier.carrierContactNo = carrierContactNumber;
      if (this.searchDealForm.controls.vehicleDetails.value) {
        carrier.vehicleDetails = this.searchDealForm.controls.vehicleDetails.value;
      }
      this.selectedDeal!.carrier = carrier;
    } else {
      Swal.fire('Carrier contact number is required', 'error');
      return;
    }
    this.spinnerService.show();
    const acceptDealSub$ = this.userDashboardService
      .requestSenderForConfirmation(this.selectedDeal)
      .subscribe(
        (resp) => {
          this.spinnerService.hide();
          Swal.fire(
            'Request sent to sender for confirmation!',
            '',
            'success'
          ).then(() => {
            this.selectedDeal = null;
            this.displayDealsFlag = false;
            this.router.navigate(['/dashboard/searchdeals']);
          });
        },
        (err) => {
          this.spinnerService.hide();
          console.log('Error while accepting the deal');
        }
      );
    this.subscriptions$.push(acceptDealSub$);
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
    this.searchDealForm.controls.pickUpLocation.controls.addressLine.setValue(
      address.formatted_address
    );
    this.searchDealForm.controls.pickUpLocation.controls.latitude.setValue(
      address.geometry.location.lat()
    );
    this.searchDealForm.controls.pickUpLocation.controls.longitude.setValue(
      address.geometry.location.lng()
    );
    this.searchDealForm.controls.pickUpLocation.controls.city.setValue(city);
    this.searchDealForm.controls.pickUpLocation.controls.state.setValue(state);
    this.searchDealForm.controls.pickUpLocation.controls.pinCode.setValue(
      postal_code
    );
    this.searchDealForm.controls.pickUpLocation.controls.placeId.setValue(
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

    this.searchDealForm.controls.dropLocation.controls.addressLine.setValue(
      address.formatted_address
    );
    this.searchDealForm.controls.dropLocation.controls.latitude.setValue(
      address.geometry.location.lat()
    );
    this.searchDealForm.controls.dropLocation.controls.longitude.setValue(
      address.geometry.location.lng()
    );
    this.searchDealForm.controls.dropLocation.controls.city.setValue(city);
    this.searchDealForm.controls.dropLocation.controls.state.setValue(state);
    this.searchDealForm.controls.dropLocation.controls.pinCode.setValue(
      postal_code
    );
    this.searchDealForm.controls.dropLocation.controls.placeId.setValue(
      address.place_id
    );
  }

  public fireInvalidAddressSwal() {
    Swal.fire(
      'Pin code does not exist for this address',
      'Try entering exact address details',
      'question'
    );
  }

  public fireSwalForCheckDeal() {
    const swalWithBootstrapButtons = Swal.mixin({
      customClass: {
        confirmButton: 'btn btn-success',
        cancelButton: 'btn btn-danger',
      },
      buttonsStyling: false,
    });

    swalWithBootstrapButtons
      .fire({
        html:
          ' <h6><strong> Sender Name : </strong>' +
          this.selectedDeal!.sender!.senderFirstName +
          ' ' +
          this.selectedDeal!.sender!.senderLastName +
          '</h6>' +
          ' <h6><strong> Pick up Location : </strong>' +
          this.selectedDeal!.pickUpLocation!.addressLine +
          '</h6>' +
          ' <h6><strong> Drop Location : </strong>' +
          this.selectedDeal!.dropLocation!.addressLine +
          '</h6>' +
          ' <h6><strong> Parcel Weight     : </strong>' +
          this.selectedDeal!.parcel!.parcelWeight +
          'grams</h6>' +
          ' <h6><strong> Parcel Length     : </strong>' +
          this.selectedDeal!.parcel!.parcelLength +
          ' cms</h6>' +
          ' <h6><strong> Parcel Height     : </strong>' +
          this.selectedDeal!.parcel!.parcelHeight +
          ' cms</h6>' +
          ' <h6><strong> Total Distance     : </strong>' +
          this.selectedDeal!.dealDistanceInKilometers +
          ' Kms</h6>' +
          ' <h6><strong> Deal Amount     : </strong>' +
          this.selectedDeal!.dealTotalAsCarrier +
          ' ₹</h6>' +
          ' <h6><strong> Sender Contact No : </strong>' +
          this.selectedDeal!.sender!.senderContactNo,
        showCancelButton: true,
        confirmButtonText: 'Yes, Accept the deal!',
        cancelButtonText: 'No, cancel',
        reverseButtons: true,
      })
      .then((result) => {
        if (result.isConfirmed) {
          this.requestSenderForConfirmation();
        } else {
          this.selectedDeal = null;
        }
      });
  }

  public onSelectFile1(event: any) {
    this.selectedFile1 = event.target.files[event.target.files.length - 1] as File;
  }

  public onSelectFile2(event: any) {
    this.selectedFile2 = event.target.files[event.target.files.length - 1] as File;
  }

  public async performUploadToS3() {
    this.spinnerService.show();
    if (this.selectedFile1 == null && this.selectedFile2 == null) {
      Swal.fire({
        icon: 'info',
        title: 'Please upload at least one document',
      });
      this.spinnerService.hide();
      return;
    }
    // @ts-ignore
    const mobileNo = this.kycDocumentForm.get('mobileNo').value;

    if (!mobileNo) {
      Swal.fire({
        icon: 'info',
        title: 'Mobile number should not be empty',
      });
      this.spinnerService.hide();
      return;
    }
    try {
      const uploadPromises = [];
      if (this.selectedFile1) {
        uploadPromises.push(
          this.uploadFileToS3(this.selectedFile1, mobileNo, 'IdProof').then((result1: { success: boolean, location?: string, error?: any }) => {
            if (result1.success) {
              if (result1.location) {
                this.formData.set('idProofUrl', result1.location);
              } else {
                this.formData.set('idProofUrl', '');
              }
              this.selectedFile1 = null;
            } else {
              Swal.fire({
                icon: 'error',
                title: 'Failed to upload id proof',
                text: result1.error
              })
            }
          })
        );
      }

      if (this.selectedFile2) {
        uploadPromises.push(
          this.uploadFileToS3(this.selectedFile2, mobileNo, 'AddressProof').then((result2: { success: boolean, location?: string, error?: any }) => {
            if (result2.success) {
              if (result2.location) {
                this.formData.set('addressProofUrl', result2.location);
              } else {
                this.formData.set('addressProofUrl', '');
              }
              this.selectedFile2 = null;
            } else {
              Swal.fire({
                icon: 'error',
                title: 'Failed to upload address proof',
                text: result2.error
              })
            }
          })
        );
      }

      await Promise.all(uploadPromises);

      // @ts-ignore
      this.formData.set('mobileNo', this.kycDocumentForm.get('mobileNo').value);
      // @ts-ignore
      this.formData.set('alternativeMobileNo', this.kycDocumentForm.get('alternativeMobileNo').value);
      // @ts-ignore
      this.formData.set('address', this.kycDocumentForm.get('address').value);
      // @ts-ignore
      this.formData.set('email', this.kycDocumentForm.get('email').value)
      // @ts-ignore
      this.formData.set('kycVehicleDetails', this.kycDocumentForm.get('kycVehicleDetails').value);

      this.commonRestService.saveKycDetails(this.formData).subscribe(
        (res: any) => {
          this.uploadResult = res;
          if (res == "true") {
            Swal.fire({
              icon: 'success',
              title: 'KYC Details Submitted',
              showConfirmButton: true
            })
            this.kycDocumentForm.reset();
            localStorage.setItem('isCarrierKycUploaded', 'true');
            this.isCarrierKycUploaded = true;
            this.spinnerService.hide();
          } else {
            Swal.fire({
              icon: 'error',
              title: 'Failed to upload kyc documents',
              text: 'Please try again!'
            })
            this.spinnerService.hide();
          }
        },
        (err: any) => {
          Swal.fire("Something is wrong while submitting details");
          this.spinnerService.hide();
        });
    } catch (error) {
      console.error('An error occurred:', error);
      Swal.fire("exception occurred while submitting details");
    } finally {
      this.spinnerService.hide();
    }
  }

  private async uploadFileToS3(file: File | null, mobileNo: string, filePrefix: string): Promise<{ success: boolean, error?: any }> {
    if (!file) {
      // No file selected, return success
      return {success: true};
    }
    const s3 = new AWS.S3();
    const params = {
      Bucket: 'pickmyparcelkyc',
      Key: `${mobileNo}${filePrefix}${file.name}`,
      Body: file,
      ACL: 'public-read',
    };
    return new Promise<{ success: boolean, location?: any, error?: any }>((resolve) => {
      s3.upload(params, (err: any, data: any) => {
        if (err) {
          // Handle upload error
          resolve({success: false, error: err});
        } else {
          // File uploaded successfully
          // @ts-ignore
          resolve({success: true, location: data.Location});
        }
      });
    });
  }

}
