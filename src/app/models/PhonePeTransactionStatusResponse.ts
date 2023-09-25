import {PhonePeTransactionData} from "./PhonePeTransactionData";

export class PhonePeTransactionStatusResponse {
  code!: string;
  data!:PhonePeTransactionData;
  message!:string;
  success!: boolean;
}
