package vn.bizup.projectbeta.services;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import vn.bizup.projectbeta.models.dto.ExportVoucherForm;
import vn.bizup.projectbeta.models.dto.ImportVoucherForm;
import vn.bizup.projectbeta.models.dto.ProductForm;
import vn.bizup.projectbeta.models.dto.ReturnVoucherForm;
import vn.bizup.projectbeta.models.entities.*;
import vn.bizup.projectbeta.repositories.*;
import vn.bizup.projectbeta.utils.VoucherCodeUtil;

import java.util.ArrayList;
import java.util.Date;
import java.util.List;

@Service
@RequiredArgsConstructor
public class WarehouseService {
    private final IInventoryRepo inventoryRepo;
    private final IVoucherDetailRepo voucherDetailRepo;
    private final IImportVoucherRepo importVoucherRepo;
    private final IExportVoucherRepo exportVoucherRepo;
    private final IReturnVoucherRepo returnVoucherRepo;
    private final IProductRepo productRepo;
    private final IQuotationDetailRepo quotationDetailRepo;
    private final ICustomerRepo customerRepo;

    @Transactional
    public void createImportVoucher(ImportVoucherForm form) {
        var voucherCode = form.getVoucherCode();
        var voucherCodes = importVoucherRepo.findAllCodes();
        if (voucherCodes.contains(voucherCode)) {
            voucherCode = VoucherCodeUtil.uniqueCodeGenerator(voucherCodes.get(0));
        }
        var voucher = ImportVoucher.builder()
                .voucherCode(voucherCode)
                .createdBy(form.getCreatedBy())
                .address(form.getAddress())
                .billing(form.getBilling())
                .postingDate(form.getPostingDate())
                .supplier(form.getSupplier())
                .description(form.getDescription())
                .totalAmount(form.getTotalAmount())
                .build();
        importVoucherRepo.save(voucher);
        createVoucherDetails(form.getDetails(), voucherCode, "import");
        createInventories(form.getDetails(), voucherCode, form.getPostingDate());
    }

    @Transactional
    public void createExportVoucher(ExportVoucherForm form) {
        var voucherCode = form.getVoucherCode();
        var voucherCodes = exportVoucherRepo.findAllCodes();
        if (voucherCodes.contains(voucherCode)) {
            voucherCode = VoucherCodeUtil.uniqueCodeGenerator(voucherCodes.get(0));
        }
        var voucher = ExportVoucher.builder()
                .voucherCode(voucherCode)
                .createdBy(form.getCreatedBy())
                .customerId(form.getCustomerId())
                .totalAmount(form.getTotalAmount())
                .discount(form.getDiscount())
                .postingDate(form.getPostingDate())
                .description(form.getDescription())
                .build();
        exportVoucherRepo.save(voucher);
        createVoucherDetails(form.getDetails(), voucherCode, "export");
        updateInventory(form.getDetails());
        customerRepo.updateAccountReceivable(form.getCustomerId(), form.getTotalAmount());
    }

    public void createReturnVoucher(ReturnVoucherForm form) {
        var voucherCode = form.getVoucherCode();
        var voucherCodes = returnVoucherRepo.findAllCodes();
        if (voucherCodes.contains(voucherCode)) {
            voucherCode = VoucherCodeUtil.uniqueCodeGenerator(voucherCodes.get(0));
        }
        var voucher = ReturnVoucher.builder()
                .voucherCode(voucherCode)
                .createdBy(form.getCreatedBy())
                .postingDate(form.getPostingDate())
                .customerId(form.getCustomerId())
                .customerName(form.getCustomerName())
                .description(form.getDescription())
                .totalAmount(form.getTotalAmount())
                .build();
        returnVoucherRepo.save(voucher);
        createVoucherDetails(form.getDetails(), voucherCode, "return");
        createInventories(form.getDetails(), voucherCode, form.getPostingDate());
    }

    @Transactional
    public void updateExportVoucher(ExportVoucherForm form) {
        List<VoucherDetail> voucherDetails = voucherDetailRepo.findAllByVoucherCode(form.getVoucherCode());
        var voucher = exportVoucherRepo.findByVoucherCode(form.getVoucherCode());
        // Deleting/adjusting current data
        voucherDetailRepo.deleteByVoucherCode(form.getVoucherCode());
        customerRepo.updateAccountReceivable(form.getCustomerId(), -voucher.getTotalAmount());
        restockTheInventory(voucherDetails);
        // Writing new data
        voucher.setTotalAmount(form.getTotalAmount());
        voucher.setDiscount(form.getDiscount());
        exportVoucherRepo.save(voucher);
        createVoucherDetails(form.getDetails(), form.getVoucherCode(), "export");
        updateInventory(form.getDetails());
        customerRepo.updateAccountReceivable(form.getCustomerId(), form.getTotalAmount());
    }

    @Transactional
    public void updateImportVoucher(ImportVoucherForm form) throws RuntimeException {
        List<VoucherDetail> voucherDetails = voucherDetailRepo.findAllByVoucherCode(form.getVoucherCode());
        var voucher = importVoucherRepo.findByVoucherCode(form.getVoucherCode());
        // Deleting/adjusting current data
        deleteInventory(form.getVoucherCode());
        voucherDetailRepo.deleteByVoucherCode(form.getVoucherCode());
        //Update information
        voucher.setTotalAmount(form.getTotalAmount());
        importVoucherRepo.save(voucher);
        createVoucherDetails(form.getDetails(), form.getVoucherCode(), "import");
        createInventories(form.getDetails(), form.getVoucherCode(), voucher.getPostingDate());
    }

    private void updateInventory(List<VoucherDetail> details) {
        if (details.isEmpty()) return;
        for (var detail : details) {
            var exportQuantity = detail.getQuantity();
            while (exportQuantity > 0) {
                var inventory = inventoryRepo.findByProductId(detail.getProductId());
                var remainingQuantity = inventory.getRemainingQuantity();
                if (remainingQuantity > exportQuantity) {
                    inventory.setRemainingQuantity(remainingQuantity - exportQuantity);
                    exportQuantity = 0;
                } else {
                    inventory.setRemainingQuantity(0);
                    exportQuantity = exportQuantity - remainingQuantity;
                }
                inventoryRepo.save(inventory);
            }
        }
    }

    private void createVoucherDetails(List<VoucherDetail> details, String voucherCode, String voucherType) {
        for (var detail : details) {
            detail.setVoucherCode(voucherCode);
            detail.setVoucherType(voucherType);
        }
        voucherDetailRepo.saveAll(details);
    }

    private void createInventories(List<VoucherDetail> details, String voucherCode, Date importDate) {
        List<Inventory> inventories = new ArrayList<>();
        for (var detail : details) {
            var inventory = Inventory.builder()
                    .voucherCode(voucherCode)
                    .importDate(importDate)
                    .unitPrice(detail.getUnitPrice())
                    .importQuantity(detail.getQuantity())
                    .remainingQuantity(detail.getQuantity())
                    .productId(detail.getProductId())
                    .build();
            inventories.add(inventory);
        }
        inventoryRepo.saveAll(inventories);
    }

    private void deleteInventory(String voucherCode) throws RuntimeException {
        List<Inventory> inventories = inventoryRepo.findAllByVoucherCode(voucherCode);
        inventories.forEach(item -> {
            if (item.getRemainingQuantity() != item.getImportQuantity()) throw new RuntimeException();
        });
        inventoryRepo.deleteAllByVoucherCode(voucherCode);
    }

    public void createProduct(ProductForm form) {
        var product = Product.builder()
                .productTypeId(form.getProductTypeId())
                .productName(form.getProductName())
                .productType(form.getProductType())
                .unit(form.getUnit())
                .barcode(form.getBarcode())
                .packingSpecifications(form.getPackingSpecifications())
                .build();
        var productId = productRepo.save(product).getProductId();
        List<QuotationDetail> quotations = form.getQuotations();
        quotations = quotations.stream().filter(quotationDetail -> quotationDetail.getUnitPrice() >= 0).toList();
        quotations.forEach(quotationDetail -> {
            quotationDetail.setProductId(productId);
        });
        quotationDetailRepo.saveAll(quotations);
    }

    public void updateProduct(ProductForm form) {
        var product = Product.builder()
                .productId(form.getProductId())
                .productTypeId(form.getProductTypeId())
                .productName(form.getProductName())
                .productType(form.getProductType())
                .unit(form.getUnit())
                .barcode(form.getBarcode())
                .packingSpecifications(form.getPackingSpecifications())
                .build();
        productRepo.save(product);
        quotationDetailRepo.deleteAllByProductId(form.getProductId());
        List<QuotationDetail> quotations = form.getQuotations();
        quotations = quotations.stream().filter(quotationDetail -> quotationDetail.getUnitPrice() >= 0).toList();
        quotations.forEach(quotationDetail -> {
            quotationDetail.setProductId(form.getProductId());
        });
        quotationDetailRepo.saveAll(quotations);
    }

    private void restockTheInventory(List<VoucherDetail> voucherDetails) {
        List<Inventory> updatedInv = new ArrayList<>();
        voucherDetails.forEach(voucherDetail -> {
            var inventories = inventoryRepo.findAllByProductId(voucherDetail.getProductId());
            var exportQty = voucherDetail.getQuantity();
            for (var inventory : inventories) {
                var remainingQty = inventory.getRemainingQuantity();
                var importQty = inventory.getImportQuantity();
                if (remainingQty + exportQty <= importQty) {
                    inventory.setRemainingQuantity(remainingQty + exportQty);
                    updatedInv.add(inventory);
                    break;
                } else {
                    exportQty -= (importQty - remainingQty);
                    inventory.setRemainingQuantity(importQty);
                    updatedInv.add(inventory);
                }
            }
        });
        inventoryRepo.saveAll(updatedInv);
    }

    @Transactional
    public void deleteExportVoucher(ExportVoucher voucher) {
        var voucherDetails = voucherDetailRepo.findAllByVoucherCode(voucher.getVoucherCode());
        this.restockTheInventory(voucherDetails);
        voucherDetailRepo.deleteByVoucherCode(voucher.getVoucherCode());
        exportVoucherRepo.deleteByVoucherCode(voucher.getVoucherCode());
        customerRepo.updateAccountReceivable(voucher.getCustomerId(), -voucher.getTotalAmount());
    }
}
