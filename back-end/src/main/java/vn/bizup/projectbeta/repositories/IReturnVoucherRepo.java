package vn.bizup.projectbeta.repositories;

import jakarta.transaction.Transactional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import vn.bizup.projectbeta.models.entities.ExportVoucher;
import vn.bizup.projectbeta.models.entities.ReturnVoucher;

import java.util.Date;
import java.util.List;
import java.util.Optional;

@Transactional
public interface IReturnVoucherRepo extends JpaRepository<ReturnVoucher, Integer> {

    @Query("FROM ReturnVoucher" +
            " WHERE deleted = false  AND YEAR(postingDate) = :year AND (:month IS NULL OR MONTH(postingDate) = :month)" +
            " ORDER BY postingDate DESC")
    List<ReturnVoucher> findAll(@Param("year") Integer year,
                                @Param("month") Integer month);

    @Query("FROM ReturnVoucher" +
            " WHERE deleted = false AND DATE(postingDate) >= DATE(:begin) AND DATE(postingDate) <= DATE(:end)" +
            " ORDER BY postingDate DESC")
    List<ReturnVoucher> findAllByDate(@Param("begin") String begin,
                                      @Param("end") String end);

    @Query("SELECT voucherCode" +
            " FROM ReturnVoucher" +
            " ORDER BY voucherCode DESC" +
            " LIMIT 1")
    Optional<String> findLastCodes();

    @Query("SELECT voucherCode" +
            " FROM ReturnVoucher" +
            " ORDER BY voucherCode DESC")
    List<String> findAllCodes();

    @Modifying
    @Query("UPDATE ReturnVoucher SET deleted = true WHERE voucherCode = :voucherCode")
    void deleteByVoucherCode(@Param("voucherCode") String voucherCode);

    @Query("FROM ReturnVoucher WHERE voucherCode = :voucherCode AND deleted = false")
    ReturnVoucher getByVoucherCode(@Param("voucherCode") String voucherCode);
}
