package com.example.hms.controller;

import com.example.hms.dto.RegisterRequest;
import com.example.hms.enums.RoleName;
import com.example.hms.dto.JwtResponse;
import com.example.hms.dto.LoginRequest;
import com.example.hms.security.UserDetailsImpl;
import com.example.hms.security.JwtUtils;
import com.example.hms.service.EmailService;
import com.example.hms.service.UserService; 
import com.example.hms.utils.OtpGenerator; // Util to generate OTP
import com.example.hms.repository.UserRepository; 
import com.example.hms.repository.PasswordResetTokenRepository; // <-- NEW: Token Repository
import com.example.hms.repository.DoctorRepository; // <-- NEW: Doctor Repository
import com.example.hms.repository.PatientRepository; // <-- NEW: Patient Repository
import com.example.hms.model.Doctor; // To access Doctor::getPhone
import com.example.hms.model.Patient; // To access Patient::getPhone
import com.example.hms.model.PasswordResetToken;
import com.example.hms.model.User; 

import jakarta.persistence.EntityNotFoundException;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder; // Required for password reset method
import org.springframework.web.bind.annotation.*;
import java.time.LocalDateTime; // Required for token expiration check
import java.util.Optional; 
import java.util.UUID; // Required for generating UUID token (if used, though we use OTP)

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired private AuthenticationManager authenticationManager;
    @Autowired private JwtUtils jwtUtils;
    @Autowired private UserRepository userRepository;
    @Autowired private UserService userService; 
    @Autowired private PasswordEncoder passwordEncoder; // Required for password reset update
    
    // --- NEW REQUIRED REPOSITORIES FOR OTP FLOW ---
    @Autowired private PasswordResetTokenRepository tokenRepository;
    @Autowired private DoctorRepository doctorRepository;
    @Autowired private PatientRepository patientRepository;
    
    // ----------------------------------------------------------------------
    // 1. REGISTRATION ENDPOINT
    // ----------------------------------------------------------------------
    @PostMapping("/register")
    public ResponseEntity<?> registerUser(@Valid @RequestBody RegisterRequest signUpRequest) {
        if (userRepository.existsByUsername(signUpRequest.getUsername())) {
            return ResponseEntity.badRequest().body("Error: Username is already taken!");
        }

        try {
            userService.registerNewUser(signUpRequest);
            return ResponseEntity.ok("User registered successfully as " + signUpRequest.getRole());
        } catch (Exception e) {
            System.err.println("Registration error during profile creation: " + e.getMessage());
            return ResponseEntity.internalServerError().body("Registration failed due to server error.");
        }
    }
    
    // ----------------------------------------------------------------------
    // 2. LOGIN ENDPOINT
    // ----------------------------------------------------------------------
    @PostMapping("/login")
    public ResponseEntity<?> authenticateUser(@Valid @RequestBody LoginRequest loginRequest) {

        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(loginRequest.getUsername(), loginRequest.getPassword()));

        SecurityContextHolder.getContext().setAuthentication(authentication);
        String jwt = jwtUtils.generateJwtToken(authentication);

        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        String roleString = userDetails.getAuthorities().stream().findFirst().get().getAuthority();
        RoleName roleEnum = RoleName.valueOf(roleString); // Convert the String "ROLE_DOCTOR" to the ENUM object
        String fullName = userService.getFullNameByUserId(userDetails.getId(), roleEnum);
        System.out.println(fullName);
        return ResponseEntity.ok(new JwtResponse(
                jwt,
                userDetails.getId(),
                userDetails.getUsername(),
                roleString,
                fullName
        ));
    }
    
    // ----------------------------------------------------------------------
    // 3. FORGOT PASSWORD: REQUEST OTP ENDPOINT
    // ----------------------------------------------------------------------
    @Autowired private EmailService emailService; // <-- NEW SERVICE INJECTION

    @PostMapping("/password/request-otp")
    public ResponseEntity<?> requestPasswordOtp(@RequestParam String username) {
        User user = userRepository.findByUsername(username)
            .orElseThrow(() -> new EntityNotFoundException("User not found."));
        tokenRepository.findByUser(user).ifPresent(tokenRepository::delete);
        String otp = OtpGenerator.generateOtp();
        PasswordResetToken resetToken = new PasswordResetToken(otp, user);
        tokenRepository.save(resetToken);
        
        // CRITICAL: Use username as email for simulation
        String userEmail = username; 
        
        // Call the Email service
        emailService.sendOtp(userEmail, otp); 

        return ResponseEntity.ok("OTP sent to email address (check console/Mailtrap).");
    }
    // ----------------------------------------------------------------------
    // 4. FORGOT PASSWORD: RESET PASSWORD ENDPOINT
    // ----------------------------------------------------------------------
    @PostMapping("/password/reset")
    public ResponseEntity<?> resetPassword(
        @RequestParam String username, 
        @RequestParam String otp, 
        @RequestParam String newPassword) {
        
        User user = userRepository.findByUsername(username)
            .orElseThrow(() -> new EntityNotFoundException("User not found."));

        // 1. Find token by matching user and OTP
        PasswordResetToken resetToken = tokenRepository.findByToken(otp)
            .filter(t -> t.getUser().getId().equals(user.getId()))
            .orElseThrow(() -> new IllegalArgumentException("Invalid OTP or username."));

        // 2. Check expiration
        if (resetToken.getExpiryDate().isBefore(LocalDateTime.now())) {
            tokenRepository.delete(resetToken);
            throw new IllegalArgumentException("OTP expired. Please request a new one.");
        }

        // 3. Update password
        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);

        // 4. Invalidate/Delete token
        tokenRepository.delete(resetToken);

        return ResponseEntity.ok("Password reset successfully.");
    }
}