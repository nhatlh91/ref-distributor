package vn.bizup.projectbeta.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import vn.bizup.projectbeta.models.entities.CustomerType;

public interface ICustomerTypeRepo extends JpaRepository<CustomerType, Short> {
}
