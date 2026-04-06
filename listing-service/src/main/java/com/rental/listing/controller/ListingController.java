package com.rental.listing.controller;

import com.rental.listing.dto.ListingRequest;
import com.rental.listing.entity.Listing;
import com.rental.listing.repository.ListingRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/listings")
@RequiredArgsConstructor
public class ListingController {

    private final ListingRepository listingRepository;

    @GetMapping
    public List<Listing> getAvailableListings() {
        return listingRepository.findByAvailableTrue();
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
                .pricePerMonth(request.getPricePerMonth())
                .type(request.getType())
                .available(true)
                .build();

        return ResponseEntity.status(HttpStatus.CREATED).body(listingRepository.save(listing));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteListing(@PathVariable UUID id) {
        listingRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
