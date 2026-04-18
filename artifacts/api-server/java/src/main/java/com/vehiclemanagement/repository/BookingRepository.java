package com.vehiclemanagement.repository;

import com.vehiclemanagement.entity.Booking;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface BookingRepository extends JpaRepository<Booking, Integer> {

    List<Booking> findAllByOrderByCreatedAtAsc();

    @Query("SELECT b FROM Booking b WHERE b.vehicleId = :vehicleId " +
           "AND (b.status = 'Pending' OR b.status = 'Active') " +
           "AND b.startDate <= :endDate AND b.endDate >= :startDate")
    List<Booking> findConflictingBookings(
        @Param("vehicleId") Integer vehicleId,
        @Param("startDate") LocalDate startDate,
        @Param("endDate") LocalDate endDate
    );
}
