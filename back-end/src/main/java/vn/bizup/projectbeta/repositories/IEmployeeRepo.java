package vn.bizup.projectbeta.repositories;

import jakarta.transaction.Transactional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import vn.bizup.projectbeta.models.entities.Employee;

@Transactional
public interface IEmployeeRepo extends JpaRepository<Employee,Short> {
    @Query("SELECT employeeName FROM Employee WHERE phone = :phone")
    String findNameByPhone(@Param("phone") String phone);
}
