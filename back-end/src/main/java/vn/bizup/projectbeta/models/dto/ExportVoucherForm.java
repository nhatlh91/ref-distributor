package vn.bizup.projectbeta.models.dto;

import lombok.Data;
import org.hibernate.validator.constraints.Length;
import vn.bizup.projectbeta.models.entities.VoucherDetail;

import java.util.Date;
import java.util.List;

@Data
public class ExportVoucherForm {
    private Integer exportVoucherId;
    private String voucherCode;
    private Integer customerId;
    @Length(max = 1000)
    private String address;
    @Length(max = 1000)
    private String description;
    private String createdBy;
    private double totalAmount;
    private double discount;
    private Date postingDate;
    private List<VoucherDetail> details;
}
