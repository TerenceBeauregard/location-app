package com.rental.listing.event;

import lombok.Data;

@Data
public class ListingEvent {
    private String listingId;
    private String title;
    private String ownerId;
}
