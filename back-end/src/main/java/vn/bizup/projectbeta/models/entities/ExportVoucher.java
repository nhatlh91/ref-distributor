package vn.bizup.projectbeta.models.entities;

import com.fasterxml.jackson.annotation.JsonFormat;
import jakarta.persistence.*;
import lombok.*;

import java.util.Date;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ExportVoucher {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer exportVoucherId;
    private String voucherCode;
    private Integer customerId;
    @Column(length = 1000)
    private String description;
    private String createdBy;
    private double totalAmount;
    private double discount;
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "dd-MM-yyyy")
    private Date postingDate;
    private boolean deleted;
}
