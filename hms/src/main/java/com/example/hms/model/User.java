package com.example.hms.model;

import com.example.hms.enums.RoleName;
import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "users")
@Data // Lombok: Generates getters, setters, etc.
@NoArgsConstructor // Lombok: Generates no-args constructor
public class User {
 
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // CRITICAL: Username must be unique for login
    @Column(unique = true, nullable = false)
    private String username; 

    // Stores the BCrypt hashed password
    @Column(nullable = false)
    private String password; 
    
    // Stores the user's role (ROLE_DOCTOR, ROLE_PATIENT, ROLE_ADMIN)
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private RoleName role; 
    
    // Constructor used primarily during registration
    public User(String username, String password, RoleName role) {
        this.username = username;
        this.password = password;
        this.role = role;
    }
}