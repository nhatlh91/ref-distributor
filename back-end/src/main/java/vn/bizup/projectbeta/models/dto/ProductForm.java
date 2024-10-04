package vn.bizup.projectbeta.models.dto;

import lombok.Data;
import vn.bizup.projectbeta.models.entities.QuotationDetail;

import java.util.List;

@Data
public class ProductForm {
    private Integer productId;
    private Short productTypeId;
    private String productType;
    private String productName;
    private String unit;
    private String barcode;
    private short packingSpecifications;
    List<QuotationDetail> quotations;
}
