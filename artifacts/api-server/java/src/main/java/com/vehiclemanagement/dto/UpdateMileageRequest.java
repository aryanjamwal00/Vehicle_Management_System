package com.vehiclemanagement.dto;

import jakarta.validation.constraints.NotNull;

public class UpdateMileageRequest {

    @NotNull
    private Integer mileageKm;

    public Integer getMileageKm() { return mileageKm; }
    public void setMileageKm(Integer mileageKm) { this.mileageKm = mileageKm; }
}
