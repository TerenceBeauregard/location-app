package com.rental.listing.controller;

import com.rental.listing.dto.ListingRequest;
import com.rental.listing.entity.Listing;
import com.rental.listing.publisher.ListingEventPublisher;
import com.rental.listing.repository.ListingRepository;
import com.rental.listing.specification.ListingSpecifications;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/listings")
@RequiredArgsConstructor
public class ListingController {

    private final ListingRepository listingRepository;
    private final ListingEventPublisher listingEventPublisher;

    @GetMapping
    public List<Listing> getAvailableListings(
            @RequestParam(required = false) Listing.ListingType type,
            @RequestParam(required = false) String location,
            @RequestParam(required = false) BigDecimal minPrice,
            @RequestParam(required = false) BigDecimal maxPrice) {

        Specification<Listing> spec = Specification
            .where(ListingSpecifications.isAvailable())
            .and(ListingSpecifications.hasType(type))
            .and(ListingSpecifications.locationContains(location))
            .and(ListingSpecifications.minPrice(minPrice))
            .and(ListingSpecifications.maxPrice(maxPrice));

        return listingRepository.findAll(spec, Sort.by(Sort.Direction.DESC, "createdAt"));
    }

    @GetMapping("/owner/{ownerId}")
    public List<Listing> getOwnerListings(@PathVariable UUID ownerId) {
        return listingRepository.findByOwnerId(ownerId);
    }

    @PostMapping
    public ResponseEntity<Listing> createListing(@RequestBody ListingRequest request) {
        Listing listing = Listing.builder()
                .ownerId(request.getOwnerId())
                .title(request.getTitle())
                .description(request.getDescription())
                .location(request.getLocation())
                .pricePerNight(request.getPricePerNight())
                .type(request.getType())
                .available(true)
                .build();

        Listing saved = listingRepository.save(listing);
        listingEventPublisher.publishListingCreated(
                saved.getId().toString(),
                saved.getTitle(),
                saved.getOwnerId().toString()
        );
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteListing(@PathVariable UUID id) {
        listingRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
