package vn.bizup.projectbeta.models.dto;

public interface QuotationDTO {
    Integer getQuotation_Detail_Id();

    Integer getProduct_Id();

    String getProduct_Name();

    String getUnit();

    Short getPacking_Specifications();

    String getBarcode();

    Short getProduct_Type_Id();

    String getProduct_Type();

    Short getCustomer_Type_Id();

    String getCustomer_Type();

    Double getUnit_Price();
}
