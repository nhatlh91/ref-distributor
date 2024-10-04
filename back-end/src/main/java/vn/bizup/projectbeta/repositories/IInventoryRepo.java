package vn.bizup.projectbeta.repositories;

import jakarta.transaction.Transactional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import vn.bizup.projectbeta.models.dto.InventoryDTO;
import vn.bizup.projectbeta.models.entities.Inventory;

import java.util.List;
import java.util.Optional;

@Transactional
public interface IInventoryRepo extends JpaRepository<Inventory, Long> {

    @Query(nativeQuery = true,
            value = "SELECT product_name, product_type, product_type_id, unit, unit_price, import_date, import_quantity, remaining_quantity, packing_specifications, voucher_code" +
                    " FROM inventory JOIN product USING (product_id)" +
                    " WHERE remaining_quantity > 0 AND (:productTypeId IS NULL OR product_type_id = :productTypeId)" +
                    " ORDER BY product_type, product_name, import_date DESC")
    List<InventoryDTO> findAllDTO(@Param("productTypeId") Short productTypeId);

    @Query("SELECT SUM(remainingQuantity)" +
            " FROM Inventory" +
            " WHERE remainingQuantity > 0 AND productId = :productId")
    Double findStockByProductId(@Param("productId") Integer productId);

    @Query("FROM Inventory WHERE remainingQuantity > 0 AND productId = :productId ORDER BY importDate LIMIT 1")
    Inventory findByProductId(@Param("productId") Integer productId);

    @Query("FROM Inventory WHERE productId = :productId AND importQuantity > remainingQuantity ORDER BY importDate DESC")
    List<Inventory> findAllByProductId(@Param("productId") Integer productId);

    @Query("SELECT SUM(unitPrice * remainingQuantity)" +
            " FROM Inventory" +
            " WHERE remainingQuantity > 0")
    Optional<Double> getTotalInventoryValue();

    @Query("FROM Inventory WHERE voucherCode = :voucherCode")
    List<Inventory> findAllByVoucherCode(@Param("voucherCode") String voucherCode);

    @Modifying
    @Query("DELETE Inventory WHERE voucherCode = :voucherCode")
    void deleteAllByVoucherCode(@Param("voucherCode") String voucherCode);
}
