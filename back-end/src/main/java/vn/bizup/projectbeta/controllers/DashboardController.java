package vn.bizup.projectbeta.controllers;


import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import vn.bizup.projectbeta.models.dto.MonthlyRevenueDTO;
import vn.bizup.projectbeta.repositories.*;

import java.time.Year;
import java.util.*;

@RestController
@RequestMapping("${apiPrefix}/dashboard")
@RequiredArgsConstructor
public class DashboardController {
    private final IInventoryRepo inventoryRepo;
    private final ICustomerRepo customerRepo;
    private final IReceiptRepo receiptRepo;
    private final IExportVoucherRepo exportVoucherRepo;
    private final IVoucherDetailRepo voucherDetailRepo;


    @GetMapping("/indicators")
    public ResponseEntity<List<Double>> getIndicators() {
        List<Double> response = new ArrayList<>();
        response.add(inventoryRepo.getTotalInventoryValue().orElse(0.0));
        response.add(customerRepo.getTotalAccountReceivable().orElse(0.0));
        response.add(receiptRepo.getDailyTotalReceipt(new Date()).orElse(0.0));
        response.add(exportVoucherRepo.getMonthlyTotalExportAmount(new Date()).orElse(0.0));
        response.add(receiptRepo.getMonthlyTotalReceipt(new Date()).orElse(0.0));
        return ResponseEntity.ok(response);
    }

    @GetMapping("/monthly-revenue")
    public ResponseEntity<List<Double>> getRevenueArray() {
        List<Double> response = new ArrayList<>(List.of(0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0));
        List<MonthlyRevenueDTO> revenues = exportVoucherRepo.getMonthlyRevenue(String.valueOf(Year.now()));
        revenues.forEach(item -> {
            response.set(item.getMonth() - 1, item.getRevenue());
        });
        return ResponseEntity.ok(response);
    }

    @GetMapping("/monthly-cash")
    public ResponseEntity<List<Double>> getCashArray() {
        List<Double> response = new ArrayList<>(List.of(0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0));
        List<MonthlyRevenueDTO> revenues = receiptRepo.getMonthlyCash(String.valueOf(Year.now()));
        revenues.forEach(item -> {
            response.set(item.getMonth() - 1, item.getRevenue());
        });
        return ResponseEntity.ok(response);
    }

    @GetMapping("/daily-revenue")
    public ResponseEntity<?> getDailyRevenueArray() {
        var response = voucherDetailRepo.getDailyRevenueByProductType(new Date());
        if (response.isEmpty()) return ResponseEntity.status(404).build();
        return ResponseEntity.ok(response);
    }

    @GetMapping("/import-value")
    public ResponseEntity<?> getImportValue() {
        var response = voucherDetailRepo.findAllImportValueDTO(new Date());
        if (response.isEmpty()) return ResponseEntity.status(404).build();
        return ResponseEntity.ok(response);
    }
}
