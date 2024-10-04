package vn.bizup.projectbeta.controllers;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.*;
import vn.bizup.projectbeta.models.dto.ProductForm;
import vn.bizup.projectbeta.models.entities.Product;
import vn.bizup.projectbeta.models.entities.ProductType;
import vn.bizup.projectbeta.repositories.IProductRepo;
import vn.bizup.projectbeta.repositories.IProductTypeRepo;
import vn.bizup.projectbeta.services.WarehouseService;

import java.util.Optional;

@RestController
@RequestMapping("${apiPrefix}/product")
@RequiredArgsConstructor
public class ProductController {
    private final IProductRepo productRepo;
    private final IProductTypeRepo productTypeRepo;
    private final WarehouseService warehouseService;

    @GetMapping("/type")
    public ResponseEntity<?> findAllProductTypes() {
        var response = productTypeRepo.findAll();
        if (response.isEmpty()) return ResponseEntity.status(404).build();
        return ResponseEntity.ok(response);
    }

    @PostMapping("/type")
    public ResponseEntity<?> saveProductType(@Valid @RequestBody ProductType productType,
                                             BindingResult bindingResult) {
        if (bindingResult.hasErrors()) return ResponseEntity.status(406).build();
        productTypeRepo.save(productType);
        return ResponseEntity.status(200).build();
    }

    @GetMapping()
    public ResponseEntity<?> findAllProducts() {
        var response = productRepo.findAll();
        if (response.isEmpty()) return ResponseEntity.status(404).build();
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{productId}")
    public ResponseEntity<?> findAllProductById(@PathVariable("productId") Integer productId) {
        var response = productRepo.findProductById(productId);
        if (response == null) return ResponseEntity.status(404).build();
        return ResponseEntity.ok(response);
    }

    @PostMapping()
    public ResponseEntity<?> saveProduct(@Valid @RequestBody ProductForm form,
                                         BindingResult bindingResult) {
        if (bindingResult.hasErrors()) return ResponseEntity.status(406).build();
        warehouseService.createProduct(form);
        return ResponseEntity.ok().build();
    }

    @PutMapping()
    public ResponseEntity<?> updateProduct(@Valid @RequestBody ProductForm form,
                                           BindingResult bindingResult) {
        if (bindingResult.hasErrors()) return ResponseEntity.status(406).build();
        warehouseService.updateProduct(form);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{productId}")
    public ResponseEntity<?> deleteProduct(@PathVariable("productId") Integer productId) {
        productRepo.deleteById(productId);
        return ResponseEntity.status(200).build();
    }

}
