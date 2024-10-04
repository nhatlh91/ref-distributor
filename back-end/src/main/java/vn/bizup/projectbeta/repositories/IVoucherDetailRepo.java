package vn.bizup.projectbeta.repositories;

import jakarta.transaction.Transactional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import vn.bizup.projectbeta.models.dto.DailyRevenueDTO;
import vn.bizup.projectbeta.models.dto.ImportValueDTO;
import vn.bizup.projectbeta.models.dto.SalesDTO;
import vn.bizup.projectbeta.models.dto.SalesHistoryByCustomer;
import vn.bizup.projectbeta.models.entities.VoucherDetail;

import java.util.Date;
import java.util.List;

@Transactional
public interface IVoucherDetailRepo extends JpaRepository<VoucherDetail, Long> {

    @Query("FROM VoucherDetail WHERE deleted = false AND voucherCode = :voucherCode")
    List<VoucherDetail> findAllByVoucherCode(@Param("voucherCode") String voucherCode);

    @Modifying
    @Query("UPDATE VoucherDetail SET deleted = true WHERE voucherCode = :voucherCode")
    void deleteByVoucherCode(@Param("voucherCode") String voucherCode);

    @Query(nativeQuery = true,
            value = "SELECT product_type_id, product_type, SUM(unit_price*voucher_detail.quantity) AS revenue" +
                    " FROM voucher_detail JOIN export_voucher USING(voucher_code) JOIN product USING (product_id)" +
                    " WHERE DATE(posting_date) = DATE(:date)" +
                    " GROUP BY product_type_id, product_type")
    List<DailyRevenueDTO> getDailyRevenueByProductType(@Param("date") Date date);

    @Query(nativeQuery = true,
            value = "SELECT product_name," +
                    " product_type," +
                    " packing_specifications, unit," +
                    " SUM(quantity) as quantity," +
                    " SUM(unit_price * quantity) as amount" +
                    " FROM voucher_detail" +
                    " JOIN product USING (product_id)" +
                    " JOIN export_voucher USING (voucher_code)" +
                    " WHERE !voucher_detail.deleted" +
                    " AND YEAR(posting_date) = :year" +
                    " AND (:month IS NULL OR MONTH(posting_date) = :month)" +
                    " GROUP BY product_name, product_type, packing_specifications, unit" +
                    " ORDER BY product_name")
    List<SalesDTO> findAllSalesDTO(@Param("year") Integer year,
                                   @Param("month") Integer month);

    @Query(nativeQuery = true,
            value = "SELECT product_type, SUM(unit_price * quantity) as amount" +
                    " FROM voucher_detail" +
                    " JOIN product USING (product_id)" +
                    " JOIN import_voucher USING (voucher_code)" +
                    " WHERE !voucher_detail.deleted AND unit_price!=0 AND YEAR(posting_date) = YEAR(:date)" +
                    " AND MONTH(posting_date) = MONTH(:date)" +
                    " GROUP BY product_type")
    List<ImportValueDTO> findAllImportValueDTO(@Param("date") Date date);

    @Query(nativeQuery = true,
            value = "SELECT posting_date, product_name,quantity, (unit_price * quantity) as amount" +
                    " FROM voucher_detail" +
                    " JOIN product USING (product_id)" +
                    " JOIN export_voucher USING (voucher_code)" +
                    " WHERE voucher_detail.deleted = false AND customer_id = :customerId AND !export_voucher.deleted AND YEAR(posting_date) = :year" +
                    " AND (:month IS NULL OR MONTH(posting_date) = :month)" +
                    " ORDER BY posting_date DESC")
    List<SalesHistoryByCustomer> findSalesHistoryByCustomer(@Param("year") Integer year,
                                                            @Param("month") Integer month,
                                                            @Param("customerId") Integer customerId);

    @Query(nativeQuery = true,
            value = "SELECT *" +
                    " FROM voucher_detail" +
                    " WHERE deleted = false AND product_id = :productId AND voucher_code = :voucherCode")
    List<VoucherDetail> findItemTransHistory(@Param("voucherCode") String voucherCode,
                                       @Param("productId") Integer productId);
}
