import {UserRoutingModule} from './user-routing.module';
import {CommonModule, DatePipe} from '@angular/common';
import {UserNavComponent} from './user-nav/user-nav.component';
import {MySubmittedParcelsComponent} from './my-submitted-parcels/my-submitted-parcels.component';
import {SubmitDealComponent} from './submit-deal/submit-deal.component';
import {UserDashboardComponent} from './user-dashboard.component';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {HttpClientModule} from '@angular/common/http';
import {NgxSpinnerModule} from 'ngx-spinner';
import {Ng2OrderModule} from 'ng2-order-pipe';
import {Ng2SearchPipeModule} from 'ng2-search-filter';
import {CUSTOM_ELEMENTS_SCHEMA, NgModule} from '@angular/core';
import {NgxPaginationModule} from 'ngx-pagination';
import {GooglePlaceModule} from 'ngx-google-places-autocomplete';
import {CheckoutDealComponent} from './checkout-deal/checkout-deal.component';
import {FutureTripsComponent} from './future-trips/future-trips.component';
import {MyPickupParcelsComponent} from './my-pickup-parcels/my-pickup-parcels.component';
import {PickNewParcelComponent} from './pick-new-parcel/pick-new-parcel.component';
import {DateTimePickerModule} from "ngx-datetime-picker";
import {SharedModule} from "../shared.module";
import {UserWalletComponent} from "./user-wallet/user-wallet.component";


@NgModule({
  declarations: [
    UserDashboardComponent,
    UserNavComponent,
    SubmitDealComponent,
    MySubmittedParcelsComponent,
    CheckoutDealComponent,
    FutureTripsComponent,
    MyPickupParcelsComponent,
    PickNewParcelComponent,
    UserWalletComponent
  ],
  imports: [
    CommonModule,
    SharedModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    UserRoutingModule,
    ReactiveFormsModule,
    NgxSpinnerModule,
    Ng2OrderModule,
    Ng2SearchPipeModule,
    NgxPaginationModule,
    GooglePlaceModule,
    DateTimePickerModule
  ],
  schemas: [
    CUSTOM_ELEMENTS_SCHEMA
  ],
  providers: [DatePipe, SubmitDealComponent]
})
export class UserDashboardModule {
}
