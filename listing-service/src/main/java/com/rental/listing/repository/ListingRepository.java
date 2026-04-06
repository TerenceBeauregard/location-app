package com.rental.listing.repository;

import com.rental.listing.entity.Listing;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface ListingRepository extends JpaRepository<Listing, UUID> {
    List<Listing> findByAvailableTrue();
    List<Listing> findByOwnerId(UUID ownerId);
}
