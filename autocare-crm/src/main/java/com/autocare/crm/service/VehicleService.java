package com.autocare.crm.service;

import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import com.autocare.crm.entity.Vehicle;
import com.autocare.crm.repository.VehicleRepository;

@Service
public class VehicleService {

    @Autowired
    private VehicleRepository vehicleRepository;

    public List<Vehicle> getAllVehicles() {
        return vehicleRepository.findAll();
    }

    // ⭐ NEW: return saved vehicle instead of null
    public Vehicle addVehicle(Vehicle vehicle) {
        return vehicleRepository.save(vehicle);
    }

    // ⭐ NEW: vehicles for a specific user (used by /api/vehicles/user/{userId})
    public List<Vehicle> getVehiclesByUser(Long userId) {
        return vehicleRepository.findByUser_UserId(userId);
    }
}


