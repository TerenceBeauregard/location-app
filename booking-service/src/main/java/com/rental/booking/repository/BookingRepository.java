package com.rental.booking.repository;

import com.rental.booking.entity.Booking;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

public interface BookingRepository extends JpaRepository<Booking, UUID> {

    List<Booking> findByListingId(UUID listingId);

    List<Booking> findByTenantId(UUID tenantId);

    @Query("""
        SELECT COUNT(b) > 0 FROM Booking b
        WHERE b.listingId = :listingId
          AND b.status IN ('PENDING', 'CONFIRMED')
          AND b.startDate < :endDate
          AND b.endDate > :startDate
        """)
    boolean existsConflict(
        @Param("listingId") UUID listingId,
        @Param("startDate") LocalDate startDate,
        @Param("endDate") LocalDate endDate
    );
}
