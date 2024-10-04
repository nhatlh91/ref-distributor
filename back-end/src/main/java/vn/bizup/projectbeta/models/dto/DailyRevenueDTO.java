package vn.bizup.projectbeta.models.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

public interface DailyRevenueDTO {
    @JsonProperty("productType")
    String getProduct_Type();
    @JsonProperty("productTypeId")
    Short getProduct_Type_Id();
    Double getRevenue();
}
