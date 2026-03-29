package com.rental.notification.dto;
import lombok.Data;
@Data
public class BookingEvent {
    private String bookingId;
    private String listingId;
    private String userId;
    private String status;
}
