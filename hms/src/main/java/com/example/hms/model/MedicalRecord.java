
package com.example.hms.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Data
@NoArgsConstructor
public class MedicalRecord {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private LocalDateTime recordedAt = LocalDateTime.now();
    
    @Column(columnDefinition = "TEXT")
    private String consultationNotes;
    
    @Column(nullable = false)
    private String diagnosis;
    
    // --- Relationships ---
    
    /**
     * The Doctor who created/authored this specific record.
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "doctor_id", nullable = false)
    private Doctor doctor;

    /**
     * The Patient whose record this is.
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "patient_id", nullable = false)
    private Patient patient;
    
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "appointment_id", unique = true) // Ensures one record per appointment
    private Appointment appointment;
}