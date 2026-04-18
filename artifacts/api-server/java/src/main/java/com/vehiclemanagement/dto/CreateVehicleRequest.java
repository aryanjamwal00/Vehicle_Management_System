package com.vehiclemanagement.dto;

import jakarta.validation.constraints.*;

public class CreateVehicleRequest {

    @NotBlank
    private String registrationNumber;

    @NotBlank
    private String make;

    @NotBlank
    private String model;

    @NotNull
    private Integer year;

    @NotBlank
    private String color;

    @NotBlank
    private String fuelType;

    private String status;
    private Integer mileageKm;

    @NotNull
    private Integer vehicleTypeId;

    @NotNull
    private Integer customerId;

    public String getRegistrationNumber() { return registrationNumber; }
    public void setRegistrationNumber(String r) { this.registrationNumber = r; }

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
}
