package com.vehiclemanagement.controller;

import com.vehiclemanagement.dto.*;
import com.vehiclemanagement.repository.BookingRepository;
import com.vehiclemanagement.service.VehicleService;
import jakarta.validation.Valid;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/vehicles")
public class VehicleController {

    private final VehicleService     service;
    private final BookingRepository  bookingRepo;

    public VehicleController(VehicleService service, BookingRepository bookingRepo) {
        this.service     = service;
        this.bookingRepo = bookingRepo;
    }

    @GetMapping
    public List<VehicleResponse> listAll() {
        return service.findAll();
    }

    @GetMapping("/{id}")
    public VehicleResponse getById(@PathVariable Integer id) {
        return service.findById(id)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Vehicle not found"));
    }

    @PostMapping
    public ResponseEntity<VehicleResponse> create(@Valid @RequestBody CreateVehicleRequest req) {
        return ResponseEntity.status(HttpStatus.CREATED).body(service.create(req));
    }

    @PutMapping("/{id}")
    public VehicleResponse update(@PathVariable Integer id,
                                  @RequestBody CreateVehicleRequest req) {
        return service.update(id, req)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Vehicle not found"));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Integer id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{id}/mileage")
    public VehicleResponse updateMileage(@PathVariable Integer id,
                                         @Valid @RequestBody UpdateMileageRequest req) {
        return service.updateMileage(id, req.getMileageKm())
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Vehicle not found"));
    }

    @GetMapping("/{id}/availability")
    public AvailabilityResponse checkAvailability(
            @PathVariable Integer id,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {

        var conflicts = bookingRepo.findConflictingBookings(id, startDate, endDate);
        boolean available = conflicts.isEmpty();

        List<AvailabilityResponse.ConflictingBooking> conflictDtos = conflicts.stream()
            .map(b -> new AvailabilityResponse.ConflictingBooking(
                b.getId(),
                b.getStartDate().toString(),
                b.getEndDate().toString(),
                b.getStatus()))
            .collect(Collectors.toList());

        return new AvailabilityResponse(available, conflictDtos);
    }
}
