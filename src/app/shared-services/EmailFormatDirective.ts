import {Directive, ElementRef, HostListener} from '@angular/core';
import {NgControl} from '@angular/forms';

@Directive({
  selector: '[appEmailFormat]'
})
export class EmailFormatDirective {
  constructor(private el: ElementRef, private control: NgControl) {
  }

  @HostListener('blur')
  onInput() {
    const email = this.el.nativeElement.value;
    if (!this.isValidEmailFormat(email)) {
      // Clear the input value if it's not a valid email format
      // @ts-ignore
      this.control.control.setErrors({ 'invalidEmailFormat': true });
    }else{
      // @ts-ignore
      this.control.control.setErrors(null);
    }
  }

  private isValidEmailFormat(email: string): boolean {
    // Use a regular expression to validate email format
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(email);
  }
}

