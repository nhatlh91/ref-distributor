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
public class ImportVoucher {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer importVoucherId;
    private String voucherCode;
    private String supplier;
    @Column(length = 1000)
    private String address;
    @Column(length = 1000)
    private String description;
    private String billing;
    private String createdBy;
    private double totalAmount;
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "dd-MM-yyyy")
    private Date postingDate;
    private boolean deleted;
}
