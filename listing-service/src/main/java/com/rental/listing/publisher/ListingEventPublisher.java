package com.rental.listing.publisher;

import com.rental.listing.config.RabbitMQConfig;
import com.rental.listing.event.ListingEvent;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class ListingEventPublisher {

    private static final Logger log = LoggerFactory.getLogger(ListingEventPublisher.class);

    private final RabbitTemplate rabbitTemplate;

    public void publishListingCreated(String listingId, String title, String ownerId) {
        ListingEvent event = new ListingEvent();
        event.setListingId(listingId);
        event.setTitle(title);
        event.setOwnerId(ownerId);

        rabbitTemplate.convertAndSend(
                RabbitMQConfig.LISTING_EXCHANGE,
                RabbitMQConfig.LISTING_ROUTING_KEY,
                event
        );
        log.info("Published listing.created event for listingId={}", listingId);
    }
}
