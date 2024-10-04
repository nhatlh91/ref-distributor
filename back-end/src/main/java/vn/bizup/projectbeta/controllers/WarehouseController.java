package vn.bizup.projectbeta.controllers;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.*;
import vn.bizup.projectbeta.models.dto.ExportVoucherForm;
import vn.bizup.projectbeta.models.dto.ImportVoucherForm;
import vn.bizup.projectbeta.models.dto.ReturnVoucherForm;
import vn.bizup.projectbeta.models.entities.Inventory;
import vn.bizup.projectbeta.repositories.*;
import vn.bizup.projectbeta.services.WarehouseService;

import java.time.Year;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("${apiPrefix}/warehouse")
@RequiredArgsConstructor
public class WarehouseController {
    private final WarehouseService warehouseService;
    private final IImportVoucherRepo importVoucherRepo;
    private final IExportVoucherRepo exportVoucherRepo;
    private final IReturnVoucherRepo returnVoucherRepo;
    private final IVoucherDetailRepo voucherDetailRepo;
    private final ICustomerRepo customerRepo;
    private final IInventoryRepo inventoryRepo;

    @GetMapping("/import-voucher")
    public ResponseEntity<?> getAllImportVouchers(@RequestParam Optional<Integer> year,
                                                  @RequestParam Optional<Integer> month) {
        var queryYear = year.orElse(Year.now().getValue());
        var queryMonth = month.orElse(null);
        var response = importVoucherRepo.findAll(queryYear, queryMonth);
        if (response.isEmpty()) return ResponseEntity.status(404).build();
        return ResponseEntity.ok(response);
    }

    @GetMapping("/export-voucher")
    public ResponseEntity<?> getAllExportVouchers(@RequestParam Optional<Integer> year,
                                                  @RequestParam Optional<Integer> month) {
        var queryYear = year.orElse(Year.now().getValue());
        var queryMonth = month.orElse(null);
        var response = exportVoucherRepo.findAll(queryYear, queryMonth);
        if (response.isEmpty()) return ResponseEntity.status(404).build();
        return ResponseEntity.ok(response);
    }

    @GetMapping("/return-voucher")
    public ResponseEntity<?> getAllReturnVouchers(@RequestParam Optional<Integer> year,
                                                  @RequestParam Optional<Integer> month) {
        var queryYear = year.orElse(Year.now().getValue());
        var queryMonth = month.orElse(null);
        var response = returnVoucherRepo.findAll(queryYear, queryMonth);
        if (response.isEmpty()) return ResponseEntity.status(404).build();
        return ResponseEntity.ok(response);
    }

    @GetMapping("/import-voucher/{voucherCode}")
    public ResponseEntity<?> getImportVoucher(@PathVariable("voucherCode") String voucherCode) {
        var response = importVoucherRepo.findByVoucherCode(voucherCode);
        if (response == null) return ResponseEntity.status(404).build();
        return ResponseEntity.ok(response);
    }

    @GetMapping("/export-voucher/{voucherCode}")
    public ResponseEntity<?> getExportVoucher(@PathVariable("voucherCode") String voucherCode) {
        var response = exportVoucherRepo.getByVoucherCode(voucherCode);
        if (response == null) return ResponseEntity.status(404).build();
        return ResponseEntity.ok(response);
    }

    @GetMapping("/import-voucher/last-code")
    public ResponseEntity<?> getLastImportVoucherCodes() {
        var response = importVoucherRepo.findLastCodes();
        if (response.isEmpty()) return ResponseEntity.status(404).build();
        return ResponseEntity.ok(response);
    }

    @GetMapping("/export-voucher/last-code")
    public ResponseEntity<?> getLastExportVoucherCodes() {
        var response = exportVoucherRepo.findLastCodes();
        if (response.isEmpty()) return ResponseEntity.status(404).build();
        return ResponseEntity.ok(response);
    }

    @GetMapping("/return-voucher/last-code")
    public ResponseEntity<?> getLastReturnVoucherCodes() {
        var response = returnVoucherRepo.findLastCodes();
        if (response.isEmpty()) return ResponseEntity.status(404).build();
        return ResponseEntity.ok(response);
    }

    @GetMapping("/voucher-detail/{voucherCode}")
    public ResponseEntity<?> getAllDetail(@PathVariable("voucherCode") String voucherCode) {
        var response = voucherDetailRepo.findAllByVoucherCode(voucherCode);
        if (response.isEmpty()) return ResponseEntity.status(404).build();
        return ResponseEntity.ok(response);
    }

    @GetMapping("/inventory")
    public ResponseEntity<?> getInventory(@RequestParam("productTypeId") Optional<Short> productTypeId) {
        var response = inventoryRepo.findAllDTO(productTypeId.orElse(null));
        if (response.isEmpty()) return ResponseEntity.status(404).build();
        return ResponseEntity.ok(response);
    }

    @GetMapping("/inventory/productId/{productId}")
    public ResponseEntity<?> getInventory(@PathVariable("productId") Integer productId) {
        var response = inventoryRepo.findStockByProductId(productId);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/import-voucher")
    public ResponseEntity<?> saveImportVouchers(@Valid @RequestBody ImportVoucherForm form,
                                                BindingResult bindingResult) {
        if (bindingResult.hasErrors()) return ResponseEntity.status(406).build();
        warehouseService.createImportVoucher(form);
        return ResponseEntity.status(200).build();
    }

    @PostMapping("/export-voucher")
    public ResponseEntity<?> saveExportVouchers(@Valid @RequestBody ExportVoucherForm form,
                                                BindingResult bindingResult) {
        if (bindingResult.hasErrors()) return ResponseEntity.status(406).build();
        warehouseService.createExportVoucher(form);
        return ResponseEntity.status(200).build();
    }

    @PostMapping("/return-voucher")
    public ResponseEntity<?> saveReturnVouchers(@Valid @RequestBody ReturnVoucherForm form,
                                                BindingResult bindingResult) {
        if (bindingResult.hasErrors()) return ResponseEntity.status(406).build();
        warehouseService.createReturnVoucher(form);
        return ResponseEntity.status(200).build();
    }

    @PutMapping("/export-voucher")
    public ResponseEntity<?> updateExportVoucher(@Valid @RequestBody ExportVoucherForm form,
                                                 BindingResult bindingResult) {
        if (bindingResult.hasErrors()) return ResponseEntity.status(406).build();
        warehouseService.updateExportVoucher(form);
        return ResponseEntity.status(200).build();
    }

    @PutMapping("/import-voucher")
    public ResponseEntity<?> updateImportVoucher(@Valid @RequestBody ImportVoucherForm form,
                                                 BindingResult bindingResult) {
        if (bindingResult.hasErrors()) return ResponseEntity.status(406).build();
        try {
            warehouseService.updateImportVoucher(form);
            return ResponseEntity.status(200).build();
        } catch (RuntimeException e) {
            return ResponseEntity.status(406).build();
        }
    }

    @DeleteMapping("/import-voucher/{voucherCode}")
    public ResponseEntity<?> deleteImportVoucher(@PathVariable("voucherCode") String voucherCode) {
        List<Inventory> invs = inventoryRepo.findAllByVoucherCode(voucherCode);
        for (var inv : invs) {
            if (inv.getRemainingQuantity() < inv.getImportQuantity()) return ResponseEntity.status(405).build();
        }
        inventoryRepo.deleteAllByVoucherCode(voucherCode);
        importVoucherRepo.deleteByVoucherCode(voucherCode);
        voucherDetailRepo.deleteByVoucherCode(voucherCode);
        return ResponseEntity.status(200).build();
    }

    @DeleteMapping("/export-voucher/{voucherCode}")
    public ResponseEntity<?> deleteExportVoucher(@PathVariable("voucherCode") String voucherCode) {
        var voucher = exportVoucherRepo.findByVoucherCode(voucherCode);
        if (voucher == null) return ResponseEntity.status(404).build();
        warehouseService.deleteExportVoucher(voucher);
        return ResponseEntity.status(200).build();
    }

    @DeleteMapping("/return-voucher/{voucherCode}")
    public ResponseEntity<?> deleteReturnVoucher(@PathVariable("voucherCode") String voucherCode) {
        List<Inventory> invs = inventoryRepo.findAllByVoucherCode(voucherCode);
        for (var inv : invs) {
            if (inv.getRemainingQuantity() < inv.getImportQuantity()) return ResponseEntity.status(405).build();
        }
        inventoryRepo.deleteAllByVoucherCode(voucherCode);
        returnVoucherRepo.deleteByVoucherCode(voucherCode);
        voucherDetailRepo.deleteByVoucherCode(voucherCode);
        var voucher = returnVoucherRepo.getByVoucherCode(voucherCode);
        customerRepo.updateAccountReceivable(voucher.getCustomerId(), -voucher.getTotalAmount());
        return ResponseEntity.status(200).build();
    }
}
