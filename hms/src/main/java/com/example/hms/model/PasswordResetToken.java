
package com.example.hms.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Data
@NoArgsConstructor
public class PasswordResetToken {
    
    // OTPs should expire quickly for security (e.g., 5 minutes)
    private static final int EXPIRATION_MINUTES = 5; 

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String token; // Storing the 6-digit OTP as a String

    @OneToOne(targetEntity = User.class, fetch = FetchType.EAGER)
    @JoinColumn(nullable = false, name = "user_id")
    private User user;

    @Column(nullable = false)
    private LocalDateTime expiryDate;

    public PasswordResetToken(String token, User user) {
        this.token = token;
        this.user = user;
        // Sets expiration 5 minutes from now
        this.expiryDate = LocalDateTime.now().plusMinutes(EXPIRATION_MINUTES);
    }
}