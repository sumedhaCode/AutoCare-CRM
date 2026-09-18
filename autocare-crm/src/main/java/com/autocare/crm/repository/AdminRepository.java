package com.autocare.crm.repository;

import com.autocare.crm.entity.Admin;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface AdminRepository extends MongoRepository<Admin, Long> {

    List<Admin> findByRoleAndSuspendedFalse(String role);
}
