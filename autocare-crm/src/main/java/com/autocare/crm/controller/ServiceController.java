package com.autocare.crm.controller;

import com.autocare.crm.entity.ServiceEntity;
import com.autocare.crm.service.ServiceService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/services")
public class ServiceController {

    @Autowired
    private ServiceService serviceService;

    @GetMapping
    public List<ServiceEntity> getAllServices() {
        return serviceService.getAllServices();
    }

    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_USER')")

    @PostMapping
    public ResponseEntity<?> addService(@RequestBody ServiceEntity service) {
    	System.out.println("🚀 addService() called!");

    	try {
            ServiceEntity savedService = serviceService.addService(service);
            return ResponseEntity.ok(savedService);
        } catch (IllegalArgumentException e) {
            System.out.println("⚠️ Service creation failed: " + e.getMessage());
            return ResponseEntity.badRequest().body("Service already exists");
        }
    }
}

