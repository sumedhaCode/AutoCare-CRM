package com.autocare.crm.config;

import com.autocare.crm.entity.*;
import com.autocare.crm.service.SequenceGeneratorService;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.mongodb.config.EnableMongoAuditing;
import org.springframework.data.mongodb.core.mapping.event.AbstractMongoEventListener;
import org.springframework.data.mongodb.core.mapping.event.BeforeConvertEvent;
import org.springframework.stereotype.Component;

@Configuration
@EnableMongoAuditing
public class MongoConfig {

    @Component
    public static class IdentifiableMongoListener extends AbstractMongoEventListener<Object> {

        private final SequenceGeneratorService sequences;

        public IdentifiableMongoListener(SequenceGeneratorService sequences) {
            this.sequences = sequences;
        }

        @Override
        public void onBeforeConvert(BeforeConvertEvent<Object> event) {
            Object source = event.getSource();
            if (source instanceof User user && user.getUserId() == null) {
                user.setUserId(sequences.generateSequence("users"));
            } else if (source instanceof Booking booking && booking.getId() == null) {
                booking.setId(sequences.generateSequence("bookings"));
            } else if (source instanceof Vehicle vehicle && vehicle.getId() == null) {
                vehicle.setId(sequences.generateSequence("vehicles"));
            } else if (source instanceof Mechanic mechanic && mechanic.getId() == null) {
                mechanic.setId(sequences.generateSequence("mechanics"));
            } else if (source instanceof Task task && task.getId() == null) {
                task.setId(sequences.generateSequence("tasks"));
            } else if (source instanceof ServiceEntity service && service.getId() == null) {
                service.setId(sequences.generateSequence("services"));
            } else if (source instanceof Subscription subscription && subscription.getId() == null) {
                subscription.setId(sequences.generateSequence("subscriptions"));
            } else if (source instanceof RenewalRequest request && request.getId() == null) {
                request.setId(sequences.generateSequence("renewal_requests"));
            } else if (source instanceof Notification notification && notification.getId() == null) {
                notification.setId(sequences.generateSequence("notifications"));
            } else if (source instanceof Admin admin && admin.getId() == null) {
                admin.setId(sequences.generateSequence("admins"));
            }
        }
    }
}
