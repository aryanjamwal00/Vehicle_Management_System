package com.vehiclemanagement.dto;

import jakarta.validation.constraints.NotBlank;

public class UpdateBookingStatusRequest {

    @NotBlank
    private String status;

    private Integer mileageOnReturn;

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public Integer getMileageOnReturn() { return mileageOnReturn; }
    public void setMileageOnReturn(Integer mileageOnReturn) { this.mileageOnReturn = mileageOnReturn; }
}
