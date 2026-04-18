package com.vehiclemanagement.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "vehicles")
public class Vehicle {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "registration_number", nullable = false, unique = true)
    @NotBlank
    private String registrationNumber;

    @Column(name = "make", nullable = false)
    @NotBlank
    private String make;

    @Column(name = "model", nullable = false)
    @NotBlank
    private String model;

    @Column(name = "year", nullable = false)
    @NotNull
    private Integer year;

    @Column(name = "color", nullable = false)
    @NotBlank
    private String color;

    @Column(name = "fuel_type", nullable = false)
    @NotBlank
    private String fuelType;

    @Column(name = "status", nullable = false)
    private String status = "Active";

    @Column(name = "mileage_km", nullable = false)
    private Integer mileageKm = 0;

    @Column(name = "vehicle_type_id", nullable = false)
    @NotNull
    private Integer vehicleTypeId;

    @Column(name = "customer_id", nullable = false)
    @NotNull
    private Integer customerId;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        if (createdAt == null) createdAt = LocalDateTime.now();
        if (status == null) status = "Active";
        if (mileageKm == null) mileageKm = 0;
    }

    public Integer getId() { return id; }
    public void setId(Integer id) { this.id = id; }

    public String getRegistrationNumber() { return registrationNumber; }
    public void setRegistrationNumber(String registrationNumber) { this.registrationNumber = registrationNumber; }

    public String getMake() { return make; }
    public void setMake(String make) { this.make = make; }

    public String getModel() { return model; }
    public void setModel(String model) { this.model = model; }

    public Integer getYear() { return year; }
    public void setYear(Integer year) { this.year = year; }

    public String getColor() { return color; }
    public void setColor(String color) { this.color = color; }

    public String getFuelType() { return fuelType; }
    public void setFuelType(String fuelType) { this.fuelType = fuelType; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public Integer getMileageKm() { return mileageKm; }
    public void setMileageKm(Integer mileageKm) { this.mileageKm = mileageKm; }

    public Integer getVehicleTypeId() { return vehicleTypeId; }
    public void setVehicleTypeId(Integer vehicleTypeId) { this.vehicleTypeId = vehicleTypeId; }

    public Integer getCustomerId() { return customerId; }
    public void setCustomerId(Integer customerId) { this.customerId = customerId; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
