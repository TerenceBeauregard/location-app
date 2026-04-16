package com.rental.booking.publisher;

import com.rental.booking.config.RabbitMQConfig;
import com.rental.booking.event.BookingEvent;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class BookingEventPublisher {

    private static final Logger log = LoggerFactory.getLogger(BookingEventPublisher.class);

    private final RabbitTemplate rabbitTemplate;

    public void publishBookingConfirmed(String bookingId, String listingId, String tenantId) {
        BookingEvent event = new BookingEvent();
        event.setBookingId(bookingId);
        event.setListingId(listingId);
        event.setUserId(tenantId);
        event.setStatus("CONFIRMED");

        rabbitTemplate.convertAndSend(
                RabbitMQConfig.BOOKING_EXCHANGE,
                RabbitMQConfig.BOOKING_ROUTING_KEY,
                event
        );
        log.info("Published booking.confirmed event for bookingId={}", bookingId);
    }
}
