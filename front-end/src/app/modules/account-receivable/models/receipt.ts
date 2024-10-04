export interface Receipt {
  receiptId?: number;
  customerId?: number;
  postingDate?: Date;
  amount?: number;
  typeOfTransaction?: string;
}
