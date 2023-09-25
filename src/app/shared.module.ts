import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {PhoneNumberMaxLengthDirective} from "./shared-services/PhoneNumberMaxLengthDirective";
import {EmailFormatDirective} from "./shared-services/EmailFormatDirective";

@NgModule({
  imports: [
    CommonModule
  ],
  declarations: [
    PhoneNumberMaxLengthDirective,
    EmailFormatDirective
  ],
  exports: [PhoneNumberMaxLengthDirective, EmailFormatDirective]
})
export class SharedModule { }
