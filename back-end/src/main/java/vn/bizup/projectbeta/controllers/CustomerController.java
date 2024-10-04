package vn.bizup.projectbeta.controllers;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.*;
import vn.bizup.projectbeta.models.entities.Customer;
import vn.bizup.projectbeta.models.entities.CustomerType;
import vn.bizup.projectbeta.models.entities.Receipt;
import vn.bizup.projectbeta.repositories.ICustomerRepo;
import vn.bizup.projectbeta.repositories.ICustomerTypeRepo;
import vn.bizup.projectbeta.repositories.IReceiptRepo;

import java.util.Optional;

@RestController
@RequestMapping("${apiPrefix}/customer")
@RequiredArgsConstructor
public class CustomerController {
    private final ICustomerRepo customerRepo;
    private final ICustomerTypeRepo customerTypeRepo;
    private final IReceiptRepo receiptRepo;

    @GetMapping("/type")
    public ResponseEntity<?> findAllCustomerTypes() {
        var response = customerTypeRepo.findAll();
        if (response.isEmpty()) return ResponseEntity.status(404).build();
        return ResponseEntity.ok(response);
    }

    @PostMapping("/type")
    public ResponseEntity<?> saveCustomerType(@Valid @RequestBody CustomerType customerType,
                                              BindingResult bindingResult) {
        if (bindingResult.hasErrors()) return ResponseEntity.status(406).build();
        customerTypeRepo.save(customerType);
        return ResponseEntity.status(200).build();
    }

    @GetMapping()
    public ResponseEntity<?> findAllCustomer(@RequestParam("customerTypeId") Optional<Short> customerTypeId) {
        var response = (customerTypeId.isEmpty()) ?
                customerRepo.findAll() :
                customerRepo.findByCustomerTypeId(customerTypeId.get());
        if (response.isEmpty()) return ResponseEntity.status(404).build();
        return ResponseEntity.ok(response);
    }

    @GetMapping("/customer-dto")
    public ResponseEntity<?> findAllCustomerDTO() {
        var response = customerRepo.getCustomerDTO();
        if (response.isEmpty()) return ResponseEntity.status(404).build();
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{customerId}")
    public ResponseEntity<?> findCustomerById(@PathVariable("customerId") Integer customerId) {
        var response = customerRepo.findById(customerId);
        if (response.isEmpty()) return ResponseEntity.status(404).build();
        return ResponseEntity.ok(response.get());
    }

    @PostMapping()
    public ResponseEntity<?> saveProduct(@Valid @RequestBody Customer customer,
                                         BindingResult bindingResult) {
        if (bindingResult.hasErrors()) return ResponseEntity.status(406).build();
        customerRepo.save(customer);
        return ResponseEntity.status(200).build();
    }

    @GetMapping("/receipt/{customerId}")
    public ResponseEntity<?> saveReceipt(@PathVariable("customerId") Integer customerId) {
        var response = receiptRepo.findByCustomerId(customerId);
        if (response.isEmpty()) return ResponseEntity.status(404).build();
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/receipt/{receiptId}")
    public ResponseEntity<?> saveReceipt(@PathVariable("receiptId") Long receiptId) {
        var receipt = receiptRepo.findById(receiptId).orElse(null);
        if (receipt == null) return ResponseEntity.status(404).build();
        customerRepo.updateAccountReceivable(receipt.getCustomerId(), receipt.getAmount());
        receiptRepo.deleteById(receiptId);
        return ResponseEntity.status(202).build();
    }

    @PostMapping("/receipt")
    public ResponseEntity<?> saveReceipt(@Valid @RequestBody Receipt receipt,
                                         BindingResult bindingResult) {
        if (bindingResult.hasErrors()) return ResponseEntity.status(406).build();
        receiptRepo.save(receipt);
        customerRepo.updateAccountReceivable(receipt.getCustomerId(), -receipt.getAmount());
        return ResponseEntity.status(200).build();
    }

    @DeleteMapping("/{customerId}")
    public ResponseEntity<?> deleteProduct(@PathVariable("customerId") Integer customerId) {
        customerRepo.deleteById(customerId);
        return ResponseEntity.status(200).build();
    }
}
