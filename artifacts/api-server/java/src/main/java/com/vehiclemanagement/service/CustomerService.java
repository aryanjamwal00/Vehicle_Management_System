package com.vehiclemanagement.service;

import com.vehiclemanagement.dto.CreateCustomerRequest;
import com.vehiclemanagement.entity.Customer;
import com.vehiclemanagement.repository.CustomerRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class CustomerService {

    private final CustomerRepository repo;

    public CustomerService(CustomerRepository repo) {
        this.repo = repo;
    }

    public List<Customer> findAll() {
        return repo.findAllByOrderByCreatedAtAsc();
    }

    public Optional<Customer> findById(Integer id) {
        return repo.findById(id);
    }

    public Customer create(CreateCustomerRequest req) {
        Customer c = new Customer();
        c.setFirstName(req.getFirstName());
        c.setLastName(req.getLastName());
        c.setEmail(req.getEmail().toLowerCase());
        c.setPhone(req.getPhone());
        c.setAddress(req.getAddress());
        c.setLicenseNumber(req.getLicenseNumber());
        return repo.save(c);
    }

    public Optional<Customer> update(Integer id, CreateCustomerRequest req) {
        return repo.findById(id).map(c -> {
            if (req.getFirstName()     != null) c.setFirstName(req.getFirstName());
            if (req.getLastName()      != null) c.setLastName(req.getLastName());
            if (req.getEmail()         != null) c.setEmail(req.getEmail().toLowerCase());
            if (req.getPhone()         != null) c.setPhone(req.getPhone());
            if (req.getAddress()       != null) c.setAddress(req.getAddress());
            if (req.getLicenseNumber() != null) c.setLicenseNumber(req.getLicenseNumber());
            return repo.save(c);
        });
    }

    public void delete(Integer id) {
        repo.deleteById(id);
    }
}
