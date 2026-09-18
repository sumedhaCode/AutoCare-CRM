package com.autocare.crm.service;

import com.autocare.crm.entity.ServiceEntity;
import com.autocare.crm.repository.ServiceRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ServiceService {

    @Autowired
    private ServiceRepository serviceRepository;

    public ServiceEntity addService(ServiceEntity service) {
        // 🔄 Corrected: Check for existence by the 'type' field instead of 'name'.
        if (serviceRepository.existsByType(service.getType())) {
            throw new IllegalArgumentException("Service with this type already exists.");
        }

        return serviceRepository.save(service);
    }

    public List<ServiceEntity> getAllServices() {
        return serviceRepository.findAll();
    }
}




