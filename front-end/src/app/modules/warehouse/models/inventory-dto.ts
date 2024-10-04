export interface InventoryDto {
  product_Id: number;
  product_Name: string;
  product_Type_Id: number;
  product_Type: string;
  unit: string;
  import_Date: Date;
  import_Quantity: number;
  remaining_Quantity: number;
  unit_Price: number;
  voucher_Code: string;
  packing_Specifications: number;
}
