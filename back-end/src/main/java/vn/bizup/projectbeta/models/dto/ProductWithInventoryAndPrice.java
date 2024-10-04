package vn.bizup.projectbeta.models.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

public interface ProductWithInventoryAndPrice {
    @JsonProperty("productId")
    Integer getProduct_Id();

    @JsonProperty("productName")
    String getProduct_Name();

    @JsonProperty("packingSpecifications")
    Short getPacking_Specifications();

    @JsonProperty("barcode")
    String getBarcode();

    @JsonProperty("unit")
    String getUnit();

    @JsonProperty("totalRemainingQuantity")
    Double getTotal_Remaining_Quantity();

    @JsonProperty("unitPrice")
    Double getUnit_Price();
}
