package vn.bizup.projectbeta.repositories;

import jakarta.transaction.Transactional;
import jakarta.validation.constraints.NotNull;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import vn.bizup.projectbeta.models.dto.ProductWithInventoryAndPrice;
import vn.bizup.projectbeta.models.dto.QuotationDTO;
import vn.bizup.projectbeta.models.entities.QuotationDetail;

import java.util.List;

@Transactional
public interface IQuotationDetailRepo extends JpaRepository<QuotationDetail, Integer> {

    @Query(nativeQuery = true,
            value = "SELECT *" +
                    " FROM quotation_detail JOIN product USING (product_id) JOIN customer_type USING (customer_type_id)" +
                    " WHERE !deleted" +
                    " ORDER BY product_name")
    List<QuotationDTO> findAllDTO();

    @Query(nativeQuery = true,
            value = "SELECT *" +
                    " FROM quotation_detail JOIN product USING (product_id) JOIN customer_type USING (customer_type_id)" +
                    " WHERE customer_type_id = :customerTypeId" +
                    " ORDER BY product_name")
    List<QuotationDTO> findAllByCustomerType(@Param("customerTypeId") Short customerTypeId);

    @Query(nativeQuery = true,
            value = "SELECT product_id, product_name, packing_specifications, barcode, unit, quotation_detail.unit_price, SUM(remaining_quantity) AS total_remaining_quantity" +
                    " FROM quotation_detail JOIN product USING (product_id) JOIN inventory USING (product_id)" +
                    " WHERE customer_type_id = (SELECT customer.customer_type_id FROM customer WHERE customer_id = :customerId)" +
                    " GROUP BY product_id, product_name, packing_specifications, barcode, unit, quotation_detail.unit_price" +
                    " ORDER BY product_name")
    List<ProductWithInventoryAndPrice> findAllProductWithPriceAndInventoryByCustomerId(@Param("customerId") Integer customerId);

    @Query(nativeQuery = true,
            value = "SELECT product_id, product_name, packing_specifications, barcode, unit, quotation_detail.unit_price, SUM(remaining_quantity) AS total_remaining_quantity" +
                    " FROM quotation_detail JOIN product USING (product_id) JOIN inventory USING (product_id)" +
                    " WHERE remaining_quantity != 0 AND customer_type_id = :customerTypeId" +
                    " GROUP BY product_id, product_name, packing_specifications, barcode, unit, quotation_detail.unit_price" +
                    " ORDER BY product_name")
    List<ProductWithInventoryAndPrice> findAllProductWithPriceAndInventoryByCustomerTypeId(@Param("customerTypeId") Short customerTypeId);

    @Query("FROM QuotationDetail" +
            " WHERE productId = :productId")
    List<QuotationDetail> findAllByProductId(@Param("productId") Integer productId);

    void deleteAllByProductId(@NotNull Integer productId);

}
