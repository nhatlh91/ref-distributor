package vn.bizup.projectbeta.models.dto;

import com.fasterxml.jackson.annotation.JsonFormat;

import java.util.Date;

public interface ExportVoucherDTO {
    Integer getExport_Voucher_Id();
    String getVoucher_Code();
    String getCustomer_Name();
    Integer getCustomer_Id();
    String getPhone();
    String getDescription();
    String getCreated_By();
    double getTotal_Amount();
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "dd-MM-yyyy")
    Date getPosting_Date();
}
