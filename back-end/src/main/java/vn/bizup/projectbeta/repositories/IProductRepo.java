package vn.bizup.projectbeta.repositories;

import jakarta.transaction.Transactional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.lang.NonNull;
import vn.bizup.projectbeta.models.entities.Product;

import java.util.List;

@Transactional
public interface IProductRepo extends JpaRepository<Product, Integer> {

    @Override
    @Query("FROM Product WHERE deleted = false")
    List<Product> findAll();

    @Query(nativeQuery = true,
            value = "SELECT * FROM product WHERE !deleted AND product_id IN(SELECT product_id FROM inventory WHERE remaining_quantity > 0 GROUP BY product_id)")
    List<Product> findAllAvailableProduct();

    @Modifying
    @Query("UPDATE Product SET deleted = true WHERE productId = :productId")
    void deleteById(@NonNull @Param("productId") Integer productId);

    @Query("FROM Product WHERE deleted = false AND productId = :productId")
    Product findProductById(@NonNull @Param("productId") Integer productId);
}
