package com.autocare.crm.repository;

import com.autocare.crm.entity.Booking;
import com.autocare.crm.entity.Task;
import com.autocare.crm.enums.TaskStatus;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;
import java.util.Optional;

public interface TaskRepository extends MongoRepository<Task, Long> {

    List<Task> findByMechanicId(Long mechanicId);

    List<Task> findByBooking(Booking booking);

    Optional<Task> findFirstByBookingOrderByIdDesc(Booking booking);

    long countByMechanicIdAndStatus(Long mechanicId, TaskStatus status);
}
