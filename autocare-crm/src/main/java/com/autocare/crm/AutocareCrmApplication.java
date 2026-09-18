package com.autocare.crm;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;
@EnableScheduling
@SpringBootApplication
public class AutocareCrmApplication {
    public static void main(String[] args) {
        SpringApplication.run(AutocareCrmApplication.class, args);
    }
}
