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
public class ReturnVoucher {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer returnVoucherId;
    private String voucherCode;
    private Integer customerId;
    private String customerName;
    @Column(length = 1000)
    private String description;
    private String createdBy;
    private double totalAmount;
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "dd-MM-yyyy")
    private Date postingDate;
    private boolean deleted;
}
