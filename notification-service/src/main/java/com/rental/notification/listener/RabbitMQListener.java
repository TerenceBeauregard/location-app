package com.rental.notification.listener;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.rental.notification.dto.BookingEvent;
import com.rental.notification.dto.ListingEvent;
import com.rental.notification.entity.NotificationLog;
import com.rental.notification.repository.NotificationLogRepository;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class RabbitMQListener {

    private static final Logger log = LoggerFactory.getLogger(RabbitMQListener.class);

    private final NotificationLogRepository notificationLogRepository;
    private final ObjectMapper objectMapper;

    @RabbitListener(queues = "booking.confirmed")
    public void receiveBookingEvent(BookingEvent event) {
        log.info("Received booking event: bookingId={}, userId={}, status={}",
                event.getBookingId(), event.getUserId(), event.getStatus());
        try {
            String payload = objectMapper.writeValueAsString(event);
            notificationLogRepository.save(
                    NotificationLog.builder()
                            .eventType("BOOKING_CONFIRMED")
                            .payload(payload)
                            .build()
            );
            log.info("Booking notification logged successfully for bookingId={}", event.getBookingId());
        } catch (Exception e) {
            log.error("Failed to process booking event: {}", e.getMessage(), e);
        }
    }

    @RabbitListener(queues = "listing.created")
    public void receiveListingEvent(ListingEvent event) {
        log.info("Received listing event: listingId={}, title={}, ownerId={}",
                event.getListingId(), event.getTitle(), event.getOwnerId());
        try {
            String payload = objectMapper.writeValueAsString(event);
            notificationLogRepository.save(
                    NotificationLog.builder()
                            .eventType("LISTING_CREATED")
                            .payload(payload)
                            .build()
            );
            log.info("Listing notification logged successfully for listingId={}", event.getListingId());
        } catch (Exception e) {
            log.error("Failed to process listing event: {}", e.getMessage(), e);
        }
    }
}
