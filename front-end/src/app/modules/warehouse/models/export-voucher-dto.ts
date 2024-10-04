export interface ExportVoucherDto {
  export_Voucher_Id?: number;
  voucher_Code?: string;
  customer_Name?: string;
  customer_Id?: number;
  phone?: string;
  description?: string;
  created_By?: string;
  total_Amount?: number;
  posting_Date?: Date;
}
