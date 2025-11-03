package com.example.hms.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDate;
import java.util.List;

@Entity
@Data
@NoArgsConstructor
public class Patient {

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
    
    private LocalDate dateOfBirth;
    private String address;
    
    // MODIFIED: Changed from phoneNumber to 'phone' for consistency with Doctor model
    private String phone; 
    
    // --- Relationships ---
    // Inverse side of the One-to-Many relationship with Appointment
    @OneToMany(mappedBy = "patient", cascade = CascadeType.ALL)
    private List<Appointment> appointments;
    
    // NEW: Link to medical records belonging to this patient
    @OneToMany(mappedBy = "patient", cascade = CascadeType.ALL)
    private List<MedicalRecord> records; 
}