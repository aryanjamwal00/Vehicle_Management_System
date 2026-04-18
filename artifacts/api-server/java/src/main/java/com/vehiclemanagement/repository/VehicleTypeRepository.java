package com.vehiclemanagement.repository;

import com.vehiclemanagement.entity.VehicleType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface VehicleTypeRepository extends JpaRepository<VehicleType, Integer> {
    List<VehicleType> findAllByOrderByNameAsc();
}
