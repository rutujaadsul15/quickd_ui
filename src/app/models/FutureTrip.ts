export class FutureTrip{
  futureTripId!: number;
  //pickup location details
  pickupPlaceId!: string;
  pickupAddressLine!: string;
  pickupLatitude!: string;
  pickupLongitude!: string;
  pickupCity!: string;
  pickupState!: string;
  pickupPinCode!: string;
  //drop location details
  dropPlaceId!: string;
  dropAddressLine!: string;
  dropLatitude!: string;
  dropLongitude!: string;
  dropCity!: string;
  dropState!: string;
  dropPinCode!: string;
  dateAndTime!: number;
  carrierContactNo!: string;
  carrierFirstName!:string;
  carrierLastName!:string;
}
