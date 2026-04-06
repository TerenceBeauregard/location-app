package com.rental.listing.repository;

import com.rental.listing.entity.Listing;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

public interface ListingRepository extends JpaRepository<Listing, UUID> {

    List<Listing> findByOwnerId(UUID ownerId);

    @Query("""
        SELECT l FROM Listing l
        WHERE l.available = true
          AND (:type IS NULL OR l.type = :type)
          AND (:location IS NULL OR LOWER(l.location) LIKE LOWER(CONCAT('%', :location, '%')))
          AND (:minPrice IS NULL OR l.pricePerMonth >= :minPrice)
          AND (:maxPrice IS NULL OR l.pricePerMonth <= :maxPrice)
        ORDER BY l.createdAt DESC
        """)
    List<Listing> findWithFilters(
        @Param("type") Listing.ListingType type,
        @Param("location") String location,
        @Param("minPrice") BigDecimal minPrice,
        @Param("maxPrice") BigDecimal maxPrice
    );
}
