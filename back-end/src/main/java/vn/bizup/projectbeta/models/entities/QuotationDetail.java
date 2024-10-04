package vn.bizup.projectbeta.models.entities;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.*;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class QuotationDetail {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer quotationDetailId;
    @NotNull
    private Integer productId;
    private double unitPrice;
    @NotNull
    private Short customerTypeId;
}
