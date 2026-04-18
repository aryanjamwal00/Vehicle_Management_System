package com.vehiclemanagement.service;

import com.vehiclemanagement.dto.BookingResponse;
import com.vehiclemanagement.dto.CreateBookingRequest;
import com.vehiclemanagement.dto.UpdateBookingStatusRequest;
import com.vehiclemanagement.entity.Booking;
import com.vehiclemanagement.repository.BookingRepository;
import com.vehiclemanagement.repository.CustomerRepository;
import com.vehiclemanagement.repository.VehicleRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@Transactional
public class BookingService {

    private final BookingRepository  bookingRepo;
    private final VehicleRepository  vehicleRepo;
    private final CustomerRepository customerRepo;

    public BookingService(BookingRepository bookingRepo,
                          VehicleRepository vehicleRepo,
                          CustomerRepository customerRepo) {
        this.bookingRepo  = bookingRepo;
        this.vehicleRepo  = vehicleRepo;
        this.customerRepo = customerRepo;
    }

    public List<BookingResponse> findAll() {
        return bookingRepo.findAllByOrderByCreatedAtAsc()
                          .stream()
                          .map(this::toResponse)
                          .collect(Collectors.toList());
    }

    public Optional<BookingResponse> findById(Integer id) {
        return bookingRepo.findById(id).map(this::toResponse);
    }

    public BookingResponse create(CreateBookingRequest req) {
        if (!req.getStartDate().isBefore(req.getEndDate())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                "Start date must be before end date");
        }

        List<Booking> conflicts = bookingRepo.findConflictingBookings(
            req.getVehicleId(), req.getStartDate(), req.getEndDate());

        if (!conflicts.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                "Vehicle is not available for the selected dates");
        }

        Booking b = new Booking();
        b.setVehicleId(req.getVehicleId());
        b.setCustomerId(req.getCustomerId());
        b.setStartDate(req.getStartDate());
        b.setEndDate(req.getEndDate());
        b.setPurpose(req.getPurpose());
        b.setNotes(req.getNotes());
        b.setStatus("Pending");
        return toResponse(bookingRepo.save(b));
    }

    public BookingResponse updateStatus(Integer id, UpdateBookingStatusRequest req) {
        Booking b = bookingRepo.findById(id)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Booking not found"));

        String newStatus = req.getStatus();
        b.setStatus(newStatus);
        bookingRepo.save(b);

        if ("Completed".equals(newStatus) && req.getMileageOnReturn() != null) {
            vehicleRepo.findById(b.getVehicleId()).ifPresent(v -> {
                v.setMileageKm(req.getMileageOnReturn());
                vehicleRepo.save(v);
            });
        }

        if ("Completed".equals(newStatus) || "Cancelled".equals(newStatus)) {
            vehicleRepo.findById(b.getVehicleId()).ifPresent(v -> {
                v.setStatus("Active");
                vehicleRepo.save(v);
            });
        }

        if ("Active".equals(newStatus)) {
            vehicleRepo.findById(b.getVehicleId()).ifPresent(v -> {
                v.setStatus("On Trip");
                vehicleRepo.save(v);
            });
        }

        return toResponse(b);
    }

    private BookingResponse toResponse(Booking b) {
        BookingResponse r = new BookingResponse();
        r.setId(b.getId());
        r.setVehicleId(b.getVehicleId());
        r.setCustomerId(b.getCustomerId());
        r.setStartDate(b.getStartDate());
        r.setEndDate(b.getEndDate());
        r.setPurpose(b.getPurpose());
        r.setNotes(b.getNotes());
        r.setStatus(b.getStatus());
        r.setCreatedAt(b.getCreatedAt());

        long days = ChronoUnit.DAYS.between(b.getStartDate(), b.getEndDate()) + 1;
        r.setTotalDays(days);

        vehicleRepo.findById(b.getVehicleId()).ifPresent(v -> {
            r.setVehicleName(v.getMake() + " " + v.getModel());
            r.setRegistrationNumber(v.getRegistrationNumber());
        });

        customerRepo.findById(b.getCustomerId()).ifPresent(c ->
            r.setCustomerName(c.getFirstName() + " " + c.getLastName()));

        return r;
    }
}
