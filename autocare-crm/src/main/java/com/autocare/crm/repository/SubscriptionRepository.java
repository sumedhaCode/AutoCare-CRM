package com.autocare.crm.repository;

import com.autocare.crm.entity.Subscription;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.time.LocalDateTime;
import java.util.List;

public interface SubscriptionRepository extends MongoRepository<Subscription, Long> {

    List<Subscription> findByUser_UserId(Long userId);

    long countByStatus(String status);

    List<Subscription> findByEndAtBetween(LocalDateTime start, LocalDateTime end);

    List<Subscription> findByEndAtBefore(LocalDateTime now);
}
