package vn.bizup.projectbeta.repositories;

import jakarta.transaction.Transactional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import vn.bizup.projectbeta.models.dto.MonthlyRevenueDTO;
import vn.bizup.projectbeta.models.dto.TransactionDTO;
import vn.bizup.projectbeta.models.entities.Receipt;

import java.util.Date;
import java.util.List;
import java.util.Optional;

@Transactional
public interface IReceiptRepo extends JpaRepository<Receipt, Long> {
    @Query("FROM Receipt WHERE customerId = :customerId ORDER BY postingDate DESC")
    List<Receipt> findByCustomerId(@Param("customerId") Integer customerId);

    @Query("SELECT SUM(amount)" +
            " FROM Receipt" +
            " WHERE typeOfTransaction = 'payment' AND DATE(postingDate) = DATE(:date)")
    Optional<Double> getDailyTotalReceipt(@Param("date") Date date);

    @Query("SELECT SUM(amount)" +
            " FROM Receipt" +
            " WHERE typeOfTransaction = 'payment' AND MONTH(postingDate) = MONTH(:date)")
    Optional<Double> getMonthlyTotalReceipt(@Param("date") Date date);

    @Query("SELECT r.amount AS amount, r.postingDate AS postingDate, r.typeOfTransaction AS typeOfTransaction" +
            " FROM Receipt r" +
            " WHERE r.customerId = :customerId AND YEAR(r.postingDate) = :year AND (:month IS NULL OR MONTH(r.postingDate) = :month)" +
            " UNION" +
            " SELECT v.totalAmount AS amount, v.postingDate as postingDate, 'debt' AS typeOfTransaction" +
            " FROM ExportVoucher v" +
            " WHERE v.deleted = false AND v.customerId = :customerId AND YEAR(v.postingDate) = :year AND (:month IS NULL OR MONTH(v.postingDate) = :month)" +
            " UNION" +
            " SELECT v.totalAmount AS amount, v.postingDate as postingDate, 'return' AS typeOfTransaction" +
            " FROM ReturnVoucher v" +
            " WHERE v.deleted = false AND v.customerId = :customerId AND YEAR(v.postingDate) = :year AND (:month IS NULL OR MONTH(v.postingDate) = :month)" +
            " ORDER BY postingDate")
    List<TransactionDTO> getTransactionDTO(@Param("customerId") Integer customerId,
                                           @Param("year") Integer year,
                                           @Param("month") Integer month);

    @Query("SELECT MONTH(r.postingDate) as month, SUM(r.amount) as revenue" +
            " FROM Receipt r" +
            " WHERE r.typeOfTransaction = 'payment' AND YEAR(r.postingDate) = :year" +
            " GROUP BY MONTH(r.postingDate)")
    List<MonthlyRevenueDTO> getMonthlyCash(@Param("year") String year);
}
