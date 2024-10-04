package vn.bizup.projectbeta.models.entities;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import lombok.*;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Product {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer productId;
    private Short productTypeId;
    private String productType;
    private String productName;
    private String unit;
    private String barcode;
    private short packingSpecifications;
    private boolean deleted;
}
