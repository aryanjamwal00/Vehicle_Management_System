package com.vehiclemanagement.controller;

import com.vehiclemanagement.dto.CreateVehicleTypeRequest;
import com.vehiclemanagement.entity.VehicleType;
import com.vehiclemanagement.service.VehicleTypeService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@RestController
@RequestMapping("/vehicle-types")
public class VehicleTypeController {

    private final VehicleTypeService service;

    public VehicleTypeController(VehicleTypeService service) {
        this.service = service;
    }

    @GetMapping
    public List<VehicleType> listAll() {
        return service.findAll();
    }

    @PostMapping
    public ResponseEntity<VehicleType> create(@Valid @RequestBody CreateVehicleTypeRequest req) {
        return ResponseEntity.status(HttpStatus.CREATED).body(service.create(req));
    }

    @PutMapping("/{id}")
    public VehicleType update(@PathVariable Integer id,
                              @Valid @RequestBody CreateVehicleTypeRequest req) {
        return service.update(id, req)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Vehicle type not found"));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Integer id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }
}
