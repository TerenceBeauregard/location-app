package com.rental.notification.config;

import org.springframework.amqp.core.*;
import org.springframework.amqp.rabbit.connection.ConnectionFactory;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.amqp.support.converter.Jackson2JsonMessageConverter;
import org.springframework.amqp.support.converter.MessageConverter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class RabbitMQConfig {
    public static final String BOOKING_CONFIRMED_QUEUE = "booking.confirmed";
    public static final String LISTING_CREATED_QUEUE   = "listing.created";

    public static final String BOOKING_EXCHANGE = "booking.exchange";
    public static final String LISTING_EXCHANGE  = "listing.exchange";

    public static final String BOOKING_ROUTING_KEY = "booking.confirmed";
    public static final String LISTING_ROUTING_KEY  = "listing.created";

    @Bean
    public Queue bookingConfirmedQueue() {
        return QueueBuilder.durable(BOOKING_CONFIRMED_QUEUE).build();
    }

    @Bean
    public Queue listingCreatedQueue() {
        return QueueBuilder.durable(LISTING_CREATED_QUEUE).build();
    }

    @Bean
    public TopicExchange bookingExchange() {
        return new TopicExchange(BOOKING_EXCHANGE);
    }

    @Bean
    public TopicExchange listingExchange() {
        return new TopicExchange(LISTING_EXCHANGE);
    }

    @Bean
    public Binding bookingBinding(Queue bookingConfirmedQueue, TopicExchange bookingExchange) {
        return BindingBuilder
                .bind(bookingConfirmedQueue)
                .to(bookingExchange)
                .with(BOOKING_ROUTING_KEY);
    }

    @Bean
    public Binding listingBinding(Queue listingCreatedQueue, TopicExchange listingExchange) {
        return BindingBuilder
                .bind(listingCreatedQueue)
                .to(listingExchange)
                .with(LISTING_ROUTING_KEY);
    }

    @Bean
    public MessageConverter jsonMessageConverter() {
        return new Jackson2JsonMessageConverter();
    }

    @Bean
    public RabbitTemplate rabbitTemplate(ConnectionFactory connectionFactory) {
        RabbitTemplate template = new RabbitTemplate(connectionFactory);
        template.setMessageConverter(jsonMessageConverter());
        return template;
    }
}
