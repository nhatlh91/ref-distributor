package vn.bizup.projectbeta.repositories;

import jakarta.transaction.Transactional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import vn.bizup.projectbeta.models.dto.ExportVoucherDTO;
import vn.bizup.projectbeta.models.dto.MonthlyRevenueDTO;
import vn.bizup.projectbeta.models.dto.TransactionDTO;
import vn.bizup.projectbeta.models.entities.ExportVoucher;
import vn.bizup.projectbeta.models.entities.ImportVoucher;

import java.util.Date;
import java.util.List;
import java.util.Optional;

@Transactional
public interface IExportVoucherRepo extends JpaRepository<ExportVoucher, Integer> {
    @Query(nativeQuery = true,
            value = "SELECT vc.*, customer_name, phone" +
                    " FROM export_voucher vc JOIN customer USING (customer_id)" +
                    " WHERE vc.deleted = false  AND YEAR(posting_date) = :year AND (:month IS NULL OR MONTH(posting_date) = :month)" +
                    " ORDER BY posting_date DESC")
    List<ExportVoucherDTO> findAll(@Param("year") Integer year,
                                   @Param("month") Integer month);

    @Query("FROM ExportVoucher" +
            " WHERE deleted = false AND DATE(postingDate) >= DATE(:begin) AND DATE(postingDate) <= DATE(:end)" +
            " ORDER BY postingDate DESC")
    List<ExportVoucher> findAllByDate(@Param("begin") String begin,
                                      @Param("end") String end);

    @Query("SELECT voucherCode" +
            " FROM ExportVoucher" +
            " ORDER BY voucherCode DESC")
    List<String> findAllCodes();

    @Query("SELECT voucherCode" +
            " FROM ExportVoucher" +
            " ORDER BY voucherCode DESC" +
            " LIMIT 1")
    Optional<String> findLastCodes();

    @Modifying
    @Query("UPDATE ExportVoucher SET deleted = true WHERE voucherCode = :voucherCode")
    void deleteByVoucherCode(@Param("voucherCode") String voucherCode);

    @Query("FROM ExportVoucher WHERE voucherCode = :voucherCode AND deleted = false")
    ExportVoucher getByVoucherCode(@Param("voucherCode") String voucherCode);

    @Query("SELECT SUM(totalAmount)" +
            " FROM ExportVoucher" +
            " WHERE deleted = false AND MONTH(postingDate) = MONTH(:date)")
    Optional<Double> getMonthlyTotalExportAmount(@Param("date") Date date);

    @Query("SELECT MONTH(postingDate) as month, SUM(totalAmount) as revenue" +
            " FROM ExportVoucher" +
            " WHERE deleted = false AND YEAR(postingDate) = :year" +
            " GROUP BY MONTH(postingDate)")
    List<MonthlyRevenueDTO> getMonthlyRevenue(@Param("year") String year);

    @Query("FROM ExportVoucher WHERE deleted = false AND voucherCode = :voucherCode")
    ExportVoucher findByVoucherCode(@Param("voucherCode") String voucherCode);

}
