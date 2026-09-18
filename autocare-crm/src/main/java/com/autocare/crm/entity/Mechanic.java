package com.autocare.crm.entity;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.CompoundIndex;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "mechanics")
@CompoundIndex(name = "email_admin_idx", def = "{'email': 1, 'adminId': 1}", unique = true)
public class Mechanic {

    @Id
    private Long id;

    private String name;

    private String email;

    private Long adminId;

    public Mechanic() {}

    public Mechanic(String name, String email) {
        this.name = name;
        this.email = email;
    }

    public Long getAdminId() {
        return adminId;
    }

    public void setAdminId(Long adminId) {
        this.adminId = adminId;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }
}
