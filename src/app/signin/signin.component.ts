import {Component, OnInit} from '@angular/core';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {Subscription} from 'rxjs';
import {LoginResponse} from '../models/LoginResposne';
import {Router} from '@angular/router';
import {SigninService} from './signin.service';
import {CommonAuthService} from '../shared-services/common-auth.service';
import {UserRoles} from '../app.constant';
import Swal from 'sweetalert2';
import {NgxSpinnerService} from "ngx-spinner";

@Component({
  selector: 'app-signin',
  templateUrl: './signin.component.html',
  styleUrls: ['./signin.component.css'],
})
export class SigninComponent implements OnInit {
  public loginForm!: FormGroup;
  private subscriptions$: Subscription[] = [];
  public loginResponse: LoginResponse = new LoginResponse();
  public errorMsg: string | undefined;
  public resetPasswordFlag: boolean = false;
  public showInvalidLabel = false;
  public otpSentFlag = false;
  public newPasswordFlag = false;
  public passwordResetOtp!: '';
  public mobileNo!: '';
  public newPassword!: '';
  public confirmNewPassword!: '';
  public Toast = Swal.mixin({
    toast: true,
    position: 'center',
    showConfirmButton: false,
    timer: 1000,
    didOpen: (toast) => {
      toast.addEventListener('mouseenter', Swal.stopTimer)
      toast.addEventListener('mouseleave', Swal.resumeTimer)
    }
  })

  constructor(private router: Router, private signinService: SigninService, private commonAuthService: CommonAuthService, private spinnerService: NgxSpinnerService) {
  }

  ngOnInit(): void {
    this.resetPasswordFlag = false;
    this.otpSentFlag = false;
    this.newPasswordFlag = false;
    this.loginForm = new FormGroup({
      contactNo: new FormControl(null, [
        Validators.required,
        Validators.pattern('^[0-9]*$'),
        Validators.maxLength(10),
        Validators.minLength(10)
      ]),
      password: new FormControl(null, [Validators.required]),
    });
    this.loginResponse.success = true;
  }

  public ngOnDestroy(): void {
    this.subscriptions$.map(sub => sub && sub.unsubscribe());
  }

  public async login(): Promise<void> {
    console.log(this.loginForm.valid);
    console.log(this.loginForm.value);
    this.spinnerService.show();
    const loginSub$ = this.signinService.login(this.loginForm.value).subscribe(
      (resp: any) => {
        this.loginResponse.success = true;
        console.log('user logged in successfully');
        this.commonAuthService.updateUserInSession(resp);
        this.routeToDashbaord(resp);
        this.spinnerService.hide();
        this.Toast.fire({
          icon: 'success',
          title: 'Signed in successfully'
        });
      },
      async (err) => {
        this.loginResponse.success = false;
        this.errorMsg = err.error.Exception;
        this.spinnerService.hide();
      }
    );
    this.subscriptions$.push(loginSub$);
  }

  public routeToDashbaord(response: any): void {
    if (response && UserRoles.USER === response.userRole) {
      this.router.navigate(['/dashboard']);
    } else {
      this.router.navigate(['/home']);
    }
  }

  public sendPasswordResetOtp(): void {
    // @ts-ignore
    const mobileNumberPattern = /^\d{10}$/;
    if (mobileNumberPattern.test(this.mobileNo)) {
      this.signinService.sendPasswordResetOtp(this.mobileNo).subscribe(
        (response: any) => {
          if (response == true) {
            Swal.fire("OTP sent successfully", '', "success");
            this.showInvalidLabel = false;
            this.otpSentFlag = true;
          }
        }, (err) => {
          this.otpSentFlag = false;
          Swal.fire(err.error.Exception);
          return;
        }
      );
    } else {
      this.showInvalidLabel = true;
    }
  }

  public verifyPasswordResetOtp(): void {
    if (this.passwordResetOtp.length > 0) {
      const payload = {
        passwordResetOtp: this.passwordResetOtp,
        mobileNo: this.mobileNo
      };
      this.signinService.verifyPasswordResetOtp(payload).subscribe(
        (response: any) => {
          if (response == true) {
            Swal.fire({icon: 'success', title: 'OTP verification successful', showConfirmButton: false, timer: 1500})
            this.passwordResetOtp = '';
            this.newPasswordFlag = true;
          }
          if (response == false) {
            Swal.fire("Incorrect OTP", '', "error");
          }
        }, (err) => {
          this.otpSentFlag = false;
          Swal.fire(err.error.Exception);
          return;
        }
      );
    }else{
      Swal.fire("Please enter valid otp", "", "error");
    }
  }

  public submitNewPassword(): void {
    // @ts-ignore
    if (this.newPassword.length && this.newPassword === this.confirmNewPassword) {
      const payload = {
        mobileNo: this.mobileNo,
        newPassword: this.newPassword
      }
      this.signinService.submitNewPassword(payload).subscribe(
        (response: any) => {
          if (response == true) {
            Swal.fire("Password updated successfully", '', "success").then((result => {
              this.resetPasswordFlag = false;
              this.otpSentFlag = false;
              this.newPasswordFlag = false;
              this.mobileNo = '';
              this.newPassword = '';
              this.confirmNewPassword = '';
              this.passwordResetOtp = '';
            }))
          }
          if (response == false) {
            Swal.fire("Password updated failed. Please try again", '', "error");
          }
        }, (err) => {
          Swal.fire(err.error.Exception);
          return;
        }
      );
    } else {
      Swal.fire("New password & confirm password doesn't match", '', "error");
      return;
    }
  }

}
