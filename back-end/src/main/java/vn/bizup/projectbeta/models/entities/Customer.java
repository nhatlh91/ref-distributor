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
public class Customer {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer customerId;
    @NotNull
    private Short customerTypeId;
    private String customerType;
    private String customerName;
    private String phone;
    @Column(length = 1000)
    private String address;
    private double accountsReceivable;
    private boolean deleted;
}
