package com.autocare.crm.repository;

import com.autocare.crm.entity.Booking;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface BookingRepository extends MongoRepository<Booking, Long> {

    List<Booking> findByUser_UserId(Long userId);

    List<Booking> findByUser_UserIdAndStatus(Long userId, String status);

    List<Booking> findByAdminId(Long adminId);

    Page<Booking> findByUser_UserId(Long userId, Pageable pageable);

    Page<Booking> findByUser_UserIdAndStatus(Long userId, String status, Pageable pageable);

    List<Booking> findByStatus(String status);

    Page<Booking> findByStatus(String status, Pageable pageable);

    long countByStatus(String status);

    long countByAdminId(Long adminId);

    long countByAdminIdAndStatus(Long adminId, String status);

    List<Booking> findByBookingDateBetween(LocalDateTime start, LocalDateTime end);

    List<Booking> findByUser_UserIdAndBookingDateAfter(Long userId, LocalDateTime dateTime);
}
