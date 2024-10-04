package vn.bizup.projectbeta.models.dto;

import com.fasterxml.jackson.annotation.JsonFormat;

import java.util.Date;

public interface InventoryDTO {
    String getProduct_Name();
    String getProduct_Type();
    Short getProduct_Type_Id();
    String getUnit();
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "dd-MM-yyyy")
    Date getImport_Date();
    double getImport_Quantity();
    double getRemaining_Quantity();
    double getUnit_Price();
    String getVoucher_Code();
    short getPacking_Specifications();
}
