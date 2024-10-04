package vn.bizup.projectbeta.repositories;

import jakarta.transaction.Transactional;
import org.springframework.data.jpa.repository.JpaRepository;
import vn.bizup.projectbeta.models.entities.ProductType;

@Transactional
public interface IProductTypeRepo extends JpaRepository<ProductType, Short> {
}
