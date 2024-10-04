package vn.bizup.projectbeta.models.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.Builder;
import lombok.Data;

import java.util.Date;

@Data
@Builder
public class ProductTransactionHistoryDTO {
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "dd-MM-yyyy")
    private Date postingDate;
    private String voucherCode;
    private String typeOfTransaction;
    private String partner;
    private Double quantity;
    private Double totalAmount;
}
