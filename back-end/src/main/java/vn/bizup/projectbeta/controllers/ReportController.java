package vn.bizup.projectbeta.controllers;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import vn.bizup.projectbeta.repositories.*;
import vn.bizup.projectbeta.services.ReportService;

import java.time.Year;
import java.util.Optional;

@RestController
@RequestMapping("${apiPrefix}/report")
@RequiredArgsConstructor
public class ReportController {
    private final IVoucherDetailRepo voucherDetailRepo;
    private final IReceiptRepo receiptRepo;
    private final ReportService reportService;

    @GetMapping("/transaction-history")
    public ResponseEntity<?> transactionHistory(@RequestParam("customerId") Integer customerId,
                                                @RequestParam("year") Optional<Integer> year,
                                                @RequestParam("month") Optional<Integer> month) {
        var response = receiptRepo.getTransactionDTO(customerId, year.orElse(Year.now().getValue()), month.orElse(null));
        if (response.isEmpty()) return ResponseEntity.status(404).build();
        return ResponseEntity.ok(response);
    }

    @GetMapping("/sales-record")
    public ResponseEntity<?> transactionHistory(@RequestParam("year") Optional<Integer> year,
                                                @RequestParam("month") Optional<Integer> month) {
        var response = voucherDetailRepo.findAllSalesDTO(year.orElse(Year.now().getValue()), month.orElse(null));
        if (response.isEmpty()) return ResponseEntity.status(404).build();
        return ResponseEntity.ok(response);
    }

    @GetMapping("/sales-history-by-customer")
    public ResponseEntity<?> transactionHistory(@RequestParam("year") Optional<Integer> year,
                                                @RequestParam("month") Optional<Integer> month,
                                                @RequestParam("customerId") Integer customerId) {
        var response = voucherDetailRepo.findSalesHistoryByCustomer(year.orElse(Year.now().getValue()), month.orElse(null), customerId);
        if (response.isEmpty()) return ResponseEntity.status(404).build();
        return ResponseEntity.ok(response);
    }

    @GetMapping("/item-history")
    public ResponseEntity<?> itemTransactionHistory(@RequestParam("begin") String begin,
                                                    @RequestParam("end") String end,
                                                    @RequestParam("productId") Integer productId) {
        var response = reportService.getItemTransHistory(begin, end, productId);
        if (response.isEmpty()) return ResponseEntity.status(404).build();
        return ResponseEntity.ok(response);
    }
}
