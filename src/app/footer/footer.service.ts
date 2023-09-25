import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {environment} from 'src/environments/environment';
import {LoginResponse} from '../models/LoginResposne';
import {CommonRestService} from '../shared-services/common-rest.service';

@Injectable({
  providedIn: 'root'
})
export class FooterService {

  constructor(private commonRestService: CommonRestService) {
  }

  public sendEnquiry(mobileNo: any, message: any): Observable<LoginResponse> {
    return this.commonRestService.getMethod(environment.BASE_PATH + 'contactUs/sendEnquiry?mobileNo=' + mobileNo + '&message=' + message);
  }

}
