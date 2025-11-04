package com.example.hms.security;

import com.example.hms.model.User;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import java.util.Collection;
import java.util.List;

public class UserDetailsImpl implements UserDetails {
    private Long id;
    private String username;
    private String password;
    private GrantedAuthority authority;

    private UserDetailsImpl(Long id, String username, String password, GrantedAuthority authority) {
        this.id = id;
        this.username = username;
        this.password = password;
        this.authority = authority;
    }

    /**
     * Factory method to construct UserDetailsImpl from the User entity.
     */
    public static UserDetailsImpl build(User user) {
        // The role enum name (e.g., "ROLE_DOCTOR") is converted to a Spring Security authority.
        SimpleGrantedAuthority authority = new SimpleGrantedAuthority(user.getRole().name());
        return new UserDetailsImpl(user.getId(), user.getUsername(), user.getPassword(), authority);
    }
    
    // --- Custom Getters (Used by AuthController and JWT Filter) ---
    public Long getId() { 
        return id; 
    }
    
    /**
     * Returns the role string (e.g., "ROLE_DOCTOR").
     */
    public String getRole() { 
        return authority.getAuthority(); 
    }

    // =========================================================
    // REQUIRED METHODS FROM UserDetails INTERFACE
    // =========================================================

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() { 
        return List.of(authority); 
    }
    
    @Override
    public String getPassword() { 
        return password; 
    }
    
    @Override
    public String getUsername() { 
        return username; 
    }
    
    /**
     * Standard implementation: account is always enabled/non-expired for simplicity.
     */
    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return true;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return true;
    }
}
