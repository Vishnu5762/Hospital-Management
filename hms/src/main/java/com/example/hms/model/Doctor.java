package com.example.hms.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;

@Entity
@Data
@NoArgsConstructor
public class Doctor {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    // CRITICAL: One-to-One link to the authentication account
    @OneToOne
    @JoinColumn(name = "user_id", referencedColumnName = "id", nullable = false, unique = true)
    private User user; 

    // --- Profile Details (For Display and Contact) ---
    @Column(nullable = false)
    private String name; // Full Name for display
    
    private String specialization;
    
    // Corresponds to mobileNumber in the DTO
    private String phone; 
    
    // --- Relationships ---
    // Inverse side of the One-to-Many relationship with Appointment
    @OneToMany(mappedBy = "doctor", cascade = CascadeType.ALL)
    private List<Appointment> appointments;
    
    // Optional: Link to medical records authored by this doctor
    @OneToMany(mappedBy = "doctor", cascade = CascadeType.ALL)
    private List<MedicalRecord> writtenRecords; 
}