package com.example.hms.repository;

import com.example.hms.model.PasswordResetToken;
import com.example.hms.model.User;
import org.springframework.data.jpa.repository.JpaRepository; // <-- CRITICAL IMPORT

import java.util.Optional;

// FIX 1: Must extend JpaRepository to get Spring Data JPA functionality (like save, delete, findById)
// The second argument, Long, is the data type of the entity's primary key (PasswordResetToken.id)
public interface PasswordResetTokenRepository extends JpaRepository<PasswordResetToken, Long> {

    Optional<PasswordResetToken> findByToken(String token); 
    
    Optional<PasswordResetToken> findByUser(User user);
}