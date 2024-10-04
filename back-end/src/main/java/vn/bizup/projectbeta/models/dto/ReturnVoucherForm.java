package vn.bizup.projectbeta.models.dto;

import lombok.Data;
import org.hibernate.validator.constraints.Length;
import vn.bizup.projectbeta.models.entities.VoucherDetail;

import java.util.Date;
import java.util.List;

@Data
public class ReturnVoucherForm {
    private String voucherCode;
    private Integer customerId;
    private String customerName;
    @Length(max = 1000)
    private String description;
    private String createdBy;
    private double totalAmount;
    private Date postingDate;
    private List<VoucherDetail> details;
}
