package com.autocare.crm.repository;

import com.autocare.crm.entity.Notification;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface NotificationRepository extends MongoRepository<Notification, Long> {

    long countByDelivered(boolean delivered);
}
