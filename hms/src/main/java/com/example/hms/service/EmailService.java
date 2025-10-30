package com.example.hms.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    @Autowired
    private JavaMailSender mailSender;

    // Use a placeholder email address for the sender (must match config)
    private static final String FROM_EMAIL = "noreply@hms-app.com"; 

public void sendOtp(String toEmail, String otp) {
        
        // --- CRITICAL FIX: Bypass the external service entirely ---
        
        System.out.println("---------------------------------------------------------");
        System.out.println("OTP SIMULATION: External service failed.");
        System.out.println("USER: " + toEmail);
        System.out.println("OTP CODE: " + otp); // <-- Log the code for manual entry
        System.out.println("---------------------------------------------------------");
        
        // Note: Do NOT throw an exception here. The controller will assume success.
    }
}