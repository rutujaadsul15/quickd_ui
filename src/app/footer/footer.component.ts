import {Component, OnInit} from '@angular/core';
import {FooterService} from "./footer.service";
import {Subscription} from "rxjs";
import Swal from "sweetalert2";

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.css']
})
export class FooterComponent implements OnInit {

  public mobileNo: string = '';
  public message: string = '';
  isFormOpen: boolean = false;
  reply: string = '';
  showReplyFlag: boolean = false;
  private subscriptions$: Subscription[] = [];
  iconClass = 'bi bi-chat-dots';

  constructor(private footerService: FooterService) {
  }

  ngOnInit(): void {
  }

  public ngOnDestroy(): void {
    this.subscriptions$.map(sub => sub && sub.unsubscribe());
  }

  public async sendEnquiry() {
    this.showReplyFlag = false;
    console.log("Mobile no : " + this.mobileNo + "message : " + this.message);
    if (this.mobileNo == '') {
      await Swal.fire(
        'Mobile number required',
        'Please enter mobile number along with message',
        'error'
      );
      return;
    }
    if (this.message == '') {
      await Swal.fire(
        'Message required',
        'Please type your message',
        'error'
      );
      return;
    }
    const sendEnqSub$ = this.footerService.sendEnquiry(this.mobileNo, this.message).subscribe(
      (resp: any) => {
        console.log('enquiry sent');
        this.reply = 'Thanks for reaching out to us. We will get back to you shortly'
        this.showReplyFlag = true;
      },
      (err) => {
        console.log('Something went wrong in sending enquiry');
      }
    );
    this.subscriptions$.push(sendEnqSub$);
  }

  public openForm() {
    this.mobileNo = '';
    this.message = '';
    this.showReplyFlag = false;
    this.iconClass = this.iconClass === 'bi bi-chat-dots' ? 'bi bi-x' : 'bi bi-chat-dots';
    this.isFormOpen = !this.isFormOpen;
  }

  public closeForm() {
    this.isFormOpen = false;
  }

}
