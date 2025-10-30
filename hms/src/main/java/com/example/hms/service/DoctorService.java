
package com.example.hms.service;

import com.example.hms.dto.DoctorListDto;
import com.example.hms.model.Doctor;
import com.example.hms.repository.DoctorRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class DoctorService {

    @Autowired
    private DoctorRepository doctorRepository;

    private DoctorListDto mapToDto(Doctor doctor) {
        DoctorListDto dto = new DoctorListDto();
        dto.setId(doctor.getId());
        dto.setName(doctor.getName());
        dto.setSpecialization(doctor.getSpecialization());
        return dto;
    }

    /**
     * Retrieves a list of all doctors for public consumption (e.g., booking form).
     */
    public List<DoctorListDto> getAllDoctors() {
        return doctorRepository.findAll().stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }
}