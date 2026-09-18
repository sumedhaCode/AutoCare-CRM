package com.autocare.crm.repository;

import com.autocare.crm.entity.ServiceEntity;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ServiceRepository extends MongoRepository<ServiceEntity, Long> {

    Optional<ServiceEntity> findByType(String type);

    boolean existsByType(String type);
}
