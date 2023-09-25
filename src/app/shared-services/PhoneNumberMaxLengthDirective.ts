import { Directive, ElementRef, HostListener } from '@angular/core';
import { NgControl } from '@angular/forms';

@Directive({
  selector: '[appPhoneNumberMaxLength]'
})
export class PhoneNumberMaxLengthDirective {
  constructor(private el: ElementRef, private control: NgControl) {}

  @HostListener('input')
  onInput() {
    const phoneNumber = this.el.nativeElement.value;
    if (phoneNumber.length > 10) {
      // @ts-ignore
      this.control.control.setValue(phoneNumber.slice(0, 10));
    }
  }
}
