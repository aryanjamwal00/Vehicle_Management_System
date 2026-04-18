package com.vehiclemanagement.controller;

import com.vehiclemanagement.dto.BookingResponse;
import com.vehiclemanagement.dto.CreateBookingRequest;
import com.vehiclemanagement.dto.UpdateBookingStatusRequest;
import com.vehiclemanagement.service.BookingService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@RestController
@RequestMapping("/bookings")
public class BookingController {

    private final BookingService service;

    public BookingController(BookingService service) {
        this.service = service;
    }

    @GetMapping
    public List<BookingResponse> listAll() {
        return service.findAll();
    }

    @GetMapping("/{id}")
    public BookingResponse getById(@PathVariable Integer id) {
        return service.findById(id)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Booking not found"));
    }

    @PostMapping
    public ResponseEntity<BookingResponse> create(@Valid @RequestBody CreateBookingRequest req) {
        return ResponseEntity.status(HttpStatus.CREATED).body(service.create(req));
    }

    @PatchMapping("/{id}/status")
    public BookingResponse updateStatus(@PathVariable Integer id,
                                        @Valid @RequestBody UpdateBookingStatusRequest req) {
        return service.updateStatus(id, req);
    }
}
