package com.vehiclemanagement.dto;

import java.util.List;

public class AvailabilityResponse {

    private boolean available;
    private List<ConflictingBooking> conflictingBookings;

    public AvailabilityResponse(boolean available, List<ConflictingBooking> conflictingBookings) {
        this.available = available;
        this.conflictingBookings = conflictingBookings;
    }

    public boolean isAvailable() { return available; }
    public List<ConflictingBooking> getConflictingBookings() { return conflictingBookings; }

    public static class ConflictingBooking {
        private Integer id;
        private String startDate;
        private String endDate;
        private String status;

        public ConflictingBooking(Integer id, String startDate, String endDate, String status) {
            this.id = id;
            this.startDate = startDate;
            this.endDate = endDate;
            this.status = status;
        }

        public Integer getId() { return id; }
        public String getStartDate() { return startDate; }
        public String getEndDate() { return endDate; }
        public String getStatus() { return status; }
    }
}
