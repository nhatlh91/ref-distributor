package vn.bizup.projectbeta.services;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import vn.bizup.projectbeta.models.dto.ProductTransactionHistoryDTO;
import vn.bizup.projectbeta.models.entities.Customer;
import vn.bizup.projectbeta.repositories.*;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ReportService {
    private final IVoucherDetailRepo voucherDetailRepo;
    private final IExportVoucherRepo exportVoucherRepo;
    private final IImportVoucherRepo importVoucherRepo;
    private final IReturnVoucherRepo returnVoucherRepo;
    private final ICustomerRepo customerRepo;

    public List<ProductTransactionHistoryDTO> getItemTransHistory(String begin, String end, Integer productId) {
        List<ProductTransactionHistoryDTO> result = new ArrayList<>();
        var importVouchers = importVoucherRepo.findAllByDate(begin, end);
        var exportVouchers = exportVoucherRepo.findAllByDate(begin, end);
        var returnVouchers = returnVoucherRepo.findAllByDate(begin, end);
        if (!importVouchers.isEmpty()) {
            importVouchers.forEach(voucher -> {
                var details = voucherDetailRepo.findItemTransHistory(voucher.getVoucherCode(), productId);
                if (!details.isEmpty()) {
                    details.forEach(detail -> {
                        var history = ProductTransactionHistoryDTO.builder()
                                .partner(voucher.getSupplier())
                                .postingDate(voucher.getPostingDate())
                                .quantity(detail.getQuantity())
                                .totalAmount(detail.getQuantity() * detail.getUnitPrice())
                                .typeOfTransaction("Nhập hàng")
                                .voucherCode(voucher.getVoucherCode())
                                .build();
                        result.add(history);
                    });
                }
            });
        }

        if (!exportVouchers.isEmpty()) {
            exportVouchers.forEach(voucher -> {
                if (voucher.getCustomerId() == null) {
                    System.err.println(voucher.getVoucherCode() + " khong co customerId");
                    return;
                }
                var details = voucherDetailRepo.findItemTransHistory(voucher.getVoucherCode(), productId);
                if (!details.isEmpty()) {
                    details.forEach(detail -> {
                        Customer customer = customerRepo.findById(voucher.getCustomerId()).orElse(null);
                        assert customer != null;
                        var history = ProductTransactionHistoryDTO.builder()
                                .partner(customer.getCustomerName())
                                .postingDate(voucher.getPostingDate())
                                .quantity(detail.getQuantity())
                                .totalAmount(detail.getQuantity() * detail.getUnitPrice())
                                .typeOfTransaction("Xuất hàng")
                                .voucherCode(voucher.getVoucherCode())
                                .build();
                        result.add(history);
                    });
                }
            });
        }

        if (!returnVouchers.isEmpty()) {
            returnVouchers.forEach(voucher -> {
                if (voucher.getCustomerId() == null) {
                    System.err.println(voucher.getVoucherCode() + " khong co customerId");
                    return;
                }
                var details = voucherDetailRepo.findItemTransHistory(voucher.getVoucherCode(), productId);
                if (!details.isEmpty()) {
                    details.forEach(detail -> {
                        Customer customer = customerRepo.findById(voucher.getCustomerId()).orElse(null);
                        assert customer != null;
                        var history = ProductTransactionHistoryDTO.builder()
                                .partner(customer.getCustomerName())
                                .postingDate(voucher.getPostingDate())
                                .quantity(detail.getQuantity())
                                .totalAmount(detail.getQuantity() * detail.getUnitPrice())
                                .typeOfTransaction("Trả hàng")
                                .voucherCode(voucher.getVoucherCode())
                                .build();
                        result.add(history);
                    });
                }
            });
        }
        return result;
    }
}
