import { CheckoutDealComponent } from './checkout-deal/checkout-deal.component';
import { MySubmittedParcelsComponent } from './my-submitted-parcels/my-submitted-parcels.component';
import { UserDashboardComponent } from './user-dashboard.component';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SubmitDealComponent } from './submit-deal/submit-deal.component';
import {FutureTripsComponent} from "./future-trips/future-trips.component";
import {PickNewParcelComponent} from "./pick-new-parcel/pick-new-parcel.component";
import {MyPickupParcelsComponent} from "./my-pickup-parcels/my-pickup-parcels.component";
import {UserWalletComponent} from "./user-wallet/user-wallet.component";
import {CheckoutStatusComponent} from "../checkout-status/checkout-status.component";



const routes: Routes = [
  {
    path: '',
    component: UserDashboardComponent,
    children: [
      {
        path: '',
        component: SubmitDealComponent
      },
      {
        path: 'submitdeal',
        component: SubmitDealComponent
      },
      {
        path: 'checkout',
        component: CheckoutDealComponent
      },
      {
        path:'searchdeals',
        component: PickNewParcelComponent
      },
      {
        path: 'mysubmittedparcels',
        component: MySubmittedParcelsComponent
      },
      {
        path: 'mypickupparcels',
        component: MyPickupParcelsComponent
      },
      {
        path: 'myfuturetrips',
        component: FutureTripsComponent
      },
      {
        path: 'wallet',
        component: UserWalletComponent
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class UserRoutingModule { }
