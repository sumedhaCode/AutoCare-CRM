package com.autocare.crm.repository;

import com.autocare.crm.entity.Mechanic;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;
import java.util.Optional;

public interface MechanicRepository extends MongoRepository<Mechanic, Long> {

    boolean existsByEmailAndAdminId(String email, Long adminId);

    List<Mechanic> findByAdminId(Long adminId);

    Optional<Mechanic> findByEmail(String email);
}
