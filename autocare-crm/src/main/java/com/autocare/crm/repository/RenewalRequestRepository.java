package com.autocare.crm.repository;

import com.autocare.crm.entity.RenewalRequest;
import com.autocare.crm.entity.User;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface RenewalRequestRepository extends MongoRepository<RenewalRequest, Long> {

    boolean existsByAdminAndStatus(User admin, String status);

    List<RenewalRequest> findByStatus(String status);
}
