package com.autocare.crm.repository;

import com.autocare.crm.entity.Role;
import com.autocare.crm.entity.User;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;
import java.util.Optional;

public interface UserRepository extends MongoRepository<User, Long> {

    Optional<User> findByEmail(String email);

    Optional<User> findByGarageNameIgnoreCase(String garageName);

    List<User> findByRole(Role role);

    List<User> findByRoleAndAdminId(Role role, Long adminId);
}
