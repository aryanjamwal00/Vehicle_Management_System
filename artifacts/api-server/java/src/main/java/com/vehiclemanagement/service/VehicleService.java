package com.vehiclemanagement.service;

import com.vehiclemanagement.dto.CreateVehicleRequest;
import com.vehiclemanagement.dto.VehicleResponse;
import com.vehiclemanagement.entity.Customer;
import com.vehiclemanagement.entity.Vehicle;
import com.vehiclemanagement.entity.VehicleType;
import com.vehiclemanagement.repository.CustomerRepository;
import com.vehiclemanagement.repository.VehicleRepository;
import com.vehiclemanagement.repository.VehicleTypeRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@Transactional
public class VehicleService {

    private final VehicleRepository vehicleRepo;
    private final VehicleTypeRepository vtRepo;
    private final CustomerRepository customerRepo;

    public VehicleService(VehicleRepository vehicleRepo,
                          VehicleTypeRepository vtRepo,
                          CustomerRepository customerRepo) {
        this.vehicleRepo  = vehicleRepo;
        this.vtRepo        = vtRepo;
        this.customerRepo  = customerRepo;
    }

    public List<VehicleResponse> findAll() {
        return vehicleRepo.findAllByOrderByCreatedAtAsc()
                          .stream()
                          .map(this::toResponse)
                          .collect(Collectors.toList());
    }

    public Optional<VehicleResponse> findById(Integer id) {
        return vehicleRepo.findById(id).map(this::toResponse);
    }

    public VehicleResponse create(CreateVehicleRequest req) {
        Vehicle v = new Vehicle();
        applyRequest(v, req);
        if (v.getMileageKm() == null) v.setMileageKm(0);
        if (v.getStatus()    == null) v.setStatus("Active");
        return toResponse(vehicleRepo.save(v));
    }

    public Optional<VehicleResponse> update(Integer id, CreateVehicleRequest req) {
        return vehicleRepo.findById(id).map(v -> {
            applyRequest(v, req);
            return toResponse(vehicleRepo.save(v));
        });
    }

    public Optional<VehicleResponse> updateMileage(Integer id, Integer mileageKm) {
        return vehicleRepo.findById(id).map(v -> {
            v.setMileageKm(mileageKm);
            return toResponse(vehicleRepo.save(v));
        });
    }

    public void delete(Integer id) {
        vehicleRepo.deleteById(id);
    }

    private void applyRequest(Vehicle v, CreateVehicleRequest req) {
        if (req.getRegistrationNumber() != null)
            v.setRegistrationNumber(req.getRegistrationNumber().toUpperCase());
        if (req.getMake()          != null) v.setMake(req.getMake());
        if (req.getModel()         != null) v.setModel(req.getModel());
        if (req.getYear()          != null) v.setYear(req.getYear());
        if (req.getColor()         != null) v.setColor(req.getColor());
        if (req.getFuelType()      != null) v.setFuelType(req.getFuelType());
        if (req.getStatus()        != null) v.setStatus(req.getStatus());
        if (req.getMileageKm()     != null) v.setMileageKm(req.getMileageKm());
        if (req.getVehicleTypeId() != null) v.setVehicleTypeId(req.getVehicleTypeId());
        if (req.getCustomerId()    != null) v.setCustomerId(req.getCustomerId());
    }

    VehicleResponse toResponse(Vehicle v) {
        VehicleResponse r = new VehicleResponse();
        r.setId(v.getId());
        r.setRegistrationNumber(v.getRegistrationNumber());
        r.setMake(v.getMake());
        r.setModel(v.getModel());
        r.setYear(v.getYear());
        r.setColor(v.getColor());
        r.setFuelType(v.getFuelType());
        r.setStatus(v.getStatus());
        r.setMileageKm(v.getMileageKm());
        r.setVehicleTypeId(v.getVehicleTypeId());
        r.setCustomerId(v.getCustomerId());
        r.setCreatedAt(v.getCreatedAt());

        vtRepo.findById(v.getVehicleTypeId())
              .ifPresent(vt -> r.setVehicleTypeName(vt.getName()));

        customerRepo.findById(v.getCustomerId()).ifPresent(c ->
              r.setCustomerName(c.getFirstName() + " " + c.getLastName()));

        return r;
    }
}
