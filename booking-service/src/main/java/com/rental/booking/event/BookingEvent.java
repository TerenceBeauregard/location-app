package com.rental.booking.event;

import lombok.Data;

@Data
public class BookingEvent {
    private String bookingId;
    private String listingId;
    private String userId;
    private String status;
}
