package com.rental.listing.dto;

import com.rental.listing.entity.Listing;
import lombok.Data;

import java.math.BigDecimal;
import java.util.UUID;

@Data
public class ListingRequest {
    private UUID ownerId;
    private String title;
    private String description;
    private String location;
    private BigDecimal pricePerNight;
    private Listing.ListingType type;
}
