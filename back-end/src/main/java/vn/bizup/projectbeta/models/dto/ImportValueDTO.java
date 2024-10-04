package vn.bizup.projectbeta.models.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

public interface ImportValueDTO {
    @JsonProperty("productType")
    String getProduct_Type();

    Double getAmount();
}
