package com.autocare.crm.controller;

import com.autocare.crm.entity.Role;
import com.autocare.crm.entity.User;
import com.autocare.crm.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;

@RestController
@RequestMapping("/api/public/garages")
public class PublicGarageController {

    @Autowired
    private UserRepository userRepository;

    @GetMapping("/search")
    public List<Map<String, Object>> searchGarages(@RequestParam String q) {
        String query = q == null ? "" : q.trim().toLowerCase(Locale.ENGLISH);
        List<Map<String, Object>> results = new ArrayList<>();
        if (query.length() < 2) {
            return results;
        }

        for (User admin : userRepository.findByRole(Role.ROLE_ADMIN)) {
            if (admin.isSuspended()) {
                continue;
            }
            if (!"ACTIVE".equalsIgnoreCase(admin.getSubscriptionStatus())
                    && admin.getSubscriptionStatus() != null) {
                continue;
            }
            String name = admin.getGarageName() != null ? admin.getGarageName().toLowerCase(Locale.ENGLISH) : "";
            String address = admin.getGarageAddress() != null ? admin.getGarageAddress().toLowerCase(Locale.ENGLISH) : "";
            if (name.contains(query) || address.contains(query)) {
                Map<String, Object> row = new HashMap<>();
                row.put("adminId", admin.getUserId());
                row.put("garageName", admin.getGarageName());
                row.put("garageAddress", admin.getGarageAddress());
                results.add(row);
            }
        }
        return results;
    }
}
