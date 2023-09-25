import {SignupService} from './signup.service';
import {Component, OnInit} from '@angular/core';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {Router} from '@angular/router';
import {CommonAuthService} from '../shared-services/common-auth.service';
import {SignupResponse} from '../models/SignupResponse';
import {Subscription} from 'rxjs/internal/Subscription';
import Swal from 'sweetalert2';
import {NgxSpinnerService} from "ngx-spinner";

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.css'],
})
export class SignupComponent implements OnInit {
  public signupForm!: FormGroup;
  public signupResponse!: SignupResponse;
  public registerOtp!: '';
  public registerOtpFlag: boolean = false;
  private subscription$: Subscription[] = [];

  constructor(
    private router: Router,
    private commonAuthService: CommonAuthService,
    private signupService: SignupService,
    private spinnerService: NgxSpinnerService
  ) {
  }

  ngOnInit(): void {
    this.signupForm = new FormGroup({
      firstName: new FormControl(null, [Validators.required]),
      lastName: new FormControl(null, [Validators.required]),
      contactNo: new FormControl(null, [
        Validators.required,
        Validators.pattern('^[0-9]*$'),
        Validators.maxLength(10),
        Validators.minLength(10)
      ]),
      password: new FormControl(null, [Validators.required]),
    });
    this.registerOtp = '';
    this.registerOtpFlag = false;
  }

  ngOnDestroy(): void {
    this.subscription$.map((sub) => sub && sub.unsubscribe());
  }

  public sendRegisterOTP() {
    this.spinnerService.show();
    var mobileNo = this.signupForm.value.contactNo;
    const otpVerifySub$ = this.signupService
      .sendRegisterOTP(mobileNo)
      .subscribe(
        (resp: any) => {
          this.registerOtpFlag = true;
          this.spinnerService.hide();
          if (resp) {
            this.fireOtpSentSwal();
          }
        },
        (err) => {
          console.log(err);
          this.spinnerService.hide();
          Swal.fire(
            err.error.Exception
          )
        }
      );
    this.subscription$.push(otpVerifySub$);
  }

  public verifyAndSignUp() {
    this.spinnerService.show();
    const signupSub$ = this.signupService
      .signup(this.signupForm.value, this.registerOtp)
      .subscribe(
        (resp: SignupResponse) => {
          this.fireSignInSuccessSwal();
          this.signupResponse = resp;
          this.spinnerService.hide();
          this.router.navigate(['/login']);
        },
        (err) => {
          console.log(err);
          this.spinnerService.hide();
          Swal.fire(
            err.error.Exception
          )
        }
      );
    this.subscription$.push(signupSub$);
  }

  public fireSignInSuccessSwal() {
    Swal.fire({
      position: 'center',
      icon: 'success',
      title: 'Sign up successful. Please Login to proceed to further ',
      showConfirmButton: false,
      timer: 1500,
    });
  }


  public fireOtpSentSwal() {
    Swal.fire({
      position: 'center',
      icon: 'success',
      title: 'OTP has been sent to your contact number. Please check',
      showConfirmButton: false,
      timer: 1500,
    });
  }
}
