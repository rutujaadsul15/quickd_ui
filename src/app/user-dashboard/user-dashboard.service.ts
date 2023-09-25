import {Injectable} from '@angular/core';
import {Observable} from 'rxjs/internal/Observable';
import {environment} from 'src/environments/environment';
import {Deal} from '../models/Deal';
import {DealResponse} from '../models/DealResponse';
import {RazorPayPaymentOrderDetails} from '../models/RazorPayPaymentOrderDetails';
import {CommonRestService} from '../shared-services/common-rest.service';
import {FutureTrip} from "../models/FutureTrip";
import {Wallet} from "../models/Wallet";

@Injectable({
  providedIn: 'root'
})
export class UserDashboardService {

  constructor(private commonRestService: CommonRestService) {
  }


  public calculateDealDistanceAndDealTotal(deal: any) {
    return this.commonRestService.postMethod(environment.BASE_PATH + 'deals/calculateDealDistanceAndDealTotal', deal);
  }

  public submitDeal(deal: any) {
    return this.commonRestService.postMethod(environment.BASE_PATH + 'deals/submitDeal', deal);
  }

  public searchDeals(searchDealsRequest: any): Observable<Deal[]> {
    return this.commonRestService.postMethod(environment.BASE_PATH + 'deals/searchDeals', searchDealsRequest);
  }

  public requestSenderForConfirmation(confirmDealRequest: Deal) {
    return this.commonRestService.postMethod(environment.BASE_PATH + 'deals/requestSenderForConfirmation', confirmDealRequest);
  }

  public getSubmittedDealsByContactNumber(contactNumber: any): Observable<DealResponse> {
    return this.commonRestService.getMethod(environment.BASE_PATH + 'deals/getSubmittedDealsByContactNumber?contactNumber=' + contactNumber);
  }

  public getPickupDealsByContactNumber(contactNumber: any): Observable<DealResponse> {
    return this.commonRestService.getMethod(environment.BASE_PATH + 'deals/getPickupDealsByContactNumber?contactNumber=' + contactNumber);
  }

  public updateParcelStatus(dealId: number, parcelStatus: string): Observable<Deal> {
    return this.commonRestService.getMethod(environment.BASE_PATH + 'deals/updateParcelStatus?dealId=' + dealId + '&parcelStatus=' + parcelStatus);
  }

  public verifyOTPAndCompleteDeal(otp: number, dealId: number): Observable<any> {
    return this.commonRestService.getMethod(environment.BASE_PATH + 'deals/verifyOTPAndCompleteDeal?otp=' + otp + '&dealId=' + dealId);
  }

  public updateDealPaymentStatus(razorPayPaymentOrderDetails: RazorPayPaymentOrderDetails): Observable<any> {
    return this.commonRestService.postMethod(environment.BASE_PATH + 'deals/updateDealPaymentStatus', razorPayPaymentOrderDetails);
  }

  public getDealPaymentInfo(dealId: any): Observable<any> {
    return this.commonRestService.getMethod(environment.BASE_PATH + 'deals/getDealPaymentInfo?dealId=' + dealId);
  }

  public submitFutureTrip(addTripForm: any, contactNo: any) {
    return this.commonRestService.postMethod(environment.BASE_PATH + 'futureTrip/addTrip?userContactNo=' + contactNo, addTripForm);
  }

  public getFutureTrips(contactNumber: any): Observable<FutureTrip[]> {
    return this.commonRestService.getMethod(environment.BASE_PATH + 'futureTrip/getFutureTrips?userContactNo=' + contactNumber);
  }

  public deleteFutureTrip(futureTripId: number, userContactNo: string): Observable<any> {
    return this.commonRestService.deleteMethod(environment.BASE_PATH + 'futureTrip/deleteFutureTrip?futureTripId=' + futureTripId+'&userContactNo='+ userContactNo);
  }

  public getFutureTripByPinCodes(pickupPinCode: any, dropPinCode: any): Observable<FutureTrip[]> {
    return this.commonRestService.getMethod(environment.BASE_PATH + 'futureTrip/getFutureTripByPinCodes?pickupPinCode=' + pickupPinCode + '&dropPinCode='+ dropPinCode);
  }

  public getUserWalletDetails(userContactNumber: any): Observable<Wallet> {
    return this.commonRestService.getMethod(environment.BASE_PATH + 'wallet/fetchWalletDetails?userContactNumber=' + userContactNumber);
  }

  public downloadPaymentInvoice(dealId: any): Observable<Blob> {
    return this.commonRestService.getMethodForBlob(environment.BASE_PATH + 'invoice/generateInvoice?dealId=' + dealId);
  }

}
