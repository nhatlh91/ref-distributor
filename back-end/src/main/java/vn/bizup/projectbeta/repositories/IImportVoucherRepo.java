package vn.bizup.projectbeta.repositories;

import jakarta.transaction.Transactional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import vn.bizup.projectbeta.models.entities.ImportVoucher;

import java.util.Date;
import java.util.List;
import java.util.Optional;

@Transactional
public interface IImportVoucherRepo extends JpaRepository<ImportVoucher, Integer> {
    @Query("FROM ImportVoucher" +
            " WHERE deleted = false  AND YEAR(postingDate) = :year AND (:month IS NULL OR MONTH(postingDate) = :month)" +
            " ORDER BY postingDate DESC")
    List<ImportVoucher> findAll(@Param("year") Integer year,
                                @Param("month") Integer month);

    @Query("FROM ImportVoucher" +
            " WHERE deleted = false AND DATE(postingDate) >= DATE(:begin) AND DATE(postingDate) <= DATE(:end)" +
            " ORDER BY postingDate DESC")
    List<ImportVoucher> findAllByDate(@Param("begin") String begin,
                                @Param("end") String end);

    @Query("SELECT voucherCode" +
            " FROM ImportVoucher" +
            " ORDER BY voucherCode DESC")
    List<String> findAllCodes();

    @Query("SELECT voucherCode" +
            " FROM ImportVoucher" +
            " ORDER BY voucherCode DESC" +
            " LIMIT 1")
    Optional<String> findLastCodes();

    @Modifying
    @Query("UPDATE ImportVoucher SET deleted = true WHERE voucherCode = :voucherCode")
    void deleteByVoucherCode(@Param("voucherCode") String voucherCode);

    @Query("FROM ImportVoucher WHERE voucherCode = :voucherCode AND deleted = false")
    ImportVoucher findByVoucherCode(@Param("voucherCode") String voucherCode);
}
