package com.rental.notification.dto;
import lombok.Data;
@Data
public class ListingEvent {
    private String listingId;
    private String title;
    private String ownerId;
}
