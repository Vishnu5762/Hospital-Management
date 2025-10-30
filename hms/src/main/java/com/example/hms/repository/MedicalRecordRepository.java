// src/main/java/com/example/hms/repository/MedicalRecordRepository.java
package com.example.hms.repository;

import com.example.hms.model.MedicalRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;

public interface MedicalRecordRepository extends JpaRepository<MedicalRecord, Long> {

    /**
     * Finds all records created/authored by a specific Doctor.
     * Used by ROLE_DOCTOR for listing their authored records.
     */
    List<MedicalRecord> findByDoctorId(Long doctorId);
    
    /**
     * Finds all records belonging to a specific Patient.
     * Used by ROLE_PATIENT for listing their own history.
     */
    List<MedicalRecord> findByPatientId(Long patientId); 

    /**
     * Custom Query (JPQL): Finds all Medical Records where the record was authored by the 
     * specified doctor. 
     * NOTE: This method is functionally equivalent to findByDoctorId but is kept 
     * for clarity in the service layer's RBAC implementation.
     */
    @Query("SELECT mr FROM MedicalRecord mr WHERE mr.doctor.id = :doctorId")
    List<MedicalRecord> findRecordsByDoctorId(@Param("doctorId") Long doctorId);
    boolean existsByPatientIdAndDoctorId(Long patientId, Long doctorId);

	boolean existsByAppointmentId(Long id);
}