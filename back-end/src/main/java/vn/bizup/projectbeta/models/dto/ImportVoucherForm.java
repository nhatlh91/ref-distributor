package vn.bizup.projectbeta.models.dto;

import lombok.*;
import org.hibernate.validator.constraints.Length;
import vn.bizup.projectbeta.models.entities.VoucherDetail;

import java.util.Date;
import java.util.List;

@Data
public class ImportVoucherForm {
    private String voucherCode;
    private String supplier;
    @Length(max = 1000)
    private String address;
    @Length(max = 1000)
    private String description;
    private String billing;
    private String createdBy;
    private double totalAmount;
    private Date postingDate;
    private List<VoucherDetail> details;
}
