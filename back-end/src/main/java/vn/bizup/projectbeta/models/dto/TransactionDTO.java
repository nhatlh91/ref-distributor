package vn.bizup.projectbeta.models.dto;

import com.fasterxml.jackson.annotation.JsonFormat;

import java.util.Date;

public interface TransactionDTO {
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "dd-MM-yyyy")
    Date getPostingDate();
    String getTypeOfTransaction();
    Double getAmount();

}
