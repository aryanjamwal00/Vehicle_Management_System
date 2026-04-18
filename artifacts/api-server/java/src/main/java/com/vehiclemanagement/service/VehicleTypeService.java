package com.vehiclemanagement.service;

import com.vehiclemanagement.dto.CreateVehicleTypeRequest;
import com.vehiclemanagement.entity.VehicleType;
import com.vehiclemanagement.repository.VehicleTypeRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class VehicleTypeService {

    private final VehicleTypeRepository repo;

    public VehicleTypeService(VehicleTypeRepository repo) {
        this.repo = repo;
    }

    public List<VehicleType> findAll() {
        return repo.findAllByOrderByNameAsc();
    }

    public Optional<VehicleType> findById(Integer id) {
        return repo.findById(id);
    }

    public VehicleType create(CreateVehicleTypeRequest req) {
        VehicleType vt = new VehicleType();
        vt.setName(req.getName());
        vt.setDescription(req.getDescription());
        vt.setCategory(req.getCategory());
        return repo.save(vt);
    }

    public Optional<VehicleType> update(Integer id, CreateVehicleTypeRequest req) {
        return repo.findById(id).map(vt -> {
            if (req.getName()        != null) vt.setName(req.getName());
            if (req.getDescription() != null) vt.setDescription(req.getDescription());
            if (req.getCategory()    != null) vt.setCategory(req.getCategory());
            return repo.save(vt);
        });
    }

    public void delete(Integer id) {
        repo.deleteById(id);
    }
}
