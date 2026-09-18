package com.autocare.crm.controller;

import com.autocare.crm.dto.TaskDTO;
import com.autocare.crm.entity.Mechanic;
import com.autocare.crm.entity.Task;
import com.autocare.crm.entity.User;
import com.autocare.crm.service.TaskService;
import com.autocare.crm.repository.MechanicRepository;
import com.autocare.crm.repository.UserRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/admin/tasks")
public class AdminTaskController {

    @Autowired
    private TaskService taskService;

    @Autowired
    private UserRepository userRepo;

    @Autowired
    private MechanicRepository mechanicRepository;

    // ✅ Create new task (supports mechanicEmail or mechanicUserId)
    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping
    public ResponseEntity<?> createTask(@RequestBody TaskDTO taskDTO) {
        Task task = taskService.createTask(taskDTO);
        return ResponseEntity.ok(task);
    }

    // ✅ Assign mechanic by user_id (old method)
    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/{id}/assignMechanic/{mechanicId}")
    public ResponseEntity<?> assignMechanic(
            @PathVariable Long id,
            @PathVariable Long mechanicId) {

        Task updated = taskService.assignMechanic(id, mechanicId);
        return ResponseEntity.ok(updated);
    }

    // ✅ NEW: Assign mechanic by email (recommended for UI)
    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/{id}/assignByEmail")
    public ResponseEntity<?> assignByEmail(@PathVariable Long id, @RequestBody Map<String, String> body) {
        String mechanicEmail = body.get("mechanicEmail");
        Long mechId = mechanicRepository.findByEmail(mechanicEmail)
                .map(Mechanic::getId)
                .orElseThrow(() -> new RuntimeException("Mechanic not found: " + mechanicEmail));

        Task updated = taskService.assignMechanic(id, mechId);
        return ResponseEntity.ok(updated);
    }
}


