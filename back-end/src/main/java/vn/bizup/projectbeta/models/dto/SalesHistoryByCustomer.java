package vn.bizup.projectbeta.models.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonProperty;

import java.util.Date;

public interface SalesHistoryByCustomer {
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "dd-MM-yyyy")
    @JsonProperty("postingDate")
    Date getPosting_Date();

    @JsonProperty("productName")
    String getProduct_Name();

    @JsonProperty("quantity")
    double getQuantity();

    @JsonProperty("amount")
    double getAmount();
}
