package com.rental.booking.controller;

import com.rental.booking.dto.BookingRequest;
import com.rental.booking.entity.Booking;
import com.rental.booking.publisher.BookingEventPublisher;
import com.rental.booking.repository.BookingRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

@RestController
@RequestMapping("/bookings")
@RequiredArgsConstructor
public class BookingController {

    private final BookingRepository bookingRepository;
    private final BookingEventPublisher bookingEventPublisher;

    @PostMapping
    public ResponseEntity<?> createBooking(@RequestBody BookingRequest request) {
        if (request.getStartDate() == null || request.getEndDate() == null
                || !request.getEndDate().isAfter(request.getStartDate())) {
            return ResponseEntity.badRequest().body(Map.of("message", "Invalid dates: end must be after start"));
        }
        if (request.getStartDate().isBefore(LocalDate.now())) {
            return ResponseEntity.badRequest().body(Map.of("message", "Start date cannot be in the past"));
        }
        if (bookingRepository.existsConflict(request.getListingId(), request.getStartDate(), request.getEndDate())) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(Map.of("message", "These dates are already booked"));
        }

        Booking booking = Booking.builder()
                .listingId(request.getListingId())
                .tenantId(request.getTenantId())
                .startDate(request.getStartDate())
                .endDate(request.getEndDate())
                .build();

        return ResponseEntity.status(HttpStatus.CREATED).body(bookingRepository.save(booking));
    }

    @GetMapping("/listing/{listingId}")
    public List<Booking> getByListing(@PathVariable UUID listingId) {
        return bookingRepository.findByListingId(listingId);
    }

    @GetMapping("/tenant/{tenantId}")
    public List<Booking> getByTenant(@PathVariable UUID tenantId) {
        return bookingRepository.findByTenantId(tenantId);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> cancelBooking(@PathVariable UUID id) {
        bookingRepository.findById(id).ifPresent(b -> {
            b.setStatus(Booking.BookingStatus.CANCELLED);
            bookingRepository.save(b);
        });
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/{id}/confirm")
    public ResponseEntity<?> confirmBooking(@PathVariable UUID id) {
        Optional<Booking> opt = bookingRepository.findById(id);
        if (opt.isEmpty()) return ResponseEntity.notFound().build();
        Booking b = opt.get();
        b.setStatus(Booking.BookingStatus.CONFIRMED);
        Booking saved = bookingRepository.save(b);
        bookingEventPublisher.publishBookingConfirmed(
                saved.getId().toString(),
                saved.getListingId().toString(),
                saved.getTenantId().toString()
        );
        return ResponseEntity.ok(saved);
    }

    @PutMapping("/{id}/reject")
    public ResponseEntity<?> rejectBooking(@PathVariable UUID id) {
        Optional<Booking> opt = bookingRepository.findById(id);
        if (opt.isEmpty()) return ResponseEntity.notFound().build();
        Booking b = opt.get();
        b.setStatus(Booking.BookingStatus.REJECTED);
        return ResponseEntity.ok(bookingRepository.save(b));
    }

    @GetMapping("/by-listings")
    public List<Booking> getByListings(@RequestParam List<UUID> ids) {
        if (ids == null || ids.isEmpty()) return List.of();
        return bookingRepository.findByListingIdIn(ids);
    }
}
