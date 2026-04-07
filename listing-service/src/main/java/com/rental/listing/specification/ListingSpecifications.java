package com.rental.listing.specification;

import com.rental.listing.entity.Listing;
import org.springframework.data.jpa.domain.Specification;

import java.math.BigDecimal;

public class ListingSpecifications {

    public static Specification<Listing> isAvailable() {
        return (root, query, cb) -> cb.isTrue(root.get("available"));
    }

    public static Specification<Listing> hasType(Listing.ListingType type) {
        return (root, query, cb) -> type == null ? null : cb.equal(root.get("type"), type);
    }

    public static Specification<Listing> locationContains(String location) {
        if (location == null || location.isBlank()) return (root, query, cb) -> null;
        return (root, query, cb) ->
            cb.like(cb.lower(root.get("location")), "%" + location.toLowerCase() + "%");
    }

    public static Specification<Listing> minPrice(BigDecimal minPrice) {
        return (root, query, cb) -> minPrice == null ? null :
            cb.greaterThanOrEqualTo(root.get("pricePerNight"), minPrice);
    }

    public static Specification<Listing> maxPrice(BigDecimal maxPrice) {
        return (root, query, cb) -> maxPrice == null ? null :
            cb.lessThanOrEqualTo(root.get("pricePerNight"), maxPrice);
    }
}
