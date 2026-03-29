package com.rental.notification.listener;
import com.rental.notification.dto.BookingEvent;
import com.rental.notification.dto.ListingEvent;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;

@Component
public class RabbitMQListener {
    private static final Logger log = LoggerFactory.getLogger(RabbitMQListener.class);

    @RabbitListener(queues = "booking.confirmed")
    public void receiveBookingEvent(BookingEvent event) {
        log.info("Received booking event: {}", event);
    }

    @RabbitListener(queues = "listing.created")
    public void receiveListingEvent(ListingEvent event) {
        log.info("Received listing event: {}", event);
    }
}
