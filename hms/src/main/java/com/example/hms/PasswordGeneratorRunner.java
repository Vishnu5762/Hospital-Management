package com.example.hms;

import com.example.hms.enums.RoleName;
import com.example.hms.model.User;
import com.example.hms.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class PasswordGeneratorRunner implements CommandLineRunner {

 @Autowired
 private PasswordEncoder passwordEncoder;

 @Autowired
 private UserRepository userRepository;

 @Override
 public void run(String... args) throws Exception {
     // 1. GENERATE HASH FOR TESTING/CONSOLE OUTPUT
     String rawPassword = "password123";
     String encodedPassword = passwordEncoder.encode(rawPassword);
     
     System.out.println("---------------------------------------------------------------------------------------");
     System.out.println("RAW PASSWORD: " + rawPassword);
     System.out.println("ENCODED HASH (Copy This): " + encodedPassword);
     System.out.println("---------------------------------------------------------------------------------------");

     // 2. OPTIONAL: Automatically insert a test Admin user (good for a quick start)
     if (userRepository.findByUsername("admin").isEmpty()) {
         User adminUser = new User("admin", encodedPassword, RoleName.ROLE_ADMIN);
         userRepository.save(adminUser);
         System.out.println("Test Admin user 'admin' saved to database.");
     }
     
     // 3. OPTIONAL: Insert a test Doctor
     if (userRepository.findByUsername("dr.smith").isEmpty()) {
         User doctorUser = new User("dr.smith", encodedPassword, RoleName.ROLE_DOCTOR);
         userRepository.save(doctorUser);
         System.out.println("Test Doctor user 'dr.smith' saved to database.");
     }
     
     // 4. OPTIONAL: Insert a test Patient
     if (userRepository.findByUsername("jane.doe").isEmpty()) {
         User patientUser = new User("jane.doe", encodedPassword, RoleName.ROLE_PATIENT);
         userRepository.save(patientUser);
         System.out.println("Test Patient user 'jane.doe' saved to database.");
     }
 }
}
