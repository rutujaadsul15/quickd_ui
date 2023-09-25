import {HttpClient, HttpHeaders, HttpParams} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {environment} from 'src/environments/environment';
import {Deal} from '../models/Deal';
import {OrderForCashfree} from '../models/OrderForCashfree';

const httpOptions = {headers: new HttpHeaders({'Content-Type': 'application/json'})};

@Injectable({
  providedIn: 'root'
})
export class CommonRestService {

  constructor(private httpClient: HttpClient) {
  }

  public getMethod(url: string): Observable<any> {
    return this.httpClient.get(url);
  }

  public getMethodForBlob(url: string): Observable<Blob> {
    // @ts-ignore
    return this.httpClient.get(url, {
      responseType: 'blob' as 'json',
    });
  }

  public getMethodWithQueryParam(url: string, param: HttpParams): Observable<any> {
    return this.httpClient.get(url, {params: param});
  }

  public postMethod(url: any, requestBody: any): Observable<any> {
    return this.httpClient.post(url, requestBody).pipe();
  }

  public putMethod(url: any, requestBody: any): Observable<any> {
    return this.httpClient.put(url, requestBody).pipe();
  }

  public deleteMethod(url: string): Observable<any> {
    return this.httpClient.delete(url);
  }

  public createOrderForRazorpay(deal: Deal): Observable<any> {
    return this.httpClient.post(environment.BASE_PATH + "pg/createOrder", deal, httpOptions);
  }

  public createOrderForCashfree(order: OrderForCashfree): Observable<any> {
    return this.httpClient.post(environment.BASE_PATH + "payment/initiatePayment", order, httpOptions);
  }

  public createOrderForPaytm(deal: Deal, upiId: string): Observable<any> {
    return this.httpClient.post(environment.BASE_PATH + "paytm/createOrder?upiId=" + upiId, deal, httpOptions);
  }

  public initiatePhonePayPayment(deal: Deal): Observable<any> {
    return this.httpClient.post(environment.BASE_PATH + "phonePay/initiateProd", deal, httpOptions);
  }

  public checkPaymentStatus(merchantTransactionId: any): Observable<any> {
    return this.httpClient.get(environment.BASE_PATH + "phonePay/checkPaymentStatusProd?merchantTransactionId=" + merchantTransactionId);
  }

  public saveKycDetails(formData: FormData): Observable<any> {
    const url = environment.BASE_PATH + 'document/' + "saveKycDetails";
    console.log(url);
    return this.httpClient.post(url, formData, {responseType: 'text'});
  }

}
