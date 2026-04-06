package com.rental.booking.dto;

import lombok.Data;

import java.time.LocalDate;
import java.util.UUID;

@Data
public class BookingRequest {
    private UUID listingId;
    private UUID tenantId;
    private LocalDate startDate;
    private LocalDate endDate;
}
