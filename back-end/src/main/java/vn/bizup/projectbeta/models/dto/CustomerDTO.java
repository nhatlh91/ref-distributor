package vn.bizup.projectbeta.models.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

public interface CustomerDTO {
    @JsonProperty("customerId")
    Integer getCustomer_Id();

    @JsonProperty("customerName")
    String getCustomer_Name();
}
