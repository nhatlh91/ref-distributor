package vn.bizup.projectbeta.models.entities;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.util.Date;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class VoucherDetail {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long voucherDetailId;
    private String voucherCode;
    @NotNull
    private Integer productId;
    private double quantity;
    private double unitPrice;
    private String voucherType;
    private boolean deleted;
}
