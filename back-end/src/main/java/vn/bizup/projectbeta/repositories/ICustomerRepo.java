package vn.bizup.projectbeta.repositories;

import jakarta.annotation.Nonnull;
import jakarta.transaction.Transactional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.lang.NonNull;
import vn.bizup.projectbeta.models.dto.CustomerDTO;
import vn.bizup.projectbeta.models.entities.Customer;

import java.util.List;
import java.util.Optional;

@Transactional
public interface ICustomerRepo extends JpaRepository<Customer, Integer> {
    @Override
    @Nonnull
    @Query("FROM Customer WHERE deleted = false ORDER BY customerName")
    List<Customer> findAll();

    @Query("FROM Customer WHERE deleted = false AND customerTypeId = :customerTypeId" +
            " ORDER BY customerName")
    List<Customer> findByCustomerTypeId(@Param("customerTypeId") Short customerTypeId);

    @Modifying
    @Query("UPDATE Customer SET deleted = true WHERE customerId = :customerId")
    void deleteById(@NonNull @Param("customerId") Integer customerId);

    @Modifying
    @Query("UPDATE Customer SET accountsReceivable = accountsReceivable + :amount WHERE customerId = :customerId")
    void updateAccountReceivable(@NonNull @Param("customerId") Integer customerId, @NonNull @Param("amount") double amount);

    @Query("SELECT SUM(accountsReceivable)" +
            " FROM Customer" +
            " WHERE deleted = false ")
    Optional<Double> getTotalAccountReceivable();

    @Query("SELECT customerId, customerName" +
            " FROM Customer" +
            " WHERE deleted = false" +
            " ORDER BY customerName")
    List<CustomerDTO> getCustomerDTO();
}
